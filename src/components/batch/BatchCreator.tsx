"use client";

import { useEffect, useState, useRef } from "react";
import { useMemeStore } from "@/lib/store";
import { useBatchStore, type BatchItem } from "@/lib/batch-store";
import { renderScene, loadImage } from "@/lib/canvas-render";
import { exportMeme, exportBatchZip, downloadBlob, slugify, type ExportFormat } from "@/lib/export-utils";
import { trackBatchExport } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Package, Plus, Trash2, Download, Wand2, RefreshCw, ArrowLeft, Loader2 } from "lucide-react";

export default function BatchCreator() {
  const setView = useMemeStore((s) => s.setView);
  const items = useBatchStore((s) => s.items);
  const addCaption = useBatchStore((s) => s.addCaption);
  const updateCaption = useBatchStore((s) => s.updateCaption);
  const removeCaption = useBatchStore((s) => s.removeCaption);
  const clearAll = useBatchStore((s) => s.clearAll);
  const importCaptions = useBatchStore((s) => s.importCaptions);
  const addFromCurrent = useBatchStore((s) => s.addFromCurrent);

  const [bulkText, setBulkText] = useState("");
  const [format, setFormat] = useState<ExportFormat>("png");
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const captureCurrent = () => {
    addFromCurrent();
    toast.success("Captured current meme as base for batch");
  };

  const handleImport = () => {
    if (!bulkText.trim()) {
      toast.error("Paste some captions first");
      return;
    }
    importCaptions(bulkText);
    toast.success("Captions imported");
  };

  const handleExportOne = async (item: BatchItem) => {
    try {
      const blob = await exportMeme(item.width, item.height, item.background, item.layers, {
        format, quality: 0.92, scale: 1,
      });
      downloadBlob(blob, `${slugify(item.caption)}.${format === "jpeg" ? "jpg" : format}`);
      toast.success("Downloaded");
    } catch { toast.error("Export failed"); }
  };

  const handleExportZip = async () => {
    if (items.length === 0) { toast.error("Nothing to export"); return; }
    setExporting(true);
    setProgress(0);
    try {
      const zipItems = items.map((it, i) => ({
        name: `${String(i + 1).padStart(2, "0")}-${slugify(it.caption)}`,
        width: it.width,
        height: it.height,
        background: it.background,
        layers: it.layers,
      }));
      const blob = await exportBatchZip(zipItems, { format, quality: 0.92, scale: 1 }, (done, total) => setProgress(done / total));
      downloadBlob(blob, `memeforge-batch-${Date.now()}.zip`);
      trackBatchExport(items.length);
      toast.success(`Exported ${items.length} memes as ZIP`);
    } catch (e) {
      toast.error("ZIP export failed");
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <Button variant="ghost" size="sm" className="gap-1.5 mb-2 -ml-2" onClick={() => setView("editor")}>
            <ArrowLeft className="w-4 h-4" /> Back to editor
          </Button>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-primary" /> Batch meme creator
          </h1>
          <p className="text-muted-foreground mt-1">
            One image + many captions = many memes. Paste a list of captions, preview them, then download as a ZIP.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="pt-5 space-y-3">
              <div>
                <div className="text-sm font-semibold mb-1">1. Capture current meme as base</div>
                <p className="text-xs text-muted-foreground mb-2">
                  Use whatever you have on the editor right now as the base. The first text layer will be replaced with each caption.
                </p>
                <Button className="w-full gap-2" onClick={captureCurrent}>
                  <Wand2 className="w-4 h-4" /> Capture from editor
                </Button>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">2. Paste your captions</div>
                <p className="text-xs text-muted-foreground mb-2">
                  One caption per line. Each line becomes its own meme variation.
                </p>
                <Textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`POV: It's Monday\nWhen the deploy fails\nMe trying to be productive\nThat moment the build passes\nNot me again`}
                  rows={6}
                  className="resize-none font-mono text-sm"
                />
                <Button variant="outline" className="w-full mt-2 gap-2" onClick={handleImport}>
                  <RefreshCw className="w-4 h-4" /> Import captions
                </Button>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">3. Add or tweak individual captions</div>
                <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => addCaption("New caption")}>
                  <Plus className="w-4 h-4" /> Add caption
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 space-y-3">
              <div className="text-sm font-semibold">Export options</div>
              <div className="flex gap-1.5">
                {(["png", "jpeg", "webp"] as ExportFormat[]).map((f) => (
                  <Button key={f} variant={format === f ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setFormat(f)}>
                    {f.toUpperCase()}
                  </Button>
                ))}
              </div>
              <Button className="w-full gap-2" disabled={exporting || items.length === 0} onClick={handleExportZip}>
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {exporting ? `Exporting… ${Math.round(progress * 100)}%` : `Download ${items.length} as ZIP`}
              </Button>
              {items.length > 0 && (
                <Button variant="outline" size="sm" className="w-full gap-2 text-muted-foreground" onClick={() => { if (confirm("Clear all variations?")) clearAll(); }}>
                  <Trash2 className="w-4 h-4" /> Clear all
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="text-sm font-semibold mb-3">Previews ({items.length})</div>
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No variations yet. Capture a meme from the editor and import captions to get started.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto scrollbar-thin pr-1">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <BatchPreview item={item} />
                  <CardContent className="pt-3 space-y-2">
                    <Input
                      value={item.caption}
                      onChange={(e) => updateCaption(item.id, e.target.value)}
                      className="text-sm"
                    />
                    <div className="flex gap-1.5">
                      <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => handleExportOne(item)}>
                        <Download className="w-3.5 h-3.5" /> Download
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground" onClick={() => removeCaption(item.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BatchPreview({ item }: { item: BatchItem }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      setLoading(true);
      // Wait for any image layers to load
      const imageLayers = item.layers.filter((l) => l.type === "image" && l.src) as Array<{ src: string }>;
      await Promise.all(imageLayers.map((l) => loadImage(l.src).catch(() => null)));
      await renderScene(canvas, item.width, item.height, item.background, item.layers, 240 / Math.max(item.width, item.height), true);
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [item]);

  return (
    <div className="aspect-square bg-muted flex items-center justify-center relative">
      <canvas ref={canvasRef} className="w-full h-full object-contain" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground bg-muted/50">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
    </div>
  );
}

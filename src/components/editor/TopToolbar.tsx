"use client";

import { useState } from "react";
import { useMemeStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Undo2,
  Redo2,
  Download,
  RotateCcw,
  Save,
  Settings2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Sparkles,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import {
  exportMeme,
  downloadBlob,
  runQualityChecks,
  type ExportFormat,
  type ExportOptions,
} from "@/lib/export-utils";
import { trackExportAttempt, trackExport, trackBatchExport } from "@/lib/analytics";
import { useBatchStore } from "@/lib/batch-store";

export default function TopToolbar() {
  const undo = useMemeStore((s) => s.undo);
  const redo = useMemeStore((s) => s.redo);
  const canUndo = useMemeStore((s) => s.historyIndex > 0);
  const canRedo = useMemeStore((s) => s.historyIndex < s.history.length - 1);
  const resetCanvas = useMemeStore((s) => s.resetCanvas);
  const saveSession = useMemeStore((s) => s.saveSession);
  const layers = useMemeStore((s) => s.layers);
  const background = useMemeStore((s) => s.background);
  const canvasWidth = useMemeStore((s) => s.canvasWidth);
  const canvasHeight = useMemeStore((s) => s.canvasHeight);
  const setView = useMemeStore((s) => s.setView);
  const batchItems = useBatchStore((s) => s.items);
  const addBatchFromCurrent = useBatchStore((s) => s.addFromCurrent);

  const [exporting, setExporting] = useState(false);
  const [showQuality, setShowQuality] = useState(false);

  const issues = runQualityChecks(canvasWidth, canvasHeight, background, layers);
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");

  const handleQuickExport = async (format: ExportFormat) => {
    setExporting(true);
    trackExportAttempt(format);
    try {
      const blob = await exportMeme(canvasWidth, canvasHeight, background, layers, {
        format,
        quality: 0.92,
        scale: 1,
      });
      downloadBlob(blob, `memeforge-${Date.now()}.${format === "jpeg" ? "jpg" : format}`);
      trackExport(format, canvasWidth, canvasHeight);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (e) {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="h-14 px-3 border-b border-border bg-card flex items-center gap-2">
      {/* Undo / Redo */}
      <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
        <Undo2 className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
        <Redo2 className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" className="gap-1.5 hidden sm:flex" onClick={() => { if (confirm("Reset the canvas? This clears all layers.")) resetCanvas(); }}>
        <RotateCcw className="w-4 h-4" /> Reset
      </Button>

      <div className="flex-1" />

      {/* Canvas info */}
      <Badge variant="secondary" className="hidden md:flex text-xs">
        {canvasWidth} × {canvasHeight}
      </Badge>
      <Badge variant="outline" className="hidden md:flex text-xs">
        {layers.length} layer{layers.length !== 1 ? "s" : ""}
      </Badge>

      {/* Quality check */}
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowQuality(true)}>
        <Sparkles className="w-4 h-4" />
        <span className="hidden sm:inline">Quality check</span>
        {(errors.length > 0 || warnings.length > 0) && (
          <span className={`ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1 text-[10px] rounded-full ${errors.length ? "bg-destructive text-destructive-foreground" : "bg-amber-500 text-white"}`}>
            {errors.length + warnings.length}
          </span>
        )}
      </Button>

      <Button variant="outline" size="sm" className="gap-1.5 hidden sm:flex" onClick={saveSession} title="Save editing session locally">
        <Save className="w-4 h-4" /> Save
      </Button>

      {/* Batch */}
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { addBatchFromCurrent(); setView("batch"); }}>
        <Package className="w-4 h-4" /> <span className="hidden sm:inline">Batch</span>
      </Button>

      {/* Export menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="gap-1.5" disabled={exporting}>
            <Download className="w-4 h-4" /> {exporting ? "Exporting…" : <span className="hidden sm:inline">Download</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Download meme</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleQuickExport("png")}>
            <span className="flex-1">PNG (lossless)</span>
            <span className="text-xs text-muted-foreground">.png</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleQuickExport("jpeg")}>
            <span className="flex-1">JPG (compressed)</span>
            <span className="text-xs text-muted-foreground">.jpg</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleQuickExport("webp")}>
            <span className="flex-1">WebP (modern)</span>
            <span className="text-xs text-muted-foreground">.webp</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setView("editor")} className="gap-2 text-muted-foreground">
            <Settings2 className="w-4 h-4" /> Custom dimensions…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Quality dialog */}
      <Dialog open={showQuality} onOpenChange={setShowQuality}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Quality check</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin">
            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat label="Errors" value={errors.length} icon={<XCircle className="w-4 h-4" />} tone="text-red-600" />
              <Stat label="Warnings" value={warnings.length} icon={<AlertTriangle className="w-4 h-4" />} tone="text-amber-600" />
              <Stat label="Tips" value={issues.filter(i => i.level === "info").length} icon={<Info className="w-4 h-4" />} tone="text-blue-600" />
            </div>
            {issues.length === 0 ? (
              <Alert>
                <CheckCircle2 className="w-4 h-4" />
                <AlertTitle>All clear</AlertTitle>
                <AlertDescription>No quality issues detected. Your meme is ready to share.</AlertDescription>
              </Alert>
            ) : (
              <Accordion type="multiple" className="w-full">
                {issues.map((issue, i) => (
                  <AccordionItem key={i} value={`i-${i}`}>
                    <AccordionTrigger className="text-sm hover:no-underline">
                      <div className="flex items-center gap-2 text-left">
                        {issue.level === "error" && <XCircle className="w-4 h-4 text-red-600 shrink-0" />}
                        {issue.level === "warning" && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                        {issue.level === "info" && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
                        <span>{issue.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground">{issue.description}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Resolution: {canvasWidth}×{canvasHeight}px · Aspect: {(canvasWidth / canvasHeight).toFixed(2)}:1 · Layers: {layers.length}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowQuality(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: string }) {
  return (
    <div className="rounded-md border p-2">
      <div className={`flex items-center justify-center ${tone}`}>{icon}</div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

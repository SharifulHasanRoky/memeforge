"use client";

import { useState } from "react";
import { useMemeStore } from "@/lib/store";
import { TEMPLATES, templateThumbnail } from "@/lib/templates";
import { TEMPLATE_CATEGORIES, PLATFORM_PRESETS, CAPTION_PRESETS } from "@/lib/presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { trackTemplateSelect, trackImageUpload, trackTextAdd } from "@/lib/analytics";
import { fileToDataURL, validateImageFile } from "@/lib/export-utils";
import { toast } from "sonner";
import {
  Image as ImageIcon,
  Type,
  LayoutTemplate,
  LayoutGrid,
  Square,
  Search,
  Upload,
  ClipboardPaste,
  Trash2,
  Plus,
} from "lucide-react";

const SWATCH_COLORS = ["#ffffff", "#000000", "#1a1a1a", "#0f172a", "#7c3aed", "#f97316", "#22d3ee", "#fde047", "#f87171", "#22c55e"];

export default function LeftSidebar() {
  const addTextLayer = useMemeStore((s) => s.addTextLayer);
  const addImageLayer = useMemeStore((s) => s.addImageLayer);
  const addShapeLayer = useMemeStore((s) => s.addShapeLayer);
  const loadTemplate = useMemeStore((s) => s.loadTemplate);
  const setView = useMemeStore((s) => s.setView);
  const setCanvasSize = useMemeStore((s) => s.setCanvasSize);
  const setBackground = useMemeStore((s) => s.setBackground);
  const canvasWidth = useMemeStore((s) => s.canvasWidth);
  const canvasHeight = useMemeStore((s) => s.canvasHeight);
  const background = useMemeStore((s) => s.background);

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<string>("");
  const [customW, setCustomW] = useState(canvasWidth);
  const [customH, setCustomH] = useState(canvasHeight);

  const filtered = TEMPLATES.filter((t) => {
    if (cat && t.category !== cat) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    const terms = q.split(/\s+/);
    const haystack = `${t.name} ${t.description} ${t.keywords.join(" ")}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    const v = validateImageFile(file);
    if (!v.ok) {
      toast.error(v.error || "Unsupported file");
      return;
    }
    try {
      const dataUrl = await fileToDataURL(file);
      const img = new Image();
      img.onload = () => {
        addImageLayer(dataUrl, img.naturalWidth, img.naturalHeight);
        trackImageUpload();
        toast.success("Image added");
      };
      img.onerror = () => toast.error("Could not load image");
      img.src = dataUrl;
    } catch {
      toast.error("Failed to read file");
    }
  };

  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const file = new File([blob], "pasted.png", { type });
            handleUpload(file);
            return;
          }
        }
      }
      toast.error("No image in clipboard");
    } catch {
      toast.error("Clipboard access not allowed by your browser");
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      <Tabs defaultValue="templates" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid grid-cols-5 w-full rounded-none border-b bg-card h-auto p-2">
          <TabsTrigger value="templates" className="text-xs gap-1 py-2"><LayoutTemplate className="w-3.5 h-3.5" />Tmpl</TabsTrigger>
          <TabsTrigger value="upload" className="text-xs gap-1 py-2"><Upload className="w-3.5 h-3.5" />Upload</TabsTrigger>
          <TabsTrigger value="text" className="text-xs gap-1 py-2"><Type className="w-3.5 h-3.5" />Text</TabsTrigger>
          <TabsTrigger value="layout" className="text-xs gap-1 py-2"><LayoutGrid className="w-3.5 h-3.5" />Size</TabsTrigger>
          <TabsTrigger value="bg" className="text-xs gap-1 py-2"><Square className="w-3.5 h-3.5" />BG</TabsTrigger>
        </TabsList>

        {/* Templates tab */}
        <TabsContent value="templates" className="flex-1 min-h-0 m-0 mt-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search templates"
                  className="pl-8"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setCat("")}
                  className={`px-2 py-1 text-xs rounded-md border transition ${cat === "" ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}`}
                >All</button>
                {TEMPLATE_CATEGORIES.slice(0, 10).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCat(c.id)}
                    className={`px-2 py-1 text-xs rounded-md border transition ${cat === c.id ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}`}
                  >{c.name}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {filtered.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      loadTemplate(t);
                      trackTemplateSelect(t.id);
                      toast.success(`Loaded template: ${t.name}`);
                    }}
                    className="group text-left rounded-lg border bg-background overflow-hidden hover:border-primary hover:shadow-md transition"
                  >
                    <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                      <img
                        src={templateThumbnail(t, 200)}
                        alt={`${t.name} template preview`}
                        className="w-full h-full object-contain group-hover:scale-105 transition"
                      />
                    </div>
                    <div className="p-2">
                      <div className="text-xs font-medium truncate">{t.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{t.panels} panel · {t.width}×{t.height}</div>
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-sm text-muted-foreground">
                    No templates match. Try another search.
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => setView("templates")}>
                Browse all templates →
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Upload tab */}
        <TabsContent value="upload" className="flex-1 min-h-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-3">
              <label className="block">
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary hover:bg-muted/50 transition cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm font-medium">Drop image or click to upload</div>
                  <div className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP — max 25 MB</div>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
                />
              </label>
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={handlePaste}>
                <ClipboardPaste className="w-4 h-4" /> Paste from clipboard
              </Button>
              <div className="text-xs text-muted-foreground leading-relaxed pt-2 border-t">
                <strong className="block mb-1 text-foreground">Privacy-first upload</strong>
                Images are processed in your browser. They never touch our server unless you explicitly export.
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Text tab */}
        <TabsContent value="text" className="flex-1 min-h-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-3">
              <Button
                className="w-full gap-2"
                onClick={() => {
                  addTextLayer({ text: "YOUR TEXT HERE" });
                  trackTextAdd();
                }}
              >
                <Plus className="w-4 h-4" /> Add text layer
              </Button>
              <div>
                <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Quick styles</div>
                <div className="grid grid-cols-1 gap-2">
                  <QuickStyleButton
                    label="Top + Bottom (Impact)"
                    onClick={() => {
                      addTextLayer({ text: "TOP TEXT", y: 40, height: 140, fontSize: 96, fontFamily: "Impact, Arial Black, sans-serif", uppercase: true, outlineWidth: 6 });
                      addTextLayer({ text: "BOTTOM TEXT", y: canvasHeight - 180, height: 140, fontSize: 96, fontFamily: "Impact, Arial Black, sans-serif", uppercase: true, outlineWidth: 6 });
                    }}
                  />
                  <QuickStyleButton
                    label="Modern caption (Inter)"
                    onClick={() => addTextLayer({ text: "Your caption", fontFamily: "Inter, Arial, sans-serif", fontSize: 56, fontWeight: 800, color: "#ffffff", outlineWidth: 0, backgroundColor: "#000000" })}
                  />
                  <QuickStyleButton
                    label="Italic quote (serif)"
                    onClick={() => addTextLayer({ text: "\"Your quote\"", fontFamily: "Georgia, serif", fontSize: 48, fontStyle: "italic", fontWeight: 700, color: "#ffffff", outlineWidth: 0 })}
                  />
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Caption presets</div>
                <div className="space-y-2">
                  {CAPTION_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addTextLayer({ text: p.structure, fontFamily: "Impact, Arial Black, sans-serif", fontSize: 56, outlineWidth: 4, uppercase: false, height: 220 })}
                      className="w-full text-left p-2 rounded-md border bg-background hover:border-primary hover:bg-muted/50 transition"
                    >
                      <div className="text-xs font-medium">{p.label}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{p.example}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Add shape</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => addShapeLayer({ shape: "rectangle", fill: "#1a1a1a", width: 400, height: 200, x: 340, y: 440 })}>Rectangle</Button>
                  <Button variant="outline" size="sm" onClick={() => addShapeLayer({ shape: "ellipse", fill: "#7c3aed", width: 300, height: 300, x: 390, y: 390 })}>Ellipse</Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Layout / size tab */}
        <TabsContent value="layout" className="flex-1 min-h-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-3">
              <div className="text-xs font-semibold uppercase text-muted-foreground">Platform presets</div>
              <div className="grid grid-cols-1 gap-1.5">
                {PLATFORM_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => useMemeStore.getState().applyPlatformPreset(p.id)}
                    className="flex items-center justify-between p-2 rounded-md border bg-background hover:border-primary hover:bg-muted/50 transition"
                  >
                    <div className="text-left">
                      <div className="text-sm font-medium">{p.label}</div>
                      <div className="text-[10px] text-muted-foreground">{p.description}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{p.width}×{p.height}</div>
                  </button>
                ))}
              </div>
              <div className="pt-2 border-t space-y-2">
                <div className="text-xs font-semibold uppercase text-muted-foreground">Custom size</div>
                <div className="flex gap-2">
                  <Input type="number" min={64} max={4096} value={customW} onChange={(e) => setCustomW(parseInt(e.target.value) || 0)} placeholder="Width" />
                  <Input type="number" min={64} max={4096} value={customH} onChange={(e) => setCustomH(parseInt(e.target.value) || 0)} placeholder="Height" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    if (customW < 64 || customH < 64 || customW > 4096 || customH > 4096) {
                      toast.error("Dimensions must be between 64 and 4096");
                      return;
                    }
                    setCanvasSize(customW, customH, "custom");
                    toast.success(`Canvas resized to ${customW}×${customH}`);
                  }}
                >Apply custom size</Button>
              </div>
              <div className="pt-2 border-t">
                <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Multi-panel layouts</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => loadTemplate(TEMPLATES.find(t => t.id === "two-panel-horizontal")!)}>2-panel horizontal</Button>
                  <Button variant="outline" size="sm" onClick={() => loadTemplate(TEMPLATES.find(t => t.id === "reaction-split")!)}>2-panel vertical</Button>
                  <Button variant="outline" size="sm" onClick={() => loadTemplate(TEMPLATES.find(t => t.id === "three-panel")!)}>3-panel strip</Button>
                  <Button variant="outline" size="sm" onClick={() => loadTemplate(TEMPLATES.find(t => t.id === "four-panel-grid")!)}>4-panel grid</Button>
                  <Button variant="outline" size="sm" onClick={() => loadTemplate(TEMPLATES.find(t => t.id === "expectation-reality")!)}>Expectation/Reality</Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Background tab */}
        <TabsContent value="bg" className="flex-1 min-h-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-3">
              <div className="text-xs font-semibold uppercase text-muted-foreground">Background type</div>
              <div className="grid grid-cols-3 gap-2">
                {(["color", "gradient", "transparent"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setBackground({ type: t })}
                    className={`p-2 rounded-md border text-xs capitalize transition ${background.type === t ? "border-primary bg-primary/10" : "bg-background hover:bg-muted"}`}
                  >{t}</button>
                ))}
              </div>

              {background.type === "color" && (
                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Color</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={background.color}
                      onChange={(e) => setBackground({ color: e.target.value })}
                      className="w-10 h-10 rounded border cursor-pointer"
                    />
                    <Input value={background.color} onChange={(e) => setBackground({ color: e.target.value })} className="flex-1" />
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 mt-2">
                    {SWATCH_COLORS.map((c) => (
                      <button key={c} className="aspect-square rounded border" style={{ background: c }} onClick={() => setBackground({ color: c })} aria-label={`Set color ${c}`} />
                    ))}
                  </div>
                </div>
              )}

              {background.type === "gradient" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="color" value={background.gradientFrom} onChange={(e) => setBackground({ gradientFrom: e.target.value })} className="w-10 h-10 rounded border cursor-pointer" />
                    <span className="text-xs">From</span>
                    <Input value={background.gradientFrom} onChange={(e) => setBackground({ gradientFrom: e.target.value })} className="flex-1" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="color" value={background.gradientTo} onChange={(e) => setBackground({ gradientTo: e.target.value })} className="w-10 h-10 rounded border cursor-pointer" />
                    <span className="text-xs">To</span>
                    <Input value={background.gradientTo} onChange={(e) => setBackground({ gradientTo: e.target.value })} className="flex-1" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Angle: {background.gradientAngle}°</div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={background.gradientAngle}
                      onChange={(e) => setBackground({ gradientAngle: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { from: "#7c3aed", to: "#db2777", a: 135 },
                      { from: "#fde047", to: "#f97316", a: 180 },
                      { from: "#22d3ee", to: "#7c3aed", a: 90 },
                      { from: "#1e1b4b", to: "#0f172a", a: 180 },
                    ].map((g, i) => (
                      <button
                        key={i}
                        onClick={() => setBackground({ gradientFrom: g.from, gradientTo: g.to, gradientAngle: g.a })}
                        className="h-10 rounded border"
                        style={{ background: `linear-gradient(${g.a}deg, ${g.from}, ${g.to})` }}
                        aria-label={`Apply gradient preset ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {background.type === "transparent" && (
                <div className="text-xs text-muted-foreground p-2 rounded bg-muted/50">
                  The canvas will export with a transparent background (PNG only). JPG/WebP will render on white.
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function QuickStyleButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full p-2 rounded-md border bg-background hover:border-primary hover:bg-muted/50 transition text-sm text-left"
    >
      {label}
    </button>
  );
}

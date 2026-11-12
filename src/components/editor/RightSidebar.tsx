"use client";

import { useMemeStore } from "@/lib/store";
import { fitFontSize, contrastRatio } from "@/lib/canvas-render";
import type { TextLayer, ImageLayer, ShapeLayer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
} from "lucide-react";

const FONTS = [
  { label: "Impact (classic)", value: "Impact, Arial Black, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Inter (modern)", value: "Inter, Arial, sans-serif" },
  { label: "Georgia (serif)", value: "Georgia, serif" },
  { label: "Courier (mono)", value: "Courier New, monospace" },
  { label: "Comic Sans", value: "Comic Sans MS, cursive" },
  { label: "Caveat (handwritten)", value: "Caveat, Comic Sans MS, cursive" },
  { label: "Tahoma", value: "Tahoma, sans-serif" },
  { label: "Trebuchet MS", value: "Trebuchet MS, sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
];

const SWATCH = ["#ffffff", "#000000", "#1a1a1a", "#7c3aed", "#f97316", "#22d3ee", "#fde047", "#f87171", "#22c55e", "#ec4899"];

export default function RightSidebar({ onCaptionAssistant }: { onCaptionAssistant?: () => void }) {
  const layers = useMemeStore((s) => s.layers);
  const selectedLayerId = useMemeStore((s) => s.selectedLayerId);
  const updateLayer = useMemeStore((s) => s.updateLayer);
  const deleteLayer = useMemeStore((s) => s.deleteLayer);
  const duplicateLayer = useMemeStore((s) => s.duplicateLayer);
  const bringForward = useMemeStore((s) => s.bringForward);
  const sendBackward = useMemeStore((s) => s.sendBackward);
  const bringToFront = useMemeStore((s) => s.bringToFront);
  const sendToBack = useMemeStore((s) => s.sendToBack);
  const canvasWidth = useMemeStore((s) => s.canvasWidth);
  const canvasHeight = useMemeStore((s) => s.canvasHeight);
  const setView = useMemeStore((s) => s.setView);

  const layer = layers.find((l) => l.id === selectedLayerId) || null;

  if (!layer) {
    return (
      <div className="h-full flex flex-col bg-card border-l border-border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Properties</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 text-muted-foreground">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-sm">Select an element on the canvas to edit its properties, or add a new text or image layer from the left.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setView("templates")}>Browse templates</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="p-3 border-b flex items-center justify-between gap-2">
        <h3 className="font-semibold text-sm capitalize">{layer.type} properties</h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateLayer(layer.id, { visible: !layer.visible })} title={layer.visible ? "Hide" : "Show"}>
            {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateLayer(layer.id, { locked: !layer.locked })} title={layer.locked ? "Unlock" : "Lock"}>
            {layer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicateLayer(layer.id)} title="Duplicate">
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive hover:text-destructive-foreground" onClick={() => deleteLayer(layer.id)} title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Common: position + size + rotation */}
          <Section title="Position & size">
            <div className="grid grid-cols-2 gap-2">
              <LabeledNumber label="X" value={Math.round(layer.x)} onChange={(v) => updateLayer(layer.id, { x: v })} />
              <LabeledNumber label="Y" value={Math.round(layer.y)} onChange={(v) => updateLayer(layer.id, { y: v })} />
              <LabeledNumber label="Width" value={Math.round(layer.width)} onChange={(v) => updateLayer(layer.id, { width: Math.max(20, v) })} />
              <LabeledNumber label="Height" value={Math.round(layer.height)} onChange={(v) => updateLayer(layer.id, { height: Math.max(20, v) })} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Rotation: {Math.round(layer.rotation)}°</div>
              <Slider value={[layer.rotation]} min={-180} max={180} step={1} onValueChange={(v) => updateLayer(layer.id, { rotation: v[0] })} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Opacity: {Math.round(layer.opacity * 100)}%</div>
              <Slider value={[layer.opacity * 100]} min={0} max={100} step={1} onValueChange={(v) => updateLayer(layer.id, { opacity: v[0] / 100 })} />
            </div>
          </Section>

          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => bringToFront(layer.id)}><ChevronsUp className="w-3.5 h-3.5" /> Front</Button>
            <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => bringForward(layer.id)}><ArrowUp className="w-3.5 h-3.5" /> Fwd</Button>
            <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => sendBackward(layer.id)}><ArrowDown className="w-3.5 h-3.5" /> Back</Button>
            <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => sendToBack(layer.id)}><ChevronsDown className="w-3.5 h-3.5" /> Bottom</Button>
          </div>

          <Separator />

          {layer.type === "text" && <TextProps layer={layer as TextLayer} onCaptionAssistant={onCaptionAssistant} />}
          {layer.type === "image" && <ImageProps layer={layer as ImageLayer} />}
          {layer.type === "shape" && <ShapeProps layer={layer as ShapeLayer} />}

          {/* Quick center buttons */}
          <Section title="Align on canvas">
            <div className="grid grid-cols-3 gap-1.5">
              <Button variant="outline" size="sm" onClick={() => updateLayer(layer.id, { x: 0, y: layer.y })} title="Align left">⟸</Button>
              <Button variant="outline" size="sm" onClick={() => updateLayer(layer.id, { x: (canvasWidth - layer.width) / 2, y: layer.y })} title="Center H">⟷</Button>
              <Button variant="outline" size="sm" onClick={() => updateLayer(layer.id, { x: canvasWidth - layer.width, y: layer.y })} title="Align right">⟹</Button>
              <Button variant="outline" size="sm" onClick={() => updateLayer(layer.id, { x: layer.x, y: 0 })} title="Align top">⟰</Button>
              <Button variant="outline" size="sm" onClick={() => updateLayer(layer.id, { x: layer.x, y: (canvasHeight - layer.height) / 2 })} title="Center V">⟺</Button>
              <Button variant="outline" size="sm" onClick={() => updateLayer(layer.id, { x: layer.x, y: canvasHeight - layer.height })} title="Align bottom">⟱</Button>
            </div>
          </Section>
        </div>
      </ScrollArea>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

function LabeledNumber({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground mb-0.5">{label}</div>
      <Input type="number" value={value} onChange={(e) => onChange(parseInt(e.target.value) || 0)} className="h-8 text-xs" />
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-9 h-9 rounded border cursor-pointer shrink-0" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-9 text-xs" />
      </div>
      <div className="flex flex-wrap gap-1">
        {SWATCH.map((c) => (
          <button key={c} className="w-5 h-5 rounded border" style={{ background: c }} onClick={() => onChange(c)} aria-label={`${label} ${c}`} />
        ))}
      </div>
    </div>
  );
}

function TextProps({ layer, onCaptionAssistant }: { layer: TextLayer; onCaptionAssistant?: () => void }) {
  const update = (patch: Partial<TextLayer>) => useMemeStore.getState().updateLayer(layer.id, patch);
  const bg = useMemeStore.getState().background;
  const bgHex = bg.type === "color" ? bg.color : bg.type === "gradient" ? "#888888" : "#ffffff";
  const contrast = contrastRatio(layer.color, bgHex).toFixed(1);

  const handleAutoFit = () => {
    const measureCanvas = document.createElement("canvas");
    const ctx = measureCanvas.getContext("2d")!;
    const newSize = fitFontSize(ctx, { ...layer }, layer.width - 8, layer.height - 8);
    update({ fontSize: newSize });
    toast.success(`Auto-fit font size: ${newSize}px`);
  };

  return (
    <>
      <Section title="Text content">
        <Textarea
          value={layer.text}
          onChange={(e) => update({ text: e.target.value })}
          rows={3}
          className="text-sm resize-none"
          placeholder="Type your caption..."
        />
        {onCaptionAssistant && (
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={onCaptionAssistant}>
            <Sparkles className="w-3.5 h-3.5" /> Caption assistant
          </Button>
        )}
      </Section>

      <Section title="Typography">
        <select
          value={layer.fontFamily}
          onChange={(e) => update({ fontFamily: e.target.value })}
          className="w-full h-9 px-2 rounded-md border bg-background text-sm"
        >
          {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[10px] text-muted-foreground">Font size: {layer.fontSize}px</div>
            <Input type="number" min={8} max={400} value={layer.fontSize} onChange={(e) => update({ fontSize: parseInt(e.target.value) || 8 })} className="h-8 text-xs" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">Weight</div>
            <select value={layer.fontWeight} onChange={(e) => update({ fontWeight: parseInt(e.target.value) })} className="w-full h-8 px-1 rounded-md border bg-background text-xs">
              <option value={400}>Regular</option>
              <option value={600}>Semibold</option>
              <option value={700}>Bold</option>
              <option value={800}>Extra bold</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <Button variant={layer.fontStyle === "italic" ? "default" : "outline"} size="sm" onClick={() => update({ fontStyle: layer.fontStyle === "italic" ? "normal" : "italic" })}>Italic</Button>
          <Button variant={layer.uppercase ? "default" : "outline"} size="sm" onClick={() => update({ uppercase: !layer.uppercase })}>UPPERCASE</Button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <Button variant={layer.textAlign === "left" ? "default" : "outline"} size="sm" onClick={() => update({ textAlign: "left" })}><AlignLeft className="w-3.5 h-3.5" /></Button>
          <Button variant={layer.textAlign === "center" ? "default" : "outline"} size="sm" onClick={() => update({ textAlign: "center" })}><AlignCenter className="w-3.5 h-3.5" /></Button>
          <Button variant={layer.textAlign === "right" ? "default" : "outline"} size="sm" onClick={() => update({ textAlign: "right" })}><AlignRight className="w-3.5 h-3.5" /></Button>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={handleAutoFit}>
          <Sparkles className="w-3.5 h-3.5 mr-2" /> Auto-fit text to box
        </Button>
        <div>
          <div className="text-[10px] text-muted-foreground mb-1">Letter spacing: {layer.letterSpacing}px</div>
          <Slider value={[layer.letterSpacing]} min={-5} max={20} step={0.5} onValueChange={(v) => update({ letterSpacing: v[0] })} />
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground mb-1">Line height: {layer.lineHeight.toFixed(2)}</div>
          <Slider value={[layer.lineHeight * 100]} min={80} max={200} step={5} onValueChange={(v) => update({ lineHeight: v[0] / 100 })} />
        </div>
      </Section>

      <Section title="Color & contrast">
        <ColorRow label="Text color" value={layer.color} onChange={(c) => update({ color: c })} />
        <div className="text-[10px] text-muted-foreground">
          Contrast vs background: <strong className={parseFloat(contrast) >= 4.5 ? "text-green-600" : parseFloat(contrast) >= 3 ? "text-amber-600" : "text-red-600"}>{contrast}:1</strong>
          {parseFloat(contrast) < 4.5 && layer.outlineWidth === 0 && (
            <span className="block">Tip: add an outline or pick a brighter color for readability.</span>
          )}
        </div>
      </Section>

      <Section title="Outline">
        <ColorRow label="Outline color" value={layer.outlineColor} onChange={(c) => update({ outlineColor: c })} />
        <div>
          <div className="text-[10px] text-muted-foreground mb-1">Outline width: {layer.outlineWidth}px</div>
          <Slider value={[layer.outlineWidth]} min={0} max={20} step={0.5} onValueChange={(v) => update({ outlineWidth: v[0] })} />
        </div>
      </Section>

      <Section title="Background fill">
        <ColorRow label="Background" value={layer.backgroundColor === "transparent" ? "#ffffff" : layer.backgroundColor} onChange={(c) => update({ backgroundColor: c })} />
        <Button variant={layer.backgroundColor === "transparent" ? "default" : "outline"} size="sm" className="w-full" onClick={() => update({ backgroundColor: "transparent" })}>Remove background</Button>
      </Section>

      <Section title="Shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs">Enable shadow</span>
          <Switch checked={layer.shadow} onCheckedChange={(v) => update({ shadow: v })} />
        </div>
        {layer.shadow && (
          <>
            <ColorRow label="Shadow color" value={layer.shadowColor} onChange={(c) => update({ shadowColor: c })} />
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">Blur: {layer.shadowBlur}px</div>
              <Slider value={[layer.shadowBlur]} min={0} max={60} step={1} onValueChange={(v) => update({ shadowBlur: v[0] })} />
            </div>
          </>
        )}
      </Section>
    </>
  );
}

function ImageProps({ layer }: { layer: ImageLayer }) {
  const update = (patch: Partial<ImageLayer>) => useMemeStore.getState().updateLayer(layer.id, patch);
  return (
    <>
      <Section title="Image fit">
        <div className="grid grid-cols-3 gap-1.5">
          {(["cover", "contain", "fill"] as const).map((f) => (
            <Button key={f} variant={layer.objectFit === f ? "default" : "outline"} size="sm" onClick={() => update({ objectFit: f })}>{f}</Button>
          ))}
        </div>
      </Section>
      <Section title="Replace image">
        <label className="block">
          <Button variant="outline" size="sm" className="w-full">Upload new image</Button>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                const img = new Image();
                img.onload = () => update({ src: reader.result as string, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
                img.src = reader.result as string;
              };
              reader.readAsDataURL(file);
            }}
          />
        </label>
      </Section>
    </>
  );
}

function ShapeProps({ layer }: { layer: ShapeLayer }) {
  const update = (patch: Partial<ShapeLayer>) => useMemeStore.getState().updateLayer(layer.id, patch);
  return (
    <>
      <Section title="Fill & stroke">
        <ColorRow label="Fill" value={layer.fill} onChange={(c) => update({ fill: c })} />
        <ColorRow label="Stroke" value={layer.stroke} onChange={(c) => update({ stroke: c })} />
        <div>
          <div className="text-[10px] text-muted-foreground mb-1">Stroke width: {layer.strokeWidth}px</div>
          <Slider value={[layer.strokeWidth]} min={0} max={40} step={1} onValueChange={(v) => update({ strokeWidth: v[0] })} />
        </div>
      </Section>
    </>
  );
}

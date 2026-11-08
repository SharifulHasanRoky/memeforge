"use client";

import { useMemeStore } from "@/lib/store";
import { trackTemplateSelect, trackImageUpload, trackTextAdd } from "@/lib/analytics";
import { fileToDataURL, validateImageFile } from "@/lib/export-utils";
import { toast } from "sonner";
import { LayoutTemplate, ImageIcon, Type, Square, Sparkles } from "lucide-react";

export default function MobileToolbar({
  onOpenPanel,
  onCaptionAssistant,
}: {
  onOpenPanel: (p: "left" | "right") => void;
  onCaptionAssistant: () => void;
}) {
  const addTextLayer = useMemeStore((s) => s.addTextLayer);
  const addImageLayer = useMemeStore((s) => s.addImageLayer);
  const selectedLayerId = useMemeStore((s) => s.selectedLayerId);

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    const v = validateImageFile(file);
    if (!v.ok) { toast.error(v.error || "Unsupported file"); return; }
    try {
      const dataUrl = await fileToDataURL(file);
      const img = new Image();
      img.onload = () => {
        addImageLayer(dataUrl, img.naturalWidth, img.naturalHeight);
        trackImageUpload();
        toast.success("Image added");
      };
      img.src = dataUrl;
    } catch { toast.error("Failed to read file"); }
  };

  return (
    <div className="h-16 border-t border-border bg-card flex items-stretch">
      <button
        onClick={() => onOpenPanel("left")}
        className="flex-1 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
      >
        <LayoutTemplate className="w-5 h-5" />
        <span className="text-[10px]">Templates</span>
      </button>
      <label className="flex-1 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer">
        <ImageIcon className="w-5 h-5" />
        <span className="text-[10px]">Upload</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files?.[0])}
        />
      </label>
      <button
        onClick={() => { addTextLayer({ text: "YOUR TEXT" }); trackTextAdd(); }}
        className="flex-1 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
      >
        <Type className="w-5 h-5" />
        <span className="text-[10px]">Text</span>
      </button>
      <button
        onClick={onCaptionAssistant}
        className="flex-1 flex flex-col items-center justify-center gap-1 text-primary hover:bg-primary/10 transition"
      >
        <Sparkles className="w-5 h-5" />
        <span className="text-[10px]">AI Caption</span>
      </button>
      <button
        onClick={() => onOpenPanel("right")}
        disabled={!selectedLayerId}
        className="flex-1 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <Square className="w-5 h-5" />
        <span className="text-[10px]">Edit</span>
      </button>
    </div>
  );
}

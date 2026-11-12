"use client";

import { useEffect, useState, useCallback } from "react";
import { useMemeStore } from "@/lib/store";
import { useBatchStore } from "@/lib/batch-store";
import MemeCanvas from "./MemeCanvas";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import TopToolbar from "./TopToolbar";
import MobileToolbar from "./MobileToolbar";
import CaptionAssistant from "./CaptionAssistant";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Type, ImageIcon, LayoutTemplate, Square, Palette } from "lucide-react";

export default function MemeEditor() {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [activePanel, setActivePanel] = useState<"left" | "right" | null>(null);
  const [captionOpen, setCaptionOpen] = useState(false);
  const restoreSession = useMemeStore((s) => s.restoreSession);
  const saveSession = useMemeStore((s) => s.saveSession);
  const selectLayer = useMemeStore((s) => s.selectLayer);
  const layers = useMemeStore((s) => s.layers);
  const selectedLayerId = useMemeStore((s) => s.selectedLayerId);
  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null;

  // Restore session on mount
  useEffect(() => {
    const ok = restoreSession();
    if (ok) {
      // Auto-save session every 10s
      const id = setInterval(() => saveSession(), 10000);
      return () => clearInterval(id);
    }
  }, [restoreSession, saveSession]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      const s = useMemeStore.getState();
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); s.undo(); }
      else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); s.redo(); }
      else if (e.key === "Delete" || e.key === "Backspace") {
        if (s.selectedLayerId) { e.preventDefault(); s.deleteLayer(s.selectedLayerId); }
      } else if (e.key === "Escape") { s.selectLayer(null); }
      else if ((e.ctrlKey || e.metaKey) && e.key === "d" && s.selectedLayerId) {
        e.preventDefault();
        s.duplicateLayer(s.selectedLayerId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openCaption = useCallback(() => setCaptionOpen(true), []);

  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <TopToolbar />
        <div className="flex-1 min-h-0 relative">
          <MemeCanvas />
        </div>
        <MobileToolbar onOpenPanel={setActivePanel} onCaptionAssistant={openCaption} />
        <Sheet open={activePanel === "left"} onOpenChange={(v) => !v && setActivePanel(null)}>
          <SheetContent side="left" className="w-[85vw] sm:max-w-sm p-0">
            <SheetHeader className="p-3 border-b">
              <SheetTitle>Tools</SheetTitle>
            </SheetHeader>
            <div className="h-[calc(100vh-100px)]">
              <LeftSidebar />
            </div>
          </SheetContent>
        </Sheet>
        <Sheet open={activePanel === "right"} onOpenChange={(v) => !v && setActivePanel(null)}>
          <SheetContent side="right" className="w-[85vw] sm:max-w-sm p-0">
            <SheetHeader className="p-3 border-b">
              <SheetTitle>Properties</SheetTitle>
            </SheetHeader>
            <div className="h-[calc(100vh-100px)]">
              <RightSidebar onCaptionAssistant={openCaption} />
            </div>
          </SheetContent>
        </Sheet>
        {selectedLayer?.type === "text" && (
          <CaptionAssistant
            open={captionOpen}
            onOpenChange={setCaptionOpen}
            onApply={(text) => {
              if (selectedLayer) useMemeStore.getState().updateLayer(selectedLayer.id, { text });
            }}
            currentText={selectedLayer?.type === "text" ? selectedLayer.text : ""}
          />
        )}
        {(!selectedLayer || selectedLayer.type !== "text") && (
          <CaptionAssistant
            open={captionOpen}
            onOpenChange={setCaptionOpen}
            onApply={(text) => {
              const id = useMemeStore.getState().addTextLayer({ text });
              selectLayer(id);
            }}
            currentText=""
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <TopToolbar />
      <div className="flex-1 min-h-0 flex">
        <div className="w-72 shrink-0">
          <LeftSidebar />
        </div>
        <div className="flex-1 min-w-0 p-4 bg-muted/20">
          <MemeCanvas />
        </div>
        <div className="w-72 shrink-0">
          <RightSidebar onCaptionAssistant={openCaption} />
        </div>
      </div>
      <CaptionAssistant
        open={captionOpen}
        onOpenChange={setCaptionOpen}
        onApply={(text) => {
          if (selectedLayer && selectedLayer.type === "text") {
            useMemeStore.getState().updateLayer(selectedLayer.id, { text });
          } else {
            const id = useMemeStore.getState().addTextLayer({ text });
            selectLayer(id);
          }
        }}
        currentText={selectedLayer?.type === "text" ? selectedLayer.text : ""}
      />
    </div>
  );
}

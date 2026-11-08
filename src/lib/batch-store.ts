import { create } from "zustand";
import type { Background, Layer } from "./types";

export interface BatchItem {
  id: string;
  caption: string;
  width: number;
  height: number;
  background: Background;
  layers: Layer[]; // snapshot for this variation
}

interface BatchState {
  items: BatchItem[];
  // Capture the "base" meme (current editor state) that all variations share
  baseLayers: Layer[];
  baseBackground: Background;
  baseWidth: number;
  baseHeight: number;
  addFromCurrent: () => void;
  setBaseFromCurrent: () => void;
  addCaption: (caption: string) => void;
  updateCaption: (id: string, caption: string) => void;
  removeCaption: (id: string) => void;
  clearAll: () => void;
  // Regenerate all variation layers from base + caption list
  regenerate: () => void;
  importCaptions: (text: string) => void;
}

import { useMemeStore } from "./store";

function genId() {
  return `batch_${Math.random().toString(36).slice(2, 10)}`;
}

export const useBatchStore = create<BatchState>((set, get) => ({
  items: [],
  baseLayers: [],
  baseBackground: { type: "color", color: "#1a1a1a", gradientFrom: "#6d28d9", gradientTo: "#db2777", gradientAngle: 135 },
  baseWidth: 1080,
  baseHeight: 1080,

  setBaseFromCurrent: () => {
    const s = useMemeStore.getState();
    set({
      baseLayers: JSON.parse(JSON.stringify(s.layers)) as Layer[],
      baseBackground: { ...s.background },
      baseWidth: s.canvasWidth,
      baseHeight: s.canvasHeight,
    });
  },

  addFromCurrent: () => {
    const s = useMemeStore.getState();
    const baseLayers = JSON.parse(JSON.stringify(s.layers)) as Layer[];
    const baseBg = { ...s.background };
    const w = s.canvasWidth;
    const h = s.canvasHeight;
    set({
      baseLayers,
      baseBackground: baseBg,
      baseWidth: w,
      baseHeight: h,
      items: [
        {
          id: genId(),
          caption: "First caption",
          width: w,
          height: h,
          background: baseBg,
          layers: JSON.parse(JSON.stringify(baseLayers)) as Layer[],
        },
      ],
    });
  },

  addCaption: (caption) => {
    const item: BatchItem = {
      id: genId(),
      caption,
      width: get().baseWidth,
      height: get().baseHeight,
      background: { ...get().baseBackground },
      layers: JSON.parse(JSON.stringify(get().baseLayers)) as Layer[],
    };
    set({ items: [...get().items, item] });
    get().regenerate();
  },

  updateCaption: (id, caption) => {
    set({
      items: get().items.map((it) => (it.id === id ? { ...it, caption } : it)),
    });
    get().regenerate();
  },

  removeCaption: (id) => {
    set({ items: get().items.filter((it) => it.id !== id) });
  },

  clearAll: () => set({ items: [] }),

  importCaptions: (text) => {
    const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    const base = get();
    const items: BatchItem[] = lines.map((line) => ({
      id: genId(),
      caption: line,
      width: base.baseWidth,
      height: base.baseHeight,
      background: { ...base.baseBackground },
      layers: JSON.parse(JSON.stringify(base.baseLayers)) as Layer[],
    }));
    set({ items });
    get().regenerate();
  },

  regenerate: () => {
    const state = get();
    // For each item, replace the FIRST text layer's text with the caption
    // (or append a new text layer if base has none)
    const regenerated = state.items.map((it) => {
      const layers = JSON.parse(JSON.stringify(state.baseLayers)) as Layer[];
      const textLayers = layers.filter((l) => l.type === "text");
      if (textLayers.length > 0) {
        // Replace the FIRST text layer's text
        const firstText = textLayers[0];
        (firstText as any).text = it.caption;
      } else {
        // No text layers in base — append a default caption layer
        layers.push({
          id: `batch_text_${Math.random().toString(36).slice(2, 8)}`,
          type: "text",
          x: state.baseWidth * 0.1,
          y: state.baseHeight * 0.45,
          width: state.baseWidth * 0.8,
          height: state.baseHeight * 0.18,
          rotation: 0,
          opacity: 1,
          zIndex: layers.length + 1,
          visible: true,
          locked: false,
          text: it.caption,
          fontFamily: "Impact, Arial Black, sans-serif",
          fontSize: 72,
          fontWeight: 700,
          fontStyle: "normal",
          textAlign: "center",
          color: "#ffffff",
          outlineColor: "#000000",
          outlineWidth: 4,
          backgroundColor: "transparent",
          shadow: false,
          shadowColor: "#000000",
          shadowBlur: 12,
          letterSpacing: 1,
          lineHeight: 1.1,
          uppercase: true,
          panelId: null,
        } as Layer);
      }
      return { ...it, layers, background: { ...state.baseBackground }, width: state.baseWidth, height: state.baseHeight };
    });
    set({ items: regenerated });
  },
}));

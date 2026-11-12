import { create } from "zustand";
import type {
  Background,
  EditorView,
  Layer,
  PlatformFormat,
  TextLayer,
  ImageLayer,
  ShapeLayer,
  MemeTemplate,
} from "./types";
import { PLATFORM_PRESETS } from "./presets";

const MAX_HISTORY = 80;

function genId(prefix = "layer"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36).slice(-4)}`;
}

function defaultTextLayer(partial: Partial<TextLayer>): TextLayer {
  return {
    id: genId("text"),
    type: "text",
    x: 80,
    y: 80,
    width: 920,
    height: 140,
    rotation: 0,
    opacity: 1,
    zIndex: 0,
    visible: true,
    locked: false,
    text: "YOUR TEXT",
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
    ...partial,
  };
}

function defaultShapeLayer(partial: Partial<ShapeLayer>): ShapeLayer {
  return {
    id: genId("shape"),
    type: "shape",
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    rotation: 0,
    opacity: 1,
    zIndex: 0,
    visible: true,
    locked: false,
    shape: "rectangle",
    fill: "#1a1a1a",
    stroke: "#ffffff",
    strokeWidth: 0,
    panelId: null,
    ...partial,
  };
}

function defaultImageLayer(partial: Partial<ImageLayer>): ImageLayer {
  return {
    id: genId("image"),
    type: "image",
    x: 0,
    y: 0,
    width: 1080,
    height: 1080,
    rotation: 0,
    opacity: 1,
    zIndex: 0,
    visible: true,
    locked: false,
    src: "",
    naturalWidth: 1080,
    naturalHeight: 1080,
    objectFit: "cover",
    panelId: null,
    borderRadius: 0,
    ...partial,
  };
}

const DEFAULT_BG: Background = {
  type: "color",
  color: "#1a1a1a",
  gradientFrom: "#6d28d9",
  gradientTo: "#db2777",
  gradientAngle: 135,
};

interface MemeState {
  // View routing
  view: EditorView;
  viewParams: Record<string, string>;
  setView: (view: EditorView, params?: Record<string, string>) => void;

  // Canvas
  canvasWidth: number;
  canvasHeight: number;
  background: Background;
  platformFormat: PlatformFormat;

  // Layers
  layers: Layer[];
  selectedLayerId: string | null;

  // History
  history: { layers: Layer[]; bg: Background; width: number; height: number }[];
  historyIndex: number;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Layer operations
  addTextLayer: (partial?: Partial<TextLayer>) => string;
  addImageLayer: (src: string, naturalWidth: number, naturalHeight: number, panelId?: string | null) => string;
  addShapeLayer: (partial?: Partial<ShapeLayer>) => string;
  updateLayer: (id: string, patch: Partial<Layer>) => void;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  selectLayer: (id: string | null) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;

  // Canvas operations
  setCanvasSize: (width: number, height: number, platform?: PlatformFormat) => void;
  applyPlatformPreset: (id: PlatformFormat) => void;
  setBackground: (bg: Partial<Background>) => void;

  // Template loading
  loadTemplate: (template: MemeTemplate) => void;
  resetCanvas: () => void;

  // Sessions
  saveSession: () => void;
  restoreSession: () => boolean;
  clearSession: () => void;

  // Load a trending viral meme as the editor base (fetches the image, scales canvas, adds as image layer)
  loadTrendingMeme: (meme: { imageUrl: string; title: string; width?: number; height?: number }) => Promise<void>;

  // Helpers
  getSelectedLayer: () => Layer | null;
}

export const useMemeStore = create<MemeState>((set, get) => ({
  view: "home",
  viewParams: {},
  setView: (view, params = {}) => {
    set({ view, viewParams: params });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  },

  canvasWidth: 1080,
  canvasHeight: 1080,
  background: DEFAULT_BG,
  platformFormat: "instagram_square",

  layers: [],
  selectedLayerId: null,

  history: [{ layers: [], bg: DEFAULT_BG, width: 1080, height: 1080 }],
  historyIndex: 0,
  pushHistory: () => {
    const { layers, background, canvasWidth, canvasHeight, history, historyIndex } = get();
    const snapshot = {
      layers: JSON.parse(JSON.stringify(layers)) as Layer[],
      bg: { ...background },
      width: canvasWidth,
      height: canvasHeight,
    };
    const trimmed = history.slice(0, historyIndex + 1);
    trimmed.push(snapshot);
    if (trimmed.length > MAX_HISTORY) trimmed.shift();
    set({ history: trimmed, historyIndex: trimmed.length - 1 });
  },
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const snap = history[historyIndex - 1];
    set({
      layers: JSON.parse(JSON.stringify(snap.layers)) as Layer[],
      background: { ...snap.bg },
      canvasWidth: snap.width,
      canvasHeight: snap.height,
      historyIndex: historyIndex - 1,
      selectedLayerId: null,
    });
  },
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const snap = history[historyIndex + 1];
    set({
      layers: JSON.parse(JSON.stringify(snap.layers)) as Layer[],
      background: { ...snap.bg },
      canvasWidth: snap.width,
      canvasHeight: snap.height,
      historyIndex: historyIndex + 1,
      selectedLayerId: null,
    });
  },
  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  addTextLayer: (partial) => {
    const { layers, canvasWidth, canvasHeight } = get();
    const maxZ = layers.reduce((m, l) => Math.max(m, l.zIndex), 0);
    const layer = defaultTextLayer({
      x: canvasWidth * 0.1,
      y: canvasHeight * 0.1,
      width: canvasWidth * 0.8,
      height: Math.min(180, canvasHeight * 0.18),
      zIndex: maxZ + 1,
      ...partial,
    });
    get().pushHistory();
    set({ layers: [...layers, layer], selectedLayerId: layer.id });
    return layer.id;
  },
  addImageLayer: (src, naturalWidth, naturalHeight, panelId = null) => {
    const { layers, canvasWidth, canvasHeight } = get();
    const maxZ = layers.reduce((m, l) => Math.max(m, l.zIndex), 0);
    // Cover the canvas by default
    const canvasAspect = canvasWidth / canvasHeight;
    const imgAspect = naturalWidth / naturalHeight;
    let w = canvasWidth;
    let h = canvasHeight;
    if (imgAspect > canvasAspect) {
      h = canvasHeight;
      w = canvasHeight * imgAspect;
    } else {
      w = canvasWidth;
      h = canvasWidth / imgAspect;
    }
    const layer = defaultImageLayer({
      src,
      naturalWidth,
      naturalHeight,
      width: w,
      height: h,
      x: (canvasWidth - w) / 2,
      y: (canvasHeight - h) / 2,
      zIndex: maxZ + 1,
      panelId,
    });
    get().pushHistory();
    set({ layers: [...layers, layer], selectedLayerId: layer.id });
    return layer.id;
  },
  addShapeLayer: (partial) => {
    const { layers } = get();
    const maxZ = layers.reduce((m, l) => Math.max(m, l.zIndex), 0);
    const layer = defaultShapeLayer({ zIndex: maxZ + 1, ...partial });
    get().pushHistory();
    set({ layers: [...layers, layer], selectedLayerId: layer.id });
    return layer.id;
  },
  updateLayer: (id, patch) => {
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l)),
    }));
  },
  deleteLayer: (id) => {
    get().pushHistory();
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== id),
      selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
    }));
  },
  duplicateLayer: (id) => {
    const { layers } = get();
    const original = layers.find((l) => l.id === id);
    if (!original) return;
    const maxZ = layers.reduce((m, l) => Math.max(m, l.zIndex), 0);
    const copy = JSON.parse(JSON.stringify(original)) as Layer;
    copy.id = genId(original.type);
    copy.x = original.x + 20;
    copy.y = original.y + 20;
    copy.zIndex = maxZ + 1;
    get().pushHistory();
    set({ layers: [...layers, copy], selectedLayerId: copy.id });
  },
  selectLayer: (id) => set({ selectedLayerId: id }),
  bringForward: (id) => {
    const { layers } = get();
    const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex((l) => l.id === id);
    if (idx < 0 || idx === sorted.length - 1) return;
    get().pushHistory();
    const tmp = sorted[idx].zIndex;
    sorted[idx] = { ...sorted[idx], zIndex: sorted[idx + 1].zIndex };
    sorted[idx + 1] = { ...sorted[idx + 1], zIndex: tmp };
    set({ layers: sorted });
  },
  sendBackward: (id) => {
    const { layers } = get();
    const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex((l) => l.id === id);
    if (idx <= 0) return;
    get().pushHistory();
    const tmp = sorted[idx].zIndex;
    sorted[idx] = { ...sorted[idx], zIndex: sorted[idx - 1].zIndex };
    sorted[idx - 1] = { ...sorted[idx - 1], zIndex: tmp };
    set({ layers: sorted });
  },
  bringToFront: (id) => {
    const { layers } = get();
    const maxZ = layers.reduce((m, l) => Math.max(m, l.zIndex), 0);
    if (layers.find((l) => l.id === id)?.zIndex === maxZ) return;
    get().pushHistory();
    set({
      layers: layers.map((l) => (l.id === id ? { ...l, zIndex: maxZ + 1 } : l)),
    });
  },
  sendToBack: (id) => {
    const { layers } = get();
    const minZ = layers.reduce((m, l) => Math.min(m, l.zIndex), 0);
    if (layers.find((l) => l.id === id)?.zIndex === minZ) return;
    get().pushHistory();
    set({
      layers: layers.map((l) => (l.id === id ? { ...l, zIndex: minZ - 1 } : l)),
    });
  },

  setCanvasSize: (width, height, platform = "custom") => {
    get().pushHistory();
    set({ canvasWidth: width, canvasHeight: height, platformFormat: platform });
  },
  applyPlatformPreset: (id) => {
    const preset = PLATFORM_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    get().pushHistory();
    // Scale existing layers proportionally to new canvas, keeping center positions stable
    const { canvasWidth, canvasHeight, layers } = get();
    const sx = preset.width / canvasWidth;
    const sy = preset.height / canvasHeight;
    // Use uniform scale based on the smaller dimension to preserve readability
    const us = Math.min(sx, sy);
    const newLayers = layers.map((l) => ({
      ...l,
      x: l.x * sx,
      y: l.y * sy,
      width: l.width * sx,
      height: l.height * sy,
    })) as Layer[];
    set({
      canvasWidth: preset.width,
      canvasHeight: preset.height,
      platformFormat: id,
      layers: newLayers,
    });
  },
  setBackground: (bg) => {
    get().pushHistory();
    set((state) => ({ background: { ...state.background, ...bg } }));
  },

  loadTemplate: (template) => {
    get().pushHistory();
    const newLayers: Layer[] = [];
    let z = 0;
    for (const tmplLayer of template.layers) {
      if (tmplLayer.type === "text") {
        newLayers.push({
          ...defaultTextLayer({ ...(tmplLayer as any), id: genId("text"), zIndex: z++ }),
        } as TextLayer);
      } else if (tmplLayer.type === "shape") {
        newLayers.push({
          ...defaultShapeLayer({ ...(tmplLayer as any), id: genId("shape"), zIndex: z++ }),
        } as ShapeLayer);
      }
    }
    set({
      canvasWidth: template.width,
      canvasHeight: template.height,
      background: { ...template.background },
      layers: newLayers,
      selectedLayerId: null,
      platformFormat: "custom",
    });
  },

  resetCanvas: () => {
    get().pushHistory();
    set({
      layers: [],
      selectedLayerId: null,
      background: DEFAULT_BG,
      canvasWidth: 1080,
      canvasHeight: 1080,
      platformFormat: "instagram_square",
    });
  },

  saveSession: () => {
    if (typeof window === "undefined") return;
    const { layers, background, canvasWidth, canvasHeight, platformFormat } = get();
    try {
      localStorage.setItem(
        "memeforge:session",
        JSON.stringify({ layers, background, canvasWidth, canvasHeight, platformFormat, ts: Date.now() }),
      );
    } catch {
      // ignore quota errors
    }
  },
  restoreSession: () => {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem("memeforge:session");
      if (!raw) return false;
      const data = JSON.parse(raw);
      set({
        layers: data.layers || [],
        background: data.background || DEFAULT_BG,
        canvasWidth: data.canvasWidth || 1080,
        canvasHeight: data.canvasHeight || 1080,
        platformFormat: data.platformFormat || "instagram_square",
      });
      return true;
    } catch {
      return false;
    }
  },
  clearSession: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("memeforge:session");
  },

  loadTrendingMeme: async (meme) => {
    // Fetch the image as a data URL so we don't run into CORS issues during canvas export.
    try {
      const res = await fetch(meme.imageUrl, { mode: "cors" });
      const blob = await res.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = reject;
        r.readAsDataURL(blob);
      });
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.crossOrigin = "anonymous";
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = dataUrl;
      });
      // Reset the canvas to the meme's natural aspect ratio (cap to 1500 max for performance)
      const maxDim = 1500;
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      get().pushHistory();
      set({
        canvasWidth: w,
        canvasHeight: h,
        background: { type: "color", color: "#ffffff", gradientFrom: "#6d28d9", gradientTo: "#db2777", gradientAngle: 135 },
        layers: [],
        selectedLayerId: null,
        platformFormat: "custom",
      });
      // Add the image as a full-cover image layer
      get().addImageLayer(dataUrl, img.naturalWidth, img.naturalHeight);
      // Add a default top text placeholder layer for easy editing
      get().addTextLayer({
        text: "TOP TEXT",
        y: Math.round(h * 0.04),
        height: Math.round(h * 0.15),
        fontSize: Math.round(h * 0.09),
        outlineWidth: Math.max(3, Math.round(h * 0.006)),
      });
      get().addTextLayer({
        text: "BOTTOM TEXT",
        y: Math.round(h * 0.81),
        height: Math.round(h * 0.15),
        fontSize: Math.round(h * 0.09),
        outlineWidth: Math.max(3, Math.round(h * 0.006)),
      });
    } catch (e) {
      // Fallback: just set the image URL directly without proxy
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.crossOrigin = "anonymous";
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = meme.imageUrl;
      }).catch(() => null);
      if (!img) return;
      const maxDim = 1500;
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      get().pushHistory();
      set({
        canvasWidth: w,
        canvasHeight: h,
        background: { type: "color", color: "#ffffff", gradientFrom: "#6d28d9", gradientTo: "#db2777", gradientAngle: 135 },
        layers: [],
        selectedLayerId: null,
        platformFormat: "custom",
      });
      get().addImageLayer(meme.imageUrl, img.naturalWidth, img.naturalHeight);
      get().addTextLayer({ text: "TOP TEXT", y: Math.round(h * 0.04), height: Math.round(h * 0.15), fontSize: Math.round(h * 0.09), outlineWidth: Math.max(3, Math.round(h * 0.006)) });
      get().addTextLayer({ text: "BOTTOM TEXT", y: Math.round(h * 0.81), height: Math.round(h * 0.15), fontSize: Math.round(h * 0.09), outlineWidth: Math.max(3, Math.round(h * 0.006)) });
    }
  },

  getSelectedLayer: () => {
    const { layers, selectedLayerId } = get();
    return layers.find((l) => l.id === selectedLayerId) || null;
  },
}));

// Helper exported for client use
export function getDefaultTextLayer(): TextLayer {
  return defaultTextLayer({});
}

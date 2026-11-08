import type { Background, Layer, QualityIssue, TextLayer } from "./types";
import { renderScene, wrapText, measureTextWithSpacing, contrastRatio, relativeLuminance, fontString, isInsideCanvas } from "./canvas-render";
import JSZip from "jszip";

export type ExportFormat = "png" | "jpeg" | "webp";

export interface ExportOptions {
  format: ExportFormat;
  quality: number; // 0..1 for jpeg/webp
  scale: number; // export scale relative to canvas size
  transparentBackground?: boolean;
  filename?: string;
}

export async function exportMeme(
  width: number,
  height: number,
  background: Background,
  layers: Layer[],
  options: ExportOptions,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const bg: Background = options.transparentBackground && options.format === "png"
    ? { ...background, type: "transparent" }
    : background;
  await renderScene(canvas, width, height, bg, layers, options.scale, true);
  const mime = options.format === "png" ? "image/png" : options.format === "webp" ? "image/webp" : "image/jpeg";
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed"))), mime, options.quality);
  });
  return blob;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportBatchZip(
  items: Array<{ name: string; width: number; height: number; background: Background; layers: Layer[] }>,
  options: ExportOptions,
  onProgress?: (done: number, total: number) => void,
): Promise<Blob> {
  const zip = new JSZip();
  let i = 0;
  for (const item of items) {
    const blob = await exportMeme(item.width, item.height, item.background, item.layers, {
      ...options,
      filename: item.name,
    });
    const ext = options.format === "jpeg" ? "jpg" : options.format;
    zip.file(`${item.name}.${ext}`, blob);
    i++;
    onProgress?.(i, items.length);
  }
  return zip.generateAsync({ type: "blob" });
}

// --------------------- Quality Checker ---------------------

export function runQualityChecks(
  width: number,
  height: number,
  background: Background,
  layers: Layer[],
): QualityIssue[] {
  const issues: QualityIssue[] = [];
  // Resolution check
  const minDim = Math.min(width, height);
  if (minDim < 600) {
    issues.push({
      level: "warning",
      title: "Low export resolution",
      description: `Canvas is ${width}×${height}px. For crisp social sharing, use at least 1080px on the short edge.`,
    });
  }
  // Background color for contrast checks
  let bgHex = "#ffffff";
  if (background.type === "color") bgHex = background.color;
  else if (background.type === "gradient") bgHex = averageHex(background.gradientFrom, background.gradientTo);

  for (const layer of layers) {
    if (!layer.visible) continue;
    if (!isInsideCanvas(layer, width, height)) {
      issues.push({
        level: "warning",
        title: "Element near canvas edge",
        description: `A ${layer.type} layer extends beyond the canvas. Drag it back inside or it may be clipped on export.`,
        layerId: layer.id,
      });
    }
    if (layer.type === "text") {
      const tl = layer as TextLayer;
      if (!tl.text || !tl.text.trim()) continue;
      // Overflow check using a measurement canvas
      const measureCanvas = document.createElement("canvas");
      const ctx = measureCanvas.getContext("2d")!;
      ctx.font = fontString(tl);
      const lines = wrapText(ctx, tl.text, tl.width - 8, tl.letterSpacing);
      const lineHeight = tl.fontSize * tl.lineHeight;
      const totalHeight = lines.length * lineHeight;
      if (totalHeight > tl.height + 2) {
        issues.push({
          level: "warning",
          title: "Text overflow detected",
          description: `A text layer (${truncate(tl.text, 20)}) has more lines than fit in its box. Reduce font size or enlarge the box.`,
          layerId: tl.id,
        });
      }
      const widest = lines.reduce((m, l) => Math.max(m, measureTextWithSpacing(ctx, l, tl.letterSpacing)), 0);
      if (widest > tl.width + 2) {
        issues.push({
          level: "warning",
          title: "Text too wide",
          description: `A text layer (${truncate(tl.text, 20)}) is wider than its box.`,
          layerId: tl.id,
        });
      }
      // Contrast check
      const contrastVsBg = contrastRatio(tl.color, bgHex);
      const hasOutline = tl.outlineWidth > 0;
      if (contrastVsBg < 3.5 && !hasOutline) {
        issues.push({
          level: "warning",
          title: "Low text contrast",
          description: `Text color and background have a low contrast ratio (${contrastVsBg.toFixed(1)}:1). Add an outline or change the color for readability.`,
          layerId: tl.id,
        });
      }
      // Font size readability
      if (tl.fontSize < 24 && width >= 800) {
        issues.push({
          level: "info",
          title: "Small font size",
          description: "Font size below 24px can be hard to read on mobile. Consider increasing.",
          layerId: tl.id,
        });
      }
    }
  }
  // Aspect ratio warnings for platform mismatch
  return issues;
}

function averageHex(a: string, b: string): string {
  const ah = parseHex(a);
  const bh = parseHex(b);
  if (!ah || !bh) return "#ffffff";
  const r = Math.round((ah[0] + bh[0]) / 2);
  const g = Math.round((ah[1] + bh[1]) / 2);
  const bl = Math.round((ah[2] + bh[2]) / 2);
  return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function parseHex(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "");
  if (m.length !== 6) return null;
  return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

// Utility: read a File into a base64 data URL
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function validateImageFile(file: File): { ok: boolean; error?: string } {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    return { ok: false, error: `Unsupported file type: ${file.type || "unknown"}. Use JPG, PNG, WebP, or GIF.` };
  }
  const maxBytes = 25 * 1024 * 1024; // 25 MB
  if (file.size > maxBytes) {
    return { ok: false, error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 25 MB.` };
  }
  return { ok: true };
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "memeforge-meme";
}

import type { Background, Layer, TextLayer, ImageLayer, ShapeLayer } from "./types";

// Load an image element from a src URL with caching
const imageCache = new Map<string, HTMLImageElement>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached && cached.complete) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

// Wrap text into lines based on a max width, respecting manual newlines
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  letterSpacing: number = 0,
): string[] {
  const explicitLines = text.split("\n");
  const result: string[] = [];
  for (const line of explicitLines) {
    if (line.trim() === "") {
      result.push("");
      continue;
    }
    // Try the whole line first
    if (measureTextWithSpacing(ctx, line, letterSpacing) <= maxWidth) {
      result.push(line);
      continue;
    }
    // Word wrap
    const words = line.split(/(\s+)/);
    let current = "";
    for (const token of words) {
      const candidate = current + token;
      if (measureTextWithSpacing(ctx, candidate, letterSpacing) <= maxWidth) {
        current = candidate;
      } else {
        if (current.trim()) result.push(current.trimEnd());
        // If single token longer than max, hard-break
        if (measureTextWithSpacing(ctx, token, letterSpacing) > maxWidth) {
          let buf = "";
          for (const ch of token) {
            if (measureTextWithSpacing(ctx, buf + ch, letterSpacing) > maxWidth) {
              result.push(buf);
              buf = ch;
            } else {
              buf += ch;
            }
          }
          current = buf;
        } else {
          current = token.replace(/^\s+/, "");
        }
      }
    }
    if (current.trim()) result.push(current.trimEnd());
  }
  return result;
}

export function measureTextWithSpacing(
  ctx: CanvasRenderingContext2D,
  text: string,
  letterSpacing: number,
): number {
  if (!letterSpacing) return ctx.measureText(text).width;
  const chars = [...text];
  let width = 0;
  for (const ch of chars) {
    width += ctx.measureText(ch).width + letterSpacing;
  }
  return Math.max(0, width - letterSpacing);
}

// Auto-fit a font size so the text fits within the layer's bounding box
export function fitFontSize(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  maxWidth: number,
  maxHeight: number,
  minSize = 12,
  maxSize = 400,
): number {
  let size = layer.fontSize;
  ctx.font = fontString({ ...layer, fontSize: size });
  const lineHeightPx = size * layer.lineHeight;
  let lines = wrapText(ctx, layer.text || "", maxWidth, layer.letterSpacing);
  let totalHeight = lines.length * lineHeightPx;
  // Shrink
  let safety = 30;
  while ((totalHeight > maxHeight || widestLineWidth(ctx, lines, layer.letterSpacing) > maxWidth) && size > minSize && safety-- > 0) {
    size -= 2;
    ctx.font = fontString({ ...layer, fontSize: size });
    lines = wrapText(ctx, layer.text || "", maxWidth, layer.letterSpacing);
    totalHeight = lines.length * (size * layer.lineHeight);
  }
  // Grow if too small
  safety = 30;
  while (totalHeight < maxHeight * 0.9 && widestLineWidth(ctx, lines, layer.letterSpacing) < maxWidth && size < maxSize && safety-- > 0) {
    const next = size + 2;
    ctx.font = fontString({ ...layer, fontSize: next });
    const newLines = wrapText(ctx, layer.text || "", maxWidth, layer.letterSpacing);
    const newHeight = newLines.length * (next * layer.lineHeight);
    if (newHeight > maxHeight || widestLineWidth(ctx, newLines, layer.letterSpacing) > maxWidth) break;
    size = next;
    lines = newLines;
    totalHeight = newHeight;
  }
  return Math.max(minSize, Math.min(maxSize, Math.round(size)));
}

function widestLineWidth(ctx: CanvasRenderingContext2D, lines: string[], letterSpacing: number): number {
  let max = 0;
  for (const line of lines) {
    const w = measureTextWithSpacing(ctx, line, letterSpacing);
    if (w > max) max = w;
  }
  return max;
}

export function fontString(layer: Pick<TextLayer, "fontFamily" | "fontSize" | "fontWeight" | "fontStyle">): string {
  const style = layer.fontStyle === "italic" ? "italic " : "";
  return `${style}${layer.fontWeight} ${layer.fontSize}px ${layer.fontFamily}`;
}

// Render the full canvas background
export function renderBackground(
  ctx: CanvasRenderingContext2D,
  bg: Background,
  width: number,
  height: number,
) {
  ctx.save();
  if (bg.type === "transparent") {
    // Checkerboard pattern
    const cell = 16;
    for (let y = 0; y < height; y += cell) {
      for (let x = 0; x < width; x += cell) {
        ctx.fillStyle = ((x / cell + y / cell) % 2 === 0) ? "#ffffff" : "#e5e7eb";
        ctx.fillRect(x, y, cell, cell);
      }
    }
  } else if (bg.type === "gradient") {
    const angle = (bg.gradientAngle * Math.PI) / 180;
    const x0 = width / 2 - (Math.cos(angle) * width) / 2;
    const y0 = height / 2 - (Math.sin(angle) * height) / 2;
    const x1 = width / 2 + (Math.cos(angle) * width) / 2;
    const y1 = height / 2 + (Math.sin(angle) * height) / 2;
    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    grad.addColorStop(0, bg.gradientFrom);
    grad.addColorStop(1, bg.gradientTo);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
}

// Render a single layer onto a canvas context
export async function renderLayer(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  scale: number = 1,
  forExport: boolean = false,
): Promise<void> {
  if (!layer.visible) return;
  ctx.save();
  ctx.globalAlpha = layer.opacity;
  const cx = (layer.x + layer.width / 2) * scale;
  const cy = (layer.y + layer.height / 2) * scale;
  ctx.translate(cx, cy);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  const w = layer.width * scale;
  const h = layer.height * scale;
  if (layer.type === "image") {
    await renderImageLayer(ctx, layer, w, h);
  } else if (layer.type === "text") {
    renderTextLayer(ctx, layer, w, h);
  } else if (layer.type === "shape") {
    renderShapeLayer(ctx, layer, w, h);
  }
  ctx.restore();
}

async function renderImageLayer(
  ctx: CanvasRenderingContext2D,
  layer: ImageLayer,
  w: number,
  h: number,
) {
  try {
    const img = await loadImage(layer.src);
    const dw = w;
    const dh = h;
    if (layer.objectFit === "fill") {
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    } else if (layer.objectFit === "contain") {
      const scale = Math.min(dw / layer.naturalWidth, dh / layer.naturalHeight);
      const sw = layer.naturalWidth * scale;
      const sh = layer.naturalHeight * scale;
      ctx.drawImage(img, -sw / 2, -sh / 2, sw, sh);
    } else {
      // cover
      const scale = Math.max(dw / layer.naturalWidth, dh / layer.naturalHeight);
      const sw = layer.naturalWidth * scale;
      const sh = layer.naturalHeight * scale;
      const sx = (layer.naturalWidth - dw / scale) / 2;
      const sy = (layer.naturalHeight - dh / scale) / 2;
      ctx.drawImage(
        img,
        Math.max(0, sx),
        Math.max(0, sy),
        Math.min(layer.naturalWidth, dw / scale),
        Math.min(layer.naturalHeight, dh / scale),
        -dw / 2,
        -dh / 2,
        dw,
        dh,
      );
    }
    if (layer.borderRadius > 0) {
      // No-op here since drawImage already drawn; borderRadius handled via clip in caller
    }
  } catch {
    // Image failed to load — draw placeholder
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = "#666";
    ctx.font = "24px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Image unavailable", 0, 0);
  }
}

function renderTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  w: number,
  h: number,
) {
  const text = layer.uppercase ? (layer.text || "").toUpperCase() : layer.text || "";
  if (!text.trim() && layer.backgroundColor === "transparent") return;
  ctx.font = fontString(layer);
  ctx.textBaseline = "top";
  ctx.textAlign = layer.textAlign;

  const lines = wrapText(ctx, text, w - 8, layer.letterSpacing);
  const lineHeightPx = layer.fontSize * layer.lineHeight;
  const totalHeight = lines.length * lineHeightPx;
  const startY = -h / 2 + (h - totalHeight) / 2;

  // Background color box
  if (layer.backgroundColor !== "transparent") {
    let bgWidth = w;
    let bgX = -w / 2;
    if (layer.textAlign === "center") {
      const widest = lines.reduce((m, l) => Math.max(m, measureTextWithSpacing(ctx, l, layer.letterSpacing)), 0);
      bgWidth = widest + 24;
      bgX = -bgWidth / 2;
    } else if (layer.textAlign === "left") {
      const widest = lines.reduce((m, l) => Math.max(m, measureTextWithSpacing(ctx, l, layer.letterSpacing)), 0);
      bgWidth = widest + 24;
      bgX = -w / 2;
    } else {
      const widest = lines.reduce((m, l) => Math.max(m, measureTextWithSpacing(ctx, l, layer.letterSpacing)), 0);
      bgWidth = widest + 24;
      bgX = w / 2 - bgWidth;
    }
    ctx.fillStyle = layer.backgroundColor;
    ctx.fillRect(bgX, startY - 8, bgWidth, totalHeight + 16);
  }

  // Shadow
  if (layer.shadow) {
    ctx.shadowColor = layer.shadowColor;
    ctx.shadowBlur = layer.shadowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  // Each line
  let x = 0;
  if (layer.textAlign === "left") x = -w / 2;
  else if (layer.textAlign === "right") x = w / 2;
  else x = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const y = startY + i * lineHeightPx;
    if (layer.outlineWidth > 0) {
      ctx.lineJoin = "round";
      ctx.miterLimit = 2;
      ctx.strokeStyle = layer.outlineColor;
      ctx.lineWidth = layer.outlineWidth;
      ctx.strokeText(line, x, y);
    }
    ctx.fillStyle = layer.color;
    ctx.fillText(line, x, y);
  }
}

function renderShapeLayer(
  ctx: CanvasRenderingContext2D,
  layer: ShapeLayer,
  w: number,
  h: number,
) {
  if (layer.shape === "ellipse") {
    ctx.beginPath();
    ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = layer.fill;
    ctx.fill();
    if (layer.strokeWidth > 0) {
      ctx.strokeStyle = layer.stroke;
      ctx.lineWidth = layer.strokeWidth;
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = layer.fill;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    if (layer.strokeWidth > 0) {
      ctx.strokeStyle = layer.stroke;
      ctx.lineWidth = layer.strokeWidth;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
    }
  }
}

// Render the entire meme scene to a canvas element
export async function renderScene(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  background: Background,
  layers: Layer[],
  scale: number = 1,
  forExport: boolean = false,
): Promise<void> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  renderBackground(ctx, background, width * scale, height * scale);
  const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);
  for (const layer of sorted) {
    await renderLayer(ctx, layer, scale, forExport);
  }
}

// Compute relative luminance of a hex color (0..1)
export function relativeLuminance(hex: string): number {
  const m = hex.replace("#", "");
  if (m.length !== 6) return 0.5;
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

// Contrast ratio between two colors (1..21)
export function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

// Detect whether a layer's bounding box overlaps the canvas
export function isInsideCanvas(layer: Layer, canvasWidth: number, canvasHeight: number): boolean {
  return (
    layer.x >= -layer.width * 0.5 &&
    layer.y >= -layer.height * 0.5 &&
    layer.x + layer.width <= canvasWidth + layer.width * 0.5 &&
    layer.y + layer.height <= canvasHeight + layer.height * 0.5
  );
}

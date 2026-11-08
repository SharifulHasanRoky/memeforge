"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMemeStore } from "@/lib/store";
import { renderScene, loadImage } from "@/lib/canvas-render";
import type { Layer } from "@/lib/types";

interface DragState {
  mode: "move" | "resize" | "rotate";
  layerId: string;
  handle?: string;
  startX: number;
  startY: number;
  origLayer: Layer;
}

interface DisplayState {
  scale: number;
  displayWidth: number;
  displayHeight: number;
}

export default function MemeCanvas({ onCanvasReady }: { onCanvasReady?: (c: HTMLCanvasElement | null) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [display, setDisplay] = useState<DisplayState>({ scale: 1, displayWidth: 1080, displayHeight: 1080 });

  const layers = useMemeStore((s) => s.layers);
  const background = useMemeStore((s) => s.background);
  const canvasWidth = useMemeStore((s) => s.canvasWidth);
  const canvasHeight = useMemeStore((s) => s.canvasHeight);
  const selectedLayerId = useMemeStore((s) => s.selectedLayerId);
  const updateLayer = useMemeStore((s) => s.updateLayer);
  const selectLayer = useMemeStore((s) => s.selectLayer);
  const pushHistory = useMemeStore((s) => s.pushHistory);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null;

  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    await renderScene(canvas, canvasWidth, canvasHeight, background, layers, 1, false);
  }, [layers, background, canvasWidth, canvasHeight]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await render();
      if (!cancelled && onCanvasReady && canvasRef.current) onCanvasReady(canvasRef.current);
    })();
    return () => { cancelled = true; };
  }, [render, onCanvasReady]);

  // Wait for image layers to load then re-render
  useEffect(() => {
    const imageLayers = layers.filter((l) => l.type === "image" && l.src) as Array<{ src: string }>;
    if (imageLayers.length === 0) return;
    let cancelled = false;
    Promise.all(imageLayers.map((l) => loadImage(l.src).catch(() => null)))
      .then(() => { if (!cancelled) render(); });
    return () => { cancelled = true; };
  }, [layers, render]);

  // Responsive sizing
  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const padding = 16;
      const availW = Math.max(50, rect.width - padding);
      const availH = Math.max(50, rect.height - padding);
      const scaleByW = availW / canvasWidth;
      const scaleByH = availH / canvasHeight;
      const scale = Math.min(scaleByW, scaleByH);
      setDisplay({
        scale,
        displayWidth: canvasWidth * scale,
        displayHeight: canvasHeight * scale,
      });
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [canvasWidth, canvasHeight]);

  const getCanvasCoords = useCallback(
    (e: PointerEvent | React.PointerEvent): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * canvasWidth;
      const y = ((e.clientY - rect.top) / rect.height) * canvasHeight;
      return { x, y };
    },
    [canvasWidth, canvasHeight],
  );

  const hitTest = useCallback(
    (point: { x: number; y: number }, layer: Layer): boolean => {
      const cx = layer.x + layer.width / 2;
      const cy = layer.y + layer.height / 2;
      const angle = (-layer.rotation * Math.PI) / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const dx = point.x - cx;
      const dy = point.y - cy;
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;
      return Math.abs(localX) <= layer.width / 2 && Math.abs(localY) <= layer.height / 2;
    },
    [],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const target = e.target as HTMLElement;
      const handle = target.getAttribute("data-handle");
      const point = getCanvasCoords(e);

      if (handle && selectedLayerId) {
        e.stopPropagation();
        e.preventDefault();
        try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
        const layer = layers.find((l) => l.id === selectedLayerId);
        if (!layer) return;
        if (handle === "rotate") {
          dragRef.current = { mode: "rotate", layerId: selectedLayerId, startX: point.x, startY: point.y, origLayer: { ...layer } };
        } else {
          pushHistory();
          dragRef.current = { mode: "resize", layerId: selectedLayerId, handle, startX: point.x, startY: point.y, origLayer: { ...layer } };
        }
        return;
      }

      const sorted = [...layers].sort((a, b) => b.zIndex - a.zIndex);
      const hit = sorted.find((l) => l.visible && !l.locked && hitTest(point, l));
      if (hit) {
        e.preventDefault();
        try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
        pushHistory();
        selectLayer(hit.id);
        dragRef.current = { mode: "move", layerId: hit.id, startX: point.x, startY: point.y, origLayer: { ...hit } };
      } else {
        selectLayer(null);
      }
    },
    [layers, selectedLayerId, getCanvasCoords, hitTest, selectLayer, pushHistory],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      e.preventDefault();
      const point = getCanvasCoords(e);
      const dx = point.x - drag.startX;
      const dy = point.y - drag.startY;

      if (drag.mode === "move") {
        updateLayer(drag.layerId, { x: drag.origLayer.x + dx, y: drag.origLayer.y + dy });
      } else if (drag.mode === "rotate") {
        const cx = drag.origLayer.x + drag.origLayer.width / 2;
        const cy = drag.origLayer.y + drag.origLayer.height / 2;
        const angle = Math.atan2(point.y - cy, point.x - cx) * (180 / Math.PI) + 90;
        const snapped = Math.round(angle / 90) * 90;
        const finalAngle = Math.abs(angle - snapped) < 4 ? snapped : Math.round(angle);
        updateLayer(drag.layerId, { rotation: finalAngle });
      } else if (drag.mode === "resize" && drag.handle) {
        const orig = drag.origLayer;
        const angle = (orig.rotation * Math.PI) / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const localDx = dx * cos + dy * sin;
        const localDy = -dx * sin + dy * cos;
        let newW = orig.width;
        let newH = orig.height;
        let anchorX = 0, anchorY = 0;
        switch (drag.handle) {
          case "nw": newW = orig.width - localDx; newH = orig.height - localDy; anchorX = orig.width / 2; anchorY = orig.height / 2; break;
          case "ne": newW = orig.width + localDx; newH = orig.height - localDy; anchorX = -orig.width / 2; anchorY = orig.height / 2; break;
          case "sw": newW = orig.width - localDx; newH = orig.height + localDy; anchorX = orig.width / 2; anchorY = -orig.height / 2; break;
          case "se": newW = orig.width + localDx; newH = orig.height + localDy; anchorX = -orig.width / 2; anchorY = -orig.height / 2; break;
          case "n": newH = orig.height - localDy; anchorX = 0; anchorY = orig.height / 2; break;
          case "s": newH = orig.height + localDy; anchorX = 0; anchorY = -orig.height / 2; break;
          case "w": newW = orig.width - localDx; anchorX = orig.width / 2; anchorY = 0; break;
          case "e": newW = orig.width + localDx; anchorX = -orig.width / 2; anchorY = 0; break;
          default: return;
        }
        newW = Math.max(20, newW);
        newH = Math.max(20, newH);
        const anchorWorldX = orig.x + orig.width / 2 + (anchorX * cos - anchorY * sin);
        const anchorWorldY = orig.y + orig.height / 2 + (anchorX * sin + anchorY * cos);
        const newAnchorLocalX = anchorX > 0 ? -newW / 2 : anchorX < 0 ? newW / 2 : 0;
        const newAnchorLocalY = anchorY > 0 ? -newH / 2 : anchorY < 0 ? newH / 2 : 0;
        const newCx = anchorWorldX - (newAnchorLocalX * cos - newAnchorLocalY * sin);
        const newCy = anchorWorldY - (newAnchorLocalX * sin + newAnchorLocalY * cos);
        updateLayer(drag.layerId, { width: newW, height: newH, x: newCx - newW / 2, y: newCy - newH / 2 });
      }
    },
    [getCanvasCoords, updateLayer],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (dragRef.current) {
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    }
    dragRef.current = null;
  }, []);

  const selBox = selectedLayer;
  const handleSize = 12;
  const rotationHandleOffset = 36;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-muted/30"
      style={{ minHeight: "320px" }}
    >
      <div
        className="relative shadow-2xl ring-1 ring-border/50"
        style={{ width: display.displayWidth, height: display.displayHeight }}
      >
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="absolute inset-0 w-full h-full bg-white"
        />
        <div
          className="absolute inset-0 touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ cursor: selBox ? "move" : "default" }}
        >
          {selBox && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${(selBox.x + selBox.width / 2) * display.scale}px`,
                top: `${(selBox.y + selBox.height / 2) * display.scale}px`,
                width: `${selBox.width * display.scale}px`,
                height: `${selBox.height * display.scale}px`,
                transform: `translate(-50%, -50%) rotate(${selBox.rotation}deg)`,
                border: "2px solid #7c3aed",
                boxShadow: "0 0 0 1px rgba(124,58,237,0.3)",
              }}
            >
              {(["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const).map((h) => {
                const pos: Record<string, React.CSSProperties> = {
                  nw: { left: `-${handleSize / 2}px`, top: `-${handleSize / 2}px`, cursor: "nwse-resize" },
                  n: { left: `calc(50% - ${handleSize / 2}px)`, top: `-${handleSize / 2}px`, cursor: "ns-resize" },
                  ne: { right: `-${handleSize / 2}px`, top: `-${handleSize / 2}px`, cursor: "nesw-resize" },
                  e: { right: `-${handleSize / 2}px`, top: `calc(50% - ${handleSize / 2}px)`, cursor: "ew-resize" },
                  se: { right: `-${handleSize / 2}px`, bottom: `-${handleSize / 2}px`, cursor: "nwse-resize" },
                  s: { left: `calc(50% - ${handleSize / 2}px)`, bottom: `-${handleSize / 2}px`, cursor: "ns-resize" },
                  sw: { left: `-${handleSize / 2}px`, bottom: `-${handleSize / 2}px`, cursor: "nesw-resize" },
                  w: { left: `-${handleSize / 2}px`, top: `calc(50% - ${handleSize / 2}px)`, cursor: "ew-resize" },
                };
                return (
                  <div
                    key={h}
                    data-handle={h}
                    className="absolute pointer-events-auto bg-white border-2 border-violet-600 rounded-sm hover:bg-violet-100"
                    style={{ width: handleSize, height: handleSize, ...pos[h] }}
                  />
                );
              })}
              <div
                data-handle="rotate"
                className="absolute pointer-events-auto bg-violet-600 border-2 border-white rounded-full hover:bg-violet-700"
                style={{
                  width: handleSize + 4,
                  height: handleSize + 4,
                  left: `calc(50% - ${(handleSize + 4) / 2}px)`,
                  top: `-${rotationHandleOffset}px`,
                  cursor: "grab",
                }}
              />
              <div
                className="absolute bg-violet-600 pointer-events-none"
                style={{
                  left: "calc(50% - 1px)",
                  top: `-${rotationHandleOffset + handleSize / 2}px`,
                  width: "2px",
                  height: `${rotationHandleOffset - handleSize / 2}px`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

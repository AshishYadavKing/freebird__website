"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Draw-to-sign pad (mouse, touch, pen). Calls onChange with a PNG data URL,
 * or null when cleared / empty.
 */
export function SignaturePad({ label, onChange }: { label: string; onChange: (png: string | null) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const c = canvas.current!;
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    c.width = c.offsetWidth * ratio;
    c.height = c.offsetHeight * ratio;
    const ctx = c.getContext("2d")!;
    ctx.scale(ratio, ratio);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0A0D14";
  }, []);

  function point(e: React.PointerEvent) {
    const r = canvas.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function down(e: React.PointerEvent) {
    e.preventDefault();
    canvas.current!.setPointerCapture(e.pointerId);
    drawing.current = true;
    const ctx = canvas.current!.getContext("2d")!;
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function move(e: React.PointerEvent) {
    if (!drawing.current) return;
    const ctx = canvas.current!.getContext("2d")!;
    const p = point(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    if (empty) setEmpty(false);
  }

  function up() {
    if (!drawing.current) return;
    drawing.current = false;
    if (!empty) onChange(canvas.current!.toDataURL("image/png"));
  }

  function clear() {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.restore();
    setEmpty(true);
    onChange(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ink-soft">{label}</span>
        <button type="button" onClick={clear} className="text-sm font-semibold text-sky hover:underline">Clear</button>
      </div>
      <canvas
        ref={canvas}
        role="img"
        aria-label={`${label} — draw your signature with a finger, pen or mouse`}
        className="h-40 w-full touch-none rounded-[var(--radius-input)] border-2 border-dashed border-line-strong bg-white"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
      />
      {empty && <p className="text-sm text-subtle">Sign inside the box.</p>}
    </div>
  );
}

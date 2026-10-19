"use client";
import { useRef, useState } from "react";

/** Ползунок на pointer events: тянется мышью и пальцем, управляется с клавиатуры. */
export function RangeSlider({ value, min, max, step, onChange, format, label }: {
  value: number; min: number; max: number; step: number; onChange: (v: number) => void; format?: (v: number) => string; label: string;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(false);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const pct = ((value - min) / (max - min)) * 100;

  const setFrom = (x: number) => {
    const r = rail.current!.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (x - r.left) / r.width));
    const v = clamp(Math.round((min + t * (max - min)) / step) * step);
    if (v !== value) onChange(v);
  };
  const onKey = (e: React.KeyboardEvent) => {
    const big = step * Math.max(1, Math.round((max - min) / step / 10));
    const map: Record<string, number> = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: big, PageDown: -big };
    if (e.key in map) { e.preventDefault(); onChange(clamp(value + map[e.key])); }
    else if (e.key === "Home") { e.preventDefault(); onChange(min); }
    else if (e.key === "End") { e.preventDefault(); onChange(max); }
  };

  return (
    <div
      className="rs" data-drag={drag || undefined} role="slider" tabIndex={0} aria-label={label}
      aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-valuetext={format ? format(value) : String(value)}
      style={{ ["--p" as string]: `${pct}%` }}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setDrag(true); setFrom(e.clientX); }}
      onPointerMove={(e) => { if (drag) setFrom(e.clientX); }}
      onPointerUp={() => setDrag(false)} onPointerCancel={() => setDrag(false)} onLostPointerCapture={() => setDrag(false)}
      onKeyDown={onKey}
    >
      <div className="rs-rail" ref={rail}>
        <div className="rs-fill" />
        <div className="rs-thumb"><span className="rs-tip">{format ? format(value) : value}</span></div>
      </div>
    </div>
  );
}

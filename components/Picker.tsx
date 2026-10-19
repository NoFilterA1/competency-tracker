"use client";
import { useEffect, useRef, useState } from "react";

export type Opt = { value: string | number; label: string };

export function Picker({ options, value, defaultValue, onChange, name, label, className = "", align = "left" }: {
  options: Opt[]; value?: string | number; defaultValue?: string | number; onChange?: (v: string) => void;
  name?: string; label?: string; className?: string; align?: "left" | "right";
}) {
  const [inner, setInner] = useState<string>(String(defaultValue ?? options[0]?.value ?? ""));
  const cur = String(value ?? inner);
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const sel = options.find((o) => String(o.value) === cur) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", off);
    return () => document.removeEventListener("mousedown", off);
  }, [open]);

  const pick = (o: Opt) => { setInner(String(o.value)); onChange?.(String(o.value)); setOpen(false); };
  const openMenu = () => { setHi(Math.max(0, options.findIndex((o) => String(o.value) === cur))); setOpen(true); };

  const key = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return openMenu();
      setHi((h) => (h + (e.key === "ArrowDown" ? 1 : options.length - 1)) % options.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open) pick(options[hi]); else openMenu();
    }
  };

  return (
    <div ref={root} className={`picker ${className}`} data-open={open || undefined}>
      {name && <input type="hidden" name={name} value={cur} />}
      <button type="button" className="picker-btn" aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={() => (open ? setOpen(false) : openMenu())} onKeyDown={key}>
        <span className="picker-label">{sel?.label}</span>
        <svg className="picker-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 4.5 6 8l3.5-3.5" /></svg>
      </button>
      {open && (
        <div className="picker-menu" role="listbox" style={align === "right" ? { right: 0, left: "auto" } : undefined}>
          {options.map((o, i) => (
            <div key={String(o.value)} role="option" aria-selected={String(o.value) === cur} className={`picker-opt${String(o.value) === cur ? " sel" : ""}${i === hi ? " hi" : ""}`} onMouseEnter={() => setHi(i)} onMouseDown={(e) => { e.preventDefault(); pick(o); }}>
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

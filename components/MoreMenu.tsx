"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const ITEMS = [
  ["/method", "Методика", "как считаются баллы и уровни"],
  ["/consent", "Согласия", "источники данных и доступ"],
  ["/catalog", "Каталог активностей", "что делать для роста"],
  ["/roi", "Окупаемость", "калькулятор для заказчика"],
  ["/presentation", "Презентация", "слайды для встречи"],
];

export function MoreMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", down); document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button className="navlink inline-flex items-center gap-1.5" onClick={() => setOpen((o) => !o)} aria-expanded={open}>Ещё<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}><path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
      {open && (
        <div className="card popin absolute right-0 top-full z-30 mt-2 w-64 space-y-0.5" style={{ padding: 8, boxShadow: "0 8px 30px rgba(0,0,0,.18)" }}>
          {ITEMS.map(([h, t, d]) => (
            <Link key={h} href={h} className="block rounded-md px-3 py-2 hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]">
              <div className="font-medium">{t}</div><div className="label">{d}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

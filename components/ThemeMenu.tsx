"use client";
import { useEffect, useRef, useState } from "react";

type Mode = "auto" | "light" | "dark";
const MODES: { key: Mode; label: string }[] = [
  { key: "auto", label: "Авто" },
  { key: "light", label: "Светлая" },
  { key: "dark", label: "Тёмная" },
];
const ACCENTS = [
  { key: "teal", label: "Бирюзовый" },
  { key: "green", label: "Лесной" },
  { key: "ocean", label: "Океан" },
  { key: "indigo", label: "Индиго" },
  { key: "violet", label: "Слива" },
  { key: "rose", label: "Ягодный" },
  { key: "amber", label: "Янтарь" },
  { key: "slate", label: "Графит" },
];

function save(k: string, v: string | null) {
  try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {}
}

export function ThemeMenu({ up = false }: { up?: boolean }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("auto");
  const [accent, setAccent] = useState("teal");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = document.documentElement.dataset;
    setMode(d.theme === "light" || d.theme === "dark" ? d.theme : "auto");
    setAccent(d.accent || "teal");
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  function pickMode(m: Mode) {
    setMode(m);
    if (m === "auto") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = m;
    save("theme", m === "auto" ? null : m);
  }
  function pickAccent(a: string) {
    setAccent(a);
    document.documentElement.dataset.accent = a;
    save("accent", a === "teal" ? null : a);
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="pill flex items-center gap-2 whitespace-nowrap" aria-haspopup="dialog" aria-expanded={open}>
        <span className="inline-block h-3 w-3" style={{ background: "var(--accent)" }} />
        Тема
      </button>
      {open && (
        <div role="dialog" aria-label="Настройки темы" className={`card popin z-30 space-y-4 ${up ? "absolute bottom-full right-0 mb-2 w-72" : "fixed inset-x-4 top-24 md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-2 md:w-72"}`} style={{ padding: 16, boxShadow: "0 8px 30px rgba(0,0,0,.18)" }}>
          <div>
            <div className="muted mb-2 text-xs font-semibold uppercase tracking-wide">Режим</div>
            <div className="grid grid-cols-3 gap-1 rounded-lg p-1" style={{ background: "var(--bg)" }}>
              {MODES.map((m) => (
                <button key={m.key} onClick={() => pickMode(m.key)} className="rounded-md py-1.5 text-sm font-medium"
                  style={mode === m.key ? { background: "var(--card)", border: "1px solid var(--line)", color: "var(--ink)" } : { border: "1px solid transparent", color: "var(--muted)" }}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="muted mb-2 text-xs font-semibold uppercase tracking-wide">Акцентный цвет</div>
            <div className="grid grid-cols-4 gap-x-2 gap-y-3">
              {ACCENTS.map((a) => (
                <button key={a.key} data-accent={a.key} title={a.label} aria-label={a.label} onClick={() => pickAccent(a.key)}
                  className="swatch h-9 w-9 justify-self-center rounded-full"
                  style={{
                    outline: accent === a.key ? "2px solid var(--ink)" : "2px solid transparent",
                    outlineOffset: 2,
                  }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

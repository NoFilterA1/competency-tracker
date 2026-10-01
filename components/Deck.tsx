"use client";
import { useEffect, useState } from "react";
import { ThemeMenu } from "./ThemeMenu";

export type Slide = { id: string; node: React.ReactNode };

export function Deck({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const n = slides.length;
  useEffect(() => {
    const h = parseInt(location.hash.slice(1), 10);
    if (h >= 1 && h <= n) setI(h - 1);
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); setI((x) => Math.min(n - 1, x + 1)); }
      if (["ArrowLeft", "PageUp"].includes(e.key)) setI((x) => Math.max(0, x - 1));
      if (e.key === "f") document.documentElement.requestFullscreen?.().catch(() => {});
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [n]);
  useEffect(() => { history.replaceState(null, "", `#${i + 1}`); }, [i]);

  async function printPdf() {
    const frames = [...document.querySelectorAll<HTMLIFrameElement>("iframe.lf-live")];
    await Promise.all(frames.map((f) => new Promise<void>((res) => {
      try { if (f.contentDocument?.readyState === "complete") return res(); } catch {}
      f.addEventListener("load", () => res(), { once: true }); setTimeout(res, 4000);
    })));
    await new Promise((r) => setTimeout(r, 900));
    const t = document.title; document.title = "Трекер компетенций — презентация";
    window.print(); document.title = t;
  }

  return (
    <div className="deck">
      <div className="stage">
        {slides.map((s, k) => (
          <section key={s.id} className={`slide ${k === i ? "on" : ""}`}>
            <div className="top">
              <span>Трекер компетенций · Команда №36 · ЮГУ</span>
              <span>{String(k + 1).padStart(2, "0")} / {n}</span>
            </div>
            <div className="content">{s.node}</div>
          </section>
        ))}
      </div>
      <div className="controls">
        <button onClick={() => setI(Math.max(0, i - 1))} aria-label="Назад">←</button>
        <span>{i + 1} / {n}</span>
        <button onClick={() => setI(Math.min(n - 1, i + 1))} aria-label="Вперёд">→</button>
        <span className="sp" />
        <button className="pdfbtn" onClick={printPdf}>Скачать PDF в текущих цветах</button>
        <ThemeMenu up />
      </div>
      <style>{`
        body > header, body > footer { display: none; }
        main { max-width: none !important; padding: 0 !important; overflow: visible !important; }
        .deck { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: color-mix(in srgb, var(--ink) 9%, var(--bg)); }
        .stage { width: min(100vw, calc((100vh - 56px) * 16 / 9)); aspect-ratio: 16 / 9; position: relative; }
        .slide { display: none; position: absolute; inset: 0; container-type: size; overflow: hidden; background: var(--bg); color: var(--ink);
          padding: 3.4cqw 5.5cqw 4.6cqw; flex-direction: column; }
        .slide.on { display: flex; }
        .top { display: flex; justify-content: space-between; font-size: 1.15cqw; color: var(--muted); padding-bottom: 1.1cqw; border-bottom: 1px solid var(--line); }
        .content { flex: 1; min-height: 0; padding-top: 3cqw; display: flex; flex-direction: column; }
        .controls { display: flex; gap: 14px; align-items: center; height: 56px; width: min(100vw, calc((100vh - 56px) * 16 / 9)); font-size: 14px; color: var(--muted); }
        .controls > button:not(.pill) { border: 1px solid var(--line); background: var(--card); color: var(--ink); border-radius: 8px; padding: 6px 14px; cursor: pointer; }
        .controls a { text-decoration: underline; text-underline-offset: 3px; }
        .controls .sp { flex: 1; }
        .controls .pdfbtn { border: 1px solid var(--line); background: var(--card); color: var(--ink); border-radius: 8px; padding: 6px 12px; cursor: pointer; }

        .d { font-family: var(--font-display), Georgia, serif; font-weight: 600; letter-spacing: -0.02em; line-height: 1.05; }
        .t1 { font-size: 7.4cqw; } .t2 { font-size: 4.6cqw; } .t3 { font-size: 3.3cqw; } .t4 { font-size: 2.5cqw; }
        .tx { font-size: 1.85cqw; line-height: 1.5; color: var(--muted); }
        .tx b { color: var(--ink); font-weight: 600; }
        .lead { font-size: 2.3cqw; line-height: 1.4; }
        .acc { color: var(--accent); }
        .big { font-family: var(--font-display), Georgia, serif; font-weight: 600; line-height: .9; color: var(--accent); }
        .row { display: grid; } .col { display: flex; flex-direction: column; }
        .rule-t { border-top: 1px solid var(--line); } .rule-l { border-left: 1px solid var(--line); }
        .fill { flex: 1; min-height: 0; }
        .foot { font-size: 1.3cqw; color: var(--muted); }
        .cta { display: inline-block; background: var(--accent); color: var(--on-accent) !important; font-weight: 600; font-size: 1.7cqw; padding: .9cqw 1.8cqw; border-radius: .6cqw; text-decoration: none; }
        table.t { width: 100%; border-collapse: collapse; font-size: 2cqw; }
        table.t th { text-align: left; font-weight: 500; color: var(--muted); padding: 0 1.4cqw 1cqw 0; font-size: 1.4cqw; }
        table.t td { padding: 1.7cqw 1.4cqw 1.7cqw 0; border-top: 1px solid var(--line); vertical-align: top; line-height: 1.35; }
        table.t td:first-child { font-weight: 600; white-space: nowrap; }
        table.t td:last-child { color: var(--accent); font-weight: 500; }

        .lf { position: relative; width: 100%; border: 1px solid var(--line); border-radius: .8cqw; overflow: hidden; background: var(--card); }
        .lf-live { position: absolute; left: 0; top: 0; border: 0; transform-origin: 0 0; background: var(--bg); }
        .lf-shot { display: none; position: absolute; inset: 0; width: 100%; height: 100%; }

        @media print {
          @page { size: 1280px 720px; margin: 0; }
          html, body { background: var(--bg) !important; }
          .controls { display: none !important; }
          .deck { display: block; min-height: 0; background: none; }
          .stage { width: 1280px; aspect-ratio: auto; position: static; }
          .slide { display: flex !important; position: relative; width: 1280px; height: 720px; page-break-after: always; break-after: page; }
          .slide:last-child { page-break-after: auto; break-after: auto; }
          .lf { width: var(--pw) !important; }
          .lf-live { transform: scale(var(--ps)) !important; }
        }
      `}</style>
    </div>
  );
}

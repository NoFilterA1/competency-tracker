"use client";
import { useState } from "react";
import { COMPETENCIES } from "@/lib/config";
import { dateIn, type CatItem } from "@/lib/catalog";
import { Picto } from "./Pictos";
import { useIndicator } from "./useIndicator";
import { slide } from "@/lib/slide";

const ORDER = ["", ...COMPETENCIES.map((c) => c.key)];

export function CatalogBrowser({ items, initial }: { items: CatItem[]; initial: string }) {
  const [c, setC] = useState(ORDER.includes(initial) ? initial : "");
  const [enter, setEnter] = useState<"forward" | "back" | null>(null);
  const hasVT = typeof document !== "undefined" && "startViewTransition" in document;
  const ref = useIndicator<HTMLDivElement>('[aria-pressed="true"]', c);
  const list = items.filter((x) => !c || x.comp === c).sort((a, b) => a.inDays - b.inDays);
  const pick = (k: string) => {
    if (k === c) return;
    slide(() => setC(k), ORDER.indexOf(k) > ORDER.indexOf(c), setEnter);
  };
  return (
    <>
      <div ref={ref} className="ind ind-pill flex flex-wrap gap-2">
        <button className="pill" aria-pressed={c === ""} onClick={() => pick("")}>Все</button>
        {COMPETENCIES.map((k) => (
          <button key={k.key} className="pill flex items-center gap-1.5" aria-pressed={c === k.key} onClick={() => pick(k.key)}>
            <Picto k={k.key} size={14} />{k.short}
          </button>
        ))}
      </div>
      <div style={{ viewTransitionName: "browse" }} key={!hasVT ? `${c}` : "vt"} className={!hasVT && enter ? `enter-${enter}` : undefined}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((x, i) => {
            const comp = COMPETENCIES.find((k) => k.key === x.comp)!;
            return (
              <div key={x.id} className="card lift rise flex flex-col" style={{ ["--i" as string]: i % 6 }}>
                <div className="flex items-center justify-between gap-2 text-sm"><span className="flex items-center gap-1.5" style={{ color: "var(--accent)" }}><Picto k={x.comp} size={18} />{comp.name}</span><span className="display text-2xl" style={{ color: "var(--accent)" }}>+{x.points}</span></div>
                <div className="mt-3 font-semibold leading-snug">{x.title}</div>
                <div className="label mt-auto pt-4">{x.kind} · {x.source} · {x.place}</div>
                <div className="label">{dateIn(x.inDays)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

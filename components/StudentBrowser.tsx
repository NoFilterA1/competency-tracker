"use client";
import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { slide } from "@/lib/slide";
import { Picker } from "./Picker";
import { useIndicator } from "./useIndicator";
import { MiniRadar } from "./MiniRadar";
import { Num } from "./Num";
import { DirIcon } from "./DirIcon";
import { Avatar } from "./Avatar";
import { COMPETENCIES, DIRECTIONS } from "@/lib/config";

export type SRow = { id: number; name: string; grp: string; dir: string; level: number; levelName: string; avg: number; floats: number[]; levels: number[]; pts: number[]; growth: number; streak: number; alerts: number };
type View = "dir" | "heat" | "board";
type Sort = "level" | "growth" | "streak" | "name";

const SORTS: [Sort, string][] = [["level", "По уровню"], ["growth", "По росту за 30 дней"], ["streak", "По серии"], ["name", "По алфавиту"]];

const dirName = (k: string) => DIRECTIONS.find((d) => d.key === k)?.name ?? "";
const DIR_ORDER = ["all", ...DIRECTIONS.map((d) => d.key)];
const VIEW_ORDER: View[] = ["dir", "heat", "board"];

const cmp = (s: Sort) => (a: SRow, b: SRow) => s === "name" ? a.name.localeCompare(b.name, "ru") : s === "growth" ? b.growth - a.growth : s === "streak" ? b.streak - a.streak : b.avg - a.avg;

const Icon = ({ k }: { k: View }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
    {k === "dir" && <><rect x="1.5" y="2" width="5.5" height="5" rx="1" /><rect x="9" y="2" width="5.5" height="5" rx="1" /><rect x="1.5" y="9" width="5.5" height="5" rx="1" /><rect x="9" y="9" width="5.5" height="5" rx="1" /></>}
    {k === "heat" && <><rect x="1.5" y="1.5" width="3.2" height="3.2" /><rect x="6.4" y="1.5" width="3.2" height="3.2" /><rect x="11.3" y="1.5" width="3.2" height="3.2" /><rect x="1.5" y="6.4" width="3.2" height="3.2" /><rect x="6.4" y="6.4" width="3.2" height="3.2" /><rect x="11.3" y="6.4" width="3.2" height="3.2" /><rect x="1.5" y="11.3" width="3.2" height="3.2" /><rect x="6.4" y="11.3" width="3.2" height="3.2" /><rect x="11.3" y="11.3" width="3.2" height="3.2" /></>}
    {k === "board" && <><rect x="1.5" y="2" width="3.4" height="12" rx="1" /><rect x="6.3" y="2" width="3.4" height="8" rx="1" /><rect x="11.1" y="2" width="3.4" height="10" rx="1" /></>}
  </svg>
);

export function StudentBrowser({ rows }: { rows: SRow[] }) {
  const [view, setView] = useState<View>("dir");
  const [q, setQ] = useState("");
  const [dir, setDir] = useState("all");
  const [sort, setSort] = useState<Sort>("level");
  const [heatKey, setHeatKey] = useState<string>("avg");

  useEffect(() => { try { const q = new URLSearchParams(location.search).get("v"); const v = q || localStorage.getItem("view"); if (v === "dir" || v === "heat" || v === "board") setView(v); } catch {} }, []);
  const [enter, setEnter] = useState<"forward" | "back" | null>(null);
  const hasVT = typeof document !== "undefined" && "startViewTransition" in document;
  const pick = (v: View) => {
    if (v === view) return;
    slide(() => setView(v), VIEW_ORDER.indexOf(v) > VIEW_ORDER.indexOf(view), setEnter);
    try { localStorage.setItem("view", v); } catch {}
  };
  const pickDir = (k: string) => {
    if (k === dir) return;
    slide(() => setDir(k), DIR_ORDER.indexOf(k) > DIR_ORDER.indexOf(dir), setEnter);
  };

  const segRef = useIndicator<HTMLDivElement>('[aria-pressed="true"]', view);
  const pillRef = useIndicator<HTMLDivElement>('[aria-pressed="true"]', dir);
  const [lanes, setLanes] = useState(false);
  const flip = useRef(false);
  const rects = useRef(new Map<string, DOMRect>());
  useLayoutEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>("[data-flip]")];
    const next = new Map<string, DOMRect>();
    els.forEach((el) => {
      const id = el.dataset.flip!, r = el.getBoundingClientRect(), o = rects.current.get(id);
      next.set(id, r);
      if (flip.current && o && (o.left !== r.left || o.top !== r.top)) {
        el.animate([{ transform: `translate(${o.left - r.left}px, ${o.top - r.top}px)` }, { transform: "none" }], { duration: 380, easing: "cubic-bezier(.2,.8,.2,1)" });
      }
    });
    rects.current = next;
    flip.current = false;
  });

  const filtered = useMemo(() => rows.filter((r) => (dir === "all" || r.dir === dir) && (!q.trim() || r.name.toLowerCase().includes(q.trim().toLowerCase()))), [rows, dir, q]);
  const counts = useMemo(() => { const m: Record<string, number> = { all: rows.length }; rows.forEach((r) => (m[r.dir] = (m[r.dir] ?? 0) + 1)); return m; }, [rows]);

  const sections = DIRECTIONS.map((d) => {
    const list = filtered.filter((r) => r.dir === d.key).sort(cmp(sort));
    return { d, list, avg: list.length ? list.reduce((a, r) => a + r.avg, 0) / list.length : 0, growth: list.reduce((a, r) => a + r.growth, 0) };
  }).filter((s) => s.list.length).sort((a, b) => b.avg - a.avg);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="display text-4xl sm:text-5xl">Студенты</h1>
          <p className="muted mt-3 text-[1.05rem] leading-relaxed">Профили собираются из цифрового следа. Студенты сгруппированы по направлениям подготовки.</p>
        </div>
        <div ref={segRef} className="seg seg-fit ind" role="group" aria-label="Вид">
          {([["dir", "Направления"], ["heat", "Теплокарта"], ["board", "Статусы"]] as [View, string][]).map(([k, t]) => (
            <button key={k} aria-pressed={view === k} onClick={() => pick(k)}><Icon k={k} /><span>{t}</span></button>
          ))}
        </div>
      </div>

      <div className="card space-y-3" style={{ padding: 12 }}>
        <div className="flex flex-wrap items-center gap-3">
          <label className="search-wrap relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" aria-hidden><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" /></svg>
            <input value={q} onChange={(e) => { flip.current = true; setQ(e.target.value); }} placeholder="Найти студента" className="input" style={{ paddingLeft: 36 }} aria-label="Поиск по имени" />
          </label>
          <div className="ml-auto flex items-center gap-3">
            <span className="muted text-sm">Показано {filtered.length} из {rows.length}</span>
            {view === "dir" && (
              <Picker className="min-w-[13rem]" align="right" label="Сортировка" value={sort} onChange={(v) => setSort(v as Sort)} options={SORTS.map(([k, t]) => ({ value: k, label: t }))} />
            )}
            {view === "board" && (
              <div className="seg" role="group" aria-label="Раскладка статусов">
                <button aria-pressed={!lanes} onClick={() => setLanes(false)} title="Колонками" aria-label="Колонками"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="3.2" height="12" rx="1" /><rect x="6.4" y="2" width="3.2" height="12" rx="1" /><rect x="10.8" y="2" width="3.2" height="12" rx="1" /></svg></button>
                <button aria-pressed={lanes} onClick={() => setLanes(true)} title="Рядами" aria-label="Рядами"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="3.2" rx="1" /><rect x="2" y="6.4" width="12" height="3.2" rx="1" /><rect x="2" y="10.8" width="12" height="3.2" rx="1" /></svg></button>
              </div>
            )}
          </div>
        </div>
        <div ref={pillRef} className="ind ind-pill no-sb flex flex-wrap gap-1.5 max-sm:-mx-3 max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:px-3">
          {[{ key: "all", name: "Все" }, ...DIRECTIONS].map((d) => (
            <button key={d.key} onClick={() => pickDir(d.key)} className="pill" aria-pressed={dir === d.key}>
              {d.name} <span className="muted">{counts[d.key] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ viewTransitionName: "browse" }} className={`space-y-6${!hasVT && enter ? ` enter-${enter}` : ""}`} key={!hasVT ? `${dir}-${view}` : "vt"}>
      {filtered.length === 0 && <div className="card muted text-center">Никого не найдено. Измените запрос или направление.</div>}

      {view === "dir" && (
        <div className="grid items-start gap-5 lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))] [grid-auto-flow:dense]" style={{ ["--cols" as string]: Math.min(3, sections.reduce((a, x) => a + (x.list.length >= 5 ? 3 : x.list.length >= 3 ? 2 : 1), 0)) }}>
          {sections.map(({ d, list, avg, growth }) => {
            const span = list.length >= 5 ? 3 : list.length >= 3 ? 2 : 1;
            return (
              <section key={d.key} className={`dirsec grid gap-3 ${span === 3 ? "lg:col-span-3" : span === 2 ? "lg:col-span-2" : ""}`}>
                <div className="card rise flex flex-wrap items-center gap-x-8 gap-y-3" style={{ background: "color-mix(in srgb, var(--accent) 6%, var(--card))", padding: "12px 16px" }}>
                  <div className="flex items-center gap-3">
                    <DirIcon k={d.key} />
                    <div>
                      <div className="label">{d.faculty}</div>
                      <h2 className="display text-2xl leading-tight">{d.name}</h2>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div><div className="label">студентов</div><div className="display text-2xl"><Num value={list.length} /></div></div>
                    <div><div className="label">ср. уровень</div><div className="display text-2xl" style={{ color: "var(--accent)" }}>{avg.toFixed(1).replace(".", ",")}</div></div>
                    <div><div className="label">за 30 дней</div><div className="display text-2xl">+<Num value={growth} /></div></div>
                  </div>
                  <div className="min-w-[140px] flex-1 max-sm:basis-full" title={`Средний уровень ${avg.toFixed(1)} из 5`}>
                    <div className="label mb-1.5 flex justify-between"><span>уровень группы</span><span>{avg.toFixed(1).replace(".", ",")} / 5</span></div>
                    <div className="lvlbar">{[1, 2, 3, 4, 5].map((l) => <i key={l} className={avg >= l - 0.5 ? "on" : ""} style={{ ["--fill" as string]: Math.max(0, Math.min(1, avg - (l - 1))) }} />)}</div>
                  </div>
                </div>
                <div className={`grid content-start gap-3 ${span === 3 ? "sm:grid-cols-2 xl:grid-cols-3" : span === 2 ? "sm:grid-cols-2" : ""}`}>
                  {list.map((s, i) => (
                    <Link key={s.id} data-flip={s.id} href={`/student/${s.id}`} className="card lift rise flex items-center gap-3" style={{ padding: 12, ["--i" as string]: i }}>
                      <MiniRadar values={s.floats} size={78} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2"><Avatar name={s.name} size={26} /><div className="truncate font-semibold leading-tight">{s.name}</div></div>
                        <div className="label">{s.grp}{s.alerts ? ` · просадок ${s.alerts}` : ""}</div>
                        <div className="mt-1.5 flex items-baseline gap-2">
                          <span className="display lvl text-3xl leading-none" style={{ color: "var(--accent)" }}>{s.level}</span>
                          <span className="text-sm">{s.levelName}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs">
                          <span style={{ color: s.growth > 0 ? "var(--accent)" : "var(--muted)" }}>+{s.growth}</span>
                          <span className="muted">{s.streak > 0 ? `серия ${s.streak} нед.` : "нет серии"}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {view === "heat" && filtered.length > 0 && (() => {
        const idx = COMPETENCIES.findIndex((c) => c.key === heatKey);
        const list = [...filtered].sort((a, b) => idx < 0 ? b.avg - a.avg : b.floats[idx] - a.floats[idx]);
        return (
          <div className="card rise" style={{ padding: 0, overflow: "hidden" }}>
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--line)" }}>
              <span className="muted text-sm">Нажмите на название компетенции, чтобы отсортировать по ней</span>
              <span className="flex items-center gap-2 text-xs muted">ниже
                {[1, 2, 3, 4, 5].map((l) => <i key={l} className="heatkey" style={{ background: `color-mix(in srgb, var(--accent) ${Math.round((l / 5) * 92)}%, var(--card))`, color: l > 3 ? "var(--on-accent)" : "var(--ink)" }}>{l}</i>)}
                выше</span>
            </div>
            <div className="overflow-x-auto">
              <table className="heat text-sm">
                <thead>
                  <tr>
                    <th className="heat-name px-4 py-3 text-left font-medium"><button onClick={() => setHeatKey("avg")} style={{ color: heatKey === "avg" ? "var(--accent)" : "var(--muted)" }}>Студент</button></th>
                    {COMPETENCIES.map((c) => (
                      <th key={c.key} className="px-0.5 py-3 text-center text-xs font-medium"><button onClick={() => setHeatKey(c.key)} style={{ color: heatKey === c.key ? "var(--accent)" : "var(--muted)" }}>{c.short}{heatKey === c.key ? " ↓" : ""}</button></th>
                    ))}
                    <th className="heat-avg px-3 py-3 text-center text-xs font-medium muted">Ср.</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((s) => (
                    <tr key={s.id} className="hrow">
                      <td className="px-4 py-1">
                        <Link href={`/student/${s.id}`} className="flex items-center gap-2.5">
                          <Avatar name={s.name} size={32} />
                          <span className="leading-tight"><span className="block whitespace-nowrap font-medium">{s.name}</span><span className="label">{s.grp}</span></span>
                        </Link>
                      </td>
                      {s.floats.map((f, i) => (
                        <td key={i} className="px-[3px] py-[3px]">
                          <div className="cell" title={`${COMPETENCIES[i].name}: ${s.pts[i]} баллов`}
                            style={{ background: `color-mix(in srgb, var(--accent) ${Math.round((f / 5) * 92)}%, var(--card))`, color: f > 3 ? "var(--on-accent)" : "var(--ink)" }}>{s.levels[i]}</div>
                        </td>
                      ))}
                      <td className="px-3"><div className="text-center text-xs font-semibold">{s.avg.toFixed(1)}</div><div className="bar mt-1" style={{ width: 44, margin: "4px auto 0" }}><i style={{ width: `${(s.avg / 5) * 100}%` }} /></div></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ borderTop: "1px solid var(--line)" }}>Среднее по выборке</td>
                    {COMPETENCIES.map((c, i) => <td key={c.key} className="py-3 text-center text-xs font-semibold" style={{ borderTop: "1px solid var(--line)" }}>{(list.reduce((a, s) => a + s.floats[i], 0) / list.length).toFixed(1)}</td>)}
                    <td style={{ borderTop: "1px solid var(--line)" }} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      })()}

      {view === "board" && filtered.length > 0 && (() => {
        const status = (r: SRow) => r.growth === 0 ? "idle" : (r.alerts >= 2 || r.avg < 1.8) ? "support" : r.growth >= 200 ? "rising" : "steady";
        const cols = [
          { key: "rising", title: "Растут", note: "от 200 баллов за 30 дней", color: "var(--accent)" },
          { key: "steady", title: "Стабильно", note: "есть активность, тревожных сигналов нет", color: "oklch(from var(--accent) clamp(.55, l, .8) max(c, .12) calc(h + 110))" },
          { key: "support", title: "Нужна поддержка", note: "низкий уровень или 2 и более просадки", color: "oklch(from var(--accent) clamp(.55, l, .8) max(c, .12) calc(h + 200))" },
          { key: "idle", title: "Нет активности", note: "ни одной записи за 30 дней", color: "var(--muted)" },
        ];
        const lists = cols.map((c) => filtered.filter((r) => status(r) === c.key).sort((a, b) => b.growth - a.growth || b.avg - a.avg));
        const spanOf = (n: number) => (n >= 9 ? 3 : n >= 4 ? 2 : 1);
        const laneCols = Math.min(3, lists.reduce((a, l) => a + spanOf(l.length), 0));
        return (
          <div className={lanes ? "grid items-start gap-5 lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))] [grid-auto-flow:dense]" : "grid gap-4 md:grid-cols-2 xl:grid-cols-4"} style={lanes ? { ["--cols" as string]: laneCols } : undefined}>
            {cols.map((c, ci) => {
              const list = lists[ci];
              const span = spanOf(list.length);
              return (
                <section key={c.key} className={`rise ${lanes ? (span === 3 ? "lg:col-span-3" : span === 2 ? "lg:col-span-2" : "") : ""}`} style={{ ["--i" as string]: ci * 2 }}>
                  <div className="card" style={{ padding: "12px 14px", borderTop: `3px solid ${c.color}` }}>
                    <div className="flex items-baseline justify-between"><h2 className="display text-xl">{c.title}</h2><span className="display text-2xl" style={{ color: c.color }}>{list.length}</span></div>
                    <div className="label mt-0.5">{c.note}</div>
                  </div>
                  <div className={lanes ? `mt-3 grid content-start gap-2 ${span === 3 ? "sm:grid-cols-2 xl:grid-cols-3" : span === 2 ? "sm:grid-cols-2" : ""}` : "mt-3 grid gap-2"}>
                    {list.length === 0 && <div className="label px-1">Никого</div>}
                    {list.map((r, i) => (
                      <Link key={r.id} href={`/student/${r.id}`} data-flip={r.id} className="card lift rise flex items-center gap-3" style={{ padding: "9px 12px", ["--i" as string]: ci * 2 + i, ["--hc" as string]: c.color }}>
                        <Avatar name={r.name} size={34} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold leading-tight">{r.name}</span>
                          <span className="label block">{dirName(r.dir)}{r.alerts ? ` · просадок ${r.alerts}` : ""}</span>
                        </span>
                        <span className="text-right leading-tight"><span className="block text-xs font-semibold" style={{ color: c.color }}>+{r.growth}</span><span className="display lvl block text-lg leading-none" style={{ color: c.color }}>{r.level}</span></span>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        );
      })()}
      </div>
    </div>
  );
}

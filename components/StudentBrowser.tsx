"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MiniRadar } from "./MiniRadar";
import { Num } from "./Num";
import { COMPETENCIES, DIRECTIONS } from "@/lib/config";

export type SRow = { id: number; name: string; grp: string; dir: string; level: number; levelName: string; avg: number; floats: number[]; levels: number[]; pts: number[]; growth: number; streak: number; alerts: number };
type View = "dir" | "heat" | "board";
type Sort = "level" | "growth" | "streak" | "name";

const SORTS: [Sort, string][] = [["level", "По уровню"], ["growth", "По росту за 30 дней"], ["streak", "По серии"], ["name", "По алфавиту"]];

const dirName = (k: string) => DIRECTIONS.find((d) => d.key === k)?.name ?? "";
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
  const pick = (v: View) => { setView(v); try { localStorage.setItem("view", v); } catch {} };

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
        <div className="seg" role="group" aria-label="Вид">
          {([["dir", "Направления"], ["heat", "Теплокарта"], ["board", "Статусы"]] as [View, string][]).map(([k, t]) => (
            <button key={k} aria-pressed={view === k} onClick={() => pick(k)}><Icon k={k} /><span>{t}</span></button>
          ))}
        </div>
      </div>

      <div className="card flex flex-wrap items-center gap-3" style={{ padding: 12 }}>
        <label className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" aria-hidden><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Найти студента" className="input" style={{ paddingLeft: 36 }} aria-label="Поиск по имени" />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {[{ key: "all", name: "Все" }, ...DIRECTIONS].map((d) => (
            <button key={d.key} onClick={() => setDir(d.key)} className="pill" style={dir === d.key ? { borderColor: "var(--accent)", color: "var(--accent)", background: "color-mix(in srgb, var(--accent) 10%, transparent)" } : undefined}>
              {d.name} <span className="muted">{counts[d.key] ?? 0}</span>
            </button>
          ))}
        </div>
        {view === "dir" && (
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="input ml-auto !w-auto" aria-label="Сортировка">
            {SORTS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
          </select>
        )}
      </div>

      {filtered.length === 0 && <div className="card muted text-center">Никого не найдено. Измените запрос или направление.</div>}

      {view === "dir" && sections.map(({ d, list, avg, growth }) => (
        <section key={d.key} className="dirsec grid gap-4 lg:grid-cols-[250px_1fr]">
          <aside className="card rise flex flex-col justify-between" style={{ background: "color-mix(in srgb, var(--accent) 6%, var(--card))" }}>
            <div>
              <div className="label">{d.faculty}</div>
              <h2 className="display mt-1 text-2xl leading-tight">{d.name}</h2>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-3">
              <div><div className="label">студентов</div><div className="display text-3xl"><Num value={list.length} /></div></div>
              <div><div className="label">средний уровень</div><div className="display text-3xl" style={{ color: "var(--accent)" }}>{avg.toFixed(1).replace(".", ",")}</div><div className="bar mt-1.5"><i style={{ width: `${(avg / 5) * 100}%` }} /></div></div>
              <div><div className="label">баллов за 30 дней</div><div className="display text-3xl">+<Num value={growth} /></div></div>
            </div>
          </aside>
          <div className="grid content-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((s, i) => (
              <Link key={s.id} href={`/student/${s.id}`} className="card lift rise flex items-center gap-3" style={{ padding: 12, ["--i" as string]: i }}>
                <MiniRadar values={s.floats} size={78} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold leading-tight">{s.name}</div>
                  <div className="label">{s.grp}{s.alerts ? ` · просадок ${s.alerts}` : ""}</div>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="display lvl text-3xl leading-none" style={{ color: "var(--accent)" }}>{s.level}</span>
                    <span className="text-sm">{s.levelName}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span style={{ color: s.growth > 0 ? "var(--good)" : "var(--muted)" }}>+{s.growth}</span>
                    <span className="muted">{s.streak > 0 ? `серия ${s.streak} нед.` : "нет серии"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {view === "heat" && filtered.length > 0 && (() => {
        const idx = COMPETENCIES.findIndex((c) => c.key === heatKey);
        const list = [...filtered].sort((a, b) => idx < 0 ? b.avg - a.avg : b.floats[idx] - a.floats[idx]);
        return (
          <div className="card rise" style={{ padding: 0, overflow: "hidden" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: 760 }}>
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left font-medium"><button onClick={() => setHeatKey("avg")} style={{ color: heatKey === "avg" ? "var(--accent)" : "var(--muted)" }}>Студент</button></th>
                    {COMPETENCIES.map((c) => (
                      <th key={c.key} className="px-1 py-3 text-center text-xs font-medium"><button onClick={() => setHeatKey(c.key)} style={{ color: heatKey === c.key ? "var(--accent)" : "var(--muted)" }}>{c.short}{heatKey === c.key ? " ↓" : ""}</button></th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.map((s) => (
                    <tr key={s.id}>
                      <td className="whitespace-nowrap px-4 py-1"><Link href={`/student/${s.id}`} className="font-medium">{s.name}</Link> <span className="label">{s.grp}</span></td>
                      {s.floats.map((f, i) => (
                        <td key={i} className="px-0.5 py-0.5">
                          <div className="cell rounded-md py-1.5 text-center text-xs font-semibold" title={`${COMPETENCIES[i].name}: ${s.pts[i]} баллов`}
                            style={{ background: `color-mix(in srgb, var(--accent) ${Math.round((f / 5) * 92)}%, var(--card))`, color: f > 3 ? "var(--on-accent)" : "var(--ink)" }}>{s.levels[i]}</div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ borderTop: "1px solid var(--line)" }}>Среднее</td>
                    {COMPETENCIES.map((c, i) => <td key={c.key} className="py-3 text-center text-xs font-semibold" style={{ borderTop: "1px solid var(--line)" }}>{(list.reduce((a, s) => a + s.floats[i], 0) / list.length).toFixed(1)}</td>)}
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
          { key: "rising", title: "Растут", note: "от 200 баллов за 30 дней", color: "var(--good)" },
          { key: "steady", title: "Стабильно", note: "есть активность, тревожных сигналов нет", color: "var(--accent)" },
          { key: "support", title: "Нужна поддержка", note: "низкий уровень или 2 и более просадки", color: "var(--warn)" },
          { key: "idle", title: "Нет активности", note: "ни одной записи за 30 дней", color: "var(--muted)" },
        ];
        return (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cols.map((c, ci) => {
              const list = filtered.filter((r) => status(r) === c.key).sort((a, b) => b.growth - a.growth || b.avg - a.avg);
              return (
                <section key={c.key} className="rise" style={{ ["--i" as string]: ci * 2 }}>
                  <div className="card" style={{ padding: "12px 14px", borderTop: `3px solid ${c.color}` }}>
                    <div className="flex items-baseline justify-between"><h2 className="display text-xl">{c.title}</h2><span className="display text-2xl" style={{ color: c.color }}>{list.length}</span></div>
                    <div className="label mt-0.5">{c.note}</div>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {list.length === 0 && <div className="label px-1">Никого</div>}
                    {list.map((r, i) => (
                      <Link key={r.id} href={`/student/${r.id}`} className="card lift rise flex items-center gap-3" style={{ padding: "9px 12px", ["--i" as string]: ci * 2 + i }}>
                        <span className="display lvl w-6 text-center text-2xl leading-none" style={{ color: c.color }}>{r.level}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold leading-tight">{r.name}</span>
                          <span className="label block">{dirName(r.dir)}{r.alerts ? ` · просадок ${r.alerts}` : ""}</span>
                        </span>
                        <span className="text-xs font-semibold" style={{ color: r.growth > 0 ? "var(--good)" : "var(--muted)" }}>+{r.growth}</span>
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
  );
}

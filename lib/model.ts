import { db } from "./db";
import { COMPETENCIES, COMP_KEYS, LEVEL_MIN, LEVEL_NAMES, SOURCES } from "./config";
import { scoreAnswers } from "./survey";

export type Student = { id: number; name: string; grp: string };
export type Row = { student_id: number; date: string; source: string; title: string; competency: string; points: number };

export function levelOf(pts: number) {
  let level = 1;
  for (let i = 0; i < LEVEL_MIN.length; i++) if (pts >= LEVEL_MIN[i]) level = i + 1;
  const min = LEVEL_MIN[level - 1];
  const next = level < 5 ? LEVEL_MIN[level] : null;
  const pct = next ? (pts - min) / (next - min) : 1;
  const float = level < 5 ? level - 1 + pct : Math.min(5, 4 + (pts - 600) / 400);
  return { level, name: LEVEL_NAMES[level - 1], min, next, pct, float };
}

const DAY = 864e5;
const dayNum = (d: Date) => Math.floor(d.getTime() / DAY);
const weekOf = (d: Date) => Math.floor((dayNum(d) + 3) / 7);
const toDate = (s: string) => new Date(s + "T00:00:00Z");

export type Stats = ReturnType<typeof computeStats>;

export function computeStats(s: Student, rows: Row[]) {
  const now = new Date();
  const nowIso = now.toISOString().slice(0, 10);
  const pts: Record<string, number> = {};
  const last: Record<string, string> = {};
  const g30: Record<string, number> = {};
  COMP_KEYS.forEach((k) => { pts[k] = 0; g30[k] = 0; });
  const weeks = new Set<number>();
  const perDay: Record<string, number> = {};
  const sources = new Set<string>();
  let growth30 = 0;
  for (const r of rows) {
    pts[r.competency] = (pts[r.competency] ?? 0) + r.points;
    if (!last[r.competency] || r.date > last[r.competency]) last[r.competency] = r.date;
    const dt = toDate(r.date);
    weeks.add(weekOf(dt));
    perDay[r.date] = (perDay[r.date] ?? 0) + 1;
    sources.add(r.source);
    if (now.getTime() - dt.getTime() <= 30 * DAY) { growth30 += r.points; g30[r.competency] += r.points; }
  }
  const comps = COMPETENCIES.map((c) => { const lv = levelOf(pts[c.key]); return { ...lv, levelName: lv.name, key: c.key, name: c.name, short: c.short, pts: pts[c.key], last: last[c.key] ?? null, g30: g30[c.key] }; });
  const total = comps.reduce((a, c) => a + c.pts, 0);
  const avgFloat = comps.reduce((a, c) => a + c.float, 0) / comps.length;
  const overall = levelOf(total / comps.length);

  let cur = weekOf(now);
  if (!weeks.has(cur)) cur--;
  let streak = 0;
  while (weeks.has(cur)) { streak++; cur--; }

  const alerts = comps.filter((c) => !c.last || (now.getTime() - toDate(c.last).getTime()) / DAY > 90)
    .map((c) => ({ key: c.key, name: c.name, days: c.last ? Math.floor((now.getTime() - toDate(c.last).getTime()) / DAY) : null }));

  const monthly: { label: string; value: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const endIso = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())).toISOString().slice(0, 10);
    const value = rows.filter((r) => r.date <= endIso).reduce((a, r) => a + r.points, 0);
    monthly.push({ label: `${String(end.getMonth() + 1).padStart(2, "0")}.${String(end.getFullYear()).slice(2)}`, value });
  }

  const heat: { date: string; count: number; future: boolean }[][] = [];
  const cw = weekOf(now);
  for (let w = cw - 25; w <= cw; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date((w * 7 - 3 + d) * DAY).toISOString().slice(0, 10);
      col.push({ date, count: perDay[date] ?? 0, future: date > nowIso });
    }
    heat.push(col);
  }

  const badges: { icon: string; title: string; hint: string }[] = [];
  if (streak >= 4) badges.push({ icon: "🔥", title: `Серия ${streak} нед.`, hint: "Активность каждую неделю подряд" });
  if (growth30 >= 150) badges.push({ icon: "🚀", title: "Рост месяца", hint: `+${growth30} баллов за 30 дней` });
  const top = [...comps].sort((a, b) => b.pts - a.pts)[0];
  if (top.level >= 4) badges.push({ icon: "🏅", title: `Эксперт: ${top.short}`, hint: "Уровень 4+ в компетенции" });
  if (comps.every((c) => c.level >= 2)) badges.push({ icon: "🧩", title: "Универсал", hint: "Все компетенции не ниже уровня 2" });
  const team = comps.find((c) => c.key === "teamwork")!;
  if (team.level >= 3) badges.push({ icon: "🤝", title: "Командный игрок", hint: "Командная работа — уровень 3+" });
  if (sources.size >= 5) badges.push({ icon: "🌐", title: "Широкий след", hint: `${sources.size} источников данных` });

  return { student: s, comps, total, avgFloat, overall, streak, alerts, monthly, heat, badges, growth30, sources: sources.size, count: rows.length };
}

export function getWeights(): Record<string, number> {
  const base: Record<string, number> = {};
  SOURCES.forEach((x) => (base[x] = 1));
  const r = db().prepare("select value from settings where key = 'source_weights'").get() as unknown as { value: string } | undefined;
  if (r) try { Object.assign(base, JSON.parse(r.value)); } catch {}
  return base;
}

export function getAll() {
  const d = db();
  const students = d.prepare("select id, name, grp from students order by id").all() as unknown as Student[];
  const rows = d.prepare("select student_id, date, source, title, competency, points from activities order by date desc, id desc").all() as unknown as Row[];
  const weights = getWeights();
  const off = new Map<number, Set<string>>();
  (d.prepare("select student_id, source from consents where enabled = 0").all() as unknown as { student_id: number; source: string }[])
    .forEach((c) => { const x = off.get(c.student_id) ?? new Set<string>(); x.add(c.source); off.set(c.student_id, x); });
  const by = new Map<number, Row[]>();
  rows.forEach((r) => {
    if (off.get(r.student_id)?.has(r.source)) return; // source switched off by the student
    const a = by.get(r.student_id) ?? [];
    a.push({ ...r, points: Math.round(r.points * (weights[r.source] ?? 1)) });
    by.set(r.student_id, a);
  });
  const stats = students.map((s) => computeStats(s, by.get(s.id) ?? []));
  return { stats, rowsBy: by, weights, off };
}

export function groupAvg(stats: Stats[]) {
  return COMPETENCIES.map((c, i) => stats.length ? stats.reduce((a, s) => a + s.comps[i].float, 0) / stats.length : 0);
}

export function getSurveyAgg(stats: Stats[]) {
  const rows = db().prepare("select student_id, answers from survey_results where student_id is not null order by id").all() as unknown as { student_id: number; answers: string }[];
  const latest = new Map<number, number[]>();
  rows.forEach((r) => latest.set(r.student_id, JSON.parse(r.answers)));
  const comps = COMPETENCIES.map((c, i) => {
    let self = 0, trace = 0, k = 0;
    latest.forEach((ans, sid) => {
      const st = stats.find((x) => x.student.id === sid);
      if (!st) return;
      self += scoreAnswers(ans)[i].float; trace += st.comps[i].float; k++;
    });
    return { key: c.key, name: c.name, self: k ? self / k : 0, trace: k ? trace / k : 0 };
  });
  return { n: latest.size, comps };
}

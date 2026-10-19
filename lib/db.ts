import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { COMP_KEYS, GROUPS, NAMES, TEMPLATES } from "./config";

const SEED_V = "4";
const g = globalThis as unknown as { __db?: DatabaseSync; __rolled?: string };

export function db(): DatabaseSync {
  if (g.__db) {
    if (g.__rolled !== iso(new Date())) rollDemo(g.__db);
    return g.__db;
  }
  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  const d = new DatabaseSync(path.join(dir, "app.db"));
  d.exec(`
    create table if not exists students (
      id integer primary key, name text not null, grp text not null
    );
    create table if not exists activities (
      id integer primary key autoincrement,
      student_id integer not null references students(id),
      date text not null, source text not null, title text not null,
      competency text not null, points integer not null
    );
    create index if not exists idx_act_student on activities(student_id);
    create table if not exists consents (
      student_id integer not null, source text not null, enabled integer not null default 1,
      primary key (student_id, source)
    );
    create table if not exists settings (key text primary key, value text not null);
    create table if not exists goals (
      id integer primary key autoincrement, student_id integer not null, competency text not null,
      target integer not null, created text not null, deadline text not null
    );
    create table if not exists evidence (
      id integer primary key autoincrement, survey_id integer not null, competency text not null,
      text text not null, status text not null default 'pending', created text not null
    );
    create table if not exists survey_results (
      id integer primary key autoincrement,
      student_id integer,
      created text not null,
      answers text not null
    );
  `);
  const n = d.prepare("select count(*) c from students").get() as unknown as { c: number };
  const ver = (d.prepare("select value v from settings where key = 'seed_v'").get() as unknown as { v: string } | undefined)?.v;
  if (n.c > 0 && ver !== SEED_V) {
    d.exec("delete from activities; delete from students; delete from goals; delete from consents; delete from settings where key in ('demo_anchor','demo_max_id'); delete from sqlite_sequence where name = 'activities'");
    n.c = 0;
  }
  if (n.c === 0) { seed(d); d.prepare("insert into settings (key, value) values ('seed_v', ?) on conflict(key) do update set value = excluded.value").run(SEED_V); }
  g.__db = d;
  rollDemo(d);
  return d;
}

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

// Демо-данные привязаны к дате запуска: сдвигаем засеянные записи к сегодняшнему дню,
// чтобы окна «30 дней», серии и просадки не устаревали.
function rollDemo(d: DatabaseSync) {
  const get = (k: string) => (d.prepare("select value v from settings where key = ?").get(k) as unknown as { v: string } | undefined)?.v;
  const put = d.prepare("insert into settings (key, value) values (?, ?) on conflict(key) do update set value = excluded.value");
  const today = iso(new Date());
  let anchor = get("demo_anchor");
  if (!anchor) {
    const m = d.prepare("select max(date) m, max(id) i from activities").get() as unknown as { m: string | null; i: number | null };
    if (!m.m) return;
    anchor = m.m;
    put.run("demo_max_id", String(m.i));
  }
  const shift = Math.round((Date.parse(today) - Date.parse(anchor)) / 864e5);
  if (shift > 0) d.prepare("update activities set date = date(date, ?) where id <= ?").run(`+${shift} days`, Number(get("demo_max_id")));
  put.run("demo_anchor", shift > 0 ? today : anchor);
  g.__rolled = today;
}

export function seed(d: DatabaseSync) {
  const r = rng(2026);
  const now = new Date();
  const WEEKS = 56;
  const insS = d.prepare("insert into students (id, name, grp) values (?,?,?)");
  const insA = d.prepare(
    "insert into activities (student_id, date, source, title, competency, points) values (?,?,?,?,?,?)"
  );
  d.exec("begin");
  NAMES.forEach((name, i) => {
    const id = i + 1;
    insS.run(id, name, i < 24 ? GROUPS[i % 4] : i < 48 ? GROUPS[4 + ((i - 24) % 4)] : GROUPS[(i * 3 + (i >> 3)) % GROUPS.length]);
    const weights = COMP_KEYS.map(() => 0.25 + r() * 1.5);
    const sum = weights.reduce((a, b) => a + b, 0);
    const rate = 0.5 + r() * 1.2;
    const dormant = r() < 0.3 ? Math.floor(r() * COMP_KEYS.length) : -1;
    const dormantFrom = new Date(now.getTime() - (40 + r() * 30) * 864e5);
    const absent = r() < 0.2;
    for (let w = WEEKS; w >= 0; w--) {
      const weekStart = now.getTime() - w * 7 * 864e5;
      const growth = 0.5 + ((WEEKS - w) / WEEKS) * 0.9;
      let cnt = 0;
      const lam = rate * growth;
      for (let k = 0; k < 4; k++) if (r() < lam / 3) cnt++;
      if (absent && w < 5) cnt = 0;
      for (let a = 0; a < cnt; a++) {
        let x = r() * sum, ci = 0;
        while (ci < weights.length - 1 && x > weights[ci]) { x -= weights[ci]; ci++; }
        const date = new Date(weekStart - Math.floor(r() * 7) * 864e5);
        if (date > now) continue;
        if (ci === dormant && date > dormantFrom) continue;
        const key = COMP_KEYS[ci];
        const t = TEMPLATES[key][Math.floor(r() * TEMPLATES[key].length)];
        insA.run(id, iso(date), t[0], t[1], key, 8 + Math.floor(r() * 28));
      }
    }
  });
  d.exec("commit");
}

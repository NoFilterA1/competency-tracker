"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { COMP_KEYS, SOURCES } from "@/lib/config";
import { TOTAL } from "@/lib/survey";

export async function addActivity(fd: FormData) {
  const id = Number(fd.get("student_id"));
  const competency = String(fd.get("competency"));
  const points = Math.max(1, Math.min(100, Number(fd.get("points")) || 10));
  const title = String(fd.get("title") || "").trim();
  const source = String(fd.get("source") || "Ручной ввод");
  if (!id || !title || !COMP_KEYS.includes(competency)) return;
  db().prepare("insert into activities (student_id, date, source, title, competency, points) values (?,?,?,?,?,?)")
    .run(id, new Date().toISOString().slice(0, 10), source, title, competency, points);
  revalidatePath(`/student/${id}`);
  revalidatePath("/curator");
}

export async function importCsv(fd: FormData) {
  const text = String(fd.get("csv") || "");
  const ins = db().prepare("insert into activities (student_id, date, source, title, competency, points) values (?,?,?,?,?,?)");
  const exists = db().prepare("select 1 x from students where id = ?");
  for (const line of text.split(/\r?\n/)) {
    const p = line.split(/[;,]/).map((x) => x.trim());
    if (p.length < 6 || p[0] === "student_id") continue;
    const [sid, date, source, title, comp, pts] = p;
    if (!exists.get(Number(sid)) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !COMP_KEYS.includes(comp) || !Number(pts)) continue;
    ins.run(Number(sid), date, source, title, comp, Number(pts));
  }
  revalidatePath("/", "layout");
}

export async function saveSurvey(studentId: number, answers: number[]): Promise<number> {
  if (!Array.isArray(answers) || answers.length !== TOTAL || answers.some((v) => !Number.isInteger(v) || v < 1 || v > 4)) throw new Error("bad answers");
  const sid = studentId > 0 && db().prepare("select 1 x from students where id = ?").get(studentId) ? studentId : null;
  const r = db().prepare("insert into survey_results (student_id, created, answers) values (?,?,?)").run(sid, new Date().toISOString(), JSON.stringify(answers));
  revalidatePath("/curator");
  return Number(r.lastInsertRowid);
}

/* ---------- consents ---------- */
export async function toggleConsent(fd: FormData) {
  const id = Number(fd.get("student_id")), source = String(fd.get("source")), enabled = Number(fd.get("enabled")) ? 1 : 0;
  if (!id || !SOURCES.includes(source)) return;
  db().prepare("insert into consents (student_id, source, enabled) values (?,?,?) on conflict(student_id, source) do update set enabled = excluded.enabled").run(id, source, enabled);
  revalidatePath("/", "layout");
}
export async function setAllConsent(fd: FormData) {
  const id = Number(fd.get("student_id")), enabled = Number(fd.get("enabled")) ? 1 : 0;
  if (!id) return;
  const st = db().prepare("insert into consents (student_id, source, enabled) values (?,?,?) on conflict(student_id, source) do update set enabled = excluded.enabled");
  SOURCES.forEach((s) => st.run(id, s, enabled));
  revalidatePath("/", "layout");
}

/* ---------- methodology: source weights ---------- */
export async function saveWeights(fd: FormData) {
  const w: Record<string, number> = {};
  SOURCES.forEach((s) => { const v = parseFloat(String(fd.get("w_" + s)).replace(",", ".")); w[s] = isFinite(v) ? Math.max(0, Math.min(3, Math.round(v * 100) / 100)) : 1; });
  db().prepare("insert into settings (key, value) values ('source_weights', ?) on conflict(key) do update set value = excluded.value").run(JSON.stringify(w));
  revalidatePath("/", "layout");
}
export async function resetWeights() {
  db().prepare("delete from settings where key = 'source_weights'").run();
  revalidatePath("/", "layout");
}

/* ---------- goals ---------- */
export async function addGoal(fd: FormData) {
  const id = Number(fd.get("student_id")), comp = String(fd.get("competency")), target = Math.max(10, Math.min(300, Number(fd.get("target")) || 50)), days = Math.max(7, Math.min(120, Number(fd.get("days")) || 30));
  if (!id || !COMP_KEYS.includes(comp)) return;
  const now = new Date(), end = new Date(now.getTime() + days * 864e5);
  db().prepare("insert into goals (student_id, competency, target, created, deadline) values (?,?,?,?,?)").run(id, comp, target, now.toISOString().slice(0, 10), end.toISOString().slice(0, 10));
  revalidatePath(`/student/${id}`);
}
export async function deleteGoal(fd: FormData) {
  const id = Number(fd.get("id")), sid = Number(fd.get("student_id"));
  db().prepare("delete from goals where id = ? and student_id = ?").run(id, sid);
  revalidatePath(`/student/${sid}`);
}

/* ---------- evidence for self-assessment ---------- */
export async function addEvidence(fd: FormData) {
  const sid = Number(fd.get("survey_id")), comp = String(fd.get("competency")), text = String(fd.get("text") || "").trim().slice(0, 500);
  if (!sid || !COMP_KEYS.includes(comp) || text.length < 5) return;
  const dup = db().prepare("select 1 x from evidence where survey_id = ? and competency = ?").get(sid, comp);
  if (dup) return;
  db().prepare("insert into evidence (survey_id, competency, text, created) values (?,?,?,?)").run(sid, comp, text, new Date().toISOString());
  revalidatePath(`/test/result/${sid}`); revalidatePath("/curator");
}
export async function reviewEvidence(fd: FormData) {
  const id = Number(fd.get("id")), status = String(fd.get("status")) === "confirmed" ? "confirmed" : "rejected";
  const r = db().prepare("select survey_id from evidence where id = ?").get(id) as unknown as { survey_id: number } | undefined;
  db().prepare("update evidence set status = ? where id = ?").run(status, id);
  revalidatePath("/curator"); if (r) revalidatePath(`/test/result/${r.survey_id}`);
}

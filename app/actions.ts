"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { COMP_KEYS } from "@/lib/config";

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

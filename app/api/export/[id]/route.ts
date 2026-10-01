import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = db();
  const student = d.prepare("select id, name, grp from students where id = ?").get(Number(id));
  if (!student) return new Response("not found", { status: 404 });
  const activities = d.prepare("select date, source, title, competency, points from activities where student_id = ? order by date").all(Number(id));
  const surveys = (d.prepare("select id, created, answers from survey_results where student_id = ? order by id").all(Number(id)) as unknown as { id: number; created: string; answers: string }[]).map((r) => ({ ...r, answers: JSON.parse(r.answers) }));
  const consents = d.prepare("select source, enabled from consents where student_id = ?").all(Number(id));
  const body = JSON.stringify({ exported: new Date().toISOString(), student, consents, activities, surveys }, null, 2);
  return new Response(body, { headers: { "content-type": "application/json; charset=utf-8", "content-disposition": `attachment; filename="competency-data-${id}.json"` } });
}

import { getAll } from "@/lib/model";
import { Survey } from "@/components/Survey";

export const dynamic = "force-dynamic";

export default async function Test({ searchParams }: { searchParams: Promise<{ student?: string }> }) {
  const { student } = await searchParams;
  const { stats } = getAll();
  const students = stats.map((s) => ({ id: s.student.id, name: s.student.name, grp: s.student.grp })).sort((a, b) => a.name.localeCompare(b.name, "ru"));
  return <Survey students={students} startId={student ? Number(student) : undefined} />;
}

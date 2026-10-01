import { getAll } from "@/lib/model";
import { dirOf } from "@/lib/config";
import { StudentBrowser, type SRow } from "@/components/StudentBrowser";

export const dynamic = "force-dynamic";

export default function Home() {
  const { stats } = getAll();
  const rows: SRow[] = stats.map((s) => ({
    id: s.student.id, name: s.student.name, grp: s.student.grp, dir: dirOf(s.student.grp).key,
    level: s.overall.level, levelName: s.overall.name, avg: s.avgFloat,
    floats: s.comps.map((c) => c.float), levels: s.comps.map((c) => c.level), pts: s.comps.map((c) => c.pts),
    growth: s.growth30, streak: s.streak, alerts: s.alerts.length,
  }));
  return (
    <div>
      <StudentBrowser rows={rows} />
    </div>
  );
}

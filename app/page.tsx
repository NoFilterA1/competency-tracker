import Link from "next/link";
import { getAll } from "@/lib/model";

export const dynamic = "force-dynamic";

export default function Home() {
  const { stats } = getAll();
  const sorted = [...stats].sort((a, b) => b.avgFloat - a.avgFloat);
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <h1 className="display text-4xl sm:text-5xl">Профиль компетенций студента</h1>
        <p className="muted mt-4 max-w-md text-[1.05rem] leading-relaxed">
          Профиль собирается из цифрового следа: учёба, мероприятия, проекты, кейсы, курсы. Выберите студента, чтобы увидеть его
          компетенции, динамику и достижения.
        </p>
        <p className="label mt-4">Данные демонстрационные.</p>
      </div>
      <div className="card lg:col-span-8" style={{ padding: 0 }}>
        <table className="tbl w-full">
          <thead>
            <tr><th>Студент</th><th className="hidden sm:table-cell">Группа</th><th>Уровень</th><th className="hidden w-44 md:table-cell">Прогресс</th><th className="hidden text-right sm:table-cell">Серия</th></tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr key={s.student.id}>
                <td><Link href={`/student/${s.student.id}`} className="font-medium underline decoration-transparent underline-offset-4 hover:decoration-current">{s.student.name}</Link></td>
                <td className="muted hidden sm:table-cell">{s.student.grp}</td>
                <td><b className="display text-lg" style={{ color: "var(--accent)" }}>{s.overall.level}</b> <span className="muted text-sm">{s.overall.name}</span></td>
                <td className="hidden md:table-cell"><div className="bar"><i style={{ width: `${(s.avgFloat / 5) * 100}%` }} /></div></td>
                <td className="muted hidden text-right sm:table-cell">{s.streak > 0 ? `${s.streak} нед.` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

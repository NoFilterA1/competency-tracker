import Link from "next/link";
import { notFound } from "next/navigation";
import { getAll } from "@/lib/model";

export const dynamic = "force-dynamic";

export default async function Share({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = getAll().stats.find((s) => s.student.id === Number(id));
  if (!me) notFound();
  const top = [...me.comps].sort((a, b) => b.float - a.float).slice(0, 3);
  return (
    <div className="mx-auto max-w-md space-y-4">
      <Link href={`/student/${me.student.id}`} className="muted text-sm">← к профилю</Link>
      <div className="card" style={{ padding: 28 }}>
        <div className="label">Мой профиль компетенций</div>
        <div className="display mt-2 text-3xl">{me.student.name}</div>
        <div className="muted">{me.student.grp}</div>
        <div className="mt-8 flex items-end gap-4">
          <div className="display text-9xl leading-[.8]" style={{ color: "var(--accent)" }}>{me.overall.level}</div>
          <div className="pb-1"><div className="label">уровень</div><div className="display text-2xl">{me.overall.name}</div></div>
        </div>
        <div className="mt-8 space-y-4">
          {top.map((c) => (
            <div key={c.key}>
              <div className="flex justify-between text-sm"><span>{c.name}</span><b>{c.level}</b></div>
              <div className="bar mt-1.5"><i style={{ width: `${(c.float / 5) * 100}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {me.badges.slice(0, 4).map((b) => <span key={b.title} className="pill"><i className="mark" />{b.title}</span>)}
        </div>
      </div>
      <p className="label text-center">Карточка создаётся из профиля автоматически.</p>
    </div>
  );
}

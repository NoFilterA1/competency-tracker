import Link from "next/link";
import { notFound } from "next/navigation";
import { getAll, groupAvg } from "@/lib/model";
import { COMPETENCIES, SOURCES } from "@/lib/config";
import { RadarBlock, LineBlock } from "@/components/Charts";
import { Heatmap } from "@/components/Heatmap";
import { addActivity } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { stats, rowsBy } = getAll();
  const me = stats.find((s) => s.student.id === Number(id));
  if (!me) notFound();
  const peers = stats.filter((s) => s.student.grp === me.student.grp);
  const avg = groupAvg(peers);
  const radar = me.comps.map((c, i) => ({ name: c.short, value: +c.float.toFixed(2), avg: +avg[i].toFixed(2) }));
  const feed = (rowsBy.get(me.student.id) ?? []).slice(0, 8);
  const rank = [...stats].sort((a, b) => b.growth30 - a.growth30).findIndex((s) => s.student.id === me.student.id) + 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Link href="/" className="muted text-sm">← все студенты</Link>
          <h1 className="display mt-2 text-4xl sm:text-5xl">{me.student.name}</h1>
          <div className="muted mt-2">{me.student.grp} · {me.count} записей цифрового следа · {me.sources} источников</div>
        </div>
        <div className="flex items-end gap-5">
          <div className="text-right">
            <div className="label">Общий уровень</div>
            <div className="display text-2xl">{me.overall.name}</div>
          </div>
          <div className="display text-8xl leading-[.85]" style={{ color: "var(--accent)" }}>{me.overall.level}</div>
        </div>
      </div>

      <div className="strip">
        <div><div className="label">Серия без пропусков</div><div className="v">{me.streak} нед.</div></div>
        <div><div className="label">Баллы за 30 дней</div><div className="v">+{me.growth30}</div></div>
        <div><div className="label">Место по росту</div><div className="v">{rank} <span className="muted text-base">из {stats.length}</span></div></div>
        <div className="flex items-center justify-between gap-3">
          <div><div className="label">Поделиться</div><div className="v text-xl">Карточка</div></div>
          <Link href={`/share/${me.student.id}`} className="btn">Открыть</Link>
        </div>
      </div>

      {me.alerts.length > 0 && (
        <div className="card" style={{ borderColor: "var(--warn)" }}>
          <b style={{ color: "var(--warn)" }}>Просадка.</b>{" "}
          Более трёх месяцев без активности: {me.alerts.map((a) => a.name).join(", ")}.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="card lg:col-span-5">
          <h2>Профиль компетенций</h2>
          <RadarBlock data={radar} name={me.student.name} avgName={`Среднее по ${me.student.grp}`} />
        </div>
        <div className="card lg:col-span-7">
          <h2>Уровни и прогресс</h2>
          <div className="mt-4 divide-y" style={{ borderColor: "var(--line)" }}>
            {me.comps.map((c) => (
              <div key={c.key} className="grid grid-cols-12 items-center gap-x-4 py-2.5" style={{ borderColor: "var(--line)" }}>
                <div className="col-span-12 sm:col-span-4">{c.name}</div>
                <div className="col-span-7 sm:col-span-5"><div className="bar"><i style={{ width: `${(c.float / 5) * 100}%` }} /></div></div>
                <div className="col-span-5 text-right text-sm sm:col-span-3">
                  <b>{c.level}</b> <span className="muted">{c.levelName}</span>
                  {c.g30 > 0 && <span className="ml-1.5" style={{ color: "var(--good)" }}>+{c.g30}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="card lg:col-span-7">
          <h2>Динамика: накопленные баллы за 12 месяцев</h2>
          <LineBlock data={me.monthly} />
        </div>
        <div className="space-y-6 lg:col-span-5">
          <div className="card">
            <h2>Активность за 26 недель</h2>
            <div className="mt-3"><Heatmap heat={me.heat} /></div>
          </div>
          <div className="card">
            <h2>Достижения</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {me.badges.length === 0 && <span className="muted text-sm">Пока нет. Продолжайте развиваться.</span>}
              {me.badges.map((b) => (
                <span key={b.title} title={b.hint} className="pill"><i className="mark" />{b.title}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="card lg:col-span-7">
          <h2>Последние записи цифрового следа</h2>
          <table className="tbl mt-2 w-full text-sm">
            <tbody>
              {feed.map((r, i) => (
                <tr key={i}>
                  <td className="muted whitespace-nowrap pl-0">{r.date}</td>
                  <td>{r.title}<div className="label">{r.source} · {COMPETENCIES.find((c) => c.key === r.competency)?.short}</div></td>
                  <td className="pr-0 text-right font-semibold" style={{ color: "var(--accent)" }}>+{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form action={addActivity} className="card space-y-2.5 lg:col-span-5">
          <h2>Добавить запись вручную</h2>
          <input type="hidden" name="student_id" value={me.student.id} />
          <input name="title" required placeholder="Что сделал(а)" className="input" />
          <div className="grid grid-cols-2 gap-2">
            <select name="competency" className="input">{COMPETENCIES.map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}</select>
            <select name="source" className="input">{SOURCES.map((s) => <option key={s}>{s}</option>)}</select>
          </div>
          <input name="points" type="number" min={1} max={100} defaultValue={20} className="input" />
          <button className="btn">Добавить</button>
        </form>
      </div>
    </div>
  );
}

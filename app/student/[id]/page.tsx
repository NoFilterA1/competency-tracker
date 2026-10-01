import Link from "next/link";
import { notFound } from "next/navigation";
import { getAll, groupAvg } from "@/lib/model";
import { db } from "@/lib/db";
import { scoreAnswers } from "@/lib/survey";
import { CATALOG, dateIn } from "@/lib/catalog";
import { COMPETENCIES, SOURCES } from "@/lib/config";
import { RadarBlock, LineBlock } from "@/components/Charts";
import { Heatmap } from "@/components/Heatmap";
import { addActivity, addGoal, deleteGoal } from "@/app/actions";

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
  const d = db();
  const goalsRaw = d.prepare("select id, competency, target, created, deadline from goals where student_id = ? order by id desc").all(me.student.id) as unknown as { id: number; competency: string; target: number; created: string; deadline: string }[];
  const mine = rowsBy.get(me.student.id) ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const goals = goalsRaw.map((g) => {
    const got = mine.filter((r) => r.competency === g.competency && r.date >= g.created).reduce((a, r) => a + r.points, 0);
    const left = Math.ceil((new Date(g.deadline).getTime() - new Date(today).getTime()) / 864e5);
    return { ...g, got, left, done: got >= g.target, name: COMPETENCIES.find((c) => c.key === g.competency)?.name ?? g.competency };
  });
  const surveys = (d.prepare("select id, created, answers from survey_results where student_id = ? order by id").all(me.student.id) as unknown as { id: number; created: string; answers: string }[]).map((r) => {
    const sc = scoreAnswers(JSON.parse(r.answers));
    return { id: r.id, date: r.created.slice(0, 10), pct: sc.reduce((a, x) => a + x.pct, 0) / sc.length, level: Math.round(sc.reduce((a, x) => a + x.level, 0) / sc.length) };
  });
  const weakest = [...me.comps].sort((a, b) => a.float - b.float).slice(0, 2).map((c) => c.key);
  const recs = weakest.flatMap((k) => CATALOG.filter((x) => x.comp === k).sort((a, b) => a.inDays - b.inDays).slice(0, 2));
  const rank = [...stats].sort((a, b) => b.growth30 - a.growth30).findIndex((s) => s.student.id === me.student.id) + 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Link href="/" className="muted text-sm">← все студенты</Link>
          <h1 className="display mt-2 text-4xl sm:text-5xl">{me.student.name}</h1>
          <div className="muted mt-2">{me.student.grp} · {me.count} записей цифрового следа · {me.sources} источников</div>
        </div>
        <div className="flex flex-wrap items-end gap-5">
          <div className="text-right">
            <div className="label">Общий уровень</div>
            <div className="display text-2xl">{me.overall.name}</div>
          </div>
          <div className="display text-8xl leading-[.85]" style={{ color: "var(--accent)" }}>{me.overall.level}</div>
        </div>
      </div>

      <div className="embed-hide flex flex-wrap gap-2">
        <Link href={`/test?student=${me.student.id}`} className="btn">Пройти опрос</Link>
        <Link href={`/passport/${me.student.id}`} className="btn-ghost">Паспорт компетенций</Link>
        <Link href={`/consent?student=${me.student.id}`} className="btn-ghost">Согласия на данные</Link>
        <Link href="/catalog" className="btn-ghost">Каталог активностей</Link>
      </div>

      <div className="strip">
        <div><div className="label">Серия без пропусков</div><div className="v">{me.streak} нед.</div></div>
        <div><div className="label">Баллы за 30 дней</div><div className="v">+{me.growth30}</div></div>
        <div><div className="label">Место по росту</div><div className="v">{rank} <span className="muted text-base">из {stats.length}</span></div></div>
        <div><div className="label">Источников данных</div><div className="v">{me.sources} <span className="muted text-base">из 6</span></div></div>
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
          <div className="card embed-hide">
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

      <div className="embed-hide grid gap-6 lg:grid-cols-3">
        <div className="card">
          <h2>Цели</h2>
          <div className="mt-3 space-y-3">
            {goals.length === 0 && <p className="muted text-sm">Поставьте цель: например, +60 баллов в лидерстве за 30 дней.</p>}
            {goals.map((g) => (
              <div key={g.id}>
                <div className="flex items-center justify-between gap-2 text-sm"><span>{g.name}</span>
                  <span className="flex items-center gap-2"><b style={{ color: g.done ? "var(--good)" : "var(--ink)" }}>{Math.min(g.got, g.target)} / {g.target}</b>
                    <form action={deleteGoal}><input type="hidden" name="id" value={g.id} /><input type="hidden" name="student_id" value={me.student.id} /><button className="muted" aria-label="Удалить цель" title="Удалить">×</button></form></span></div>
                <div className="bar mt-1.5"><i style={{ width: `${Math.min(100, (g.got / g.target) * 100)}%`, background: g.done ? "var(--good)" : undefined }} /></div>
                <div className="label mt-1">{g.done ? "Достигнуто" : g.left >= 0 ? `Осталось дней: ${g.left}` : "Срок вышел"}</div>
              </div>
            ))}
          </div>
          <form action={addGoal} className="mt-4 grid gap-2 border-t pt-4" style={{ borderColor: "var(--line)" }}>
            <input type="hidden" name="student_id" value={me.student.id} />
            <select name="competency" className="input">{COMPETENCIES.map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}</select>
            <div className="grid grid-cols-2 gap-2">
              <select name="target" className="input" defaultValue={60}>{[30, 60, 100, 150].map((t) => <option key={t} value={t}>+{t} баллов</option>)}</select>
              <select name="days" className="input" defaultValue={30}>{[14, 30, 60, 90].map((t) => <option key={t} value={t}>за {t} дн.</option>)}</select>
            </div>
            <button className="btn">Поставить цель</button>
          </form>
        </div>
        <div className="card">
          <h2>Рекомендуем</h2>
          <p className="muted mt-1 text-sm">Для слабых компетенций: {weakest.map((k) => COMPETENCIES.find((c) => c.key === k)!.short).join(", ")}.</p>
          <div className="mt-3 divide-y" style={{ borderColor: "var(--line)" }}>
            {recs.map((x) => (
              <div key={x.id} className="py-2.5 text-sm" style={{ borderColor: "var(--line)" }}>
                <div className="flex justify-between gap-3"><span className="font-medium leading-snug">{x.title}</span><b style={{ color: "var(--accent)" }}>+{x.points}</b></div>
                <div className="label mt-0.5">{x.kind} · {x.source} · {dateIn(x.inDays)}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2>История опросов</h2>
          {surveys.length === 0 ? (
            <p className="muted mt-2 text-sm">Опрос ещё не проходили. Результаты каждого прохождения сохраняются, и здесь видна динамика самооценки.</p>
          ) : (
            <>
              {surveys.length > 1 && <LineBlock data={surveys.map((x) => ({ label: x.date.slice(5), value: Math.round(x.pct) }))} step={25} topProp={100} />}
              <div className="mt-2 divide-y" style={{ borderColor: "var(--line)" }}>
                {[...surveys].reverse().slice(0, 4).map((x) => (
                  <Link key={x.id} href={`/test/result/${x.id}`} className="flex items-center justify-between py-2 text-sm" style={{ borderColor: "var(--line)" }}>
                    <span>{x.date}</span><span><b>{x.level}</b> <span className="muted">уровень самооценки · {Math.round(x.pct)}%</span></span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="embed-hide grid gap-6 lg:grid-cols-12">
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

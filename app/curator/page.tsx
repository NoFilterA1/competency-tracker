import Link from "next/link";
import { getAll, groupAvg, getSurveyAgg } from "@/lib/model";
import { COMPETENCIES, GROUPS } from "@/lib/config";
import { importCsv, reviewEvidence } from "@/app/actions";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Curator({ searchParams }: { searchParams: Promise<{ g?: string; q?: string }> }) {
  const { g, q } = await searchParams;
  const { stats } = getAll();
  const list = stats
    .filter((s) => (!g || s.student.grp === g) && (!q || s.student.name.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => b.avgFloat - a.avgFloat);

  const league = GROUPS.map((grp) => {
    const m = stats.filter((s) => s.student.grp === grp);
    return { grp, n: m.length, growth: Math.round(m.reduce((a, s) => a + s.growth30, 0) / Math.max(1, m.length)), avg: groupAvg(m) };
  }).sort((a, b) => b.growth - a.growth);
  const maxGrowth = Math.max(1, ...league.map((l) => l.growth));
  const survey = getSurveyAgg(stats);
  const queue = db().prepare("select e.id, e.competency, e.text, e.created, st.name from evidence e join survey_results r on r.id = e.survey_id left join students st on st.id = r.student_id where e.status = 'pending' order by e.id desc limit 8").all() as unknown as { id: number; competency: string; text: string; created: string; name: string | null }[];
  const alerts = stats.filter((s) => s.alerts.length > 0);
  const weakest = COMPETENCIES.map((c, i) => ({ name: c.name, v: groupAvg(stats)[i] })).sort((a, b) => a.v - b.v)[0];

  return (
    <div className="space-y-6">
      <h1 className="display text-4xl sm:text-5xl">Панель куратора</h1>

      <div className="strip">
        <Kpi label="Студентов" value={String(stats.length)} />
        <Kpi label="Средний уровень" value={(stats.reduce((a, s) => a + s.avgFloat, 0) / stats.length).toFixed(1) + " / 5"} />
        <Kpi label="С просадкой" value={`${alerts.length} (${Math.round((alerts.length / stats.length) * 100)}%)`} />
        <Kpi label="Слабее всего" value={weakest.name} />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="card lg:col-span-2">
          <h2 className="font-semibold">Лига групп — средний прирост за 30 дней</h2>
          <div className="mt-3 space-y-3">
            {league.map((l, i) => (
              <div key={l.grp}>
                <div className="flex justify-between text-sm"><span>{i + 1}. {l.grp} <span className="muted">({l.n} чел.)</span></span><b>+{l.growth}</b></div>
                <div className="bar mt-1"><i style={{ width: `${(l.growth / maxGrowth) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card lg:col-span-3">
          <h2 className="font-semibold">Средний уровень компетенций по группам</h2>
          <table className="mt-3 hidden w-full table-fixed text-xs sm:table">
            <colgroup><col style={{ width: "13%" }} />{COMPETENCIES.map((c) => <col key={c.key} />)}</colgroup>
            <thead>
              <tr className="muted text-left">
                <th className="py-1 pr-1 font-medium">Группа</th>
                {COMPETENCIES.map((c) => <th key={c.key} className="px-0.5 pb-1 text-center align-bottom text-[11px] font-medium leading-tight" title={c.name}>{c.short}</th>)}
              </tr>
            </thead>
            <tbody>
              {league.map((l) => (
                <tr key={l.grp} className="border-t" style={{ borderColor: "var(--line)" }}>
                  <td className="py-1.5 pr-1 font-semibold">{l.grp}</td>
                  {l.avg.map((v, i) => (
                    <td key={i} className="px-0.5 py-1">
                      <span className="block rounded-md py-1 text-center font-semibold" style={{ background: `color-mix(in srgb, var(--accent) ${Math.round((v / 5) * 100)}%, transparent)` }}>{v.toFixed(1)}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 space-y-4 sm:hidden">
            {league.map((l) => (
              <div key={l.grp}>
                <div className="mb-1 font-semibold">{l.grp}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {COMPETENCIES.map((c, i) => (
                    <div key={c.key}>
                      <div className="flex justify-between text-xs"><span className="muted">{c.short}</span><b>{l.avg[i].toFixed(1)}</b></div>
                      <div className="bar mt-0.5" style={{ height: 5 }}><i style={{ width: `${(l.avg[i] / 5) * 100}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card embed-hide">
        <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="font-semibold">Подтверждения на проверке</h2><span className="label">в очереди: {queue.length}</span></div>
        {queue.length === 0 ? <p className="muted mt-2 text-sm">Очередь пуста. Когда студент завышает самооценку и приводит пример, он появится здесь.</p> : (
          <div className="mt-2 divide-y" style={{ borderColor: "var(--line)" }}>
            {queue.map((q) => (
              <div key={q.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm" style={{ borderColor: "var(--line)" }}>
                <div className="min-w-0 flex-1"><b>{q.name ?? "Гость"}</b> <span className="muted">· {COMPETENCIES.find((c) => c.key === q.competency)?.name}</span><div className="muted truncate">«{q.text}»</div></div>
                <div className="flex gap-2">
                  <form action={reviewEvidence}><input type="hidden" name="id" value={q.id} /><input type="hidden" name="status" value="confirmed" /><button className="btn">Подтвердить</button></form>
                  <form action={reviewEvidence}><input type="hidden" name="id" value={q.id} /><input type="hidden" name="status" value="rejected" /><button className="btn-ghost">Отклонить</button></form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form action={importCsv} className="card embed-hide space-y-2">
        <h2 className="font-semibold">Импорт цифрового следа (CSV)</h2>
        <p className="muted break-words text-sm">
          Формат: <code>student_id,date,source,title,competency,points</code>. Ключи компетенций: {COMPETENCIES.map((c) => c.key).join(", ")}.
          Так подключается выгрузка из ЭИОС / Leader-ID.
        </p>
        <textarea name="csv" rows={4} className="input font-mono text-xs" placeholder="1,2026-09-28,ЭИОС,Доклад на семинаре,communication,25" />
        <button className="btn">Импортировать</button>
      </form>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="v">{value}</div>
    </div>
  );
}

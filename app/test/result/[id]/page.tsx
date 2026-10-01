import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getAll } from "@/lib/model";
import { ADVICE, DEMO_ANSWERS, scoreAnswers } from "@/lib/survey";
import { RadarBlock } from "@/components/Charts";
import { Picto } from "@/components/Pictos";
import { LEVEL_NAMES } from "@/lib/config";
import { addEvidence } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function Result({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let answers: number[]; let studentId: number | null; let created = "";
  if (id === "demo") { answers = DEMO_ANSWERS; studentId = 3; created = "демонстрация"; }
  else {
    const row = db().prepare("select student_id, created, answers from survey_results where id = ?").get(Number(id)) as unknown as { student_id: number | null; created: string; answers: string } | undefined;
    if (!row) notFound();
    answers = JSON.parse(row.answers); studentId = row.student_id; created = row.created.slice(0, 10);
  }
  const { stats } = getAll();
  const evRows = id === "demo" ? [] : (db().prepare("select competency, text, status from evidence where survey_id = ?").all(Number(id)) as unknown as { competency: string; text: string; status: string }[]);
  const ev = new Map(evRows.map((e) => [e.competency, e]));
  const me = studentId ? stats.find((s) => s.student.id === studentId) : undefined;
  const sc = scoreAnswers(answers);
  const rows = sc.map((s, i) => {
    const trace = me ? me.comps[i] : null;
    const gap = trace ? s.level - trace.level : null;
    const e = ev.get(s.key);
    const confirmedLevel = trace ? (e?.status === "confirmed" ? Math.max(s.level, trace.level) : trace.level) : null;
    return { ...s, trace, gap, e, confirmedLevel };
  });
  const strong = [...rows].sort((a, b) => b.pct - a.pct).slice(0, 2);
  const grow = [...rows].sort((a, b) => a.pct - b.pct).slice(0, 2);
  const overall = Math.round(rows.reduce((a, r) => a + r.level, 0) / rows.length);
  const radar = rows.map((r) => ({ name: r.short, value: +r.float.toFixed(2), avg: r.trace ? +r.trace.float.toFixed(2) : 0 }));
  const gapLabel = (g: number | null) => g === null ? "" : g === 0 ? "совпадает" : g > 0 ? "самооценка выше следа" : "след выше самооценки";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Link href={me ? `/student/${me.student.id}` : "/test"} className="muted text-sm">{me ? "← к профилю" : "← к опросу"}</Link>
          <h1 className="display mt-2 text-4xl sm:text-5xl">{me ? me.student.name : "Ваш профиль"}</h1>
          <div className="muted mt-2">Результат опроса самооценки{created ? ` · ${created}` : ""}{me ? ` · ${me.student.grp}` : " · гость"}</div>
        </div>
        <div className="flex items-end gap-4">
          <div className="text-right"><div className="label">Общий уровень самооценки</div><div className="display text-2xl">{LEVEL_NAMES[overall - 1]}</div></div>
          <div className="display text-8xl leading-[.85]" style={{ color: "var(--accent)" }}>{overall}</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="card lg:col-span-5">
          <h2>{me ? "Самооценка и цифровой след" : "Профиль самооценки"}</h2>
          <RadarBlock data={radar} name="Самооценка" avgName={me ? "Цифровой след" : ""} />
          {!me && <p className="label mt-1">Выберите себя в списке студентов при прохождении, чтобы сравнить самооценку с цифровым следом.</p>}
        </div>
        <div className="card lg:col-span-7">
          <h2>По компетенциям</h2>
          <div className="mt-3 divide-y" style={{ borderColor: "var(--line)" }}>
            {rows.map((r) => (
              <div key={r.key} className="py-3" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2"><span style={{ color: "var(--accent)" }}><Picto k={r.key} size={20} /></span>{r.name}</span>
                  <span className="text-sm"><b>{r.level}</b> <span className="muted">{LEVEL_NAMES[r.level - 1]}</span></span>
                </div>
                <div className="bar mt-2"><i style={{ width: `${r.pct}%` }} /></div>
                {r.trace && (
                  <div className="mt-1.5 flex items-center justify-between gap-3 text-xs">
                    <span className="muted">Цифровой след: {r.trace.level} {r.trace.levelName} · {r.trace.pts} баллов</span>
                    <span style={{ color: r.gap === 0 ? "var(--good)" : "var(--warn)" }}>{gapLabel(r.gap)}</span>
                  </div>
                )}
                {r.trace && r.gap !== null && r.gap > 0 && (
                  r.e ? (
                    <div className="mt-2 rounded-lg p-2.5 text-xs" style={{ background: "var(--bg)", border: "1px solid var(--line)" }}>
                      <b style={{ color: r.e.status === "confirmed" ? "var(--good)" : r.e.status === "rejected" ? "var(--warn)" : "var(--muted)" }}>
                        {r.e.status === "confirmed" ? "Подтверждено куратором" : r.e.status === "rejected" ? "Куратор не подтвердил" : "На проверке у куратора"}
                      </b>
                      <span className="muted"> · «{r.e.text}»</span>
                    </div>
                  ) : id !== "demo" ? (
                    <form action={addEvidence} className="embed-hide mt-2 flex gap-2">
                      <input type="hidden" name="survey_id" value={id} /><input type="hidden" name="competency" value={r.key} />
                      <input name="text" required minLength={5} maxLength={500} placeholder="Подтвердите примером: что и когда вы сделали" className="input text-sm" />
                      <button className="btn-ghost shrink-0">Отправить</button>
                    </form>
                  ) : null
                )}
                {r.confirmedLevel !== null && <div className="embed-hide label mt-1">Подтверждённый уровень: <b style={{ color: "var(--ink)" }}>{r.confirmedLevel}</b></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="embed-hide grid gap-6 md:grid-cols-2">
        <div className="card">
          <h2>Сильные стороны</h2>
          <div className="mt-3 space-y-3">
            {strong.map((r) => (
              <div key={r.key} className="flex gap-3"><span style={{ color: "var(--accent)" }}><Picto k={r.key} size={22} /></span>
                <div><b>{r.name}</b> <span className="muted">· уровень {r.level}</span><p className="muted text-sm">Опирайтесь на этот навык при выборе ролей в команде и проектов.</p></div></div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2>Что подтянуть и как</h2>
          <div className="mt-3 space-y-3">
            {grow.map((r) => (
              <div key={r.key} className="flex gap-3"><span style={{ color: "var(--warn)" }}><Picto k={r.key} size={22} /></span>
                <div><b>{r.name}</b> <span className="muted">· уровень {r.level}</span><p className="text-sm"><b>{ADVICE[r.key].title}.</b> <span className="muted">{ADVICE[r.key].text}</span></p></div></div>
            ))}
          </div>
        </div>
      </div>

      <div className="embed-hide flex flex-wrap gap-3">
        <Link href="/test" className="btn">Пройти заново</Link>
      </div>
    </div>
  );
}

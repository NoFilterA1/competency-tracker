"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, TOTAL, scoreAnswers, DEMO_ANSWERS } from "@/lib/survey";
import { COMPETENCIES } from "@/lib/config";
import { RadarBlock } from "./Charts";
import { Picto, FreqBars } from "./Pictos";
import { saveSurvey } from "@/app/actions";

type S = { id: number; name: string; grp: string };
const COMP_HINT: Record<string, string> = {
  communication: "Структурировать мысль и выступать",
  critical: "Проверять информацию и источники",
  teamwork: "Договариваться и делить работу",
  leadership: "Организовывать и вести за собой",
  digital: "Работать с данными и инструментами",
  project: "Превращать идею в результат",
  selfdev: "Планировать своё обучение",
  prof: "Применять знания специальности",
};
const DEMO_RADAR = scoreAnswers(DEMO_ANSWERS).map((x, k) => ({ name: x.short, value: +x.float.toFixed(2), avg: +(Math.max(0, x.float - 0.4 + (k % 3) * 0.35)).toFixed(2) }));

export function Survey({ students, startId }: { students: S[]; startId?: number }) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [sid, setSid] = useState<number>(startId ?? 0);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => Array(TOTAL).fill(0));
  const [busy, setBusy] = useState(false);
  const [chosen, setChosen] = useState(0);
  const lock = useRef(false);
  const q = QUESTIONS[i];
  const compIdx = COMPETENCIES.findIndex((c) => c.key === q.comp);
  const scores = useMemo(() => scoreAnswers(answers), [answers]);
  const done = answers.filter((v) => v > 0).length;
  const last = i === TOTAL - 1;

  // 1) show the chosen answer, 2) then update the live polygon, 3) then move on. No way back.
  function pick(v: number) {
    if (lock.current) return;
    lock.current = true;
    setChosen(v);
    const at = i;
    setTimeout(() => setAnswers((a) => { const n = [...a]; n[at] = v; return n; }), 450);
    if (at === TOTAL - 1) { setTimeout(() => { lock.current = false; }, 700); return; }
    setTimeout(() => { setI(at + 1); setChosen(0); lock.current = false; }, 1400);
  }
  async function finish() {
    if (busy) return;
    setBusy(true);
    const id = await saveSurvey(sid, answers);
    router.push(`/test/result/${id}`);
  }
  useEffect(() => {
    if (!started) return;
    const onKey = (e: KeyboardEvent) => {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4) pick(QUESTIONS[i].options[n - 1].v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!started) {
    return (
      <div className="space-y-6">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <h1 className="display text-4xl sm:text-5xl">Опрос самооценки</h1>
          <p className="muted mt-4 max-w-lg text-[1.05rem] leading-relaxed">
            16 коротких вопросов, около 3 минут. Мы не проверяем «правильные ответы»: спрашиваем, как вы действуете и как часто.
            Результат сравнивается с цифровым следом, поэтому видно, где самооценка совпадает с реальной активностью, а где расходится.
          </p>
          <div className="mt-6 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-[10px] border" style={{ background: "var(--line)", borderColor: "var(--line)" }}>
            {[["8", "компетенций"], ["16", "вопросов"], ["3 мин", "на прохождение"]].map(([v, t]) => (
              <div key={t} className="p-3" style={{ background: "var(--card)" }}><div className="display text-2xl" style={{ color: "var(--accent)" }}>{v}</div><div className="label">{t}</div></div>
            ))}
          </div>
          <div className="mt-6 max-w-lg space-y-2">
            <label className="label" htmlFor="who">Кто проходит опрос</label>
            <select id="who" className="input" value={sid} onChange={(e) => setSid(Number(e.target.value))}>
              <option value={0}>Гость (без сравнения с цифровым следом)</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.grp}</option>)}
            </select>
            <button className="btn mt-2" onClick={() => setStarted(true)}>Начать</button>
          </div>
        </div>
        <div className="card flex flex-col lg:col-span-6">
          <h2>Пример результата</h2>
          <RadarBlock data={DEMO_RADAR} name="Самооценка" avgName="Цифровой след" height={300} />
          <ol className="mt-auto grid gap-0">
            {[["1", "Отвечайте на вопросы о том, как вы действуете"], ["2", "Смотрите, как заполняется ваш профиль"], ["3", "Получите сравнение с цифровым следом и шаги роста"]].map(([n, t]) => (
              <li key={n} className="rule-row gap-3"><span className="display w-6 text-xl" style={{ color: "var(--accent)" }}>{n}</span><span className="text-sm">{t}</span></li>
            ))}
          </ol>
        </div>
      </div>

      <div className="card">
        <h2>Что мы измеряем</h2>
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4 lg:grid-cols-8">
          {COMPETENCIES.map((c) => (
            <div key={c.key}>
              <span style={{ color: "var(--accent)" }}><Picto k={c.key} size={26} /></span>
              <div className="mt-2 font-semibold leading-tight">{c.name}</div>
              <div className="label mt-1">{COMP_HINT[c.key]}</div>
            </div>
          ))}
        </div>
      </div>
      </div>
    );
  }

  const radar = scores.map((s) => ({ name: s.short, value: +s.float.toFixed(2), avg: 0 }));
  return (
    <div className="grid select-none gap-6 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="flex items-center gap-3">
          <span style={{ color: "var(--accent)" }}><Picto k={q.comp} size={30} /></span>
          <div>
            <div className="label">Вопрос {i + 1} из {TOTAL}</div>
            <div className="font-semibold">{COMPETENCIES[compIdx].name}</div>
          </div>
        </div>
        <div className="mt-4 flex gap-1" aria-hidden>
          {QUESTIONS.map((qq, k) => (
            <div key={qq.id} className="h-1.5 flex-1 rounded-sm" style={{ background: answers[k] > 0 ? "var(--accent)" : k === i ? "var(--muted)" : "var(--track)" }} />
          ))}
        </div>
        <h2 className="display q-title mt-6">{q.text}</h2>
        <div className="mt-5 grid gap-2.5">
          {q.options.map((o, k) => {
            const on = (chosen || answers[i]) === o.v;
            return (
              <button key={o.text} onClick={() => pick(o.v)} className="opt flex min-h-[3.5rem] w-full items-center gap-3 rounded-[10px] border p-3.5 text-left sm:h-[4.75rem]"
                style={{ background: on ? "var(--accent)" : "var(--card)", color: on ? "var(--on-accent)" : "var(--ink)", borderColor: on ? "var(--accent)" : "var(--line)" }}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-sm font-semibold"
                  style={{ borderColor: on ? "currentColor" : "var(--line)" }}>{k + 1}</span>
                <span className="flex-1">{o.text}</span>
                {q.kind !== "scenario" && <FreqBars level={k + 1} active={on} />}
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="label">Клавиши 1–4 выбирают ответ. Вернуться к предыдущему вопросу нельзя.</span>
          {last && (
            <button className="btn" onClick={finish} disabled={answers[i] === 0 || busy} style={{ opacity: answers[i] === 0 ? 0.5 : 1 }}>{busy ? "Считаем…" : "Показать результат"}</button>
          )}
        </div>
      </div>

      <div className="card lg:col-span-5">
        <div className="flex items-baseline justify-between"><h2>Ваш профиль складывается</h2><span className="label">{done} / {TOTAL}</span></div>
        <RadarBlock data={radar} name="Самооценка" avgName="" animate />
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          {scores.map((s, k) => (
            <div key={s.key} className="flex items-center justify-between gap-2" style={{ opacity: s.answered ? 1 : 0.45 }}>
              <span className="flex items-center gap-1.5 truncate" style={{ fontWeight: k === compIdx ? 600 : 400 }}><span style={{ color: "var(--accent)" }}><Picto k={s.key} size={16} /></span>{s.short}</span>
              <b>{s.answered ? s.level : "·"}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

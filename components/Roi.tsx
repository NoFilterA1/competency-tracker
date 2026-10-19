"use client";
import { useMemo, useState } from "react";

const fmt = (n: number) => Math.round(n).toLocaleString("ru-RU");
const money = (n: number) => `${fmt(n)} ₽`;
const SCEN: Record<string, { students: number; impl: number }> = { "Пилот, 300 студентов": { students: 300, impl: 700000 }, "Один вуз, 3 000": { students: 3000, impl: 1500000 }, "Регион, 15 000": { students: 15000, impl: 4000000 } };

function Slider({ label, value, set, min, max, step, suffix }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step: number; suffix: string }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between"><span className="text-sm">{label}</span><b>{fmt(value)} <span className="muted font-normal">{suffix}</span></b></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} className="slider mt-1.5 w-full" style={{ ["--r" as string]: (value - min) / (max - min) }} />
    </label>
  );
}

export function Roi() {
  const [students, setStudents] = useState(3000);
  const [hoursManual, setHoursManual] = useState(2);
  const [hoursCurator, setHoursCurator] = useState(1.5);
  const [rate, setRate] = useState(500);
  const [share, setShare] = useState(60);
  const [impl, setImpl] = useState(1500000);
  const [support, setSupport] = useState(20);

  const r = useMemo(() => {
    const saveYear = students * (hoursManual + hoursCurator) * rate * (share / 100);
    const costYear = (impl * support) / 100;
    const net = saveYear - costYear;
    const payback = net > 0 ? impl / (net / 12) : Infinity;
    const cum = [0, 1, 2, 3, 4, 5].map((y) => -impl + net * y);
    const breakEven = net > 0 ? Math.ceil((costYear + impl / 3) / ((hoursManual + hoursCurator) * rate * (share / 100))) : Infinity;
    return { saveYear, costYear, net, payback, cum, breakEven };
  }, [students, hoursManual, hoursCurator, rate, share, impl, support]);

  const W = 560, H = 250, L = 6, T = 22, B = 52;
  const lo = Math.min(...r.cum, 0), hi = Math.max(...r.cum, 1);
  const y = (v: number) => T + (1 - (v - lo) / (hi - lo || 1)) * (H - T - B);
  const bw = (W - L * 2) / 6 - 14;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="card space-y-4 lg:col-span-5">
        <h2>Допущения</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SCEN).map(([k, v]) => (<button key={k} className="pill" onClick={() => { setStudents(v.students); setImpl(v.impl); }}>{k}</button>))}
        </div>
        <Slider label="Студентов в системе" value={students} set={setStudents} min={100} max={20000} step={100} suffix="чел." />
        <Slider label="Ручное ведение портфолио и отчётов" value={hoursManual} set={setHoursManual} min={0} max={6} step={0.5} suffix="ч/год на студента" />
        <Slider label="Оценка компетенций куратором" value={hoursCurator} set={setHoursCurator} min={0} max={6} step={0.5} suffix="ч/год на студента" />
        <Slider label="Стоимость часа сотрудника" value={rate} set={setRate} min={200} max={1500} step={50} suffix="₽" />
        <Slider label="Доля работы, которую снимает система" value={share} set={setShare} min={10} max={90} step={5} suffix="%" />
        <Slider label="Стоимость внедрения (разово)" value={impl} set={setImpl} min={300000} max={8000000} step={100000} suffix="₽" />
        <Slider label="Поддержка в год" value={support} set={setSupport} min={5} max={40} step={1} suffix="% от внедрения" />
        <p className="label">Цифры демонстрационные. Замените их данными заказчика: сколько часов уходит сейчас, какова ставка, какой бюджет.</p>
      </div>
      <div className="space-y-6 lg:col-span-7">
        <div className="strip">
          <div><div className="label">Экономия в год</div><div className="v">{money(r.saveYear)}</div></div>
          <div><div className="label">Поддержка в год</div><div className="v">{money(r.costYear)}</div></div>
          <div><div className="label">Окупаемость</div><div className="v">{isFinite(r.payback) ? `${r.payback < 1 ? "<1" : fmt(r.payback)} мес.` : "не окупается"}</div></div>
        </div>
        <div className="card">
          <h2>Накопленный результат за 5 лет</h2>
          <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label="Накопленный результат">
            <line x1={L} x2={W - L} y1={y(0)} y2={y(0)} stroke="var(--line)" />
            {r.cum.map((v, i) => {
              const x = L + 7 + i * ((W - L * 2) / 6) + 0; const y0 = y(0), y1 = y(v);
              return (
                <g key={i}>
                  <rect x={x} y={Math.min(y0, y1)} width={bw} height={Math.max(2, Math.abs(y1 - y0))} rx={3} fill={v >= 0 ? "var(--accent)" : "var(--track)"} />
                  <text x={x + bw / 2} y={H - 10} textAnchor="middle" fontSize={11} fill="var(--muted)">{i === 0 ? "старт" : `год ${i}`}</text>
                  <text x={x + bw / 2} y={v >= 0 ? y1 - 6 : y1 + 15} textAnchor="middle" fontSize={11} fill="var(--ink)">{(v / 1e6).toFixed(1).replace(".", ",")} млн</text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="card">
          <h2>Что это значит</h2>
          <ul className="mt-2 text-sm">
            <li className="rule-row"><i className="mark" />Чистая выгода в год: <b className="ml-1">{money(r.net)}</b></li>
            <li className="rule-row"><i className="mark" />Затраты на внедрение окупаются за <b className="ml-1">{isFinite(r.payback) ? `${fmt(r.payback)} мес.` : "—"}</b></li>
            <li className="rule-row"><i className="mark" />Безубыточность по числу студентов: <b className="ml-1">{isFinite(r.breakEven) ? `от ${fmt(r.breakEven)}` : "—"}</b></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

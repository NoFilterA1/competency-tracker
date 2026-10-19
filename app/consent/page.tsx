import Link from "next/link";
import { Picker } from "@/components/Picker";
import { db } from "@/lib/db";
import { SOURCES, SOURCE_INFO } from "@/lib/config";
import { computeStats, getWeights, type Row, type Student } from "@/lib/model";
import { toggleConsent, setAllConsent } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function Consent({ searchParams }: { searchParams: Promise<{ student?: string }> }) {
  const { student } = await searchParams;
  const d = db();
  const all = d.prepare("select id, name, grp from students order by name").all() as unknown as Student[];
  const me = all.find((s) => s.id === Number(student)) ?? all.find((s) => s.id === 3) ?? all[0];
  const raw = d.prepare("select student_id, date, source, title, competency, points from activities where student_id = ?").all(me.id) as unknown as Row[];
  const off = new Set((d.prepare("select source from consents where student_id = ? and enabled = 0").all(me.id) as unknown as { source: string }[]).map((x) => x.source));
  const w = getWeights();
  const eff = (rows: Row[]) => rows.map((r) => ({ ...r, points: Math.round(r.points * (w[r.source] ?? 1)) }));
  const now = computeStats(me, eff(raw.filter((r) => !off.has(r.source))));
  const full = computeStats(me, eff(raw));
  const per = SOURCES.map((s) => { const rr = raw.filter((r) => r.source === s); return { s, n: rr.length, pts: rr.reduce((a, r) => a + r.points, 0), on: !off.has(s) }; });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-12">
          <h1 className="display text-4xl sm:text-5xl">Центр согласий</h1>
          <p className="muted mt-3 max-w-xl text-[1.05rem] leading-relaxed">
            Студент сам решает, какие источники участвуют в его профиле. Отключённый источник сразу исключается из расчёта,
            а уровни пересчитываются. Данные можно выгрузить в любой момент.
          </p>
        </div>
        <form className="card embed-hide flex flex-col justify-center gap-2 lg:col-span-5" method="get">
          <label className="label" htmlFor="st">Студент</label>
          <div className="flex gap-2">
            <Picker name="student" label="Студент" className="min-w-0 flex-1" defaultValue={me.id} options={all.map((s) => ({ value: s.id, label: `${s.name} · ${s.grp}` }))} />
            <button className="btn">Показать</button>
          </div>
        </form>
      </div>

      <div className="strip">
        <div><div className="label">Уровень с учётом согласий</div><div className="v">{now.overall.level} · {now.overall.name}</div></div>
        <div><div className="label">Уровень со всеми источниками</div><div className="v">{full.overall.level} · {full.overall.name}</div></div>
        <div><div className="label">Включено источников</div><div className="v">{per.filter((p) => p.on).length} <span className="muted text-base">из {SOURCES.length}</span></div></div>
        <div className="flex flex-wrap items-center gap-2">
          <form action={setAllConsent}><input type="hidden" name="student_id" value={me.id} /><input type="hidden" name="enabled" value="0" /><button className="btn-ghost">Отключить все</button></form>
          <form action={setAllConsent}><input type="hidden" name="student_id" value={me.id} /><input type="hidden" name="enabled" value="1" /><button className="btn-ghost">Включить все</button></form>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {per.map((p) => (
          <div key={p.s} className="card" style={{ opacity: p.on ? 1 : 0.6 }}>
            <div className="flex items-start justify-between gap-3">
              <div><div className="display text-xl">{p.s}</div><div className="label mt-0.5">{p.n} записей · {p.pts} баллов</div></div>
              <form action={toggleConsent}>
                <input type="hidden" name="student_id" value={me.id} /><input type="hidden" name="source" value={p.s} /><input type="hidden" name="enabled" value={p.on ? 0 : 1} />
                <button className="relative inline-block h-6 w-11 rounded-full" aria-label={p.on ? "Отключить" : "Включить"} style={{ background: p.on ? "var(--accent)" : "var(--track)" }}>
                  <span className="absolute top-0.5 h-5 w-5 rounded-full" style={{ left: p.on ? 22 : 2, background: p.on ? "var(--on-accent)" : "var(--card)", transition: "left .18s ease" }} />
                </button>
              </form>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div><dt className="label">Что берём</dt><dd>{SOURCE_INFO[p.s].takes}</dd></div>
              <div><dt className="label">Чего не берём</dt><dd>{SOURCE_INFO[p.s].skips}</dd></div>
            </dl>
          </div>
        ))}
      </div>

      <div className="embed-hide grid gap-6 md:grid-cols-2">
        <div className="card flex flex-col">
          <h2>Ваши данные</h2>
          <p className="muted mt-2 text-sm">Полная выгрузка профиля и записей цифрового следа в формате JSON. Её можно сделать в любой момент, независимо от выбранных источников.</p>
          <div className="mt-auto pt-5">
            <a href={`/api/export/${me.id}`} className="btn" download>Скачать мои данные</a>
          </div>
        </div>
        <div className="card flex flex-col">
          <h2>Принципы</h2>
          <ul className="mt-2 flex flex-1 flex-col justify-between text-sm">
            <li className="rule-row flex-1"><i className="mark" />Берём только то, что нужно для расчёта компетенций</li>
            <li className="rule-row flex-1"><i className="mark" />Источник можно отключить в любой момент</li>
            <li className="rule-row flex-1"><i className="mark" />Порядок согласия и хранения данных нужно уточнить с заказчиком и вузом</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

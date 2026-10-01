import { COMPETENCIES, LEVEL_MIN, LEVEL_NAMES, SOURCES, TEMPLATES } from "@/lib/config";
import { getWeights } from "@/lib/model";
import { saveWeights, resetWeights } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function Method() {
  const w = getWeights();
  const changed = SOURCES.some((s) => (w[s] ?? 1) !== 1);
  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <h1 className="display text-4xl sm:text-5xl">Методика</h1>
        <p className="muted mt-3 text-[1.05rem] leading-relaxed">
          Как из цифрового следа получается уровень компетенции. Все правила открыты и настраиваются: куратор или заказчик
          меняет веса источников, и профили пересчитываются сразу.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="card lg:col-span-5">
          <h2>1. Формула</h2>
          <div className="mt-3 space-y-3 text-sm">
            <p className="rounded-lg p-3 font-mono text-[13px] leading-relaxed" style={{ background: "var(--bg)" }}>
              баллы компетенции = Σ (баллы записи × вес источника)
            </p>
            <p className="muted">Каждая запись цифрового следа относится к одной компетенции и приносит баллы. Баллы суммируются по всем включённым источникам,
              а студент может отключить любой источник в центре согласий.</p>
            <p className="muted">Общий уровень студента: среднее по восьми компетенциям.</p>
          </div>
        </div>
        <div className="card lg:col-span-7">
          <h2>2. Пороги уровней</h2>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {LEVEL_NAMES.map((n, k) => (
              <div key={n} className="rounded-lg p-3" style={{ background: "var(--bg)", border: "1px solid var(--line)" }}>
                <div className="display text-3xl" style={{ color: "var(--accent)" }}>{k + 1}</div>
                <div className="mt-1 text-sm font-semibold">{n}</div>
                <div className="label">от {LEVEL_MIN[k]}</div>
              </div>
            ))}
          </div>
          <p className="muted mt-3 text-sm">Значения ориентировочные. В пилоте их калибруют по данным вуза и оценкам экспертов.</p>
        </div>
      </div>

      <form action={saveWeights} className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2>3. Веса источников</h2><p className="muted mt-1 text-sm">Вес 1,0 значит «как есть». Меньше 1,0 снижает вклад источника, больше повышает. Допустимо от 0 до 3.</p></div>
          {changed && <span className="pill" style={{ color: "var(--warn)", borderColor: "var(--warn)" }}>веса изменены</span>}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SOURCES.map((s) => (
            <label key={s} className="flex items-center justify-between gap-3 rounded-lg border p-3" style={{ borderColor: "var(--line)" }}>
              <span><span className="font-medium">{s}</span><span className="label block">сейчас ×{(w[s] ?? 1).toString().replace(".", ",")}</span></span>
              <input name={"w_" + s} defaultValue={w[s] ?? 1} inputMode="decimal" className="input !w-20 text-center" />
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="btn">Применить и пересчитать</button>
          <button className="btn-ghost" formAction={resetWeights}>Вернуть 1,0</button>
        </div>
      </form>

      <div className="card overflow-x-auto">
        <h2>4. Какие источники питают какие компетенции</h2>
        <table className="tbl mt-3 w-full text-sm" style={{ minWidth: 640 }}>
          <thead><tr><th>Компетенция</th>{SOURCES.map((s) => <th key={s} className="text-center">{s}</th>)}</tr></thead>
          <tbody>
            {COMPETENCIES.map((c) => (
              <tr key={c.key}>
                <td className="font-medium">{c.name}</td>
                {SOURCES.map((s) => {
                  const hit = TEMPLATES[c.key].some((t) => t[0] === s);
                  return <td key={s} className="text-center">{hit ? <i className="mark" style={{ marginRight: 0 }} /> : <span className="muted">·</span>}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: "28px 24px" }}>
        <h2>Как проверяется самооценка</h2>
        <div className="relative mt-7 grid gap-9 md:grid-cols-3">
          <div className="absolute top-5 hidden md:block" style={{ left: "17%", right: "17%", borderTop: "2px solid var(--line)" }} />
          {[["Опрос самооценки", "16 вопросов о поведении и частоте действий. Нет «правильных» ответов, поэтому результат труднее подогнать."],
            ["Сверка со следом", "Самооценка сравнивается с цифровым следом. Расхождение показывается как «самооценка выше» или «след выше»."],
            ["Подтверждение", "Если самооценка выше следа, студент даёт пример, а куратор подтверждает его. Только тогда уровень засчитывается."]].map(([h, t], k) => (
            <div key={h} className="relative text-center">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold" style={{ border: "2px solid var(--accent)", color: "var(--accent)", background: "var(--card)" }}>{k + 1}</span>
              <h3 className="display mt-4 text-xl">{h}</h3>
              <p className="muted mx-auto mt-2 max-w-xs text-sm leading-relaxed">{t}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="label max-w-3xl">Это прототип. Методику (веса, пороги, набор вопросов) нужно согласовать с заказчиком и проверить на реальных данных пилота.</p>
    </div>
  );
}

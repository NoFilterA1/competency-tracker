import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { getAll } from "@/lib/model";
import { RadarBlock } from "@/components/Charts";
import { PrintButton } from "@/components/PrintButton";
import { codeFor, period } from "@/lib/passport";

export const dynamic = "force-dynamic";

export default async function Passport({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = getAll().stats.find((s) => s.student.id === Number(id));
  if (!me) notFound();
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const code = codeFor(me.student.id);
  const url = `${origin}/verify/${code}`;
  const qr = await QRCode.toString(url, { type: "svg", margin: 0, color: { dark: "#111111", light: "#ffffff" } });
  const conf = db().prepare("select e.competency c from evidence e join survey_results r on r.id = e.survey_id where r.student_id = ? and e.status = 'confirmed'").all(me.student.id) as unknown as { c: string }[];
  const confirmed = new Set(conf.map((x) => x.c));
  const radar = me.comps.map((c) => ({ name: c.short, value: +c.float.toFixed(2), avg: 0 }));
  const issued = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="passport-wrap">
      <div className="no-print embed-hide mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/student/${me.student.id}`} className="muted text-sm">← к профилю</Link>
        <div className="flex flex-wrap gap-2"><Link href={`/share/${me.student.id}`} className="btn-ghost">Карточка для соцсетей</Link><PrintButton /></div>
      </div>
      <article className="card passport" style={{ padding: 36 }}>
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="label">Паспорт компетенций · выдан {issued}</div>
            <h1 className="display mt-2 text-4xl">{me.student.name}</h1>
            <div className="muted mt-1">{me.student.grp} · ЮГУ</div>
          </div>
          <div className="text-right">
            <div className="label">Общий уровень</div>
            <div className="display text-7xl leading-[.85]" style={{ color: "var(--accent)" }}>{me.overall.level}</div>
            <div className="mt-1 font-semibold">{me.overall.name}</div>
          </div>
        </header>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <RadarBlock data={radar} name={me.student.name} avgName="" />
          <table className="tbl w-full text-sm" style={{ tableLayout: "fixed" }}>
            <colgroup><col style={{ width: "44%" }} /><col style={{ width: "36%" }} /><col style={{ width: "20%" }} /></colgroup>
            <thead><tr><th>Компетенция</th><th>Уровень</th><th style={{ textAlign: "center" }}>Баллы</th></tr></thead>
            <tbody>
              {me.comps.map((c) => (
                <tr key={c.key}>
                  <td className="py-3 pr-3 leading-snug">{c.name}{confirmed.has(c.key) && <span className="pill ml-2 whitespace-nowrap" style={{ fontSize: ".68rem", padding: "1px 6px" }}>подтверждено</span>}</td>
                  <td className="py-3">
                    <span className="flex items-center gap-2.5">
                      <span className="lvlbox">{c.level}</span>
                      <span className="leading-tight"><span className="block font-medium">{c.levelName}</span><span className="dots mt-1">{[1, 2, 3, 4, 5].map((k) => <i key={k} className={k <= c.level ? "on" : ""} />)}</span></span>
                    </span>
                  </td>
                  <td className="num py-3 text-center text-base font-semibold">{c.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="mt-8 flex flex-wrap items-center justify-between gap-6 border-t pt-6" style={{ borderColor: "var(--line)" }}>
          <div className="max-w-md text-sm">
            <div className="font-semibold">Проверка подлинности</div>
            <p className="muted mt-1">Отсканируйте код или откройте ссылку, чтобы проверить паспорт. Уровни рассчитаны по цифровому следу ({me.sources} источников, {me.count} записей).</p>
            <div className="label mt-2">Код: {code} · период {period()}</div>
          </div>
          <div className="h-28 w-28 shrink-0 rounded-lg bg-white p-2" dangerouslySetInnerHTML={{ __html: qr }} />
        </footer>
      </article>
      <p className="label no-print embed-hide mt-3 text-center">Прототип. Данные демонстрационные.</p>
    </div>
  );
}

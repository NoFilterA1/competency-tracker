import Link from "next/link";
import { getAll } from "@/lib/model";
import { checkCode } from "@/lib/passport";

export const dynamic = "force-dynamic";

export default async function Verify({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ok = checkCode(code);
  const me = ok ? getAll().stats.find((s) => s.student.id === ok.id) : undefined;
  return (
    <div className="mx-auto max-w-lg">
      <div className="card" style={{ padding: 28, borderColor: me ? "var(--good)" : "var(--warn)" }}>
        <div className="label">Проверка паспорта компетенций</div>
        {me ? (
          <>
            <h1 className="display mt-2 text-3xl" style={{ color: "var(--good)" }}>Паспорт подлинный</h1>
            <p className="mt-4 text-lg"><b>{me.student.name}</b>, {me.student.grp}</p>
            <p className="muted mt-1">Общий уровень: {me.overall.level} · {me.overall.name}. Период выдачи: {ok!.period}.</p>
            <Link href={`/passport/${me.student.id}`} className="btn mt-5">Открыть паспорт</Link>
          </>
        ) : (
          <>
            <h1 className="display mt-2 text-3xl" style={{ color: "var(--warn)" }}>Паспорт не найден</h1>
            <p className="muted mt-3">Код <code>{code}</code> не совпал ни с одним выданным паспортом или срок его действия истёк.</p>
          </>
        )}
      </div>
    </div>
  );
}

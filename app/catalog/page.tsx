import Link from "next/link";
import { CATALOG, dateIn } from "@/lib/catalog";
import { COMPETENCIES } from "@/lib/config";
import { Picto } from "@/components/Pictos";

export const dynamic = "force-dynamic";

export default async function Catalog({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const list = CATALOG.filter((x) => !c || x.comp === c).sort((a, b) => a.inDays - b.inDays);
  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <h1 className="display text-4xl sm:text-5xl">Каталог активностей</h1>
        <p className="muted mt-3 text-[1.05rem] leading-relaxed">Что делать, чтобы компетенция росла. Каждая активность показывает, сколько баллов и в какой компетенции она даст. Данные демонстрационные: в пилоте каталог подтягивается из Leader-ID, Projects 2035 и вуза.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/catalog" className="pill" style={!c ? { borderColor: "var(--accent)", color: "var(--accent)" } : undefined}>Все</Link>
        {COMPETENCIES.map((k) => (
          <Link key={k.key} href={`/catalog?c=${k.key}`} className="pill flex items-center gap-1.5" style={c === k.key ? { borderColor: "var(--accent)", color: "var(--accent)" } : undefined}>
            <Picto k={k.key} size={14} />{k.short}
          </Link>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((x) => {
          const comp = COMPETENCIES.find((k) => k.key === x.comp)!;
          return (
            <div key={x.id} className="card lift flex flex-col">
              <div className="flex items-center justify-between gap-2 text-sm"><span className="flex items-center gap-1.5" style={{ color: "var(--accent)" }}><Picto k={x.comp} size={18} />{comp.name}</span><span className="display text-2xl" style={{ color: "var(--accent)" }}>+{x.points}</span></div>
              <div className="mt-3 font-semibold leading-snug">{x.title}</div>
              <div className="label mt-auto pt-4">{x.kind} · {x.source} · {x.place}</div>
              <div className="label">{dateIn(x.inDays)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

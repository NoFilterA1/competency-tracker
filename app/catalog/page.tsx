import { CATALOG } from "@/lib/catalog";
import { CatalogBrowser } from "@/components/CatalogBrowser";

export const dynamic = "force-dynamic";

export default async function Catalog({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <h1 className="display text-4xl sm:text-5xl">Каталог активностей</h1>
        <p className="muted mt-3 text-[1.05rem] leading-relaxed">Что делать, чтобы компетенция росла. Каждая активность показывает, сколько баллов и в какой компетенции она даст. Данные демонстрационные: в пилоте каталог подтягивается из Leader-ID, Projects 2035 и вуза.</p>
      </div>
      <CatalogBrowser items={CATALOG} initial={c ?? ""} />
    </div>
  );
}

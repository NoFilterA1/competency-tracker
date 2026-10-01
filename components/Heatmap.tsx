import type { Stats } from "@/lib/model";

export function Heatmap({ heat }: { heat: Stats["heat"] }) {
  return (
    <div className="flex gap-[3px] overflow-x-auto pb-1">
      {heat.map((col, i) => (
        <div key={i} className="flex flex-col gap-[3px]">
          {col.map((c) => (
            <div
              key={c.date}
              title={`${c.date}: ${c.count} акт.`}
              style={{
                width: 13, height: 13, borderRadius: 2,
                background: c.future ? "transparent" : c.count === 0 ? "var(--track)" : "var(--accent)",
                opacity: c.future ? 0 : c.count === 0 ? 1 : Math.min(1, 0.35 + c.count * 0.25),
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

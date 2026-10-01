/* Plain SVG charts: no measuring, so they print and embed reliably; colours come from CSS variables. */
type RadarDatum = { name: string; value: number; avg: number };

const CX = 200, CY = 165, R = 118;
const pt = (i: number, n: number, v: number) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
  return [CX + Math.cos(a) * R * (v / 5), CY + Math.sin(a) * R * (v / 5)] as const;
};
const poly = (vals: number[]) => "M" + vals.map((v, i) => pt(i, vals.length, v).map((x) => x.toFixed(1)).join(",")).join("L") + "Z";

export function RadarBlock({ data, name, avgName, animate = false, height = 340 }: { data: RadarDatum[]; name: string; avgName: string; animate?: boolean; height?: number }) {
  const n = data.length;
  const tr = animate ? "d 550ms cubic-bezier(.2,.8,.2,1)" : undefined;
  return (
    <div>
      <svg viewBox="0 0 400 330" role="img" aria-label="Радар компетенций" style={{ width: "100%", maxHeight: height, display: "block", margin: "0 auto" }}>
        {[1, 2, 3, 4, 5].map((k) => (
          <polygon key={k} points={data.map((_, i) => pt(i, n, k).join(",")).join(" ")} fill="none" stroke="var(--line)" strokeWidth={1} />
        ))}
        {data.map((_, i) => { const [x, y] = pt(i, n, 5); return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="var(--line)" strokeWidth={1} />; })}
        {avgName ? <path d={poly(data.map((d) => d.avg))} style={{ d: `path("${poly(data.map((d) => d.avg))}")`, transition: tr }} fill="var(--warn)" fillOpacity={0.12} stroke="var(--warn)" strokeWidth={1.5} strokeDasharray="4 3" /> : null}
        <path className="radar-in" d={poly(data.map((d) => d.value))} style={{ d: `path("${poly(data.map((d) => d.value))}")`, transition: tr }} fill="var(--accent)" fillOpacity={0.3} stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" />
        {data.map((d, i) => {
          const [x, y] = pt(i, n, 5.75);
          const anchor = Math.abs(x - CX) < 8 ? "middle" : x > CX ? "start" : "end";
          return <text key={d.name} x={x} y={y + 4} textAnchor={anchor} fontSize={11.5} fill="var(--muted)">{d.name}</text>;
        })}
      </svg>
      <div className="mt-1 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs">
        <span className="flex items-center gap-1.5" style={{ color: "var(--accent)" }}><i className="mark" style={{ marginRight: 0 }} />{name}</span>
        {avgName ? <span className="flex items-center gap-1.5" style={{ color: "var(--warn)" }}><i className="mark" style={{ marginRight: 0, background: "var(--warn)" }} />{avgName}</span> : null}
      </div>
    </div>
  );
}

export function LineBlock({ data, step: stepProp, topProp }: { data: { label: string; value: number }[]; step?: number; topProp?: number }) {
  const W = 600, H = 215, L = 46, Rr = 16, T = 14, B = 30;
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = stepProp ?? (max <= 600 ? 200 : max <= 1500 ? 500 : 1000);
  const top = topProp ?? Math.ceil(max / step) * step;
  const x = (i: number) => L + (i * (W - L - Rr)) / Math.max(1, data.length - 1);
  const y = (v: number) => T + (1 - v / top) * (H - T - B);
  const ticks = Array.from({ length: top / step + 1 }, (_, k) => k * step);
  const path = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join("");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Динамика баллов" style={{ width: "100%", display: "block" }}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - Rr} y1={y(t)} y2={y(t)} stroke="var(--line)" />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="var(--muted)">{t}</text>
        </g>
      ))}
      <path d={`${path}L${x(data.length - 1)},${y(0)}L${x(0)},${y(0)}Z`} fill="var(--accent)" fillOpacity={0.08} />
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={d.label}>
          <circle cx={x(i)} cy={y(d.value)} r={3.5} fill="var(--card)" stroke="var(--accent)" strokeWidth={2}><title>{`${d.label}: ${d.value}`}</title></circle>
          {(i % 2 === 0 || data.length < 8) && <text x={x(i)} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--muted)">{d.label}</text>}
        </g>
      ))}
    </svg>
  );
}

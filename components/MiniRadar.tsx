/* Tiny radar silhouette used on cards. Pure SVG. */
export function MiniRadar({ values, size = 96 }: { values: number[]; size?: number }) {
  const n = values.length, c = 50, r = 40;
  const p = (i: number, v: number) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return `${(c + Math.cos(a) * r * (v / 5)).toFixed(1)},${(c + Math.sin(a) * r * (v / 5)).toFixed(1)}`; };
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      {[2.5, 5].map((k) => <polygon key={k} points={values.map((_, i) => p(i, k)).join(" ")} fill="none" stroke="var(--line)" strokeWidth={1} />)}
      <polygon className="poly" points={values.map((v, i) => p(i, v)).join(" ")} fill="var(--accent)" fillOpacity={0.28} stroke="var(--accent)" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  );
}

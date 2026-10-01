export function Picto({ k, size = 28 }: { k: string; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (k) {
    case "communication": return <svg {...p}><path d="M4 5h16v10H9l-5 4V5z" /></svg>;
    case "critical": return <svg {...p}><circle cx="11" cy="11" r="6" /><path d="M16 16l5 5" /></svg>;
    case "teamwork": return <svg {...p}><circle cx="12" cy="6" r="2.4" /><circle cx="6" cy="17" r="2.4" /><circle cx="18" cy="17" r="2.4" /><path d="M10.6 8l-3.2 6.8M13.4 8l3.2 6.8M8.5 17h7" /></svg>;
    case "leadership": return <svg {...p}><path d="M6 21V4" /><path d="M6 4h12l-3 4 3 4H6" /></svg>;
    case "digital": return <svg {...p}><rect x="3" y="4.5" width="18" height="12" rx="1.5" /><path d="M8 21h8M12 16.5V21" /></svg>;
    case "project": return <svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" /></svg>;
    case "selfdev": return <svg {...p}><path d="M4 18l5-5 4 4 7-8" /><path d="M15 9h5v5" /></svg>;
    case "prof": return <svg {...p}><rect x="3" y="8" width="18" height="12" rx="2" /><path d="M9 8V6h6v2M3 13h18" /></svg>;
    default: return null;
  }
}

export function FreqBars({ level, active }: { level: number; active?: boolean }) {
  return (
    <svg width="26" height="18" viewBox="0 0 26 18" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={i * 7} y={18 - (i + 1) * 4.2} width="5" height={(i + 1) * 4.2} rx="1"
          fill={i < level ? (active ? "var(--on-accent)" : "var(--accent)") : "var(--track)"} />
      ))}
    </svg>
  );
}

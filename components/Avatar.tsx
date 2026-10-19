import { useId } from "react";

const SKIN = ["#f6d6c0", "#eebb98", "#d99c72", "#b87649", "#855033"];
const HAIR = ["#2a2019", "#45301f", "#6e4526", "#a9743a", "#d3ac66", "#8a3524", "#3c3d47"];
const TOPS = ["#3e6b8a", "#7a4f8f", "#b5563f", "#3f7d63", "#c18a2e", "#51586b", "#a8486a", "#2f5f6b"];
const MALE_A = new Set(["Илья", "Никита", "Савва", "Кузьма", "Фома"]);

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)];

/** «Фамилия Имя»: женское имя оканчивается на а/я, кроме нескольких мужских. */
export const isFemale = (name: string) => {
  const first = name.trim().split(" ")[1] ?? name;
  return /[ая]$/i.test(first) && !MALE_A.has(first);
};

function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${c(n >> 16)}, ${c((n >> 8) & 255)}, ${c(n & 255)})`;
}

export function Avatar({ name, size = 40, className = "" }: { name: string; size?: number; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const r = rng(hash(name));
  const fem = isFemale(name);
  const skin = pick(r, SKIN);
  const hair = pick(r, HAIR);
  const top = pick(r, TOPS);
  const hue = Math.floor(r() * 360);
  const style = Math.floor(r() * 4);
  const glasses = r() < 0.28;
  const beard = !fem && r() < 0.22;
  const mouth = Math.floor(r() * 3);
  const brow = Math.floor(r() * 3);
  const vneck = r() < 0.5;
  const dark = shade(skin, 0.86);

  const back = fem && style !== 3 ? (style === 0 ? "M28 44 C24 70 26 84 32 88 L68 88 C74 84 76 70 72 44 Z" : style === 1 ? "M29 44 C26 58 28 66 34 68 L66 68 C72 66 74 58 71 44 Z" : "M30 40 C27 52 29 60 33 62 L67 62 C71 60 73 52 70 40 Z") : null;
  let front: React.ReactNode;
  if (fem) {
    front = style === 2
      ? <><path d="M31 44 C28 24 42 18 50 18 C60 18 73 25 69 44 C66 34 60 30 50 30 C41 30 35 34 31 44Z" fill={hair} /><ellipse cx="50" cy="15" rx="8" ry="6.5" fill={hair} /></>
      : style === 3
        ? <><path d="M31 44 C28 24 42 18 50 18 C60 18 73 25 69 44 C66 34 60 30 50 30 C41 30 35 34 31 44Z" fill={hair} /><path d="M66 30 C78 32 80 50 74 62 C72 54 70 44 66 36Z" fill={hair} /></>
        : <path d="M30 46 C26 22 42 17 50 17 C61 17 74 24 70 46 C68 36 62 28 52 28 C44 28 36 32 30 46Z" fill={hair} />;
  } else {
    front = style === 0
      ? <path d="M32 43 C30 25 41 21 50 21 C60 21 70 25 68 43 C66 35 60 31 50 31 C40 31 34 35 32 43Z" fill={hair} />
      : style === 1
        ? <path d="M32 44 C29 24 42 20 51 20 C62 20 71 26 68 44 C66 36 58 29 44 31 C38 33 34 37 32 44Z" fill={hair} />
        : style === 2
          ? <g fill={hair}>{[[36, 30], [43, 25], [51, 23], [59, 25], [65, 31], [34, 38], [67, 38], [48, 29], [57, 29]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={6.4} />)}</g>
          : <path d="M33 41 C32 28 41 24 50 24 C59 24 68 28 67 41 C64 34 58 32 50 32 C42 32 36 34 33 41Z" fill={hair} opacity=".78" />;
  }

  return (
    <svg className={className} width={size} height={size} viewBox="12 20 76 76" role="img" aria-label={name} style={{ borderRadius: "50%", flexShrink: 0, display: "block" }}>
      <defs>
        <linearGradient id={`bg${uid}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={`hsl(${hue} 55% 80%)`} /><stop offset="1" stopColor={`hsl(${(hue + 40) % 360} 50% 62%)`} /></linearGradient>
        <radialGradient id={`face${uid}`} cx=".4" cy=".35" r=".8"><stop offset="0" stopColor={shade(skin, 1.06)} /><stop offset="1" stopColor={dark} /></radialGradient>
        <clipPath id={`c${uid}`}><circle cx="50" cy="58" r="38" /></clipPath>
      </defs>
      <g clipPath={`url(#c${uid})`}>
        <rect x="0" y="0" width="100" height="100" fill={`url(#bg${uid})`} />
        {back && <path d={back} fill={hair} />}
        <path d="M10 100 C12 80 28 74 50 74 C72 74 88 80 90 100Z" fill={top} />
        <path d="M10 100 C12 80 28 74 50 74 C72 74 88 80 90 100Z" fill="#000" opacity=".08" />
        <rect x="42" y="60" width="16" height="20" rx="6" fill={dark} />
        <path d={vneck ? "M40 76 L50 90 L60 76 C56 80 44 80 40 76Z" : "M40 76 C44 82 56 82 60 76 C57 79 43 79 40 76Z"} fill={vneck ? skin : dark} />
        <circle cx="32.5" cy="49" r="3.6" fill={dark} /><circle cx="67.5" cy="49" r="3.6" fill={dark} />
        <ellipse cx="50" cy="47" rx="17.5" ry="20.5" fill={`url(#face${uid})`} />
        {beard && <path d="M33 52 C34 66 42 71 50 71 C58 71 66 66 67 52 C64 58 58 60 50 60 C42 60 36 58 33 52Z" fill={hair} opacity=".85" />}
        {front}
        {fem && <><circle cx="38.5" cy="55" r="3.6" fill="#e0707a" opacity=".22" /><circle cx="61.5" cy="55" r="3.6" fill="#e0707a" opacity=".22" /></>}
        <g fill="#1e1a18"><ellipse cx="42.5" cy="48.5" rx="2.1" ry="2.6" /><ellipse cx="57.5" cy="48.5" rx="2.1" ry="2.6" /></g>
        <g fill="#fff" opacity=".9"><circle cx="43.2" cy="47.6" r=".7" /><circle cx="58.2" cy="47.6" r=".7" /></g>
        <g stroke={fem ? shade(hair, 0.9) : hair} strokeWidth="1.8" strokeLinecap="round" fill="none">
          {brow === 0 && <><path d="M38.5 43 Q42.5 41 46.5 43" /><path d="M53.5 43 Q57.5 41 61.5 43" /></>}
          {brow === 1 && <><path d="M38.5 43.5 L46.5 42.5" /><path d="M53.5 42.5 L61.5 43.5" /></>}
          {brow === 2 && <><path d="M38.5 43 Q42.5 42 46.5 44" /><path d="M53.5 44 Q57.5 42 61.5 43" /></>}
        </g>
        <path d="M50 50 C48.5 54 48.5 56 50.5 57" stroke={shade(skin, 0.72)} strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <path d={mouth === 0 ? "M44 62 Q50 67 56 62" : mouth === 1 ? "M45 62.5 Q50 65 55 62.5" : "M44.5 62 Q50 68 55.5 62 Q50 64.5 44.5 62Z"} stroke={mouth === 2 ? "none" : "#8a3b3b"} strokeWidth="1.6" strokeLinecap="round" fill={mouth === 2 ? "#a64545" : "none"} />
        {glasses && <g stroke="#2a2a30" strokeWidth="1.5" fill="#ffffff" fillOpacity=".12"><circle cx="42.5" cy="48.5" r="6.2" /><circle cx="57.5" cy="48.5" r="6.2" /><path d="M48.7 48.5 H51.3" fill="none" /></g>}
      </g>
    </svg>
  );
}

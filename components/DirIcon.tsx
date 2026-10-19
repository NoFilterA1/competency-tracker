const P: Record<string, React.ReactNode> = {
  lin: <><path d="M4 5h9a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-3 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" /><path d="M17 9h3a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1v3l-3-3h-2" /></>,
  mn: <><rect x="3" y="8" width="18" height="12" rx="2" /><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" /></>,
  pi: <><path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 5l-4 14" /></>,
  yur: <><path d="M12 3v18M7 21h10M5 7h14" /><path d="m5 7-3 7a3 3 0 0 0 6 0L5 7ZM19 7l-3 7a3 3 0 0 0 6 0l-3-7Z" /></>,
  ek: <><path d="M3 20h18M5 16l4-5 3 3 6-8" /><path d="M14 6h4v4" /></>,
  ps: <><path d="M12 3a6 6 0 0 0-6 6c0 2 .8 3 1.8 4.2.7.8 1.2 1.7 1.2 2.8v1h6v-1c0-1.1.5-2 1.2-2.8C17.2 12 18 11 18 9a6 6 0 0 0-6-6Z" /><path d="M10 21h4M12 8v4M10 10h4" /></>,
  dz: <><path d="m4 20 4-1L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" /><path d="m14 7 3 3" /></>,
  zhr: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 9h8M8 13h8M8 17h5" /></>,
};

export function DirIcon({ k, size = 40 }: { k: string; size?: number }) {
  return (
    <span className="diricon" style={{ width: size, height: size }} aria-hidden>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{P[k]}</svg>
    </span>
  );
}

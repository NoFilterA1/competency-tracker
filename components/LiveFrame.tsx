"use client";
import { useEffect, useRef, useState } from "react";

/* Live page inside a slide: follows the current theme/accent, also when printed to PDF. */
export function LiveFrame({ src, w, h, printW }: { src: string; w: number; h: number; printW: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(0.5);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const upd = () => setS(el.clientWidth / w);
    upd();
    const ro = new ResizeObserver(upd);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);
  return (
    <div ref={ref} className="lf" style={{ aspectRatio: `${w} / ${h}`, ["--pw" as string]: `${printW}px`, ["--ps" as string]: printW / w }}>
      <iframe className="lf-live" src={src} title={src} scrolling="no" loading="eager" style={{ width: w, height: h, transform: `scale(${s})` }} />
    </div>
  );
}

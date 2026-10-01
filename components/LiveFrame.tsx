"use client";
import { useEffect, useRef, useState } from "react";

/* Live page inside a slide: follows the current theme/accent. In print, swaps to pre-rendered shots. */
export function LiveFrame({ src, shot, w, h, frac }: { src: string; shot: string; w: number; h: number; frac: number }) {
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
    <div ref={ref} className="lf" style={{ aspectRatio: `${w} / ${h}` }}>
      <iframe className="lf-live" src={src} title={shot} loading="lazy" style={{ width: w, height: h, transform: `scale(${s})` }} />
      <img className="lf-shot lf-light" src={`/slides/${shot}-light.png`} alt="" />
      <img className="lf-shot lf-dark" src={`/slides/${shot}-dark.png`} alt="" />
      <span hidden data-frac={frac} />
    </div>
  );
}

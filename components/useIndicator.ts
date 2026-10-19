"use client";
import { useLayoutEffect, useRef } from "react";

// Скользящая подложка: ставит CSS-переменные --ix/--iy/--iw/--ih по активному элементу контейнера.
export function useIndicator<T extends HTMLElement>(selector: string, dep: unknown) {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const put = () => {
      const t = el.querySelector<HTMLElement>(selector);
      if (!t) { el.style.setProperty("--io", "0"); return; }
      el.style.setProperty("--ix", `${t.offsetLeft}px`);
      el.style.setProperty("--iy", `${t.offsetTop}px`);
      el.style.setProperty("--iw", `${t.offsetWidth}px`);
      el.style.setProperty("--ih", `${t.offsetHeight}px`);
      el.style.setProperty("--io", "1");
    };
    put();
    const raf = requestAnimationFrame(() => el.classList.add("ready"));
    const ro = new ResizeObserver(put);
    ro.observe(el);
    document.fonts?.ready.then(put);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [selector, dep]);
  return ref;
}

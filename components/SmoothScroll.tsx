"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/* Inertial page scrolling (Lenis). Off for "reduce motion", inside iframes (live slides) and on the presentation page. */
export function SmoothScroll() {
  const pathname = usePathname();
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const framed = window.self !== window.top;
    if (reduced || framed || pathname.startsWith("/presentation")) return;
    const lenis = new Lenis({ lerp: 0.12, anchors: true, allowNestedScroll: true, autoRaf: true });
    lenis.scrollTo(0, { immediate: true, force: true });
    return () => lenis.destroy();
  }, [pathname]);
  return null;
}

"use client";
import { flushSync } from "react-dom";

/* Content slides out and in sideways, towards the side of the pressed button. View Transitions where available, CSS fallback otherwise. */
export function slide(update: () => void, forward: boolean, setEnter: (v: "forward" | "back") => void) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  if (!reduced && "startViewTransition" in document) {
    root.dataset.vtdir = forward ? "forward" : "back";
    const t = document.startViewTransition(() => { flushSync(update); });
    t.finished.finally(() => { delete root.dataset.vtdir; });
  } else {
    update();
    if (!reduced) setEnter(forward ? "forward" : "back");
  }
}


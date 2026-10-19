"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function toast(msg: string) {
  window.dispatchEvent(new CustomEvent("app:toast", { detail: msg }));
}
export function themeFx() {
  const h = document.documentElement;
  h.classList.add("theme-fx");
  setTimeout(() => h.classList.remove("theme-fx"), 500);
}

// Глобальные эффекты: появление блоков при прокрутке, волна под курсором на кнопках, тосты.
export function Fx() {
  const path = usePathname();
  const [msg, setMsg] = useState<{ t: string; k: number } | null>(null);

  useEffect(() => {
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches || !!document.querySelector("[data-embed]") || window.self !== window.top;
    if (calm) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting || e.boundingClientRect.top < 0) { e.target.classList.remove("await"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    const scan = () => {
      document.querySelectorAll<HTMLElement>(".rise:not([data-rv]), .hmw:not([data-rv])").forEach((e) => {
        e.dataset.rv = "1";
        if (e.getBoundingClientRect().top > innerHeight - 40) {
          e.classList.add("await");
          io.observe(e);
          setTimeout(() => e.classList.remove("await"), 8000);
        }
      });
    };
    const sweep = () => document.querySelectorAll<HTMLElement>(".await").forEach((e) => { if (e.getBoundingClientRect().top < innerHeight * 0.92) e.classList.remove("await"); });
    let raf = 0;
    const mo = new MutationObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(scan); });
    mo.observe(document.body, { childList: true, subtree: true });
    addEventListener("scroll", sweep, { passive: true });
    scan();
    return () => { mo.disconnect(); io.disconnect(); removeEventListener("scroll", sweep); cancelAnimationFrame(raf); };
  }, [path]);

  useEffect(() => {
    const down = (e: PointerEvent) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>(".btn, .btn-ghost");
      if (!b) return;
      const r = b.getBoundingClientRect();
      b.style.setProperty("--rx", `${e.clientX - r.left}px`);
      b.style.setProperty("--ry", `${e.clientY - r.top}px`);
      b.classList.remove("rip"); void b.offsetWidth; b.classList.add("rip");
    };
    const submit = (e: Event) => {
      const t = (e.target as HTMLElement).getAttribute?.("data-toast");
      if (t) toast(t);
    };
    const on = (e: Event) => setMsg({ t: (e as CustomEvent<string>).detail, k: Date.now() });
    document.addEventListener("pointerdown", down);
    document.addEventListener("submit", submit, true);
    window.addEventListener("app:toast", on);
    return () => { document.removeEventListener("pointerdown", down); document.removeEventListener("submit", submit, true); window.removeEventListener("app:toast", on); };
  }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2600);
    return () => clearTimeout(t);
  }, [msg]);

  return msg ? <div key={msg.k} className="toast" role="status">{msg.t}</div> : null;
}

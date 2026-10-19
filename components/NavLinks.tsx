"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIndicator } from "./useIndicator";

const LINKS: [string, string][] = [["/", "Студенты"], ["/test", "Опрос"], ["/curator", "Куратор"]];

export function NavLinks({ children }: { children?: React.ReactNode }) {
  const path = usePathname();
  const active = path.startsWith("/student") ? "/" : path;
  const ref = useIndicator<HTMLElement>("a[aria-current]", active);
  return (
    <nav ref={ref} className="ind ind-line order-3 -mx-2 flex w-full flex-wrap items-center gap-1 md:order-2 md:mx-0 md:w-auto">
      {LINKS.map(([h, t]) => (
        <Link key={h} href={h} className="navlink" aria-current={active === h ? "page" : undefined}>{t}</Link>
      ))}
      {children}
    </nav>
  );
}

import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource-variable/source-serif-4";
import { ThemeMenu } from "@/components/ThemeMenu";
import { MoreMenu } from "@/components/MoreMenu";
import "./globals.css";

export const metadata: Metadata = {
  title: "Трекер компетенций",
  description: "Прототип: профиль компетенций студента на основе цифрового следа",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

const themeScript = `try{var d=document.documentElement,t=localStorage.getItem('theme'),a=localStorage.getItem('accent');if(t==='light'||t==='dark')d.dataset.theme=t;if(a)d.dataset.accent=a;if(window.self!==window.top)d.dataset.embed='1';addEventListener('storage',function(e){if(e.key!=='theme'&&e.key!=='accent')return;var t=localStorage.getItem('theme'),a=localStorage.getItem('accent');if(t==='light'||t==='dark')d.dataset.theme=t;else delete d.dataset.theme;if(a)d.dataset.accent=a;else delete d.dataset.accent})}catch(e){}`;

function Logo() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
      <polygon points="13,2 23,8 23,18 13,24 3,18 3,8" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      <polygon points="13,7 19,10.5 17.5,17 13,20 8,16 8.5,10.5" fill="var(--accent)" />
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 border-b" style={{ borderColor: "var(--line)", background: "var(--bg)" }}>
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5">
            <Link href="/" className="mr-auto flex items-center gap-2.5">
              <Logo />
              <span className="display text-lg sm:text-xl">Трекер компетенций</span>
              <span className="muted hidden text-xs lg:inline">прототип · демо-данные</span>
            </Link>
            <div className="order-2 md:order-3"><ThemeMenu /></div>
            <nav className="order-3 -mx-2 flex w-full flex-wrap items-center gap-1 md:order-2 md:mx-0 md:w-auto">
              <Link href="/" className="navlink">Студенты</Link>
              <Link href="/test" className="navlink">Опрос</Link>
              <Link href="/curator" className="navlink">Куратор</Link>
              <MoreMenu />
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-7">{children}</main>
        <footer className="mx-auto w-full max-w-7xl px-4 pb-8 pt-2">
          <p className="label border-t pt-4" style={{ borderColor: "var(--line)" }}>
            Прототип команды №36, ЮГУ. Разработка выполнена внешним разработчиком по приглашению Д. Хвостовой. Данные демонстрационные.
          </p>
        </footer>
      </body>
    </html>
  );
}

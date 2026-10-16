import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared portal frame: centered content column + a chapter rail on very wide screens. */
export function PortalLayout({ children }: { children?: ReactNode }) {
  const location = useLocation();
  const path = location.pathname;
  const [chapters, setChapters] = useState<{ el: Element; label: string }[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      const els = Array.from(document.querySelectorAll("[data-chapter]")).map((el) => ({ el, label: el.getAttribute("data-chapter") ?? "" }));
      setChapters(els);
    }, 50);
    return () => clearTimeout(t);
  }, [path]);

  useEffect(() => {
    if (!chapters.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(chapters.findIndex((c) => c.el === e.target))),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    chapters.forEach((c) => io.observe(c.el));
    return () => io.disconnect();
  }, [chapters]);

  return (
    <>
      {chapters.length > 1 && (
        <nav aria-label="Page sections" className="fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 min-[1480px]:flex">
          {chapters.map((c, i) => (
            <button
              key={i}
              onClick={() => {
                const l = (window as unknown as { __lenis?: { scrollTo: (el: Element, o: object) => void } | null }).__lenis;
                if (l) l.scrollTo(c.el, { offset: -110 });
                else c.el.scrollIntoView({ behavior: "smooth" });
              }}
              className="group flex items-center gap-3 text-left"
            >
              <span className={cn("h-px transition-all", i === active ? "w-8 bg-signal" : "w-4 bg-muted-foreground/40 group-hover:w-6")} />
              <span className={cn("max-w-28 truncate font-mono text-[10px] uppercase tracking-[0.2em] transition-colors", i === active ? "text-foreground" : "text-muted-foreground/60")}>{c.label}</span>
            </button>
          ))}
        </nav>
      )}
      <div className="mx-auto w-full max-w-[1240px] px-4 md:px-6">
        {children ?? <Outlet />}
      </div>
    </>
  );
}

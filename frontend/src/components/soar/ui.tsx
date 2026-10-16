import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, useEffect, useRef, useState, type ReactNode, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/sim/store";

export const gbtn = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        signal: "bg-signal-gradient text-primary-foreground shadow-glow hover:brightness-110 hover:-translate-y-px",
        glass: "glass text-foreground hover:bg-accent",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-accent",
        danger: "bg-alert/15 text-alert ring-1 ring-alert/40 hover:bg-alert/25",
        grove: "bg-grove/15 text-grove ring-1 ring-grove/40 hover:bg-grove/25",
        outline: "ring-1 ring-hairline text-foreground hover:bg-accent",
      },
      size: { sm: "h-8 px-3 text-xs", md: "h-10 px-5", lg: "h-12 px-7 text-base", icon: "h-9 w-9" },
    },
    defaultVariants: { variant: "glass", size: "md" },
  },
);

export const GButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof gbtn>>(
  ({ className, variant, size, ...p }, ref) => <button ref={ref} className={cn(gbtn({ variant, size }), className)} {...p} />,
);
GButton.displayName = "GButton";

export function Glass({ className, children, strong }: { className?: string; children: ReactNode; strong?: boolean }) {
  return <div className={cn(strong ? "glass-strong" : "glass", "rounded-3xl", className)}>{children}</div>;
}

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setIn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setIn(true), io.disconnect()), { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn("reveal", inView && "in", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function Chapter({ id, eyebrow, title, aside, children, className }: { id?: string; eyebrow?: string; title?: ReactNode; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section id={id} data-chapter={eyebrow} className={cn("min-w-0 scroll-mt-28 py-10 md:py-14", className)}>
      <Reveal>
        {(eyebrow || title) && (
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              {eyebrow && <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.25em] text-signal">{eyebrow}</p>}
              {title && <h2 className="text-2xl font-medium md:text-3xl">{title}</h2>}
            </div>
            {aside && <div className="flex flex-wrap items-center gap-2">{aside}</div>}
          </div>
        )}
        {children}
      </Reveal>
    </section>
  );
}

export function PageIntro({ kicker, title, children, aside }: { kicker: string; title: ReactNode; children?: ReactNode; aside?: ReactNode }) {
  return (
    <header className="pb-4 pt-2">
      <Reveal>
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">{kicker}</p>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            <h1 className="text-3xl font-medium leading-[1.1] md:text-5xl">{title}</h1>
            {children && <p className="mt-4 max-w-2xl text-muted-foreground">{children}</p>}
          </div>
          {aside && <div className="flex flex-wrap items-center gap-2">{aside}</div>}
        </div>
      </Reveal>
    </header>
  );
}

export function Stat({ label, value, hint, tone = "default" }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "default" | "signal" | "grove" | "alert" }) {
  const toneCls = { default: "text-foreground", signal: "text-signal", grove: "text-grove", alert: "text-alert" }[tone];
  return (
    <div className="glass min-w-0 rounded-3xl p-5">
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-3 truncate font-mono text-2xl tabular md:text-3xl", toneCls)}>{value}</p>
      {hint && <p className="mt-2 truncate text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const sevCls: Record<string, string> = {
  CRITICAL: "bg-alert/15 text-alert ring-alert/40",
  HIGH: "bg-signal/15 text-signal ring-signal/40",
  MEDIUM: "bg-sky/15 text-sky ring-sky/30",
  LOW: "bg-grove/15 text-grove ring-grove/30",
  ONLINE: "bg-grove/15 text-grove ring-grove/30",
  DEGRADED: "bg-signal/15 text-signal ring-signal/40",
  STANDBY: "bg-muted text-muted-foreground ring-hairline",
  AUTO_BLOCK: "bg-alert/15 text-alert ring-alert/40",
  AUTO_BLOCKED: "bg-alert/15 text-alert ring-alert/40",
  MANUAL_BLOCK: "bg-signal/15 text-signal ring-signal/40",
  BLOCKED: "bg-signal/15 text-signal ring-signal/40",
  ESCALATED: "bg-signal/15 text-signal ring-signal/40",
  ESCALATE: "bg-sky/15 text-sky ring-sky/30",
  FALSE_POSITIVE: "bg-grove/15 text-grove ring-grove/30",
  MONITOR: "bg-grove/15 text-grove ring-grove/30",
  PENDING: "bg-signal/15 text-signal ring-signal/40",
};
export function Pill({ children, tone, className }: { children: ReactNode; tone?: Severity | string; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ring-1", sevCls[tone ?? String(children)] ?? "bg-muted text-muted-foreground ring-hairline", className)}>
      {children}
    </span>
  );
}

export function Dot({ tone = "grove", pulse }: { tone?: "grove" | "signal" | "alert"; pulse?: boolean }) {
  const c = { grove: "bg-grove", signal: "bg-signal", alert: "bg-alert" }[tone];
  return (
    <span className="relative inline-flex h-2 w-2 shrink-0">
      {pulse && <span className={cn("pulse-ring absolute inset-0 rounded-full", c)} />}
      <span className={cn("relative h-2 w-2 rounded-full", c)} />
    </span>
  );
}

/** Ticks once per second after hydration; returns a stable constant on the server. */
export function useNow(interval = 1000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(t);
  }, [interval]);
  return now;
}

export function Segmented<T extends string>({ value, options, onChange, className }: { value: T; options: readonly T[] | { value: T; label: string }[]; onChange: (v: T) => void; className?: string }) {
  const opts = (options as (T | { value: T; label: string })[]).map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <div className={cn("glass flex max-w-full gap-1 overflow-x-auto rounded-full p-1", className)}>
      {opts.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
            value === o.value ? "bg-signal text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const fieldCls = "h-10 rounded-full bg-muted px-4 text-sm text-foreground ring-1 ring-hairline outline-none placeholder:text-muted-foreground focus:ring-signal";

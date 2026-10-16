import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Satellite, Zap, ArrowRight, Menu, X, LayoutDashboard, Crosshair, Orbit, Bot, Globe2, Activity,
  ListChecks, BrainCircuit, SlidersHorizontal, History, ShieldCheck, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSim } from "@/lib/sim/store";
import { useUI } from "@/lib/sim/ui-store";
import { Dot, gbtn } from "./ui";
import { usePassCountdown } from "./passes";

const CLIENT = [
  { to: "/client/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/client/command-center", label: "Command", icon: Crosshair },
  { to: "/client/passes", label: "Passes", icon: Orbit },
  { to: "/client/map", label: "Threat Map", icon: Globe2 },
  { to: "/client/automation", label: "Automation", icon: Bot },
  { to: "/client/events", label: "Telemetry", icon: Activity },
] as const;
const ADMIN = [
  { to: "/admin/dashboard", label: "Queue", icon: ListChecks },
  { to: "/admin/benchmark", label: "Benchmarks", icon: BrainCircuit },
  { to: "/admin/policy", label: "Policy", icon: SlidersHorizontal },
  { to: "/admin/timeline", label: "Audit", icon: History },
  { to: "/admin/compliance", label: "Compliance", icon: ShieldCheck },
] as const;
const PUBLIC = [
  { to: "/client/dashboard", label: "Client Operations", icon: Satellite },
  { to: "/admin/dashboard", label: "SecOps Admin", icon: ShieldCheck },
  { to: "/docs", label: "Docs", icon: BookOpen },
] as const;

export function FloatingNav() {
  const location = useLocation();
  const path = location.pathname;
  const portal = path.startsWith("/client") ? "client" : path.startsWith("/admin") ? "admin" : "public";
  const links = portal === "client" ? CLIENT : portal === "admin" ? ADMIN : PUBLIC;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const setSimOpen = useUI((s) => s.setSimOpen);
  const pending = useSim((s) => s.incidents.filter((i) => i.status === "PENDING").length);
  const pass = usePassCountdown();

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[1500] flex justify-center px-3 md:top-4">
      <nav
        className={cn(
          "pointer-events-auto relative flex h-14 w-full max-w-[1240px] items-center gap-2 rounded-full pl-4 pr-2 transition-all duration-500",
          scrolled ? "glass-strong" : "glass",
        )}
        aria-label="Primary"
      >
        <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-signal-gradient text-primary-foreground">
            <Satellite className="h-4 w-4" />
          </span>
          <span className="hidden min-w-0 leading-none sm:block">
            <span className="block font-display text-sm tracking-tight">SOAR</span>
            <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              {portal === "client" ? "Client Ops" : portal === "admin" ? "SecOps" : "Ground Defense"}
            </span>
          </span>
        </Link>

        <div className="mx-auto hidden min-w-0 items-center gap-0.5 xl:flex">
          {links.map((l) => {
            const active = path.startsWith(l.to);
            return (
              <Link key={l.to} to={l.to} className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium transition-colors", active ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}>
                <l.icon className="h-3.5 w-3.5" />
                {l.label}
                {l.to === "/admin/dashboard" && portal === "admin" && pending > 0 && (
                  <span className="rounded-full bg-signal px-1.5 font-mono text-[10px] text-primary-foreground">{pending}</span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 xl:ml-0">
          {portal === "client" && pass && (
            <span className="hidden items-center gap-2 rounded-full bg-muted px-3 py-1.5 font-mono text-[11px] 2xl:flex">
              <Dot tone="grove" pulse /> {pass.sat} · {pass.remaining}
            </span>
          )}
          {portal === "admin" && (
            <span className="hidden items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-[11px] 2xl:flex">
              Senior Flight SecOps Analyst
            </span>
          )}
          {portal !== "public" && (
            <button onClick={() => setSimOpen(true)} className={cn(gbtn({ variant: "danger", size: "sm" }), "h-9")}>
              <Zap /> <span className="hidden sm:inline">Simulate</span>
            </button>
          )}
          {portal === "client" && (
            <Link to="/admin/dashboard" className={cn(gbtn({ variant: "outline", size: "sm" }), "hidden h-9 md:inline-flex")}>
              Admin <ArrowRight />
            </Link>
          )}
          {portal === "admin" && (
            <Link to="/client/dashboard" className={cn(gbtn({ variant: "outline", size: "sm" }), "hidden h-9 md:inline-flex")}>
              Client <ArrowRight />
            </Link>
          )}
          {portal === "public" && (
            <Link to="/client/dashboard" className={cn(gbtn({ variant: "signal", size: "sm" }), "hidden h-9 sm:inline-flex")}>
              Launch <ArrowRight />
            </Link>
          )}
          <button onClick={() => setOpen((o) => !o)} className={cn(gbtn({ variant: "ghost", size: "icon" }), "xl:hidden")} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {open && (
          <div className="glass-strong absolute inset-x-0 top-[calc(100%+0.5rem)] rounded-3xl p-3 xl:hidden">
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
              {links.map((l) => (
                <Link key={l.to} to={l.to} className={cn("flex min-w-0 items-center gap-2 rounded-2xl px-3 py-3 text-sm", path.startsWith(l.to) ? "bg-accent" : "text-muted-foreground hover:bg-accent")}>
                  <l.icon className="h-4 w-4 shrink-0" /> <span className="truncate">{l.label}</span>
                </Link>
              ))}
              {portal === "client" && (
                <Link to="/admin/dashboard" className="flex items-center gap-2 rounded-2xl px-3 py-3 text-sm text-signal hover:bg-accent">Switch to Admin <ArrowRight className="h-4 w-4" /></Link>
              )}
              {portal === "admin" && (
                <Link to="/client/dashboard" className="flex items-center gap-2 rounded-2xl px-3 py-3 text-sm text-signal hover:bg-accent">Switch to Client <ArrowRight className="h-4 w-4" /></Link>
              )}
            </div>
            {portal === "client" && pass && (
              <p className="mt-2 flex items-center gap-2 px-3 font-mono text-[11px] text-muted-foreground"><Dot tone="grove" pulse /> Active pass {pass.sat} · {pass.remaining} left · ONLINE / NOMINAL</p>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}

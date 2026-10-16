import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ATTACK_PRESETS, STATIONS, useSim } from "@/lib/sim/store";
import { useUI } from "@/lib/sim/ui-store";
import { cn } from "@/lib/utils";
import { GButton, fieldCls } from "./ui";
import { apiClient } from "@/api/client";

export function AttackSimulatorModal() {
  const { simOpen, setSimOpen } = useUI();
  const inject = useSim((s) => s.injectAttack);
  const navigate = useNavigate();
  const [preset, setPreset] = useState("multi");
  const [station, setStation] = useState("ALL");
  const [count, setCount] = useState(6);
  const [severity, setSeverity] = useState<"HIGH" | "CRITICAL">("HIGH");
  const [busy, setBusy] = useState(false);

  const launch = async () => {
    setBusy(true);
    try {
      await apiClient.post("/traffic/inject-attack", {
        preset_id: preset,
        station_id: station,
        count,
        severity
      }).catch(() => null);
    } catch {
      // Backend fallback
    }
    await new Promise((r) => setTimeout(r, 600));
    inject({ presetId: preset, station, count, severity });
    setBusy(false);
    setSimOpen(false);
    toast.success(`${count} simulated threats injected`, {
      description: severity === "CRITICAL" ? "Perimeter auto-block engaged." : "Routed to the analyst triage queue.",
    });
    navigate(severity === "HIGH" ? "/admin/dashboard" : "/client/events");
  };

  return (
    <Dialog open={simOpen} onOpenChange={(o) => !busy && setSimOpen(o)}>
      <DialogContent className="glass-strong max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto rounded-4xl border-hairline p-6 sm:p-8" data-lenis-prevent>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-alert/15 text-alert"><Zap className="h-5 w-5" /></span>
          <div className="min-w-0">
            <DialogTitle className="font-display text-xl font-medium">Live Attack Simulator</DialogTitle>
            <DialogDescription>Inject live simulated aerospace threats into the defense pipeline.</DialogDescription>
          </div>
        </div>

        <p className="mt-6 mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Attack wave</p>
        <div className="grid gap-2">
          {ATTACK_PRESETS.map((p, i) => (
            <button key={p.id} onClick={() => setPreset(p.id)} className={cn("flex items-center gap-4 rounded-2xl px-4 py-3 text-left ring-1 transition-all", preset === p.id ? "bg-signal/10 ring-signal/60" : "ring-hairline hover:bg-accent")}>
              <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{p.label}</span>
                <span className="block text-xs text-muted-foreground">{p.sub}</span>
              </span>
              {preset === p.id && <Check className="h-4 w-4 shrink-0 text-signal" />}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Target station</span>
            <select value={station} onChange={(e) => setStation(e.target.value)} className={fieldCls}>
              <option value="ALL">All Stations</option>
              {STATIONS.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="flex justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Intensity <span className="text-foreground">{count} incursions</span></span>
            <div className="flex h-10 items-center gap-3">
              <button className="h-8 w-8 shrink-0 rounded-full ring-1 ring-hairline" onClick={() => setCount((c) => Math.max(1, c - 1))} aria-label="Decrease">−</button>
              <input type="range" min={1} max={20} value={count} onChange={(e) => setCount(+e.target.value)} className="min-w-0 flex-1" />
              <button className="h-8 w-8 shrink-0 rounded-full ring-1 ring-hairline" onClick={() => setCount((c) => Math.min(20, c + 1))} aria-label="Increase">+</button>
            </div>
          </label>
        </div>

        <p className="mt-6 mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Severity mode</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {(["HIGH", "CRITICAL"] as const).map((s) => (
            <button key={s} onClick={() => setSeverity(s)} className={cn("rounded-2xl px-4 py-3 text-left ring-1 transition-all", severity === s ? (s === "HIGH" ? "bg-signal/10 ring-signal/60" : "bg-alert/10 ring-alert/60") : "ring-hairline hover:bg-accent")}>
              <span className={cn("block font-mono text-sm", s === "HIGH" ? "text-signal" : "text-alert")}>{s}</span>
              <span className="block text-xs text-muted-foreground">{s === "HIGH" ? "Analyst escalation queue" : "Perimeter auto-block & neutralization"}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <GButton variant="ghost" onClick={() => setSimOpen(false)} disabled={busy}>Cancel</GButton>
          <GButton variant="signal" onClick={launch} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Zap />} {busy ? "Injecting packets…" : "Launch Attack Wave"}
          </GButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SimulatorCallout() {
  const setSimOpen = useUI((s) => s.setSimOpen);
  return (
    <button onClick={() => setSimOpen(true)} className="star-border group relative w-full rounded-4xl p-6 text-left md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-alert/15 text-alert"><Zap className="h-5 w-5" /></span>
          <div className="min-w-0">
            <p className="font-display text-lg">1-Click Live Attack Simulator</p>
            <p className="text-sm text-muted-foreground">Inject live simulated aerospace threats into the defense pipeline.</p>
          </div>
        </div>
        <span className="font-mono text-xs text-signal transition-transform group-hover:translate-x-1">Open simulator →</span>
      </div>
    </button>
  );
}

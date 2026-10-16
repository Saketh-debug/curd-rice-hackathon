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
      const presetObj = ATTACK_PRESETS.find((p) => p.id === preset);
      const attackTypeMap: Record<string, string> = {
        multi: "RANDOM",
        ddos: "TT&C Uplink Saturation",
        brute: "Telecommand (TC) Auth Bypass",
        scan: "SLE Ground Gateway Recon",
        bots: "Ground RTU / Sensor Hijack",
      };
      const attackType = attackTypeMap[preset] || (presetObj ? presetObj.label : "RANDOM");

      await apiClient.post("/traffic/inject-attack", {
        preset_id: preset,
        attack_type: attackType,
        station_id: station,
        station: station === "ALL" ? null : station,
        count,
        severity
      }).catch(() => null);
    } catch {
      // Backend fallback
    }
    await new Promise((r) => setTimeout(r, 600));
    inject({ presetId: preset, station, count, severity });
    window.dispatchEvent(new CustomEvent('attack-injected'));
    setBusy(false);
    setSimOpen(false);
    toast.success(`${count} simulated threats injected`, {
      description: severity === "CRITICAL" ? "Perimeter auto-block engaged." : "Routed to the analyst triage queue.",
    });
    navigate(severity === "HIGH" ? "/admin/dashboard" : "/client/events");
  };

  return (
    <Dialog open={simOpen} onOpenChange={(o) => !busy && setSimOpen(o)}>
      <DialogContent
        className="top-20 translate-y-0 w-[calc(100vw-2rem)] max-w-2xl max-h-[min(520px,calc(100dvh-6.5rem))] overflow-y-auto modal-scroll rounded-3xl bg-[#141311] border border-[#2e2d2a] shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-5 sm:p-6"
        data-lenis-prevent
      >
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-signal/15 text-signal border border-signal/30">
            <Zap className="h-4 w-4 fill-current" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <DialogTitle className="font-display text-lg font-bold tracking-tight text-foreground">
                Live Attack Simulator
              </DialogTitle>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-signal/15 text-signal border border-signal/30 font-bold uppercase tracking-wider">
                DEMO
              </span>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Inject live simulated aerospace telemetry threats into the SOAR defense pipeline.
            </DialogDescription>
          </div>
        </div>

        <p className="mt-4 mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
          Select Threat Vector
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ATTACK_PRESETS.map((p, i) => {
            const isSelected = preset === p.id;
            const isMulti = p.id === "multi";
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p.id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all duration-150 cursor-pointer border text-xs",
                  isMulti && "sm:col-span-2",
                  isSelected
                    ? "bg-[#25221d] border-signal/70 text-foreground"
                    : "bg-[#191816] border-border/70 hover:border-border hover:bg-[#201e1a]"
                )}
              >
                <span className={cn("font-mono text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0", isSelected ? "bg-signal/25 text-signal font-bold" : "bg-muted text-muted-foreground")}>
                  0{i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate font-medium", isSelected ? "text-signal" : "text-foreground")}>
                    {p.label}
                  </span>
                  <span className="block text-[11px] text-muted-foreground truncate">{p.sub}</span>
                </span>
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-signal" />}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Target Ground Station
            </span>
            <select
              value={station}
              onChange={(e) => setStation(e.target.value)}
              className="h-9 rounded-xl bg-[#1c1a17] border border-border/80 px-3 text-xs font-mono text-foreground outline-none focus:border-signal cursor-pointer"
            >
              <option value="ALL">All Stations (Concurrent)</option>
              {STATIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} — {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Intensity <span className="text-signal font-bold">{count} incursions</span>
            </span>
            <div className="flex h-9 items-center gap-2 bg-[#1c1a17] border border-border/80 rounded-xl px-2.5">
              <button
                type="button"
                className="h-6 w-6 shrink-0 rounded-lg bg-muted text-foreground hover:bg-signal/20 hover:text-signal border border-border flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                onClick={() => setCount((c) => Math.max(1, c - 1))}
                aria-label="Decrease"
              >
                −
              </button>
              <input
                type="range"
                min={1}
                max={20}
                value={count}
                onChange={(e) => setCount(+e.target.value)}
                className="min-w-0 flex-1 accent-signal cursor-pointer h-1.5"
              />
              <button
                type="button"
                className="h-6 w-6 shrink-0 rounded-lg bg-muted text-foreground hover:bg-signal/20 hover:text-signal border border-border flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                onClick={() => setCount((c) => Math.min(20, c + 1))}
                aria-label="Increase"
              >
                +
              </button>
            </div>
          </label>
        </div>

        <p className="mt-4 mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
          Severity Defense Mode
        </p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {(["HIGH", "CRITICAL"] as const).map((s) => {
            const isSelected = severity === s;
            const isHigh = s === "HIGH";
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSeverity(s)}
                className={cn(
                  "rounded-xl p-2.5 text-left border transition-all duration-150 cursor-pointer",
                  isSelected
                    ? isHigh
                      ? "bg-[#25221d] border-signal/70"
                      : "bg-[#261818] border-alert/70"
                    : "bg-[#191816] border-border/70 hover:bg-[#201e1a]"
                )}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className={cn("font-mono text-xs font-bold tracking-wider", isHigh ? "text-signal" : "text-alert")}>
                    {s}
                  </span>
                  {isSelected && (
                    <span className={cn("text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase", isHigh ? "bg-signal/20 text-signal" : "bg-alert/20 text-alert")}>
                      Selected
                    </span>
                  )}
                </div>
                <span className="block text-[11px] text-muted-foreground">
                  {isHigh
                    ? "Analyst escalation queue & verification"
                    : "Perimeter automated instant-block"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-border/60 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <GButton
            variant="ghost"
            onClick={() => setSimOpen(false)}
            disabled={busy}
            size="sm"
            className="cursor-pointer border border-border/60 hover:bg-muted font-mono text-xs h-8 px-4"
          >
            Cancel
          </GButton>
          <GButton
            variant="signal"
            onClick={launch}
            disabled={busy}
            size="sm"
            className="cursor-pointer font-bold px-5 h-8 text-xs"
          >
            {busy ? <Loader2 className="animate-spin" /> : <Zap className="fill-current" />}{" "}
            {busy ? "Injecting packets…" : "Launch Attack Wave"}
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

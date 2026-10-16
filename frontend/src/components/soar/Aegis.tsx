import { useEffect, useRef, useState } from "react";
import { Bot, Send, Minimize2, Maximize2, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSim } from "@/lib/sim/store";
import { useUI } from "@/lib/sim/ui-store";
import { Dot } from "./ui";

const CHIPS = [
  "Explain current threat posture",
  "What is SLE protocol exploit?",
  "Diagnose link latency on ISTRAC-BLR",
  "Simulate TT&C uplink saturation",
];

type Msg = { role: "user" | "ai"; text: string };

function answer(q: string): string {
  const s = useSim.getState();
  const pending = s.incidents.filter((i) => i.status === "PENDING").length;
  const lq = q.toLowerCase();
  if (lq.includes("posture")) {
    const recent = s.events.slice(0, 40).filter((e) => e.vector !== "Nominal");
    const top = Object.entries(recent.reduce<Record<string, number>>((a, e) => ((a[e.vector] = (a[e.vector] ?? 0) + 1), a), {})).sort((a, b) => b[1] - a[1])[0];
    return `**Posture: ELEVATED but contained.**\n\n• ${s.threats} threats detected this session, auto-neutralization at ${s.autoRate}%.\n• Dominant vector in the last 40 flows: **${top?.[0] ?? "none"}** (${top?.[1] ?? 0} hits).\n• ${pending} incidents awaiting analyst triage.\n• Mean defense latency ${s.latency} ms — well under the 5 ms budget.\n\nRecommendation: clear high-confidence items in the SecOps queue before the next LEO pass.`;
  }
  if (lq.includes("sle")) return "**SLE (Space Link Extension)** is the CCSDS protocol ground stations use to relay telemetry and telecommand between antennas and mission control.\n\nAn SLE exploit typically starts with reconnaissance — sweeping ports 5100–5200 for exposed RAF/RCF/CLTU service instances — followed by bind-request spoofing to inject or replay telecommand frames. SOAR fingerprints these sweeps by low packet size, high SYN ratio and sequential destination ports.";
  if (lq.includes("latency") || lq.includes("istrac")) {
    const st = s.stations.find((x) => x.id === "ISTRAC-BLR")!;
    return `**ISTRAC-BLR link diagnosis**\n\n• Current RTT: **${st.latency} ms** (${st.status}).\n• Jitter within ±0.4 ms, no carrier loss observed on 2098 MHz.\n• Probable cause of spikes: burst ingestion during the active EOS-09 pass, not adversarial.\n\nIf latency exceeds 8 ms, use **Force Re-Sync Satellite TC Carrier** in the Command Center.`;
  }
  if (lq.includes("simulate") || lq.includes("saturation")) return "To simulate **TT&C uplink saturation**, open the ⚡ Simulator in the navbar, choose *TT&C Uplink Saturation (DDoS)*, pick a station and intensity, then launch.\n\nHIGH mode routes flows to the analyst queue; CRITICAL mode triggers perimeter auto-block. Expect packet arrival Δ to collapse below 0.05 ms with heavy ACK counts — the classic saturation signature.";
  return `I'm tracking ${s.stations.length} ground stations and ${s.events.length} recent flows. Ask me about threat posture, specific vectors (DDoS, TC auth bypass, SLE recon, RTU bots), station health, or how to tune policy thresholds.`;
}

function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <p key={i} className={cn(line === "" ? "h-2" : "")}>
          {line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).map((part, j) =>
            part.startsWith("**") ? <strong key={j} className="text-foreground">{part.slice(2, -2)}</strong> : part.startsWith("*") ? <em key={j}>{part.slice(1, -1)}</em> : part,
          )}
        </p>
      ))}
    </>
  );
}

export function Aegis() {
  const { aegisOpen: open, setAegisOpen: setOpen } = useUI();
  const [max, setMax] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "ai", text: "AEGIS online (powered by local Ollama Qwen3.5:4B). I'm your aerospace cyber copilot for the ISRO ground segment — ask about threat telemetry, station posture, or policy thresholds." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const pending = useSim((s) => s.incidents.filter((i) => i.status === "PENDING").length);
  const [session] = useState(() => Math.floor(Math.random() * 9000 + 1000));

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const send = async (q: string) => {
    const text = q.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    setMsgs((m) => [...m, { role: "user", text }, { role: "ai", text: "" }]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, session_id: sessionId }),
      });

      if (!response.body) throw new Error("No response stream");

      const newSessionId = response.headers.get("X-Session-Id");
      if (newSessionId) setSessionId(parseInt(newSessionId));

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        aiText += chunk;
        setMsgs((m) => [...m.slice(0, -1), { role: "ai", text: aiText }]);
      }

      if (!aiText.trim()) {
        const fallback = answer(text);
        setMsgs((m) => [...m.slice(0, -1), { role: "ai", text: fallback }]);
      }
    } catch (err) {
      console.warn("Aegis streaming fallback:", err);
      const fallback = answer(text);
      for (let i = 0; i <= fallback.length; i += 4) {
        await new Promise((r) => setTimeout(r, 10));
        setMsgs((m) => [...m.slice(0, -1), { role: "ai", text: fallback.slice(0, i) }]);
      }
      setMsgs((m) => [...m.slice(0, -1), { role: "ai", text: fallback }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {open && (
        <div
          data-lenis-prevent
          className={cn(
            "glass-solid fixed right-3 z-50 flex flex-col overflow-hidden rounded-4xl md:right-6",
            "bottom-[5.5rem] w-[calc(100vw-1.5rem)] max-w-[420px]",
            max ? "h-[calc(100dvh-11rem)] md:max-w-[640px]" : "h-[min(560px,calc(100dvh-11rem))]",
          )}
          role="dialog"
          aria-label="AEGIS Cyber Copilot"
        >
          <div className="flex items-center gap-3 border-b px-5 py-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-signal/15 text-signal"><Bot className="h-4 w-4" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-display text-sm">AEGIS Cyber Copilot</p>
                <span className="rounded bg-signal/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-signal uppercase tracking-wider">Ollama Qwen3.5</span>
              </div>
              <p className="flex items-center gap-1.5 truncate font-mono text-[10px] text-muted-foreground"><Dot pulse tone="grove" /> Live RAG Telemetry · Session #{session}</p>
            </div>
            <button className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground" onClick={() => setMax((m) => !m)} aria-label={max ? "Minimize" : "Maximize"}>
              {max ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground" onClick={() => setOpen(false)} aria-label="Close"><X className="h-4 w-4" /></button>
          </div>
          <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-5 py-4 text-sm">
            {msgs.map((m, i) => (
              <div key={i} className={cn("max-w-[88%] rounded-3xl px-4 py-3 leading-relaxed", m.role === "user" ? "ml-auto bg-signal/15 text-foreground" : "bg-muted text-muted-foreground")}>
                {m.text ? <Rich text={m.text} /> : <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto px-5 pb-3">
            {CHIPS.map((c) => (
              <button key={c} onClick={() => send(c)} disabled={busy} className="shrink-0 rounded-full px-3 py-1.5 text-xs text-muted-foreground ring-1 ring-hairline hover:bg-accent hover:text-foreground disabled:opacity-50">{c}</button>
            ))}
          </div>
          <form className="flex items-end gap-2 border-t p-3" onSubmit={(e) => { e.preventDefault(); send(input); }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              rows={1}
              placeholder="Ask AEGIS…"
              className="max-h-28 min-h-10 flex-1 resize-none rounded-2xl bg-muted px-4 py-2.5 text-sm outline-none ring-1 ring-hairline placeholder:text-muted-foreground focus:ring-signal"
            />
            <button type="submit" disabled={busy || !input.trim()} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-signal-gradient text-primary-foreground disabled:opacity-40" aria-label="Send">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      )}
      <button onClick={() => setOpen(!open)} className="star-border fixed bottom-4 right-3 z-50 flex h-14 items-center gap-2.5 rounded-full pl-4 pr-5 md:bottom-6 md:right-6" aria-label="Open AEGIS copilot">
        <span className="relative grid h-8 w-8 place-items-center rounded-full bg-signal/15 text-signal">
          <Bot className="h-4 w-4" />
          <span className="pulse-ring absolute inset-0 rounded-full bg-signal/30" />
        </span>
        <span className="hidden text-sm font-medium sm:inline">AEGIS</span>
        {pending > 0 && <span className="rounded-full bg-signal px-1.5 font-mono text-[10px] text-primary-foreground">{pending}</span>}
      </button>
    </>
  );
}

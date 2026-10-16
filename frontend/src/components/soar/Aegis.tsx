import { useEffect, useRef, useState } from "react";
import { Bot, Send, Minimize2, Maximize2, X, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
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
    const top = Object.entries(
      recent.reduce<Record<string, number>>((a, e) => {
        a[e.vector] = (a[e.vector] ?? 0) + 1;
        return a;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0];
    return `### Threat Posture Summary\n\n- **Status**: **ELEVATED but contained**\n- **Session Detections**: ${s.threats} threats detected, auto-neutralization at ${s.autoRate}%\n- **Dominant Threat Vector**: **${top?.[0] ?? "Nominal"}** (${top?.[1] ?? 0} hits in last 40 flows)\n- **SecOps Queue**: ${pending} incidents awaiting triage\n- **Mean Response Latency**: ${s.latency} ms (within 5 ms operational budget)\n\n*Recommendation*: Clear high-confidence items in the SecOps triage queue prior to the next satellite pass window.`;
  }
  if (lq.includes("sle")) {
    return `### SLE (Space Link Extension) Protocol Exploit Analysis\n\n**SLE** is the CCSDS protocol standard used across ISRO/NASA ground networks to relay telemetry and telecommand between antenna front-ends and mission operations centers.\n\n- **Reconnaissance Vector**: Adversaries sweep ports 5100–5200 for exposed RAF (Return All Frames), RCF (Return Channel Frames), and CLTU (Command Link Transmission Unit) service instances.\n- **Exploitation**: Bind-request spoofing injects forged telecommand frames or causes carrier drop.\n- **Defense Signature**: SOAR fingerprints abnormal packet length Δ (< 0.05 ms), abnormal SYN ratios, and sequential port hits.`;
  }
  if (lq.includes("latency") || lq.includes("istrac")) {
    const st = s.stations.find((x) => x.id === "ISTRAC-BLR") ?? { latency: 4.2, status: "NOMINAL" };
    return `### ISTRAC-BLR Ground Link Diagnostics\n\n- **Round Trip Time (RTT)**: **${st.latency} ms** (${st.status})\n- **Jitter**: ±0.38 ms, carrier stable on 2098 MHz S-band uplink\n- **Root Cause**: Transient burst ingestion during active pass, no adversarial interference detected\n\n*Action*: If latency breaches 8 ms, trigger **Force Re-Sync Satellite TC Carrier** in Command Center.`;
  }
  if (lq.includes("simulate") || lq.includes("saturation")) {
    return `### TT&C Uplink Saturation Simulation\n\nTo simulate **TT&C Uplink Saturation (DDoS)**:\n1. Open the **⚡ Attack Simulator** in the top navigation bar\n2. Select *TT&C Uplink Saturation (DDoS)*\n3. Choose target ground station and intensity, then launch\n\n- **HIGH mode**: Routes suspicious flows to the analyst review queue\n- **CRITICAL mode**: Triggers autonomous perimeter auto-block (>95% confidence)`;
  }
  return `### AEGIS Ground Defense Copilot\n\nTracking **${s.stations.length} ground stations** and **${s.events.length} active telemetry streams**.\n\nAsk about live threat posture, protocol vulnerabilities (SLE, CLTU, TC auth bypass), ground station health, or policy tuning thresholds.`;
}

function cleanMarkdown(raw: string): string {
  if (!raw) return "";
  let text = raw;

  // 1. Normalize spaced-out hashes: "# # # Heading" or "# # Heading" -> "### Heading", "## Heading"
  text = text.replace(/^(#{1,6})(?:\s+#)+\s+/gm, (match) => {
    return match.replace(/\s+/g, "") + " ";
  });
  text = text.replace(/^#\s+#\s+#\s+/gm, "### ");
  text = text.replace(/^#\s+#\s+/gm, "## ");

  // 2. Normalize accidental single-asterisk-wrapped bullet key-values like:
  // *Active Incidents: 23 pending incidents...*
  // or *Active Incidents:* 23 pending incidents...
  // Convert into clean markdown list items:
  // - **Active Incidents**: 23 pending incidents...
  text = text.replace(/^\*([A-Za-z0-9\s_\-\/]+):\s*(.*?)\*$/gm, "- **$1**: $2");
  text = text.replace(/^\*([A-Za-z0-9\s_\-\/]+)\*:\s*/gm, "- **$1**: ");

  // 3. Normalize single asterisks at the start of lines to standard bullet "- "
  text = text.replace(/^\*\s+/gm, "- ");

  return text;
}

function MarkdownContent({ text }: { text: string }) {
  const cleaned = cleanMarkdown(text);
  return (
    <div className="text-xs sm:text-sm font-sans break-words space-y-2">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-sm font-bold text-foreground mt-3 mb-1.5 pb-1 border-b border-border/60 flex items-center gap-1.5">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xs font-bold text-signal uppercase tracking-wider mt-2.5 mb-1 flex items-center gap-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-bold text-signal tracking-wide uppercase mt-2 mb-1 flex items-center gap-1.5">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-semibold text-foreground mt-1.5 mb-0.5">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="leading-relaxed mb-1.5 last:mb-0 text-foreground/90 font-normal">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-1.5 ml-4 list-disc space-y-1 marker:text-signal text-foreground/90">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-1.5 ml-4 list-decimal space-y-1 marker:text-signal text-foreground/90">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-0.5">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/85">
              {children}
            </em>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-background/80 text-signal border border-border/60 px-1.5 py-0.5 rounded font-mono text-[11px] font-medium">
                {children}
              </code>
            ) : (
              <code className="block bg-background/90 text-foreground border border-border/60 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto my-1.5">
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-signal/60 pl-3 italic text-muted-foreground my-2">
              {children}
            </blockquote>
          ),
        }}
      >
        {cleaned}
      </ReactMarkdown>
    </div>
  );
}

export function Aegis() {
  const { aegisOpen: open, setAegisOpen: setOpen } = useUI();
  const [max, setMax] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "ai",
      text: "### AEGIS Flight Copilot Online\nPowered by local **Ollama Qwen3.5:4B** and live RAG telemetry. Ask about current threat posture, SLE protocol exploits, station link health, or policy thresholds.",
    },
  ]);
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
      let response: Response;
      try {
        response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: text, session_id: sessionId }),
        });
        if (!response.ok) throw new Error(`Proxy status: ${response.status}`);
      } catch {
        // Fallback to direct backend port 8000
        response = await fetch("http://localhost:8000/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: text, session_id: sessionId }),
        });
        if (!response.ok) throw new Error(`Direct backend status: ${response.status}`);
      }

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
      for (let i = 0; i <= fallback.length; i += 6) {
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
      {/* AEGIS Chat Window Modal */}
      {open && (
        <div
          data-lenis-prevent
          className={cn(
            "fixed right-3 md:right-6 z-[9999] flex flex-col overflow-hidden rounded-3xl",
            "bg-card/95 backdrop-blur-2xl border border-border/80 shadow-[0_16px_56px_rgba(0,0,0,0.65)] ring-1 ring-white/10",
            "bottom-[5.5rem] w-[calc(100vw-1.5rem)] max-w-[440px]",
            max ? "h-[calc(100dvh-7.5rem)] md:max-w-[640px]" : "h-[min(580px,calc(100dvh-7.5rem))]"
          )}
          role="dialog"
          aria-label="AEGIS Cyber Copilot"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border/60 bg-muted/40 px-4 py-3.5">
            <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-signal/15 text-signal border border-signal/30 shadow-inner">
              <Bot className="h-4 w-4" />
              <span className="pulse-ring absolute inset-0 rounded-xl bg-signal/25" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-display text-sm font-semibold tracking-wide text-foreground">
                  AEGIS Cyber Copilot
                </p>
                <span className="rounded bg-signal/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-signal uppercase tracking-wider border border-signal/25">
                  Ollama Qwen3.5
                </span>
              </div>
              <p className="flex items-center gap-1.5 truncate font-mono text-[10px] text-muted-foreground mt-0.5">
                <Dot pulse tone="grove" /> Live RAG Telemetry · Session #{session}
              </p>
            </div>
            <button
              className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              onClick={() => setMax((m) => !m)}
              aria-label={max ? "Minimize" : "Maximize"}
            >
              {max ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Scroller */}
          <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm bg-background/50">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[90%] rounded-2xl px-4 py-3 leading-relaxed transition-all",
                  m.role === "user"
                    ? "ml-auto bg-signal/20 text-foreground border border-signal/35 rounded-tr-xs"
                    : "bg-muted/80 text-foreground border border-border/60 rounded-tl-xs shadow-sm"
                )}
              >
                {m.text ? (
                  m.role === "user" ? (
                    <p className="whitespace-pre-wrap text-xs sm:text-sm">{m.text}</p>
                  ) : (
                    <MarkdownContent text={m.text} />
                  )
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-signal" />
                    <span className="font-mono">AEGIS analyzing telemetry…</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Action Chips */}
          <div className="flex gap-1.5 overflow-x-auto px-4 py-2 border-t border-border/40 bg-muted/20 scrollbar-none">
            {CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => send(c)}
                disabled={busy}
                className="shrink-0 rounded-full bg-card/80 px-3 py-1 font-mono text-[11px] text-muted-foreground ring-1 ring-border/60 hover:bg-signal/10 hover:text-signal hover:ring-signal/40 disabled:opacity-50 transition-all cursor-pointer"
              >
                {c}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            className="flex items-end gap-2 border-t border-border/60 bg-muted/40 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Ask AEGIS about telemetry, vectors, posture…"
              className="max-h-28 min-h-10 flex-1 resize-none rounded-2xl bg-card px-4 py-2.5 text-xs sm:text-sm text-foreground outline-none ring-1 ring-border/80 placeholder:text-muted-foreground focus:ring-2 focus:ring-signal"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-signal text-primary-foreground disabled:opacity-40 hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
              aria-label="Send"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      )}

      {/* Floating Bottom-Right Corner AEGIS Button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-5 right-5 md:bottom-6 md:right-6 z-[9999]",
          "group flex items-center gap-3 px-4 py-2.5 rounded-full cursor-pointer",
          "bg-card/90 hover:bg-card backdrop-blur-xl border border-signal/50 hover:border-signal text-foreground",
          "shadow-[0_4px_24px_rgba(255,153,51,0.22)] hover:shadow-[0_8px_32px_rgba(255,153,51,0.4)]",
          "hover:-translate-y-1 active:translate-y-0 transition-all duration-300 select-none",
          open && "ring-2 ring-signal border-signal shadow-[0_0_24px_rgba(255,153,51,0.45)]"
        )}
        aria-label="Open AEGIS copilot"
      >
        <span className="relative grid h-8 w-8 place-items-center rounded-full bg-signal/15 text-signal group-hover:bg-signal/25 transition-colors">
          <Bot className="h-4 w-4 transition-transform group-hover:scale-110" />
          <span className="pulse-ring absolute inset-0 rounded-full bg-signal/35" />
        </span>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-display text-sm font-bold tracking-wide text-foreground group-hover:text-signal transition-colors">
              AEGIS
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-signal/15 text-signal border border-signal/30 uppercase tracking-wider">
              AI
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-grove inline-block animate-pulse" />
            Online
          </span>
        </div>
        {pending > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-signal px-1.5 font-mono text-[10px] font-bold text-primary-foreground shadow-sm animate-pulse">
            {pending}
          </span>
        )}
      </button>
    </>
  );
}

import { Link } from "react-router-dom";
import { PageIntro, Chapter } from "@/components/soar/ui";
import { FloatingNav } from "@/components/soar/FloatingNav";
import { AttackSimulatorModal } from "@/components/soar/AttackSimulator";
import { Toaster } from "@/components/ui/sonner";

const SECTIONS = [
  { t: "Decision pipeline", b: "Every flow is reduced to 52 features, scored by the 7-class ground flow model and the Laya rule engine, then routed by confidence: auto-block above the threshold, analyst escalation in the middle band, and quiet monitoring below." },
  { t: "Reinforcement learning", b: "Analyst verdicts feed a contextual bandit. Block & Train tightens thresholds for that threat class; False Alarm loosens them. Exploration and discount are tunable from Policy." },
  { t: "Client Operations", b: "Flight controllers watch telemetry, pass windows, automation efficiency, the live threat globe and the raw event stream." },
  { t: "SecOps Admin", b: "Analysts triage escalations, run forensic review with feature contributions, deploy policy, audit every decision and export compliance reports." },
  { t: "Attack simulator", b: "Inject realistic threat waves at any station to rehearse response. HIGH waves land in the triage queue; CRITICAL waves trigger perimeter auto-block." },
];

export default function Docs() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative selection:bg-signal selection:text-signal-foreground">
      <div className="aurora" aria-hidden><span /><span /><span /></div>
      <div className="grain" aria-hidden />
      <FloatingNav />
      <main className="relative z-10 mx-auto w-full max-w-4xl px-4 pt-28 pb-20 md:px-6">
        <div className="glass rounded-3xl p-8 md:p-12 border border-hairline">
          <PageIntro kicker="SOAR Documentation" title="Ground Segment Cyber Defense Architecture" />
          <div className="mt-8 space-y-8">
            {SECTIONS.map((s, i) => (
              <Chapter key={s.t} eyebrow={`0${i + 1}`} title={s.t} className="py-4 border-b border-hairline/60 last:border-none">
                <p className="text-base sm:text-lg leading-relaxed text-muted-foreground mt-2">{s.b}</p>
              </Chapter>
            ))}
          </div>
          <div className="pt-8 border-t border-hairline/60 flex flex-wrap gap-4 text-sm font-mono">
            <Link to="/client/dashboard" className="text-signal hover:underline">Open Client Operations →</Link>
            <Link to="/admin/dashboard" className="text-foreground hover:underline">Open SecOps Admin →</Link>
            <Link to="/" className="text-muted-foreground hover:underline">Return to Home</Link>
          </div>
        </div>
      </main>
      <AttackSimulatorModal />
      <Toaster position="top-center" offset={88} />
    </div>
  );
}

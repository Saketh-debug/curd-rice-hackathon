import { Link } from "react-router-dom";
import {
    Shield,
    Lock,
    Activity,
    Radar,
    Zap,
    Radio,
    Terminal,
    Compass,
    Satellite,
    Cpu,
    ArrowRight,
    AlertTriangle,
    CheckCircle2
} from "lucide-react";
import { EarthGlobe3D } from "../components/EarthGlobe3D";

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[#050814] text-white font-sans selection:bg-cyan-500 selection:text-black starfield overflow-x-hidden">

            {/* ================= TOP MISSION STATUS STRIP ================= */}
            <div className="bg-[#090f24] border-b border-cyan-900/40 px-4 py-2 text-xs font-mono text-slate-300 flex items-center justify-between overflow-hidden">
                <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        ISTRAC MOX LINK NOMINAL
                    </span>
                    <span className="text-slate-500 hidden sm:inline">|</span>
                    <span className="text-cyan-400 hidden sm:inline">GROUND STATION: ISTRAC-BLR (12.97° N, 77.59° E)</span>
                </div>
                <div className="animate-pulse text-slate-400 text-[11px] truncate ml-4">
                    🛰️ ACTIVE PASS: EOS-09 (LEO 500KM SSO) • AOS: 08:14 UTC • LOS: 08:26 UTC • TT&C LINK: SECURE
                </div>
            </div>

            {/* ================= HERO SECTION ================= */}
            <section className="px-6 pt-12 pb-20 max-w-7xl mx-auto relative">
                {/* Ambient Radial Glows */}
                <div className="absolute top-10 left-1/4 w-[500px] h-[400px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none"></div>
                <div className="absolute top-20 right-1/4 w-[400px] h-[350px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="grid lg:grid-cols-12 gap-10 items-center">
                    {/* Left: Text & Pitch */}
                    <div className="lg:col-span-7 space-y-6 text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-semibold tracking-wider uppercase">
                            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
                            ISRO Space Ground Segment Cyber Defense
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-orbitron tracking-tight leading-tight">
                            SOAR Platform
                            <span className="block text-2xl sm:text-3xl md:text-3xl font-normal text-slate-400 mt-2 font-sans">
                                Intelligent Ground Station Defense for Space Missions
                            </span>
                        </h1>

                        <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-light">
                            Engineered for <strong className="text-white font-medium">ISTRAC & IDSN Ground Stations</strong>: Safeguarding telemetry, tracking & command (TT&C) links against satellite pass-window saturation, telecommand injection, and SLE protocol exploits with zero live packet probing.
                        </p>

                        {/* Quick Spec Tags */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                            <div className="bg-[#0c142b]/80 border border-cyan-500/20 rounded-xl p-3">
                                <div className="text-cyan-400 font-mono text-xl font-bold">52</div>
                                <div className="text-[11px] text-slate-400 uppercase tracking-wide">Flow Features</div>
                            </div>
                            <div className="bg-[#0c142b]/80 border border-emerald-500/20 rounded-xl p-3">
                                <div className="text-emerald-400 font-mono text-xl font-bold">100%</div>
                                <div className="text-[11px] text-slate-400 uppercase tracking-wide">Air-Gapped Safe</div>
                            </div>
                            <div className="bg-[#0c142b]/80 border border-orange-500/20 rounded-xl p-3">
                                <div className="text-orange-400 font-mono text-xl font-bold">7 Classes</div>
                                <div className="text-[11px] text-slate-400 uppercase tracking-wide">Attack Classes</div>
                            </div>
                            <div className="bg-[#0c142b]/80 border border-blue-500/20 rounded-xl p-3">
                                <div className="text-blue-400 font-mono text-xl font-bold">&lt; 12ms</div>
                                <div className="text-[11px] text-slate-400 uppercase tracking-wide">Triage Velocity</div>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-wrap gap-4 pt-4">
                            <a
                                href="#portal-access"
                                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-orbitron font-bold text-sm tracking-wider transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)] flex items-center gap-2"
                            >
                                Enter Mission Control <ArrowRight className="w-4 h-4" />
                            </a>
                            <Link
                                to="/admin/benchmark"
                                className="px-6 py-3.5 rounded-xl bg-[#0c142b] hover:bg-[#132044] border border-cyan-500/40 text-cyan-300 font-orbitron font-semibold text-sm tracking-wider transition-all flex items-center gap-2"
                            >
                                Model Benchmark (7x7 Matrix)
                            </Link>
                        </div>
                    </div>

                    {/* Right: Interactive 3D Earth Globe */}
                    <div className="lg:col-span-5 relative">
                        <div className="relative rounded-3xl bg-gradient-to-b from-[#0e1736]/60 to-[#060a1a]/80 border border-cyan-500/30 p-2 shadow-[0_0_40px_rgba(0,212,255,0.15)]">
                            <EarthGlobe3D className="w-full h-[420px]" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= NETWORK ATTACK TAXONOMY ================= */}
            <section className="px-6 py-16 bg-[#080d1e]/80 border-y border-slate-800">
                <div className="max-w-7xl mx-auto space-y-10">
                    <div className="text-center max-w-3xl mx-auto space-y-3">
                        <div className="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 font-semibold">
                            Network Threat Classification & Defense
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold font-orbitron text-white">
                            Standard Attack Classes Defended
                        </h2>
                        <p className="text-slate-400 text-sm">
                            High-accuracy multiclass intrusion detection evaluated across 52 standardized network flow features.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Radio,
                                code: "DDoS",
                                title: "Distributed Denial of Service",
                                impact: "Floods network links or transceivers with massive packet rates to overwhelm services.",
                                color: "border-red-500/30 text-red-400 bg-red-950/10",
                            },
                            {
                                icon: Lock,
                                code: "Brute Force",
                                title: "Brute Force Authentication",
                                impact: "Automated credential guessing attempts targeting authentication endpoints and open accounts.",
                                color: "border-orange-500/30 text-orange-400 bg-orange-950/10",
                            },
                            {
                                icon: Radar,
                                code: "Port Scanning",
                                title: "Port Scanning Reconnaissance",
                                impact: "Rapid probes across listening ports to discover open services and potential entry points.",
                                color: "border-yellow-500/30 text-yellow-400 bg-yellow-950/10",
                            },
                            {
                                icon: Cpu,
                                code: "Bot Traffic",
                                title: "Botnet Agent Traffic",
                                impact: "Automated malicious communication patterns and remote beaconing from compromised nodes.",
                                color: "border-purple-500/30 text-purple-400 bg-purple-950/10",
                            },
                            {
                                icon: Compass,
                                code: "Web Attacks",
                                title: "Web Application Attacks",
                                impact: "SQL injection, parameter manipulation, and API exploits targeting distribution interfaces.",
                                color: "border-cyan-500/30 text-cyan-400 bg-cyan-950/10",
                            },
                            {
                                icon: CheckCircle2,
                                code: "Normal Flow",
                                title: "Nominal Baseline Traffic",
                                impact: "Authorized routine data transfers, legitimate client requests, and housekeeping flows.",
                                color: "border-emerald-500/30 text-emerald-400 bg-emerald-950/10",
                            },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className={`rounded-2xl p-6 border ${item.color} backdrop-blur-md hover:border-cyan-400 transition-all duration-300 group`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <item.icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-black/40 border border-slate-700 uppercase">
                                        {item.code}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold font-orbitron text-white mb-2">{item.title}</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">{item.impact}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= PORTAL ACCESS CARDS ================= */}
            <section id="portal-access" className="px-6 py-20 max-w-6xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                        System Access Point
                    </span>
                    <h2 className="text-3xl font-bold font-orbitron text-white">
                        Dual Operational Consoles
                    </h2>
                    <p className="text-slate-400 text-sm">
                        Choose your operational interface based on your mission role.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Portal A */}
                    <Link
                        to="/client/dashboard"
                        className="group relative bg-[#0a1022] rounded-2xl p-8 border border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,212,255,0.25)] transition-all duration-300 overflow-hidden flex flex-col justify-between"
                    >
                        <Satellite className="absolute -right-6 -bottom-6 w-40 h-40 opacity-5 text-cyan-400 group-hover:scale-110 transition-transform duration-500" />
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold mb-4 border border-cyan-500/20">
                                PORTAL A • OPERATIONS
                            </div>
                            <h3 className="text-2xl font-bold font-orbitron text-white mb-3">
                                Mission Operations Center (MOC)
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                Live orbital telemetry monitoring, active pass window countdowns, ISTRAC ground station threat map, and real-time automated defense counters.
                            </p>
                            <ul className="space-y-2 text-xs font-mono text-slate-300 mb-8">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                                    ISTRAC Station Threat Visualizer (BLR, SHAR, Byalalu)
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                                    Satellite Pass Window Triage & LOS Risk Counter
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                                    Live Telemetry Stream with Zero Probing Impact
                                </li>
                            </ul>
                        </div>
                        <div className="text-cyan-400 font-orbitron font-bold text-sm group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                            Open Mission Operations Console →
                        </div>
                    </Link>

                    {/* Portal B */}
                    <Link
                        to="/admin/dashboard"
                        className="group relative bg-[#0a1022] rounded-2xl p-8 border border-orange-500/30 hover:border-orange-400 hover:shadow-[0_0_30px_rgba(255,107,26,0.25)] transition-all duration-300 overflow-hidden flex flex-col justify-between"
                    >
                        <Lock className="absolute -right-6 -bottom-6 w-40 h-40 opacity-5 text-orange-400 group-hover:scale-110 transition-transform duration-500" />
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-mono font-bold mb-4 border border-orange-500/20">
                                PORTAL B • GOVERNANCE
                            </div>
                            <h3 className="text-2xl font-bold font-orbitron text-white mb-3">
                                Ground Security Administration
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                Mission controller investigation queue, SHAP telemetry attribution, adaptive False Alarm Rate (FAR) tuning, and official ISRO compliance logs.
                            </p>
                            <ul className="space-y-2 text-xs font-mono text-slate-300 mb-8">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                    Priority Review Queue with Feature Attribution
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                    Online Bandit Threshold Tuning (Pass Window Mode)
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                    Model Benchmark: 7x7 Multi-Class Confusion Matrix
                                </li>
                            </ul>
                        </div>
                        <div className="text-orange-400 font-orbitron font-bold text-sm group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                            Open Security Admin Console →
                        </div>
                    </Link>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="border-t border-slate-800/80 py-8 text-center text-slate-500 bg-[#04060f] text-xs font-mono">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <strong>SOAR Platform</strong> • ISRO Aerospace Ground Segment Cyber Defense Extension
                    </div>
                    <div className="text-slate-600">
                        Evaluated for ISTRAC / IDSN Mission Operations • Air-Gapped Offline Intrusion Detection
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

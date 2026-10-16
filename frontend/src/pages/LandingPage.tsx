import { useState, useEffect } from "react";
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
import { apiClient } from "../api/client";
import type { SatellitePassData, SatelliteMissionTelemetry } from "../types";
import StarBorder from "../components/StarBorder";

const LandingPage = () => {
    const [activePass, setActivePass] = useState<SatellitePassData | null>(null);

    useEffect(() => {
        const fetchPasses = async () => {
            try {
                const res = await apiClient.get<SatelliteMissionTelemetry>('/satellite/telemetry-passes');
                if (res.data?.passes?.length) {
                    const active = res.data.passes.find(p => p.status === 'ACTIVE') || res.data.passes[0];
                    setActivePass(active);
                }
            } catch (err) {
                // Keep default
            }
        };
        fetchPasses();
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-signal selection:text-[#161513] overflow-x-hidden">

            {/* ================= TOP MISSION STATUS STRIP ================= */}
            <div className="bg-card border-b border-border px-4 py-2 text-xs font-mono text-muted-foreground flex items-center justify-between overflow-hidden">
                <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-grove/10 border border-grove/20 text-grove font-medium text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-grove"></span>
                        ISTRAC MOX LINK NOMINAL
                    </span>
                    <span className="text-border hidden sm:inline">|</span>
                    <span className="text-foreground hidden sm:inline">
                        GROUND STATION: {activePass ? activePass.station_code : 'ISTRAC-BLR'}
                    </span>
                </div>
                <div className="text-muted-foreground text-[11px] truncate ml-4 font-mono">
                    {activePass ? (
                        `🛰️ ACTIVE PASS: ${activePass.satellite} (${activePass.orbit}) • AOS: ${activePass.aos} • LOS: ${activePass.los} • CHANNEL: ${activePass.channel} • STATUS: ${activePass.threatStatus}`
                    ) : (
                        '🛰️ ACTIVE PASS: EOS-09 (LEO 500KM SSO) • AOS: 08:14 UTC • LOS: 08:26 UTC • TT&C LINK: SECURE'
                    )}
                </div>
            </div>

            {/* ================= SITE HEADER ================= */}
            <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border px-6 py-3.5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-signal">
                            <Satellite className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-logo font-bold text-sm tracking-wider text-foreground">SOAR SPACE</span>
                            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-md bg-signal text-signal-foreground font-medium">ISRO GROUND DEFENSE</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Link
                            to="/client/dashboard"
                            className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-mono text-foreground font-medium transition-colors"
                        >
                            Client Operations →
                        </Link>
                        <Link
                            to="/admin/dashboard"
                            className="px-3 py-1.5 rounded-lg border border-signal/40 bg-signal text-signal-foreground hover:bg-signal/90 text-xs font-mono font-medium transition-colors"
                        >
                            SecOps Admin →
                        </Link>
                    </div>
                </div>
            </header>

            {/* ================= HERO SECTION ================= */}
            <section className="px-6 pt-12 pb-20 max-w-7xl mx-auto relative">
                <div className="grid lg:grid-cols-12 gap-10 items-center">
                    {/* Left: Text & Pitch */}
                    <div className="lg:col-span-7 space-y-6 text-left">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-card border border-border text-signal text-[11px] font-mono tracking-wider uppercase">
                            <Satellite className="w-3.5 h-3.5 text-signal" />
                            ISRO Space Ground Segment Cyber Defense
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight text-foreground">
                            SOAR Platform
                            <span className="block text-xl sm:text-2xl md:text-3xl font-normal text-muted-foreground mt-2 font-sans">
                                Intelligent Ground Station Defense for Space Missions
                            </span>
                        </h1>

                        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                            Engineered for <strong className="text-foreground font-medium">ISTRAC & IDSN Ground Stations</strong>: Safeguarding telemetry, tracking & command (TT&C) links against satellite pass-window saturation, telecommand injection, and SLE protocol exploits with zero live packet probing.
                        </p>

                        {/* Quick Spec Tags */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                            <div className="bg-card border border-border rounded-xl p-3.5">
                                <div className="text-signal font-mono text-xl font-semibold tabular-nums">52</div>
                                <div className="text-[11px] text-muted-foreground uppercase tracking-wide font-mono mt-0.5">Flow Features</div>
                            </div>
                            <div className="bg-card border border-border rounded-xl p-3.5">
                                <div className="text-grove font-mono text-xl font-semibold tabular-nums">100%</div>
                                <div className="text-[11px] text-muted-foreground uppercase tracking-wide font-mono mt-0.5">Air-Gapped Safe</div>
                            </div>
                            <div className="bg-card border border-border rounded-xl p-3.5">
                                <div className="text-foreground font-mono text-xl font-semibold tabular-nums">7 Classes</div>
                                <div className="text-[11px] text-muted-foreground uppercase tracking-wide font-mono mt-0.5">Space Threats</div>
                            </div>
                            <div className="bg-card border border-border rounded-xl p-3.5">
                                <div className="text-slate font-mono text-xl font-semibold tabular-nums">&lt; 12ms</div>
                                <div className="text-[11px] text-muted-foreground uppercase tracking-wide font-mono mt-0.5">Triage Velocity</div>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-wrap gap-4 pt-4">
                            <StarBorder
                                as="a"
                                href="#portal-access"
                                backgroundColor="#f1efea"
                                borderColor="#f1efea"
                                className="px-6 py-3 text-[#161513] font-semibold text-sm tracking-wide flex items-center gap-2 cursor-pointer hover:bg-[#e4e1d8]"
                            >
                                Enter Mission Control <ArrowRight className="w-4 h-4 text-[#161513]" />
                            </StarBorder>
                            <StarBorder
                                as={Link}
                                to="/admin/benchmark"
                                backgroundColor="#292825"
                                borderColor="#34322d"
                                className="px-6 py-3 text-foreground font-medium text-sm tracking-wide flex items-center gap-2 cursor-pointer hover:bg-[#34322d]"
                            >
                                Model Benchmark (7x7 Matrix)
                            </StarBorder>
                        </div>
                    </div>

                    {/* Right: Interactive 3D Earth Globe */}
                    <div className="lg:col-span-5 relative">
                        <div className="relative rounded-2xl bg-card border border-border p-2">
                            <EarthGlobe3D className="w-full h-[420px]" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= SPACE THREAT TAXONOMY ================= */}
            <section className="px-6 py-16 bg-background border-y border-border">
                <div className="max-w-7xl mx-auto space-y-10">
                    <div className="text-center max-w-3xl mx-auto space-y-2">
                        <div className="caps-label text-signal mb-1">
                            Aerospace Cyber Defense Mapping
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                            Ground Segment Threat Vectors Defended
                        </h2>
                        <p className="text-muted-foreground text-sm font-sans">
                            Real-time multiclass classification addressing vulnerabilities across Space Link Extension (SLE) and TT&C architectures.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            {
                                icon: Radio,
                                code: "DoS / DDoS",
                                title: "TT&C Uplink Saturation",
                                impact: "Floods ground station transceivers during an 8-12 min LEO pass window, causing Loss of Signal (LOS).",
                                color: "text-destructive",
                            },
                            {
                                icon: Lock,
                                code: "Brute Force",
                                title: "Telecommand (TC) Bypass",
                                impact: "Attempts to inject unauthorized thruster firings or corrupt CCSDS COP-1 sequence counters.",
                                color: "text-signal",
                            },
                            {
                                icon: Radar,
                                code: "Port Scanning",
                                title: "SLE Service Reconnaissance",
                                impact: "Probes ground station ports 5100-5102, antenna position encoders, and RF matrix controllers.",
                                color: "text-slate",
                            },
                            {
                                icon: Cpu,
                                code: "Bot Traffic",
                                title: "Ground RTU / Sensor Hijack",
                                impact: "Compromises remote weather sensors or calibration feeds feeding orbital determination software.",
                                color: "text-foreground",
                            },
                            {
                                icon: Compass,
                                code: "Web Attacks",
                                title: "Mission Data Portal Exploit",
                                impact: "Attacks Bhuvan / EOS telemetry dissemination servers and public earth observation APIs.",
                                color: "text-signal",
                            },
                            {
                                icon: CheckCircle2,
                                code: "Normal Flow",
                                title: "Routine Housekeeping Telemetry",
                                impact: "Reaction wheel RPM, star tracker quaternion data, solar panel battery bus voltage (Nominal).",
                                color: "text-grove",
                            },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="bg-card rounded-xl p-5 border border-border hover:border-muted-foreground/30 transition-all duration-200 group"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <item.icon className={`w-6 h-6 ${item.color}`} />
                                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-background border border-border uppercase text-muted-foreground">
                                        {item.code}
                                    </span>
                                </div>
                                <h3 className="text-base font-semibold text-foreground mb-1">{item.title}</h3>
                                <p className="text-muted-foreground text-xs leading-relaxed">{item.impact}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= PORTAL ACCESS CARDS ================= */}
            <section id="portal-access" className="px-6 py-20 max-w-6xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
                    <span className="caps-label text-signal mb-1">
                        System Access Point
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                        Dual Operational Consoles
                    </h2>
                    <p className="text-muted-foreground text-sm font-sans">
                        Choose your operational interface based on your mission role.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Portal A */}
                    <Link
                        to="/client/dashboard"
                        className="group relative bg-card rounded-xl p-7 border border-border hover:border-muted-foreground/40 transition-all duration-200 flex flex-col justify-between"
                    >
                        <div>
                            <div className="caps-label text-signal mb-3">
                                PORTAL A • OPERATIONS
                            </div>
                            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-2 group-hover:text-signal transition-colors">
                                Mission Operations Center (MOC)
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-sans">
                                Live orbital telemetry monitoring, active pass window countdowns, ISTRAC ground station threat map, and real-time automated defense counters.
                            </p>
                            <ul className="space-y-2 text-xs font-mono text-muted-foreground mb-8">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-signal"></span>
                                    <span>ISTRAC Station Threat Visualizer (BLR, SHAR, Byalalu)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-signal"></span>
                                    <span>Satellite Pass Window Triage & LOS Risk Counter</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-signal"></span>
                                    <span>Live Telemetry Stream with Zero Probing Impact</span>
                                </li>
                            </ul>
                        </div>
                        <div className="pt-2">
                            <span className="text-foreground font-mono text-xs font-medium inline-flex items-center gap-1.5 group-hover:text-signal">
                                Open Mission Operations Console →
                            </span>
                        </div>
                    </Link>

                    {/* Portal B */}
                    <Link
                        to="/admin/dashboard"
                        className="group relative bg-card rounded-xl p-7 border border-border hover:border-muted-foreground/40 transition-all duration-200 flex flex-col justify-between"
                    >
                        <div>
                            <div className="caps-label text-signal mb-3">
                                PORTAL B • GOVERNANCE
                            </div>
                            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-2 group-hover:text-signal transition-colors">
                                Ground Security Administration
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-sans">
                                Mission controller investigation queue, SHAP telemetry attribution, adaptive False Alarm Rate (FAR) tuning, and official ISRO compliance logs.
                            </p>
                            <ul className="space-y-2 text-xs font-mono text-muted-foreground mb-8">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-signal"></span>
                                    <span>Priority Review Queue with Feature Attribution</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-signal"></span>
                                    <span>Online Bandit Threshold Tuning (Pass Window Mode)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-signal"></span>
                                    <span>Model Benchmark: 7x7 Multi-Class Confusion Matrix</span>
                                </li>
                            </ul>
                        </div>
                        <div className="pt-2">
                            <span className="text-foreground font-mono text-xs font-medium inline-flex items-center gap-1.5 group-hover:text-signal">
                                Open Security Admin Console →
                            </span>
                        </div>
                    </Link>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="border-t border-border py-8 text-center text-muted-foreground bg-background text-xs font-mono">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <strong className="text-foreground">SOAR Platform</strong> • ISRO Aerospace Ground Segment Cyber Defense Extension
                    </div>
                    <div className="text-muted-foreground">
                        Evaluated for ISTRAC / IDSN Mission Operations • Air-Gapped Offline Intrusion Detection
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

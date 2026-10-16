import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Activity,
    ShieldAlert,
    Zap,
    Radio,
    Globe,
    Satellite,
    Signal,
    CheckCircle2
} from 'lucide-react';
import clsx from 'clsx';
import { useSystemHealth } from '../../../hooks/useSystemHealth';
import { AttackSimulatorTrigger } from '../../../components/AttackSimulator/AttackSimulatorTrigger';

const Dashboard = () => {
    const { health } = useSystemHealth();

    const stations = health?.stations || [
        { code: 'ISTRAC-BLR', name: 'Bengaluru MOX', status: 'ONLINE', ping: '2ms' },
        { code: 'IDSN-32M', name: 'Byalalu Deep Space', status: 'ONLINE', ping: '4ms' },
        { code: 'SDSC-SHAR', name: 'Sriharikota Ground', status: 'ONLINE', ping: '6ms' },
        { code: 'ISTRAC-PBL', name: 'Port Blair Downrange', status: 'ONLINE', ping: '12ms' },
        { code: 'ISTRAC-MAU', name: 'Mauritius Pass', status: 'STANDBY', ping: '38ms' },
    ];

    const sparklineData = health?.sparkline_24h || [30, 45, 55, 65, 50, 40, 75, 60, 45, 55, 35, 50];
    const linkIntegrity = health?.link_integrity_score ?? 96.0;

    return (
        <div className="relative min-h-screen bg-background text-foreground font-sans">
            <div className="max-w-7xl mx-auto px-6 pb-8 space-y-8 relative z-10">

                {/* ================= HERO ================= */}
                <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 pb-6 border-b border-border">
                    <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md border text-[11px] font-mono tracking-wider mb-2 bg-card border-border text-signal">
                            <Satellite className="w-3.5 h-3.5" />
                            <span>ISTRAC GROUND DEFENSE NETWORK • MOX ACTIVE</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-foreground">
                            AI-Driven Ground Segment <br />
                            <span className="text-signal">
                                Incident Response System
                            </span>
                        </h1>

                        <p className="text-muted-foreground text-sm sm:text-base max-w-xl pt-1 font-sans leading-relaxed">
                            Real-time TT&C link heuristic analysis and automated threat mitigation. Protecting satellite pass windows and ground telemetry interfaces without active network probing.
                        </p>
                    </div>

                    {/* Automation Indicators & Attack Simulator */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto font-mono">
                        {/* Auto Neutralize */}
                        <div className="flex-1 lg:flex-none bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4 min-w-[210px]">
                            <div>
                                <div className="caps-label text-muted-foreground mb-1">
                                    Auto-Neutralize
                                </div>
                                <div className="text-foreground font-semibold flex items-center gap-2 text-sm tabular-nums">
                                    <Zap className="w-4 h-4 text-signal" />
                                    ENABLED (&gt;95%)
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-1 font-mono">Zero Latency Block</div>
                            </div>
                            <div className="w-7 h-7 rounded-md bg-grove/10 border border-grove/20 flex items-center justify-center text-grove font-semibold text-xs">
                                ✓
                            </div>
                        </div>

                        {/* Human Review */}
                        <div className="flex-1 lg:flex-none bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4 min-w-[210px]">
                            <div>
                                <div className="caps-label text-muted-foreground mb-1">
                                    Mission Review
                                </div>
                                <div className="text-foreground font-semibold flex items-center gap-2 text-sm">
                                    <Activity className="w-4 h-4 text-signal" />
                                    LOS SAFEGUARD
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-1 font-mono">Borderline Triage</div>
                            </div>
                            <div className="w-7 h-7 rounded-md bg-signal/10 border border-signal/20 flex items-center justify-center text-signal font-semibold text-xs">
                                ⚡
                            </div>
                        </div>
                    </div>
                </div>

                {/* 1-Click Live Attack Simulator Trigger */}
                <div className="pt-2 flex justify-center">
                    <AttackSimulatorTrigger variant="prominent" />
                </div>

                {/* Ground Station Live Link Strip */}
                <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="caps-label text-muted-foreground mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Radio className="w-3.5 h-3.5 text-signal" />
                            ISTRAC Ground Station Telemetry Interfaces
                        </span>
                        <span className="text-[11px] text-grove font-semibold font-mono tabular-nums">ALL {stations.length} NODES OPERATIONAL</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 font-mono text-xs">
                        {stations.map((st) => (
                            <div key={st.code} className="p-2.5 rounded-lg bg-background border border-border hover:border-muted-foreground/30 transition-colors">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-foreground text-[11px]">{st.code}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-grove"></span>
                                </div>
                                <div className="text-[11px] text-muted-foreground truncate mt-0.5">{st.name}</div>
                                <div className="text-[11px] text-muted-foreground mt-1 tabular-nums font-mono">RTT: {st.ping}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= KPI GRID ================= */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
                    {/* Telemetry Ingestion */}
                    <div className="bg-card rounded-xl p-5 border border-border flex flex-col justify-between hover:border-muted-foreground/30 transition-colors">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="caps-label text-muted-foreground">
                                        Telemetry Ingestion
                                    </h3>
                                    <div className="flex items-baseline mt-1 space-x-2">
                                        <span className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                                            {health ? health.traffic_processed : '688'}
                                        </span>
                                        <span className="text-xs font-mono font-medium text-muted-foreground">
                                            Flows
                                        </span>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground border border-border">
                                    <Radio className="w-4 h-4 text-signal" />
                                </div>
                            </div>
                        </div>

                        <div className="h-8 w-full flex items-end justify-between gap-1 pt-2">
                            {sparklineData.map((h, i) => (
                                <div key={i} className="w-1/12 bg-signal/30 hover:bg-signal rounded-t-sm transition-all" style={{ height: `${Math.min(Math.max(h, 15), 100)}%` }}></div>
                            ))}
                        </div>
                    </div>

                    {/* Ground Segment Security Score */}
                    <div className="bg-card rounded-xl p-5 border border-border flex flex-col justify-between hover:border-muted-foreground/30 transition-colors">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="caps-label text-muted-foreground">
                                        Link Integrity (OPS-SAT)
                                    </h3>
                                    <div className="flex items-baseline mt-1 space-x-2">
                                        <span className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-grove">
                                            {linkIntegrity.toFixed(1)}%
                                        </span>
                                        <span className="text-[11px] font-mono text-muted-foreground">Empirical</span>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground border border-border">
                                    <ShieldAlert className="w-4 h-4 text-grove" />
                                </div>
                            </div>
                        </div>

                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden mt-4">
                            <div className="bg-grove h-full rounded-full transition-all" style={{ width: `${linkIntegrity}%` }}></div>
                        </div>
                    </div>

                    {/* Auto-Resolution Rate */}
                    <div className="bg-card rounded-xl p-5 border border-border flex items-center justify-between hover:border-muted-foreground/30 transition-colors">
                        <div>
                            <h3 className="caps-label text-muted-foreground">
                                AI Defense Coverage
                            </h3>
                            <div className="flex items-baseline mt-1 space-x-2">
                                <span className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                                    {health ? health.automation_rate : '100.0%'}
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-mono mt-1">
                                Contextual bandit policy
                            </p>
                        </div>

                        <div className="relative w-14 h-14 shrink-0">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path className="text-muted"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none" stroke="currentColor" strokeWidth="3" />
                                <path className="text-signal transition-all duration-1000"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none" stroke="currentColor"
                                    strokeDasharray={`${parseFloat(health?.automation_rate || "100.0")}, 100`}
                                    strokeLinecap="round"
                                    strokeWidth="3" />
                            </svg>
                            <Zap className="absolute inset-0 m-auto text-signal w-4 h-4" />
                        </div>
                    </div>

                    {/* Defense Latency / MTPR */}
                    <div className="bg-card rounded-xl p-5 border border-border flex flex-col justify-between hover:border-muted-foreground/30 transition-colors">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="caps-label text-muted-foreground">
                                        Defense Latency (MTPR)
                                    </h3>
                                    <div className="flex items-baseline mt-1 space-x-2">
                                        <span className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                                            {health?.avg_defense_latency || '4.2 ms'}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground border border-border">
                                    <Activity className="w-4 h-4 text-signal" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-2 border-t border-border">
                            <span>AOS Bound: &lt;50ms</span>
                            <span className="font-semibold text-grove">PASSED</span>
                        </div>
                    </div>
                </div>

                {/* ================= NAVIGATION CARDS ================= */}
                <div className="pt-2">
                    <h2 className="text-base font-semibold mb-4 text-foreground border-l-2 border-signal pl-3">
                        Mission Operations Consoles
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
                        {/* Threat Command Bridge */}
                        <Link to="/client/command-center"
                            className="group relative block rounded-xl overflow-hidden bg-card border border-border hover:border-muted-foreground/40 transition-all p-5">
                            <div className="mb-4">
                                <span className="w-9 h-9 rounded-lg bg-background flex items-center justify-center border border-border text-foreground group-hover:text-signal transition-colors">
                                    <ShieldAlert className="w-4 h-4" />
                                </span>
                            </div>

                            <h3 className="text-base font-semibold mb-1 text-foreground group-hover:text-signal transition-colors">
                                Threat Command Bridge
                            </h3>
                            <p className="text-muted-foreground text-xs leading-relaxed mb-4">
                                Real-time monitoring of TT&C link intrusions, anomaly queues, and Mean Time to Pass Recovery (MTPR).
                            </p>

                            <div className="flex items-center text-foreground text-xs font-mono font-medium uppercase tracking-wider group-hover:text-signal">
                                <span>Open Bridge</span>
                                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>

                        {/* Ground Station Threat Map */}
                        <Link to="/client/map"
                            className="group relative block rounded-xl overflow-hidden bg-card border border-border hover:border-muted-foreground/40 transition-all p-5">
                            <div className="mb-4">
                                <span className="w-9 h-9 rounded-lg bg-background flex items-center justify-center border border-border text-foreground group-hover:text-signal transition-colors">
                                    <Globe className="w-4 h-4" />
                                </span>
                            </div>

                            <h3 className="text-base font-semibold mb-1 text-foreground group-hover:text-signal transition-colors">
                                Ground Station Map
                            </h3>
                            <p className="text-muted-foreground text-xs leading-relaxed mb-4">
                                Geolocation radar tracking incoming attack trajectories directed against 7 global ISRO stations.
                            </p>

                            <div className="flex items-center text-foreground text-xs font-mono font-medium uppercase tracking-wider group-hover:text-signal">
                                <span>Open Radar</span>
                                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>

                        {/* Orbital Pass Windows */}
                        <Link to="/client/passes"
                            className="group relative block rounded-xl overflow-hidden bg-card border border-border hover:border-muted-foreground/40 transition-all p-5">
                            <div className="mb-4">
                                <span className="w-9 h-9 rounded-lg bg-background flex items-center justify-center border border-border text-foreground group-hover:text-signal transition-colors">
                                    <Satellite className="w-4 h-4" />
                                </span>
                            </div>

                            <h3 className="text-base font-semibold mb-1 text-foreground group-hover:text-signal transition-colors">
                                Pass Window Status
                            </h3>
                            <p className="text-muted-foreground text-xs leading-relaxed mb-4">
                                Track active contact countdowns, LEO AOS/LOS times, and ground antenna elevation angles.
                            </p>

                            <div className="flex items-center text-foreground text-xs font-mono font-medium uppercase tracking-wider group-hover:text-signal">
                                <span>View Schedule</span>
                                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* ================= FOOTER ================= */}
                <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground font-mono">
                    <div className="flex items-center space-x-4">
                        <span>SOAR Space v4.2</span>
                        <span>Node: ISTRAC-BLR-MOX</span>
                        <span className="flex items-center gap-1.5 text-grove">
                            <span className="w-1.5 h-1.5 rounded-full bg-grove"></span>
                            Air-Gapped Telemetry Engine Active
                        </span>
                    </div>

                    <div className="mt-2 md:mt-0 text-muted-foreground">
                        ISRO Space Defense Protocol • Safe Offline Telemetry Evaluation
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;

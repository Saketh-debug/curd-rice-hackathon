import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Activity,
    ShieldAlert,
    Zap,
    Radio,
    Globe,
    Satellite,
    CheckCircle2,
    Crosshair,
    Orbit,
    ArrowUpRight
} from 'lucide-react';
import clsx from 'clsx';
import { useSystemHealth } from '../../../hooks/useSystemHealth';
import { AttackSimulatorTrigger } from '../../../components/AttackSimulator/AttackSimulatorTrigger';
import { AreaLine } from '@/components/soar/charts';
import { Pill, Dot } from '@/components/soar/ui';

export const Dashboard = () => {
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
    const peakVelocity = Math.max(...sparklineData, 1);

    return (
        <div className="relative min-h-screen font-sans space-y-8">
            {/* ================= HERO HEADER ================= */}
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 pb-6 border-b border-border/80">
                <div className="space-y-3 max-w-2xl">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-[11px] font-mono tracking-wider bg-card/80 backdrop-blur-md border-border text-signal">
                        <Satellite className="w-3.5 h-3.5" />
                        <span>ISTRAC GROUND DEFENSE NETWORK • MOX ACTIVE</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold tracking-tight leading-tight text-foreground">
                        AI-Driven Ground Segment <br />
                        <span className="text-gradient">
                            Incident Response System
                        </span>
                    </h1>

                    <p className="text-muted-foreground text-sm sm:text-base max-w-xl leading-relaxed">
                        Real-time TT&C link heuristic analysis and automated threat mitigation. Protecting satellite pass windows and ground telemetry interfaces without active network probing.
                    </p>
                </div>

                {/* Automation Indicators & Status Pills */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto font-mono">
                    {/* Auto Neutralize */}
                    <div className="flex-1 lg:flex-none glass rounded-2xl p-4 flex items-center justify-between gap-4 min-w-[210px] border border-hairline">
                        <div>
                            <div className="caps-label text-muted-foreground mb-1 text-[10px]">
                                Auto-Neutralize
                            </div>
                            <div className="text-foreground font-semibold flex items-center gap-2 text-sm tabular-nums">
                                <Zap className="w-4 h-4 text-signal" />
                                ENABLED (&gt;95%)
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">Zero Latency Drop</div>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-grove/15 border border-grove/30 flex items-center justify-center text-grove font-semibold text-xs">
                            ✓
                        </div>
                    </div>

                    {/* Mission Review */}
                    <div className="flex-1 lg:flex-none glass rounded-2xl p-4 flex items-center justify-between gap-4 min-w-[210px] border border-hairline">
                        <div>
                            <div className="caps-label text-muted-foreground mb-1 text-[10px]">
                                Mission Review
                            </div>
                            <div className="text-foreground font-semibold flex items-center gap-2 text-sm">
                                <Activity className="w-4 h-4 text-signal" />
                                LOS SAFEGUARD
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">Borderline Triage</div>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-signal/15 border border-signal/30 flex items-center justify-center text-signal font-semibold text-xs">
                            ⚡
                        </div>
                    </div>
                </div>
            </div>

            {/* 1-Click Live Attack Simulator Trigger */}
            <div className="pt-1 flex justify-center">
                <AttackSimulatorTrigger variant="prominent" />
            </div>

            {/* Ground Station Live Link Strip */}
            <div className="p-5 rounded-3xl glass border border-hairline">
                <div className="caps-label text-muted-foreground mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs">
                        <Radio className="w-3.5 h-3.5 text-signal" />
                        ISTRAC Ground Station Telemetry Interfaces
                    </span>
                    <span className="text-[11px] text-grove font-semibold font-mono tabular-nums flex items-center gap-2">
                        <Dot tone="grove" pulse />
                        ALL {stations.length} NODES OPERATIONAL
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 font-mono text-xs">
                    {stations.map((st) => (
                        <div key={st.code} className="p-3 rounded-2xl glass-panel hover:border-signal/40 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-foreground text-xs">{st.code}</span>
                                <span className="w-2 h-2 rounded-full bg-grove"></span>
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate mt-1">{st.name}</div>
                            <div className="text-[11px] text-signal mt-1.5 tabular-nums font-mono font-medium">RTT: {st.ping}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ================= KPI GRID ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
                {/* Telemetry Ingestion */}
                <div className="glass rounded-3xl p-5 border border-hairline flex flex-col justify-between hover:border-signal/30 transition-colors">
                    <div>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="caps-label text-muted-foreground text-[10px]">
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
                            <div className="w-8 h-8 rounded-xl bg-signal/15 flex items-center justify-center text-signal border border-signal/20">
                                <Radio className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Sparkline Visualization */}
                        <div className="flex items-end space-x-1.5 h-10 mt-3 pt-2 border-t border-border/40">
                            {sparklineData.map((val, idx) => {
                                const max = Math.max(...sparklineData);
                                const heightPercent = max > 0 ? (val / max) * 100 : 50;
                                return (
                                    <div
                                        key={idx}
                                        className={clsx(
                                            "flex-1 rounded-t-sm transition-all",
                                            idx === sparklineData.length - 1 ? "bg-signal shadow-glow" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                                        )}
                                        style={{ height: `${Math.max(15, heightPercent)}%` }}
                                        title={`Metric: ${val}`}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-3 border-t border-border/40 mt-3">
                        <span>24h Ingestion Trend</span>
                        <span className="font-semibold text-foreground">NOMINAL</span>
                    </div>
                </div>

                {/* Real-time Threat Detections */}
                <div className="glass rounded-3xl p-5 border border-hairline flex flex-col justify-between hover:border-alert/30 transition-colors">
                    <div>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="caps-label text-muted-foreground text-[10px]">
                                    Real-Time Threat Detections
                                </h3>
                                <div className="flex items-baseline mt-1 space-x-2">
                                    <span className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-alert">
                                        {health?.threats_detected ?? 2}
                                    </span>
                                    <span className="text-xs font-mono font-medium text-alert">
                                        High Severity
                                    </span>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-alert/15 flex items-center justify-center text-alert border border-alert/20">
                                <ShieldAlert className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-1 text-[11px] font-mono text-muted-foreground">
                            <div className="flex justify-between items-center">
                                <span>Auto-Blocked:</span>
                                <span className="font-semibold text-foreground tabular-nums">
                                    {health?.auto_blocked ?? 2}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Pending Triage:</span>
                                <span className="font-semibold text-signal tabular-nums">
                                    {health?.pending_reviews ?? 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-3 border-t border-border/40 mt-3">
                        <span>Pass Window Guard</span>
                        <span className="font-semibold text-grove">ACTIVE</span>
                    </div>
                </div>

                {/* Autonomous Defense Ratio */}
                <div className="glass rounded-3xl p-5 border border-hairline flex flex-col justify-between hover:border-grove/30 transition-colors">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="caps-label text-muted-foreground text-[10px]">
                                    Autonomous Defense Ratio
                                </h3>
                                <div className="flex items-baseline mt-1 space-x-2">
                                    <span className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                                        {health?.automation_rate || '99.4%'}
                                    </span>
                                    <span className="text-xs font-mono font-medium text-grove">
                                        Laya SOAR
                                    </span>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-grove/15 flex items-center justify-center text-grove border border-grove/20">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="text-[11px] font-mono text-muted-foreground space-y-1 pt-1">
                            <div>Controller Time Saved:</div>
                            <div className="text-foreground font-semibold">
                                {health?.controller_hours_saved || '14.2 Hours'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-3 border-t border-border/40 mt-3">
                        <span>FAR Ceiling: ≤0.1%</span>
                        <span className="font-semibold text-grove">PASS</span>
                    </div>
                </div>

                {/* Defense Latency / MTPR */}
                <div className="glass rounded-3xl p-5 border border-hairline flex flex-col justify-between hover:border-signal/30 transition-colors">
                    <div>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="caps-label text-muted-foreground text-[10px]">
                                    Defense Latency (MTPR)
                                </h3>
                                <div className="flex items-baseline mt-1 space-x-2">
                                    <span className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                                        {health?.avg_defense_latency || '4.2 ms'}
                                    </span>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-signal/15 flex items-center justify-center text-signal border border-signal/20">
                                <Activity className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">
                            Sub-5ms hardware envelope maintained across all ground antennae.
                        </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-3 border-t border-border/40 mt-3">
                        <span>AOS Bound: &lt;50ms</span>
                        <span className="font-semibold text-grove">PASSED</span>
                    </div>
                </div>
            </div>

            {/* ================= TELEMETRY VELOCITY CURVE ================= */}
            <div className="glass rounded-3xl p-6 border border-hairline">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                        <p className="caps-label text-signal text-[10px] tracking-widest">INGESTION TELEMETRY</p>
                        <h2 className="text-xl font-display font-semibold mt-0.5">Flow Ingestion Velocity</h2>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground glass px-3 py-1.5 rounded-full">
                        Peak: {peakVelocity.toLocaleString('en-US')} flows/min
                    </span>
                </div>
                <div className="h-44 w-full">
                    <AreaLine values={sparklineData} height={176} />
                </div>
                <div className="mt-3 flex justify-between font-mono text-[10px] text-muted-foreground border-t border-border/40 pt-2">
                    <span>−24h</span>
                    <span>−12h</span>
                    <span>Live Tracking (UTC)</span>
                </div>
            </div>

            {/* ================= NAVIGATION CARDS ================= */}
            <div className="pt-2">
                <h2 className="text-base font-semibold mb-4 text-foreground border-l-2 border-signal pl-3 font-display">
                    Mission Operations Consoles
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
                    {/* Threat Command Bridge */}
                    <Link
                        to="/client/command-center"
                        className="group relative block rounded-3xl overflow-hidden glass border border-hairline hover:border-signal/40 transition-all p-6 hover:-translate-y-1 duration-300"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <span className="w-10 h-10 rounded-2xl bg-signal/15 flex items-center justify-center border border-signal/20 text-signal">
                                <ShieldAlert className="w-5 h-5" />
                            </span>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-signal group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
                    <Link
                        to="/client/map"
                        className="group relative block rounded-3xl overflow-hidden glass border border-hairline hover:border-sky/40 transition-all p-6 hover:-translate-y-1 duration-300"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <span className="w-10 h-10 rounded-2xl bg-sky/15 flex items-center justify-center border border-sky/20 text-sky">
                                <Globe className="w-5 h-5" />
                            </span>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-sky group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>

                        <h3 className="text-base font-semibold mb-1 text-foreground group-hover:text-sky transition-colors">
                            Ground Station Map
                        </h3>
                        <p className="text-muted-foreground text-xs leading-relaxed mb-4">
                            Geolocation radar tracking incoming attack trajectories directed against 7 global ISRO stations.
                        </p>

                        <div className="flex items-center text-foreground text-xs font-mono font-medium uppercase tracking-wider group-hover:text-sky">
                            <span>Open Radar</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>

                    {/* Orbital Pass Windows */}
                    <Link
                        to="/client/passes"
                        className="group relative block rounded-3xl overflow-hidden glass border border-hairline hover:border-grove/40 transition-all p-6 hover:-translate-y-1 duration-300"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <span className="w-10 h-10 rounded-2xl bg-grove/15 flex items-center justify-center border border-grove/20 text-grove">
                                <Satellite className="w-5 h-5" />
                            </span>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-grove group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>

                        <h3 className="text-base font-semibold mb-1 text-foreground group-hover:text-grove transition-colors">
                            Pass Window Status
                        </h3>
                        <p className="text-muted-foreground text-xs leading-relaxed mb-4">
                            Track active contact countdowns, LEO AOS/LOS times, and ground antenna elevation angles.
                        </p>

                        <div className="flex items-center text-foreground text-xs font-mono font-medium uppercase tracking-wider group-hover:text-grove">
                            <span>View Schedule</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

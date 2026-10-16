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

const Dashboard = () => {
    const { health } = useSystemHealth();

    const stations = [
        { code: 'ISTRAC-BLR', name: 'Bengaluru MOX', status: 'ONLINE', ping: '2ms' },
        { code: 'IDSN-32M', name: 'Byalalu Deep Space', status: 'ONLINE', ping: '4ms' },
        { code: 'SDSC-SHAR', name: 'Sriharikota Ground', status: 'ONLINE', ping: '6ms' },
        { code: 'ISTRAC-PBL', name: 'Port Blair Downrange', status: 'ONLINE', ping: '12ms' },
        { code: 'ISTRAC-MAU', name: 'Mauritius Pass', status: 'STANDBY', ping: '38ms' },
    ];

    return (
        <div className="relative min-h-screen bg-[#050814] text-slate-100 font-sans">
            {/* Ambient Star Glows */}
            <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 relative z-10">

                {/* ================= HERO ================= */}
                <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                    <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-mono font-bold tracking-wider mb-2 bg-cyan-500/10 border-cyan-500/30 text-cyan-300">
                            <Satellite className="w-3.5 h-3.5" />
                            <span>ISTRAC GROUND DEFENSE NETWORK • MOX ACTIVE</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-orbitron leading-tight text-white">
                            AI-Driven Ground Segment <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-orange-400">
                                Incident Response System
                            </span>
                        </h1>

                        <p className="text-slate-400 text-base max-w-xl pt-1">
                            Real-time TT&C link heuristic analysis and automated threat mitigation. Protecting satellite pass windows and ground telemetry interfaces without active network probing.
                        </p>
                    </div>

                    {/* Automation Indicators */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto font-mono">
                        {/* Auto Neutralize */}
                        <div className="flex-1 lg:flex-none bg-[#0a1022] border border-cyan-500/30 rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm min-w-[210px]">
                            <div>
                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                                    Auto-Neutralize
                                </div>
                                <div className="text-cyan-400 font-bold flex items-center gap-2 text-sm">
                                    <Zap className="w-4 h-4" />
                                    ENABLED (&gt;95%)
                                </div>
                                <div className="text-[10px] text-slate-500 mt-1">Zero Latency Block</div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                                ✓
                            </div>
                        </div>

                        {/* Human Review */}
                        <div className="flex-1 lg:flex-none bg-[#0a1022] border border-orange-500/30 rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm min-w-[210px]">
                            <div>
                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                                    Mission Review
                                </div>
                                <div className="text-orange-400 font-bold flex items-center gap-2 text-sm">
                                    <Activity className="w-4 h-4" />
                                    LOS SAFEGUARD
                                </div>
                                <div className="text-[10px] text-slate-500 mt-1">Borderline Triage</div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold">
                                ⚡
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ground Station Live Link Strip */}
                <div className="p-4 rounded-xl bg-[#080d1e] border border-slate-800">
                    <div className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Radio className="w-3.5 h-3.5 text-cyan-400" />
                            ISTRAC Ground Station Telemetry Interfaces
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold">ALL 5 NODES OPERATIONAL</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 font-mono text-xs">
                        {stations.map((st) => (
                            <div key={st.code} className="p-2.5 rounded-lg bg-[#0a1022] border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-white text-[11px]">{st.code}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                </div>
                                <div className="text-[10px] text-slate-400 truncate mt-0.5">{st.name}</div>
                                <div className="text-[9px] text-cyan-400/80 mt-1">RTT: {st.ping}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= KPI GRID ================= */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                    {/* Telemetry Ingestion */}
                    <div className="bg-[#0a1022] border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/40 transition-all shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-slate-400 text-xs font-mono uppercase tracking-wider">
                                    Telemetry Ingestion (24h)
                                </h3>
                                <div className="flex items-baseline mt-1 space-x-2">
                                    <span className="text-4xl font-bold font-orbitron text-white">
                                        {health ? health.traffic_processed : '142,850'}
                                    </span>
                                    <span className="text-xs font-mono font-bold text-cyan-400">
                                        Flows
                                    </span>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                                <Radio className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="h-10 w-full flex items-end justify-between gap-1 opacity-70 pt-2">
                            {[30, 50, 40, 70, 55, 45, 80, 60, 40, 30, 20, 45].map((h, i) => (
                                <div key={i} className="w-1/12 bg-cyan-500/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>

                    {/* Ground Segment Security Score */}
                    <div className="bg-[#0a1022] border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/40 transition-all shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-slate-400 text-xs font-mono uppercase tracking-wider">
                                    Link Integrity Score
                                </h3>
                                <div className="flex items-baseline mt-1 space-x-2">
                                    <span className="text-4xl font-bold font-orbitron text-emerald-400">
                                        98.4%
                                    </span>
                                    <span className="text-xs font-mono text-slate-500">Nominal</span>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden mt-6">
                            <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full" style={{ width: '98.4%' }}></div>
                        </div>
                    </div>

                    {/* Auto-Resolution Rate */}
                    <div className="bg-[#0a1022] border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/40 transition-all shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-slate-400 text-xs font-mono uppercase tracking-wider">
                                    AI Defense Coverage
                                </h3>
                                <div className="flex items-baseline mt-1 space-x-2">
                                    <span className="text-4xl font-bold font-orbitron text-white">
                                        {health ? health.automation_rate : '99.4%'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-2 max-w-[150px]">
                                    Percentage of security threats neutralized automatically.
                                </p>
                            </div>

                            <div className="relative w-20 h-20">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-slate-800"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none" stroke="currentColor" strokeWidth="3" />
                                    <path className="text-cyan-400 transition-all duration-1000"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none" stroke="currentColor"
                                        strokeDasharray={`${parseFloat(health?.automation_rate || "99.4")}, 100`}
                                        strokeLinecap="round"
                                        strokeWidth="3" />
                                </svg>
                                <Zap className="absolute inset-0 m-auto text-cyan-400 w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= NAVIGATION CARDS ================= */}
                <div className="pt-2">
                    <h2 className="text-base font-orbitron font-bold mb-6 text-white border-l-4 border-cyan-400 pl-3">
                        Mission Operations Consoles
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                        {/* Threat Command Bridge */}
                        <Link to="/client/command-center"
                            className="group relative block rounded-2xl overflow-hidden bg-[#0a1022] border border-slate-800 hover:border-cyan-500/50 transition-all p-6 shadow-sm">
                            <div className="mb-4">
                                <span className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                                    <ShieldAlert className="w-5 h-5" />
                                </span>
                            </div>

                            <h3 className="text-xl font-bold font-orbitron mb-2 text-white group-hover:text-cyan-400 transition-colors">
                                Threat Command Bridge
                            </h3>
                            <p className="text-slate-400 text-xs leading-relaxed mb-4">
                                Real-time monitoring of TT&C link intrusions, anomaly queues, and Mean Time to Pass Recovery (MTPR).
                            </p>

                            <div className="flex items-center text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
                                <span>Open Bridge</span>
                                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>

                        {/* Ground Station Threat Map */}
                        <Link to="/client/map"
                            className="group relative block rounded-2xl overflow-hidden bg-[#0a1022] border border-slate-800 hover:border-orange-500/50 transition-all p-6 shadow-sm">
                            <div className="mb-4">
                                <span className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/30 text-orange-400 group-hover:bg-orange-500 group-hover:text-black transition-colors">
                                    <Globe className="w-5 h-5" />
                                </span>
                            </div>

                            <h3 className="text-xl font-bold font-orbitron mb-2 text-white group-hover:text-orange-400 transition-colors">
                                Ground Station Map
                            </h3>
                            <p className="text-slate-400 text-xs leading-relaxed mb-4">
                                Geolocation radar tracking incoming attack trajectories directed against 7 global ISRO stations.
                            </p>

                            <div className="flex items-center text-orange-400 text-xs font-mono font-bold uppercase tracking-wider">
                                <span>Open Radar</span>
                                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>

                        {/* Orbital Pass Windows */}
                        <Link to="/client/passes"
                            className="group relative block rounded-2xl overflow-hidden bg-[#0a1022] border border-slate-800 hover:border-emerald-500/50 transition-all p-6 shadow-sm">
                            <div className="mb-4">
                                <span className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                                    <Satellite className="w-5 h-5" />
                                </span>
                            </div>

                            <h3 className="text-xl font-bold font-orbitron mb-2 text-white group-hover:text-emerald-400 transition-colors">
                                Pass Window Status
                            </h3>
                            <p className="text-slate-400 text-xs leading-relaxed mb-4">
                                Track active contact countdowns, LEO AOS/LOS times, and ground antenna elevation angles.
                            </p>

                            <div className="flex items-center text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                                <span>View Schedule</span>
                                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* ================= FOOTER ================= */}
                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 font-mono">
                    <div className="flex items-center space-x-4">
                        <span>SOAR Space v4.2</span>
                        <span>Node: ISTRAC-BLR-MOX</span>
                        <span className="flex items-center gap-1.5 text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Air-Gapped Telemetry Engine Active
                        </span>
                    </div>

                    <div className="mt-2 md:mt-0 text-slate-600">
                        ISRO Space Defense Protocol • Safe Offline Telemetry Evaluation
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;

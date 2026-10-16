import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Activity,
    ShieldAlert,
    Zap,
    Radio,
    Globe,
    Satellite,
    Cpu
} from 'lucide-react';
import { useSystemHealth } from '../../../hooks/useSystemHealth';

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
    const linkIntegrity = health?.link_integrity_score ?? 98.4;

    return (
        <div className="space-y-12">
            {/* Ambient Orange Glow */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/10 rounded-full blur-[140px] pointer-events-none"></div>

            {/* ================= HERO SECTION (Centered with clean whitespace) ================= */}
            <section className="relative text-center max-w-4xl mx-auto pt-4 pb-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider bg-orange-500/10 border-orange-500/30 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                    <Satellite className="w-3.5 h-3.5" />
                    <span>ISTRAC GROUND DEFENSE NETWORK • MOX ACTIVE</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-orbitron leading-tight text-white tracking-wide">
                    AI-Driven Ground Segment <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
                        Incident Response System
                    </span>
                </h1>

                <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-sans">
                    Real-time TT&C link heuristic analysis and automated threat mitigation. Protecting satellite pass windows and ground telemetry interfaces without active network probing.
                </p>

                {/* Automation Status Chips */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-3 font-mono text-xs">
                    <div className="bg-[#0a1022]/80 backdrop-blur-md border border-orange-500/30 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-[0_4px_20px_rgba(249,115,22,0.08)]">
                        <div className="w-8 h-8 rounded-full bg-orange-500/15 border border-orange-500/40 flex items-center justify-center text-orange-400 font-bold">
                            <Zap className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Auto-Neutralize</div>
                            <div className="text-orange-400 font-bold">ENABLED (&gt;95% Conf)</div>
                        </div>
                    </div>

                    <div className="bg-[#0a1022]/80 backdrop-blur-md border border-orange-500/30 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-[0_4px_20px_rgba(249,115,22,0.08)]">
                        <div className="w-8 h-8 rounded-full bg-orange-500/15 border border-orange-500/40 flex items-center justify-center text-orange-400 font-bold">
                            <Activity className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Mission Review</div>
                            <div className="text-orange-300 font-bold">LOS SAFEGUARD</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= GROUND STATIONS STRIP ================= */}
            <section className="bg-[#0a1022]/70 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-5 shadow-sm">
                <div className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-orange-400">
                        <Radio className="w-4 h-4" />
                        <span>ISTRAC Ground Station Telemetry Interfaces</span>
                    </span>
                    <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        ALL {stations.length} NODES OPERATIONAL
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 font-mono text-xs">
                    {stations.map((st) => (
                        <div 
                            key={st.code} 
                            className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-orange-500/40 hover:bg-slate-900/90 transition-all duration-200 group"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-white text-xs group-hover:text-orange-300 transition-colors">{st.code}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-1">{st.name}</div>
                            <div className="text-[10px] text-orange-400/90 mt-1.5 font-bold">RTT: {st.ping}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ================= KPI GRID (Centered whitespace & glass cards) ================= */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                {/* Telemetry Ingestion */}
                <div className="bg-[#0a1022]/80 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 hover:border-orange-500/40 transition-all shadow-sm group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-slate-400 text-xs font-mono uppercase tracking-wider">
                                Telemetry Ingestion (24h)
                            </h3>
                            <div className="flex items-baseline mt-2 space-x-2">
                                <span className="text-3xl sm:text-4xl font-bold font-orbitron text-white">
                                    {health ? health.traffic_processed : '142,850'}
                                </span>
                                <span className="text-xs font-mono font-bold text-orange-400">
                                    Flows
                                </span>
                            </div>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/25 group-hover:scale-105 transition-transform">
                            <Radio className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="h-10 w-full flex items-end justify-between gap-1 opacity-80 pt-2">
                        {sparklineData.map((h, i) => (
                            <div 
                                key={i} 
                                className="w-1/12 bg-orange-500/40 rounded-t-sm group-hover:bg-orange-500/70 transition-colors" 
                                style={{ height: `${Math.min(Math.max(h, 15), 100)}%` }}
                            ></div>
                        ))}
                    </div>
                </div>

                {/* Link Integrity */}
                <div className="bg-[#0a1022]/80 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 hover:border-emerald-500/40 transition-all shadow-sm group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-slate-400 text-xs font-mono uppercase tracking-wider">
                                Link Integrity Score (ESA OPS-SAT)
                            </h3>
                            <div className="flex items-baseline mt-2 space-x-2">
                                <span className="text-3xl sm:text-4xl font-bold font-orbitron text-emerald-400">
                                    {linkIntegrity.toFixed(1)}%
                                </span>
                                <span className="text-xs font-mono text-slate-500">Nominal</span>
                            </div>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/25 group-hover:scale-105 transition-transform">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden mt-6">
                        <div className="bg-gradient-to-r from-emerald-500 to-orange-400 h-full rounded-full" style={{ width: `${linkIntegrity}%` }}></div>
                    </div>
                </div>

                {/* Defense Coverage */}
                <div className="bg-[#0a1022]/80 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 hover:border-orange-500/40 transition-all shadow-sm group">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-slate-400 text-xs font-mono uppercase tracking-wider">
                                AI Defense Coverage
                            </h3>
                            <div className="flex items-baseline mt-2 space-x-2">
                                <span className="text-3xl sm:text-4xl font-bold font-orbitron text-white">
                                    {health ? health.automation_rate : '99.4%'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 max-w-[160px] leading-relaxed">
                                Security threats automatically neutralized before pass window loss.
                            </p>
                        </div>

                        <div className="relative w-20 h-20 shrink-0">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path 
                                    className="text-slate-800" 
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="3" 
                                />
                                <path 
                                    className="text-orange-400 transition-all duration-1000" 
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeDasharray={`${parseFloat(health?.automation_rate || "99.4")}, 100`} 
                                    strokeLinecap="round" 
                                    strokeWidth="3" 
                                />
                            </svg>
                            <Zap className="absolute inset-0 m-auto text-orange-400 w-6 h-6" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= NAVIGATION CARDS (Centered aesthetic) ================= */}
            <section className="space-y-6 pt-2">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5" />
                            <span>Operational Bridge</span>
                        </div>
                        <h2 className="text-xl font-orbitron font-bold text-white">
                            Mission Operations Consoles
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                    {/* Threat Command Bridge */}
                    <Link 
                        to="/client/command-center"
                        className="group relative block rounded-2xl overflow-hidden bg-[#0a1022]/75 backdrop-blur-xl border border-slate-800/80 hover:border-orange-500/50 hover:bg-[#0c142b]/90 transition-all duration-300 p-6 shadow-sm"
                    >
                        <div className="mb-4">
                            <span className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/25 text-orange-400 group-hover:bg-orange-500 group-hover:text-black transition-all">
                                <ShieldAlert className="w-5 h-5" />
                            </span>
                        </div>

                        <h3 className="text-lg font-bold font-orbitron mb-2 text-white group-hover:text-orange-400 transition-colors">
                            Threat Command Bridge
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed mb-5">
                            Real-time monitoring of TT&C link intrusions, anomaly queues, and Mean Time to Pass Recovery (MTPR).
                        </p>

                        <div className="flex items-center text-orange-400 text-xs font-mono font-bold uppercase tracking-wider">
                            <span>Open Bridge</span>
                            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1.5 transition-transform" />
                        </div>
                    </Link>

                    {/* Ground Station Threat Map */}
                    <Link 
                        to="/client/map"
                        className="group relative block rounded-2xl overflow-hidden bg-[#0a1022]/75 backdrop-blur-xl border border-slate-800/80 hover:border-orange-500/50 hover:bg-[#0c142b]/90 transition-all duration-300 p-6 shadow-sm"
                    >
                        <div className="mb-4">
                            <span className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/25 text-orange-400 group-hover:bg-orange-500 group-hover:text-black transition-all">
                                <Globe className="w-5 h-5" />
                            </span>
                        </div>

                        <h3 className="text-lg font-bold font-orbitron mb-2 text-white group-hover:text-orange-400 transition-colors">
                            Ground Station Map
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed mb-5">
                            Geolocation radar tracking incoming attack trajectories directed against 7 global ISRO ground stations.
                        </p>

                        <div className="flex items-center text-orange-400 text-xs font-mono font-bold uppercase tracking-wider">
                            <span>Open Radar</span>
                            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1.5 transition-transform" />
                        </div>
                    </Link>

                    {/* Orbital Pass Windows */}
                    <Link 
                        to="/client/passes"
                        className="group relative block rounded-2xl overflow-hidden bg-[#0a1022]/75 backdrop-blur-xl border border-slate-800/80 hover:border-orange-500/50 hover:bg-[#0c142b]/90 transition-all duration-300 p-6 shadow-sm"
                    >
                        <div className="mb-4">
                            <span className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/25 text-orange-400 group-hover:bg-orange-500 group-hover:text-black transition-all">
                                <Satellite className="w-5 h-5" />
                            </span>
                        </div>

                        <h3 className="text-lg font-bold font-orbitron mb-2 text-white group-hover:text-orange-400 transition-colors">
                            Pass Window Status
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed mb-5">
                            Track active contact countdowns, LEO AOS/LOS times, and ground antenna elevation angles with telemetry checks.
                        </p>

                        <div className="flex items-center text-orange-400 text-xs font-mono font-bold uppercase tracking-wider">
                            <span>View Schedule</span>
                            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1.5 transition-transform" />
                        </div>
                    </Link>
                </div>
            </section>

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
    );
};

export default Dashboard;

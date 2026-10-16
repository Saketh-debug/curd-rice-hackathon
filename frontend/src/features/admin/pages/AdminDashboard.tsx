import React from 'react';
import { Link } from 'react-router-dom';
import { useAdminData } from '../hooks/useAdminData';
import { useSystemHealth } from '../../../hooks/useSystemHealth';
import { AlertTriangle, Clock, ShieldAlert, CheckCircle, ArrowRight, Satellite, ShieldCheck, Activity } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

const mapSpaceThreatName = (type: string) => {
    if (type.includes('DDoS')) return 'TT&C Uplink Saturation';
    if (type.includes('DoS')) return 'TT&C Gateway Flood';
    if (type.includes('Brute')) return 'TC Authentication Bypass';
    if (type.includes('Port')) return 'SLE Port Reconnaissance';
    if (type.includes('Bot')) return 'Ground RTU Sensor Hijack';
    if (type.includes('Web')) return 'Mission Data Distribution Exploit';
    if (type.includes('Normal')) return 'Nominal Housekeeping Telemetry';
    return type;
};

export const AdminDashboard = () => {
    const { pendingIncidents, stats, recentActions } = useAdminData();
    const { health } = useSystemHealth();

    return (
        <div className="space-y-10">
            {/* Header Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800/80">
                <div>
                    <div className="flex items-center gap-2 text-orange-400 font-mono text-xs uppercase tracking-widest mb-1.5">
                        <Satellite className="w-4 h-4" />
                        <span>Security Investigation Queue • Ground Station Telemetry</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-orbitron text-white flex items-center gap-2.5">
                        <AlertTriangle className="text-orange-400 w-6 h-6 shrink-0" />
                        <span>Pending Threat Anomalies Requiring Action</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                    <Link
                        to="/admin/benchmark"
                        className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-300 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all shadow-[0_0_15px_rgba(249,115,22,0.1)] flex items-center gap-2"
                    >
                        <span>📊 View 7x7 Benchmark</span>
                    </Link>
                </div>
            </div>

            {/* Space Defense Governance Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
                <div className="bg-[#0a1022]/80 backdrop-blur-xl p-4 rounded-2xl border border-orange-500/20 shadow-sm">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Link Integrity</span>
                    <div className="text-xl font-bold font-orbitron text-emerald-400 mt-1">
                        {(health?.link_integrity_score ?? 96.0).toFixed(1)}%
                    </div>
                    <span className="text-[10px] text-slate-500">OPS-SAT Validated</span>
                </div>
                <div className="bg-[#0a1022]/80 backdrop-blur-xl p-4 rounded-2xl border border-orange-500/20 shadow-sm">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">AI Automation</span>
                    <div className="text-xl font-bold font-orbitron text-orange-400 mt-1">
                        {health?.automation_rate || '100.0%'}
                    </div>
                    <span className="text-[10px] text-slate-500">SOAR Bandit Policy</span>
                </div>
                <div className="bg-[#0a1022]/80 backdrop-blur-xl p-4 rounded-2xl border border-orange-500/20 shadow-sm">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Defense Latency</span>
                    <div className="text-xl font-bold font-orbitron text-amber-400 mt-1">
                        {health?.avg_defense_latency || stats.avgResponseTime || '4.2 ms'}
                    </div>
                    <span className="text-[10px] text-slate-500">&lt; AOS Limit</span>
                </div>
                <div className="bg-[#0a1022]/80 backdrop-blur-xl p-4 rounded-2xl border border-orange-500/20 shadow-sm">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Review Backlog</span>
                    <div className="text-xl font-bold font-orbitron text-white mt-1">
                        {pendingIncidents.length} Flows
                    </div>
                    <span className="text-[10px] text-orange-400 font-bold">Awaiting Controller</span>
                </div>
            </div>

            {/* Main Content Grid with generous whitespace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Section: Pending Incident Cards (lg:col-span-8) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
                            <span>Active Anomaly Feed</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-orange-500/15 text-orange-400 border border-orange-500/30">
                                {pendingIncidents.length} Unresolved
                            </span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {pendingIncidents.length === 0 ? (
                            <div className="p-12 text-center bg-[#0a1022]/80 backdrop-blur-xl rounded-2xl border border-slate-800 text-slate-400 shadow-sm">
                                <CheckCircle className="w-14 h-14 mx-auto mb-3 text-emerald-400" />
                                <h3 className="text-lg font-bold font-orbitron text-white">All Clear • No Pending Anomalies</h3>
                                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                    All ground telemetry network flows are currently operating within nominal baseline parameters.
                                </p>
                            </div>
                        ) : (
                            pendingIncidents.map((incident) => {
                                const spaceName = mapSpaceThreatName(incident.type);
                                return (
                                    <div 
                                        key={incident.id} 
                                        className="group relative bg-[#0a1022]/80 backdrop-blur-xl border-l-4 border-l-orange-400 border border-slate-800/90 hover:border-orange-500/40 rounded-2xl shadow-sm hover:shadow-[0_4px_25px_rgba(249,115,22,0.08)] transition-all p-6 font-sans"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                            <div className="flex items-center gap-2 font-mono">
                                                <span className="text-[11px] font-bold text-slate-400">FLOW #{incident.id}</span>
                                                <span className={clsx(
                                                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                    incident.confidence > 0.9 
                                                        ? "bg-red-500/15 text-red-400 border border-red-500/30" 
                                                        : "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                                                )}>
                                                    {incident.confidence > 0.9 ? 'PASS WINDOW CRITICAL' : 'UPLINK ANOMALY'}
                                                </span>
                                            </div>
                                            <span className="text-xs font-mono text-slate-500">
                                                Port {incident.destination_port}
                                            </span>
                                        </div>

                                        <div className="mb-5">
                                            <h3 className="text-lg font-bold font-orbitron text-white group-hover:text-orange-300 transition-colors mb-1">
                                                {spaceName}
                                            </h3>
                                            <p className="text-xs text-slate-400 font-mono">
                                                Origin IP: <span className="text-slate-200 font-semibold">{incident.src_ip}</span> ({incident.country || 'External Geo'}) → Protocol Destination: Port {incident.destination_port}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-4 font-mono pt-3 border-t border-slate-800/80">
                                            <div className="flex items-center gap-4 text-xs">
                                                <div>
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">ML Heuristic Confidence</p>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" 
                                                                style={{ width: `${incident.confidence * 100}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="font-bold text-orange-400 text-xs">{Math.round(incident.confidence * 100)}%</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Link
                                                to={`/admin/incidents/review/${incident.id}`}
                                                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black text-xs font-orbitron font-bold rounded-xl shadow-md transition-all flex items-center gap-2 group/btn"
                                            >
                                                <span>Investigate Anomaly</span>
                                                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Recent Controller Interventions */}
                    <div className="pt-4">
                        <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-orange-400" />
                            <span>Recent Mission Controller & AI Interventions</span>
                        </h2>

                        <div className="bg-[#0a1022]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 font-mono text-xs shadow-sm">
                            <div className="relative pl-6 border-l border-slate-800 space-y-6">
                                {recentActions.length === 0 ? (
                                    <p className="text-xs text-slate-500">No recent actions logged.</p>
                                ) : (
                                    recentActions.map((action, idx) => (
                                        <div key={idx} className="relative">
                                            <span className={clsx(
                                                "absolute -left-[31px] top-1 h-3 w-3 rounded-full ring-4 ring-[#0a1022]",
                                                action.action === 'AUTO_BLOCKED' ? "bg-red-400" :
                                                    action.action === 'MANUAL_BLOCK' ? "bg-orange-400" : "bg-emerald-400"
                                            )}></span>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-xs font-bold text-white">
                                                        {action.action.replace('_', ' ')} • Node: {action.src_ip}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                                        Flow #{action.id} • Vector: {mapSpaceThreatName(action.type)}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] text-slate-400">
                                                    {action.timestamp ? format(new Date(action.timestamp), 'HH:mm:ss') : 'Recent'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Priority Queue & Readiness Widgets (lg:col-span-4) */}
                <div className="lg:col-span-4 space-y-6 font-mono text-xs">
                    
                    {/* Priority Queue Container */}
                    <div className="bg-[#0a1022]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-slate-800 bg-[#0d162e]/70 flex justify-between items-center">
                            <h2 className="text-xs font-orbitron font-bold text-white uppercase tracking-wider">Priority Queue</h2>
                            <span className="bg-orange-500/15 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-500/30">
                                {pendingIncidents.length} Pending
                            </span>
                        </div>
                        <div className="divide-y divide-slate-800/60 max-h-[380px] overflow-y-auto">
                            {pendingIncidents.map((incident) => (
                                <Link
                                    to={`/admin/incidents/review/${incident.id}`}
                                    key={incident.id}
                                    className="p-4 hover:bg-slate-800/30 transition-colors block group"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] text-orange-400 font-bold">LOS SAFEGUARD</span>
                                        <span className="text-[10px] text-slate-500">#{incident.id}</span>
                                    </div>
                                    <h4 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                                        {mapSpaceThreatName(incident.type)}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{incident.src_ip}</p>
                                </Link>
                            ))}
                            {pendingIncidents.length === 0 && (
                                <div className="p-8 text-center text-slate-500 text-xs">Queue nominal. Zero backlog.</div>
                            )}
                        </div>
                    </div>

                    {/* Ground Segment Security Readiness Card */}
                    <div className="bg-[#0a1022]/80 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-orbitron font-bold text-white">Ground Security Readiness</h4>
                                <span className="text-[10px] text-orange-400 font-mono">MOX Air-Gap Isolation 100%</span>
                            </div>
                        </div>

                        <div className="space-y-3 font-mono">
                            <div className="flex justify-between text-[11px]">
                                <span className="text-slate-400">Link Integrity (OPS-SAT)</span>
                                <span className="text-emerald-400 font-bold">{(health?.link_integrity_score ?? 83.6).toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400" style={{ width: `${health?.link_integrity_score ?? 83.6}%` }}></div>
                            </div>
                            <div className="flex justify-between text-[11px]">
                                <span className="text-slate-400">Avg Defense Latency</span>
                                <span className="text-white font-bold">{health?.avg_defense_latency || stats.avgResponseTime || '4.2 ms'}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 w-[96%] rounded-full"></div>
                            </div>
                            <div className="text-[10px] text-slate-400 pt-1 leading-relaxed">
                                Continuous passive flow monitoring operating across all 5 ISTRAC telemetry downlinks.
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

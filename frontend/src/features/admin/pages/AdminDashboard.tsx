import { Link } from 'react-router-dom';
import { useAdminData } from '../hooks/useAdminData';
import { AlertTriangle, Clock, ShieldAlert, CheckCircle, XCircle, ArrowRight, Filter, Satellite, Radio } from 'lucide-react';
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

    return (
        <div className="p-6 md:p-8 grid grid-cols-12 gap-6 relative min-h-screen bg-[#050814] text-slate-100 font-sans">
            {/* Left Column: Pending Reviews */}
            <div className="col-span-12 lg:col-span-8 xl:col-span-9 flex flex-col gap-6">

                {/* Section Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                        <div className="flex items-center gap-2 text-orange-400 font-mono text-xs uppercase tracking-widest mb-1">
                            <Satellite className="w-4 h-4" />
                            Mission Controller Review Queue
                        </div>
                        <h2 className="text-xl font-bold font-orbitron text-white flex items-center gap-2">
                            <AlertTriangle className="text-orange-400 w-5 h-5" />
                            Pending Telemetry Anomalies Requiring Action
                        </h2>
                    </div>

                    <div className="flex gap-2 font-mono text-xs">
                        <Link
                            to="/admin/benchmark"
                            className="px-3 py-1.5 rounded-lg bg-[#0e1733] border border-cyan-500/30 text-cyan-300 hover:bg-[#15244d] transition-colors"
                        >
                            📊 View 7x7 Benchmark
                        </Link>
                    </div>
                </div>

                {/* Active Incidents Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {pendingIncidents.length === 0 ? (
                        <div className="col-span-full p-8 text-center bg-[#0a1022] rounded-xl border border-slate-800 text-slate-400">
                            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
                            <h3 className="text-lg font-bold font-orbitron text-white">All Clear • No Pending Review Anomalies</h3>
                            <p className="text-xs text-slate-500 mt-1">Ground segment links operating within nominal threshold boundaries.</p>
                        </div>
                    ) : (
                        pendingIncidents.map((incident) => {
                            const spaceName = mapSpaceThreatName(incident.type);
                            return (
                                <div key={incident.id} className="group relative bg-[#0a1022] border-l-4 border-l-orange-400 border border-slate-800 rounded-xl shadow-sm hover:border-orange-500/50 transition-all p-5 font-sans">
                                    <div className="absolute top-4 right-4 flex items-center gap-2 font-mono">
                                        <span className="text-[10px] text-slate-400">FLOW: #{incident.id}</span>
                                        <span className={clsx(
                                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                            incident.confidence > 0.9 ? "bg-red-500/15 text-red-400 border border-red-500/30" : "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                                        )}>
                                            {incident.confidence > 0.9 ? 'PASS WINDOW CRITICAL' : 'UPLINK ANOMALY'}
                                        </span>
                                    </div>

                                    <div className="mb-4 pr-12">
                                        <h3 className="text-base font-bold font-orbitron text-white mb-1">{spaceName}</h3>
                                        <p className="text-xs text-slate-400 font-mono">
                                            Origin: {incident.src_ip} ({incident.country || 'External'}) → Ground Port {incident.destination_port}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-end justify-between gap-4 font-mono">
                                        <div className="flex items-center gap-4 text-xs">
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">ML Confidence</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-cyan-400" style={{ width: `${incident.confidence * 100}%` }}></div>
                                                    </div>
                                                    <span className="font-bold text-cyan-400">{Math.round(incident.confidence * 100)}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <Link
                                                to={`/admin/incidents/review/${incident.id}`}
                                                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-black text-xs font-orbitron font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
                                            >
                                                Investigate Anomaly <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Recent Actions (Bottom) */}
                <div className="mt-auto">
                    <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4">
                        Recent Mission Controller & AI Interventions
                    </h2>
                    <div className="bg-[#0a1022] border border-slate-800 rounded-xl p-5 font-mono text-xs">
                        <div className="relative pl-6 border-l border-slate-800 space-y-6">
                            {recentActions.length === 0 ? <p className="text-xs text-slate-500">No recent actions logged.</p> : recentActions.map((action, idx) => (
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
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Priority Queue & Status */}
            <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col h-full gap-6 font-mono text-xs">
                {/* Priority Queue Widget */}
                <div className="flex flex-col h-full bg-[#0a1022] border border-slate-800 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-800 bg-[#0d162e] flex justify-between items-center">
                        <h2 className="text-xs font-orbitron font-bold text-white uppercase tracking-wider">Mission Queue</h2>
                        <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded border border-orange-500/30">
                            {pendingIncidents.length} Pending
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {pendingIncidents.map((incident) => (
                            <Link
                                to={`/admin/incidents/review/${incident.id}`}
                                key={incident.id}
                                className="p-3.5 border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors block group"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] text-orange-400 font-bold">LOS SAFEGUARD</span>
                                    <span className="text-[10px] text-slate-500">#{incident.id}</span>
                                </div>
                                <h4 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                                    {mapSpaceThreatName(incident.type)}
                                </h4>
                            </Link>
                        ))}
                        {pendingIncidents.length === 0 && (
                            <div className="p-8 text-center text-slate-500 text-xs">Queue empty. Nominal state.</div>
                        )}
                    </div>
                </div>

                {/* Ground Segment Readiness Widget */}
                <div className="bg-[#0a1022] border border-cyan-500/30 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <ShieldAlert className="text-cyan-400 w-5 h-5" />
                        <h4 className="text-xs font-orbitron font-bold text-cyan-300">Ground Security Readiness</h4>
                    </div>
                    <div className="space-y-3 font-mono">
                        <div className="flex justify-between text-[11px]">
                            <span className="text-slate-400">Avg Defense Latency</span>
                            <span className="text-white font-bold">{stats.avgResponseTime || '12ms'}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-400 w-[96%]"></div>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1">
                            ISTRAC MOX Air-Gap Isolation: 100% Verified
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

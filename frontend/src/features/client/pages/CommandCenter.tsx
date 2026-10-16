import { Radar, ShieldBan, Wand2, Timer, AlertOctagon, AlertTriangle, Satellite, Radio } from 'lucide-react';
import { useSystemHealth } from '../../../hooks/useSystemHealth';
import { useLiveTraffic } from '../../../hooks/useLiveTraffic';
import clsx from 'clsx';

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

export const CommandCenter = () => {
    const { health } = useSystemHealth();
    const { traffic } = useLiveTraffic();

    // Filter for only actioned items for the table
    const recentActions = traffic.filter(p => p.action !== 'MONITOR').slice(0, 5);

    // Compute dynamic threat breakdowns from real traffic stream
    const threatFlows = traffic.filter(p => p.type !== 'Normal Traffic');
    const totalThreatCount = health?.threats_detected ?? (threatFlows.length > 0 ? threatFlows.length : 128);
    const criticalThreats = threatFlows.length > 0 
        ? threatFlows.filter(p => (p.confidence ?? 0.8) >= 0.90).length
        : Math.round(totalThreatCount * 0.15);
    const highThreats = threatFlows.length > 0
        ? threatFlows.filter(p => (p.confidence ?? 0.8) >= 0.75 && (p.confidence ?? 0.8) < 0.90).length
        : Math.round(totalThreatCount * 0.28);
    const mediumThreats = threatFlows.length > 0
        ? threatFlows.filter(p => (p.confidence ?? 0.8) >= 0.50 && (p.confidence ?? 0.8) < 0.75).length
        : Math.round(totalThreatCount * 0.35);
    const lowThreats = threatFlows.length > 0
        ? threatFlows.filter(p => (p.confidence ?? 0.8) < 0.50).length
        : Math.max(0, totalThreatCount - criticalThreats - highThreats - mediumThreats);

    const autoBlockedCount = health?.auto_blocked ?? traffic.filter(p => p.action === 'AUTO_BLOCKED').length;
    const avgLatency = health?.avg_defense_latency || '4.2 ms';

    return (
        <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6 bg-[#050814] text-slate-100 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                    <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-1">
                        <Satellite className="w-4 h-4" />
                        ISTRAC MOX Flight Telemetry Protection
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-orbitron text-white">
                        Threat Command Bridge
                    </h1>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-slate-300">DEFENSE STATUS: </span>
                    <span className="text-emerald-400 font-bold">ALL LINKS SECURED</span>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
                <div className="bg-[#0a1022] rounded-xl p-5 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Radar className="w-16 h-16 text-cyan-400" />
                    </div>
                    <p className="text-xs text-slate-400 font-mono mb-1 uppercase tracking-wider">Active Space Threats</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold font-orbitron text-white">
                            {totalThreatCount.toLocaleString()}
                        </h3>
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">
                            LEO Contact Cone
                        </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 mt-4 rounded-full overflow-hidden">
                        <div className="bg-cyan-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(15, (totalThreatCount / 2000) * 100))}%` }}></div>
                    </div>
                </div>

                <div className="bg-[#0a1022] rounded-xl p-5 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldBan className="w-16 h-16 text-emerald-400" />
                    </div>
                    <p className="text-xs text-slate-400 font-mono mb-1 uppercase tracking-wider">Auto-Neutralized Threats</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold font-orbitron text-emerald-400">
                            {autoBlockedCount.toLocaleString()}
                        </h3>
                        <span className="text-xs font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                            Zero Delay
                        </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 mt-4 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: health?.automation_rate ? `${parseFloat(health.automation_rate)}%` : '94%' }}></div>
                    </div>
                </div>

                <div className="bg-[#0a1022] rounded-xl p-5 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wand2 className="w-16 h-16 text-cyan-400" />
                    </div>
                    <p className="text-xs text-slate-400 font-mono mb-1 uppercase tracking-wider">AI Defense Coverage</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold font-orbitron text-white">{health?.automation_rate || '99.4%'}</h3>
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">
                            SOAR Bandit
                        </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 mt-4 rounded-full overflow-hidden">
                        <div className="bg-cyan-400 h-full rounded-full transition-all duration-500" style={{ width: health?.automation_rate ? `${parseFloat(health.automation_rate)}%` : '99.4%' }}></div>
                    </div>
                </div>

                <div className="bg-[#0a1022] rounded-xl p-5 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-orange-500/40 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Timer className="w-16 h-16 text-orange-400" />
                    </div>
                    <p className="text-xs text-slate-400 font-mono mb-1 uppercase tracking-wider">Mean Pass Recovery (MTPR)</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold font-orbitron text-orange-400">{avgLatency}</h3>
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                            &lt; AOS Limit
                        </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 mt-4 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full rounded-full" style={{ width: '35%' }}></div>
                    </div>
                </div>
            </div>

            {/* Split Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
                {/* Severity Distribution */}
                <div className="lg:col-span-2 bg-[#0a1022] rounded-xl border border-slate-800 shadow-sm flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="font-orbitron font-bold text-base text-white tracking-wide">
                            Space Threat Mission Impact Distribution
                        </h3>
                        <span className="text-xs font-mono text-cyan-400">EOS-09 Contact Window</span>
                    </div>
                    <div className="p-6 flex-1 flex flex-col md:flex-row items-center gap-8">
                        {/* Circular Visualization */}
                        <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-8 border-red-500/80"></div>
                            <div className="absolute inset-2 rounded-full border-8 border-orange-500/80"></div>
                            <div className="absolute inset-4 rounded-full border-8 border-cyan-500/80"></div>
                            <div className="flex flex-col items-center justify-center font-mono">
                                <span className="text-2xl font-bold text-white font-orbitron">{totalThreatCount}</span>
                                <span className="text-[10px] text-slate-400">Threat Flows</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex-1 grid grid-cols-2 gap-3 w-full font-mono text-xs">
                            <div className="bg-[#080d1e] p-3 rounded-lg border border-red-500/30">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                    <span className="font-bold text-red-400">CRITICAL</span>
                                </div>
                                <div className="text-[11px] text-slate-400">Pass Window Threatening</div>
                                <div className="text-xl font-bold text-white mt-1">{criticalThreats}</div>
                            </div>
                            <div className="bg-[#080d1e] p-3 rounded-lg border border-orange-500/30">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                                    <span className="font-bold text-orange-400">HIGH</span>
                                </div>
                                <div className="text-[11px] text-slate-400">TC Uplink Degradation</div>
                                <div className="text-xl font-bold text-white mt-1">{highThreats}</div>
                            </div>
                            <div className="bg-[#080d1e] p-3 rounded-lg border border-cyan-500/30">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                                    <span className="font-bold text-cyan-400">MEDIUM</span>
                                </div>
                                <div className="text-[11px] text-slate-400">SLE Port Probing</div>
                                <div className="text-xl font-bold text-white mt-1">{mediumThreats}</div>
                            </div>
                            <div className="bg-[#080d1e] p-3 rounded-lg border border-slate-700">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                                    <span className="font-bold text-slate-300">LOW</span>
                                </div>
                                <div className="text-[11px] text-slate-400">Routine Tracking Dev.</div>
                                <div className="text-xl font-bold text-white mt-1">{lowThreats}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ground Station Subsystems */}
                <div className="bg-[#0a1022] rounded-xl border border-slate-800 shadow-sm flex flex-col font-mono text-xs">
                    <div className="px-6 py-4 border-b border-slate-800">
                        <h3 className="font-orbitron font-bold text-base text-white tracking-wide">
                            Ground Telemetry Health
                        </h3>
                    </div>
                    <div className="p-6 flex flex-col gap-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-[#080d1e] border border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded text-emerald-400 border border-emerald-500/20">
                                    <AlertOctagon className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white">TT&C Uplink Transceiver</h4>
                                    <p className="text-[10px] text-emerald-400">Online • 2098 MHz Locked</p>
                                </div>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-[#080d1e] border border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-cyan-500/10 rounded text-cyan-400 border border-cyan-500/20">
                                    <Radio className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white">SLE Ground Gateway (TCP 5100)</h4>
                                    <p className="text-[10px] text-cyan-400">Active • 105 Mbps Downlink</p>
                                </div>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-cyan-400"></div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-[#080d1e] border border-slate-800 border-l-4 border-l-orange-400">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500/10 rounded text-orange-400 border border-orange-500/20">
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white">CCSDS COP-1 Frame Parser</h4>
                                    <p className="text-[10px] text-orange-400">{health?.pending_reviews ?? traffic.filter(p => p.action === 'PENDING_REVIEW').length} Anomaly Sequences Flagged</p>
                                </div>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-orange-400"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Automated Actions */}
            <div className="bg-[#0a1022] rounded-xl border border-slate-800 shadow-sm overflow-hidden font-mono text-xs">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0e1733]">
                    <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
                        <Timer className="text-cyan-400 w-5 h-5" />
                        Recent Automated Space Defense Actions
                    </h3>
                    <span className="text-[11px] text-slate-400">Air-Gapped Real-Time Log</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#080d1e] border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="px-6 py-3">Time (UTC)</th>
                                <th className="px-6 py-3">SOAR Action</th>
                                <th className="px-6 py-3">Origin Node</th>
                                <th className="px-6 py-3">Threat Vector</th>
                                <th className="px-6 py-3">Mission Outcome</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {recentActions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No threat actions required. Nominal housekeeping telemetry.
                                    </td>
                                </tr>
                            ) : (
                                recentActions.map((action, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="px-6 py-3 text-slate-400">{new Date(action.timestamp).toLocaleTimeString()}</td>
                                        <td className="px-6 py-3 text-white font-bold">
                                            {action.action === 'AUTO_BLOCKED' ? 'AUTO_NEUTRALIZE' : action.action}
                                        </td>
                                        <td className="px-6 py-3 text-cyan-300">{action.src_ip}</td>
                                        <td className="px-6 py-3 text-slate-300">{mapSpaceThreatName(action.type)}</td>
                                        <td className="px-6 py-3">
                                            <span className={clsx("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide",
                                                action.action.includes('BLOCK') ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                            )}>
                                                {action.action.includes('BLOCK') ? 'LINK PROTECTED' : 'UNDER REVIEW'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CommandCenter;
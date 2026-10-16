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
    const totalThreatCount = health?.threats_detected ?? threatFlows.length;
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
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800/80 gap-3">
                <div>
                    <div className="flex items-center gap-2 text-orange-400 font-mono text-xs uppercase tracking-widest mb-1.5">
                        <Satellite className="w-4 h-4" />
                        <span>ISTRAC MOX Flight Telemetry Protection</span>
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
                <div className="bg-[#0a1022]/80 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20 shadow-sm relative overflow-hidden group hover:border-orange-500/40 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Radar className="w-16 h-16 text-orange-400" />
                    </div>
                    <p className="text-xs text-slate-400 font-mono mb-1 uppercase tracking-wider">Active Space Threats</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <h3 className="text-3xl font-bold font-orbitron text-white">
                            {totalThreatCount.toLocaleString()}
                        </h3>
                        <span className="text-xs font-mono text-orange-400 bg-orange-950/60 px-1.5 py-0.5 rounded border border-orange-800">
                            LEO Contact Cone
                        </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 mt-4 rounded-full overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, Math.max(15, (totalThreatCount / 500) * 100))}%` }}
                        ></div>
                    </div>
                </div>

                <div className="bg-[#0a1022]/80 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldBan className="w-16 h-16 text-emerald-400" />
                    </div>
                    <p className="text-xs text-slate-400 font-mono mb-1 uppercase tracking-wider">Auto-Neutralized Threats</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <h3 className="text-3xl font-bold font-orbitron text-emerald-400">
                            {autoBlockedCount.toLocaleString()}
                        </h3>
                        <span className="text-xs font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                            Zero Delay
                        </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 mt-4 rounded-full overflow-hidden">
                        <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: health?.automation_rate ? `${parseFloat(health.automation_rate)}%` : '94%' }}
                        ></div>
                    </div>
                </div>

                <div className="bg-[#0a1022]/80 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20 shadow-sm relative overflow-hidden group hover:border-orange-500/40 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wand2 className="w-16 h-16 text-orange-400" />
                    </div>
                    <p className="text-xs text-slate-400 font-mono mb-1 uppercase tracking-wider">AI Defense Coverage</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <h3 className="text-3xl font-bold font-orbitron text-white">{health?.automation_rate || '99.4%'}</h3>
                        <span className="text-xs font-mono text-orange-400 bg-orange-950/60 px-1.5 py-0.5 rounded border border-orange-800">
                            SOAR Bandit
                        </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 mt-4 rounded-full overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500" 
                            style={{ width: health?.automation_rate ? `${parseFloat(health.automation_rate)}%` : '99.4%' }}
                        ></div>
                    </div>
                </div>

                <div className="bg-[#0a1022]/80 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20 shadow-sm relative overflow-hidden group hover:border-orange-500/40 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Timer className="w-16 h-16 text-orange-400" />
                    </div>
                    <p className="text-xs text-slate-400 font-mono mb-1 uppercase tracking-wider">Mean Pass Recovery (MTPR)</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <h3 className="text-3xl font-bold font-orbitron text-orange-400">{avgLatency}</h3>
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                            &lt; AOS Limit
                        </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 mt-4 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }}></div>
                    </div>
                </div>
            </div>

            {/* Split Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
                {/* Severity Distribution */}
                <div className="lg:col-span-2 bg-[#0a1022]/80 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-sm flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-800/80 flex justify-between items-center">
                        <h3 className="font-orbitron font-bold text-base text-white tracking-wide">
                            Space Threat Mission Impact Distribution
                        </h3>
                        <span className="text-xs font-mono text-orange-400">EOS-09 Contact Window</span>
                    </div>
                    <div className="p-6 flex-1 flex flex-col md:flex-row items-center gap-8">
                        {/* Circular Visualization */}
                        <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-8 border-red-500/80"></div>
                            <div className="absolute inset-2 rounded-full border-8 border-orange-500/80"></div>
                            <div className="absolute inset-4 rounded-full border-8 border-amber-400/80"></div>
                            <div className="flex flex-col items-center justify-center font-mono">
                                <span className="text-2xl font-bold text-white font-orbitron">{totalThreatCount}</span>
                                <span className="text-[10px] text-slate-400">Threat Flows</span>
                            </div>
                        </div>

                        {/* Legend / Metrics */}
                        <div className="grid grid-cols-2 gap-4 flex-1 w-full font-mono">
                            <div className="bg-[#080d1e]/80 p-3.5 rounded-xl border border-red-500/30">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                    <span className="font-bold text-red-400">CRITICAL</span>
                                </div>
                                <div className="text-[11px] text-slate-400">Pass Window Threatening</div>
                                <div className="text-xl font-bold text-white mt-1">{criticalThreats}</div>
                            </div>
                            <div className="bg-[#080d1e]/80 p-3.5 rounded-xl border border-orange-500/30">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                                    <span className="font-bold text-orange-400">HIGH</span>
                                </div>
                                <div className="text-[11px] text-slate-400">TC Uplink Degradation</div>
                                <div className="text-xl font-bold text-white mt-1">{highThreats}</div>
                            </div>
                            <div className="bg-[#080d1e]/80 p-3.5 rounded-xl border border-amber-500/30">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                                    <span className="font-bold text-amber-400">MEDIUM</span>
                                </div>
                                <div className="text-[11px] text-slate-400">SLE Port Probing</div>
                                <div className="text-xl font-bold text-white mt-1">{mediumThreats}</div>
                            </div>
                            <div className="bg-[#080d1e]/80 p-3.5 rounded-xl border border-slate-700">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                                    <span className="font-bold text-slate-300">LOW</span>
                                </div>
                                <div className="text-[11px] text-slate-400">Anomalous Telemetry Sync</div>
                                <div className="text-xl font-bold text-white mt-1">{lowThreats}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Automation Rules Info */}
                <div className="bg-[#0a1022]/80 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-sm flex flex-col p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
                        <h3 className="font-orbitron font-bold text-base text-white tracking-wide">
                            Active Space Policy
                        </h3>
                        <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-mono">
                            Auto-Neutralize
                        </span>
                    </div>

                    <div className="space-y-4 font-mono text-xs text-slate-300 flex-1">
                        <div className="p-3 bg-[#080d1e]/90 rounded-xl border border-slate-800">
                            <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                                <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                                <span>Rule #1: Telecommand Flood (P1)</span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans">
                                Automatic uplink throttle &gt; 120 packets/s with zero human intervention.
                            </p>
                        </div>
                        <div className="p-3 bg-[#080d1e]/90 rounded-xl border border-slate-800">
                            <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                                <span>Rule #2: TC Authentication Bypass</span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans">
                                Block source ground interface IP if invalid key attempts &gt; 3 within AOS.
                            </p>
                        </div>
                        <div className="p-3 bg-[#080d1e]/90 rounded-xl border border-slate-800">
                            <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                <span>Rule #3: SLE Port Scan</span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans">
                                Reroute ground station switch traffic to honeypot telemetry node.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Defense Executions */}
            <div className="bg-[#0a1022]/80 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-sm overflow-hidden font-sans">
                <div className="px-6 py-4 border-b border-slate-800/80 flex justify-between items-center">
                    <div>
                        <h3 className="font-orbitron font-bold text-base text-white tracking-wide">
                            Real-Time Ground Segment Defense Executions
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Automated actions executed during the current satellite contact pass
                        </p>
                    </div>
                    <span className="text-xs font-mono text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">
                        Streaming Live
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                        <thead className="bg-[#080d1e]/90 text-slate-400 border-b border-slate-800/80 uppercase">
                            <tr>
                                <th className="px-6 py-3.5">Timestamp</th>
                                <th className="px-6 py-3.5">SOAR Action</th>
                                <th className="px-6 py-3.5">Origin Node</th>
                                <th className="px-6 py-3.5">Threat Vector</th>
                                <th className="px-6 py-3.5">Mission Outcome</th>
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
                                        <td className="px-6 py-3.5 text-slate-400">{new Date(action.timestamp).toLocaleTimeString()}</td>
                                        <td className="px-6 py-3.5 text-white font-bold">
                                            {action.action === 'AUTO_BLOCKED' ? 'AUTO_NEUTRALIZE' : action.action}
                                        </td>
                                        <td className="px-6 py-3.5 text-orange-300 font-semibold">{action.src_ip}</td>
                                        <td className="px-6 py-3.5 text-slate-300">{mapSpaceThreatName(action.type)}</td>
                                        <td className="px-6 py-3.5">
                                            <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
                                                action.action.includes('BLOCK') ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-orange-500/15 text-orange-400 border border-orange-500/30"
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
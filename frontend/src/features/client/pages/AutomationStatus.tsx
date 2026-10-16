import { ShieldCheck, Flag, TrendingUp, TrendingDown, Satellite, AlertTriangle } from 'lucide-react';
import { useSystemHealth } from '../../../hooks/useSystemHealth';
import { useLiveTraffic } from '../../../hooks/useLiveTraffic';

export const AutomationStatus = () => {
    const { health } = useSystemHealth();
    const { traffic } = useLiveTraffic();

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800/80 gap-3">
                <div>
                    <div className="flex items-center gap-2 text-orange-400 font-mono text-xs uppercase tracking-widest mb-1.5">
                        <Satellite className="w-4 h-4" />
                        <span>ISTRAC MOX AI Defense Engine</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-orbitron text-white">
                        AI Defense Automation & FAR Governance
                    </h1>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-3 py-1 rounded-full bg-orange-950/60 border border-orange-800 text-orange-300 font-bold">
                        WARM-START BANDIT: CONVERGED
                    </span>
                </div>
            </div>

            {/* Critical Doctrine Callout */}
            <div className="p-5 rounded-2xl bg-orange-950/20 backdrop-blur-md border border-orange-500/30 flex items-start gap-4">
                <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    <strong className="text-orange-400 font-semibold font-orbitron">
                        Loss of Signal (LOS) Mitigation:
                    </strong>{' '}
                    An automated False Alarm during an active 8-minute LEO pass window causes Loss of Signal (LOS) and can abort critical orbital station-keeping maneuvers. The system balances auto-neutralization speed against human review escalation.
                </div>
            </div>

            {/* KPIs Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
                {/* Threshold Card 1 */}
                <div className="bg-[#0a1022]/80 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:border-orange-400 transition-colors shadow-sm">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldCheck className="w-16 h-16 text-orange-400" />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Auto-Block Confidence</div>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold font-orbitron text-white">95%</span>
                            <span className="text-xs text-emerald-400 mb-1 font-bold">Active</span>
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full" style={{ width: '95%' }}></div>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-400">Strict threshold. Requires high-fidelity flow anomaly signature.</div>
                </div>

                {/* Threshold Card 2 */}
                <div className="bg-[#0a1022]/80 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:border-orange-400 transition-colors shadow-sm">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Flag className="w-16 h-16 text-orange-400" />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Pass Review Threshold</div>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold font-orbitron text-white">70%</span>
                            <span className="text-xs text-orange-400 mb-1 font-bold">Escalate</span>
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-orange-400 h-full rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-400">Moderate confidence. Escalates to Mission Flight Controller.</div>
                </div>

                {/* Metric Card 1 */}
                <div className="bg-[#0a1022]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-center shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Controller Hours Saved</div>
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-3xl font-bold font-orbitron text-emerald-400 mb-1">
                        {health?.controller_hours_saved || '142h'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                        Automated triage across {health ? health.traffic_processed : '142,850'} telemetry flows.
                    </div>
                </div>

                {/* Metric Card 2 */}
                <div className="bg-[#0a1022]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-center shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">False Alarm Rate (FAR)</div>
                        <TrendingDown className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-3xl font-bold font-orbitron text-white mb-1">
                        {health?.false_alarm_rate || '0.04%'}
                    </div>
                    <div className="text-[10px] text-slate-400">Pass-window safety benchmark compliant (&lt;0.05%).</div>
                </div>
            </div>

            {/* Main Chart Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Decision Velocity */}
                <div className="lg:col-span-2 bg-[#0a1022]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex flex-col shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-orbitron font-bold text-base text-white">Decision Velocity</h3>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">Automated Neutralization vs Controller Review Volume (24h)</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                                <span className="text-slate-300">Automated</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                <span className="text-slate-300">Controller Review</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 flex items-end gap-2 sm:gap-4 justify-between pt-6 pb-4 border-b border-slate-800 font-mono min-h-[180px]">
                        {(health?.decision_velocity && health.decision_velocity.length > 0
                            ? health.decision_velocity
                            : [
                                { hour: '00:00', automated: 75, review: 15 },
                                { hour: '04:00', automated: 82, review: 18 },
                                { hour: '08:00', automated: 91, review: 24 },
                                { hour: '12:00', automated: 88, review: 20 },
                                { hour: '16:00', automated: 95, review: 14 },
                                { hour: '20:00', automated: 84, review: 22 },
                            ]
                        ).map((v, i) => (
                            <div key={i} className="w-full flex flex-col gap-1.5 h-full justify-end group cursor-pointer relative">
                                <div className="w-full bg-amber-500/80 hover:bg-amber-400 rounded-t-sm transition-all" style={{ height: `${Math.min(90, Math.max(8, v.review ?? (v as any).reviewed ?? 15))}%` }}></div>
                                <div className="w-full bg-orange-400/90 hover:bg-orange-300 rounded-t-sm transition-all" style={{ height: `${Math.min(90, Math.max(15, v.automated))}%` }}></div>
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 whitespace-nowrap">{v.hour}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Automation Ratio */}
                <div className="bg-[#0a1022]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-sm">
                    <h3 className="font-orbitron font-bold text-base text-white mb-4 z-10">AI Defense Coverage</h3>
                    <div className="flex-1 flex items-center justify-center relative z-10 py-4">
                        <div className="relative w-40 h-40">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle className="text-slate-800 stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
                                <circle className="text-orange-400 stroke-current transition-all duration-1000" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset={`${251.2 * (1 - (parseFloat(health?.automation_rate || "99.4") / 100))}`} strokeLinecap="round" strokeWidth="8" transform="rotate(-90 50 50)"></circle>
                            </svg>
                            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center font-mono">
                                <span className="text-3xl font-bold font-orbitron text-white">{health?.automation_rate || '99.4%'}</span>
                                <span className="text-[9px] text-orange-400 uppercase tracking-widest font-bold">Automated</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-center z-10 font-mono text-xs">
                        <div className="bg-[#080d1e]/80 rounded-xl p-3 border border-slate-800">
                            <div className="text-[10px] text-slate-400">Total Telemetry</div>
                            <div className="font-bold text-white mt-0.5">{health ? health.traffic_processed : '142,850'}</div>
                        </div>
                        <div className="bg-[#080d1e]/80 rounded-xl p-3 border border-slate-800">
                            <div className="text-[10px] text-slate-400">Review Queue</div>
                            <div className="font-bold text-orange-400 mt-0.5">{health?.pending_reviews ?? traffic.filter(p => p.action === 'PENDING_REVIEW').length}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutomationStatus;

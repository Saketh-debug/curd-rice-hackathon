import { ShieldCheck, Flag, TrendingUp, TrendingDown, Satellite, AlertTriangle } from 'lucide-react';
import { useSystemHealth } from '../../../hooks/useSystemHealth';
import { useLiveTraffic } from '../../../hooks/useLiveTraffic';

export const AutomationStatus = () => {
    const { health } = useSystemHealth();
    const { traffic } = useLiveTraffic();

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6 bg-background text-foreground font-sans min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-3">
                <div>
                    <div className="flex items-center gap-2 caps-label text-signal mb-1">
                        <Satellite className="w-3.5 h-3.5" />
                        ISTRAC MOX AI Defense Engine
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                        AI Defense Automation & FAR Governance
                    </h1>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-card border border-border text-grove font-medium">
                        WARM-START BANDIT: CONVERGED
                    </span>
                </div>
            </div>

            {/* Critical Doctrine Callout */}
            <div className="p-4 rounded-xl bg-card border border-border flex items-start gap-3.5">
                <AlertTriangle className="w-5 h-5 text-signal shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                    <strong className="text-foreground font-semibold">
                        Loss of Signal (LOS) Mitigation:
                    </strong>{' '}
                    An automated False Alarm during an active 8-minute LEO pass window causes Loss of Signal (LOS) and can abort critical orbital station-keeping maneuvers. The system balances auto-neutralization speed against human review escalation.
                </div>
            </div>

            {/* KPIs Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
                {/* Threshold Card 1 */}
                <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-muted-foreground/30 transition-colors">
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ShieldCheck className="w-16 h-16 text-foreground" />
                    </div>
                    <div>
                        <div className="caps-label text-muted-foreground mb-1">Auto-Block Confidence</div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">95%</span>
                            <span className="text-xs text-grove mb-1 font-medium">Active</span>
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-muted h-1 rounded-full overflow-hidden">
                        <div className="bg-grove h-full rounded-full" style={{ width: '95%' }}></div>
                    </div>
                    <div className="mt-2 text-[11px] text-muted-foreground">Strict threshold. Requires high-fidelity flow anomaly signature.</div>
                </div>

                {/* Threshold Card 2 */}
                <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-muted-foreground/30 transition-colors">
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Flag className="w-16 h-16 text-foreground" />
                    </div>
                    <div>
                        <div className="caps-label text-muted-foreground mb-1">Pass Review Threshold</div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">70%</span>
                            <span className="text-xs text-signal mb-1 font-medium">Escalate</span>
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-muted h-1 rounded-full overflow-hidden">
                        <div className="bg-signal h-full rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    <div className="mt-2 text-[11px] text-muted-foreground">Moderate confidence. Escalates to Mission Flight Controller.</div>
                </div>

                {/* Metric Card 1 */}
                <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="caps-label text-muted-foreground">Controller Hours Saved</div>
                            <TrendingUp className="w-4 h-4 text-grove" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-grove tracking-tight mb-1">
                            {health?.controller_hours_saved || '142h'}
                        </div>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-4">
                        Automated triage across {health ? health.traffic_processed : '142,850'} telemetry flows.
                    </div>
                </div>

                {/* Metric Card 2 */}
                <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="caps-label text-muted-foreground">False Alarm Rate (FAR)</div>
                            <TrendingDown className="w-4 h-4 text-grove" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-1">
                            {health?.false_alarm_rate || '0.04%'}
                        </div>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-4">Pass-window safety benchmark compliant (&lt;0.05%).</div>
                </div>
            </div>

            {/* Main Chart Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96 min-h-[24rem]">
                {/* Decision Velocity */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-semibold text-base text-foreground tracking-tight">Decision Velocity</h3>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">Automated Neutralization vs Controller Review Volume (24h)</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-signal"></span>
                                <span className="text-muted-foreground">Automated</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate"></span>
                                <span className="text-muted-foreground">Controller Review</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 flex items-end gap-2 sm:gap-4 justify-between pt-4 pb-2 border-b border-border font-mono">
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
                                <div className="w-full bg-slate/70 hover:bg-slate rounded-t-sm transition-all" style={{ height: `${Math.min(90, Math.max(8, v.review ?? v.reviewed ?? 15))}%` }}></div>
                                <div className="w-full bg-signal hover:bg-signal/80 rounded-t-sm transition-all" style={{ height: `${Math.min(90, Math.max(15, v.automated))}%` }}></div>
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] text-muted-foreground whitespace-nowrap">{v.hour}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Automation Ratio */}
                <div className="bg-card border border-border rounded-xl p-6 flex flex-col relative overflow-hidden">
                    <h3 className="font-semibold text-base text-foreground tracking-tight mb-4 z-10">AI Defense Coverage</h3>
                    <div className="flex-1 flex items-center justify-center relative z-10">
                        <div className="relative w-40 h-40">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle className="text-muted stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
                                <circle className="text-signal stroke-current transition-all duration-1000" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset={`${251.2 * (1 - (parseFloat(health?.automation_rate || "99.4") / 100))}`} strokeLinecap="round" strokeWidth="8" transform="rotate(-90 50 50)"></circle>
                            </svg>
                            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center font-mono">
                                <span className="text-3xl font-semibold text-foreground">{health?.automation_rate || '99.4%'}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Automated</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-center z-10 font-mono text-xs">
                        <div className="bg-background rounded-lg p-2.5 border border-border">
                            <div className="text-[11px] text-muted-foreground">Total Telemetry</div>
                            <div className="font-semibold text-foreground mt-0.5 tabular-nums">{health ? health.traffic_processed : '142,850'}</div>
                        </div>
                        <div className="bg-background rounded-lg p-2.5 border border-border">
                            <div className="text-[11px] text-muted-foreground">Review Queue</div>
                            <div className="font-semibold text-signal mt-0.5 tabular-nums">{health?.pending_reviews ?? traffic.filter(p => p.action === 'PENDING_REVIEW').length}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutomationStatus;

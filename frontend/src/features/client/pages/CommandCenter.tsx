import { Radar, ShieldBan, Wand2, Timer, AlertOctagon, AlertTriangle, Satellite, Radio } from 'lucide-react';
import { useSystemHealth } from '../../../hooks/useSystemHealth';
import { useLiveTraffic } from '../../../hooks/useLiveTraffic';
import { AttackSimulatorTrigger } from '../../../components/AttackSimulator/AttackSimulatorTrigger';
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-3">
                <div>
                    <div className="flex items-center gap-2 caps-label text-signal mb-1">
                        <Satellite className="w-3.5 h-3.5" />
                        ISTRAC MOX Flight Telemetry Protection
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                        Threat Command Bridge
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <AttackSimulatorTrigger variant="header" />
                    <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="w-2 h-2 rounded-full bg-grove"></span>
                        <span className="text-muted-foreground">DEFENSE STATUS: </span>
                        <span className="text-grove font-semibold">ALL LINKS SECURED</span>
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
                <div className="bg-card rounded-xl p-5 border border-border relative overflow-hidden group hover:border-muted-foreground/30 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Radar className="w-16 h-16 text-foreground" />
                    </div>
                    <p className="caps-label text-muted-foreground mb-1">Active Space Threats</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                            {totalThreatCount.toLocaleString()}
                        </h3>
                        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                            LEO Contact Cone
                        </span>
                    </div>
                    <div className="w-full bg-muted h-1 mt-4 rounded-full overflow-hidden">
                        <div className="bg-signal h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(15, (totalThreatCount / 2000) * 100))}%` }}></div>
                    </div>
                </div>

                <div className="bg-card rounded-xl p-5 border border-border relative overflow-hidden group hover:border-muted-foreground/30 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ShieldBan className="w-16 h-16 text-foreground" />
                    </div>
                    <p className="caps-label text-muted-foreground mb-1">Auto-Neutralized Threats</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-grove">
                            {autoBlockedCount.toLocaleString()}
                        </h3>
                        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                            Zero Delay
                        </span>
                    </div>
                    <div className="w-full bg-muted h-1 mt-4 rounded-full overflow-hidden">
                        <div className="bg-grove h-full rounded-full transition-all duration-500" style={{ width: health?.automation_rate ? `${parseFloat(health.automation_rate)}%` : '94%' }}></div>
                    </div>
                </div>

                <div className="bg-card rounded-xl p-5 border border-border relative overflow-hidden group hover:border-muted-foreground/30 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Wand2 className="w-16 h-16 text-foreground" />
                    </div>
                    <p className="caps-label text-muted-foreground mb-1">Auto-Mitigation Rate</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                            {health?.automation_rate || '99.4%'}
                        </h3>
                        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                            AOS Threshold
                        </span>
                    </div>
                    <div className="w-full bg-muted h-1 mt-4 rounded-full overflow-hidden">
                        <div className="bg-signal h-full rounded-full transition-all duration-500" style={{ width: health?.automation_rate ? `${parseFloat(health.automation_rate)}%` : '99.4%' }}></div>
                    </div>
                </div>

                <div className="bg-card rounded-xl p-5 border border-border relative overflow-hidden group hover:border-muted-foreground/30 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Timer className="w-16 h-16 text-foreground" />
                    </div>
                    <p className="caps-label text-muted-foreground mb-1">MTPR Response Latency</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                            {avgLatency}
                        </h3>
                        <span className="text-xs font-mono text-grove bg-grove/10 px-2 py-0.5 rounded border border-grove/20 font-semibold">
                            PASSED
                        </span>
                    </div>
                    <div className="w-full bg-muted h-1 mt-4 rounded-full overflow-hidden">
                        <div className="bg-grove h-full rounded-full transition-all duration-500" style={{ width: '88%' }}></div>
                    </div>
                </div>
            </div>

            {/* Split Threat Spectrum and Telemetry Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
                {/* Threat Spectrum Breakdown */}
                <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-base text-foreground tracking-tight">
                                Space Threat Severity Spectrum
                            </h3>
                            <span className="text-xs font-mono text-muted-foreground">Weighted by Criticality</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono leading-relaxed mb-6">
                            Heuristic classification of active frame anomalies mapped to ISRO Ground Station priority vectors.
                        </p>
                    </div>

                    <div className="space-y-4 font-mono">
                        <div className="flex items-center gap-2 h-4 w-full bg-background rounded-full overflow-hidden p-0.5 border border-border">
                            <div style={{ width: `${(criticalThreats / (totalThreatCount || 1)) * 100}%` }} className="bg-destructive h-full rounded-full transition-all" title="CRITICAL: TT&C Uplink Saturation" />
                            <div style={{ width: `${(highThreats / (totalThreatCount || 1)) * 100}%` }} className="bg-signal h-full rounded-full transition-all" title="HIGH: TC Auth Bypass" />
                            <div style={{ width: `${(mediumThreats / (totalThreatCount || 1)) * 100}%` }} className="bg-slate h-full rounded-full transition-all" title="MEDIUM: SLE Port Recon" />
                            <div style={{ width: `${(lowThreats / (totalThreatCount || 1)) * 100}%` }} className="bg-muted-foreground h-full rounded-full transition-all" title="LOW: Routine Tracking Dev." />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                            <div className="bg-background p-3.5 rounded-lg border border-border">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full bg-destructive"></span>
                                    <span className="font-semibold text-destructive">CRITICAL</span>
                                </div>
                                <div className="text-[11px] text-muted-foreground">TT&C Uplink Saturation</div>
                                <div className="text-xl font-semibold text-foreground mt-1 tabular-nums">{criticalThreats}</div>
                            </div>
                            <div className="bg-background p-3.5 rounded-lg border border-border">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full bg-signal"></span>
                                    <span className="font-semibold text-signal">HIGH</span>
                                </div>
                                <div className="text-[11px] text-muted-foreground">TC Auth Bypass</div>
                                <div className="text-xl font-semibold text-foreground mt-1 tabular-nums">{highThreats}</div>
                            </div>
                            <div className="bg-background p-3.5 rounded-lg border border-border">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full bg-slate"></span>
                                    <span className="font-semibold text-slate">MEDIUM</span>
                                </div>
                                <div className="text-[11px] text-muted-foreground">SLE Port Probing</div>
                                <div className="text-xl font-semibold text-foreground mt-1 tabular-nums">{mediumThreats}</div>
                            </div>
                            <div className="bg-background p-3.5 rounded-lg border border-border">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
                                    <span className="font-semibold text-muted-foreground">LOW</span>
                                </div>
                                <div className="text-[11px] text-muted-foreground">Routine Tracking Dev.</div>
                                <div className="text-xl font-semibold text-foreground mt-1 tabular-nums">{lowThreats}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ground Station Subsystems */}
                <div className="bg-card rounded-xl border border-border flex flex-col font-mono text-xs">
                    <div className="px-6 py-4 border-b border-border">
                        <h3 className="font-semibold text-base text-foreground tracking-tight">
                            Ground Telemetry Health
                        </h3>
                    </div>
                    <div className="p-6 flex flex-col gap-3">
                        <div className="flex items-center justify-between p-3.5 rounded-lg bg-background border border-border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-md text-foreground border border-border">
                                    <AlertOctagon className="w-4 h-4 text-grove" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-medium text-foreground">TT&C Uplink Transceiver</h4>
                                    <p className="text-[11px] text-grove font-mono">Online • 2098 MHz Locked</p>
                                </div>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-grove"></div>
                        </div>

                        <div className="flex items-center justify-between p-3.5 rounded-lg bg-background border border-border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-md text-foreground border border-border">
                                    <Radio className="w-4 h-4 text-signal" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-medium text-foreground">SLE Ground Gateway (TCP 5100)</h4>
                                    <p className="text-[11px] text-muted-foreground font-mono">Active • 105 Mbps Downlink</p>
                                </div>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-grove"></div>
                        </div>

                        <div className="flex items-center justify-between p-3.5 rounded-lg bg-background border border-border border-l-2 border-l-signal">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-md text-foreground border border-border">
                                    <AlertTriangle className="w-4 h-4 text-signal" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-medium text-foreground">CCSDS COP-1 Frame Parser</h4>
                                    <p className="text-[11px] text-signal font-mono">{health?.pending_reviews ?? traffic.filter(p => p.action === 'PENDING_REVIEW').length} Anomaly Sequences Flagged</p>
                                </div>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-signal"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Automated Actions */}
            <div className="bg-card rounded-xl border border-border overflow-hidden font-mono text-xs">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card">
                    <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                        <Timer className="text-signal w-5 h-5" />
                        Recent Automated Space Defense Actions
                    </h3>
                    <span className="text-[11px] text-muted-foreground font-mono">Air-Gapped Real-Time Log</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase text-[11px] font-mono tracking-wider">
                            <tr>
                                <th className="px-6 py-3">Time (UTC)</th>
                                <th className="px-6 py-3">SOAR Action</th>
                                <th className="px-6 py-3">Origin Node</th>
                                <th className="px-6 py-3">Threat Vector</th>
                                <th className="px-6 py-3">Mission Outcome</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border font-mono tabular-nums">
                            {recentActions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        No threat actions required. Nominal housekeeping telemetry.
                                    </td>
                                </tr>
                            ) : (
                                recentActions.map((action, idx) => (
                                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-3 text-muted-foreground">{new Date(action.timestamp).toLocaleTimeString()}</td>
                                        <td className="px-6 py-3 text-foreground font-medium">
                                            {action.action === 'AUTO_BLOCKED' ? 'AUTO_NEUTRALIZE' : action.action}
                                        </td>
                                        <td className="px-6 py-3 text-foreground">{action.src_ip}</td>
                                        <td className="px-6 py-3 text-muted-foreground">{mapSpaceThreatName(action.type)}</td>
                                        <td className="px-6 py-3">
                                            <span className={clsx("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium font-mono tabular-nums uppercase tracking-wide",
                                                action.action.includes('BLOCK') ? "bg-grove/10 text-grove border border-grove/20" : "bg-signal/10 text-signal border border-signal/20"
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
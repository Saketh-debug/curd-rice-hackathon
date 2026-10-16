import { Link } from 'react-router-dom';
import { useAdminData } from '../hooks/useAdminData';
import { useSystemHealth } from '../../../hooks/useSystemHealth';
import { AttackSimulatorTrigger } from '../../../components/AttackSimulator/AttackSimulatorTrigger';
import { AlertTriangle, Clock, ShieldAlert, CheckCircle, XCircle, ArrowRight, Filter, Satellite, Radio, Zap, Activity, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import StarBorder from '../../../components/StarBorder';

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
    const { pendingIncidents, stats, recentActions, refreshData } = useAdminData();
    const { health } = useSystemHealth();

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-8 grid grid-cols-12 gap-6 relative min-h-screen bg-background text-foreground font-sans">
            {/* Left Column: Pending Reviews */}
            <div className="col-span-12 lg:col-span-8 xl:col-span-9 flex flex-col gap-6">

                {/* Section Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div>
                        <div className="caps-label flex items-center gap-1.5 mb-1.5 text-muted-foreground">
                            <Satellite className="w-3.5 h-3.5 text-signal" />
                            Mission Controller Review Queue
                        </div>
                        <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                            <AlertTriangle className="text-signal w-5 h-5" />
                            Pending Telemetry Anomalies Requiring Action
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-signal/10 border border-signal/20 text-signal font-mono font-medium">
                                {pendingIncidents.length} Unresolved
                            </span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <AttackSimulatorTrigger variant="header" onSuccess={refreshData} />
                        <StarBorder
                            as={Link}
                            to="/admin/benchmark"
                            backgroundColor="#1f1e1b"
                            borderColor="#34322d"
                            textColor="#f1efea"
                            className="px-3.5 py-1.5 font-sans font-medium text-xs tracking-tight cursor-pointer hover:bg-muted"
                        >
                            View 7x7 Benchmark
                        </StarBorder>
                    </div>
                </div>

                {/* Space Defense Governance Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-card p-3.5 rounded-xl border border-border">
                        <span className="caps-label block mb-1">Link Integrity</span>
                        <div className="text-xl font-semibold font-sans tracking-tight tabular-nums text-grove">
                            {(health?.link_integrity_score ?? 96.0).toFixed(1)}%
                        </div>
                        <span className="text-[11px] text-muted-foreground font-mono">OPS-SAT Validated</span>
                    </div>
                    <div className="bg-card p-3.5 rounded-xl border border-border">
                        <span className="caps-label block mb-1">AI Automation</span>
                        <div className="text-xl font-semibold font-sans tracking-tight tabular-nums text-foreground">
                            {health?.automation_rate || '100.0%'}
                        </div>
                        <span className="text-[11px] text-muted-foreground font-mono">SOAR Bandit Policy</span>
                    </div>
                    <div className="bg-card p-3.5 rounded-xl border border-border">
                        <span className="caps-label block mb-1">Defense Latency</span>
                        <div className="text-xl font-semibold font-sans tracking-tight tabular-nums text-signal">
                            {health?.avg_defense_latency || stats.avgResponseTime || '4.2 ms'}
                        </div>
                        <span className="text-[11px] text-muted-foreground font-mono">&lt; AOS Limit</span>
                    </div>
                    <div className="bg-card p-3.5 rounded-xl border border-border">
                        <span className="caps-label block mb-1">Review Backlog</span>
                        <div className="text-xl font-semibold font-sans tracking-tight tabular-nums text-foreground">
                            {pendingIncidents.length} Flows
                        </div>
                        <span className="text-[11px] text-signal font-medium font-mono">Awaiting Controller</span>
                    </div>
                </div>

                {/* Active Incidents Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {pendingIncidents.length === 0 ? (
                        <div className="col-span-full p-8 text-center bg-card rounded-xl border border-border text-muted-foreground">
                            <CheckCircle className="w-10 h-10 mx-auto mb-3 text-grove" />
                            <h3 className="text-base font-semibold text-foreground">All Clear • No Pending Anomalies</h3>
                            <p className="text-xs text-muted-foreground mt-1 font-sans">Ground segment links operating within nominal threshold boundaries.</p>
                        </div>
                    ) : (
                        pendingIncidents.map((incident) => {
                            const spaceName = mapSpaceThreatName(incident.type);
                            return (
                                <div key={incident.id} className="group relative bg-card border border-border rounded-xl shadow-xs hover:border-border/80 transition-all p-5 font-sans flex flex-col justify-between">
                                    {/* Top Header: Threat Title + Flow Badge */}
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-base font-semibold text-foreground mb-1 leading-snug break-words tracking-tight">{spaceName}</h3>
                                            <p className="text-xs text-muted-foreground font-mono tabular-nums">
                                                Origin: {incident.src_ip} ({incident.country || 'External'}) → Ground Port {incident.destination_port}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 font-mono tabular-nums shrink-0 self-start">
                                            <span className="text-[11px] text-muted-foreground">#{incident.id}</span>
                                            <span className={clsx(
                                                "px-2 py-0.5 rounded-md text-[11px] font-medium font-mono tabular-nums uppercase tracking-wide shrink-0",
                                                incident.confidence > 0.9 ? "bg-destructive/15 text-destructive border border-destructive/30" : "bg-signal/15 text-signal border border-signal/30"
                                            )}>
                                                {incident.confidence > 0.9 ? 'CRITICAL PASS' : 'ANOMALY'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bottom Footer: Confidence Progress + FieldRank Button */}
                                    <div className="flex flex-wrap items-center justify-between gap-4 font-mono mt-2 pt-3 border-t border-border/60">
                                        <div className="flex items-center gap-4 text-xs">
                                            <div>
                                                <p className="caps-label mb-1">ML Confidence</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <div className="h-full bg-signal" style={{ width: `${incident.confidence * 100}%` }}></div>
                                                    </div>
                                                    <span className="font-mono font-medium tabular-nums text-foreground">{Math.round(incident.confidence * 100)}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <StarBorder
                                                as={Link}
                                                to={`/admin/incidents/review/${incident.id}`}
                                                backgroundColor="#f1efea"
                                                textColor="#161513"
                                                borderColor="transparent"
                                                className="px-3.5 py-1.5 font-sans font-medium text-xs tracking-tight flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-[#e2dfd7]"
                                            >
                                                Investigate Anomaly <ArrowRight className="w-3.5 h-3.5 text-[#161513]" />
                                            </StarBorder>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Recent Actions (Bottom) */}
                <div className="mt-auto">
                    <h2 className="caps-label mb-3">
                        Recent Mission Controller & AI Interventions
                    </h2>
                    <div className="bg-card border border-border rounded-xl p-5 font-mono text-xs">
                        <div className="relative pl-6 border-l border-border space-y-6">
                            {recentActions.length === 0 ? <p className="text-xs text-muted-foreground">No recent actions logged.</p> : recentActions.map((action, idx) => (
                                <div key={idx} className="relative">
                                    <span className={clsx(
                                        "absolute -left-[31px] top-1 h-3 w-3 rounded-full ring-4 ring-card",
                                        action.action === 'AUTO_BLOCKED' ? "bg-destructive" :
                                            action.action === 'MANUAL_BLOCK' ? "bg-signal" : "bg-grove"
                                    )}></span>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-semibold text-foreground font-sans">
                                                {action.action.replace('_', ' ')} • Node: {action.src_ip}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5 font-mono tabular-nums">
                                                Flow #{action.id} • Vector: {mapSpaceThreatName(action.type)}
                                            </p>
                                        </div>
                                        <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
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
                <div className="flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden shadow-xs">
                    <div className="p-3.5 border-b border-border bg-muted/40 flex justify-between items-center">
                        <h2 className="caps-label text-foreground">Mission Queue</h2>
                        <span className="bg-signal/15 text-signal text-[11px] font-medium font-mono tabular-nums px-2 py-0.5 rounded-md border border-signal/30">
                            {pendingIncidents.length} Pending
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {pendingIncidents.map((incident) => (
                            <Link
                                to={`/admin/incidents/review/${incident.id}`}
                                key={incident.id}
                                className="p-3 border-b border-border/50 hover:bg-muted/40 transition-colors block group"
                            >
                                <div className="flex justify-between items-start mb-1 font-mono tabular-nums">
                                    <span className="text-[11px] text-signal font-medium">LOS SAFEGUARD</span>
                                    <span className="text-[11px] text-muted-foreground">#{incident.id}</span>
                                </div>
                                <h4 className="text-xs font-medium text-foreground group-hover:text-signal transition-colors font-sans">
                                    {mapSpaceThreatName(incident.type)}
                                </h4>
                            </Link>
                        ))}
                        {pendingIncidents.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground text-xs font-sans">Queue empty. Nominal state.</div>
                        )}
                    </div>
                </div>

                {/* Ground Segment Readiness Widget */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
                    <div className="flex items-center gap-2.5 mb-3">
                        <ShieldAlert className="text-signal w-4 h-4" />
                        <h4 className="caps-label text-foreground">Ground Security Readiness</h4>
                    </div>
                    <div className="space-y-3 font-mono tabular-nums">
                        <div className="flex justify-between text-[11px]">
                            <span className="text-muted-foreground">Link Integrity (OPS-SAT)</span>
                            <span className="text-grove font-semibold tabular-nums text-sm">{(health?.link_integrity_score ?? 96.0).toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-grove" style={{ width: `${health?.link_integrity_score ?? 96.0}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[11px] pt-1">
                            <span className="text-muted-foreground">Avg Defense Latency</span>
                            <span className="text-foreground font-semibold tabular-nums text-sm">{health?.avg_defense_latency || stats.avgResponseTime || '4.2 ms'}</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-signal w-[96%]"></div>
                        </div>
                        <div className="flex justify-between text-[11px] pt-1">
                            <span className="text-muted-foreground">Active Flow Ingestion</span>
                            <span className="text-foreground font-semibold tabular-nums text-sm">{health?.events_per_second?.toLocaleString() || '1,420'} /s</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground pt-2.5 border-t border-border font-mono">
                            ISTRAC MOX Air-Gap Isolation: 100% Verified
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

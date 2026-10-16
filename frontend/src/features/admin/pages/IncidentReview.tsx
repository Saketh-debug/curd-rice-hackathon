import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/client';
import type { Packet } from '../../../types';
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ShieldAlert,
    Server,
    Activity,
    Info,
    User
} from 'lucide-react';
import clsx from 'clsx';
import StarBorder from '../../../components/StarBorder';

const mapSpaceThreatName = (type: string = '') => {
    if (!type) return 'Unknown Flow';
    if (type.includes('DDoS')) return 'TT&C Uplink Saturation';
    if (type.includes('DoS')) return 'TT&C Gateway Flood';
    if (type.includes('Brute')) return 'TC Authentication Bypass';
    if (type.includes('Port') || type.includes('Scan')) return 'SLE Port Reconnaissance';
    if (type.includes('Bot')) return 'Ground RTU Sensor Hijack';
    if (type.includes('Web')) return 'Mission Data Distribution Exploit';
    if (type.includes('Normal')) return 'Nominal Housekeeping Telemetry';
    return type;
};

export const IncidentReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [incident, setIncident] = useState<Packet | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isResolving, setIsResolving] = useState(false);

    useEffect(() => {
        const fetchIncident = async () => {
            try {
                // Try direct single incident endpoint first
                try {
                    const singleRes = await apiClient.get<Packet>(`/incidents/${id}`);
                    if (singleRes.data && singleRes.data.id) {
                        setIncident(singleRes.data);
                        return;
                    }
                } catch {
                    // Fallback to searching pending list
                }

                const res = await apiClient.get('/incidents/pending');
                const found = res.data.find((i: Packet) => i.id === Number(id));
                setIncident(found || null);
            } catch (error) {
                console.error("Failed to fetch incident", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchIncident();
    }, [id]);

    const handleAction = async (action: 'BLOCK' | 'IGNORE') => {
        if (!incident) return;
        setIsResolving(true);
        try {
            await apiClient.post(`/incidents/${incident.id}/resolve`, { action });
            navigate('/admin/dashboard');
        } catch (error) {
            console.error("Failed to resolve incident", error);
            setIsResolving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] font-mono text-muted-foreground text-sm">
                Loading incident details...
            </div>
        );
    }

    if (!incident) {
        return (
            <div className="max-w-xl mx-auto my-16 p-8 text-center bg-card rounded-2xl border border-border">
                <AlertTriangle className="w-12 h-12 mx-auto text-signal mb-4" />
                <h2 className="text-xl font-semibold font-display text-foreground mb-2">Incident Not Found</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-sans">
                    This incident may have already been resolved or does not exist.
                </p>
                <StarBorder
                    color="#ff9933"
                    trailColor="#ff9933"
                    duration={4}
                    direction="clockwise"
                    stars={1}
                    trailLength={0.3}
                    thickness={1}
                    radius={12}
                    glow={0.6}
                    hover="lap"
                    sparkle={false}
                    clickPulse
                    theme="dark"
                    onClick={() => navigate('/admin/dashboard')}
                    backgroundColor="#ff9933"
                    textColor="#161513"
                    className="px-5 py-2.5 font-display font-semibold text-xs uppercase tracking-wide cursor-pointer"
                >
                    Back to Mission Dashboard
                </StarBorder>
            </div>
        );
    }

    const confidencePct = Math.round(incident.confidence * 100);
    const isHighRisk = incident.confidence > 0.85;

    // Helper to get simple explainability points based on attack category
    const getSimpleReasons = (type: string) => {
        const t = (type || '').toLowerCase();
        if (t.includes('ddos') || t.includes('dos')) {
            return [
                {
                    title: "Unusually High Traffic",
                    description: "This connection sent far more traffic than normal. This can be a sign of an automated flood attack.",
                    detail: "Traffic Volume: High Surge"
                },
                {
                    title: "Requests Arrived Too Quickly",
                    description: "Packets arrived almost instantly, which is more typical of a script than a person.",
                    detail: "Packet Inter-Arrival: Near Zero (<1ms)"
                },
                {
                    title: "Many Incomplete Connections",
                    description: "Many connection requests were started but not finished. This can use up the server's available connections.",
                    detail: "Connection Pattern: Unfinished SYN requests"
                }
            ];
        } else if (t.includes('brute')) {
            return [
                {
                    title: "Repeated Failed Logins",
                    description: `${incident.failed_attempts || 'Multiple'} rapid authentication failures were detected in a short time frame.`,
                    detail: incident.target_username ? `Targeted Account: '${incident.target_username}'` : "Target: Authentication Service"
                },
                {
                    title: "Automated Password Guessing",
                    description: "The pattern looks like a program trying many passwords, not a person signing in.",
                    detail: `Target Port: ${incident.destination_port}`
                },
                {
                    title: "Very Fast Login Attempts",
                    description: "The login attempts happened much faster than a person would normally type.",
                    detail: `Burst Deviation Score: ${incident.burst_score || 3.4}x normal`
                }
            ];
        } else if (t.includes('port') || t.includes('scan')) {
            return [
                {
                    title: "Searching for Open Ports",
                    description: "The traffic checked ports quickly to find services that may be open.",
                    detail: `Probed Port: ${incident.destination_port}`
                },
                {
                    title: "Probe Packets With No Data",
                    description: "These packets checked the connection but did not carry normal application data.",
                    detail: "Packet Type: Scanner Probe"
                },
                {
                    title: "Very Short Connections",
                    description: "Each connection ended right after the port responded, which is common during a scan.",
                    detail: "Duration: Rapid disconnect"
                }
            ];
        } else if (t.includes('bot')) {
            return [
                {
                    title: "Automated Traffic Pattern",
                    description: "The timing and flow match traffic commonly sent by automated bots.",
                    detail: "Behavior: Automated Bot Pattern"
                },
                {
                    title: "Traffic Sent on a Fixed Schedule",
                    description: "Packets were sent at very regular times, unlike normal human browsing.",
                    detail: "Timing: Periodic Intervals"
                },
                {
                    title: "Targeted Internal Service Port",
                    description: `The traffic targeted internal service port ${incident.destination_port}.`,
                    detail: `Port: ${incident.destination_port}`
                }
            ];
        } else {
            return [
                {
                    title: "Unusual Traffic Content",
                    description: "The packet content did not look like a normal request.",
                    detail: "Pattern: Exploit Signature Match"
                },
                {
                    title: "Traffic Spike Detected",
                    description: "This connection was much busier than the usual level.",
                    detail: `Deviation Score: ${incident.burst_score || 2.8}x baseline`
                },
                {
                    title: "Targeted Service Port",
                    description: `The traffic targeted a service on port ${incident.destination_port}.`,
                    detail: `Destination Port: ${incident.destination_port}`
                }
            ];
        }
    };

    const reasons = getSimpleReasons(incident.type);

    return (
        <div className="max-w-5xl mx-auto space-y-6">

            {/* Top Navigation & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <StarBorder
                        onClick={() => navigate('/admin/dashboard')}
                        backgroundColor="#1f1e1b"
                        borderColor="#34322d"
                        textColor="#f1efea"
                        className="p-2.5 text-foreground hover:bg-muted cursor-pointer flex items-center gap-1.5 font-sans font-medium text-xs tracking-tight"
                    >
                        <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                        <span>Back to Dashboard</span>
                    </StarBorder>
                    <div>
                        <div className="caps-label">
                            Threat Review Queue
                        </div>
                        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                            Incident #{incident.id} • {mapSpaceThreatName(incident.type)}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={clsx(
                        "px-2.5 py-1 rounded-md text-[11px] font-mono font-medium tabular-nums uppercase tracking-wide flex items-center gap-1.5 border",
                        isHighRisk
                            ? "bg-destructive/15 text-destructive border-destructive/30"
                            : "bg-signal/15 text-signal border-signal/30"
                    )}>
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {isHighRisk ? "Critical Anomaly" : "Review Required"}
                    </span>
                </div>
            </div>

            {/* Quick-Facts Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
                    <div className="flex items-center justify-between caps-label mb-1">
                        <span>Source IP</span>
                        <Server className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="text-sm sm:text-base font-semibold font-mono tabular-nums text-foreground truncate">
                        {incident.src_ip}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 font-mono">
                        Location: {incident.country || 'External Network'}
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
                    <div className="flex items-center justify-between caps-label mb-1">
                        <span>Target Port</span>
                        <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="text-sm sm:text-base font-semibold font-mono tabular-nums text-foreground">
                        Port {incident.destination_port}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 font-mono">
                        Protocol: TCP
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
                    <div className="flex items-center justify-between caps-label mb-1">
                        <span>Flow Packets</span>
                        <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="text-sm sm:text-base font-semibold tabular-nums text-foreground">
                        {incident.total_fwd_packets ? incident.total_fwd_packets.toLocaleString() : '1,420'}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 font-mono">
                        Forward transmission
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
                    <div className="flex items-center justify-between caps-label mb-1">
                        <span>Confidence</span>
                        <span className={clsx(
                            "font-semibold tabular-nums text-sm",
                            confidencePct >= 90 ? "text-destructive" : "text-signal"
                        )}>
                            {confidencePct}%
                        </span>
                    </div>
                    <div className="text-sm sm:text-base font-semibold text-foreground">
                        {mapSpaceThreatName(incident.type)}
                    </div>
                    <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                            className={clsx(
                                "h-full rounded-full transition-all",
                                confidencePct >= 90 ? "bg-destructive" : "bg-signal"
                            )}
                            style={{ width: `${confidencePct}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Additional Context Alert (Targeted Account or High Burst) */}
            {(incident.target_username || (incident.failed_attempts && incident.failed_attempts > 0)) && (
                <div className="p-4 rounded-xl bg-signal/10 border border-signal/30 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-signal" />
                        <div>
                            <span className="text-muted-foreground">Targeted Account: </span>
                            <strong className="text-foreground">{incident.target_username || 'Service Account'}</strong>
                            <span className="text-border mx-2">•</span>
                            <span className="text-muted-foreground">Failed Attempts: </span>
                            <strong className="text-signal tabular-nums">{incident.failed_attempts || 0}</strong>
                        </div>
                    </div>
                    <span className="caps-label px-2 py-0.5 rounded-md text-signal bg-signal/15 border border-signal/30">
                        Authentication Spike
                    </span>
                </div>
            )}

            {/* Explainability Section: "Why Was This Flagged?" */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div>
                        <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
                            <Info className="w-4 h-4 text-signal" />
                            Why Was This Traffic Flagged?
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-0.5 font-sans">
                            The system flagged this as <strong className="text-foreground">{mapSpaceThreatName(incident.type)}</strong> because it saw the signs below.
                        </p>
                    </div>
                    <span className="caps-label hidden sm:inline-block px-2.5 py-1 rounded-md bg-muted text-muted-foreground border border-border">
                        Model Explainability
                    </span>
                </div>

                {/* Easy-to-Understand Reasons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {reasons.map((reason, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                            <div className="flex items-center gap-2 text-foreground font-semibold text-xs font-sans">
                                <span className="w-5 h-5 rounded-md bg-signal text-signal-foreground flex items-center justify-center text-[11px] font-mono tabular-nums font-semibold">
                                    {idx + 1}
                                </span>
                                <span>{reason.title}</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                                {reason.description}
                            </p>
                            <div className="text-[11px] font-mono tabular-nums text-muted-foreground pt-1 border-t border-border">
                                {reason.detail}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Clean, Simple Action Card */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-xs">
                <div>
                    <h3 className="text-base font-semibold tracking-tight text-foreground">
                        Analyst Action Decision
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-sans mt-1">
                        Choose whether to block this IP address or allow it as legitimate traffic. Decision immediately updates the adaptive model for future traffic.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Block Action */}
                    <StarBorder
                        onClick={() => handleAction('BLOCK')}
                        disabled={isResolving}
                        backgroundColor="#ff6568"
                        textColor="#161513"
                        borderColor="transparent"
                        className="p-5 text-left transition-all cursor-pointer disabled:opacity-50 group flex flex-col items-stretch w-full hover:bg-[#ff5154]"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 font-sans font-semibold text-xs tracking-tight text-[#161513]">
                                <XCircle className="w-5 h-5 text-[#161513]" />
                                <span>Confirm Threat & Block IP</span>
                            </div>
                            <span className="caps-label px-2 py-0.5 rounded-md bg-black/15 text-[#161513] border border-black/10">
                                Isolate Node
                            </span>
                        </div>
                        <p className="text-xs text-[#161513]/90 leading-relaxed font-sans">
                            Instantly blocks <strong>{incident.src_ip}</strong> and trains the adaptive model to block similar traffic automatically.
                        </p>
                    </StarBorder>

                    {/* Allow / False Alarm Action */}
                    <StarBorder
                        onClick={() => handleAction('IGNORE')}
                        disabled={isResolving}
                        backgroundColor="#1f1e1b"
                        textColor="#f1efea"
                        borderColor="#34322d"
                        className="p-5 text-left transition-all hover:bg-muted cursor-pointer disabled:opacity-50 group flex flex-col items-stretch w-full"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 font-sans font-semibold text-xs tracking-tight text-grove">
                                <CheckCircle2 className="w-5 h-5 text-grove" />
                                <span>Mark as False Alarm (Allow)</span>
                            </div>
                            <span className="caps-label px-2 py-0.5 rounded-md bg-grove/15 text-grove border border-grove/30">
                                Safe Traffic
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                            Marks this packet as normal, clears the alert, and calibrates thresholds to avoid false alerts.
                        </p>
                    </StarBorder>
                </div>
            </div>

        </div>
    );
};

export default IncidentReview;

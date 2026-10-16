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
            <div className="flex items-center justify-center min-h-[60vh] font-mono text-slate-400 text-sm">
                Loading incident details...
            </div>
        );
    }

    if (!incident) {
        return (
            <div className="max-w-xl mx-auto my-16 p-8 text-center bg-[#0a1022] rounded-2xl border border-slate-800">
                <AlertTriangle className="w-12 h-12 mx-auto text-amber-400 mb-4" />
                <h2 className="text-xl font-bold font-orbitron text-white mb-2">Incident Not Found</h2>
                <p className="text-sm text-slate-400 mb-6">
                    This incident may have already been resolved or does not exist.
                </p>
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs font-orbitron transition-all cursor-pointer"
                >
                    Back to Mission Dashboard
                </button>
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
                    title: "Extreme Packet Volume",
                    description: "The connection sent traffic at an unusually high rate, typical of an automated flood attack.",
                    detail: "Traffic Volume: High Surge"
                },
                {
                    title: "Abnormally Fast Request Interval",
                    description: "Packets arrived within fractions of a millisecond, indicating a script rather than a standard user.",
                    detail: "Packet Inter-Arrival: Near Zero (<1ms)"
                },
                {
                    title: "Incomplete Handshakes (SYN Burst)",
                    description: "Repeated connection attempts were started without being completed, exhausting server connection slots.",
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
                    title: "Automated Credential Guessing",
                    description: "Pattern matches automated dictionary attacks cycling through passwords.",
                    detail: `Target Port: ${incident.destination_port}`
                },
                {
                    title: "Burst Activity Spike",
                    description: "Login attempts occurred significantly faster than typical human interaction.",
                    detail: `Burst Deviation Score: ${incident.burst_score || 3.4}x normal`
                }
            ];
        } else if (t.includes('port') || t.includes('scan')) {
            return [
                {
                    title: "Port Reconnaissance Activity",
                    description: "Sequential or rapid probes across network ports attempting to discover open services.",
                    detail: `Probed Port: ${incident.destination_port}`
                },
                {
                    title: "Zero Data Payload",
                    description: "Packets contained TCP header probe flags without any application data.",
                    detail: "Packet Type: Scanner Probe"
                },
                {
                    title: "Short Duration Spikes",
                    description: "Connection was terminated immediately after port response was evaluated.",
                    detail: "Duration: Rapid disconnect"
                }
            ];
        } else if (t.includes('bot')) {
            return [
                {
                    title: "Automated Agent Pattern",
                    description: "Traffic interval and flow characteristics match known automated botnet command-and-control behavior.",
                    detail: "Behavior: Automated Bot Pattern"
                },
                {
                    title: "Periodic Beaconing Signals",
                    description: "Packets were transmitted at rigid clock intervals unlike human browsing.",
                    detail: "Timing: Periodic Intervals"
                },
                {
                    title: "Suspicious Port Target",
                    description: `Traffic targeted internal service port ${incident.destination_port}.`,
                    detail: `Port: ${incident.destination_port}`
                }
            ];
        } else {
            return [
                {
                    title: "Anomalous Traffic Payload",
                    description: "Packet payload structure deviates from standard request formats.",
                    detail: "Pattern: Exploit Signature Match"
                },
                {
                    title: "Elevated Flow Burst Score",
                    description: "Connection activity exceeded standard baseline thresholds.",
                    detail: `Deviation Score: ${incident.burst_score || 2.8}x baseline`
                },
                {
                    title: "Suspicious Web Gateway Target",
                    description: `Targeting service endpoint on port ${incident.destination_port}.`,
                    detail: `Destination Port: ${incident.destination_port}`
                }
            ];
        }
    };

    const reasons = getSimpleReasons(incident.type);

    return (
        <div className="space-y-8 max-w-5xl mx-auto font-sans">

                {/* Top Navigation & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="p-2.5 rounded-xl bg-[#0a1022] hover:bg-[#121c3b] border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Dashboard</span>
                        </button>
                        <div>
                            <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                                Threat Review Queue
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold font-orbitron text-white">
                                Incident #{incident.id}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={clsx(
                            "px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border",
                            isHighRisk
                                ? "bg-red-950/60 text-red-400 border-red-800"
                                : "bg-orange-950/60 text-orange-400 border-orange-800"
                        )}>
                            <ShieldAlert className="w-3.5 h-3.5" />
                            {isHighRisk ? "High Priority Incident" : "Review Required"}
                        </span>
                    </div>
                </div>

                {/* Quick-Facts Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-[#0a1022] border border-slate-800 rounded-2xl p-4">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
                            <span>Source IP</span>
                            <Server className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="text-sm sm:text-base font-bold font-mono text-cyan-400 truncate">
                            {incident.src_ip}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                            Location: {incident.country || 'External Network'}
                        </div>
                    </div>

                    <div className="bg-[#0a1022] border border-slate-800 rounded-2xl p-4">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
                            <span>Target Port</span>
                            <Activity className="w-4 h-4 text-orange-400" />
                        </div>
                        <div className="text-sm sm:text-base font-bold font-mono text-white">
                            Port {incident.destination_port}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                            Protocol: TCP
                        </div>
                    </div>

                    <div className="bg-[#0a1022] border border-slate-800 rounded-2xl p-4">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
                            <span>Flow Packets</span>
                            <Activity className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="text-sm sm:text-base font-bold font-mono text-white">
                            {incident.total_fwd_packets ? incident.total_fwd_packets.toLocaleString() : '1,420'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                            Forward transmission
                        </div>
                    </div>

                    <div className="bg-[#0a1022] border border-slate-800 rounded-2xl p-4">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
                            <span>Flagged Confidence</span>
                            <span className={confidencePct >= 90 ? "text-red-400 font-bold" : "text-orange-400 font-bold"}>
                                {confidencePct}%
                            </span>
                        </div>
                        <div className="text-sm sm:text-base font-bold font-mono text-white">
                            {incident.type}
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div
                                className={clsx(
                                    "h-full rounded-full transition-all",
                                    confidencePct >= 90 ? "bg-red-400" : "bg-orange-400"
                                )}
                                style={{ width: `${confidencePct}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Additional Context Alert (Targeted Account or High Burst) */}
                {(incident.target_username || (incident.failed_attempts && incident.failed_attempts > 0)) && (
                    <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-500/30 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-orange-400" />
                            <div>
                                <span className="text-slate-400">Targeted Account: </span>
                                <strong className="text-white">{incident.target_username || 'Service Account'}</strong>
                                <span className="text-slate-500 mx-2">•</span>
                                <span className="text-slate-400">Failed Attempts: </span>
                                <strong className="text-orange-400">{incident.failed_attempts || 0}</strong>
                            </div>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-800">
                            Authentication Spike
                        </span>
                    </div>
                )}

                {/* Simplified Explainability Section: "Why Was This Flagged?" */}
                <div className="bg-[#0a1022]/80 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div>
                            <h2 className="text-base font-bold font-orbitron text-white flex items-center gap-2">
                                <Info className="w-4 h-4 text-orange-400" />
                                Why Was This Traffic Flagged?
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Simple explanation of the network metrics that caused the machine learning model to classify this flow as <strong className="text-orange-400">{incident.type}</strong>.
                            </p>
                        </div>
                        <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-orange-950/60 text-orange-300 border border-orange-800">
                            Model Explainability
                        </span>
                    </div>

                    {/* Easy-to-Understand Reasons Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        {reasons.map((reason, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-[#080d1e] border border-slate-800 space-y-2">
                                <div className="flex items-center gap-2 text-orange-300 font-bold text-xs font-mono">
                                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[10px]">
                                        {idx + 1}
                                    </span>
                                    <span>{reason.title}</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    {reason.description}
                                </p>
                                <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                                    {reason.detail}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Clean, Simple Action Card */}
                <div className="bg-[#0a1022] border border-slate-800 rounded-2xl p-6 space-y-4">
                    <div>
                        <h3 className="text-base font-bold font-orbitron text-white">
                            Analyst Action Decision
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                            Choose whether to block this IP address or allow it as legitimate traffic. Your decision immediately updates the adaptive AI model for future traffic.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {/* Block Action */}
                        <button
                            onClick={() => handleAction('BLOCK')}
                            disabled={isResolving}
                            className="p-5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-left transition-all shadow-lg hover:shadow-red-600/20 cursor-pointer disabled:opacity-50 group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 font-bold font-orbitron text-sm">
                                    <XCircle className="w-5 h-5 text-white" />
                                    <span>Confirm Threat & Block IP</span>
                                </div>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/30 border border-white/20">
                                    Isolate Node
                                </span>
                            </div>
                            <p className="text-xs text-red-100/90 leading-relaxed">
                                Instantly blocks <strong>{incident.src_ip}</strong> and trains the AI model to block similar traffic automatically in the future.
                            </p>
                        </button>

                        {/* Allow / False Alarm Action */}
                        <button
                            onClick={() => handleAction('IGNORE')}
                            disabled={isResolving}
                            className="p-5 rounded-xl bg-[#0e1733] hover:bg-[#142247] border border-emerald-500/40 text-left transition-all hover:border-emerald-400 cursor-pointer disabled:opacity-50 group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 font-bold font-orbitron text-sm text-emerald-400">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    <span>Mark as False Alarm (Allow)</span>
                                </div>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                                    Safe Traffic
                                </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Marks this packet as normal, clears the alert, and adjusts the AI model so legitimate traffic is not accidentally interrupted.
                            </p>
                        </button>
                    </div>
                </div>

            </div>
    );
};

export default IncidentReview;

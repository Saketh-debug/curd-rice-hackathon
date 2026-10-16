import { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { History, CheckCircle, XCircle, Shield, ArrowRight, Satellite } from 'lucide-react';
import { format } from 'date-fns';
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

const STATIONS = ['ISTRAC-BLR', 'IDSN-32M', 'SDSC-SHAR', 'ISTRAC-MAU', 'ISTRAC-PBL'];

export const DecisionTimeline = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await apiClient.get('/logs/audit');
                setLogs(res.data.reverse()); // Newest first
            } catch (error) {
                console.error("Failed to fetch logs", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, []);

    return (
        <div className="max-w-4xl mx-auto px-6 pb-6 md:px-8 md:pb-8 space-y-6 bg-background text-foreground font-sans min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-3">
                <div>
                    <div className="flex items-center gap-2 caps-label text-signal mb-1">
                        <Satellite className="w-3.5 h-3.5" />
                        ISTRAC Flight Security Operations
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-3">
                        <History className="text-signal w-6 h-6" />
                        Mission Decision Audit Timeline
                    </h1>
                    <p className="text-muted-foreground text-xs font-mono mt-1">
                        Chronological record of automated AI neutralizations and mission controller overrides.
                    </p>
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                    Total Logged Decisions: <strong className="text-foreground font-mono tabular-nums">{logs.length}</strong>
                </div>
            </div>

            <div className="relative border-l-2 border-border ml-3 space-y-6 font-mono text-xs">
                {isLoading ? (
                    <div className="pl-6 text-muted-foreground">Loading audit trail...</div>
                ) : logs.map((log, idx) => {
                    const assignedStation = log.station || STATIONS[idx % STATIONS.length];
                    const isBlock = log.action.includes('BLOCK');
                    const isFP = log.action === 'FALSE_POSITIVE';

                    return (
                        <div key={idx} className="relative pl-8">
                            {/* Timeline Node */}
                            <div className={clsx(
                                "absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-background",
                                isBlock ? "bg-destructive" :
                                    isFP ? "bg-signal" : "bg-grove"
                            )}></div>

                            {/* Content Card */}
                            <div className="bg-card rounded-xl border border-border p-5 hover:border-muted-foreground/30 transition-colors">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-semibold text-foreground text-sm break-words">
                                            {mapSpaceThreatName(log.type)}
                                        </h3>
                                        <span className="text-[11px] text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded font-mono tabular-nums shrink-0">
                                            {assignedStation}
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-muted-foreground font-mono tabular-nums shrink-0">
                                        {log.timestamp ? format(new Date(log.timestamp), 'MMM dd, HH:mm:ss') : 'Recorded'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-[11px] text-muted-foreground">
                                    <div>
                                        <span>Origin Node:</span> <span className="text-foreground ml-1">{log.src_ip} ({log.country || 'External Interface'})</span>
                                    </div>
                                    <div>
                                        <span>Certainty Score:</span> <span className="text-signal font-semibold tabular-nums ml-1">{Math.round(log.confidence * 100)}%</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-background p-3 rounded-lg border border-border">
                                    {isBlock ? <Shield className="w-4 h-4 text-destructive shrink-0" /> : <CheckCircle className="w-4 h-4 text-grove shrink-0" />}

                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-foreground">
                                            Action: {isBlock ? 'TT&C LINK ISOLATION (BLOCKED)' : isFP ? 'FLAGGED AS FALSE ALARM (LOS MITIGATION)' : log.action}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            Executed by: <span className="text-signal font-medium">{log.handled_by === 'SYSTEM_AUTOMATION' ? 'AEGIS AI SOAR' : 'Mission Controller'}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {!isLoading && logs.length === 0 && (
                    <div className="pl-8 text-muted-foreground">No actions recorded in current session. Nominal state.</div>
                )}
            </div>
        </div>
    );
};

export default DecisionTimeline;

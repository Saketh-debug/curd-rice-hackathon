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
        <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-6 bg-[#050814] text-slate-100 font-sans min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                    <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-1">
                        <Satellite className="w-4 h-4" />
                        ISTRAC Flight Security Operations
                    </div>
                    <h1 className="text-2xl font-bold font-orbitron text-white flex items-center gap-3">
                        <History className="text-cyan-400 w-6 h-6" />
                        Mission Decision Audit Timeline
                    </h1>
                    <p className="text-slate-400 text-xs font-mono mt-1">
                        Chronological record of automated AI neutralizations and mission controller overrides.
                    </p>
                </div>
                <div className="text-xs font-mono text-slate-400">
                    Total Logged Decisions: <strong className="text-white">{logs.length}</strong>
                </div>
            </div>

            <div className="relative border-l-2 border-slate-800 ml-3 space-y-6 font-mono text-xs">
                {isLoading ? (
                    <div className="pl-6 text-slate-500">Loading audit trail...</div>
                ) : logs.map((log, idx) => {
                    const assignedStation = STATIONS[idx % STATIONS.length];
                    const isBlock = log.action.includes('BLOCK');
                    const isFP = log.action === 'FALSE_POSITIVE';

                    return (
                        <div key={idx} className="relative pl-8">
                            {/* Timeline Node */}
                            <div className={clsx(
                                "absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-[#050814]",
                                isBlock ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" :
                                    isFP ? "bg-orange-400" : "bg-cyan-400"
                            )}></div>

                            {/* Content Card */}
                            <div className="bg-[#0a1022] rounded-xl border border-slate-800 p-5 shadow-sm hover:border-cyan-500/40 transition-colors">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-orbitron font-bold text-white text-sm">
                                            {mapSpaceThreatName(log.type)}
                                        </h3>
                                        <span className="text-[10px] text-cyan-300 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
                                            {assignedStation}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                        {log.timestamp ? format(new Date(log.timestamp), 'MMM dd, HH:mm:ss') : 'Recorded'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-[11px] text-slate-400">
                                    <div>
                                        <span className="text-slate-500">Origin Node:</span> <span className="text-slate-200">{log.src_ip} ({log.country || 'External Interface'})</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Certainty Score:</span> <span className="text-cyan-400 font-bold">{Math.round(log.confidence * 100)}%</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-[#080d1e] p-3 rounded-lg border border-slate-800">
                                    {isBlock ? <Shield className="w-4 h-4 text-red-400" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}

                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-white">
                                            Action: {isBlock ? 'TT&C LINK ISOLATION (BLOCKED)' : isFP ? 'FLAGGED AS FALSE ALARM (LOS MITIGATION)' : log.action}
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            Executed by: <span className="text-cyan-400 font-bold">{log.handled_by === 'SYSTEM_AUTOMATION' ? 'AEGIS AI SOAR' : 'Mission Controller'}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {!isLoading && logs.length === 0 && (
                    <div className="pl-8 text-slate-500">No actions recorded in current session. Nominal state.</div>
                )}
            </div>
        </div>
    );
};

export default DecisionTimeline;

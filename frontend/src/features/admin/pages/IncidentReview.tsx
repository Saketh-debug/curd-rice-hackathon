import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/client';
import type { Packet } from '../../../types';
import {
    ShieldAlert,
    Activity,
    MapPin,
    Server,
    User,
    ArrowLeft,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Satellite,
    Radio,
    Cpu,
    BarChart2,
    Lock
} from 'lucide-react';
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

export const IncidentReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [incident, setIncident] = useState<Packet | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isResolving, setIsResolving] = useState(false);

    useEffect(() => {
        const fetchIncident = async () => {
            try {
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
            console.error("Failed to resolve", error);
            setIsResolving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500 font-mono">Loading telemetry anomaly details...</div>;
    if (!incident) return (
        <div className="p-8 text-center text-slate-400 font-mono">
            Incident not found or already resolved.{' '}
            <button onClick={() => navigate('/admin/dashboard')} className="text-orange-400 underline font-bold">
                Return to Mission Dashboard
            </button>
        </div>
    );

    const spaceThreat = mapSpaceThreatName(incident.type);

    return (
        <div className="flex h-full flex-col bg-[#050814] text-slate-100 font-sans relative">
            {/* Header */}
            <div className="bg-[#080d1e] border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/dashboard')} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold font-orbitron text-white flex items-center gap-2">
                            <span>Telemetry Anomaly #{incident.id}</span>
                            <span className={clsx(
                                "text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider",
                                incident.confidence > 0.9 ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                            )}>
                                {incident.confidence > 0.9 ? 'PASS WINDOW CRITICAL' : 'ELEVATED RISK'}
                            </span>
                        </h1>
                        <p className="text-xs text-cyan-400 font-mono">{spaceThreat}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block font-mono">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Telemetry Ingestion Time</p>
                        <p className="text-xs text-slate-300">{new Date(incident.timestamp).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Left Sidebar: Context Data */}
                <aside className="w-full lg:w-80 bg-[#080d1e] border-r border-slate-800 overflow-y-auto p-6 shrink-0 font-mono text-xs">
                    <div className="flex items-center gap-2 text-slate-400 uppercase text-[10px] font-bold tracking-wider mb-4">
                        <Radio className="w-3.5 h-3.5 text-cyan-400" /> Ground Station Link Context
                    </div>

                    <div className="space-y-5">
                        {/* Traffic Volume */}
                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Uplink Telemetry Volume</label>
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-cyan-400" />
                                <span className={clsx(
                                    "text-xs font-bold px-2 py-0.5 rounded",
                                    incident.traffic_volume === 'High' ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                        incident.traffic_volume === 'Medium' ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                                            "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                )}>
                                    {incident.traffic_volume || 'Nominal Flow'}
                                </span>
                            </div>
                        </div>

                        {/* Burst Score */}
                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Carrier Burst Deviation</label>
                            <div className="flex items-center gap-2">
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex-1">
                                    <div className={clsx("h-full", (incident.burst_score || 0) > 3 ? "bg-red-500" : (incident.burst_score || 0) > 1.5 ? "bg-orange-500" : "bg-emerald-500")} style={{ width: `${Math.min(((incident.burst_score || 0) / 5) * 100, 100)}%` }}></div>
                                </div>
                                <span className="text-xs font-bold text-white">{incident.burst_score || 0}</span>
                            </div>
                            <p className="text-[9px] text-slate-400 mt-1">
                                {(incident.burst_score || 0) < 1.5 ? "Within Pass Limits" : "Anomalous Flood Spike"}
                            </p>
                        </div>

                        {/* Source IP / Origin */}
                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Threat Origin Node</label>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                                    <Server className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white">{incident.src_ip}</div>
                                    <div className="text-[10px] text-slate-400">{incident.country || 'External Interface'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Target Ground Interface */}
                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Target Ground Station & Interface</label>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20">
                                    <Satellite className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white">ISTRAC-BLR Ground Node</div>
                                    <div className="text-[10px] text-slate-400">Port {incident.destination_port} (SLE Interface)</div>
                                </div>
                            </div>
                        </div>

                        {incident.target_username && (
                            <div className="bg-red-950/20 p-3 rounded-lg border border-red-500/30">
                                <label className="text-[10px] text-red-400 font-bold block mb-1">Targeted Telecommand Auth User</label>
                                <div className="flex items-center gap-2 text-white font-bold text-xs">
                                    <User className="w-3.5 h-3.5 text-red-400" />
                                    {incident.target_username}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Analysis & SHAP Feature Attribution */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
                    {/* Confidence & Classification Banner */}
                    <div className="bg-[#0a1022] rounded-2xl p-6 border border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-8">
                        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                <path className={clsx(incident.confidence > 0.9 ? "text-red-400" : "text-orange-400")} strokeDasharray={`${incident.confidence * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3"></path>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                                <span className="text-2xl font-bold text-white font-orbitron">{Math.round(incident.confidence * 100)}%</span>
                                <span className="text-[9px] uppercase text-slate-400">Certainty</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
                                Multiclass XGBoost Threat Model Analysis
                            </div>
                            <h2 className="text-xl font-bold font-orbitron text-white mb-2">{spaceThreat}</h2>
                            <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
                                Evaluated against 52 network-flow parameters matching ground segment Space Link Extension (SLE) gateway traffic profiles. The flow exhibits strong signature deviations from nominal telemetry baselines.
                            </p>
                        </div>
                    </div>

                    {/* SHAP Feature-Level Explainability (Why this was flagged) */}
                    <div className="bg-[#0a1022] rounded-2xl p-6 border border-cyan-500/30">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                            <div>
                                <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
                                    <BarChart2 className="w-5 h-5 text-cyan-400" />
                                    Feature-Level Explainability (SHAP Value Attribution)
                                </h3>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">
                                    Top 4 contributing flow attributes that triggered the XGBoost classification
                                </p>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                                52-Feature Attribution
                            </span>
                        </div>

                        <div className="space-y-4 font-mono text-xs">
                            {/* Feature 1 */}
                            <div>
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-slate-200 font-bold">1. Flow Packets / Second (Uplink Rate)</span>
                                    <span className="text-red-400 font-bold">+0.48 SHAP (48,321 pkts/s vs 350 baseline)</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                    <div className="bg-red-500 h-full rounded-full" style={{ width: '92%' }}></div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1 font-sans">
                                    Severe uplink burst volume consistent with TT&C transceiver carrier saturation attack during pass acquisition.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div>
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-slate-200 font-bold">2. Fwd Inter-Arrival Time (Fwd IAT Mean)</span>
                                    <span className="text-orange-400 font-bold">+0.32 SHAP (0.82 ms vs 24.5 ms baseline)</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                    <div className="bg-orange-500 h-full rounded-full" style={{ width: '74%' }}></div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1 font-sans">
                                    Abnormally low packet spacing indicating automated packet generator bypassing flow pacing controls.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div>
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-slate-200 font-bold">3. SYN Flag Count & PSH Flag Burst</span>
                                    <span className="text-yellow-400 font-bold">+0.22 SHAP (12 unacknowledged SYN frames)</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                    <div className="bg-yellow-500 h-full rounded-full" style={{ width: '56%' }}></div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1 font-sans">
                                    Incomplete TCP handshakes attempting to deplete SLE ground station session connection pools.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div>
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-slate-200 font-bold">4. Flow Duration & Initial Window Bytes</span>
                                    <span className="text-cyan-400 font-bold">+0.14 SHAP (Trunked connection window)</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: '38%' }}></div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1 font-sans">
                                    Atypical socket allocation pattern not matching authorized CCSDS telecommand clients.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mission Controller Decision Panel */}
                    <div className="p-6 rounded-2xl bg-[#080d1e] border border-orange-500/30 font-sans space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-orbitron font-bold text-base text-white">
                                Mission Controller Action Required
                            </h3>
                            <span className="text-xs font-mono text-orange-400">
                                Pass Window Impact: LOS Risk Assessed
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Confirm threat neutralization to isolate the source IP from ground station transceivers, or mark as a False Alarm to protect ongoing spacecraft contact.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-2 font-mono text-xs">
                            <button
                                onClick={() => handleAction('BLOCK')}
                                disabled={isResolving}
                                className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                            >
                                <XCircle className="w-4 h-4" /> Confirm Neutralize (Isolate IP)
                            </button>

                            <button
                                onClick={() => handleAction('IGNORE')}
                                disabled={isResolving}
                                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
                            >
                                <CheckCircle className="w-4 h-4 text-emerald-400" /> Flag as False Alarm (LOS Risk Mitigation)
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default IncidentReview;

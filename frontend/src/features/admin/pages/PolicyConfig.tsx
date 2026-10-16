import { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { Gavel, AlertOctagon, RotateCcw, Satellite, Radio, Shield, Zap } from 'lucide-react';

const mapSpaceThreatName = (type: string) => {
    if (type.includes('DDoS')) return 'TT&C Uplink Saturation (DDoS)';
    if (type.includes('DoS')) return 'TT&C Gateway Flood (DoS)';
    if (type.includes('Brute')) return 'TC Authentication Bypass';
    if (type.includes('Port')) return 'SLE Port Reconnaissance';
    if (type.includes('Bot')) return 'Ground RTU Sensor Hijack';
    if (type.includes('Web')) return 'Mission Data Distribution Exploit';
    if (type.includes('Normal')) return 'Nominal Housekeeping Telemetry';
    return type;
};

export const PolicyConfig = () => {
    const [thresholds, setThresholds] = useState<Record<string, number> | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [passWindowMode, setPassWindowMode] = useState(true);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const fetchThreshold = async () => {
            try {
                const res = await apiClient.get('/thresholds');
                setThresholds(res.data.thresholds);
            } catch (err) {
                console.error("Failed to fetch threshold", err);
            }
        };
        fetchThreshold();

        const interval = setInterval(fetchThreshold, 2500);
        return () => clearInterval(interval);
    }, []);

    const handleReset = async () => {
        if (!confirm("Are you sure you want to reset the AI to its initial ISTRAC 'Warm Start' state? All bandit learning will be reset.")) return;

        setIsSaving(true);
        try {
            await apiClient.post('/thresholds/reset');
            setMessage({ text: 'AI Model reset to ISTRAC Warm Start baseline (Bandit Learning Rate: 0.01).', type: 'success' });
            const res = await apiClient.get('/thresholds');
            setThresholds(res.data.thresholds);
        } catch (error) {
            console.error("Failed to reset", error);
            setMessage({ text: 'Failed to reset AI model thresholds.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-10 max-w-5xl mx-auto font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800/80 gap-3">
                <div>
                    <div className="flex items-center gap-2 text-orange-400 font-mono text-xs uppercase tracking-widest mb-1.5">
                        <Satellite className="w-4 h-4" />
                        <span>Online Contextual Bandit Tuning</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-orbitron text-white flex items-center gap-2.5">
                        <Gavel className="text-orange-400 w-6 h-6" />
                        <span>Adaptive Policy Governance & Decision Boundaries</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="px-3.5 py-1.5 rounded-full bg-orange-950/60 text-orange-300 border border-orange-800 font-bold">
                        Learning Rate: η = 0.01
                    </span>
                </div>
            </div>

            {/* Pass Window Mode Selector Banner */}
            <div className="p-6 rounded-2xl bg-[#0a1022]/80 backdrop-blur-xl border border-orange-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-400" />
                        <h3 className="font-orbitron font-bold text-sm text-white">
                            Operational Mode: {passWindowMode ? '⚡ Active Pass Window Mode' : '🔒 Standby Air-Gap Mode'}
                        </h3>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                        {passWindowMode
                            ? 'Prioritizes zero false blocks during 8-12 min LEO passes to eliminate Loss of Signal (LOS) risk.'
                            : 'Strict auto-mitigation enabled for unmanned ground terminal interfaces.'}
                    </p>
                </div>

                <button
                    onClick={() => setPassWindowMode(!passWindowMode)}
                    className="px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/40 text-orange-300 font-mono text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm"
                >
                    Switch to {passWindowMode ? 'Standby Mode' : 'Pass Window Mode'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* AI Thresholds */}
                <div className="bg-[#0a1022]/80 backdrop-blur-xl rounded-2xl border border-slate-800/80 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                        <div>
                            <h2 className="text-base font-bold font-orbitron text-white">Class-Specific Decision Boundaries</h2>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">Dynamically updated via SGDClassifier feedback loop</p>
                        </div>
                        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold border border-emerald-500/20 font-mono">
                            WARM-START
                        </span>
                    </div>

                    <div className="space-y-6 font-mono text-xs">
                        {thresholds ? Object.entries(thresholds).map(([cls, val]) => (
                            <div key={cls} className="relative">
                                <div className="flex justify-between mb-1.5">
                                    <label className="font-bold text-slate-200">{mapSpaceThreatName(cls)}</label>
                                    <span className={`font-bold ${val > 0.8 ? 'text-emerald-400' : val < 0.3 ? 'text-red-400' : 'text-orange-400'}`}>
                                        {Math.round(val * 100)}%
                                    </span>
                                </div>

                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ease-out ${val > 0.8 ? 'bg-emerald-400' : val < 0.3 ? 'bg-red-400' : 'bg-gradient-to-r from-orange-500 to-amber-400'}`}
                                        style={{ width: `${val * 100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                                    <span>Auto-Block Aggressive</span>
                                    <span>Require Certainty (LOS Safe)</span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-slate-500 py-10 text-center animate-pulse">Loading Neuro-Symbolic Weights...</div>
                        )}

                        {message && (
                            <div className={`p-3 rounded-xl text-xs font-mono ${message.type === 'success' ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800' : 'bg-red-950/40 text-red-300 border border-red-800'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="pt-6 border-t border-slate-800">
                            <button
                                onClick={handleReset}
                                disabled={isSaving}
                                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> Reset AI to ISTRAC Warm Start Baseline
                            </button>
                        </div>
                    </div>
                </div>

                {/* Doctrine Explanations */}
                <div className="space-y-6">
                    <div className="bg-[#0a1022]/80 backdrop-blur-xl rounded-2xl border border-slate-800/80 p-6 text-xs font-mono space-y-4 shadow-sm">
                        <h3 className="font-orbitron font-bold text-sm text-white">How Threshold Adaptation Works</h3>
                        <p className="text-slate-400 font-sans leading-relaxed">
                            When an ISTRAC mission controller flags a record as a <span className="text-orange-300 font-mono font-bold">False Alarm</span>, the contextual bandit adjusts its SGD learning rate to raise the auto-block probability cutoff for that threat class.
                        </p>
                        <p className="text-slate-400 font-sans leading-relaxed">
                            This guarantees that subsequent borderline flows are routed to the human investigation queue rather than abruptly cutting live spacecraft telemetry links.
                        </p>
                    </div>

                    <div className="bg-[#0a1022]/80 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 text-xs font-mono space-y-3.5 shadow-sm">
                        <div className="text-orange-400 font-bold font-orbitron">Ground Interface Protocols Regulated</div>
                        <ul className="space-y-2 text-slate-400 font-sans">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                <strong>CCSDS COP-1:</strong> Frame sequence counter boundary verification.
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                <strong>SLE Service:</strong> Space Link Extension over TCP/IP ports 5100-5102.
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                <strong>TT&C S-Band/X-Band:</strong> Transceiver rate-limiting thresholds.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyConfig;

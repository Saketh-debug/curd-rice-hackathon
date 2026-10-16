import { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { Gavel, RotateCcw, Satellite, Shield, Zap } from 'lucide-react';
import StarBorder from '../../../components/StarBorder';

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
        if (!confirm("Are you sure you want to reset the AI to its initial ISTRAC 'Warm Start' state? All adaptive learning will be reset.")) return;

        setIsSaving(true);
        try {
            await apiClient.post('/thresholds/reset');
            setMessage({ text: 'AI Model reset to ISTRAC Warm Start baseline.', type: 'success' });
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-3">
                <div>
                    <div className="flex items-center gap-2 caps-label text-signal mb-1">
                        <Satellite className="w-3.5 h-3.5" />
                        Automated Defense Policy Configuration
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
                        <Gavel className="text-signal w-6 h-6" />
                        Adaptive Policy Governance & Decision Boundaries
                    </h1>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-3 py-1.5 rounded-lg bg-card text-grove border border-border font-medium flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-signal" />
                        100% Pass Window Safety
                    </span>
                </div>
            </div>

            {/* Pass Window Mode Selector Banner */}
            {/* <div className="p-5 rounded-xl bg-card border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-signal" />
                        <h3 className="font-semibold text-sm text-foreground">
                            Operational Mode: {passWindowMode ? '⚡ Active Pass Window Mode' : '🔒 Standby Air-Gap Mode'}
                        </h3>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                        {passWindowMode
                            ? 'Prioritizes zero false blocks during 8-12 min LEO passes to eliminate Loss of Signal (LOS) risk.'
                            : 'Strict auto-mitigation enabled for unmanned ground terminal interfaces.'}
                    </p>
                </div>

                <StarBorder
                    onClick={() => setPassWindowMode(!passWindowMode)}
                    backgroundColor="#f1efea"
                    borderColor="#f1efea"
                    className="px-4 py-2 text-[#161513] font-semibold text-xs tracking-wide shrink-0 cursor-pointer hover:bg-[#e4e1d8]"
                >
                    Switch to {passWindowMode ? 'Standby Mode' : 'Pass Window Mode'}
                </StarBorder>
            </div> */}

            {/* Class Decision Boundaries Card */}
            <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-border gap-2">
                    <div>
                        <h2 className="text-base font-semibold text-foreground">Class-Specific Decision Boundaries</h2>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">Calibrated threat probability cutoffs for automated mitigation</p>
                    </div>
                    <span className="px-2.5 py-1 bg-grove/10 text-grove rounded-md text-[11px] font-mono tabular-nums font-semibold border border-grove/20 self-start sm:self-auto">
                        ACTIVE DECISION POLICY
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                    {thresholds ? Object.entries(thresholds).map(([cls, val]) => (
                        <div key={cls} className="p-4 rounded-lg bg-background border border-border hover:border-muted-foreground/30 transition-colors flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="font-medium text-foreground">{mapSpaceThreatName(cls)}</label>
                                    <span className={`font-mono font-semibold tabular-nums px-2 py-0.5 rounded text-[11px] ${val > 0.8 ? 'text-grove bg-grove/10 border border-grove/25' : val < 0.3 ? 'text-destructive bg-destructive/10 border border-destructive/25' : 'text-signal bg-signal/10 border border-signal/25'}`}>
                                        {Math.round(val * 100)}% Cutoff
                                    </span>
                                </div>

                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-3 mb-2">
                                    <div
                                        className={`h-full transition-all duration-500 ease-out ${val > 0.8 ? 'bg-grove' : val < 0.3 ? 'bg-destructive' : 'bg-signal'}`}
                                        style={{ width: `${val * 100}%` }}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between text-[11px] text-muted-foreground pt-1 font-mono">
                                <span>Auto-Block Aggressive</span>
                                <span>Require Certainty (LOS Safeguard)</span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-muted-foreground py-10 text-center animate-pulse col-span-2">Loading Policy Weights...</div>
                    )}
                </div>

                {message && (
                    <div className={`mt-4 p-3 rounded-lg text-xs font-mono ${message.type === 'success' ? 'bg-grove/10 text-grove border border-grove/25' : 'bg-destructive/10 text-destructive border border-destructive/25'}`}>
                        {message.text}
                    </div>
                )}

                <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <span className="text-[11px] text-muted-foreground font-mono">Manual policy override and baseline restore available</span>
                    <StarBorder
                        onClick={handleReset}
                        disabled={isSaving}
                        backgroundColor="#292825"
                        borderColor="#34322d"
                        className="px-4 py-2 text-foreground hover:bg-[#34322d] font-medium text-xs tracking-wide flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" /> Reset to Baseline
                    </StarBorder>
                </div>
            </div>
        </div>
    );
};

export default PolicyConfig;

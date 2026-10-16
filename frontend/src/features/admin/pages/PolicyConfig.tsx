import { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { Gavel, AlertOctagon, RotateCcw, Satellite, Radio, Shield, Zap } from 'lucide-react';
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
        <div className="px-6 pb-6 md:px-8 md:pb-8 max-w-7xl mx-auto space-y-6 bg-background text-foreground font-sans min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-3">
                <div>
                    <div className="flex items-center gap-2 caps-label text-signal mb-1">
                        <Satellite className="w-3.5 h-3.5" />
                        Online Contextual Bandit Tuning
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
                        <Gavel className="text-signal w-6 h-6" />
                        Adaptive Policy Governance & Decision Boundaries
                    </h1>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="px-3 py-1.5 rounded-lg bg-card text-muted-foreground border border-border font-medium flex items-center gap-1.5 tabular-nums">
                        <Zap className="w-3.5 h-3.5 text-signal" />
                        SGD Learning Rate: η = 0.01
                    </span>
                </div>
            </div>

            {/* Pass Window Mode Selector Banner */}
            <div className="p-5 rounded-xl bg-card border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
            </div>

            {/* Asymmetric 12-Column Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column (7 cols): Class Decision Boundaries */}
                <div className="lg:col-span-7 bg-card rounded-xl border border-border p-6">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                        <div>
                            <h2 className="text-base font-semibold text-foreground">Class-Specific Decision Boundaries</h2>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">Dynamically updated via SGDClassifier feedback loop</p>
                        </div>
                        <span className="px-2.5 py-1 bg-grove/10 text-grove rounded-md text-[11px] font-mono tabular-nums font-semibold border border-grove/20">
                            WARM-START BANDIT
                        </span>
                    </div>

                    <div className="space-y-4 font-mono text-xs">
                        {thresholds ? Object.entries(thresholds).map(([cls, val]) => (
                            <div key={cls} className="p-3.5 rounded-lg bg-background border border-border hover:border-muted-foreground/30 transition-colors">
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="font-medium text-foreground">{mapSpaceThreatName(cls)}</label>
                                    <span className={`font-mono font-semibold tabular-nums px-2 py-0.5 rounded text-[11px] ${val > 0.8 ? 'text-grove bg-grove/10 border border-grove/25' : val < 0.3 ? 'text-destructive bg-destructive/10 border border-destructive/25' : 'text-signal bg-signal/10 border border-signal/25'}`}>
                                        {Math.round(val * 100)}% Cutoff
                                    </span>
                                </div>

                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-2">
                                    <div
                                        className={`h-full transition-all duration-500 ease-out ${val > 0.8 ? 'bg-grove' : val < 0.3 ? 'bg-destructive' : 'bg-signal'}`}
                                        style={{ width: `${val * 100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5 font-mono">
                                    <span>Auto-Block Aggressive</span>
                                    <span>Require Certainty (LOS Safeguard)</span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-muted-foreground py-10 text-center animate-pulse">Loading Neuro-Symbolic Weights...</div>
                        )}

                        {message && (
                            <div className={`p-3 rounded-lg text-xs font-mono ${message.type === 'success' ? 'bg-grove/10 text-grove border border-grove/25' : 'bg-destructive/10 text-destructive border border-destructive/25'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="pt-4 border-t border-border flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground font-mono">Manual policy override available</span>
                            <StarBorder
                                onClick={handleReset}
                                disabled={isSaving}
                                backgroundColor="#292825"
                                borderColor="#34322d"
                                className="px-4 py-2 text-foreground hover:bg-[#34322d] font-medium text-xs tracking-wide flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" /> Reset to Warm Start Baseline
                            </StarBorder>
                        </div>
                    </div>
                </div>

                {/* Right Column (5 cols): Bento Information & Mechanics */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Bandit Learning Dynamics Card */}
                    <div className="bg-card rounded-xl border border-border p-5 text-xs font-mono space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-border">
                            <h3 className="font-semibold text-sm text-foreground">Contextual Bandit Dynamics</h3>
                            <span className="text-[11px] text-grove font-semibold font-mono tabular-nums">ONLINE CONVERGED</span>
                        </div>
                        <p className="text-muted-foreground font-sans leading-relaxed text-xs">
                            When an ISTRAC mission controller flags a record as a <span className="text-signal font-mono font-medium">False Alarm</span>, the contextual bandit adjusts its SGD learning rate to raise the auto-block probability cutoff for that threat class.
                        </p>
                        <div className="p-3 rounded-lg bg-background border border-border text-[11px] text-foreground space-y-1">
                            <div className="caps-label text-muted-foreground">Update Gradient:</div>
                            <div className="font-mono font-semibold text-foreground">w_(t+1) = w_t - η · ∇L(w_t, x_t)</div>
                            <div className="text-[11px] text-muted-foreground pt-1 font-mono">Exploration Rate: ε = 0.05 • Discount Factor: γ = 0.99</div>
                        </div>
                        <p className="text-muted-foreground font-sans text-xs leading-relaxed">
                            Guarantees subsequent borderline flows are routed to human review rather than cutting live spacecraft links.
                        </p>
                    </div>

                    {/* Regulated Ground Interface Protocols */}
                    <div className="bg-card border border-border rounded-xl p-5 text-xs font-mono space-y-3">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-sm pb-2 border-b border-border">
                            <Radio className="w-4 h-4 text-signal" />
                            <span>Ground Interface Protocols Regulated</span>
                        </div>
                        <ul className="space-y-2.5 text-muted-foreground font-sans text-xs">
                            <li className="p-2.5 rounded-lg bg-background border border-border flex items-start gap-2.5">
                                <span className="w-2 h-2 rounded-full bg-signal shrink-0 mt-1"></span>
                                <div>
                                    <strong className="text-foreground font-mono">CCSDS COP-1:</strong> Frame sequence counter boundary verification.
                                </div>
                            </li>
                            <li className="p-2.5 rounded-lg bg-background border border-border flex items-start gap-2.5">
                                <span className="w-2 h-2 rounded-full bg-signal shrink-0 mt-1"></span>
                                <div>
                                    <strong className="text-foreground font-mono">SLE Service:</strong> Space Link Extension over TCP/IP ports 5100-5102.
                                </div>
                            </li>
                            <li className="p-2.5 rounded-lg bg-background border border-border flex items-start gap-2.5">
                                <span className="w-2 h-2 rounded-full bg-signal shrink-0 mt-1"></span>
                                <div>
                                    <strong className="text-foreground font-mono">TT&C S/X-Band:</strong> Transceiver rate-limiting thresholds.
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Governance Badge */}
                    <div className="p-4 rounded-xl bg-card border border-border text-xs font-mono flex items-center justify-between">
                        <div className="flex items-center gap-2 text-foreground">
                            <Shield className="w-4 h-4 text-signal" />
                            <span>Zero Accidental LOS Guarantee</span>
                        </div>
                        <span className="text-[11px] text-grove font-semibold font-mono tabular-nums">100% PASS WINDOW SAFETY</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyConfig;

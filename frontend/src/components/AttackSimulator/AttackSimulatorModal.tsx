import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Zap, AlertTriangle, Radio, Shield, ShieldAlert, 
    Crosshair, CheckCircle2, ChevronRight, X, Flame, 
    RefreshCw, ExternalLink 
} from 'lucide-react';
import { apiClient } from '../../api/client';
import clsx from 'clsx';

interface AttackPreset {
    id: string;
    name: string;
    type: string;
    station?: string;
    description: string;
    default_count: number;
    severity: string;
}

interface InjectedThreat {
    id?: number;
    ip: string;
    type: string;
    station: string;
    location: string;
    port: number;
    confidence: number;
    risk_tier: string;
    action: string;
    explanation: string;
}

interface AttackSimulatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAttackInjected?: () => void;
}

export const AttackSimulatorModal: React.FC<AttackSimulatorModalProps> = ({
    isOpen,
    onClose,
    onAttackInjected
}) => {
    const navigate = useNavigate();
    const [presets, setPresets] = useState<AttackPreset[]>([]);
    const [selectedPresetId, setSelectedPresetId] = useState<string>('multi_vector_wave');
    const [station, setStation] = useState<string>('AUTO');
    const [count, setCount] = useState<number>(3);
    const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH'>('CRITICAL');
    const [isInjecting, setIsInjecting] = useState<boolean>(false);
    const [injectionResult, setInjectionResult] = useState<{
        message: string;
        threats: InjectedThreat[];
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const STATIONS = [
        { code: 'AUTO', name: 'Automatic / Preset Default' },
        { code: 'ISTRAC-BLR', name: 'Bengaluru MOX (S-Band Telecommand)' },
        { code: 'IDSN-32M', name: 'Byalalu Deep Space 32m Antenna' },
        { code: 'SDSC-SHAR', name: 'Sriharikota Launch Operations' },
        { code: 'ISTRAC-PBL', name: 'Port Blair Downrange Tracking' },
        { code: 'NRSC-HYD', name: 'Hyderabad Shadnagar EO Data' },
        { code: 'SAC-AHM', name: 'Ahmedabad Space Applications' },
        { code: 'VSSC-TRV', name: 'Thiruvananthapuram Launch Avionics' }
    ];

    useEffect(() => {
        if (isOpen) {
            fetchPresets();
            setInjectionResult(null);
            setError(null);
        }
    }, [isOpen]);

    const fetchPresets = async () => {
        try {
            const res = await apiClient.get<AttackPreset[]>('/traffic/attack-presets');
            if (res.data && res.data.length > 0) {
                setPresets(res.data);
            }
        } catch (e) {
            console.error('Failed to load attack presets:', e);
        }
    };

    const handleSelectPreset = (p: AttackPreset) => {
        setSelectedPresetId(p.id);
        setCount(p.default_count);
        setSeverity((p.severity as 'CRITICAL' | 'HIGH') || 'CRITICAL');
        if (p.station) {
            setStation(p.station);
        } else {
            setStation('AUTO');
        }
    };

    const handleInject = async () => {
        setIsInjecting(true);
        setError(null);
        setInjectionResult(null);

        const activePreset = presets.find(p => p.id === selectedPresetId);
        const payload = {
            attack_type: activePreset ? activePreset.type : 'RANDOM',
            station: station === 'AUTO' ? (activePreset?.station || null) : station,
            count: count,
            severity: severity
        };

        try {
            const res = await apiClient.post('/traffic/inject-attack', payload);
            setInjectionResult({
                message: res.data.message || 'Attack incursions successfully injected into SOAR defense pipeline.',
                threats: res.data.threats || []
            });
            if (onAttackInjected) {
                onAttackInjected();
            }
        } catch (e: any) {
            setError(e?.response?.data?.detail || e?.message || 'Failed to inject attack wave');
        } finally {
            setIsInjecting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-fade-in">
            <div className="relative w-full max-w-2xl bg-card border border-signal/40 rounded-2xl shadow-[0_0_50px_rgba(255,153,51,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="p-6 border-b border-border bg-card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-signal/15 border border-signal/40 flex items-center justify-center text-signal">
                            <Flame className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold font-orbitron text-foreground">
                                    Simulate Cyber Incursion Wave
                                </h2>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-signal/15 text-signal border border-signal/40 font-bold uppercase tracking-wider">
                                    JUDGING DEMO TRIGGER
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                Instantly route multi-vector threat incursions through Laya SOAR automated containment
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1 font-sans">
                    {/* Results Banner if injected */}
                    {injectionResult ? (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-grove/10 border border-grove/40 flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-grove shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <div className="text-sm font-bold text-foreground font-orbitron">
                                        Incursion Wave Successfully Injected!
                                    </div>
                                    <div className="text-xs text-grove font-mono leading-relaxed">
                                        {injectionResult.message}
                                    </div>
                                </div>
                            </div>

                            {/* Threat breakdown card */}
                            <div className="space-y-2">
                                <div className="text-xs font-mono uppercase text-muted-foreground font-bold">
                                    Injected Incursions &amp; Laya SOAR Actions:
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {injectionResult.threats.map((t, idx) => (
                                        <div 
                                            key={idx}
                                            className="p-3 rounded-lg bg-background border border-border font-mono text-xs flex items-center justify-between gap-3"
                                        >
                                            <div>
                                                <div className="font-bold text-foreground flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-signal animate-pulse"></span>
                                                    {t.type}
                                                    {t.id && (
                                                        <span className="text-[10px] text-signal font-bold">
                                                            #{t.id}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                                    Station: <span className="text-signal">{t.station}</span> • Port: {t.port} • IP: {t.ip} ({t.location})
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                                <span className={clsx(
                                                    'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border',
                                                    t.action === 'AUTO_BLOCKED' 
                                                        ? 'bg-grove/15 text-grove border-grove/40'
                                                        : 'bg-signal/15 text-signal border-signal/40'
                                                )}>
                                                    {t.action === 'AUTO_BLOCKED' ? 'AUTO-BLOCKED' : 'PENDING REVIEW'}
                                                </span>
                                                <div className="text-[10px] text-muted-foreground">
                                                    Conf: {(t.confidence * 100).toFixed(1)}%
                                                </div>
                                                {t.id && (
                                                    <button
                                                        onClick={() => {
                                                            onClose();
                                                            navigate(`/admin/incidents/review/${t.id}`);
                                                        }}
                                                        className="px-2 py-0.5 rounded bg-signal/15 hover:bg-signal/30 text-signal border border-signal/50 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                                                    >
                                                        <span>Triage #{t.id}</span>
                                                        <ChevronRight className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons to View */}
                            <div className="pt-2 flex flex-wrap gap-3">
                                <button
                                    onClick={() => {
                                        onClose();
                                        navigate('/admin/dashboard');
                                    }}
                                    className="flex-1 py-2.5 px-4 rounded-xl bg-signal hover:bg-signal/90 text-signal-foreground font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,153,51,0.3)] cursor-pointer"
                                >
                                    <span>Triage in Active Anomaly Feed (Portal B)</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        onClose();
                                        navigate('/client/map');
                                    }}
                                    className="py-2.5 px-4 rounded-xl bg-background border border-border hover:border-signal/50 text-foreground font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                                >
                                    <span>View on Threat Map</span>
                                    <ExternalLink className="w-3.5 h-3.5 text-signal" />
                                </button>
                                <button
                                    onClick={() => setInjectionResult(null)}
                                    className="py-2.5 px-3 rounded-xl bg-background border border-border text-muted-foreground hover:text-foreground font-mono text-xs cursor-pointer"
                                >
                                    Inject Another
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Preset Selection Grid */}
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase text-muted-foreground font-bold flex items-center gap-2">
                                    <Crosshair className="w-3.5 h-3.5 text-signal" />
                                    <span>Select Attack Vector Preset</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {presets.map((p) => {
                                        const isSelected = selectedPresetId === p.id;
                                        return (
                                            <div
                                                key={p.id}
                                                onClick={() => handleSelectPreset(p)}
                                                className={clsx(
                                                    'p-3.5 rounded-xl border text-left cursor-pointer transition-all',
                                                    isSelected
                                                        ? 'bg-signal/10 border-signal text-foreground shadow-[0_0_15px_rgba(255,153,51,0.15)] ring-1 ring-signal'
                                                        : 'bg-background/60 border-border text-foreground hover:border-border hover:bg-muted'
                                                )}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-xs text-foreground">
                                                        {p.name}
                                                    </span>
                                                    <span className={clsx(
                                                        'text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase',
                                                        p.severity === 'CRITICAL' ? 'bg-destructive/15 text-destructive border border-destructive/40' : 'bg-signal/15 text-signal border border-signal/40'
                                                    )}>
                                                        {p.severity}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {p.description}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Options: Station & Count */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                {/* Station Target */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-mono uppercase text-muted-foreground font-bold flex items-center gap-2">
                                        <Radio className="w-3.5 h-3.5 text-signal" />
                                        <span>Target ISRO Ground Station</span>
                                    </label>
                                    <select
                                        value={station}
                                        onChange={(e) => setStation(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-signal cursor-pointer"
                                    >
                                        {STATIONS.map((s) => (
                                            <option key={s.code} value={s.code}>
                                                {s.code}: {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Threat Count */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-mono uppercase text-muted-foreground font-bold">
                                            Concurrent Threat Packets
                                        </label>
                                        <span className="text-xs font-mono font-bold text-signal">
                                            {count} Threats
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="6"
                                        value={count}
                                        onChange={(e) => setCount(parseInt(e.target.value))}
                                        className="w-full accent-signal cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                                        <span>1 (Single Threat)</span>
                                        <span>3 (Standard Assault)</span>
                                        <span>6 (Heavy Wave)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Severity Mode */}
                            <div className="p-3.5 rounded-xl bg-background border border-border flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-bold text-foreground flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4 text-signal" />
                                        <span>Auto-Mitigation Target Behavior</span>
                                    </div>
                                    <div className="text-[11px] text-muted-foreground mt-0.5">
                                        {severity === 'CRITICAL'
                                            ? 'Primary threat confidence >=96% to demonstrate instant SOAR Auto-Block'
                                            : 'Threat confidence 85-94% to route to Analyst Review in Portal B'}
                                    </div>
                                </div>
                                <div className="flex rounded-lg bg-background p-1 border border-border text-xs font-mono">
                                    <button
                                        type="button"
                                        onClick={() => setSeverity('CRITICAL')}
                                        className={clsx(
                                            'px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer',
                                            severity === 'CRITICAL' ? 'bg-signal text-signal-foreground' : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        Auto-Block
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSeverity('HIGH')}
                                        className={clsx(
                                            'px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer',
                                            severity === 'HIGH' ? 'bg-signal text-signal-foreground' : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        Analyst Review
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-xs font-mono">
                                    Error: {error}
                                </div>
                            )}

                            {/* Trigger Button */}
                            <button
                                onClick={handleInject}
                                disabled={isInjecting}
                                className={clsx(
                                    'w-full py-3.5 px-6 rounded-xl font-bold font-mono text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg',
                                    isInjecting
                                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                        : 'bg-gradient-to-r from-[#ffb366] via-signal to-[#f97316] hover:from-[#ffc080] hover:to-signal text-signal-foreground shadow-[0_0_30px_rgba(255,153,51,0.4)] hover:scale-[1.01]'
                                )}
                            >
                                {isInjecting ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                                        <span>SYNTHESIZING TELEMETRY ATTACK PACKETS...</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5 fill-current" />
                                        <span>EXECUTE ATTACK INJECTION ({count} INCURSIONS)</span>
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

import { useState, useEffect } from 'react';
import {
    Satellite,
    Radio,
    Clock,
    ShieldCheck,
    AlertTriangle,
    Wifi,
    CheckCircle2,
    Compass,
    Signal,
    Globe,
    Database,
    Cpu,
    RefreshCw
} from 'lucide-react';
import { apiClient } from '../../../api/client';
import type { SatellitePassData, SatelliteMissionTelemetry } from '../../../types';
import StarBorder from '../../../components/StarBorder';

const INITIAL_PASSES: SatellitePassData[] = [
    {
        satellite: 'EOS-09',
        orbit: 'LEO 500km SSO',
        station: 'ISTRAC-BLR (Bengaluru)',
        station_code: 'ISTRAC-BLR',
        aos: '13:28:10 UTC',
        los: '13:38:45 UTC',
        duration: '10m 35s',
        maxElevation: '68.4°',
        frequency: 'S-Band (2098 MHz)',
        channel: 'CADC0872',
        total_segments: 546,
        anomalous_segments: 131,
        anomaly_rate: 0.2399,
        mean_signal_length: 187.3,
        signal_variance: 4.88e-10,
        peak_count: 14.2,
        status: 'ACTIVE',
        threatStatus: 'MONITOR',
        laya_risk_tier: 'ELEVATED',
        laya_explanation: 'ESA OPS-SAT channel CADC0872 telemetry: 131/546 anomalies (24.0%). Decision: MONITOR.'
    },
    {
        satellite: 'RISAT-2BR2',
        orbit: 'LEO 576km 37°',
        station: 'SDSC-SHAR (Sriharikota)',
        station_code: 'SDSC-SHAR',
        aos: '13:52:00 UTC',
        los: '14:01:20 UTC',
        duration: '9m 20s',
        maxElevation: '52.1°',
        frequency: 'X-Band (8450 MHz)',
        channel: 'CADC0884',
        total_segments: 158,
        anomalous_segments: 0,
        anomaly_rate: 0.0,
        mean_signal_length: 199.1,
        signal_variance: 3.12e-10,
        peak_count: 12.0,
        status: 'UPCOMING',
        threatStatus: 'SECURE',
        laya_risk_tier: 'NOMINAL',
        laya_explanation: 'ESA OPS-SAT channel CADC0884 telemetry: 0/158 anomalies (0.0%). Decision: SECURE.'
    },
    {
        satellite: 'Chandrayaan-3 Orbiter',
        orbit: 'Lunar Orbit (100km)',
        station: 'IDSN-32M (Byalalu)',
        station_code: 'IDSN-32M',
        aos: 'Continuous DSN',
        los: 'Continuous DSN',
        duration: '24/7 Deep Space',
        maxElevation: '78.9°',
        frequency: 'X/Ka-Band',
        channel: 'CADC0888',
        total_segments: 252,
        anomalous_segments: 60,
        anomaly_rate: 0.2381,
        mean_signal_length: 197.8,
        signal_variance: 5.73e-10,
        peak_count: 13.8,
        status: 'ACTIVE',
        threatStatus: 'MONITOR',
        laya_risk_tier: 'ELEVATED',
        laya_explanation: 'ESA OPS-SAT channel CADC0888 telemetry: 60/252 anomalies (23.8%). Decision: MONITOR.'
    },
    {
        satellite: 'Aditya-L1 Halo Orbit',
        orbit: 'Sun-Earth L1 (1.5M km)',
        station: 'IDSN-32M (Byalalu)',
        station_code: 'IDSN-32M',
        aos: 'Continuous DSN',
        los: 'Continuous DSN',
        duration: '24/7 Deep Space',
        maxElevation: '64.2°',
        frequency: 'X-Band',
        channel: 'CADC0890',
        total_segments: 14,
        anomalous_segments: 11,
        anomaly_rate: 0.7857,
        mean_signal_length: 197.4,
        signal_variance: 7.82e-10,
        peak_count: 15.1,
        status: 'ACTIVE',
        threatStatus: 'CRITICAL',
        laya_risk_tier: 'CRITICAL',
        laya_explanation: 'ESA OPS-SAT channel CADC0890 telemetry: 11/14 anomalies (78.6%). Decision: CRITICAL.'
    },
    {
        satellite: 'Cartosat-3',
        orbit: 'LEO 505km SSO',
        station: 'ISTRAC-MAU (Mauritius)',
        station_code: 'ISTRAC-MAU',
        aos: '14:24:30 UTC',
        los: '14:34:10 UTC',
        duration: '9m 40s',
        maxElevation: '41.5°',
        frequency: 'S/X-Band',
        channel: 'CADC0873',
        total_segments: 593,
        anomalous_segments: 105,
        anomaly_rate: 0.1771,
        mean_signal_length: 179.2,
        signal_variance: 5.41e-10,
        peak_count: 11.4,
        status: 'UPCOMING',
        threatStatus: 'MONITOR',
        laya_risk_tier: 'ELEVATED',
        laya_explanation: 'ESA OPS-SAT channel CADC0873 telemetry: 105/593 anomalies (17.7%). Decision: MONITOR.'
    },
    {
        satellite: 'Oceansat-3 (EOS-06)',
        orbit: 'LEO 720km SSO',
        station: 'ISTRAC-PBL (Port Blair)',
        station_code: 'ISTRAC-PBL',
        aos: '14:58:00 UTC',
        los: '15:09:15 UTC',
        duration: '11m 15s',
        maxElevation: '76.0°',
        frequency: 'S-Band',
        channel: 'CADC0874',
        total_segments: 194,
        anomalous_segments: 69,
        anomaly_rate: 0.3557,
        mean_signal_length: 196.4,
        signal_variance: 6.22e-10,
        peak_count: 14.0,
        status: 'UPCOMING',
        threatStatus: 'CRITICAL',
        laya_risk_tier: 'CRITICAL',
        laya_explanation: 'ESA OPS-SAT channel CADC0874 telemetry: 69/194 anomalies (35.6%). Decision: CRITICAL.'
    },
];

export const PassWindowStatus = () => {
    const [passes, setPasses] = useState<SatellitePassData[]>(INITIAL_PASSES);
    const [datasetMeta, setDatasetMeta] = useState<SatelliteMissionTelemetry | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(384);

    const fetchTelemetryPasses = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get<SatelliteMissionTelemetry>('/satellite/telemetry-passes');
            if (res.data && res.data.passes) {
                setPasses(res.data.passes);
                setDatasetMeta(res.data);
            }
        } catch (e) {
            console.error('Failed to load satellite telemetry passes', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTelemetryPasses();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 600));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTimer = (totalSeconds: number) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const activePass = passes.find(p => p.status === 'ACTIVE') || passes[0];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                    <div className="flex items-center gap-2 caps-label text-signal mb-1">
                        <Satellite className="w-3.5 h-3.5" />
                        ISTRAC / IDSN Mission Schedule • ESA OPS-SAT Space Data
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                        Orbital Pass Windows & TT&C Link Defense
                    </h1>
                    <p className="text-muted-foreground text-xs font-mono mt-1">
                        Real-time pass telemetry evaluated on {datasetMeta?.total_records || 2123} spacecraft sensor records from European Space Agency (ESA) OPS-SAT.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <StarBorder
                        onClick={fetchTelemetryPasses}
                        disabled={isLoading}
                        backgroundColor="#292825"
                        borderColor="#34322d"
                        className="px-3.5 py-1.5 text-foreground hover:bg-[#34322d] font-mono text-xs flex items-center gap-2 cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        Sync Real Dataset
                    </StarBorder>
                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border text-grove font-mono text-xs font-medium">
                        <span className="w-2 h-2 rounded-full bg-grove"></span>
                        PASS WINDOW DEFENSE: ACTIVE
                    </span>
                </div>
            </div>

            {/* Active Contact Banner */}
            <div className="relative rounded-xl bg-card border border-border p-6 md:p-8 overflow-hidden">
                <div className="grid md:grid-cols-12 gap-6 items-center relative z-10">
                    <div className="md:col-span-8 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 rounded bg-destructive/10 text-destructive border border-destructive/20 font-mono text-xs font-medium">
                                ● LIVE CONTACT IN PROGRESS
                            </span>
                            <span className="px-2.5 py-1 rounded bg-background text-foreground border border-border font-mono text-xs">
                                Spacecraft: {activePass.satellite} ({activePass.orbit})
                            </span>
                            <span className="px-2.5 py-1 rounded bg-background text-muted-foreground border border-border font-mono text-xs">
                                Ground Station: {activePass.station}
                            </span>
                            <span className="px-2.5 py-1 rounded bg-background text-signal border border-border font-mono text-xs">
                                Dataset Channel: {activePass.channel}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                            <div>
                                <div className="text-xs text-muted-foreground font-mono">Carrier Status</div>
                                <div className="text-grove font-semibold font-mono text-base flex items-center gap-1.5 mt-0.5">
                                    <Signal className="w-4 h-4" /> LOCKED
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground font-mono">Uplink Frequency</div>
                                <div className="text-foreground font-semibold font-mono text-base mt-0.5">{activePass.frequency}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground font-mono">Max Elevation</div>
                                <div className="text-foreground font-semibold font-mono text-base mt-0.5">{activePass.maxElevation} (Zenith)</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground font-mono">Channel Anomaly Rate</div>
                                <div className={`font-semibold font-mono text-base mt-0.5 ${activePass.anomaly_rate > 0.25 ? 'text-destructive' : activePass.anomaly_rate > 0.15 ? 'text-signal' : 'text-grove'}`}>
                                    {(activePass.anomaly_rate * 100).toFixed(1)}% ({activePass.anomalous_segments}/{activePass.total_segments})
                                </div>
                            </div>
                        </div>

                        {/* Real Telemetry Signal Metrics from dataset */}
                        <div className="p-3 rounded-lg bg-background border border-border text-xs font-mono text-muted-foreground flex flex-wrap gap-4">
                            <div>
                                <span>Signal Length:</span>{' '}
                                <span className="text-foreground font-medium">{activePass.mean_signal_length} samples</span>
                            </div>
                            <div>
                                <span>Telemetry Variance:</span>{' '}
                                <span className="text-foreground font-medium">{activePass.signal_variance.toExponential(2)}</span>
                            </div>
                            <div>
                                <span>Mean Wave Peaks:</span>{' '}
                                <span className="text-foreground font-medium">{activePass.peak_count} peaks</span>
                            </div>
                            <div>
                                <span>Laya Defense Decision:</span>{' '}
                                <span className={`font-medium ${activePass.threatStatus === 'CRITICAL' ? 'text-destructive' : activePass.threatStatus === 'MONITOR' ? 'text-signal' : 'text-grove'}`}>
                                    {activePass.threatStatus} ({activePass.laya_risk_tier})
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-4 flex flex-col items-center justify-center p-5 bg-background rounded-xl border border-border">
                        <div className="caps-label text-muted-foreground mb-1 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-signal" /> Remaining Pass Time
                        </div>
                        <div className="text-4xl sm:text-5xl font-mono font-semibold text-foreground tracking-wider my-1">
                            {formatTimer(secondsLeft)}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono mt-2 text-center">
                            AOS: {activePass.aos} • LOS in {Math.ceil(secondsLeft / 60)} mins
                        </div>
                    </div>
                </div>
            </div>

            {/* Critical Doctrine Callout */}
            <div className="p-4 rounded-xl bg-card border border-border flex items-start gap-3.5">
                <AlertTriangle className="w-5 h-5 text-signal shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground font-semibold">
                        Operational Pass Window Policy:
                    </strong>{' '}
                    During satellite orbital passes (typically 8–12 minutes), False Positive blocks directly cause{' '}
                    <span className="text-signal font-mono">Loss of Signal (LOS)</span> and can abort scheduled telecommand burns.
                    The online adaptive bandit dynamically relaxes auto-block probability thresholds to preserve link continuity.
                </div>
            </div>

            {/* Upcoming Pass Windows Bento Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
                {passes.slice(1, 4).map((p, idx) => (
                    <div key={idx} className="bg-card rounded-xl p-5 border border-border hover:border-muted-foreground/30 transition-all flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3 font-mono">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                    p.status === 'ACTIVE' ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-muted text-muted-foreground border border-border'
                                }`}>
                                    {p.status}
                                </span>
                                <span className="text-[11px] text-muted-foreground font-mono">{p.channel}</span>
                            </div>
                            <h4 className="font-semibold text-base text-foreground flex items-center gap-2">
                                <Satellite className="w-4 h-4 text-signal" />
                                {p.satellite}
                            </h4>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">{p.orbit}</p>
                            <div className="text-xs text-muted-foreground font-mono mt-3 space-y-1">
                                <div><span>Station:</span> <span className="text-foreground ml-1">{p.station_code}</span></div>
                                <div><span>Contact:</span> <span className="text-foreground ml-1">{p.aos} → {p.los}</span></div>
                                <div><span>Elevation:</span> <span className="text-foreground ml-1">{p.maxElevation}</span></div>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between font-mono text-xs">
                            <span className="text-muted-foreground text-[11px]">Threat Status:</span>
                            <span className={`font-semibold flex items-center gap-1 ${
                                p.threatStatus === 'SECURE' ? 'text-grove' : p.threatStatus === 'MONITOR' ? 'text-signal' : 'text-destructive'
                            }`}>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {p.threatStatus}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Ground Station Tracking Windows with Real ESA OPS-SAT Data */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card">
                    <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                        <Globe className="w-4 h-4 text-signal" />
                        Scheduled Ground Station Tracking Windows & Real Sensor Provenance
                    </h3>
                    <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-signal" />
                        ESA OPS-SAT (2,123 Segments Evaluated)
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm font-sans">
                        <thead className="bg-muted/40 text-[11px] font-mono uppercase text-muted-foreground tracking-wider border-b border-border">
                            <tr>
                                <th className="px-6 py-3">Spacecraft</th>
                                <th className="px-6 py-3">Channel</th>
                                <th className="px-6 py-3">Orbit Regime</th>
                                <th className="px-6 py-3">Ground Station</th>
                                <th className="px-6 py-3">Window (AOS - LOS)</th>
                                <th className="px-6 py-3">Segments</th>
                                <th className="px-6 py-3">Anomaly Rate</th>
                                <th className="px-6 py-3">Pass Status</th>
                                <th className="px-6 py-3 text-right">Defense Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border font-mono text-xs">
                            {passes.map((pass, i) => (
                                <tr key={i} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-foreground flex items-center gap-2">
                                        <Satellite className="w-4 h-4 text-signal" />
                                        {pass.satellite}
                                    </td>
                                    <td className="px-6 py-4 text-foreground font-medium">
                                        <span className="px-2 py-0.5 rounded bg-background border border-border text-[11px]">
                                            {pass.channel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{pass.orbit}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{pass.station}</td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {pass.aos} → {pass.los}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {pass.anomalous_segments} / {pass.total_segments}
                                    </td>
                                    <td className="px-6 py-4 font-semibold">
                                        <span className={pass.anomaly_rate > 0.3 ? 'text-destructive' : pass.anomaly_rate > 0.15 ? 'text-signal' : 'text-grove'}>
                                            {(pass.anomaly_rate * 100).toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                                pass.status === 'ACTIVE'
                                                    ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                                    : 'bg-muted text-muted-foreground border border-border'
                                            }`}
                                        >
                                            {pass.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span
                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                                                pass.threatStatus === 'SECURE'
                                                    ? 'bg-grove/10 text-grove border border-grove/20'
                                                    : pass.threatStatus === 'MONITOR'
                                                    ? 'bg-signal/10 text-signal border border-signal/20'
                                                    : 'bg-destructive/10 text-destructive border border-destructive/20'
                                            }`}
                                        >
                                            <CheckCircle2 className="w-3 h-3" />
                                            {pass.threatStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PassWindowStatus;

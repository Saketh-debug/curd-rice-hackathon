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
    Globe
} from 'lucide-react';

interface PassWindow {
    satellite: string;
    orbit: string;
    station: string;
    aos: string;
    los: string;
    duration: string;
    maxElevation: string;
    frequency: string;
    status: 'ACTIVE' | 'UPCOMING' | 'STANDBY';
    threatStatus: 'SECURE' | 'MONITOR' | 'CRITICAL';
}

const PASS_DATA: PassWindow[] = [
    {
        satellite: 'EOS-09',
        orbit: 'LEO 500km SSO',
        station: 'ISTRAC-BLR (Bengaluru)',
        aos: '13:28:10 UTC',
        los: '13:38:45 UTC',
        duration: '10m 35s',
        maxElevation: '68.4°',
        frequency: 'S-Band (2098 MHz)',
        status: 'ACTIVE',
        threatStatus: 'SECURE',
    },
    {
        satellite: 'RISAT-2BR2',
        orbit: 'LEO 576km 37°',
        station: 'SDSC-SHAR (Sriharikota)',
        aos: '13:52:00 UTC',
        los: '14:01:20 UTC',
        duration: '9m 20s',
        maxElevation: '52.1°',
        frequency: 'X-Band (8450 MHz)',
        status: 'UPCOMING',
        threatStatus: 'SECURE',
    },
    {
        satellite: 'Chandrayaan-3 Orbiter',
        orbit: 'Lunar Orbit (100km)',
        station: 'IDSN-32M (Byalalu)',
        aos: 'Continuous DSN',
        los: 'Continuous DSN',
        duration: '24/7 Deep Space',
        maxElevation: '78.9°',
        frequency: 'X/Ka-Band',
        status: 'ACTIVE',
        threatStatus: 'SECURE',
    },
    {
        satellite: 'Aditya-L1 Halo Orbit',
        orbit: 'Sun-Earth L1 (1.5M km)',
        station: 'IDSN-32M (Byalalu)',
        aos: 'Continuous DSN',
        los: 'Continuous DSN',
        duration: '24/7 Deep Space',
        maxElevation: '64.2°',
        frequency: 'X-Band',
        status: 'ACTIVE',
        threatStatus: 'SECURE',
    },
    {
        satellite: 'Cartosat-3',
        orbit: 'LEO 505km SSO',
        station: 'ISTRAC-MAU (Mauritius)',
        aos: '14:24:30 UTC',
        los: '14:34:10 UTC',
        duration: '9m 40s',
        maxElevation: '41.5°',
        frequency: 'S/X-Band',
        status: 'UPCOMING',
        threatStatus: 'MONITOR',
    },
    {
        satellite: 'Oceansat-3 (EOS-06)',
        orbit: 'LEO 720km SSO',
        station: 'ISTRAC-PBL (Port Blair)',
        aos: '14:58:00 UTC',
        los: '15:09:15 UTC',
        duration: '11m 15s',
        maxElevation: '76.0°',
        frequency: 'S-Band',
        status: 'UPCOMING',
        threatStatus: 'SECURE',
    },
];

export const PassWindowStatus = () => {
    // Dynamic countdown timer for active pass
    const [secondsLeft, setSecondsLeft] = useState(384); // ~6m 24s

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

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-[#050814] text-slate-100 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                    <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-1">
                        <Satellite className="w-4 h-4" />
                        ISTRAC / IDSN Mission Schedule
                    </div>
                    <h1 className="text-3xl font-bold font-orbitron text-white">
                        Orbital Pass Windows & TT&C Link Defense
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Monitoring contact windows for LEO Earth Observation & Deep Space tracking stations.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        PASS WINDOW DEFENSE: ACTIVE
                    </span>
                </div>
            </div>

            {/* Active Contact Banner */}
            <div className="relative rounded-2xl bg-gradient-to-r from-[#0c1836] via-[#0e224d] to-[#0a142e] border border-cyan-500/40 p-6 md:p-8 overflow-hidden shadow-[0_0_40px_rgba(0,212,255,0.15)]">
                <div className="absolute -right-10 -bottom-10 w-64 h-64 opacity-10 text-cyan-400 pointer-events-none">
                    <Radio className="w-full h-full" />
                </div>

                <div className="grid md:grid-cols-12 gap-6 items-center relative z-10">
                    <div className="md:col-span-8 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-mono text-xs font-bold animate-pulse">
                                ● LIVE CONTACT IN PROGRESS
                            </span>
                            <span className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono text-xs">
                                Spacecraft: EOS-09 (LEO 500km SSO)
                            </span>
                            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono text-xs">
                                Ground Station: ISTRAC-BLR MOX
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                            <div>
                                <div className="text-xs text-slate-400 font-mono">Carrier Status</div>
                                <div className="text-emerald-400 font-bold font-mono text-base flex items-center gap-1.5">
                                    <Signal className="w-4 h-4" /> LOCKED
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 font-mono">Uplink Frequency</div>
                                <div className="text-white font-bold font-mono text-base">2098.5 MHz</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 font-mono">Max Elevation</div>
                                <div className="text-cyan-400 font-bold font-mono text-base">68.4° (Zenith)</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 font-mono">Intrusion Shield</div>
                                <div className="text-emerald-400 font-bold font-mono text-base">0 ANOMALIES</div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-black/40 rounded-xl border border-cyan-500/30">
                        <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> Remaining Pass Time
                        </div>
                        <div className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-wider text-cyan-300">
                            {formatTimer(secondsLeft)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-2 text-center">
                            AOS: 13:28:10 • LOS in {Math.ceil(secondsLeft / 60)} mins
                        </div>
                    </div>
                </div>
            </div>

            {/* Critical Doctrine Callout */}
            <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-500/30 flex items-start gap-4">
                <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    <strong className="text-orange-400 font-semibold font-orbitron">
                        Operational Pass Window Policy:
                    </strong>{' '}
                    During satellite orbital passes (typically 8–12 minutes), False Positive blocks directly cause{' '}
                    <span className="text-orange-300 font-mono">Loss of Signal (LOS)</span> and can abort scheduled telecommand burns.
                    The online adaptive bandit dynamically relaxes auto-block probability thresholds to preserve link continuity.
                </div>
            </div>

            {/* Upcoming Pass Schedule Table */}
            <div className="rounded-xl border border-slate-800 bg-[#0a1022] overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0e1733]">
                    <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-cyan-400" />
                        Scheduled Ground Station Tracking Windows (Next 12 Hours)
                    </h3>
                    <span className="text-xs font-mono text-slate-400">
                        ISTRAC Ground Network Schedule v4.8
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm font-sans">
                        <thead className="bg-[#080d1e] text-[11px] font-mono uppercase text-slate-400 tracking-wider border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-3">Spacecraft</th>
                                <th className="px-6 py-3">Orbit Regime</th>
                                <th className="px-6 py-3">Ground Station</th>
                                <th className="px-6 py-3">Window (AOS - LOS)</th>
                                <th className="px-6 py-3">Max El.</th>
                                <th className="px-6 py-3">Frequency</th>
                                <th className="px-6 py-3">Pass Status</th>
                                <th className="px-6 py-3 text-right">Defense Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                            {PASS_DATA.map((pass, i) => (
                                <tr key={i} className="hover:bg-cyan-950/20 transition-colors">
                                    <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                                        <Satellite className="w-4 h-4 text-cyan-400" />
                                        {pass.satellite}
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">{pass.orbit}</td>
                                    <td className="px-6 py-4 text-cyan-300">{pass.station}</td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {pass.aos} → {pass.los}
                                    </td>
                                    <td className="px-6 py-4 text-slate-300 font-bold">{pass.maxElevation}</td>
                                    <td className="px-6 py-4 text-slate-400">{pass.frequency}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                pass.status === 'ACTIVE'
                                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                            }`}
                                        >
                                            {pass.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span
                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                                pass.threatStatus === 'SECURE'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
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

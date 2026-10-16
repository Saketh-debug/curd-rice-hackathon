import { useRef } from 'react';
import { useLiveTraffic } from '../../../hooks/useLiveTraffic';
import clsx from 'clsx';
import { Satellite, Radio, Terminal, Shield, CheckCircle2 } from 'lucide-react';

const mapSpaceThreatName = (type: string) => {
    if (type.includes('DDoS')) return 'TT&C Uplink Saturation';
    if (type.includes('DoS')) return 'TT&C Gateway Flood';
    if (type.includes('Brute')) return 'TC Authentication Bypass';
    if (type.includes('Port')) return 'SLE Service Reconnaissance';
    if (type.includes('Bot')) return 'Ground RTU / Sensor Hijack';
    if (type.includes('Web')) return 'Mission Data Distribution Exploit';
    if (type.includes('Normal')) return 'Routine Housekeeping Telemetry';
    return type;
};

export const EventStream = () => {
    const { traffic } = useLiveTraffic();
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-[#050814] relative font-mono h-full text-slate-200">
            {/* Toolbar */}
            <div className="h-14 border-b border-slate-800 bg-[#080d1e] flex items-center justify-between px-6 flex-shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <Satellite className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold font-orbitron text-white tracking-wide">
                        Telemetry Event Stream — ISTRAC Ground Segment Engine
                    </span>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800">
                        52 Features Offline Ingestion
                    </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[11px] text-emerald-400 font-bold">RECEIVING FLOW STREAM...</span>
                </div>
            </div>

            {/* Terminal Window */}
            <div className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col">
                <div className="flex-1 bg-[#070b16] rounded-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col relative text-xs">
                    {/* Header */}
                    <div className="h-9 bg-[#0b1226] border-b border-slate-800 flex items-center px-4 justify-between select-none shrink-0">
                        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                            <span>istrac-stream-ids @ mox-console:~$</span>
                        </div>
                        <div className="text-[10px] text-cyan-400 font-medium">
                            Air-Gapped Flow Replay • Port 8000 Stream
                        </div>
                    </div>

                    {/* Columns */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-[#0d162e] border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10 shrink-0">
                        <div className="col-span-2">MET / Time (UTC)</div>
                        <div className="col-span-1">Flow ID</div>
                        <div className="col-span-4">Space Threat Classification</div>
                        <div className="col-span-2">ML Confidence</div>
                        <div className="col-span-3 text-right">Mission Response</div>
                    </div>

                    {/* Stream Content */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 relative" ref={scrollRef}>
                        <div className="absolute inset-0 scanlines opacity-10 pointer-events-none z-0"></div>

                        {traffic.map((packet, idx) => {
                            const spaceName = mapSpaceThreatName(packet.type);
                            const isNormal = packet.type === 'Normal Traffic';

                            return (
                                <div key={packet.id} className={clsx(
                                    "grid grid-cols-12 gap-4 px-3 py-2 rounded-lg border-l-2 transition-colors cursor-default group items-center relative z-10 text-[11px]",
                                    idx === 0 ? "bg-cyan-500/5 border-cyan-400" : "hover:bg-slate-800/40 border-transparent hover:border-slate-700",
                                    idx > 12 ? "opacity-60" : "opacity-100"
                                )}>
                                    <div className="col-span-2 text-slate-400">
                                        {new Date(packet.timestamp).toTimeString().split(' ')[0]}
                                    </div>
                                    <div className="col-span-1 text-slate-500 font-bold">
                                        #{packet.id}
                                    </div>
                                    <div className="col-span-4 flex items-center gap-2 truncate">
                                        <span className={clsx("w-2 h-2 rounded-full shrink-0", isNormal ? "bg-emerald-400" : "bg-red-500 animate-pulse")}></span>
                                        <span className={clsx("font-bold truncate", isNormal ? "text-emerald-300" : "text-red-400")}>
                                            {spaceName}
                                        </span>
                                    </div>
                                    <div className="col-span-2 flex items-center gap-2">
                                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={clsx("h-full", isNormal ? "bg-emerald-400" : packet.confidence > 0.9 ? "bg-red-400" : "bg-orange-400")}
                                                style={{ width: `${Math.round(packet.confidence * 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className={clsx("font-bold", isNormal ? "text-emerald-400" : "text-white")}>
                                            {Math.round(packet.confidence * 100)}%
                                        </span>
                                    </div>
                                    <div className="col-span-3 text-right">
                                        <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border",
                                            packet.action === 'AUTO_BLOCKED' ? "bg-red-500/10 text-red-400 border-red-500/30" :
                                                packet.action === 'MONITOR' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                                                    "bg-orange-500/10 text-orange-400 border-orange-500/30"
                                        )}>
                                            {packet.action === 'AUTO_BLOCKED' ? 'AUTO-NEUTRALIZED' : packet.action === 'MONITOR' ? 'NOMINAL' : 'MISSION REVIEW'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {traffic.length === 0 && (
                            <div className="text-slate-500 text-center py-10 font-mono">
                                Synchronizing ground station telemetry stream...
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="h-7 bg-[#0b1226] border-t border-slate-800 flex items-center justify-between px-3 text-[10px] text-slate-400 font-mono shrink-0">
                        <div className="flex gap-4">
                            <span>GROUND_NODE: ISTRAC-BLR</span>
                            <span>FLOW_SCHEMA: 52_ATTRIBUTES</span>
                            <span className="text-emerald-400">TELEMETRY_SYNC: LOCKED</span>
                        </div>
                        <div className="text-slate-500">
                            ZERO LIVE PACKET PROBING
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventStream;

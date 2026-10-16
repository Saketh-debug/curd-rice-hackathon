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
        <div className="flex-1 flex flex-col min-w-0 bg-background relative font-mono h-[calc(100vh-65px)] text-foreground">
            {/* Toolbar */}
            <div className="h-14 border-b border-border bg-card flex items-center justify-between px-6 flex-shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <Satellite className="w-4 h-4 text-signal" />
                    <span className="text-xs font-semibold text-foreground tracking-wide">
                        Telemetry Event Stream — ISTRAC Ground Segment Engine
                    </span>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] bg-muted text-muted-foreground border border-border">
                        52 Features Offline Ingestion
                    </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-grove"></span>
                    <span className="text-[11px] text-grove font-semibold">RECEIVING FLOW STREAM...</span>
                </div>
            </div>

            {/* Terminal Window */}
            <div className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col">
                <div className="flex-1 bg-card rounded-xl border border-border shadow-xl overflow-hidden flex flex-col relative text-xs">
                    {/* Header */}
                    <div className="h-9 bg-muted/60 border-b border-border flex items-center px-4 justify-between select-none shrink-0">
                        <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                            <Terminal className="w-3.5 h-3.5 text-signal" />
                            <span>istrac-stream-ids @ mox-console:~$</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                            Air-Gapped Flow Replay • Port 8000 Stream
                        </div>
                    </div>

                    {/* Columns */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-muted/30 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 z-10 shrink-0">
                        <div className="col-span-2">MET / Time (UTC)</div>
                        <div className="col-span-1">Flow ID</div>
                        <div className="col-span-4">Space Threat Classification</div>
                        <div className="col-span-2">ML Confidence</div>
                        <div className="col-span-3 text-right">Mission Response</div>
                    </div>

                    {/* Stream Content */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 relative" ref={scrollRef}>
                        {traffic.map((packet, idx) => {
                            const spaceName = mapSpaceThreatName(packet.type);
                            const isNormal = packet.type === 'Normal Traffic';

                            return (
                                <div key={packet.id} className={clsx(
                                    "grid grid-cols-12 gap-4 px-3 py-2 rounded-lg border-l-2 transition-colors cursor-default group items-center relative z-10 text-[11px]",
                                    idx === 0 ? "bg-signal/5 border-signal" : "hover:bg-muted/40 border-transparent hover:border-border",
                                    idx > 12 ? "opacity-60" : "opacity-100"
                                )}>
                                    <div className="col-span-2 text-muted-foreground">
                                        {new Date(packet.timestamp).toTimeString().split(' ')[0]}
                                    </div>
                                    <div className="col-span-1 text-muted-foreground font-medium">
                                        #{packet.id}
                                    </div>
                                    <div className="col-span-4 flex items-center gap-2 truncate">
                                        <span className={clsx("w-2 h-2 rounded-full shrink-0", isNormal ? "bg-grove" : "bg-destructive")}></span>
                                        <span className={clsx("font-medium truncate", isNormal ? "text-foreground" : "text-destructive")}>
                                            {spaceName}
                                        </span>
                                    </div>
                                    <div className="col-span-2 flex items-center gap-2">
                                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={clsx("h-full", isNormal ? "bg-grove" : packet.confidence > 0.9 ? "bg-destructive" : "bg-signal")}
                                                style={{ width: `${Math.round(packet.confidence * 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className={clsx("font-medium", isNormal ? "text-grove" : "text-foreground")}>
                                            {Math.round(packet.confidence * 100)}%
                                        </span>
                                    </div>
                                    <div className="col-span-3 text-right">
                                        <span className={clsx("px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wide border",
                                            packet.action === 'AUTO_BLOCKED' ? "bg-destructive/10 text-destructive border-destructive/20" :
                                                packet.action === 'MONITOR' ? "bg-grove/10 text-grove border border-grove/20" :
                                                    "bg-signal/10 text-signal border border-signal/20"
                                        )}>
                                            {packet.action === 'AUTO_BLOCKED' ? 'AUTO-NEUTRALIZED' : packet.action === 'MONITOR' ? 'NOMINAL' : 'MISSION REVIEW'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {traffic.length === 0 && (
                            <div className="text-muted-foreground text-center py-10 font-mono">
                                Synchronizing ground station telemetry stream...
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="h-7 bg-muted/50 border-t border-border flex items-center justify-between px-4 text-[11px] text-muted-foreground font-mono shrink-0">
                        <div className="flex gap-4">
                            <span>GROUND_NODE: ISTRAC-BLR</span>
                            <span>FLOW_SCHEMA: 52_ATTRIBUTES</span>
                            <span className="text-grove">TELEMETRY_SYNC: LOCKED</span>
                        </div>
                        <div className="text-muted-foreground">
                            ZERO LIVE PACKET PROBING
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventStream;

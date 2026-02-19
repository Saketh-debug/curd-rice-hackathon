
import { useState, useEffect, Fragment, useMemo } from 'react';
import { useSystemHealth } from '../../../hooks/useSystemHealth';
import { useLiveTraffic } from '../../../hooks/useLiveTraffic';
import type { LatLngExpression } from 'leaflet';

import {
    MapContainer,
    TileLayer,
    Polyline,
    CircleMarker,
    ZoomControl,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

/* ================= Attack Colors ================= */

const attackColors: Record<string, string> = {
    ddos: "#ef4444",
    dos: "#f97316",
    brute: "#06b6d4",
    bot: "#d946ef",
};

const getAttackColor = (type: string = "") => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('ddos')) return attackColors.ddos;
    if (lowerType.includes('dos')) return attackColors.dos;
    if (lowerType.includes('brute')) return attackColors.brute;
    if (lowerType.includes('bot')) return attackColors.bot;
    return "#ef4444";
};

/* ================= Curve Generator ================= */

function generateCurve(
    from: [number, number],
    to: [number, number],
    points = 80
): LatLngExpression[] {
    const curve: LatLngExpression[] = [];

    const distance = Math.sqrt(
        Math.pow(to[0] - from[0], 2) +
        Math.pow(to[1] - from[1], 2)
    );

    const lift = distance * 0.3;

    const midLat = (from[0] + to[0]) / 2 + lift;
    const midLng = (from[1] + to[1]) / 2;

    for (let i = 0; i <= points; i++) {
        const t = i / points;

        const lat =
            (1 - t) * (1 - t) * from[0] +
            2 * (1 - t) * t * midLat +
            t * t * to[0];

        const lng =
            (1 - t) * (1 - t) * from[1] +
            2 * (1 - t) * t * midLng +
            t * t * to[1];

        curve.push([lat, lng]);
    }

    return curve;
}

/* ================= Moving Dot ================= */

interface TravelingDotProps {
    path: LatLngExpression[];
    color: string;
}

function TravelingDot({ path, color }: TravelingDotProps) {
    const [position, setPosition] = useState(0);

    useEffect(() => {
        let frame: number;
        const animate = () => {
            setPosition(prev => (prev + 0.5) % path.length);
            frame = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(frame);
    }, [path.length]);

    const index = Math.floor(position);
    const currentPos = path[index];
    if (!currentPos) return null;

    return (
        <Fragment>
            <CircleMarker
                center={currentPos}
                radius={10}
                pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.2,
                    weight: 0,
                }}
            />
            <CircleMarker
                center={currentPos}
                radius={4}
                pathOptions={{
                    color: "#ffffff",
                    fillColor: color,
                    fillOpacity: 1,
                    weight: 1,
                }}
            />
        </Fragment>
    );
}

/* ================= MAIN COMPONENT ================= */

const ThreatMap = () => {
    const { health } = useSystemHealth();
    const { traffic } = useLiveTraffic();
    const [selectedFilter, setSelectedFilter] = useState('all');

    const allThreats = useMemo(() =>
        traffic.filter(p => p.type !== 'Normal Traffic'),
        [traffic]);

    const threats = useMemo(() => {
        if (selectedFilter === 'all') return allThreats;
        return allThreats.filter(t => t.type?.toLowerCase()?.includes(selectedFilter) ?? false);
    }, [allThreats, selectedFilter]);

    const filters = [
        { id: 'all', label: 'All Attacks', color: '#94a3b8' },
        { id: 'ddos', label: 'DDoS', color: attackColors.ddos },
        { id: 'dos', label: 'DoS', color: attackColors.dos },
        { id: 'brute', label: 'Brute Force', color: attackColors.brute },
        { id: 'bot', label: 'Bot Attacks', color: attackColors.bot },
    ];

    return (
        <div className="relative h-full w-full bg-background-dark overflow-hidden flex flex-col">

            {/* ================= MAP ================= */}
            <div className="absolute inset-0">
                <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    minZoom={2}
                    maxBounds={[[-90, -180], [90, 180]]}
                    className="h-full w-full"
                    style={{ height: "100%", width: "100%", background: "#0f172a" }}
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        noWrap={true}
                    />
                    <ZoomControl position="bottomleft" />
                    {threats.map((threat) => {

                        const from: [number, number] = [threat.lat, threat.lon];
                        const to: [number, number] = [37.0902, -95.7129];

                        const curvePath = generateCurve(from, to);

                        const color = getAttackColor(threat.type);

                        return (
                            <Fragment key={threat.id}>
                                <Polyline
                                    positions={curvePath}
                                    pathOptions={{ color, weight: 2, opacity: 0.3 }}
                                />

                                <Polyline
                                    positions={curvePath}
                                    pathOptions={{
                                        color,
                                        weight: 3,
                                        dashArray: "10, 15",
                                    }}
                                    className="animate-[dash_3s_linear_infinite]"
                                />

                                <TravelingDot path={curvePath} color={color} />

                                <CircleMarker
                                    center={from}
                                    radius={6}
                                    pathOptions={{
                                        color,
                                        fillColor: color,
                                        fillOpacity: 0.4,
                                    }}
                                />

                                <CircleMarker
                                    center={to}
                                    radius={6}
                                    pathOptions={{
                                        color,
                                        fillColor: color,
                                        fillOpacity: 0.4,
                                    }}
                                />
                            </Fragment>
                        );
                    })}
                </MapContainer>
            </div>

            {/* ================= HEADER ================= */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-[500] pointer-events-none">

                <div className="pointer-events-auto">
                    <h1 className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-1">
                        Global Threat Vector
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full animate-pulse ${health?.status === 'HEALTHY' ? 'bg-emerald-500' : 'bg-red-500'
                            }`}></span>
                        <h2 className="text-xl font-bold text-white tracking-tight">
                            Portal A Operations
                        </h2>
                    </div>
                </div>

                <div className="hidden lg:flex gap-4 pointer-events-auto">
                    <div className="bg-surface-dark/70 backdrop-blur-xl border border-slate-700/50 px-4 py-2 rounded-xl flex flex-col items-center min-w-[120px] shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400">
                            Events / Sec
                        </span>
                        <span className="text-lg font-bold text-white font-mono">
                            {health?.events_per_second?.toLocaleString() || '...'}
                        </span>
                    </div>

                    <div className="bg-surface-dark/70 backdrop-blur-xl border border-slate-700/50 px-4 py-2 rounded-xl flex flex-col items-center min-w-[120px] border-l-2 border-l-primary shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400">
                            Auto-Blocked
                        </span>
                        <span className="text-lg font-bold text-primary font-mono">
                            {health?.automation_rate || '99.9%'}
                        </span>
                    </div>
                </div>
            </div>

            {/* ================= ATTACK FILTER PORTAL ================= */}
            <div className="absolute bottom-8 right-8 w-64 bg-surface-dark/70 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 z-[500] shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
                    Live Vector Filter
                    <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                        {threats.length} ACTIVE
                    </span>
                </h3>

                <div className="space-y-2">
                    {filters.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setSelectedFilter(f.id)}
                            className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200 text-xs font-medium border ${selectedFilter === f.id
                                ? "bg-white/10 border-white/20 text-white"
                                : "bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: f.color }}
                                />
                                {f.label}
                            </div>
                            {selectedFilter === f.id && (
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default ThreatMap;

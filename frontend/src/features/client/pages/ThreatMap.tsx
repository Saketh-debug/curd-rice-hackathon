import { useState, Fragment, useMemo, useEffect } from 'react';
import { useSystemHealth } from '../../../hooks/useSystemHealth';
import { useLiveTraffic } from '../../../hooks/useLiveTraffic';
import type { Packet } from '../../../types';
import type { LatLngExpression } from 'leaflet';
import {
    MapContainer,
    TileLayer,
    Polyline,
    CircleMarker,
    Tooltip,
    ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Shield, Globe, Map as MapIcon, Activity, Radio } from 'lucide-react';
import ThreatGlobe3D, { ISRO_GROUND_STATIONS, ATTACK_COLORS, ATTACK_ORIGIN_COUNTRIES } from '../components/ThreatGlobe3D';

/* ================= Attack Colors for 2D Fallback ================= */
const getAttackColor = (type: string = "") => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('ddos')) return ATTACK_COLORS.ddos;
    if (lowerType.includes('dos')) return ATTACK_COLORS.dos;
    if (lowerType.includes('brute')) return ATTACK_COLORS.brute;
    if (lowerType.includes('bot')) return ATTACK_COLORS.bot;
    if (lowerType.includes('scan') || lowerType.includes('port')) return ATTACK_COLORS.port;
    if (lowerType.includes('web')) return ATTACK_COLORS.web;
    return ATTACK_COLORS.default;
};

/* ================= 2D Curve Generator ================= */
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

    const lift = distance * 0.28;

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

/* ================= Moving Dot along Orbit Track for 2D ================= */
interface TravelingDotProps {
    path: LatLngExpression[];
    color: string;
}

function TravelingDot({ path, color }: TravelingDotProps) {
    const [position, setPosition] = useState(0);

    useEffect(() => {
        let frame: number;
        const animate = () => {
            // Slow smooth movement: ~0.15 steps per frame instead of 0.5
            setPosition(prev => (prev + 0.15) % path.length);
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
                radius={4}
                pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.25,
                    weight: 0,
                }}
            />
            <CircleMarker
                center={currentPos}
                radius={2}
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
export const ThreatMap = () => {
    const { health } = useSystemHealth();
    const { traffic, loading } = useLiveTraffic();
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
    const [selectedThreat, setSelectedThreat] = useState<Packet | null>(null);

    const allThreats = useMemo(() =>
        traffic.filter(p => p.type !== 'Normal Traffic'),
        [traffic]);

    const threats = useMemo(() => {
        if (selectedFilter === 'all') return allThreats;
        return allThreats.filter(t => t.type?.toLowerCase()?.includes(selectedFilter) ?? false);
    }, [allThreats, selectedFilter]);

    const filters = [
        { id: 'all', label: 'All Space Vectors', color: '#94a3b8' },
        { id: 'ddos', label: 'TT&C Uplink Saturation', color: ATTACK_COLORS.ddos },
        { id: 'dos', label: 'Gateway Flow Flood', color: ATTACK_COLORS.dos },
        { id: 'brute', label: 'TC Authentication Bypass', color: ATTACK_COLORS.brute },
        { id: 'bot', label: 'Sensor / RTU Hijack', color: ATTACK_COLORS.bot },
        { id: 'port', label: 'RF Frequency Sweep', color: ATTACK_COLORS.port },
        { id: 'web', label: 'Downlink Web Portal Exploit', color: ATTACK_COLORS.web },
    ];

    return (
        <div className="relative w-full h-full min-h-screen overflow-hidden flex flex-col font-sans bg-[#030712]">

            {/* ================= VISUALIZATION CANVAS (3D GLOBE OR 2D MAP) ================= */}
            <div className="absolute inset-0 w-full h-full">
                {viewMode === '3d' ? (
                    <ThreatGlobe3D
                        threats={threats}
                        selectedThreat={selectedThreat}
                        onSelectThreat={setSelectedThreat}
                        className="w-full h-full"
                    />
                ) : (
                    /* 2D Leaflet Fallback */
                    <MapContainer
                        center={[20.5937, 78.9629]}
                        zoom={5}
                        minZoom={3}
                        className="h-full w-full"
                        style={{ height: "100%", width: "100%", background: "#050814" }}
                        zoomControl={false}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            className="map-tiles-dark"
                            noWrap={true}
                        />
                        <ZoomControl position="bottomleft" />

                        {/* ISRO Ground Station Markers - Reduced dot size */}
                        {ISRO_GROUND_STATIONS.map((station) => (
                            <Fragment key={station.code}>
                                <CircleMarker
                                    center={station.coords}
                                    radius={6}
                                    pathOptions={{
                                        color: "#f97316",
                                        fillColor: "#f97316",
                                        fillOpacity: 0.15,
                                        weight: 1,
                                        dashArray: "3, 3",
                                    }}
                                />
                                <CircleMarker
                                    center={station.coords}
                                    radius={2.5}
                                    pathOptions={{
                                        color: "#ffffff",
                                        fillColor: "#f97316",
                                        fillOpacity: 1,
                                        weight: 1.5,
                                    }}
                                >
                                    <Tooltip permanent direction="top" offset={[0, -5]} className="custom-station-tooltip">
                                        <span className="font-mono text-[9px] font-bold text-orange-300 bg-[#080d1e] px-1.5 py-0.5 rounded border border-orange-500/40">
                                            🛰️ {station.code}
                                        </span>
                                    </Tooltip>
                                </CircleMarker>
                            </Fragment>
                        ))}

                        {/* Threat Trajectories */}
                        {threats.map((threat, index) => {
                            const origin = ATTACK_ORIGIN_COUNTRIES[index % ATTACK_ORIGIN_COUNTRIES.length];
                            const from: [number, number] = [origin.lat, origin.lng];
                            const targetStation = (threat.station && ISRO_GROUND_STATIONS.find(s => s.code === threat.station))
                                || ISRO_GROUND_STATIONS[index % ISRO_GROUND_STATIONS.length];
                            const to: [number, number] = targetStation.coords;

                            const curvePath = generateCurve(from, to);
                            const color = getAttackColor(threat.type);

                            return (
                                <Fragment key={threat.id}>
                                    <Polyline
                                        positions={curvePath}
                                        pathOptions={{ color, weight: 1.0, opacity: 0.20 }}
                                    />
                                    <Polyline
                                        positions={curvePath}
                                        pathOptions={{
                                            color,
                                            weight: 1.8,
                                            opacity: 0.55,
                                            dashArray: "8, 16",
                                        }}
                                        className="animate-[dash_3s_linear_infinite]"
                                    />
                                    <TravelingDot path={curvePath} color={color} />
                                    <CircleMarker
                                        center={from}
                                        radius={3.5}
                                        pathOptions={{
                                            color,
                                            fillColor: color,
                                            fillOpacity: 0.6,
                                        }}
                                    />
                                </Fragment>
                            );
                        })}
                    </MapContainer>
                )}
            </div>

            {/* ================= TOP HEADER OVERLAY (Below floating navbar) ================= */}
            <div className="absolute top-24 left-6 right-6 flex flex-wrap justify-between items-start z-[1200] pointer-events-none gap-4">
                <div className="pointer-events-auto bg-[#080d1e]/85 backdrop-blur-xl border border-orange-500/30 p-3.5 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] uppercase tracking-[0.25em] text-orange-400 font-mono">
                                ISTRAC Space Defense Network
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                                FULL SCREEN 3D
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <h2 className="text-sm sm:text-base font-bold font-orbitron text-white tracking-wide">
                                Global Cyber Attack & Orbital Trajectory Visualizer
                            </h2>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Tracking 7 National ISRO Ground & Tracking Centers • Ballistic Hypersonic Ingress Simulation
                        </p>
                    </div>

                    {/* View Switcher 3D vs 2D */}
                    <div className="flex items-center bg-[#050814] p-1 rounded-xl border border-slate-700/60 shadow-inner">
                        <button
                            onClick={() => setViewMode('3d')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${viewMode === '3d'
                                    ? 'bg-orange-500/20 border border-orange-500/50 text-orange-300 font-bold shadow'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <Globe className="w-3.5 h-3.5 text-cyan-400" />
                            <span>3D Globe</span>
                        </button>
                        <button
                            onClick={() => setViewMode('2d')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${viewMode === '2d'
                                    ? 'bg-orange-500/20 border border-orange-500/50 text-orange-300 font-bold shadow'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <MapIcon className="w-3.5 h-3.5 text-orange-400" />
                            <span>2D Map</span>
                        </button>
                    </div>
                </div>

                {/* Right Metrics HUD */}
                {/* <div className="hidden lg:flex gap-2.5 pointer-events-auto">
                    <div className="bg-[#080d1e]/85 backdrop-blur-xl border border-slate-700/60 px-3.5 py-2 rounded-xl flex flex-col items-center min-w-[120px] shadow-lg">
                        <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
                            <Activity className="w-3 h-3 text-cyan-400" />
                            Flow / Sec
                        </span>
                        <span className="text-base font-bold text-white font-mono">
                            {health?.events_per_second?.toLocaleString() || '1,420'}
                        </span>
                    </div>

                    <div className="bg-[#080d1e]/85 backdrop-blur-xl border border-orange-500/40 px-3.5 py-2 rounded-xl flex flex-col items-center min-w-[120px] border-l-4 border-l-orange-400 shadow-lg">
                        <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
                            <Shield className="w-3 h-3 text-orange-400" />
                            Auto-Neutralized
                        </span>
                        <span className="text-base font-bold text-orange-400 font-mono">
                            {health?.automation_rate || '99.4%'}
                        </span>
                    </div>

                    <div className="bg-[#080d1e]/85 backdrop-blur-xl border border-emerald-500/40 px-3.5 py-2 rounded-xl flex flex-col items-center min-w-[120px] border-l-4 border-l-emerald-400 shadow-lg">
                        <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
                            <Radio className="w-3 h-3 text-emerald-400" />
                            Link Integrity
                        </span>
                        <span className="text-base font-bold text-emerald-400 font-mono">
                            {health?.link_integrity_score ? `${health.link_integrity_score}%` : '99.8%'}
                        </span>
                    </div>
                </div> */}
            </div>

            {/* ================= ATTACK VECTOR FILTER SIDEBAR ================= */}
            <div className="absolute bottom-6 right-6 w-72 bg-[#080d1e]/85 backdrop-blur-2xl border border-orange-500/30 rounded-2xl p-4 z-[1200] shadow-2xl">
                <h3 className="text-xs font-orbitron font-semibold text-white mb-2.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-orange-400" />
                        Space Threat Vectors
                    </span>
                    <span className="text-[10px] font-mono bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full border border-orange-500/30">
                        {threats.length} ACTIVE
                    </span>
                </h3>

                <div className="space-y-1 font-mono text-xs">
                    {filters.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setSelectedFilter(f.id)}
                            className={`w-full flex items-center justify-between p-1.5 rounded-xl transition-all duration-200 border text-[11px] ${selectedFilter === f.id
                                    ? "bg-orange-500/15 border-orange-500/40 text-orange-200 font-bold"
                                    : "bg-transparent border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                                }`}
                        >
                            <div className="flex items-center gap-2 truncate">
                                <span
                                    className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                                    style={{ backgroundColor: f.color }}
                                />
                                <span className="truncate">{f.label}</span>
                            </div>
                            {selectedFilter === f.id && (
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Live stream indicator */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Live Hypersonic Tracking
                    </span>
                    <span className="text-orange-400">2.0s refresh</span>
                </div>
            </div>

        </div>
    );
};

export default ThreatMap;

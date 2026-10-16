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
    useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Shield, Globe, Map as MapIcon, Activity, Radio, Satellite } from 'lucide-react';
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

function MapResizer() {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 200);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
}

/* ================= MAIN COMPONENT ================= */
export const ThreatMap = () => {
    const { health } = useSystemHealth();
    const { traffic } = useLiveTraffic();
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
        <div className="relative w-full h-full min-h-[calc(100vh-65px)] overflow-hidden flex flex-col font-sans bg-background">

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
                        style={{ height: "100%", width: "100%", background: "#161513" }}
                        zoomControl={false}
                    >
                        <MapResizer />
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            className="map-tiles-dark"
                            noWrap={true}
                        />
                        <ZoomControl position="bottomleft" />

                        {/* ISRO Ground Station Markers */}
                        {ISRO_GROUND_STATIONS.map((station) => (
                            <Fragment key={station.code}>
                                <CircleMarker
                                    center={station.coords}
                                    radius={12}
                                    pathOptions={{
                                        color: "#ff9933",
                                        fillColor: "#ff9933",
                                        fillOpacity: 0.12,
                                        weight: 1,
                                        dashArray: "3, 3",
                                    }}
                                />
                                <CircleMarker
                                    center={station.coords}
                                    radius={4.5}
                                    pathOptions={{
                                        color: "#f1efea",
                                        fillColor: "#ff9933",
                                        fillOpacity: 1,
                                        weight: 1.5,
                                    }}
                                >
                                    <Tooltip permanent direction="top" offset={[0, -6]} className="custom-station-tooltip">
                                        <span className="font-mono text-[10px] font-medium text-[#f1efea] bg-[#1f1e1b] px-1.5 py-0.5 rounded border border-[#34322d]">
                                            🛰️ {station.code}
                                        </span>
                                    </Tooltip>
                                </CircleMarker>
                            </Fragment>
                        ))}

                        {/* Threat Trajectories mapped into ISRO Ground Stations */}
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
                                        pathOptions={{ color, weight: 1.2, opacity: 0.35 }}
                                    />
                                    <Polyline
                                        positions={curvePath}
                                        pathOptions={{
                                            color,
                                            weight: 2.2,
                                            opacity: 0.75,
                                            dashArray: "8, 14",
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

            {/* ================= TOP HEADER OVERLAY ================= */}
            <div className="absolute top-20 left-4 sm:left-6 right-4 sm:right-6 flex flex-wrap justify-between items-start z-[500] pointer-events-none gap-4">
                <div className="pointer-events-auto bg-card/90 backdrop-blur-md border border-border p-3.5 rounded-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="caps-label text-signal">
                                ISTRAC Space Defense Network
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                                {viewMode.toUpperCase()} VIEW
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-grove animate-pulse" />
                            <h2 className="text-sm sm:text-base font-semibold tracking-tight text-foreground">
                                Ground Station Cyber Attack Vector Map
                            </h2>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                            Tracking 7 National ISRO Ground & Tracking Centers • Ballistic Hypersonic Ingress Simulation
                        </p>
                    </div>

                    {/* View Switcher 3D vs 2D */}
                    <div className="flex items-center bg-background/80 p-1 rounded-lg border border-border shadow-inner">
                        <button
                            onClick={() => setViewMode('3d')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer ${viewMode === '3d'
                                    ? 'bg-muted border border-border text-foreground font-semibold shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Globe className="w-3.5 h-3.5 text-signal" />
                            <span>3D Globe</span>
                        </button>
                        <button
                            onClick={() => setViewMode('2d')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer ${viewMode === '2d'
                                    ? 'bg-muted border border-border text-foreground font-semibold shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <MapIcon className="w-3.5 h-3.5 text-signal" />
                            <span>2D Map</span>
                        </button>
                    </div>
                </div>

                {/* Right Metrics HUD */}
                {/* <div className="hidden lg:flex gap-3 pointer-events-auto">
                    <div className="bg-card/90 backdrop-blur-md border border-border px-4 py-2.5 rounded-xl flex flex-col items-center min-w-[130px] shadow-lg">
                        <span className="caps-label text-muted-foreground flex items-center gap-1">
                            <Activity className="w-3 h-3 text-signal" />
                            Flow Ingest / Sec
                        </span>
                        <span className="text-base font-semibold text-foreground font-mono tabular-nums">
                            {health?.events_per_second?.toLocaleString() || '1,420'}
                        </span>
                    </div>

                    <div className="bg-card/90 backdrop-blur-md border border-border px-4 py-2.5 rounded-xl flex flex-col items-center min-w-[130px] shadow-lg">
                        <span className="caps-label text-muted-foreground flex items-center gap-1">
                            <Shield className="w-3 h-3 text-grove" />
                            Auto-Neutralized
                        </span>
                        <span className="text-base font-semibold text-grove font-mono tabular-nums">
                            {health?.automation_rate || '99.4%'}
                        </span>
                    </div>

                    <div className="bg-card/90 backdrop-blur-md border border-border px-4 py-2.5 rounded-xl flex flex-col items-center min-w-[130px] shadow-lg">
                        <span className="caps-label text-muted-foreground flex items-center gap-1">
                            <Radio className="w-3 h-3 text-signal" />
                            Link Integrity
                        </span>
                        <span className="text-base font-semibold text-signal font-mono tabular-nums">
                            {health?.link_integrity_score ? `${health.link_integrity_score}%` : '99.8%'}
                        </span>
                    </div>
                </div> */}
            </div>

            {/* ================= ATTACK VECTOR FILTER SIDEBAR ================= */}
            <div className="absolute bottom-6 right-6 w-72 bg-card/95 backdrop-blur-xl border border-border rounded-xl p-4 z-[500] shadow-2xl">
                <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-signal" />
                        Space Threat Vectors
                    </span>
                    <span className="text-[11px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border tabular-nums">
                        {threats.length} ACTIVE
                    </span>
                </h3>

                <div className="space-y-1.5 font-mono text-xs">
                    {filters.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setSelectedFilter(f.id)}
                            className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200 border text-[11px] cursor-pointer ${selectedFilter === f.id
                                    ? "bg-muted border-border text-foreground font-medium"
                                    : "bg-transparent border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                }`}
                        >
                            <div className="flex items-center gap-2 truncate">
                                <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: f.color }}
                                />
                                <span className="truncate">{f.label}</span>
                            </div>
                            {selectedFilter === f.id && (
                                <div className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Live stream indicator */}
                <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-grove animate-ping" />
                        Live Hypersonic Tracking
                    </span>
                    <span className="text-signal">2.0s refresh</span>
                </div>
            </div>

        </div>
    );
};

export default ThreatMap;

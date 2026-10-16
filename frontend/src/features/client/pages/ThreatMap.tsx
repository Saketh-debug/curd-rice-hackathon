import { useState, useEffect, Fragment, useMemo } from 'react';
import { useSystemHealth } from '../../../hooks/useSystemHealth';
import { useLiveTraffic } from '../../../hooks/useLiveTraffic';
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
import { Satellite, Radio, Shield, Globe } from 'lucide-react';

/* ================= ISRO Ground Stations ================= */
interface GroundStation {
    code: string;
    name: string;
    location: string;
    coords: [number, number];
    role: string;
}

const ISRO_GROUND_STATIONS: GroundStation[] = [
    {
        code: "ISTRAC-BLR",
        name: "ISTRAC Headquarters",
        location: "Bengaluru, India",
        coords: [12.9716, 77.5946],
        role: "Mission Operations Complex (MOX)"
    },
    {
        code: "IDSN-32M",
        name: "Indian Deep Space Network",
        location: "Byalalu, India",
        coords: [12.8711, 77.3789],
        role: "Chandrayaan / Aditya-L1 TT&C"
    },
    {
        code: "SDSC-SHAR",
        name: "Satish Dhawan Space Centre",
        location: "Sriharikota, India",
        coords: [13.7199, 80.2305],
        role: "Launch Ground & Telemetry Tracking"
    },
    {
        code: "ISTRAC-PBL",
        name: "Downrange Station",
        location: "Port Blair, A&N",
        coords: [11.6234, 92.7265],
        role: "Downrange Launch & Orbit Injection"
    },
    {
        code: "ISTRAC-MAU",
        name: "Indian Ocean Ground Station",
        location: "Port Louis, Mauritius",
        coords: [-20.1609, 57.5012],
        role: "LEO Contact & Geostationary Transfer"
    },
    {
        code: "ISTRAC-BIK",
        name: "Equatorial Tracking Station",
        location: "Biak, Indonesia",
        coords: [-1.1764, 136.0847],
        role: "Equatorial Orbit Pass Monitoring"
    },
    {
        code: "SVALSAT",
        name: "Polar Orbit Earth Obs. Station",
        location: "Svalbard, Norway (Arctic)",
        coords: [78.2298, 15.4078],
        role: "Polar SSO EOS Satellite Pass Support"
    }
];

/* ================= Attack Colors ================= */
const attackColors: Record<string, string> = {
    ddos: "#ff2244",    // TT&C Saturation
    dos: "#ff6b1a",     // Gateway Flood
    brute: "#00d4ff",   // TC Auth Bypass
    bot: "#d946ef",     // RTU Sensor Hijack
};

const getAttackColor = (type: string = "") => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('ddos')) return attackColors.ddos;
    if (lowerType.includes('dos')) return attackColors.dos;
    if (lowerType.includes('brute')) return attackColors.brute;
    if (lowerType.includes('bot')) return attackColors.bot;
    return "#ff2244";
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

/* ================= Moving Dot along Orbit Track ================= */
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
                radius={8}
                pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.25,
                    weight: 0,
                }}
            />
            <CircleMarker
                center={currentPos}
                radius={3.5}
                pathOptions={{
                    color: "#ffffff",
                    fillColor: color,
                    fillOpacity: 1,
                    weight: 1.5,
                }}
            />
        </Fragment>
    );
}

/* ================= MAIN COMPONENT ================= */
export const ThreatMap = () => {
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
        { id: 'all', label: 'All Space Vectors', color: '#94a3b8' },
        { id: 'ddos', label: 'TT&C Uplink Saturation', color: attackColors.ddos },
        { id: 'dos', label: 'Gateway Flow Flood', color: attackColors.dos },
        { id: 'brute', label: 'TC Authentication Bypass', color: attackColors.brute },
        { id: 'bot', label: 'Sensor/RTU Hijack', color: attackColors.bot },
    ];

    return (
        <div className="relative h-full w-full bg-[#050814] overflow-hidden flex flex-col font-sans">

            {/* ================= MAP ================= */}
            <div className="absolute inset-0">
                <MapContainer
                    center={[15, 78]} // Centered on India and the Indian Ocean
                    zoom={3}
                    minZoom={2}
                    maxBounds={[[-90, -180], [90, 180]]}
                    className="h-full w-full"
                    style={{ height: "100%", width: "100%", background: "#050814" }}
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        noWrap={true}
                    />
                    <ZoomControl position="bottomleft" />

                    {/* Permanent ISRO Ground Station Markers */}
                    {ISRO_GROUND_STATIONS.map((station) => (
                        <Fragment key={station.code}>
                            {/* Outer Radar Ping Pulse */}
                            <CircleMarker
                                center={station.coords}
                                radius={14}
                                pathOptions={{
                                    color: "#00d4ff",
                                    fillColor: "#00d4ff",
                                    fillOpacity: 0.15,
                                    weight: 1,
                                    dashArray: "3, 3",
                                }}
                            />
                            {/* Core Dish Pin */}
                            <CircleMarker
                                center={station.coords}
                                radius={5}
                                pathOptions={{
                                    color: "#ffffff",
                                    fillColor: "#00d4ff",
                                    fillOpacity: 1,
                                    weight: 2,
                                }}
                            >
                                <Tooltip permanent direction="top" offset={[0, -8]} className="custom-station-tooltip">
                                    <span className="font-mono text-[10px] font-bold text-cyan-300 bg-[#080d1e] px-1.5 py-0.5 rounded border border-cyan-500/40">
                                        🛰️ {station.code}
                                    </span>
                                </Tooltip>
                            </CircleMarker>
                        </Fragment>
                    ))}

                    {/* Threat Trajectories mapped into ISRO Ground Stations */}
                    {threats.map((threat, index) => {
                        // Derive origin coordinates from packet lat/lon or deterministically from src_ip
                        const fallbackLat = 15 + ((index * 17) % 50);
                        const fallbackLon = -40 + ((index * 31) % 120);
                        const from: [number, number] = [
                            typeof threat.lat === 'number' && !isNaN(threat.lat) ? threat.lat : fallbackLat,
                            typeof threat.lon === 'number' && !isNaN(threat.lon) ? threat.lon : fallbackLon
                        ];
                        // Distribute target to real ISRO ground stations matching packet's assigned station
                        const targetStation = (threat.station && ISRO_GROUND_STATIONS.find(s => s.code === threat.station))
                            || ISRO_GROUND_STATIONS[index % ISRO_GROUND_STATIONS.length];
                        const to: [number, number] = targetStation.coords;

                        const curvePath = generateCurve(from, to);
                        const color = getAttackColor(threat.type);

                        return (
                            <Fragment key={threat.id}>
                                <Polyline
                                    positions={curvePath}
                                    pathOptions={{ color, weight: 1.5, opacity: 0.4 }}
                                />

                                <Polyline
                                    positions={curvePath}
                                    pathOptions={{
                                        color,
                                        weight: 2.5,
                                        dashArray: "8, 12",
                                    }}
                                    className="animate-[dash_3s_linear_infinite]"
                                />

                                <TravelingDot path={curvePath} color={color} />

                                {/* Threat Origin Node */}
                                <CircleMarker
                                    center={from}
                                    radius={5}
                                    pathOptions={{
                                        color,
                                        fillColor: color,
                                        fillOpacity: 0.5,
                                    }}
                                />
                            </Fragment>
                        );
                    })}
                </MapContainer>
            </div>

            {/* ================= HEADER ================= */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-[500] pointer-events-none">
                <div className="pointer-events-auto bg-[#080d1e]/85 backdrop-blur-md border border-cyan-500/30 p-4 rounded-2xl shadow-xl">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-400 font-mono mb-1">
                        ISTRAC Defense Network
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <h2 className="text-lg font-bold font-orbitron text-white tracking-wide">
                            Ground Station Cyber Attack Vector Map
                        </h2>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                        Tracking 7 Global ISRO Ground Nodes • Active Pass Vectors
                    </p>
                </div>

                <div className="hidden lg:flex gap-4 pointer-events-auto">
                    <div className="bg-[#080d1e]/85 backdrop-blur-md border border-slate-700/60 px-4 py-2.5 rounded-xl flex flex-col items-center min-w-[130px] shadow-lg">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                            Flow Ingestion / Sec
                        </span>
                        <span className="text-lg font-bold text-white font-mono">
                            {health?.events_per_second?.toLocaleString() || '1,420'}
                        </span>
                    </div>

                    <div className="bg-[#080d1e]/85 backdrop-blur-md border border-cyan-500/40 px-4 py-2.5 rounded-xl flex flex-col items-center min-w-[130px] border-l-4 border-l-cyan-400 shadow-lg">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                            Auto-Neutralized
                        </span>
                        <span className="text-lg font-bold text-cyan-400 font-mono">
                            {health?.automation_rate || '99.4%'}
                        </span>
                    </div>
                </div>
            </div>

            {/* ================= ATTACK FILTER ================= */}
            <div className="absolute bottom-6 right-6 w-72 bg-[#080d1e]/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-4 z-[500] shadow-2xl">
                <h3 className="text-xs font-orbitron font-semibold text-white mb-3 flex items-center justify-between">
                    <span>Space Threat Vector Filter</span>
                    <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                        {threats.length} ACTIVE
                    </span>
                </h3>

                <div className="space-y-1.5 font-mono text-xs">
                    {filters.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setSelectedFilter(f.id)}
                            className={`w-full flex items-center justify-between p-2 rounded-xl transition-all duration-200 border text-[11px] ${
                                selectedFilter === f.id
                                    ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-200 font-bold"
                                    : "bg-transparent border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
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
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default ThreatMap;

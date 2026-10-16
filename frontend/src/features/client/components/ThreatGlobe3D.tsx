import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import ThreeGlobe from 'three-globe';
import type { Packet } from '../../../types';
import {
    RotateCw,
    Eye,
    Radio,
    Satellite as SatelliteIcon,
    Compass,
    Layers,
    XCircle,
    Flame,
    Zap,
    Crosshair
} from 'lucide-react';

/* ================= ISRO Ground Stations ================= */
export interface GroundStation {
    code: string;
    name: string;
    location: string;
    coords: [number, number]; // [lat, lng]
    role: string;
    freqBand: string;
    status: 'ACTIVE' | 'HIGH_LOAD' | 'TRACKING';
}

export const ISRO_GROUND_STATIONS: GroundStation[] = [
    {
        code: "ISTRAC-BLR",
        name: "ISTRAC Headquarters",
        location: "Bengaluru, India",
        coords: [12.9716, 77.5946],
        role: "Mission Operations Complex (MOX)",
        freqBand: "S-Band / X-Band TT&C",
        status: "ACTIVE"
    },
    {
        code: "IDSN-32M",
        name: "Indian Deep Space Network",
        location: "Byalalu, India",
        coords: [12.8711, 77.3789],
        role: "Deep Space Tracking (Chandrayaan/Aditya)",
        freqBand: "X-Band / Ka-Band Deep Space",
        status: "TRACKING"
    },
    {
        code: "SDSC-SHAR",
        name: "Satish Dhawan Space Centre",
        location: "Sriharikota, India",
        coords: [13.7199, 80.2305],
        role: "Launch Telemetry & Ground Radar",
        freqBand: "C-Band / S-Band Radar",
        status: "ACTIVE"
    },
    {
        code: "ISTRAC-PBL",
        name: "Downrange Ground Station",
        location: "Port Blair, A&N",
        coords: [11.6234, 92.7265],
        role: "Downrange Launch & Orbit Injection",
        freqBand: "S-Band Telemetry",
        status: "ACTIVE"
    },
    {
        code: "NRSC-HYD",
        name: "National Remote Sensing Centre",
        location: "Hyderabad, India",
        coords: [17.3850, 78.4867],
        role: "Earth Observation Data Receiving",
        freqBand: "X-Band Payload Downlink",
        status: "HIGH_LOAD"
    },
    {
        code: "SAC-AHM",
        name: "Space Applications Centre",
        location: "Ahmedabad, India",
        coords: [23.0225, 72.5714],
        role: "Communication & Payload Ops",
        freqBand: "Ku-Band / Ka-Band Transponder",
        status: "ACTIVE"
    },
    {
        code: "VSSC-TRV",
        name: "Vikram Sarabhai Space Centre",
        location: "Thiruvananthapuram, India",
        coords: [8.5241, 76.9366],
        role: "Avionics & Launch Telemetry",
        freqBand: "Telemetry / Telecommand",
        status: "ACTIVE"
    }
];

/* ================= Global Attacking Countries Catalog ================= */
export interface AttackOriginCountry {
    country: string;
    code: string;
    flag: string;
    cluster: string;
    lat: number;
    lng: number;
}

export const ATTACK_ORIGIN_COUNTRIES: AttackOriginCountry[] = [
    { country: "Russia", code: "RU", flag: "🇷🇺", cluster: "APT28 / Fancy Bear C2", lat: 55.7558, lng: 37.6173 },
    { country: "China", code: "CN", flag: "🇨🇳", cluster: "Unit 61398 Shanghai Cyber Brigade", lat: 31.2304, lng: 121.4737 },
    { country: "United States", code: "US", flag: "🇺🇸", cluster: "East Coast Cloud Botnet Ingress", lat: 38.8951, lng: -77.0364 },
    { country: "North Korea", code: "KP", flag: "🇰🇵", cluster: "Lazarus SATCOM Interceptor", lat: 39.0392, lng: 125.7625 },
    { country: "Iran", code: "IR", flag: "🇮🇷", cluster: "Tehran MuddyWater Telecommand Exploit", lat: 35.6892, lng: 51.3890 },
    { country: "Germany", code: "DE", flag: "🇩🇪", cluster: "Frankfurt Autonomous Tor Relay", lat: 50.1109, lng: 8.6821 },
    { country: "United Kingdom", code: "GB", flag: "🇬🇧", cluster: "London High-Freq Uplink Probe", lat: 51.5074, lng: -0.1278 },
    { country: "Brazil", code: "BR", flag: "🇧🇷", cluster: "São Paulo Botnet Relay", lat: -23.5505, lng: -46.6333 },
    { country: "Australia", code: "AU", flag: "🇦🇺", cluster: "Sydney Ground Intercept Node", lat: -33.8688, lng: 151.2093 },
    { country: "Netherlands", code: "NL", flag: "🇳🇱", cluster: "Amsterdam Fiber Optical Sniffer", lat: 52.3676, lng: 4.9041 },
    { country: "Singapore", code: "SG", flag: "🇸🇬", cluster: "Straits Subsea Ingestion Gateway", lat: 1.3521, lng: 103.8198 },
    { country: "Canada", code: "CA", flag: "🇨🇦", cluster: "Ottawa Space Defense Penetration Test", lat: 45.4215, lng: -75.6972 },
    { country: "Pakistan", code: "PK", flag: "🇵🇰", cluster: "Rawalpindi EW Ground Jammer", lat: 33.5651, lng: 73.0169 },
    { country: "Turkey", code: "TR", flag: "🇹🇷", cluster: "Ankara SATCOM Re-route Node", lat: 39.9334, lng: 32.8597 }
];

/* ================= Threat Type Colors ================= */
export const ATTACK_COLORS: Record<string, string> = {
    ddos: "#ff2244",    // TT&C Uplink Saturation
    dos: "#ea580c",     // Gateway Flow Flood
    brute: "#f97316",   // TC Authentication Bypass
    bot: "#f59e0b",     // Sensor / RTU Hijack
    port: "#a855f7",    // RF Port Sweep
    web: "#ec4899",     // Ground Web Portal Exploit
    default: "#38bdf8"
};

export const getAttackColor = (type: string = "") => {
    const lower = type.toLowerCase();
    if (lower.includes('ddos')) return ATTACK_COLORS.ddos;
    if (lower.includes('dos')) return ATTACK_COLORS.dos;
    if (lower.includes('brute')) return ATTACK_COLORS.brute;
    if (lower.includes('bot')) return ATTACK_COLORS.bot;
    if (lower.includes('scan') || lower.includes('port')) return ATTACK_COLORS.port;
    if (lower.includes('web')) return ATTACK_COLORS.web;
    return ATTACK_COLORS.default;
};

export interface ThreatArcData {
    id: number | string;
    originCountry: string;
    originCluster: string;
    originFlag: string;
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    color: [string, string, string];
    packet: Packet;
    targetStation: GroundStation;
    altitude: number;
    initialGap: number;
    speed: number;
    stroke: number;
}

interface ThreatGlobe3DProps {
    threats: Packet[];
    selectedThreat?: Packet | null;
    onSelectThreat?: (threat: Packet | null) => void;
    className?: string;
}

export const ThreatGlobe3D: React.FC<ThreatGlobe3DProps> = ({
    threats,
    selectedThreat = null,
    onSelectThreat,
    className = ''
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const globeInstanceRef = useRef<ThreeGlobe | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const satGroupRef = useRef<THREE.Group | null>(null);

    // View Options
    const [autoRotate, setAutoRotate] = useState(false);
    const [earthTextureMode, setEarthTextureMode] = useState<'night' | 'day'>('night');
    const [showSatellites, setShowSatellites] = useState(true);
    const [showGroundLabels, setShowGroundLabels] = useState(true);
    const [inspectedStation, setInspectedStation] = useState<GroundStation | null>(null);
    const [inspectedMissile, setInspectedMissile] = useState<ThreatArcData | null>(null);

    // Texture URLs
    const TEXTURES = {
        night: '//unpkg.com/three-globe/example/img/earth-night.jpg',
        day: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
        bump: '//unpkg.com/three-globe/example/img/earth-topology.png'
    };

    // Synthesize & process missile attacks from nations to ISRO ground stations
    const arcDataList = useMemo<ThreatArcData[]>(() => {
        // If live threats list has items, use them; if fewer than 7, supplement with active nation attacks
        const combinedThreats: Packet[] = [...threats];
        
        // Ensure at least 8-10 active incoming missile trajectories are always animated
        if (combinedThreats.length < 8) {
            const types = ['DDoS', 'DoS', 'Brute Force', 'Bots', 'Port Scanning'];
            for (let i = combinedThreats.length; i < 9; i++) {
                const origin = ATTACK_ORIGIN_COUNTRIES[i % ATTACK_ORIGIN_COUNTRIES.length];
                const station = ISRO_GROUND_STATIONS[i % ISRO_GROUND_STATIONS.length];
                combinedThreats.push({
                    id: 90000 + i,
                    timestamp: new Date().toISOString(),
                    src_ip: `${100 + i}.${(i * 37) % 250}.${(i * 19) % 250}.42`,
                    country: origin.country,
                    lat: origin.lat,
                    lon: origin.lng,
                    type: types[i % types.length],
                    confidence: 0.88 + (i % 10) * 0.01,
                    destination_port: [2098, 8450, 21, 443, 80][i % 5],
                    station: station.code,
                    action: "AUTO_BLOCKED"
                });
            }
        }

        return combinedThreats.map((threat, index) => {
            // Pick designated target ISRO ground station
            const targetStation = (threat.station && ISRO_GROUND_STATIONS.find(s => s.code === threat.station))
                || ISRO_GROUND_STATIONS[index % ISRO_GROUND_STATIONS.length];

            // Match or assign an origin foreign country
            let originCountryObj = ATTACK_ORIGIN_COUNTRIES.find(
                c => threat.country && threat.country.toLowerCase().includes(c.country.toLowerCase())
            );

            if (!originCountryObj) {
                // Assign a distinct foreign country across continents
                originCountryObj = ATTACK_ORIGIN_COUNTRIES[index % ATTACK_ORIGIN_COUNTRIES.length];
            }

            const originLat = originCountryObj.lat;
            const originLng = originCountryObj.lng;

            // Great-circle distance approximation for parabolic sub-orbital height
            const dist = Math.hypot(originLat - targetStation.coords[0], originLng - targetStation.coords[1]);
            const altitude = Math.min(0.65, Math.max(0.24, (dist / 110) * 0.45));

            // Ivory-white projectile with soft trail gradient (ghost tail -> warm luminous ivory -> brilliant diamond ivory head)
            const ivoryGradient: [string, string, string] = [
                "rgba(255, 255, 248, 0.04)",
                "rgba(255, 253, 240, 0.72)",
                "rgba(255, 255, 255, 1.0)"
            ];

            return {
                id: threat.id,
                originCountry: originCountryObj.country,
                originCluster: originCountryObj.cluster,
                originFlag: originCountryObj.flag,
                startLat: originLat,
                startLng: originLng,
                endLat: targetStation.coords[0],
                endLng: targetStation.coords[1],
                color: ivoryGradient,
                packet: threat,
                targetStation,
                altitude,
                initialGap: (index * 0.17) % 1,
                // Refined cinematic flight duration
                speed: 3800 + (index % 5) * 350,
                stroke: 0.85
            };
        });
    }, [threats]);

    // Rings data for ISRO Ground Stations (Delicate, small, precise radar shockwaves)
    const ringsData = useMemo(() => {
        return ISRO_GROUND_STATIONS.map((station, i) => ({
            lat: station.coords[0],
            lng: station.coords[1],
            station,
            color: station.code === 'IDSN-32M' ? '#38bdf8' : station.code === 'ISTRAC-BLR' ? '#ff9933' : '#f97316',
            // Much smaller radius to avoid covering the whole subcontinent
            maxRadius: station.code === 'ISTRAC-BLR' ? 1.4 : 1.15,
            speed: 2.4 + (i % 3) * 0.3,
            repeatPeriod: 800 + (i % 3) * 150
        }));
    }, []);

    // Points data: Pinpoint Ground Stations + Attacking Country Missile Launchers
    const pointsData = useMemo(() => {
        // Ground stations: small, sharp, pinpoint dots (0.16 radius)
        const stationPoints = ISRO_GROUND_STATIONS.map(s => ({
            lat: s.coords[0],
            lng: s.coords[1],
            color: '#00ff9d',
            radius: 0.16, // Reduced from 0.65 -> 75% smaller, crisp pin
            altitude: 0.012,
            label: `ISRO: ${s.name}`,
            isStation: true,
            station: s
        }));

        // Unique attacking countries: launch beacons
        const uniqueOrigins = new Map<string, ThreatArcData>();
        arcDataList.forEach(arc => {
            if (!uniqueOrigins.has(arc.originCountry)) {
                uniqueOrigins.set(arc.originCountry, arc);
            }
        });

        const attackPoints = Array.from(uniqueOrigins.values()).map(a => ({
            lat: a.startLat,
            lng: a.startLng,
            color: getAttackColor(a.packet.type),
            radius: 0.22,
            altitude: 0.01,
            label: `${a.originFlag} ${a.originCountry} Launch Site`,
            isStation: false,
            arc: a
        }));

        return [...stationPoints, ...attackPoints];
    }, [arcDataList]);

    // Labels data: Compact, tactical ground station labels
    const labelsData = useMemo(() => {
        if (!showGroundLabels) return [];
        return ISRO_GROUND_STATIONS.map(s => ({
            lat: s.coords[0],
            lng: s.coords[1],
            text: s.code,
            size: 0.65, // Compact tactical font size
            color: '#38bdf8',
            altitude: 0.015,
            station: s
        }));
    }, [showGroundLabels]);

    // Convert lat/lng to 3D position vector aligned with ThreeGlobe's coordinate system
    // ThreeGlobe polar2Cartesian: phi = (90 - lat) * PI/180, theta = (90 - lng) * PI/180
    // x = r * sin(phi) * cos(theta), y = r * cos(phi), z = r * sin(phi) * sin(theta)
    const getCoordsPosition = (lat: number, lng: number, distance: number) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (90 - lng) * (Math.PI / 180);
        const sinPhi = Math.sin(phi);
        return new THREE.Vector3(
            distance * sinPhi * Math.cos(theta),
            distance * Math.cos(phi),
            distance * sinPhi * Math.sin(theta)
        );
    };

    // Reset Camera to ISTRAC HQ / India view (smooth cinematic flyover)
    const handleResetToIndia = () => {
        if (!cameraRef.current || !controlsRef.current) return;
        // Bengaluru / ISTRAC MOX coordinates at distance 245
        const targetPos = getCoordsPosition(12.9716, 77.5946, 245);
        
        const startTime = performance.now();
        const startPos = cameraRef.current.position.clone();
        const duration = 1000;

        const animateCamera = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Smooth easeOutCubic
            const ease = 1 - Math.pow(1 - progress, 3);

            cameraRef.current?.position.lerpVectors(startPos, targetPos, ease);
            controlsRef.current?.target.set(0, 0, 0);
            controlsRef.current?.update();

            if (progress < 1) {
                requestAnimationFrame(animateCamera);
            }
        };

        requestAnimationFrame(animateCamera);
    };

    // Toggle Auto-rotation
    const handleToggleAutoRotate = () => {
        setAutoRotate(prev => !prev);
    };

    // Toggle Earth texture Day/Night
    const handleToggleTexture = () => {
        const newMode = earthTextureMode === 'night' ? 'day' : 'night';
        setEarthTextureMode(newMode);
        if (globeInstanceRef.current) {
            globeInstanceRef.current.globeImageUrl(TEXTURES[newMode]);
            globeInstanceRef.current.atmosphereColor(newMode === 'night' ? '#00d4ff' : '#60a5fa');
        }
    };

    /* ================= INITIALIZE THREE.JS SCENE ================= */
    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;

        // 1. Scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // 2. Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
        const initialPos = getCoordsPosition(20.5, 78.9, 260);
        camera.position.copy(initialPos);
        cameraRef.current = camera;

        // 3. Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // 4. OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enablePan = true;
        controls.minDistance = 120;
        controls.maxDistance = 550;
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 0.55;
        controlsRef.current = controls;

        // 5. Lighting
        const ambientLight = new THREE.AmbientLight(0x334155, 1.4);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
        sunLight.position.set(350, 200, 300);
        scene.add(sunLight);

        const rimLight = new THREE.DirectionalLight(0x0284c7, 1.1);
        rimLight.position.set(-300, -100, -200);
        scene.add(rimLight);

        // 6. Starfield particle background
        const starCount = 2000;
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i += 3) {
            const rad = 650 + Math.random() * 400;
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const sinPhi = Math.sin(phi);

            starPositions[i] = rad * sinPhi * Math.cos(theta);
            starPositions[i + 1] = rad * sinPhi * Math.sin(theta);
            starPositions[i + 2] = rad * Math.cos(phi);

            const tint = Math.random();
            if (tint > 0.8) {
                starColors[i] = 1.0; starColors[i + 1] = 0.7; starColors[i + 2] = 0.4;
            } else if (tint > 0.5) {
                starColors[i] = 0.5; starColors[i + 1] = 0.8; starColors[i + 2] = 1.0;
            } else {
                starColors[i] = 0.9; starColors[i + 1] = 0.95; starColors[i + 2] = 1.0;
            }
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

        const starMaterial = new THREE.PointsMaterial({
            size: 1.6,
            vertexColors: true,
            transparent: true,
            opacity: 0.85
        });
        const starField = new THREE.Points(starGeometry, starMaterial);
        scene.add(starField);

        // 7. Initialize ThreeGlobe
        const globe = new ThreeGlobe({ animateIn: true, waitForGlobeReady: true })
            .globeImageUrl(TEXTURES.night)
            .bumpImageUrl(TEXTURES.bump)
            .showAtmosphere(true)
            .atmosphereColor('#00d4ff')
            .atmosphereAltitude(0.24)
            // MISSILE ARCS LAYER (Polished Ivory Plasma Trajectory):
            .arcStartLat((d: object) => (d as ThreatArcData).startLat)
            .arcStartLng((d: object) => (d as ThreatArcData).startLng)
            .arcEndLat((d: object) => (d as ThreatArcData).endLat)
            .arcEndLng((d: object) => (d as ThreatArcData).endLng)
            .arcColor((d: object) => (d as ThreatArcData).color)
            .arcAltitude((d: object) => (d as ThreatArcData).altitude)
            .arcStroke((d: object) => (d as ThreatArcData).stroke)
            .arcDashLength(0.08) // Compact hypersonic projectile head
            .arcDashGap(3.2)     // Wide gap for distinct flying streaks
            .arcDashInitialGap((d: object) => (d as ThreatArcData).initialGap)
            .arcDashAnimateTime((d: object) => (d as ThreatArcData).speed)
            .arcsTransitionDuration(0)
            // GROUND STATION RADAR RINGS LAYER:
            .ringLat((d: any) => d.lat)
            .ringLng((d: any) => d.lng)
            .ringColor((d: any) => d.color)
            .ringMaxRadius((d: any) => d.maxRadius)
            .ringPropagationSpeed((d: any) => d.speed)
            .ringRepeatPeriod((d: any) => d.repeatPeriod)
            .ringAltitude(0.005)
            // GROUND STATIONS & LAUNCH PADS POINTS:
            .pointLat((d: any) => d.lat)
            .pointLng((d: any) => d.lng)
            .pointColor((d: any) => d.color)
            .pointAltitude((d: any) => d.altitude)
            .pointRadius((d: any) => d.radius)
            .pointResolution(16)
            // STATION LABELS:
            .labelLat((d: any) => d.lat)
            .labelLng((d: any) => d.lng)
            .labelText((d: any) => d.text)
            .labelSize((d: any) => d.size)
            .labelColor((d: any) => d.color)
            .labelDotRadius(0.08)
            .labelAltitude(0.015)
            .labelResolution(2);

        scene.add(globe);
        globeInstanceRef.current = globe;

        // 8. Dynamic Glowing Projectile Comet Heads & Hypersonic Flight Particle Trail
        // Soft radial glow canvas texture
        const createGlowTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
                gradient.addColorStop(0.2, 'rgba(255, 253, 235, 0.9)');
                gradient.addColorStop(0.5, 'rgba(255, 240, 200, 0.45)');
                gradient.addColorStop(0.8, 'rgba(200, 235, 255, 0.15)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 64, 64);
            }
            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            return texture;
        };

        const glowTexture = createGlowTexture();

        // Particle group for dynamic flight projectile heads and ion tail trails
        // Maximum 32 active missile trajectories, each with 1 head + 4 trailing ion sparks = 160 particles
        const MAX_ARCS = 32;
        const TRAIL_COUNT = 5; // 1 head + 4 trail nodes
        const totalParticles = MAX_ARCS * TRAIL_COUNT;

        const cometGeo = new THREE.BufferGeometry();
        const cometPositions = new Float32Array(totalParticles * 3);
        const cometColors = new Float32Array(totalParticles * 3);

        cometGeo.setAttribute('position', new THREE.BufferAttribute(cometPositions, 3));
        cometGeo.setAttribute('color', new THREE.BufferAttribute(cometColors, 3));

        const cometMat = new THREE.PointsMaterial({
            size: 4.8,
            map: glowTexture,
            vertexColors: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const cometPoints = new THREE.Points(cometGeo, cometMat);
        globe.add(cometPoints);

        // Helper: Convert lat/lng to unit spherical vector on globe radius 100
        const toUnitVec = (lat: number, lng: number) => {
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (90 - lng) * (Math.PI / 180);
            const sinPhi = Math.sin(phi);
            return new THREE.Vector3(
                sinPhi * Math.cos(theta),
                Math.cos(phi),
                sinPhi * Math.sin(theta)
            );
        };

        // Helper: Great-circle Slerp with parabolic suborbital altitude
        const getFlightPos = (v0: THREE.Vector3, v1: THREE.Vector3, t: number, maxAlt: number) => {
            const dot = Math.max(-1, Math.min(1, v0.dot(v1)));
            const omega = Math.acos(dot);
            let pt: THREE.Vector3;
            if (omega < 0.001) {
                pt = v0.clone();
            } else {
                const sinOmega = Math.sin(omega);
                const s0 = Math.sin((1 - t) * omega) / sinOmega;
                const s1 = Math.sin(t * omega) / sinOmega;
                pt = new THREE.Vector3(
                    s0 * v0.x + s1 * v1.x,
                    s0 * v0.y + s1 * v1.y,
                    s0 * v0.z + s1 * v1.z
                ).normalize();
            }
            // Altitude envelope: reaches peak maxAlt mid-flight (4 * t * (1-t))
            const currentR = 100 * (1 + 4 * t * (1 - t) * maxAlt);
            return pt.multiplyScalar(currentR);
        };

        // 9. 3D Satellites & Orbital Trajectory Rings
        const satGroup = new THREE.Group();
        globe.add(satGroup);
        satGroupRef.current = satGroup;

        // Polar LEO Orbit Ring (EOS-09 Earth Observation)
        const leoRadius = 126;
        const leoRingGeo = new THREE.RingGeometry(leoRadius - 0.4, leoRadius + 0.4, 96);
        const leoRingMat = new THREE.MeshBasicMaterial({
            color: 0x00ff9d,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.35
        });
        const leoRing = new THREE.Mesh(leoRingGeo, leoRingMat);
        leoRing.rotation.x = Math.PI / 2.7;
        leoRing.rotation.y = Math.PI / 5;
        satGroup.add(leoRing);

        // LEO Satellite Probe
        const sat1Geo = new THREE.BoxGeometry(2.4, 1.2, 1.4);
        const sat1Mat = new THREE.MeshStandardMaterial({ color: 0x00ff9d, emissive: 0x00ff9d, emissiveIntensity: 0.4 });
        const sat1Mesh = new THREE.Mesh(sat1Geo, sat1Mat);
        const panelGeo = new THREE.BoxGeometry(5.0, 0.1, 1.2);
        const panelMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });
        const panels1 = new THREE.Mesh(panelGeo, panelMat);
        sat1Mesh.add(panels1);
        satGroup.add(sat1Mesh);

        // GTO / Deep Space Orbit Ring (Aditya-L1 / IDSN Link)
        const geoRadius = 152;
        const geoRingGeo = new THREE.RingGeometry(geoRadius - 0.4, geoRadius + 0.4, 96);
        const geoRingMat = new THREE.MeshBasicMaterial({
            color: 0xff9933,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3
        });
        const geoRing = new THREE.Mesh(geoRingGeo, geoRingMat);
        geoRing.rotation.x = Math.PI / 1.9;
        geoRing.rotation.z = Math.PI / 3.5;
        satGroup.add(geoRing);

        // GSO Satellite Probe
        const sat2Geo = new THREE.BoxGeometry(2.8, 1.6, 1.6);
        const sat2Mat = new THREE.MeshStandardMaterial({ color: 0xff9933, emissive: 0xff9933, emissiveIntensity: 0.3 });
        const sat2Mesh = new THREE.Mesh(sat2Geo, sat2Mat);
        const panels2 = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.1, 1.4), panelMat);
        sat2Mesh.add(panels2);
        satGroup.add(sat2Mesh);

        // Downlink beam from LEO satellite to Bengaluru MOX
        const beamMat = new THREE.LineDashedMaterial({
            color: 0x00ff9d,
            dashSize: 3,
            gapSize: 2,
            transparent: true,
            opacity: 0.6
        });
        const beamGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 0)
        ]);
        const downlinkBeam = new THREE.Line(beamGeo, beamMat);
        downlinkBeam.computeLineDistances();
        satGroup.add(downlinkBeam);

        // 10. Animation Loop
        let animationFrameId: number;
        const clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();
            const nowMs = performance.now();

            controls.update();

            // Update Dynamic Flying Projectile Comets & Flight Opacity/Color Shift
            const posAttr = cometGeo.attributes.position.array as Float32Array;
            const colAttr = cometGeo.attributes.color.array as Float32Array;

            // Reset all particle coordinates to origin
            for (let i = 0; i < totalParticles * 3; i++) {
                posAttr[i] = 0;
                colAttr[i] = 0;
            }

            const currentArcs = arcDataList;
            const arcCount = Math.min(currentArcs.length, MAX_ARCS);

            for (let aIdx = 0; aIdx < arcCount; aIdx++) {
                const arc = currentArcs[aIdx];
                const v0 = toUnitVec(arc.startLat, arc.startLng);
                const v1 = toUnitVec(arc.endLat, arc.endLng);

                // Calculate current travel progress t (0 -> 1) aligned with arcDash animation
                // speed is duration in ms, initialGap accounts for staggered launches
                const cycle = (nowMs / arc.speed + arc.initialGap) % 1.0;
                const tHead = cycle;

                // Color and flight opacity dynamics:
                // Mid-flight (peak speed/altitude): high velocity -> lower opacity (0.45), ghostly ivory
                // Re-entry deceleration (t > 0.75): speed slows down -> shifts color to terminal plasma cyan/amber and brightens
                let r = 1.0, g = 1.0, b = 0.96; // Pure ivory white
                let alpha = 0.95;

                if (tHead < 0.65) {
                    // Flying high through upper space atmosphere: reduced opacity for genuine high-speed flight feel
                    // Dims down to ~0.38 at mid-flight apex
                    const midFactor = Math.sin(tHead * Math.PI / 0.65);
                    alpha = 0.88 - midFactor * 0.48; // Opacity reduces from 0.88 -> 0.40 -> 0.88
                    // High-speed ivory white
                    r = 1.0;
                    g = 0.98 + (1 - midFactor) * 0.02;
                    b = 0.92;
                } else {
                    // Terminal deceleration phase as projectile homes in on Ground Station:
                    // Color shifts from ivory white into terminal hyper-ionized ice cyan (#67e8f9) / gold
                    const decel = (tHead - 0.65) / 0.35; // 0 to 1
                    r = 1.0 - decel * 0.55;  // 1.0 -> 0.45
                    g = 0.98 - decel * 0.15; // 0.98 -> 0.83
                    b = 0.92 + decel * 0.08; // 0.92 -> 1.00
                    alpha = 0.55 + decel * 0.45; // Flares bright at impact
                }

                // Render Head + 4 trailing ion sparks
                for (let k = 0; k < TRAIL_COUNT; k++) {
                    const trailOffset = k * 0.016;
                    const t = Math.max(0, Math.min(1, tHead - trailOffset));
                    const pt = getFlightPos(v0, v1, t, arc.altitude);

                    const pIndex = (aIdx * TRAIL_COUNT + k) * 3;
                    posAttr[pIndex] = pt.x;
                    posAttr[pIndex + 1] = pt.y;
                    posAttr[pIndex + 2] = pt.z;

                    // Trail nodes attenuate in brightness and opacity
                    const trailFalloff = Math.pow(1 - k / TRAIL_COUNT, 1.8);
                    colAttr[pIndex] = r * alpha * trailFalloff;
                    colAttr[pIndex + 1] = g * alpha * trailFalloff;
                    colAttr[pIndex + 2] = b * alpha * trailFalloff;
                }
            }

            cometGeo.attributes.position.needsUpdate = true;
            cometGeo.attributes.color.needsUpdate = true;

            if (satGroup.visible) {
                const angle1 = elapsedTime * 0.45;
                const sat1Pos = new THREE.Vector3(
                    Math.cos(angle1) * leoRadius * Math.cos(Math.PI / 5),
                    Math.sin(angle1) * leoRadius * Math.sin(Math.PI / 2.7),
                    Math.sin(angle1) * leoRadius * Math.cos(Math.PI / 2.7)
                );
                sat1Mesh.position.copy(sat1Pos);
                sat1Mesh.lookAt(0, 0, 0);

                const angle2 = -elapsedTime * 0.28;
                const sat2Pos = new THREE.Vector3(
                    Math.cos(angle2) * geoRadius * Math.cos(Math.PI / 3.5),
                    Math.sin(angle2) * geoRadius * 0.25,
                    Math.sin(angle2) * geoRadius * Math.sin(Math.PI / 1.9)
                );
                sat2Mesh.position.copy(sat2Pos);
                sat2Mesh.lookAt(0, 0, 0);

                const blrPos = getCoordsPosition(12.9716, 77.5946, 100);
                const positions = downlinkBeam.geometry.attributes.position.array as Float32Array;
                positions[0] = sat1Pos.x;
                positions[1] = sat1Pos.y;
                positions[2] = sat1Pos.z;
                positions[3] = blrPos.x;
                positions[4] = blrPos.y;
                positions[5] = blrPos.z;
                downlinkBeam.geometry.attributes.position.needsUpdate = true;
                downlinkBeam.computeLineDistances();
            }

            starField.rotation.y = elapsedTime * 0.005;

            renderer.render(scene, camera);
        };

        animate();

        // 10. Window resize handling
        const handleResize = () => {
            if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
            const newW = containerRef.current.clientWidth;
            const newH = containerRef.current.clientHeight;
            cameraRef.current.aspect = newW / newH;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(newW, newH);
        };

        window.addEventListener('resize', handleResize);

        // 11. Cleanup
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            controls.dispose();

            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }

            starGeometry.dispose();
            starMaterial.dispose();
            leoRingGeo.dispose();
            leoRingMat.dispose();
            geoRingGeo.dispose();
            geoRingMat.dispose();
            sat1Geo.dispose();
            sat1Mat.dispose();
            sat2Geo.dispose();
            sat2Mat.dispose();
            panelGeo.dispose();
            panelMat.dispose();
            beamGeo.dispose();
            beamMat.dispose();

            cometGeo.dispose();
            cometMat.dispose();
            glowTexture.dispose();

            globe._destructor();
            renderer.dispose();
        };
    }, []);

    // Update Globe data when arcs, rings, points, labels change
    useEffect(() => {
        if (!globeInstanceRef.current) return;
        const globe = globeInstanceRef.current;

        globe.arcsData(arcDataList);
        globe.ringsData(ringsData);
        globe.pointsData(pointsData);
        globe.labelsData(labelsData);
    }, [arcDataList, ringsData, pointsData, labelsData]);

    // Update auto-rotation on OrbitControls
    useEffect(() => {
        if (controlsRef.current) {
            controlsRef.current.autoRotate = autoRotate;
        }
    }, [autoRotate]);

    // Toggle Satellites visibility
    useEffect(() => {
        if (satGroupRef.current) {
            satGroupRef.current.visible = showSatellites;
        }
    }, [showSatellites]);

    return (
        <div className={`relative w-full h-full select-none overflow-hidden ${className}`}>
            {/* Full-bleed WebGL Canvas */}
            <div
                ref={containerRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"
            />

            {/* Quick HUD Camera & Layer Controls Toolbar (Top Right, below floating navbar) */}
            <div className="absolute top-24 right-6 z-20 flex items-center gap-2 bg-[#080d1e]/85 backdrop-blur-xl border border-orange-500/30 p-1.5 rounded-xl shadow-2xl">
                {/* Reset to India */}
                <button
                    onClick={handleResetToIndia}
                    title="Focus Mission Operations (India)"
                    className="p-2 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-300 hover:bg-orange-500/30 transition-colors flex items-center gap-1.5 text-xs font-mono"
                >
                    <Compass className="w-4 h-4 text-orange-400" />
                    <span className="hidden sm:inline">Focus ISTRAC</span>
                </button>

                {/* Auto Rotate Toggle */}
                <button
                    onClick={handleToggleAutoRotate}
                    title="Toggle Globe Rotation"
                    className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-mono ${
                        autoRotate
                            ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                >
                    <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Spin</span>
                </button>

                {/* Satellite Orbits Toggle */}
                <button
                    onClick={() => setShowSatellites(prev => !prev)}
                    title="Toggle LEO / GEO Satellite Tracks"
                    className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-mono ${
                        showSatellites
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                >
                    <SatelliteIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Orbits</span>
                </button>

                {/* Day / Night Texture Mode */}
                <button
                    onClick={handleToggleTexture}
                    title="Toggle Cyber Night / Blue Marble"
                    className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-mono ${
                        earthTextureMode === 'night'
                            ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                            : 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                    }`}
                >
                    <Layers className="w-4 h-4" />
                    <span className="hidden sm:inline">{earthTextureMode === 'night' ? 'Night' : 'Day'}</span>
                </button>

                {/* Ground Labels Toggle */}
                <button
                    onClick={() => setShowGroundLabels(prev => !prev)}
                    title="Toggle Station Labels"
                    className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-mono ${
                        showGroundLabels
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Labels</span>
                </button>
            </div>

            {/* Left-side Incoming Ballistic Attack Missile Ticker */}
            <div className="absolute top-24 left-6 z-20 hidden md:flex flex-col gap-2 max-w-sm pointer-events-none">
                <div className="pointer-events-auto bg-[#080d1e]/85 backdrop-blur-xl border border-orange-500/30 p-3 rounded-2xl shadow-2xl">
                    <div className="flex items-center justify-between border-b border-orange-500/20 pb-2 mb-2">
                        <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
                            <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">
                                Live Missile Attack Streams
                            </span>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">
                            ACTIVE INGRESS
                        </span>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 font-mono text-[10px]">
                        {arcDataList.slice(0, 5).map((arc) => (
                            <button
                                key={arc.id}
                                onClick={() => {
                                    setInspectedMissile(arc);
                                    if (cameraRef.current && controlsRef.current) {
                                        const midLat = (arc.startLat + arc.endLat) / 2;
                                        const midLng = (arc.startLng + arc.endLng) / 2;
                                        const pos = getCoordsPosition(midLat, midLng, 270);
                                        cameraRef.current.position.copy(pos);
                                        controlsRef.current.target.set(0, 0, 0);
                                        controlsRef.current.update();
                                    }
                                }}
                                className="w-full text-left p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-orange-500/40 transition-colors flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-1.5 truncate">
                                    <span>{arc.originFlag}</span>
                                    <span className="text-slate-300 truncate font-semibold">{arc.originCountry}</span>
                                    <span className="text-orange-400 font-bold">➔</span>
                                    <span className="text-cyan-300">{arc.targetStation.code}</span>
                                </div>
                                <span
                                    className="px-1 rounded text-[9px] font-bold shrink-0 ml-1"
                                    style={{ color: getAttackColor(arc.packet.type) }}
                                >
                                    {arc.packet.type}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Status Ticker Overlay */}
            <div className="absolute bottom-4 left-6 right-6 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
                {/* 3D Telemetry Indicator */}
                <div className="pointer-events-auto bg-[#080d1e]/85 backdrop-blur-xl border border-slate-700/60 px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[11px] font-mono text-cyan-300 font-semibold tracking-wider uppercase">
                        3D Space Defense Sphere
                    </span>
                    <span className="text-slate-600 text-xs">|</span>
                    <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-red-400" />
                        {arcDataList.length} Active Missile Trajectories
                    </span>
                    <span className="text-slate-600 text-xs">|</span>
                    <span className="text-[11px] font-mono text-orange-400 flex items-center gap-1">
                        <Crosshair className="w-3 h-3 text-orange-400" />
                        7 Protected Ground Antennas
                    </span>
                </div>

                {/* Ground Station Quick Telemetry Pills */}
                <div className="pointer-events-auto hidden xl:flex items-center gap-1.5 bg-[#080d1e]/85 backdrop-blur-xl border border-slate-700/60 px-3 py-1.5 rounded-xl shadow-lg">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mr-1">
                        Ground Centers:
                    </span>
                    {ISRO_GROUND_STATIONS.map((st) => (
                        <button
                            key={st.code}
                            onClick={() => {
                                setInspectedStation(st);
                                if (cameraRef.current && controlsRef.current) {
                                    const pos = getCoordsPosition(st.coords[0], st.coords[1], 220);
                                    cameraRef.current.position.copy(pos);
                                    controlsRef.current.target.set(0, 0, 0);
                                    controlsRef.current.update();
                                }
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                                inspectedStation?.code === st.code
                                    ? 'bg-orange-500/25 border-orange-400 text-orange-200'
                                    : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:border-slate-500'
                            }`}
                        >
                            🛰️ {st.code}
                        </button>
                    ))}
                </div>
            </div>

            {/* Inspected Ground Station Drawer / Card */}
            {inspectedStation && (
                <div className="absolute top-24 left-6 z-30 w-80 bg-[#080d1e]/95 backdrop-blur-xl border border-orange-500/40 rounded-2xl p-4 shadow-[0_12px_45px_rgba(0,0,0,0.85)] font-mono animate-in fade-in slide-in-from-left duration-200">
                    <div className="flex items-center justify-between border-b border-orange-500/30 pb-2 mb-3">
                        <div className="flex items-center gap-2">
                            <Radio className="w-4 h-4 text-orange-400 animate-pulse" />
                            <span className="text-sm font-bold font-orbitron text-white">
                                {inspectedStation.code}
                            </span>
                        </div>
                        <button
                            onClick={() => setInspectedStation(null)}
                            className="text-slate-400 hover:text-white p-1"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-2 text-xs">
                        <div>
                            <span className="text-slate-400 text-[10px] uppercase block">Facility Name</span>
                            <span className="text-orange-200 font-semibold">{inspectedStation.name}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 text-[10px] uppercase block">Location Coordinates</span>
                            <span className="text-slate-200">
                                {inspectedStation.location} ({inspectedStation.coords[0].toFixed(4)}°N, {inspectedStation.coords[1].toFixed(4)}°E)
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 text-[10px] uppercase block">Mission Role</span>
                            <span className="text-cyan-300">{inspectedStation.role}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 text-[10px] uppercase block">Telemetry Band</span>
                            <span className="text-amber-300">{inspectedStation.freqBand}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                            <span className="text-slate-400 text-[10px]">Station Link Status</span>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                {inspectedStation.status}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Inspected Missile Attack Card */}
            {inspectedMissile && (
                <div className="absolute top-24 left-6 z-30 w-80 bg-[#080d1e]/95 backdrop-blur-xl border border-red-500/40 rounded-2xl p-4 shadow-[0_12px_45px_rgba(0,0,0,0.85)] font-mono animate-in fade-in slide-in-from-left duration-200">
                    <div className="flex items-center justify-between border-b border-red-500/30 pb-2 mb-3">
                        <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
                            <span className="text-sm font-bold font-orbitron text-white">
                                {inspectedMissile.originFlag} {inspectedMissile.originCountry} Strike
                            </span>
                        </div>
                        <button
                            onClick={() => setInspectedMissile(null)}
                            className="text-slate-400 hover:text-white p-1"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-2 text-xs">
                        <div>
                            <span className="text-slate-400 text-[10px] uppercase block">Attack Vector Type</span>
                            <span className="font-bold" style={{ color: getAttackColor(inspectedMissile.packet.type) }}>
                                {inspectedMissile.packet.type}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 text-[10px] uppercase block">Adversary Cluster</span>
                            <span className="text-red-300 font-semibold">{inspectedMissile.originCluster}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 text-[10px] uppercase block">Source IP & Location</span>
                            <span className="text-slate-200">
                                {inspectedMissile.packet.src_ip} ({inspectedMissile.startLat.toFixed(2)}°, {inspectedMissile.startLng.toFixed(2)}°)
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 text-[10px] uppercase block">Target Ground Station</span>
                            <span className="text-cyan-300">{inspectedMissile.targetStation.name} ({inspectedMissile.targetStation.code})</span>
                        </div>
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                            <span className="text-slate-400 text-[10px]">SOAR Defense Action</span>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold">
                                🛡️ AUTO-BLOCKED
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThreatGlobe3D;

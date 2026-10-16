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

    // Texture URLs (Loaded from local high-resolution assets)
    const TEXTURES = {
        night: '/textures/earth-night.jpg',
        day: '/textures/earth-blue-marble.jpg',
        bump: '/textures/earth-topology.png',
        water: '/textures/earth-water.png',
        nightSky: '/textures/night-sky.png',
        clouds: '/textures/clouds.png'
    };

    // Synthesize & process missile attacks from nations to ISRO ground stations
    const arcDataList = useMemo<ThreatArcData[]>(() => {
        // If live threats list has items, use them; if fewer than 8, supplement with active nation attacks
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
            const altitude = Math.min(0.70, Math.max(0.25, (dist / 110) * 0.46));

            // Pure polished ivory-white laser trajectory:
            // Completely transparent tail -> warm luminous ivory beam -> bright diamond ivory head
            const ivoryArcColor: [string, string, string] = [
                "rgba(255, 255, 240, 0.0)",
                "rgba(255, 253, 240, 0.75)",
                "#fffff8"
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
                color: ivoryArcColor,
                packet: threat,
                targetStation,
                altitude,
                initialGap: (index * 0.16) % 1,
                // Harmonious hypersonic flight duration
                speed: 3400 + (index % 5) * 220,
                stroke: 0.58
            };
        });
    }, [threats]);

    // Rings data for ISRO Ground Stations (Dual concentric tactical radar shockwaves)
    const ringsData = useMemo(() => {
        const list: any[] = [];
        ISRO_GROUND_STATIONS.forEach((station, i) => {
            const baseColor = station.code === 'IDSN-32M' ? '#38bdf8' : station.code === 'ISTRAC-BLR' ? '#ff9933' : '#00ff9d';
            // Primary sweeping radar ring
            list.push({
                lat: station.coords[0],
                lng: station.coords[1],
                station,
                color: baseColor,
                maxRadius: station.code === 'ISTRAC-BLR' ? 2.8 : 2.2,
                speed: 2.2 + (i % 3) * 0.25,
                repeatPeriod: 800 + (i % 3) * 120
            });
            // Fast inner pulse ring
            list.push({
                lat: station.coords[0],
                lng: station.coords[1],
                station,
                color: baseColor + '88',
                maxRadius: station.code === 'ISTRAC-BLR' ? 1.5 : 1.15,
                speed: 3.6 + (i % 3) * 0.3,
                repeatPeriod: 520 + (i % 3) * 80
            });
        });
        return list;
    }, []);

    // Points data: Pinpoint Ground Stations + Attacking Country Missile Launchers
    const pointsData = useMemo(() => {
        // Ground stations: sharp pinpoint dots with luminous emerald/cyan
        const stationPoints = ISRO_GROUND_STATIONS.map(s => ({
            lat: s.coords[0],
            lng: s.coords[1],
            color: s.code === 'ISTRAC-BLR' ? '#ff9933' : s.code === 'IDSN-32M' ? '#38bdf8' : '#00ff9d',
            radius: 0.22,
            altitude: 0.014,
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
            radius: 0.28,
            altitude: 0.012,
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
            color: s.code === 'ISTRAC-BLR' ? '#ffb74d' : '#38bdf8',
            altitude: 0.016,
            station: s
        }));
    }, [showGroundLabels]);

    // Convert lat/lng to 3D position vector aligned with ThreeGlobe's coordinate system
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
            globeInstanceRef.current.atmosphereColor(newMode === 'night' ? '#3a228a' : '#60a5fa');
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
        const camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
        const initialPos = getCoordsPosition(20.5, 78.9, 260);
        camera.position.copy(initialPos);
        cameraRef.current = camera;

        // 3. Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.35;
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
        controls.autoRotateSpeed = 0.45;
        controlsRef.current = controls;

        // 5. Lighting (Warm solar directional light + cool space rim light)
        const ambientLight = new THREE.AmbientLight(0x1e293b, 1.4);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xfff7ed, 3.2);
        sunLight.position.set(380, 180, 260);
        scene.add(sunLight);

        const rimLight = new THREE.DirectionalLight(0x1d4ed8, 1.5);
        rimLight.position.set(-320, -120, -240);
        scene.add(rimLight);

        // 6. Deep Space Sky Dome Background (Milky Way / Deep cosmos panorama)
        const skyGeo = new THREE.SphereGeometry(950, 48, 48);
        const skyTex = new THREE.TextureLoader().load(TEXTURES.nightSky);
        const skyMat = new THREE.MeshBasicMaterial({
            map: skyTex,
            side: THREE.BackSide,
            depthWrite: false
        });
        const skyDome = new THREE.Mesh(skyGeo, skyMat);
        scene.add(skyDome);

        // 7. Initialize ThreeGlobe with Tactical Military Styling
        const globe = new ThreeGlobe({ animateIn: true, waitForGlobeReady: true })
            .globeImageUrl(TEXTURES[earthTextureMode])
            .bumpImageUrl(TEXTURES.bump)
            .showGraticules(true) // Tactical latitude/longitude coordinates grid
            .showAtmosphere(true)
            .atmosphereColor(earthTextureMode === 'night' ? '#3a228a' : '#60a5fa') // Realistic violet-blue night atmosphere
            .atmosphereAltitude(0.18) // Sleek, tight atmospheric corona
            // MISSILE ARCS LAYER (Hypersonic laser streak trajectory):
            .arcStartLat((d: object) => (d as ThreatArcData).startLat)
            .arcStartLng((d: object) => (d as ThreatArcData).startLng)
            .arcEndLat((d: object) => (d as ThreatArcData).endLat)
            .arcEndLng((d: object) => (d as ThreatArcData).endLng)
            .arcColor((d: object) => (d as ThreatArcData).color)
            .arcAltitude((d: object) => (d as ThreatArcData).altitude)
            .arcStroke((d: object) => (d as ThreatArcData).stroke)
            .arcDashLength(0.08) // Distinct hypersonic ivory laser streak
            .arcDashGap(2.8)     // Clean spacing between burst streaks
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
            .ringAltitude(0.006)
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
            .labelDotRadius(0.1)
            .labelAltitude(0.016)
            .labelResolution(2);

        scene.add(globe);
        globeInstanceRef.current = globe;

        // Custom globe material enhancement: Specular ocean map & bump scale
        globe.onGlobeReady(() => {
            try {
                const globeMat = globe.globeMaterial() as THREE.MeshPhongMaterial;
                if (globeMat) {
                    globeMat.bumpScale = 8;
                    new THREE.TextureLoader().load(TEXTURES.water, (waterTex) => {
                        globeMat.specularMap = waterTex;
                        globeMat.specular = new THREE.Color(0x3377aa); // Vibrant specular ocean sheen
                        globeMat.shininess = 22;
                        globeMat.needsUpdate = true;
                    });
                }
            } catch (err) {
                console.warn('Failed to configure globe material:', err);
            }
        });

        // 8. Rotating Clouds Atmospheric Shell
        const CLOUDS_ALT = 0.005;
        const cloudsGeo = new THREE.SphereGeometry(100 * (1 + CLOUDS_ALT), 64, 64);
        let cloudsMesh: THREE.Mesh | null = null;
        new THREE.TextureLoader().load(TEXTURES.clouds, (cloudsTex) => {
            const cloudsMat = new THREE.MeshPhongMaterial({
                map: cloudsTex,
                transparent: true,
                opacity: 0.38,
                depthWrite: false,
                blending: THREE.NormalBlending
            });
            cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
            scene.add(cloudsMesh);
        });

        // 9. 3D Satellites & Orbital Trajectory Rings
        const satGroup = new THREE.Group();
        globe.add(satGroup);
        satGroupRef.current = satGroup;

        // Polar LEO Orbit Ring (EOS-09 Earth Observation)
        const leoRadius = 126;
        const leoRingGeo = new THREE.RingGeometry(leoRadius - 0.35, leoRadius + 0.35, 128);
        const leoRingMat = new THREE.MeshBasicMaterial({
            color: 0x00ff9d,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.38,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const leoRing = new THREE.Mesh(leoRingGeo, leoRingMat);
        leoRing.rotation.x = Math.PI / 2.7;
        leoRing.rotation.y = Math.PI / 5;
        satGroup.add(leoRing);

        // LEO Satellite Spacecraft (Detailed bus + gold MLI + photovoltaic arrays + sensor)
        const sat1Group = new THREE.Group();
        const sat1Bus = new THREE.Mesh(
            new THREE.BoxGeometry(2.4, 1.4, 1.4),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 })
        );
        const sat1Foil = new THREE.Mesh(
            new THREE.BoxGeometry(2.45, 1.2, 0.2),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 })
        );
        const sat1Solar = new THREE.Mesh(
            new THREE.BoxGeometry(5.6, 0.08, 1.3),
            new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0369a1, emissiveIntensity: 0.6, metalness: 0.5 })
        );
        const sat1Sensor = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.4, 0.8, 16),
            new THREE.MeshStandardMaterial({ color: 0x00ff9d, emissive: 0x00ff9d, emissiveIntensity: 0.4 })
        );
        sat1Sensor.rotation.x = Math.PI / 2;
        sat1Sensor.position.z = 0.8;
        sat1Group.add(sat1Bus, sat1Foil, sat1Solar, sat1Sensor);
        satGroup.add(sat1Group);

        // GTO / Deep Space Orbit Ring (Aditya-L1 / IDSN Link)
        const geoRadius = 152;
        const geoRingGeo = new THREE.RingGeometry(geoRadius - 0.35, geoRadius + 0.35, 128);
        const geoRingMat = new THREE.MeshBasicMaterial({
            color: 0xff9933,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.32,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const geoRing = new THREE.Mesh(geoRingGeo, geoRingMat);
        geoRing.rotation.x = Math.PI / 1.9;
        geoRing.rotation.z = Math.PI / 3.5;
        satGroup.add(geoRing);

        // GSO Satellite Spacecraft (GSAT-30 / Deep Space Comms Dish)
        const sat2Group = new THREE.Group();
        const sat2Bus = new THREE.Mesh(
            new THREE.BoxGeometry(2.8, 1.8, 1.8),
            new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.2 })
        );
        const sat2Solar = new THREE.Mesh(
            new THREE.BoxGeometry(7.0, 0.08, 1.5),
            new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.5, metalness: 0.6 })
        );
        const sat2Dish = new THREE.Mesh(
            new THREE.CylinderGeometry(1.3, 0.2, 0.5, 24),
            new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.8, roughness: 0.2 })
        );
        sat2Dish.rotation.x = Math.PI / 2;
        sat2Dish.position.z = 1.1;
        sat2Group.add(sat2Bus, sat2Solar, sat2Dish);
        satGroup.add(sat2Group);

        // Downlink beam from LEO satellite to Bengaluru MOX
        const beamMat = new THREE.LineDashedMaterial({
            color: 0x00ff9d,
            dashSize: 3,
            gapSize: 2,
            transparent: true,
            opacity: 0.75
        });
        const beamGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 0)
        ]);
        const downlinkBeam = new THREE.Line(beamGeo, beamMat);
        downlinkBeam.computeLineDistances();
        satGroup.add(downlinkBeam);

        // 11. Animation Loop
        let animationFrameId: number;
        const clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();
            const nowMs = performance.now();

            controls.update();

            // Rotate Clouds Sphere slowly
            if (cloudsMesh) {
                cloudsMesh.rotation.y = -elapsedTime * 0.012;
            }

            // Slowly drift Sky Dome
            skyDome.rotation.y = elapsedTime * 0.0006;

            if (satGroup.visible) {
                const angle1 = elapsedTime * 0.45;
                const sat1Pos = new THREE.Vector3(
                    Math.cos(angle1) * leoRadius * Math.cos(Math.PI / 5),
                    Math.sin(angle1) * leoRadius * Math.sin(Math.PI / 2.7),
                    Math.sin(angle1) * leoRadius * Math.cos(Math.PI / 2.7)
                );
                sat1Group.position.copy(sat1Pos);
                sat1Group.lookAt(0, 0, 0);

                const angle2 = -elapsedTime * 0.28;
                const sat2Pos = new THREE.Vector3(
                    Math.cos(angle2) * geoRadius * Math.cos(Math.PI / 3.5),
                    Math.sin(angle2) * geoRadius * 0.25,
                    Math.sin(angle2) * geoRadius * Math.sin(Math.PI / 1.9)
                );
                sat2Group.position.copy(sat2Pos);
                sat2Group.lookAt(0, 0, 0);

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

            renderer.render(scene, camera);
        };

        animate();

        // 12. Window resize handling
        const handleResize = () => {
            if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
            const newW = containerRef.current.clientWidth;
            const newH = containerRef.current.clientHeight;
            cameraRef.current.aspect = newW / newH;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(newW, newH);
        };

        window.addEventListener('resize', handleResize);

        // 13. Cleanup
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            controls.dispose();

            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }

            skyGeo.dispose();
            skyMat.dispose();
            skyTex.dispose();

            cloudsGeo.dispose();
            if (cloudsMesh) {
                (cloudsMesh.material as THREE.Material).dispose();
            }

            leoRingGeo.dispose();
            leoRingMat.dispose();
            geoRingGeo.dispose();
            geoRingMat.dispose();

            sat1Bus.geometry.dispose();
            (sat1Bus.material as THREE.Material).dispose();
            sat1Foil.geometry.dispose();
            (sat1Foil.material as THREE.Material).dispose();
            sat1Solar.geometry.dispose();
            (sat1Solar.material as THREE.Material).dispose();
            sat1Sensor.geometry.dispose();
            (sat1Sensor.material as THREE.Material).dispose();

            sat2Bus.geometry.dispose();
            (sat2Bus.material as THREE.Material).dispose();
            sat2Solar.geometry.dispose();
            (sat2Solar.material as THREE.Material).dispose();
            sat2Dish.geometry.dispose();
            (sat2Dish.material as THREE.Material).dispose();

            beamGeo.dispose();
            beamMat.dispose();

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
            <div className="absolute top-24 right-6 z-20 flex items-center gap-2 bg-card/80 backdrop-blur-xl border border-signal/30 p-1.5 rounded-xl shadow-2xl">
                {/* Reset to India */}
                <button
                    onClick={handleResetToIndia}
                    title="Focus Mission Operations (India)"
                    className="p-2 rounded-lg bg-signal/15 border border-signal/30 text-signal hover:bg-signal/25 transition-colors flex items-center gap-1.5 text-xs font-mono"
                >
                    <Compass className="w-4 h-4 text-signal" />
                    <span className="hidden sm:inline">Focus ISTRAC</span>
                </button>

                {/* Auto Rotate Toggle */}
                <button
                    onClick={handleToggleAutoRotate}
                    title="Toggle Globe Rotation"
                    className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-mono ${
                        autoRotate
                            ? 'bg-signal/20 border-signal/40 text-signal'
                            : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground'
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
                            ? 'bg-grove/20 border-grove/40 text-grove'
                            : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground'
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
                            ? 'bg-signal/20 border-signal/40 text-signal'
                            : 'bg-signal/10 border-signal/30 text-signal'
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
                            ? 'bg-signal/20 border-signal/40 text-signal'
                            : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Labels</span>
                </button>
            </div>

            {/* Left-side Incoming Ballistic Attack Missile Ticker */}
            <div className="absolute top-24 left-6 z-20 hidden md:flex flex-col gap-2 max-w-sm pointer-events-none">
                <div className="pointer-events-auto bg-card/80 backdrop-blur-xl border border-signal/30 p-3 rounded-2xl shadow-2xl">
                    <div className="flex items-center justify-between border-b border-signal/20 pb-2 mb-2">
                        <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-destructive animate-pulse" />
                            <span className="text-[11px] font-mono font-bold text-foreground uppercase tracking-wider">
                                Live Missile Attack Streams
                            </span>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-destructive/20 text-destructive border border-destructive/30 animate-pulse">
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
                                className="w-full text-left p-1.5 rounded-lg bg-muted/40 border border-border hover:border-signal/40 transition-colors flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-1.5 truncate">
                                    <span>{arc.originFlag}</span>
                                    <span className="text-foreground truncate font-semibold">{arc.originCountry}</span>
                                    <span className="text-signal font-bold">➔</span>
                                    <span className="text-signal">{arc.targetStation.code}</span>
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
                <div className="pointer-events-auto bg-card/80 backdrop-blur-xl border border-border px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-signal animate-pulse" />
                    <span className="text-[11px] font-mono text-signal font-semibold tracking-wider uppercase">
                        3D Space Defense Sphere
                    </span>
                    <span className="text-border text-xs">|</span>
                    <span className="text-[11px] font-mono text-foreground flex items-center gap-1">
                        <Flame className="w-3 h-3 text-destructive" />
                        {arcDataList.length} Active Missile Trajectories
                    </span>
                    <span className="text-border text-xs">|</span>
                    <span className="text-[11px] font-mono text-signal flex items-center gap-1">
                        <Crosshair className="w-3 h-3 text-signal" />
                        7 Protected Ground Antennas
                    </span>
                </div>

                {/* Ground Station Quick Telemetry Pills */}
                <div className="pointer-events-auto hidden xl:flex items-center gap-1.5 bg-card/80 backdrop-blur-xl border border-border px-3 py-1.5 rounded-xl shadow-lg">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mr-1">
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
                                    ? 'bg-signal/25 border-signal text-signal'
                                    : 'bg-muted/40 border-border text-foreground hover:border-signal/50'
                            }`}
                        >
                            🛰️ {st.code}
                        </button>
                    ))}
                </div>
            </div>

            {/* Inspected Ground Station Drawer / Card */}
            {inspectedStation && (
                <div className="absolute top-24 left-6 z-30 w-80 bg-card/90 backdrop-blur-xl border border-signal/40 rounded-2xl p-4 shadow-[0_12px_45px_rgba(0,0,0,0.85)] font-mono animate-in fade-in slide-in-from-left duration-200">
                    <div className="flex items-center justify-between border-b border-signal/30 pb-2 mb-3">
                        <div className="flex items-center gap-2">
                            <Radio className="w-4 h-4 text-signal animate-pulse" />
                            <span className="text-sm font-bold font-orbitron text-foreground">
                                {inspectedStation.code}
                            </span>
                        </div>
                        <button
                            onClick={() => setInspectedStation(null)}
                            className="text-muted-foreground hover:text-foreground p-1"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-2 text-xs">
                        <div>
                            <span className="text-muted-foreground text-[10px] uppercase block">Facility Name</span>
                            <span className="text-signal font-semibold">{inspectedStation.name}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground text-[10px] uppercase block">Location Coordinates</span>
                            <span className="text-foreground">
                                {inspectedStation.location} ({inspectedStation.coords[0].toFixed(4)}°N, {inspectedStation.coords[1].toFixed(4)}°E)
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground text-[10px] uppercase block">Mission Role</span>
                            <span className="text-signal">{inspectedStation.role}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground text-[10px] uppercase block">Telemetry Band</span>
                            <span className="text-signal">{inspectedStation.freqBand}</span>
                        </div>
                        <div className="pt-2 border-t border-border flex items-center justify-between">
                            <span className="text-muted-foreground text-[10px]">Station Link Status</span>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-grove/20 text-grove border border-grove/30 text-[10px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-grove animate-ping" />
                                {inspectedStation.status}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Inspected Missile Attack Card */}
            {inspectedMissile && (
                <div className="absolute top-24 left-6 z-30 w-80 bg-card/90 backdrop-blur-xl border border-destructive/40 rounded-2xl p-4 shadow-[0_12px_45px_rgba(0,0,0,0.85)] font-mono animate-in fade-in slide-in-from-left duration-200">
                    <div className="flex items-center justify-between border-b border-destructive/30 pb-2 mb-3">
                        <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-destructive animate-pulse" />
                            <span className="text-sm font-bold font-orbitron text-foreground">
                                {inspectedMissile.originFlag} {inspectedMissile.originCountry} Strike
                            </span>
                        </div>
                        <button
                            onClick={() => setInspectedMissile(null)}
                            className="text-muted-foreground hover:text-foreground p-1"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-2 text-xs">
                        <div>
                            <span className="text-muted-foreground text-[10px] uppercase block">Attack Vector Type</span>
                            <span className="font-bold" style={{ color: getAttackColor(inspectedMissile.packet.type) }}>
                                {inspectedMissile.packet.type}
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground text-[10px] uppercase block">Adversary Cluster</span>
                            <span className="text-destructive font-semibold">{inspectedMissile.originCluster}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground text-[10px] uppercase block">Source IP & Location</span>
                            <span className="text-foreground">
                                {inspectedMissile.packet.src_ip} ({inspectedMissile.startLat.toFixed(2)}°, {inspectedMissile.startLng.toFixed(2)}°)
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground text-[10px] uppercase block">Target Ground Station</span>
                            <span className="text-signal">{inspectedMissile.targetStation.name} ({inspectedMissile.targetStation.code})</span>
                        </div>
                        <div className="pt-2 border-t border-border flex items-center justify-between">
                            <span className="text-muted-foreground text-[10px]">SOAR Defense Action</span>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/20 text-destructive border border-destructive/30 text-[10px] font-bold">
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

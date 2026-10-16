import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sun, Moon, Play, Pause, Compass, Satellite, Radio, Loader2 } from 'lucide-react';

interface EarthGlobe3DProps {
    className?: string;
}

const TEXTURES = {
    day: '/textures/earth-blue-marble.jpg',
    night: '/textures/earth-night.jpg',
    bump: '/textures/earth-topology.png',
    water: '/textures/earth-water.png',
    clouds: '/textures/clouds.png',
};

export const EarthGlobe3D: React.FC<EarthGlobe3DProps> = ({ className = '' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const globeMatRef = useRef<THREE.MeshPhongMaterial | null>(null);
    const atmosMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
    const dayTexRef = useRef<THREE.Texture | null>(null);
    const nightTexRef = useRef<THREE.Texture | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const globeGroupRef = useRef<THREE.Group | null>(null);

    const [textureMode, setTextureMode] = useState<'day' | 'night'>('day');
    const [autoRotate, setAutoRotate] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Toggle Day / Night texture
    const handleToggleTexture = () => {
        const nextMode = textureMode === 'day' ? 'night' : 'day';
        setTextureMode(nextMode);

        if (globeMatRef.current) {
            globeMatRef.current.map = nextMode === 'day' ? dayTexRef.current : nightTexRef.current;
            globeMatRef.current.needsUpdate = true;
        }

        if (atmosMatRef.current) {
            atmosMatRef.current.color.set(nextMode === 'day' ? 0x38bdf8 : 0x4f46e5);
            atmosMatRef.current.opacity = nextMode === 'day' ? 0.14 : 0.18;
        }
    };

    // Toggle Auto-rotation
    const handleToggleAutoRotate = () => {
        setAutoRotate(prev => {
            const next = !prev;
            if (controlsRef.current) {
                controlsRef.current.autoRotate = next;
            }
            return next;
        });
    };

    // Reset camera orientation to focus on India Ground Stations
    const handleResetView = () => {
        if (!controlsRef.current || !globeGroupRef.current) return;
        controlsRef.current.reset();
        globeGroupRef.current.rotation.set(
            THREE.MathUtils.degToRad(8),
            THREE.MathUtils.degToRad(-78),
            THREE.MathUtils.degToRad(-14)
        );
    };

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth || 500;
        const height = container.clientHeight || 450;

        // 1. Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
        camera.position.set(0, 0.25, 2.75);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        container.appendChild(renderer.domElement);

        // 2. Smooth OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false; // Prevent trapping browser scrolling
        controls.enablePan = false;
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 0.55;
        controls.minPolarAngle = Math.PI * 0.15;
        controls.maxPolarAngle = Math.PI * 0.85;
        controlsRef.current = controls;

        // 3. Main Rotating Group with Earth's Axial Tilt
        const globeGroup = new THREE.Group();
        globeGroup.rotation.set(
            THREE.MathUtils.degToRad(8),
            THREE.MathUtils.degToRad(-78),
            THREE.MathUtils.degToRad(-14)
        );
        scene.add(globeGroup);
        globeGroupRef.current = globeGroup;

        // 4. Texture Loader & Multi-Map PBR Shading
        const textureLoader = new THREE.TextureLoader();
        let loadedCount = 0;
        const totalTextures = 5;

        const onTextureLoaded = () => {
            loadedCount++;
            if (loadedCount >= 2) {
                setIsLoading(false);
            }
        };

        const dayTex = textureLoader.load(TEXTURES.day, onTextureLoaded);
        const nightTex = textureLoader.load(TEXTURES.night, onTextureLoaded);
        const bumpTex = textureLoader.load(TEXTURES.bump, onTextureLoaded);
        const waterTex = textureLoader.load(TEXTURES.water, onTextureLoaded);
        const cloudsTex = textureLoader.load(TEXTURES.clouds, onTextureLoaded);

        dayTexRef.current = dayTex;
        nightTexRef.current = nightTex;

        // 5. Photorealistic Earth Mesh
        const globeGeo = new THREE.SphereGeometry(1, 64, 64);
        const globeMat = new THREE.MeshPhongMaterial({
            map: textureMode === 'day' ? dayTex : nightTex,
            bumpMap: bumpTex,
            bumpScale: 0.045,
            specularMap: waterTex,
            specular: new THREE.Color(0x3882bf), // Realistic ocean blue specular shine
            shininess: 24,
        });
        globeMatRef.current = globeMat;
        const globeMesh = new THREE.Mesh(globeGeo, globeMat);
        globeGroup.add(globeMesh);

        // 6. Floating Cloud Layer (Concentric sphere rotating independently)
        const cloudsGeo = new THREE.SphereGeometry(1.014, 64, 64);
        const cloudsMat = new THREE.MeshPhongMaterial({
            map: cloudsTex,
            transparent: true,
            opacity: 0.42,
            depthWrite: false,
        });
        const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
        globeGroup.add(cloudsMesh);

        // 7. Atmospheric Rayleigh Corona Glow (Limb glow shell)
        const atmosGeo = new THREE.SphereGeometry(1.10, 64, 64);
        const atmosMat = new THREE.MeshBasicMaterial({
            color: textureMode === 'day' ? 0x38bdf8 : 0x4f46e5,
            transparent: true,
            opacity: 0.14,
            side: THREE.BackSide,
        });
        atmosMatRef.current = atmosMat;
        const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
        scene.add(atmosMesh);

        // 8. ISRO Ground Station Pinpoint Beacon (Bengaluru MOX / ISTRAC at 12.9716°N, 77.5946°E)
        const latRad = (90 - 12.9716) * (Math.PI / 180);
        const lngRad = (77.5946 + 180) * (Math.PI / 180);
        const beaconRadius = 1.002;
        const bX = -(beaconRadius * Math.sin(latRad) * Math.cos(lngRad));
        const bZ = (beaconRadius * Math.sin(latRad) * Math.sin(lngRad));
        const bY = (beaconRadius * Math.cos(latRad));
        const beaconPos = new THREE.Vector3(bX, bY, bZ);

        // Beacon Core Point
        const beaconGeo = new THREE.SphereGeometry(0.018, 16, 16);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
        beaconMesh.position.copy(beaconPos);
        globeMesh.add(beaconMesh);

        // Radar Expanding Pulse Ring
        const ringGeo = new THREE.RingGeometry(0.012, 0.024, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
        });
        const radarRing = new THREE.Mesh(ringGeo, ringMat);
        radarRing.position.copy(beaconPos.clone().multiplyScalar(1.003));
        radarRing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), beaconPos.clone().normalize());
        globeMesh.add(radarRing);

        // 9. LEO Polar Orbit (EOS-09 Earth Observation Satellite)
        const orbit1Geo = new THREE.RingGeometry(1.26, 1.27, 96);
        const orbit1Mat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.45,
        });
        const orbit1 = new THREE.Mesh(orbit1Geo, orbit1Mat);
        orbit1.rotation.x = Math.PI / 2.8;
        orbit1.rotation.y = Math.PI / 5;
        globeGroup.add(orbit1);

        const sat1Geo = new THREE.SphereGeometry(0.03, 16, 16);
        const sat1Mat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const sat1 = new THREE.Mesh(sat1Geo, sat1Mat);
        globeGroup.add(sat1);

        // 10. GTO / High Orbit (Aditya-L1 Space Telemetry Link)
        const orbit2Geo = new THREE.RingGeometry(1.44, 1.45, 96);
        const orbit2Mat = new THREE.MeshBasicMaterial({
            color: 0xf5b325,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.35,
        });
        const orbit2 = new THREE.Mesh(orbit2Geo, orbit2Mat);
        orbit2.rotation.x = Math.PI / 2.1;
        orbit2.rotation.z = Math.PI / 3.6;
        globeGroup.add(orbit2);

        const sat2Geo = new THREE.SphereGeometry(0.036, 16, 16);
        const sat2Mat = new THREE.MeshBasicMaterial({ color: 0xf5b325 });
        const sat2 = new THREE.Mesh(sat2Geo, sat2Mat);
        globeGroup.add(sat2);

        // 11. Cinematic Space Lighting
        const ambientLight = new THREE.AmbientLight(0x0a1424, 0.95);
        scene.add(ambientLight);

        // Sun Directional Light (Warm solar light creating day/night terminator boundary)
        const sunLight = new THREE.DirectionalLight(0xfffbf0, 2.7);
        sunLight.position.set(4.5, 2.2, 3.5);
        scene.add(sunLight);

        // Space Rim Light (Cool atmospheric silhouette backlight)
        const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.75);
        rimLight.position.set(-3.5, -1.0, -3.0);
        scene.add(rimLight);

        // 12. Animation Loop
        let animationFrameId: number;
        const clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            // Dynamic atmospheric cloud drift (clouds drift slightly faster than Earth)
            cloudsMesh.rotation.y += 0.0007;

            // ISRO Ground Station Radar Pulse Animation
            const pulse = (elapsedTime * 1.6) % 1;
            radarRing.scale.setScalar(1 + pulse * 2.8);
            ringMat.opacity = Math.max(0, (1 - pulse) * 0.85);

            // Orbit Satellites
            const r1 = 1.265;
            const angle1 = elapsedTime * 0.85;
            sat1.position.set(
                Math.cos(angle1) * r1 * Math.cos(Math.PI / 5),
                Math.sin(angle1) * r1 * Math.sin(Math.PI / 2.8),
                Math.sin(angle1) * r1 * Math.cos(Math.PI / 2.8)
            );

            const r2 = 1.445;
            const angle2 = -elapsedTime * 0.55;
            sat2.position.set(
                Math.cos(angle2) * r2 * Math.cos(Math.PI / 3.6),
                Math.sin(angle2) * r2 * 0.35,
                Math.sin(angle2) * r2 * Math.sin(Math.PI / 2.1)
            );

            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        // 13. Window Resize Handler
        const handleResize = () => {
            if (!containerRef.current) return;
            const newW = containerRef.current.clientWidth;
            const newH = containerRef.current.clientHeight;
            camera.aspect = newW / newH;
            camera.updateProjectionMatrix();
            renderer.setSize(newW, newH);
        };

        window.addEventListener('resize', handleResize);

        // 14. Cleanup & Resource Disposal
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);

            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }

            controls.dispose();
            globeGeo.dispose();
            globeMat.dispose();
            cloudsGeo.dispose();
            cloudsMat.dispose();
            atmosGeo.dispose();
            atmosMat.dispose();
            beaconGeo.dispose();
            beaconMat.dispose();
            ringGeo.dispose();
            ringMat.dispose();
            orbit1Geo.dispose();
            orbit1Mat.dispose();
            orbit2Geo.dispose();
            orbit2Mat.dispose();
            sat1Geo.dispose();
            sat1Mat.dispose();
            sat2Geo.dispose();
            sat2Mat.dispose();
            dayTex.dispose();
            nightTex.dispose();
            bumpTex.dispose();
            waterTex.dispose();
            cloudsTex.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div className={`relative flex items-center justify-center select-none overflow-hidden ${className}`}>
            {/* 3D WebGL Canvas Container */}
            <div
                ref={containerRef}
                className="w-full h-full min-h-[380px] max-h-[520px] cursor-grab active:cursor-grabbing"
            />

            {/* Loading Indicator */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#161513]/60 backdrop-blur-xs pointer-events-none transition-opacity duration-500">
                    <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-card/90 border border-border/80 text-xs font-mono text-signal">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>SYNCHRONIZING SATELLITE TELEMETRY...</span>
                    </div>
                </div>
            )}

            {/* Top-Left: Tactical Telemetry Badge */}
            <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-cyan-500/30 text-[10px] font-mono tracking-wider text-cyan-400">
                    <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                    <span>ISTRAC-BLR RADAR ACTIVE</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/40 backdrop-blur-xs text-[9px] font-mono text-muted-foreground">
                    <Satellite className="w-2.5 h-2.5 text-signal" />
                    <span>LEO: EOS-09 • GTO: ADITYA-L1</span>
                </div>
            </div>

            {/* Top-Right: Interactive View Controls */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-border/60 rounded-lg p-1 z-10 shadow-lg">
                <button
                    onClick={handleToggleTexture}
                    title={`Switch to ${textureMode === 'day' ? 'Night Lights' : 'Day Marble'}`}
                    className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                    {textureMode === 'day' ? (
                        <Moon className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                    )}
                </button>

                <button
                    onClick={handleToggleAutoRotate}
                    title={autoRotate ? 'Pause Rotation' : 'Resume Auto-Spin'}
                    className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                    {autoRotate ? (
                        <Pause className="w-3.5 h-3.5 text-signal" />
                    ) : (
                        <Play className="w-3.5 h-3.5 text-signal" />
                    )}
                </button>

                <button
                    onClick={handleResetView}
                    title="Center on ISTRAC Ground Station"
                    className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                    <Compass className="w-3.5 h-3.5 text-foreground/80 hover:text-foreground" />
                </button>
            </div>

            {/* Bottom: Instructional Subtitle */}
            <div className="absolute bottom-2.5 text-center pointer-events-none text-[11px] text-cyan-400/70 font-mono tracking-widest uppercase bg-black/40 px-3 py-0.5 rounded-full backdrop-blur-xs border border-cyan-500/10">
                ✦ Interactive 3D Photorealistic Earth • Click & Drag ✦
            </div>
        </div>
    );
};


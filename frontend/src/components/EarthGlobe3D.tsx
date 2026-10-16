import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface EarthGlobe3DProps {
    className?: string;
}

export const EarthGlobe3D: React.FC<EarthGlobe3DProps> = ({ className = '' }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth || 500;
        const height = container.clientHeight || 500;

        // Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.z = 2.8;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Group to hold everything
        const globeGroup = new THREE.Group();
        scene.add(globeGroup);

        // Procedural Earth Texture Canvas
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Deep basalt space ocean
            ctx.fillStyle = '#161513';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Latitude / Longitude grid lines
            ctx.strokeStyle = 'rgba(245, 179, 37, 0.08)';
            ctx.lineWidth = 1;
            for (let y = 0; y <= canvas.height; y += 64) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
            for (let x = 0; x <= canvas.width; x += 64) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            // Procedural landmass dots simulating continents (India, Asia, Europe, Africa, Americas)
            const drawContinentCluster = (cx: number, cy: number, r: number, density: number, col: string) => {
                ctx.fillStyle = col;
                for (let i = 0; i < density; i++) {
                    const ang = Math.random() * Math.PI * 2;
                    const rad = Math.pow(Math.random(), 0.5) * r;
                    const px = cx + Math.cos(ang) * rad;
                    const py = cy + Math.sin(ang) * rad * 0.7;
                    const dotSize = Math.random() * 2.8 + 1;
                    ctx.beginPath();
                    ctx.arc(px, py, dotSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            };

            // Indian subcontinent (prominently highlighted in Signal Gold & Grove)
            drawContinentCluster(1450, 480, 110, 350, '#f5b325'); // Signal gold
            drawContinentCluster(1450, 520, 100, 300, '#8abf84'); // Grove safe
            drawContinentCluster(1450, 440, 120, 400, '#7c9bda'); // Slate
            // Asia & Middle East
            drawContinentCluster(1400, 360, 220, 600, '#a19c92');
            drawContinentCluster(1650, 420, 180, 500, '#7c9bda');
            // Europe
            drawContinentCluster(1100, 320, 140, 450, '#8abf84');
            // Africa
            drawContinentCluster(1120, 560, 180, 500, '#a19c92');
            // Australia
            drawContinentCluster(1750, 720, 110, 300, '#7c9bda');
            // Americas
            drawContinentCluster(500, 360, 190, 550, '#a19c92');
            drawContinentCluster(600, 640, 160, 450, '#8abf84');
        }

        const earthTexture = new THREE.CanvasTexture(canvas);
        const globeGeo = new THREE.SphereGeometry(1, 64, 64);
        const globeMat = new THREE.MeshPhongMaterial({
            map: earthTexture,
            color: 0x1f1e1b,
            emissive: 0x161513,
            specular: 0xf5b325,
            shininess: 20,
            transparent: true,
            opacity: 0.95,
        });
        const globeMesh = new THREE.Mesh(globeGeo, globeMat);
        globeGroup.add(globeMesh);

        // Atmosphere glow outer shell
        const atmosGeo = new THREE.SphereGeometry(1.04, 64, 64);
        const atmosMat = new THREE.MeshBasicMaterial({
            color: 0xf5b325,
            transparent: true,
            opacity: 0.08,
            side: THREE.BackSide,
        });
        const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
        globeGroup.add(atmosMesh);

        // Orbital Trajectory Ring 1 (LEO polar / SSO)
        const orbit1Geo = new THREE.RingGeometry(1.28, 1.29, 96);
        const orbit1Mat = new THREE.MeshBasicMaterial({
            color: 0xf5b325,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.45,
        });
        const orbit1 = new THREE.Mesh(orbit1Geo, orbit1Mat);
        orbit1.rotation.x = Math.PI / 3;
        orbit1.rotation.y = Math.PI / 6;
        globeGroup.add(orbit1);

        // Orbital Trajectory Ring 2 (Equatorial / GTO)
        const orbit2Geo = new THREE.RingGeometry(1.45, 1.46, 96);
        const orbit2Mat = new THREE.MeshBasicMaterial({
            color: 0x7c9bda,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.35,
        });
        const orbit2 = new THREE.Mesh(orbit2Geo, orbit2Mat);
        orbit2.rotation.x = Math.PI / 2.2;
        orbit2.rotation.z = Math.PI / 4;
        globeGroup.add(orbit2);

        // Satellite 1 (EOS-09 LEO)
        const sat1Geo = new THREE.SphereGeometry(0.032, 16, 16);
        const sat1Mat = new THREE.MeshBasicMaterial({ color: 0x8abf84 });
        const sat1 = new THREE.Mesh(sat1Geo, sat1Mat);
        globeGroup.add(sat1);

        // Satellite 2 (Aditya-L1 / GSO link)
        const sat2Geo = new THREE.SphereGeometry(0.038, 16, 16);
        const sat2Mat = new THREE.MeshBasicMaterial({ color: 0xf5b325 });
        const sat2 = new THREE.Mesh(sat2Geo, sat2Mat);
        globeGroup.add(sat2);

        // Ambient and directional lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0x93c5fd, 2.0);
        sunLight.position.set(5, 3, 5);
        scene.add(sunLight);

        // Interaction (drag to rotate)
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        const onMouseDown = (e: MouseEvent) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            globeGroup.rotation.y += deltaX * 0.005;
            globeGroup.rotation.x += deltaY * 0.005;

            previousMousePosition = { x: e.clientX, y: e.clientY };
        };

        const onMouseUp = () => {
            isDragging = false;
        };

        container.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        // Animation loop
        let animationFrameId: number;
        let clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            // Auto slow spin if not dragging
            if (!isDragging) {
                globeGroup.rotation.y += 0.0025;
            }

            // Move satellites along orbital paths
            const r1 = 1.285;
            const angle1 = elapsedTime * 0.9;
            sat1.position.set(
                Math.cos(angle1) * r1 * Math.cos(Math.PI / 6),
                Math.sin(angle1) * r1 * Math.sin(Math.PI / 3),
                Math.sin(angle1) * r1 * Math.cos(Math.PI / 3)
            );

            const r2 = 1.455;
            const angle2 = -elapsedTime * 0.6;
            sat2.position.set(
                Math.cos(angle2) * r2 * Math.cos(Math.PI / 4),
                Math.sin(angle2) * r2 * 0.3,
                Math.sin(angle2) * r2 * Math.sin(Math.PI / 2.2)
            );

            renderer.render(scene, camera);
        };

        animate();

        // Resize handler
        const handleResize = () => {
            if (!containerRef.current) return;
            const newW = containerRef.current.clientWidth;
            const newH = containerRef.current.clientHeight;
            camera.aspect = newW / newH;
            camera.updateProjectionMatrix();
            renderer.setSize(newW, newH);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            cancelAnimationFrame(animationFrameId);
            container.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('resize', handleResize);

            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }

            globeGeo.dispose();
            globeMat.dispose();
            atmosGeo.dispose();
            atmosMat.dispose();
            orbit1Geo.dispose();
            orbit1Mat.dispose();
            orbit2Geo.dispose();
            orbit2Mat.dispose();
            sat1Geo.dispose();
            sat1Mat.dispose();
            sat2Geo.dispose();
            sat2Mat.dispose();
            earthTexture.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <div ref={containerRef} className="w-full h-full min-h-[380px] max-h-[520px] cursor-grab active:cursor-grabbing" />
            <div className="absolute bottom-2 text-center pointer-events-none text-[11px] text-cyan-400/60 font-mono tracking-widest uppercase">
                ✦ Interactive 3D LEO Orbital Telemetry Sphere — Click & Drag ✦
            </div>
        </div>
    );
};

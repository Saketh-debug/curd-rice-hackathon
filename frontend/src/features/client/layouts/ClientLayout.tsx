import React from 'react';
import {
    Shield,
    LayoutDashboard,
    Zap,
    Map as MapIcon,
    Terminal,
    Satellite
} from 'lucide-react';
import PortalNavbar, { type NavItem } from '../../../components/Navbar/PortalNavbar';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const navItems: NavItem[] = [
        { icon: LayoutDashboard, label: 'Mission Overview', path: '/client/dashboard' },
        { icon: Shield, label: 'Threat Bridge', path: '/client/command-center' },
        { icon: Satellite, label: 'Pass Windows', path: '/client/passes' },
        { icon: MapIcon, label: 'Station Map', path: '/client/map' },
        { icon: Terminal, label: 'Telemetry Stream', path: '/client/events' },
        { icon: Zap, label: 'Defense Automation', path: '/client/automation' },
    ];

    return (
        <div className="min-h-screen bg-[#050814] text-slate-100 font-sans selection:bg-orange-500 selection:text-black flex flex-col">
            {/* Centered Glassmorphic Navbar */}
            <PortalNavbar portalType="client" navItems={navItems} />

            {/* Main Content Area - Centered with balanced whitespace */}
            <main className="flex-1 pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
                {children}
            </main>

            {/* Subdued Footer */}
            <footer className="border-t border-slate-800/80 bg-[#050814]/90 py-6 px-4 sm:px-6 text-center text-xs font-mono text-slate-500">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                        <span className="text-slate-300 font-semibold">SOAR Space Flight Operations</span>
                        <span className="text-slate-600">|</span>
                        <span>MOC Bengaluru Telemetry Ingest</span>
                    </div>
                    <div className="text-slate-500">
                        Autonomous Heuristic TT&C Guard • Live Telemetry Active
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Shield,
    LayoutDashboard,
    Zap,
    Map as MapIcon,
    Terminal,
    Settings,
    Satellite,
    Radio
} from 'lucide-react';
import clsx from 'clsx';
import { useSystemHealth } from '../../../hooks/useSystemHealth';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const { health } = useSystemHealth();

    const navItems = [
        { icon: LayoutDashboard, label: 'Mission Overview', path: '/client/dashboard' },
        { icon: Shield, label: 'Threat Command Bridge', path: '/client/command-center' },
        { icon: Satellite, label: 'Pass Window Status', path: '/client/passes' },
        { icon: MapIcon, label: 'Ground Station Map', path: '/client/map' },
        { icon: Terminal, label: 'Telemetry Stream', path: '/client/events' },
        { icon: Zap, label: 'AI Defense Automation', path: '/client/automation' },
    ];

    return (
        <div className="flex h-screen bg-[#050814] text-slate-200 font-sans selection:bg-cyan-500 selection:text-black">
            {/* Sidebar */}
            <aside className="w-64 bg-[#080d1e] border-r border-slate-800 flex flex-col z-20 hidden md:flex shrink-0">
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                    <Link to="/" className="flex items-center gap-2 text-cyan-400 font-orbitron font-bold text-lg tracking-wider">
                        <Satellite className="w-5 h-5 text-cyan-400" />
                        <span>SOAR<span className="text-orange-400 font-light text-xs ml-1 font-mono">SPACE</span></span>
                    </Link>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                        ISTRAC
                    </span>
                </div>

                {/* Subtitle Station Bar */}
                <div className="px-6 py-2.5 bg-[#060914] border-b border-slate-800/60 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>MOC BENGALURU</span>
                    <span className="flex items-center gap-1 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        ONLINE
                    </span>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-xs font-mono",
                                    isActive
                                        ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,212,255,0.15)]"
                                        : "text-slate-400 hover:bg-slate-800/60 hover:text-cyan-300"
                                )}
                            >
                                <item.icon className="w-4 h-4 shrink-0 text-cyan-400" />
                                <span className="truncate">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 bg-[#060a16]">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-orange-400 flex items-center justify-center text-black text-xs font-bold font-orbitron">
                            IS
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate text-slate-200">Mission Controller</p>
                            <p className="text-[10px] text-cyan-400 font-mono truncate">ISTRAC Flight Operations</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Page Content */}
                <div className="flex-1 overflow-y-auto bg-[#050814]">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;

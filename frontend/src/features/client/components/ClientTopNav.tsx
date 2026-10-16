import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Shield,
    Satellite,
    Map as MapIcon,
    Zap,
    Terminal,
    ArrowUpRight,
    Lock
} from 'lucide-react';
import clsx from 'clsx';
import { useSystemHealth } from '../../../hooks/useSystemHealth';
import StarBorder from '../../../components/StarBorder';

export const ClientTopNav: React.FC = () => {
    const location = useLocation();
    const { health } = useSystemHealth();
    const [currentTime, setCurrentTime] = useState<string>('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toUTCString().slice(17, 25) + ' UTC');
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/client/dashboard' },
        { icon: Shield, label: 'Command Bridge', path: '/client/command-center' },
        { icon: Satellite, label: 'Pass Windows', path: '/client/passes' },
        { icon: MapIcon, label: 'Threat Radar', path: '/client/map' },
        { icon: Zap, label: 'AI Automation', path: '/client/automation' },
        { icon: Terminal, label: 'Telemetry Stream', path: '/client/events' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md border-b border-border px-4 lg:px-8 py-2.5">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                
                {/* Brand Logo & Node Identifier */}
                <div className="flex items-center gap-3 shrink-0">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-signal group-hover:border-signal/50 transition-all">
                            <Satellite className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                            <div className="font-logo font-bold text-sm tracking-wider text-foreground flex items-center gap-2">
                                SOAR SPACE
                                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-md bg-signal text-signal-foreground font-medium">OPS</span>
                            </div>
                            <div className="text-[11px] font-mono tabular-nums text-muted-foreground flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-grove"></span>
                                ISTRAC-BLR MOX
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Central Segmented Tab Bar */}
                <nav className="hidden md:flex items-center gap-1 p-1 rounded-lg bg-card/60 border border-border">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-md font-sans text-xs transition-all cursor-pointer font-medium",
                                    isActive
                                        ? "bg-muted text-foreground border border-border shadow-xs font-semibold"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
                                )}
                            >
                                <Icon className={clsx("w-3.5 h-3.5", isActive ? "text-foreground" : "text-muted-foreground")} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Flight Status & Portal Switcher */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex flex-col text-right font-mono text-xs">
                        <span className="text-[11px] text-muted-foreground uppercase font-medium">Clock Sync</span>
                        <span className="text-foreground font-semibold tabular-nums">{currentTime || 'SYNCING...'}</span>
                    </div>

                    <div className="h-5 w-px bg-border hidden sm:block"></div>

                    {/* Switch to Admin Portal Button */}
                    <StarBorder
                        as={Link}
                        to="/admin/dashboard"
                        backgroundColor="#1f1e1b"
                        borderColor="#34322d"
                        textColor="#f1efea"
                        className="flex items-center gap-1.5 px-3 py-1.5 font-sans font-medium text-xs tracking-tight transition-all group cursor-pointer hover:bg-muted"
                    >
                        <Lock className="w-3.5 h-3.5 text-signal" />
                        <span className="hidden sm:inline">Admin Governance</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </StarBorder>
                </div>

            </div>

            {/* Mobile Scrollable Sub-nav */}
            <div className="flex md:hidden overflow-x-auto gap-1 pt-2.5 pb-1 mt-2 border-t border-slate-800/60 no-scrollbar">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs whitespace-nowrap shrink-0",
                                isActive
                                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                                    : "text-slate-400 hover:text-slate-200"
                            )}
                        >
                            <Icon className="w-3 h-3" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </header>
    );
};

export default ClientTopNav;

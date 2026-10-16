import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Satellite,
    Lock,
    Radio,
    Shield,
    Menu,
    X,
    ExternalLink,
    ChevronRight,
    type LucideIcon
} from 'lucide-react';
import clsx from 'clsx';

export interface NavItem {
    icon: LucideIcon;
    label: string;
    path: string;
}

interface PortalNavbarProps {
    portalType: 'client' | 'admin';
    navItems: NavItem[];
}

export const PortalNavbar: React.FC<PortalNavbarProps> = ({ portalType, navItems }) => {
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isAdmin = portalType === 'admin';
    const switchPath = isAdmin ? '/client/dashboard' : '/admin/dashboard';
    const switchLabel = isAdmin ? 'MOC Operations' : 'Sec Console';

    return (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
            {/* Glassmorphic Container */}
            <div className="bg-[#050814]/80 backdrop-blur-xl border-b border-orange-500/15 shadow-[0_4px_30px_rgba(249,115,22,0.05)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    
                    {/* Brand / Logo */}
                    <div className="flex items-center gap-3 shrink-0">
                        <Link 
                            to="/" 
                            className="flex items-center gap-2 group transition-transform duration-200 hover:scale-[1.02]"
                        >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)] group-hover:border-orange-500/60 transition-all">
                                {isAdmin ? <Lock className="w-4 h-4 text-orange-400" /> : <Satellite className="w-4 h-4 text-orange-400" />}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-orbitron font-bold text-base tracking-wider text-white flex items-center">
                                    SOAR
                                    <span className="text-orange-400 ml-1.5 text-xs font-mono px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/25">
                                        {isAdmin ? 'ADMIN' : 'SPACE'}
                                    </span>
                                </span>
                            </div>
                        </Link>

                        <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-slate-800 text-[10px] font-mono text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-slate-300 font-semibold">{isAdmin ? 'ISTRAC-SEC' : 'MOC-BLR'}</span>
                            <span className="text-slate-500">|</span>
                            <span className="text-emerald-400 font-bold">{isAdmin ? 'AIR-GAP SAFE' : 'PASS NOMINAL'}</span>
                        </div>
                    </div>

                    {/* Centered Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center justify-center gap-1.5 overflow-x-auto py-1 px-2 rounded-full bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path || 
                                (item.path !== '/admin/dashboard' && item.path !== '/client/dashboard' && location.pathname.startsWith(item.path));
                            const IconComponent = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={clsx(
                                        "flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all duration-200 text-xs font-mono whitespace-nowrap",
                                        isActive
                                            ? "bg-gradient-to-r from-orange-500/20 to-amber-500/15 text-orange-300 font-bold border border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.18)]"
                                            : "text-slate-300 hover:text-orange-300 hover:bg-slate-800/50 hover:border-slate-700/50 border border-transparent"
                                    )}
                                >
                                    <IconComponent className={clsx("w-3.5 h-3.5", isActive ? "text-orange-400" : "text-slate-400 group-hover:text-orange-400")} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Action / Switcher */}
                    <div className="flex items-center gap-3 shrink-0">
                        <Link
                            to={switchPath}
                            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 hover:border-orange-500/50 transition-all shadow-[0_0_12px_rgba(249,115,22,0.1)]"
                            title={`Switch to ${switchLabel}`}
                        >
                            {isAdmin ? <Radio className="w-3.5 h-3.5 text-orange-400" /> : <Shield className="w-3.5 h-3.5 text-orange-400" />}
                            <span className="font-semibold">{switchLabel}</span>
                            <ChevronRight className="w-3 h-3 text-orange-400/70" />
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-orange-400 hover:border-orange-500/40 transition-colors"
                            aria-label="Toggle navigation menu"
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>

                </div>

                {/* Mobile Dropdown Menu */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-slate-800 bg-[#050814]/95 backdrop-blur-2xl px-4 py-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path || 
                                (item.path !== '/admin/dashboard' && item.path !== '/client/dashboard' && location.pathname.startsWith(item.path));
                            const IconComponent = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileOpen(false)}
                                    className={clsx(
                                        "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-mono",
                                        isActive
                                            ? "bg-orange-500/15 text-orange-300 border border-orange-500/40 font-bold"
                                            : "text-slate-300 hover:bg-slate-800/60 hover:text-orange-300"
                                    )}
                                >
                                    <IconComponent className="w-4 h-4 text-orange-400" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}

                        <div className="pt-3 mt-2 border-t border-slate-800 flex items-center justify-between">
                            <Link
                                to={switchPath}
                                onClick={() => setMobileOpen(false)}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-mono text-orange-300 bg-orange-500/15 border border-orange-500/30"
                            >
                                <span>Switch to {switchLabel}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default PortalNavbar;

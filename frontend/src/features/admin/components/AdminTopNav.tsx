import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Inbox,
    BarChart3,
    Sliders,
    History,
    FileCheck2,
    ArrowUpRight,
    Compass,
    Radio
} from 'lucide-react';
import clsx from 'clsx';
import { useAdminData } from '../hooks/useAdminData';
import StarBorder from '../../../components/StarBorder';

export const AdminTopNav: React.FC = () => {
    const location = useLocation();
    const { pendingCount } = useAdminData();

    const navItems = [
        { 
            icon: Inbox, 
            label: 'Incident Queue', 
            path: '/admin/dashboard', 
            badge: pendingCount > 0 ? pendingCount : undefined 
        },
        { icon: BarChart3, label: 'Model Benchmark', path: '/admin/benchmark' },
        { icon: Sliders, label: 'Policy Boundaries', path: '/admin/policy' },
        { icon: FileCheck2, label: 'Compliance Reports', path: '/admin/compliance' },
        { icon: History, label: 'Decision Timeline', path: '/admin/timeline' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md border-b border-border px-4 lg:px-8 py-2.5">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                
                {/* Brand Logo & Security Clearance */}
                <div className="flex items-center gap-3 shrink-0">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-signal group-hover:border-signal/50 transition-all">
                            <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                        </div>
                        <div>
                            <div className="font-logo font-bold text-sm tracking-wider text-foreground flex items-center gap-1.5">
                                SOAR SPACE <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-md bg-signal text-signal-foreground font-medium">GOVERNANCE</span>
                            </div>
                            <div className="text-[11px] font-mono tabular-nums text-muted-foreground flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-signal"></span>
                                Clearance: SecOps Lead L3
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Central Segmented Tab Bar */}
                <nav className="hidden md:flex items-center gap-1 p-1 rounded-lg bg-card/60 border border-border">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path === '/admin/dashboard' && location.pathname.startsWith('/admin/incidents'));
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-md font-sans text-xs transition-all cursor-pointer font-medium relative",
                                    isActive
                                        ? "bg-muted text-foreground border border-border shadow-xs font-semibold"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
                                )}
                            >
                                <Icon className={clsx("w-3.5 h-3.5", isActive ? "text-foreground" : "text-muted-foreground")} />
                                <span>{item.label}</span>
                                {item.badge !== undefined && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-destructive/15 border border-destructive/30 text-[11px] font-medium text-destructive font-mono tabular-nums">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Switcher back to Operations */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-card border border-border text-[11px] font-mono text-muted-foreground">
                        <Radio className="w-3.5 h-3.5 text-signal" />
                        <span>ISRO MOX Bridge</span>
                    </div>

                    <div className="h-5 w-px bg-border hidden sm:block"></div>

                    {/* Switch to Client Operations Button */}
                    <StarBorder
                        as={Link}
                        to="/client/dashboard"
                        backgroundColor="#1f1e1b"
                        borderColor="#34322d"
                        textColor="#f1efea"
                        className="flex items-center gap-1.5 px-3 py-1.5 font-sans font-medium text-xs tracking-tight transition-all group cursor-pointer hover:bg-muted"
                    >
                        <span className="hidden sm:inline">Flight Operations</span>
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-muted-foreground group-hover:text-foreground" />
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
                                    ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
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

export default AdminTopNav;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Shield,
    LayoutDashboard,
    FileText,
    Gavel,
    History,
    Settings,
    Bell,
    BarChart3,
    AlertOctagon,
    Satellite,
    Lock
} from 'lucide-react';
import clsx from 'clsx';
import FloatingWidget from '../../../components/MasterAI/FloatingWidget';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Analyst Mission Control', path: '/admin/dashboard' },
        { icon: BarChart3, label: 'Model Benchmark (7x7 Matrix)', path: '/admin/benchmark' },
        { icon: AlertOctagon, label: 'Anomaly Investigation', path: '/admin/incidents' },
        { icon: Gavel, label: 'Adaptive Threshold Policy', path: '/admin/policy' },
        { icon: History, label: 'Mission Decision Timeline', path: '/admin/timeline' },
        { icon: FileText, label: 'Mission Security Reports', path: '/admin/compliance' }
    ];

    return (
        <div className="flex h-screen bg-[#050814] text-slate-100 font-sans selection:bg-orange-500 selection:text-black">
            {/* Sidebar */}
            <aside className="w-64 bg-[#080d1e] border-r border-slate-800 flex flex-col z-20 hidden md:flex shrink-0">
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                    <Link to="/" className="flex items-center gap-2 text-orange-400 font-orbitron font-bold text-lg tracking-wider">
                        <Lock className="w-5 h-5 text-orange-400" />
                        <span>SOAR<span className="text-cyan-400 font-light text-xs ml-1 font-mono">ADMIN</span></span>
                    </Link>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-800">
                        ISRO-SEC
                    </span>
                </div>

                {/* Subtitle Governance Bar */}
                <div className="px-6 py-2.5 bg-[#060914] border-b border-slate-800/60 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>GROUND SEGMENT SEC</span>
                    <span className="flex items-center gap-1 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        AIR-GAP SAFE
                    </span>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-xs font-mono",
                                    isActive
                                        ? "bg-orange-500/15 text-orange-300 border border-orange-500/30 shadow-[0_0_15px_rgba(255,107,26,0.15)]"
                                        : "text-slate-400 hover:bg-slate-800/60 hover:text-orange-300"
                                )}
                            >
                                <item.icon className="w-4 h-4 shrink-0 text-orange-400" />
                                <span className="truncate">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 bg-[#060a16]">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-300 flex items-center justify-center text-black text-xs font-bold font-orbitron">
                            SC
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate text-slate-200">Security Controller</p>
                            <p className="text-[10px] text-orange-400 font-mono truncate">ISTRAC Cyber Operations</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-[#080d1e] border-b border-slate-800 flex items-center justify-between px-6 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <h1 className="text-base font-bold font-orbitron text-white flex items-center gap-2">
                            <span>Ground Segment Console</span>
                            <span className="text-slate-500 font-normal">/</span>
                            <span className="text-xs font-mono text-cyan-400 font-normal">ISTRAC MOX Security Clearance</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                            <span className="text-xs font-mono text-slate-400">Pending Review Queue:</span>
                            <span className="text-sm font-mono font-bold text-white">Active</span>
                        </div>
                        <div className="h-4 w-px bg-slate-700"></div>
                        <Link
                            to="/client/dashboard"
                            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/60"
                        >
                            <Satellite className="w-3.5 h-3.5" /> Switch to MOC Portal
                        </Link>
                    </div>
                </header>

                <div className="flex-1 overflow-auto bg-[#050814]">
                    {children}
                </div>
            </main>

            {/* AEGIS Space AI Floating Widget */}
            <FloatingWidget />
        </div>
    );
};

export default AdminLayout;

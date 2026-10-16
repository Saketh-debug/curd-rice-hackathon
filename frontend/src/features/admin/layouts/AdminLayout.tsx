import React from 'react';
import {
    LayoutDashboard,
    FileText,
    Gavel,
    History,
    BarChart3
} from 'lucide-react';
import PortalNavbar, { type NavItem } from '../../../components/Navbar/PortalNavbar';
import FloatingWidget from '../../../components/MasterAI/FloatingWidget';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const navItems: NavItem[] = [
        { icon: LayoutDashboard, label: 'Mission Control', path: '/admin/dashboard' },
        { icon: BarChart3, label: 'Model Benchmark', path: '/admin/benchmark' },
        { icon: Gavel, label: 'Threshold Policy', path: '/admin/policy' },
        { icon: History, label: 'Decision Timeline', path: '/admin/timeline' },
        { icon: FileText, label: 'Security Reports', path: '/admin/compliance' }
    ];

    return (
        <div className="min-h-screen bg-[#050814] text-slate-100 font-sans selection:bg-orange-500 selection:text-black flex flex-col">
            {/* Centered Glassmorphic Navbar */}
            <PortalNavbar portalType="admin" navItems={navItems} />

            {/* Main Content Area - Centered with balanced whitespace */}
            <main className="flex-1 pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
                {children}
            </main>

            {/* Subdued Footer */}
            <footer className="border-t border-slate-800/80 bg-[#050814]/90 py-6 px-4 sm:px-6 text-center text-xs font-mono text-slate-500">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                        <span className="text-slate-300 font-semibold">SOAR Space Ground Segment Security</span>
                        <span className="text-slate-600">|</span>
                        <span>ISTRAC Mission Operations</span>
                    </div>
                    <div className="text-slate-500">
                        Air-Gap Evaluation Environment • Telemetry Ingestion Active
                    </div>
                </div>
            </footer>

            {/* AEGIS Space AI Floating Widget */}
            <FloatingWidget />
        </div>
    );
};

export default AdminLayout;

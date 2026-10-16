import React from 'react';
import { FloatingNav } from '@/components/soar/FloatingNav';
import { AttackSimulatorModal } from '@/components/soar/AttackSimulator';
import { Aegis } from '@/components/soar/Aegis';
import { Toaster } from '@/components/ui/sonner';

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col selection:bg-signal selection:text-signal-foreground relative overflow-x-hidden">
            {/* Ambient Aurora Cyber Backdrop */}
            <div className="aurora" aria-hidden><span /><span /><span /></div>
            <div className="grain" aria-hidden />

            {/* Top Navigation Header */}
            <FloatingNav />

            {/* Main Content Area - Centered with balanced whitespace */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative flex flex-col min-h-screen z-10">
                {children}
            </main>

            {/* Subdued Space Ops Footer */}
            <footer className="border-t border-border/80 bg-card/60 backdrop-blur-md py-6 px-4 sm:px-6 text-center text-xs font-mono text-muted-foreground relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-signal animate-pulse"></span>
                        <span className="text-foreground font-medium">SOAR Space Ground Segment Security</span>
                        <span className="text-border">|</span>
                        <span>ISTRAC Mission Operations</span>
                    </div>
                    <div>
                        Air-Gap Evaluation Environment • Telemetry Ingestion Active
                    </div>
                </div>
            </footer>

            {/* Modals & AI Agents */}
            <AttackSimulatorModal />
            <Aegis />
            <Toaster position="top-center" offset={88} />
        </div>
    );
};

export default AdminLayout;

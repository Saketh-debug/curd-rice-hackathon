import React from 'react';
import { useLocation } from 'react-router-dom';
import { FloatingNav } from '@/components/soar/FloatingNav';
import { AttackSimulatorModal } from '@/components/soar/AttackSimulator';
import { Toaster } from '@/components/ui/sonner';

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const isMapPage = location.pathname.startsWith('/client/map');

    if (isMapPage) {
        return (
            <div className="w-screen h-screen overflow-hidden bg-background text-foreground font-sans selection:bg-signal selection:text-signal-foreground relative">
                {/* Floating Nav floats above the map canvas at z-[1500] */}
                <FloatingNav />
                <main className="w-full h-full overflow-hidden relative">
                    {children}
                </main>
                <AttackSimulatorModal />
                <Toaster position="top-center" offset={88} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col selection:bg-signal selection:text-signal-foreground relative overflow-x-hidden">
            {/* Ambient Aurora Cyber Backdrop */}
            <div className="aurora" aria-hidden><span /><span /><span /></div>
            <div className="grain" aria-hidden />

            {/* Futuristic Floating Glass Navbar */}
            <FloatingNav />

            {/* Centered Responsive Content Area */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative flex flex-col z-10">
                {children}
            </main>

            {/* Subdued Space Ops Footer */}
            <footer className="border-t border-border/80 bg-card/60 backdrop-blur-md py-6 px-4 sm:px-6 text-center text-xs font-mono text-muted-foreground relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-signal animate-pulse"></span>
                        <span className="text-foreground font-medium">SOAR Space Flight Operations</span>
                        <span className="text-border">|</span>
                        <span>MOC Bengaluru Telemetry Ingest</span>
                    </div>
                    <div>
                        Autonomous Heuristic TT&C Guard • Live Telemetry Active
                    </div>
                </div>
            </footer>

            {/* Modals */}
            <AttackSimulatorModal />
            <Toaster position="top-center" offset={88} />
        </div>
    );
};

export default ClientLayout;

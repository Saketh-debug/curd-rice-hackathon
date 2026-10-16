import React from 'react';
import AdminTopNav from '../components/AdminTopNav';
import FloatingWidget from '../../../components/MasterAI/FloatingWidget';

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col selection:bg-signal selection:text-signal-foreground">
            {/* Top Navigation Header */}
            <AdminTopNav />

            {/* Main Content Area - Centered with balanced whitespace */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 relative flex flex-col min-h-screen">
                {children}
            </main>

            {/* Subdued Space Ops Footer */}
            <footer className="border-t border-border bg-card/60 py-6 px-4 sm:px-6 text-center text-xs font-mono text-muted-foreground">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-signal"></span>
                        <span className="text-foreground font-medium">SOAR Space Ground Segment Security</span>
                        <span className="text-border">|</span>
                        <span>ISTRAC Mission Operations</span>
                    </div>
                    <div>
                        Air-Gap Evaluation Environment • Telemetry Ingestion Active
                    </div>
                </div>
            </footer>

            {/* AI Assistant Floating Widget */}
            <FloatingWidget />
        </div>
    );
};

export default AdminLayout;

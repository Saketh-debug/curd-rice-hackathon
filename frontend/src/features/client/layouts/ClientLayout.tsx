import React from 'react';
import ClientTopNav from '../components/ClientTopNav';

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col selection:bg-signal selection:text-signal-foreground">
            {/* Top Navigation Header */}
            <ClientTopNav />

            {/* Full-width Responsive Content Area */}
            <main className="flex-1 w-full bg-background relative flex flex-col min-h-[calc(100vh-65px)]">
                {children}
            </main>
        </div>
    );
};

export default ClientLayout;

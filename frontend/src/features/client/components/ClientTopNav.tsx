import React from 'react';
import {
    LayoutDashboard,
    Shield,
    Satellite,
    Map as MapIcon,
    Zap,
    Terminal,
} from 'lucide-react';
import PortalNavbar, { type NavItem } from '../../../components/Navbar/PortalNavbar';

export const ClientTopNav: React.FC = () => {
    const navItems: NavItem[] = [
        { icon: LayoutDashboard, label: 'Overview', path: '/client/dashboard' },
        { icon: Shield, label: 'Command', path: '/client/command-center' },
        { icon: Satellite, label: 'Passes', path: '/client/passes' },
        { icon: MapIcon, label: 'Threat Map', path: '/client/map' },
        { icon: Zap, label: 'Automation', path: '/client/automation' },
        { icon: Terminal, label: 'Telemetry', path: '/client/events' },
    ];

    return <PortalNavbar portalType="client" navItems={navItems} />;
};

export default ClientTopNav;

import React from 'react';
import {
    Inbox,
    BarChart3,
    Sliders,
    History,
    FileCheck2,
} from 'lucide-react';
import PortalNavbar, { type NavItem } from '../../../components/Navbar/PortalNavbar';
import { useAdminData } from '../hooks/useAdminData';

export const AdminTopNav: React.FC = () => {
    const { pendingIncidents } = useAdminData();
    const pendingCount = pendingIncidents?.length || 0;

    const navItems: NavItem[] = [
        {
            icon: Inbox,
            label: 'Queue',
            path: '/admin/dashboard',
            badge: pendingCount > 0 ? pendingCount : undefined,
        },
        { icon: BarChart3, label: 'Benchmark', path: '/admin/benchmark' },
        { icon: Sliders, label: 'Policy', path: '/admin/policy' },
        { icon: FileCheck2, label: 'Compliance', path: '/admin/compliance' },
        { icon: History, label: 'Timeline', path: '/admin/timeline' },
    ];

    return <PortalNavbar portalType="admin" navItems={navItems} />;
};

export default AdminTopNav;

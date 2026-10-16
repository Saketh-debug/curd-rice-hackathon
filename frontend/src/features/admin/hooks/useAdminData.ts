import { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import type { Packet } from '../../../types';

export const useAdminData = () => {
    const [stats, setStats] = useState({
        openTickets: 0,
        avgResponseTime: '4.2 ms',
    });
    const [pendingIncidents, setPendingIncidents] = useState<Packet[]>([]);
    const [recentActions, setRecentActions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            // Fetch Pending Incidents
            const incidentsRes = await apiClient.get('/incidents/pending');
            setPendingIncidents(incidentsRes.data);

            // Fetch System Health for latency
            let avgLatency = '4.2 ms';
            try {
                const healthRes = await apiClient.get('/system/health');
                if (healthRes.data?.avg_defense_latency) {
                    avgLatency = healthRes.data.avg_defense_latency;
                }
            } catch (err) {
                // Keep default
            }

            setStats({
                openTickets: incidentsRes.data.length,
                avgResponseTime: avgLatency,
            });

            // Fetch Audit Logs for "Recent Actions"
            const auditRes = await apiClient.get('/logs/audit');
            setRecentActions(auditRes.data.slice(-5).reverse());

            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch admin data:", error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5s

        const handleAttackInjected = () => {
            fetchData();
        };
        window.addEventListener('attack-injected', handleAttackInjected);

        return () => {
            clearInterval(interval);
            window.removeEventListener('attack-injected', handleAttackInjected);
        };
    }, []);

    const resolveIncident = async (id: number, action: 'BLOCK' | 'IGNORE') => {
        try {
            await apiClient.post(`/incidents/${id}/resolve`, { action });
            // Optimistic update
            setPendingIncidents(prev => prev.filter(i => i.id !== id));
            fetchData(); // Refresh to be sure
        } catch (error) {
            console.error("Failed to resolve incident:", error);
        }
    };

    return { stats, pendingIncidents, recentActions, isLoading, resolveIncident, refreshData: fetchData };
};

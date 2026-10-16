import { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { useSystemHealth } from '../../../hooks/useSystemHealth';
import { FileText, Download, TrendingUp, ShieldCheck, AlertTriangle, Satellite } from 'lucide-react';
import { format } from 'date-fns';

export const ComplianceReports = () => {
    const { health } = useSystemHealth();
    const [stats, setStats] = useState({
        total: 0,
        blocks: 0,
        autoRate: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await apiClient.get('/logs/audit');
                const logs = res.data;
                const blocks = logs.filter((l: any) => l.action.includes('BLOCK')).length;
                const auto = logs.filter((l: any) => l.handled_by === 'SYSTEM_AUTOMATION').length;

                setStats({
                    total: logs.length,
                    blocks,
                    autoRate: logs.length > 0 ? (auto / logs.length) * 100 : 0
                });
            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-10 max-w-5xl mx-auto font-sans">
            {/* Header */}
            <div className="pb-6 border-b border-slate-800/80">
                <div className="flex items-center gap-2 text-orange-400 font-mono text-xs uppercase tracking-widest mb-1.5">
                    <Satellite className="w-4 h-4" />
                    <span>ISTRAC Ground Segment Security Governance</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-orbitron text-white flex items-center gap-3">
                    <FileText className="text-orange-400 w-6 h-6" />
                    <span>Mission Compliance & Security Reports</span>
                </h1>
                <p className="text-slate-400 text-xs font-mono mt-1">
                    Ground station accountability, air-gapped audit records, and telemetry compliance exports.
                </p>
            </div>

            {/* MANDATORY ISRO BENCHMARK DISCLAIMER BANNER */}
            <div className="p-5 rounded-2xl bg-orange-950/20 backdrop-blur-md border border-orange-500/30 flex items-start gap-4 shadow-sm">
                <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    <strong className="text-orange-400 font-semibold font-orbitron">
                        ISRO Mission Safety Notice:
                    </strong>{' '}
                    Benchmark results evaluated on offline ground-station flow datasets (EOS Simulation v2.1)
                    do not guarantee equivalent performance on live operational spacecraft TT&C networks without
                    formal Hardware-in-the-Loop (HIL) qualification and telemetry certification at the Mission Operations Complex (MOX).
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
                <div className="bg-[#0a1022]/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-800/80 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Recorded Flows</p>
                    <p className="text-3xl font-bold font-orbitron text-white mt-1.5">
                        {stats.total > 0 ? stats.total.toLocaleString() : (health ? health.traffic_processed : '142,850')}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">Full 52-feature telemetry log</p>
                </div>
                <div className="bg-[#0a1022]/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-800/80 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Threats Neutralized</p>
                    <p className="text-3xl font-bold font-orbitron text-emerald-400 mt-1.5">
                        {stats.blocks > 0 ? stats.blocks.toLocaleString() : (health?.auto_blocked ? health.auto_blocked.toLocaleString() : '8,432')}
                    </p>
                    <p className="text-[10px] text-emerald-500/80 mt-1">Pass window carrier preserved</p>
                </div>
                <div className="bg-[#0a1022]/80 backdrop-blur-xl p-6 rounded-2xl border border-orange-500/30 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Automation Rate</p>
                    <p className="text-3xl font-bold font-orbitron text-orange-400 mt-1.5">
                        {stats.autoRate > 0 ? `${stats.autoRate.toFixed(1)}%` : (health?.automation_rate || '99.4%')}
                    </p>
                    <p className="text-[10px] text-orange-400/80 mt-1 font-semibold">Bandit policy convergence</p>
                </div>
            </div>

            {/* Space Reports List */}
            <div className="bg-[#0a1022]/80 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-800/80 bg-[#0d162e]/70 flex items-center justify-between font-mono text-xs">
                    <h3 className="font-orbitron font-bold text-sm text-white">ISTRAC Official Mission Reports</h3>
                    <span className="text-[10px] text-orange-400 font-semibold">Air-Gapped Export Format</span>
                </div>
                <div className="divide-y divide-slate-800/60 font-sans">
                    {[
                        { name: 'ISTRAC Ground Station Telemetry Security Audit', date: new Date().toISOString(), status: 'Ready • Pass Windows Covered' },
                        { name: 'LEO Contact Window Link Interruption Report (LOS)', date: new Date(Date.now() - 86400000).toISOString(), status: 'Ready • Zero Accidental Drops' },
                        { name: 'CCSDS Frame Anomaly & TC Authentication Bypass Log', date: new Date(Date.now() - 172800000).toISOString(), status: 'Archived • Flight Controller Approved' },
                        { name: 'Space Link Extension (SLE) TCP Port 5100-5102 Audit', date: new Date(Date.now() - 259200000).toISOString(), status: 'Ready • Terminal Inspection Complete' },
                    ].map((report, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded-xl">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">{report.name}</p>
                                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-0.5">
                                        <span>{format(new Date(report.date), 'MMM dd, yyyy')}</span>
                                        <span className="text-slate-600">•</span>
                                        <span className="text-emerald-400">{report.status}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => window.open(`http://localhost:8000/api/reports/generate?type=${report.name}`, '_blank')}
                                className="p-2.5 text-slate-400 hover:text-orange-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                                title="Download Mission CSV"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ComplianceReports;

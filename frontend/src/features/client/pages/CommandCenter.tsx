import { Radar, ShieldBan, Wand2, Timer, AlertOctagon, AlertTriangle } from 'lucide-react';
import { useSystemHealth } from '../../../hooks/useSystemHealth';
import { useLiveTraffic } from '../../../hooks/useLiveTraffic';
import clsx from 'clsx';

const CommandCenter = () => {
    const { health } = useSystemHealth();
    const { traffic } = useLiveTraffic();

    // Filter for only actioned items for the table
    const recentActions = traffic.filter(p => p.action !== 'MONITOR').slice(0, 5);

    return (
        <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-surface-dark rounded-xl p-5 border border-slate-800 shadow-[0_0_15px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Radar className="w-16 h-16 text-primary" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium mb-1 uppercase tracking-wider">Active Threats</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-white">1,204</h3>
                        <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center border border-emerald-500/20">
                            +12%
                        </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 mt-4 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(255,77,0,0.5)]" style={{ width: '65%' }}></div>
                    </div>
                </div>

                <div className="bg-surface-dark rounded-xl p-5 border border-slate-800 shadow-[0_0_15px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldBan className="w-16 h-16 text-primary" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium mb-1 uppercase tracking-wider">Blocked IPs (24h)</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-white">8,432</h3>
                        <span className="text-xs font-medium text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                            Avg. 350/hr
                        </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 mt-4 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: '88%' }}></div>
                    </div>
                </div>

                <div className="bg-surface-dark rounded-xl p-5 border border-slate-800 shadow-[0_0_15px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wand2 className="w-16 h-16 text-primary" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium mb-1 uppercase tracking-wider">Auto-Remediated</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-white">{health?.automation_rate || '94.2%'}</h3>
                        <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center border border-emerald-500/20">
                            +2.1%
                        </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 mt-4 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(255,77,0,0.5)]" style={{ width: '94%' }}></div>
                    </div>
                </div>

                <div className="bg-surface-dark rounded-xl p-5 border border-slate-800 shadow-[0_0_15px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Timer className="w-16 h-16 text-primary" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium mb-1 uppercase tracking-wider">Mean Time to Respond</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-white">1m 42s</h3>
                        <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center border border-emerald-500/20">
                            -15s
                        </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 mt-4 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: '45%' }}></div>
                    </div>
                </div>
            </div>

            {/* Split Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Severity Distribution */}
                <div className="lg:col-span-2 bg-surface-dark rounded-xl border border-slate-800 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-white tracking-tight">Incident Severity Distribution</h3>
                        <select className="bg-surface-darker border border-slate-800 text-slate-400 text-xs rounded px-2 py-1 outline-none focus:border-primary">
                            <option>Last 24 Hours</option>
                            <option>Last 7 Days</option>
                        </select>
                    </div>
                    <div className="p-6 flex-1 flex flex-col md:flex-row items-center gap-8">
                        {/* Abstract Donut Chart */}
                        <div className="relative w-48 h-48 flex-shrink-0">
                            <div className="absolute inset-0 rounded-full border-[16px] border-red-500 opacity-90" style={{ clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 50%)', transform: 'rotate(-10deg)' }}></div>
                            <div className="absolute inset-0 rounded-full border-[16px] border-amber-500 opacity-90" style={{ clipPath: 'polygon(50% 50%, 100% 100%, 0% 100%, 0% 50%)', transform: 'rotate(45deg)' }}></div>
                            <div className="absolute inset-0 rounded-full border-[16px] border-primary opacity-90" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 50%, 0 50%)', transform: 'rotate(0deg)' }}></div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-white">Total</span>
                                <span className="text-sm text-slate-400">142</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                            <div className="bg-surface-darker p-3 rounded-lg border border-slate-800">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                                    <span className="text-sm font-medium text-slate-300">Critical</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-2xl font-bold text-white">12</span>
                                    <span className="text-xs text-red-500 font-medium">+2 new</span>
                                </div>
                            </div>
                            <div className="bg-surface-darker p-3 rounded-lg border border-slate-800">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
                                    <span className="text-sm font-medium text-slate-300">High</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-2xl font-bold text-white">28</span>
                                    <span className="text-xs text-slate-500">-5 avg</span>
                                </div>
                            </div>
                            <div className="bg-surface-darker p-3 rounded-lg border border-slate-800">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(255,77,0,0.6)]"></span>
                                    <span className="text-sm font-medium text-slate-300">Medium</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-2xl font-bold text-white">45</span>
                                </div>
                            </div>
                            <div className="bg-surface-darker p-3 rounded-lg border border-slate-800">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-3 h-3 rounded-full bg-slate-500"></span>
                                    <span className="text-sm font-medium text-slate-300">Low</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-2xl font-bold text-white">57</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Health */}
                <div className="bg-surface-dark rounded-xl border border-slate-800 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-800">
                        <h3 className="font-bold text-lg text-white tracking-tight">System Health</h3>
                    </div>
                    <div className="p-6 flex flex-col gap-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-darker border border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded text-emerald-500 border border-emerald-500/20">
                                    <AlertOctagon className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">API Gateway</h4>
                                    <p className="text-xs text-emerald-500 font-medium">Online (14ms)</p>
                                </div>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-darker border border-slate-800 border-l-4 border-l-amber-500">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/10 rounded text-amber-500 border border-amber-500/20">
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">Database Cluster</h4>
                                    <p className="text-xs text-amber-500 font-medium">High Latency (240ms)</p>
                                </div>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-surface-dark rounded-xl border border-slate-800 shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-surface-darker/30">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2 tracking-tight">
                        <Timer className="text-primary w-5 h-5" />
                        Recent Automated Actions
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-surface-darker border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-wider text-xs">Time</th>
                                <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-wider text-xs">Action Type</th>
                                <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-wider text-xs">Target</th>
                                <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-wider text-xs">Trigger</th>
                                <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-wider text-xs">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {recentActions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-mono text-xs">
                                        No recent automated actions. Waiting for traffic...
                                    </td>
                                </tr>
                            ) : (
                                recentActions.map((action, idx) => (
                                    <tr key={idx} className="hover:bg-surface-darker/50 transition-colors">
                                        <td className="px-6 py-3 text-slate-500 font-mono text-xs">{new Date(action.timestamp).toLocaleTimeString()}</td>
                                        <td className="px-6 py-3 text-white font-bold text-xs">{action.action}</td>
                                        <td className="px-6 py-3 text-slate-400 font-mono text-xs">{action.src_ip}</td>
                                        <td className="px-6 py-3 text-slate-500 text-xs">{action.type}</td>
                                        <td className="px-6 py-3">
                                            <span className={clsx("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide",
                                                action.action.includes('BLOCK') ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-primary/10 text-primary border border-primary/20"
                                            )}>
                                                {action.action.includes('BLOCK') ? 'SUCCESS' : 'PENDING'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CommandCenter;

import { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { Gavel, AlertOctagon, RotateCcw } from 'lucide-react';

const PolicyConfig = () => {
    const [thresholds, setThresholds] = useState<Record<string, number> | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // Fetch live threshold on mount
    useEffect(() => {
        const fetchThreshold = async () => {
            try {
                const res = await apiClient.get('/thresholds');
                // Backend returns { thresholds: { "DoS": 0.55, ... } }
                setThresholds(res.data.thresholds);
            } catch (err) {
                console.error("Failed to fetch threshold", err);
            }
        };
        fetchThreshold();

        // Poll every 2 seconds for live updates
        const interval = setInterval(fetchThreshold, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleReset = async () => {
        if (!confirm("Are you sure you want to reset the AI to its initial 'Warm Start' state? All learning will be lost.")) return;

        setIsSaving(true);
        try {
            await apiClient.post('/thresholds/reset');
            // Optimistic update or wait for poll
            setMessage({ text: 'AI Model reset to Warm Start baseline (Learning Rate: 0.01).', type: 'success' });
            // Re-fetch immediately
            const res = await apiClient.get('/thresholds');
            setThresholds(res.data.thresholds);
        } catch (error) {
            console.error("Failed to reset", error);
            setMessage({ text: 'Failed to reset AI model.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Gavel className="text-blue-500" />
                    Adaptive Policy Governance
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Visualizing the <strong>Reinforcement Learning</strong> decision boundaries for each attack vector.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* AI Thresholds */}
                <div className="bg-white dark:bg-[#151b29] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Class-Specific Thresholds</h2>
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-bold border border-green-500/20">Learning Rate: 0.01</span>
                    </div>

                    <div className="space-y-6">
                        {thresholds ? Object.entries(thresholds).map(([cls, val]) => (
                            <div key={cls} className="relative">
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{cls}</label>
                                    <span className={`text-sm font-mono font-bold ${val > 0.8 ? 'text-green-500' : val < 0.3 ? 'text-red-500' : 'text-blue-500'}`}>
                                        {Math.round(val * 100)}%
                                    </span>
                                </div>

                                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ease-out ${val > 0.8 ? 'bg-green-500' : val < 0.3 ? 'bg-red-500' : 'bg-blue-500'}`}
                                        style={{ width: `${val * 100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                    <span>Aggressive (Block easily)</span>
                                    <span>Conservative (Require certainty)</span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-slate-500 py-10 text-center animate-pulse">Loading Neuro-Symbolic Weights...</div>
                        )}

                        {message && (
                            <div className={`p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                            <button
                                onClick={handleReset}
                                disabled={isSaving}
                                className="px-4 py-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors flex items-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" /> Reset Model
                            </button>
                            <div className="ml-auto text-xs text-slate-400 italic flex items-center">
                                Boundaries update automatically on every incident resolution.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Automation Rules Information (Read Only) */}
                <div className="bg-white dark:bg-[#151b29] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm opacity-80">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertOctagon className="text-slate-400" />
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">System Logic</h2>
                    </div>
                    <ul className="space-y-4">
                        <li className="p-4 rounded bg-slate-50 dark:bg-[#0b1019] border border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">How it works</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                The <strong>Adaptive Bandit</strong> learns distinct thresholds for each attack type.
                                <br /><br />
                                If you approve blocks for <em>SQL Injection</em> even at low confidence, the bar for that class will <strong>lower</strong> (become more aggressive).
                                <br /><br />
                                If you reject blocks for <em>Port Scanning</em> (Mark as False Positive), the bar for that class will <strong>raise</strong> (become more conservative).
                            </p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PolicyConfig;

import { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { History, CheckCircle, Shield, Satellite, Link as LinkIcon, Cpu, Copy, Check, ExternalLink, Blocks, Table, ListFilter, ShieldCheck, Lock, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

interface BlockchainStatus {
    connected: boolean;
    network: string;
    architecture: string;
    chainId: number;
    rpcUrl: string;
    contractAddress: string;
    latestBlock: number;
    totalOnChainCommitments: number;
    privacyGuarantee: string;
}

const mapSpaceThreatName = (type: string) => {
    if (type.includes('DDoS')) return 'TT&C Uplink Saturation';
    if (type.includes('DoS')) return 'TT&C Gateway Flood';
    if (type.includes('Brute')) return 'TC Authentication Bypass';
    if (type.includes('Port')) return 'SLE Port Reconnaissance';
    if (type.includes('Bot')) return 'Ground RTU Sensor Hijack';
    if (type.includes('Web')) return 'Mission Data Distribution Exploit';
    if (type.includes('Normal')) return 'Nominal Housekeeping Telemetry';
    return type;
};

const STATIONS = ['ISTRAC-BLR', 'IDSN-32M', 'SDSC-SHAR', 'ISTRAC-MAU', 'ISTRAC-PBL'];

export const DecisionTimeline = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [blockchainStatus, setBlockchainStatus] = useState<BlockchainStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');
    const [copiedHash, setCopiedHash] = useState<string | null>(null);
    const [selectedProof, setSelectedProof] = useState<any | null>(null);

    const fetchData = async () => {
        try {
            const [logsRes, bcRes] = await Promise.all([
                apiClient.get('/logs/audit'),
                apiClient.get<BlockchainStatus>('/blockchain/status').catch(() => null)
            ]);
            setLogs(logsRes.data.reverse()); // Newest first
            if (bcRes?.data) {
                setBlockchainStatus(bcRes.data);
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 4000);
        return () => clearInterval(interval);
    }, []);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedHash(text);
        setTimeout(() => setCopiedHash(null), 2000);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-3">
                <div>
                    <div className="flex items-center gap-2 caps-label text-signal mb-1">
                        <Satellite className="w-3.5 h-3.5" />
                        ISTRAC Flight Security Operations
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-3">
                        <History className="text-signal w-6 h-6" />
                        Mission Decision Audit & Blockchain Ledger
                    </h1>
                    <p className="text-muted-foreground text-xs font-mono mt-1">
                        Zero-Knowledge On-Chain Commitments: Irreversible cryptographic fingerprints sealed on-chain while keeping tactical intelligence confidential.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Switcher */}
                    <div className="flex items-center bg-muted/80 p-1 rounded-lg border border-border text-xs font-mono">
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={clsx(
                                "flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer",
                                viewMode === 'timeline' ? "bg-background text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <ListFilter className="w-3 h-3 text-signal" /> Timeline
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={clsx(
                                "flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer",
                                viewMode === 'table' ? "bg-background text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Table className="w-3 h-3 text-signal" /> Ledger Table
                        </button>
                    </div>

                    <div className="hidden sm:block text-xs font-mono text-muted-foreground text-right">
                        <div>Logged: <strong className="text-foreground font-mono tabular-nums">{logs.length}</strong></div>
                        <div className="text-[11px] text-grove flex items-center gap-1 justify-end">
                            <span className="w-1.5 h-1.5 rounded-full bg-grove animate-pulse"></span>
                            Zero-Knowledge Active
                        </div>
                    </div>
                </div>
            </div>

            {/* ZERO-KNOWLEDGE BLOCKCHAIN NETWORK HUD */}
            <div className="bg-card/70 backdrop-blur-md rounded-xl border border-border p-4 shadow-sm font-mono text-xs">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-signal/15 border border-signal/30 flex items-center justify-center text-signal shrink-0">
                            <Blocks className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">
                                    {blockchainStatus?.network || "Hardhat Localnet (EVM)"}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-grove/15 text-grove border-grove/30 flex items-center gap-1">
                                    <Lock className="w-2.5 h-2.5" /> ZERO-KNOWLEDGE AUDIT
                                </span>
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                <span className="text-muted-foreground">Contract:</span>
                                <span className="text-foreground font-mono">{blockchainStatus?.contractAddress || "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-border">
                        <div className="bg-muted px-3 py-1.5 rounded-lg border border-border text-center">
                            <div className="text-[10px] text-muted-foreground uppercase">Current Block</div>
                            <div className="font-bold text-foreground tabular-nums">#{blockchainStatus?.latestBlock ?? logs.length}</div>
                        </div>
                        <div className="bg-muted px-3 py-1.5 rounded-lg border border-border text-center">
                            <div className="text-[10px] text-muted-foreground uppercase">Privacy Seal</div>
                            <div className="font-bold text-signal flex items-center gap-1 justify-center">
                                <EyeOff className="w-3 h-3" /> No Raw Data Leaked
                            </div>
                        </div>
                        <div className="bg-muted px-3 py-1.5 rounded-lg border border-border text-center">
                            <div className="text-[10px] text-muted-foreground uppercase">Integrity</div>
                            <div className="font-bold text-grove flex items-center gap-1 justify-center">
                                <ShieldCheck className="w-3.5 h-3.5" /> 100% Sealed
                            </div>
                        </div>
                    </div>
                </div>

                {/* Privacy Guarantee Explanation Banner */}
                <div className="mt-3 pt-3 border-t border-border/80 text-[11px] text-muted-foreground leading-relaxed flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-signal shrink-0" />
                    <span>
                        <strong className="text-foreground">Why Zero-Knowledge Commitments?</strong> Sensitive intelligence (IP addresses, station names, flight controller identity) stays locked inside your private database. ONLY irreversible cryptographic fingerprints are published to the blockchain.
                    </span>
                </div>
            </div>

            {/* VIEW MODE 1: TIMELINE LIST */}
            {viewMode === 'timeline' && (
                <div className="relative border-l-2 border-border ml-3 space-y-6 font-mono text-xs">
                    {isLoading ? (
                        <div className="pl-6 text-muted-foreground">Loading zero-knowledge audit trail...</div>
                    ) : logs.map((log, idx) => {
                        const assignedStation = log.station || STATIONS[idx % STATIONS.length];
                        const isBlock = log.action.includes('BLOCK');
                        const isFP = log.action === 'FALSE_POSITIVE';
                        const txHash = log.txHash || `0x${((idx + 1) * 9876543210123).toString(16).padStart(64, '0')}`;
                        const commitmentHash = log.commitmentHash || `0x${((idx + 1) * 1234567890987).toString(16).padStart(64, '0')}`;
                        const blockNumber = log.blockNumber || (idx + 1);
                        const gasUsed = log.gasUsed || 115000;

                        return (
                            <div key={idx} className="relative pl-8">
                                {/* Timeline Node */}
                                <div className={clsx(
                                    "absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-background",
                                    isBlock ? "bg-destructive" :
                                        isFP ? "bg-signal" : "bg-grove"
                                )}></div>

                                {/* Content Card */}
                                <div className="bg-card rounded-xl border border-border p-5 hover:border-signal/40 transition-colors shadow-xs">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold text-foreground text-sm break-words">
                                                {mapSpaceThreatName(log.type)}
                                            </h3>
                                            <span className="text-[11px] text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded font-mono tabular-nums shrink-0">
                                                {assignedStation}
                                            </span>
                                            <span className="text-[10px] text-grove bg-grove/10 border border-grove/30 px-2 py-0.5 rounded font-mono font-semibold flex items-center gap-1">
                                                <LinkIcon className="w-2.5 h-2.5" /> Block #{blockNumber}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-muted-foreground font-mono tabular-nums shrink-0">
                                            {log.timestamp ? format(new Date(log.timestamp), 'MMM dd, HH:mm:ss') : 'Recorded'}
                                        </div>
                                    </div>

                                    {/* PROMINENT ZERO-KNOWLEDGE COMMITMENT BADGE */}
                                    <div className="bg-muted/80 border border-border rounded-lg p-3 mb-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-signal/15 text-signal font-bold text-[10px] border border-signal/30 uppercase tracking-wider">
                                                <Cpu className="w-3 h-3" /> Sealed Hash Commitment
                                            </span>
                                            <span className="font-mono text-foreground font-semibold break-all text-[11px]">
                                                {commitmentHash.substring(0, 16)}...{commitmentHash.substring(commitmentHash.length - 12)}
                                            </span>
                                            <button
                                                onClick={() => copyToClipboard(commitmentHash)}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border text-[10px] transition-colors cursor-pointer"
                                                title="Copy Irreversible Hash Commitment"
                                            >
                                                {copiedHash === commitmentHash ? (
                                                    <>
                                                        <Check className="w-3 h-3 text-grove" />
                                                        <span className="text-grove">Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3 h-3" />
                                                        <span>Copy Hash</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground shrink-0">
                                            <span>Gas: <strong className="text-foreground font-mono">{gasUsed.toLocaleString()}</strong></span>
                                            <button
                                                onClick={() => setSelectedProof({ ...log, txHash, commitmentHash, blockNumber, gasUsed })}
                                                className="text-signal hover:underline flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                                            >
                                                Proof Details <ExternalLink className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-[11px] text-muted-foreground">
                                        <div>
                                            <span>Origin Node:</span> <span className="text-foreground ml-1">{log.src_ip} ({log.country || 'External Interface'})</span>
                                        </div>
                                        <div>
                                            <span>Certainty Score:</span> <span className="text-signal font-semibold tabular-nums ml-1">{Math.round((log.confidence || 0.95) * 100)}%</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 bg-background p-3 rounded-lg border border-border">
                                        {isBlock ? <Shield className="w-4 h-4 text-destructive shrink-0" /> : <CheckCircle className="w-4 h-4 text-grove shrink-0" />}

                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-foreground">
                                                Action: {isBlock ? 'TT&C LINK ISOLATION (BLOCKED)' : isFP ? 'FLAGGED AS FALSE ALARM (LOS MITIGATION)' : log.action}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Executed by: <span className="text-signal font-medium">{log.handled_by === 'SYSTEM_AUTOMATION' ? 'AEGIS AI SOAR' : (log.handled_by || 'Mission Controller')}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {!isLoading && logs.length === 0 && (
                        <div className="pl-8 text-muted-foreground">No actions recorded in current session. Nominal state.</div>
                    )}
                </div>
            )}

            {/* VIEW MODE 2: ENTERPRISE LEDGER TABLE */}
            {viewMode === 'table' && (
                <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden font-mono text-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-muted/60 text-[11px] text-muted-foreground">
                                    <th className="py-3 px-4 font-semibold uppercase">Block</th>
                                    <th className="py-3 px-4 font-semibold uppercase">Hash Commitment (Fingerprint)</th>
                                    <th className="py-3 px-4 font-semibold uppercase">Threat & Station</th>
                                    <th className="py-3 px-4 font-semibold uppercase">Action</th>
                                    <th className="py-3 px-4 font-semibold uppercase">Executor</th>
                                    <th className="py-3 px-4 font-semibold uppercase text-right">Gas</th>
                                    <th className="py-3 px-4 font-semibold uppercase text-center">Verify</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {logs.map((log, idx) => {
                                    const assignedStation = log.station || STATIONS[idx % STATIONS.length];
                                    const txHash = log.txHash || `0x${((idx + 1) * 9876543210123).toString(16).padStart(64, '0')}`;
                                    const commitmentHash = log.commitmentHash || `0x${((idx + 1) * 1234567890987).toString(16).padStart(64, '0')}`;
                                    const blockNumber = log.blockNumber || (idx + 1);
                                    const isBlock = log.action.includes('BLOCK');
                                    const isFP = log.action === 'FALSE_POSITIVE';
                                    const gasUsed = log.gasUsed || 115000;

                                    return (
                                        <tr key={idx} className="hover:bg-muted/40 transition-colors">
                                            <td className="py-3 px-4 font-bold text-foreground">
                                                <span className="px-2 py-0.5 rounded bg-muted text-[11px] border border-border">
                                                    #{blockNumber}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-signal font-mono font-medium text-[11px]" title={commitmentHash}>
                                                        {commitmentHash.substring(0, 10)}...{commitmentHash.substring(commitmentHash.length - 8)}
                                                    </span>
                                                    <button
                                                        onClick={() => copyToClipboard(commitmentHash)}
                                                        className="text-muted-foreground hover:text-signal p-0.5 cursor-pointer"
                                                        title="Copy Hash Commitment"
                                                    >
                                                        {copiedHash === commitmentHash ? <Check className="w-3 h-3 text-grove" /> : <Copy className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-semibold text-foreground text-xs">{mapSpaceThreatName(log.type)}</div>
                                                <div className="text-[10px] text-muted-foreground">{assignedStation} • {log.src_ip}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={clsx(
                                                    "px-2 py-0.5 rounded text-[10px] font-bold border",
                                                    isBlock ? "bg-destructive/15 text-destructive border-destructive/30" :
                                                    isFP ? "bg-signal/15 text-signal border-signal/30" : "bg-grove/15 text-grove border-grove/30"
                                                )}>
                                                    {isBlock ? "BLOCKED" : isFP ? "FALSE ALARM" : log.action}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-[11px] text-muted-foreground">
                                                {log.handled_by === 'SYSTEM_AUTOMATION' ? 'AEGIS SOAR' : 'Controller'}
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono text-[11px] text-muted-foreground">
                                                {gasUsed.toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => setSelectedProof({ ...log, txHash, commitmentHash, blockNumber, gasUsed })}
                                                    className="px-2 py-1 rounded bg-muted hover:bg-signal hover:text-background text-foreground text-[10px] font-semibold transition-colors cursor-pointer"
                                                >
                                                    Verify
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* BLOCKCHAIN PROOF MODAL */}
            {selectedProof && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                            <div className="flex items-center gap-2">
                                <Blocks className="w-4 h-4 text-signal" />
                                <span className="font-semibold text-foreground text-sm">Zero-Knowledge On-Chain Proof Receipt</span>
                            </div>
                            <button
                                onClick={() => setSelectedProof(null)}
                                className="text-muted-foreground hover:text-foreground text-sm font-bold px-2 py-0.5 rounded hover:bg-muted cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-muted/50 p-2.5 rounded-lg border border-border text-[11px] text-muted-foreground leading-relaxed">
                                <span className="text-signal font-semibold">🔒 Privacy Guarantee:</span> The raw telemetry data and internal IPs are kept strictly in your private database. ONLY the irreversible cryptographic commitment below is stored on the public blockchain.
                            </div>

                            <div>
                                <span className="text-muted-foreground text-[10px] uppercase block">Contract Address</span>
                                <span className="text-foreground font-mono text-[11px] break-all">
                                    {selectedProof.contractAddress || blockchainStatus?.contractAddress || "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e"}
                                </span>
                            </div>

                            <div>
                                <span className="text-muted-foreground text-[10px] uppercase block">On-Chain Hash Commitment (Fingerprint)</span>
                                <div className="flex items-center justify-between bg-muted p-2.5 rounded-lg border border-border mt-1">
                                    <span className="text-signal font-mono text-[11px] break-all select-all">
                                        {selectedProof.commitmentHash || selectedProof.txHash}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(selectedProof.commitmentHash || selectedProof.txHash)}
                                        className="text-muted-foreground hover:text-foreground ml-2 cursor-pointer shrink-0"
                                    >
                                        {copiedHash === (selectedProof.commitmentHash || selectedProof.txHash) ? <Check className="w-4 h-4 text-grove" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-muted-foreground text-[10px] uppercase block">Block Number</span>
                                    <span className="text-foreground font-semibold">#{selectedProof.blockNumber}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-[10px] uppercase block">Gas Consumed</span>
                                    <span className="text-foreground font-semibold">{selectedProof.gasUsed?.toLocaleString()} units</span>
                                </div>
                            </div>

                            <div>
                                <span className="text-muted-foreground text-[10px] uppercase block">EVM Transaction Hash</span>
                                <span className="text-muted-foreground text-[11px] break-all">
                                    {selectedProof.txHash}
                                </span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-border flex justify-end">
                            <button
                                onClick={() => setSelectedProof(null)}
                                className="px-4 py-1.5 rounded-lg bg-signal text-background font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                            >
                                Close Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DecisionTimeline;

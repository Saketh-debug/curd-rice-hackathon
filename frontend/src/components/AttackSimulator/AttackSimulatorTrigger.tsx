import React, { useState } from 'react';
import { Zap, Flame } from 'lucide-react';
import { AttackSimulatorModal } from './AttackSimulatorModal';
import clsx from 'clsx';

interface AttackSimulatorTriggerProps {
    className?: string;
    variant?: 'prominent' | 'compact' | 'header';
    onSuccess?: () => void;
}

export const AttackSimulatorTrigger: React.FC<AttackSimulatorTriggerProps> = ({
    className,
    variant = 'prominent',
    onSuccess
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (variant === 'header') {
        return (
            <>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className={clsx(
                        'group relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all duration-300',
                        'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/50 hover:border-orange-400',
                        'text-orange-400 hover:text-white shadow-[0_0_15px_rgba(249,115,22,0.15)] hover:shadow-[0_0_25px_rgba(249,115,22,0.3)]',
                        'cursor-pointer active:scale-95',
                        className
                    )}
                    title="Open Live Attack Simulator for Presentation Demos"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>SIMULATE ATTACK</span>
                </button>

                <AttackSimulatorModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAttackInjected={onSuccess}
                />
            </>
        );
    }

    if (variant === 'compact') {
        return (
            <>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className={clsx(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/15 border border-orange-500/40 hover:bg-orange-500/30 text-orange-400 hover:text-orange-300 font-mono text-xs font-bold transition-all cursor-pointer',
                        className
                    )}
                >
                    <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                    <span>Simulate Attack</span>
                </button>

                <AttackSimulatorModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAttackInjected={onSuccess}
                />
            </>
        );
    }

    // Prominent Hero/Dashboard Variant
    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className={clsx(
                    'group relative inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl font-mono text-xs font-bold tracking-wider transition-all duration-300',
                    'bg-gradient-to-r from-orange-600/30 via-amber-500/20 to-orange-600/30 border border-orange-500/50 hover:border-orange-400',
                    'text-white hover:text-orange-200 shadow-[0_0_25px_rgba(249,115,22,0.2)] hover:shadow-[0_0_35px_rgba(249,115,22,0.4)]',
                    'cursor-pointer hover:scale-105 active:scale-95',
                    className
                )}
            >
                <div className="w-6 h-6 rounded-lg bg-orange-500/30 border border-orange-400/50 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                </div>
                <div className="text-left">
                    <div className="flex items-center gap-1.5">
                        <span className="text-orange-400">⚡ SIMULATE ATTACK WAVE</span>
                        <span className="text-[9px] bg-orange-500/20 px-1.5 py-0.2 rounded border border-orange-500/40 text-orange-300">
                            DEMO
                        </span>
                    </div>
                </div>
            </button>

            <AttackSimulatorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAttackInjected={onSuccess}
            />
        </>
    );
};

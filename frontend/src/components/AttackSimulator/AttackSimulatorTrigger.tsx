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
                        'bg-gradient-to-r from-signal/20 to-signal/10 border border-signal/50 hover:border-signal',
                        'text-signal hover:text-foreground shadow-[0_0_15px_rgba(255,153,51,0.15)] hover:shadow-[0_0_25px_rgba(255,153,51,0.3)]',
                        'cursor-pointer active:scale-95',
                        className
                    )}
                    title="Open Live Attack Simulator for Presentation Demos"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-signal"></span>
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
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-signal/15 border border-signal/40 hover:bg-signal/30 text-signal hover:text-signal/80 font-mono text-xs font-bold transition-all cursor-pointer',
                        className
                    )}
                >
                    <Flame className="w-3.5 h-3.5 text-signal animate-pulse" />
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
                    'bg-gradient-to-r from-signal/30 via-signal/15 to-signal/30 border border-signal/50 hover:border-signal',
                    'text-foreground hover:text-signal shadow-[0_0_25px_rgba(255,153,51,0.2)] hover:shadow-[0_0_35px_rgba(255,153,51,0.4)]',
                    'cursor-pointer hover:scale-105 active:scale-95',
                    className
                )}
            >
                <div className="w-6 h-6 rounded-lg bg-signal/30 border border-signal/50 flex items-center justify-center text-signal group-hover:scale-110 transition-transform">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                </div>
                <div className="text-left">
                    <div className="flex items-center gap-1.5">
                        <span className="text-signal">⚡ SIMULATE ATTACK WAVE</span>
                        <span className="text-[9px] bg-signal/20 px-1.5 py-0.2 rounded border border-signal/40 text-signal">
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

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Satellite,
    Lock,
    Radio,
    Shield,
    Menu,
    X,
    ArrowUpRight,
    type LucideIcon
} from 'lucide-react';
import clsx from 'clsx';

export interface NavItem {
    icon: LucideIcon;
    label: string;
    path: string;
    badge?: number;
}

interface PortalNavbarProps {
    portalType: 'client' | 'admin';
    navItems: NavItem[];
}

export const PortalNavbar: React.FC<PortalNavbarProps> = ({ portalType, navItems }) => {
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const isAdmin = portalType === 'admin';
    const switchPath = isAdmin ? '/client/dashboard' : '/admin/dashboard';
    const switchLabel = isAdmin ? 'Flight Ops' : 'Sec Console';

    // Enhance glass effect on scroll
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    const isActive = (item: NavItem) =>
        location.pathname === item.path ||
        (item.path !== '/admin/dashboard' &&
            item.path !== '/client/dashboard' &&
            location.pathname.startsWith(item.path));

    return (
        <>
            {/* ══════════ FLOATING PILL NAVBAR ══════════ */}
            <div
                className={clsx(
                    'fixed top-4 left-1/2 -translate-x-1/2 z-[1500]',
                    'transition-all duration-300 pointer-events-auto',
                    // On mobile, stretch to near-full width for readability
                    'w-[calc(100vw-2rem)] sm:w-auto'
                )}
            >
                <nav
                    className={clsx(
                        'flex items-center gap-1 px-2 py-2',
                        'rounded-full',
                        'border transition-all duration-300',
                        scrolled
                            ? 'bg-[#161513]/72 backdrop-blur-3xl border-[rgba(255,153,51,0.32)] shadow-[0_16px_50px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.07),0_0_26px_rgba(255,153,51,0.12)]'
                            : 'bg-[#161513]/60 backdrop-blur-2xl border-[rgba(255,153,51,0.22)] shadow-[0_10px_38px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]'
                    )}
                    role="navigation"
                    aria-label={`${isAdmin ? 'Admin' : 'Client'} portal navigation`}
                >
                    {/* ── Brand Logo Pill ── */}
                    <Link
                        to="/"
                        className={clsx(
                            'flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0',
                            'border border-[rgba(255,153,51,0.24)] bg-[rgba(255,153,51,0.07)]',
                            'hover:bg-[rgba(255,153,51,0.14)] hover:border-[rgba(255,153,51,0.42)]',
                            'transition-all duration-200 group'
                        )}
                        title="SOAR Home"
                    >
                        {isAdmin
                            ? <Lock className="w-3.5 h-3.5 text-signal" />
                            : <Satellite className="w-3.5 h-3.5 text-signal group-hover:rotate-12 transition-transform duration-300" />
                        }
                        <span className="font-orbitron font-bold text-[11px] tracking-widest text-foreground">
                            SOAR
                        </span>
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-signal text-signal-foreground font-bold tracking-wider leading-none">
                            {isAdmin ? 'GOV' : 'OPS'}
                        </span>
                    </Link>

                    {/* ── Separator ── */}
                    <div className="w-px h-5 bg-border/60 mx-1 shrink-0 hidden sm:block" />

                    {/* ── Desktop Nav Items ── */}
                    <div className="hidden md:flex items-center gap-0.5">
                        {navItems.map((item) => {
                            const active = isActive(item);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={clsx(
                                        'relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full',
                                        'text-[11px] font-medium font-sans whitespace-nowrap',
                                        'transition-all duration-200',
                                        active
                                            ? 'bg-[rgba(255,153,51,0.15)] border border-[rgba(255,153,51,0.45)] text-signal shadow-[0_0_14px_rgba(255,153,51,0.18)]'
                                            : 'border border-transparent text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.05)]'
                                    )}
                                >
                                    <Icon
                                        className={clsx(
                                            'w-3.5 h-3.5 shrink-0',
                                            active ? 'text-signal' : 'text-muted-foreground'
                                        )}
                                    />
                                    <span>{item.label}</span>
                                    {/* Badge dot for pending items */}
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <span className={clsx(
                                            'absolute -top-1 -right-0.5',
                                            'min-w-[16px] h-4 px-1 rounded-full',
                                            'bg-destructive text-white text-[9px] font-mono font-bold',
                                            'flex items-center justify-center',
                                            'border border-[#161513]',
                                            'animate-pulse'
                                        )}>
                                            {item.badge > 99 ? '99+' : item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* ── Separator ── */}
                    <div className="w-px h-5 bg-border/60 mx-1 shrink-0 hidden md:block" />

                    {/* ── Portal Switcher (desktop) ── */}
                    <Link
                        to={switchPath}
                        className={clsx(
                            'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0',
                            'text-[11px] font-medium font-sans whitespace-nowrap',
                            'border border-border/70 text-muted-foreground',
                            'hover:text-foreground hover:bg-[rgba(255,255,255,0.06)] hover:border-border',
                            'transition-all duration-200 group'
                        )}
                        title={`Switch to ${switchLabel}`}
                    >
                        {isAdmin
                            ? <Radio className="w-3.5 h-3.5 text-signal/70 group-hover:text-signal transition-colors" />
                            : <Shield className="w-3.5 h-3.5 text-signal/70 group-hover:text-signal transition-colors" />
                        }
                        <span className="hidden lg:inline">{switchLabel}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </Link>

                    {/* ── Mobile Hamburger ── */}
                    <button
                        onClick={() => setMobileOpen(prev => !prev)}
                        className={clsx(
                            'md:hidden flex items-center justify-center w-8 h-8 rounded-full shrink-0 ml-auto',
                            'border border-border/70 text-muted-foreground',
                            'hover:text-foreground hover:bg-[rgba(255,255,255,0.06)] hover:border-border',
                            'transition-all duration-200'
                        )}
                        aria-label="Toggle navigation menu"
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen
                            ? <X className="w-4 h-4" />
                            : <Menu className="w-4 h-4" />
                        }
                    </button>
                </nav>

                {/* ══════════ MOBILE DROPDOWN ══════════ */}
                <div
                    className={clsx(
                        'md:hidden mt-2 overflow-hidden',
                        'rounded-2xl border',
                        'bg-[#161513]/94 backdrop-blur-3xl',
                        'border-[rgba(255,153,51,0.20)] shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]',
                        'transition-all duration-300 ease-out',
                        mobileOpen
                            ? 'max-h-[480px] opacity-100 translate-y-0'
                            : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none'
                    )}
                    aria-hidden={!mobileOpen}
                >
                    <div className="p-3 space-y-1">
                        {/* Portal badge */}
                        <div className="flex items-center gap-2 px-3 pb-2 mb-1 border-b border-border/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse" />
                            <span className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
                                {isAdmin ? 'ISTRAC-SEC · AIR-GAP SAFE' : 'MOC-BLR · PASS NOMINAL'}
                            </span>
                        </div>

                        {navItems.map((item) => {
                            const active = isActive(item);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileOpen(false)}
                                    className={clsx(
                                        'relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl',
                                        'text-xs font-medium font-sans',
                                        'transition-all duration-200',
                                        active
                                            ? 'bg-[rgba(255,153,51,0.14)] border border-[rgba(255,153,51,0.40)] text-signal'
                                            : 'border border-transparent text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.04)]'
                                    )}
                                >
                                    <Icon className={clsx('w-4 h-4 shrink-0', active ? 'text-signal' : 'text-muted-foreground')} />
                                    <span>{item.label}</span>
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <span className="ml-auto px-1.5 py-0.5 rounded-full bg-destructive/20 border border-destructive/40 text-destructive text-[10px] font-mono font-bold">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}

                        {/* Mobile portal switcher */}
                        <div className="pt-2 mt-1 border-t border-border/50">
                            <Link
                                to={switchPath}
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border/70 text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.04)] text-xs font-medium transition-all duration-200"
                            >
                                {isAdmin
                                    ? <Radio className="w-4 h-4 text-signal/70" />
                                    : <Shield className="w-4 h-4 text-signal/70" />
                                }
                                <span>Switch to {switchLabel}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 ml-auto opacity-60" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PortalNavbar;

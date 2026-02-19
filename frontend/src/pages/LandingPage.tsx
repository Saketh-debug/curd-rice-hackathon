import { Link } from "react-router-dom";
import {
    Shield,
    Lock,
    Activity,
    Radar,
    Zap,
    LayoutDashboard,
    FileText,
    Settings,
    Bell,
    Eye,
} from "lucide-react";

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-background-dark text-white font-display selection:bg-primary selection:text-white">

            {/* ================= HERO SECTION ================= */}
            <section className="px-6 py-20 max-w-7xl mx-auto text-center relative overflow-hidden">
                {/* Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

                <p className="text-primary font-semibold tracking-wider uppercase mb-4 relative z-10">
                    Intelligent Threat Detection & Automated Response
                </p>

                <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 relative z-10">
                    Security That Detects,
                    <span className="text-primary"> Decides</span>, and
                    <span className="text-orange-300"> Responds</span> Instantly
                </h1>

                <p className="text-slate-400 max-w-3xl mx-auto text-lg mb-8 relative z-10">
                    Monitor activity, identify attacks, and enforce protection instantly —
                    without manual intervention. Our platform analyzes system and network
                    behavior in real time and automatically executes defensive actions
                    while keeping stakeholders informed.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                    <a href="#portal-access" className="px-8 py-3 rounded-xl bg-primary hover:bg-primary-dark transition font-semibold shadow-lg shadow-primary/20">
                        Get Started
                    </a>
                </div>

            </section>

            {/* ================= WHAT PLATFORM DOES ================= */}
            <section className="px-6 py-16 bg-surface-dark/50">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {[
                        {
                            icon: Activity,
                            title: "Real-Time Monitoring",
                            desc: "Continuously observes system activity and highlights abnormal behavior as it occurs.",
                        },
                        {
                            icon: Radar,
                            title: "Attack Identification",
                            desc: "Recognizes brute force attempts, bot traffic, denial-of-service activity, and suspicious access patterns.",
                        },
                        {
                            icon: Zap,
                            title: "Automated Mitigation",
                            desc: "Blocks malicious sources, enforces rate limits, and protects resources instantly.",
                        },
                        {
                            icon: LayoutDashboard,
                            title: "Centralized Visibility",
                            desc: "Unified dashboard showing events, actions, and outcomes for clear understanding.",
                        },
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="bg-surface-dark border border-slate-800 rounded-2xl p-6 hover:border-primary transition"
                        >
                            <item.icon className="w-10 h-10 text-primary mb-4" />
                            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                            <p className="text-slate-400 text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ================= WHY THIS PLATFORM ================= */}
            <section className="px-6 py-20 text-center max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-6">Why This Platform</h2>
                <p className="text-slate-400 mb-8">
                    Traditional security systems notify teams after detecting issues.
                    This platform evaluates risk and acts immediately.
                </p>

                <div className="grid md:grid-cols-3 gap-6 text-left">
                    {[
                        "Responds to threats the moment they occur",
                        "Reduces manual investigation workload",
                        "Maintains consistent handling of incidents",
                    ].map((text, i) => (
                        <div
                            key={i}
                            className="bg-surface-dark border border-slate-800 rounded-xl p-5"
                        >
                            <p className="text-slate-300">{text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ================= ADMIN + CLIENT FEATURES ================= */}
            <section className="px-6 py-20 bg-surface-dark/50">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">

                    {/* ADMIN */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-primary">
                            Admin Capabilities
                        </h2>

                        <ul className="space-y-4 text-slate-300">
                            <li className="flex gap-3">
                                <Eye className="text-primary" /> Monitoring Dashboard with live threat visibility
                            </li>
                            <li className="flex gap-3">
                                <FileText className="text-primary" /> Investigation timelines and detailed logs
                            </li>
                            <li className="flex gap-3">
                                <Settings className="text-primary" /> Automated controls and override options
                            </li>
                            <li className="flex gap-3">
                                <Shield className="text-primary" /> Custom policies and detection rules
                            </li>
                            <li className="flex gap-3">
                                <Activity className="text-primary" /> Reports and historical analytics
                            </li>
                        </ul>
                    </div>

                    {/* CLIENT */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-primary">
                            Client Features
                        </h2>

                        <ul className="space-y-4 text-slate-300">
                            <li className="flex gap-3">
                                <Shield className="text-primary" /> View current protection status
                            </li>
                            <li className="flex gap-3">
                                <Activity className="text-primary" /> Login history and activity insights
                            </li>
                            <li className="flex gap-3">
                                <Eye className="text-primary" /> Incident visibility and automated actions
                            </li>
                            <li className="flex gap-3">
                                <Bell className="text-primary" /> Instant alerts and notifications
                            </li>
                            <li className="flex gap-3">
                                <Lock className="text-primary" /> Authentication and device management
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ================= ABOUT ================= */}
            <section className="px-6 py-20 max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-6">About Us</h2>
                <p className="text-slate-400 leading-relaxed">
                    We focus on simplifying cybersecurity operations through intelligent
                    automation. Modern systems generate more events than teams can
                    manually analyze, leading to delays and inconsistent responses. Our
                    platform connects detection, analysis, and action into a single
                    coordinated process that improves response time and clarity.
                </p>
            </section>

            {/* ================= PORTAL ACCESS ================= */}
            <section className="px-6 pb-20">
                <div id="portal-access" className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">

                    <Link
                        to="/client/dashboard"
                        className="group relative bg-surface-dark rounded-2xl p-8 border border-slate-800 hover:border-primary transition-all duration-300 overflow-hidden"
                    >
                        <Shield className="absolute right-6 top-6 w-28 h-28 opacity-10 text-primary" />

                        <h3 className="text-2xl font-bold mb-2">Client Portal</h3>
                        <p className="text-slate-400 mb-6">
                            Track protection status, activity insights, and automated threat responses.
                        </p>

                        <span className="text-primary font-semibold group-hover:translate-x-2 transition-transform inline-block">
                            Enter Portal →
                        </span>
                    </Link>

                    <Link
                        to="/admin/dashboard"
                        className="group relative bg-surface-dark rounded-2xl p-8 border border-slate-800 hover:border-primary transition-all duration-300 overflow-hidden"
                    >
                        <Lock className="absolute right-6 top-6 w-28 h-28 opacity-10 text-primary" />

                        <h3 className="text-2xl font-bold mb-2">Administrator Portal</h3>
                        <p className="text-slate-400 mb-6">
                            Manage policies, monitor threats, and investigate incidents.
                        </p>

                        <span className="text-primary font-semibold group-hover:translate-x-2 transition-transform inline-block">
                            Enter Console →
                        </span>
                    </Link>

                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="border-t border-slate-800 py-6 text-center text-slate-500 bg-background-dark">
                Reliable monitoring. Clear decisions. Continuous protection.
            </footer>
        </div>
    );
};

export default LandingPage;

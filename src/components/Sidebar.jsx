import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Clock,
    Crown,
    Sun,
    Moon,
    Cpu,
    Network,
    Sparkles,
    Terminal,
    UserCog,
    Workflow,
    Lock
} from 'lucide-react';

export default function Sidebar({
    planStatus,
    subscription,
    toggleDarkMode,
    isDarkMode
}) {
    const navigate = useNavigate();
    const location = useLocation();

    // Get active tab from path (e.g., /dashboard/database -> 'database')
    const pathSegments = location.pathname.split('/');
    const activeTab = pathSegments[pathSegments.length - 1] || 'overview';

    const navItems = [
        { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, path: '/dashboard/overview' },
        { id: 'database', label: 'Database & Sheets Setup', icon: Network, path: '/dashboard/database' },
        { id: 'generator', label: 'AI Agent Generator', icon: Cpu, path: '/dashboard/generator' },
        { id: 'recent', label: 'View Recent Setups', icon: Clock, path: '/dashboard/recent' },
        { id: 'workspace', label: 'AI Chat Workspace', icon: Terminal, path: '/dashboard/workspace' },
        { id: 'profile', label: 'Profile & Security', icon: UserCog, path: '/dashboard/profile' },
    ];

    // Sidebar sirf tab lock hoga jab 30 days complete/expire hon (isDateExpired / expired) ya approval pending ho.
    // Agar sirf chat quota khatam hua hai aur 30 days baqi hain, toh sidebar unlock rahega!
    const effectiveStatus = subscription?.planStatus || planStatus;
    const is30DaysExpired = Boolean(subscription?.isDateExpired) || effectiveStatus === 'expired';
    const isRestricted = is30DaysExpired || effectiveStatus === 'pending_approval';

    const isQuotaExhausted = Boolean(subscription?.isQuotaExhausted);
    const needsPlanAttention = is30DaysExpired || isQuotaExhausted;

    return (
        <aside className="w-16 md:w-72 bg-card border-r border-border h-screen sticky top-0 flex flex-col justify-between p-3 md:p-5 shrink-0 select-none z-30 transition-all duration-300">
            <div>
                {/* Brand / Logo Header */}
                <div className="flex items-center gap-3 mb-8 px-1 md:px-2 justify-center md:justify-start">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/25 shrink-0">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="hidden md:block">
                        <span className="font-extrabold text-sm text-foreground block leading-tight">NWeb Console</span>
                        <span className="text-[10px] text-sky-500 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Workflow className="w-3 h-3" /> Enterprise AI Core
                        </span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-1.5">
                    {/* Always show Dashboard Overview */}
                    <button
                        onClick={() => navigate('/dashboard/overview')}
                        title="Dashboard Overview"
                        className={`w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer relative group ${
                            activeTab === 'overview'
                                ? 'bg-muted text-sky-500 font-bold shadow-xs'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                    >
                        <LayoutDashboard className={`w-5 h-5 md:w-4 md:h-4 shrink-0 ${activeTab === 'overview' ? 'text-sky-500' : 'text-muted-foreground'}`} />
                        <span className="hidden md:inline truncate">Dashboard Overview</span>
                    </button>

                    {/* Render other nav items when 30-day cycle is NOT expired (even if chat quota is 0) */}
                    {!isRestricted && (
                        navItems.filter(item => item.id !== 'overview').map((item) => {
                            const IconComponent = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => navigate(item.path)}
                                    title={item.label}
                                    className={`w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer relative group ${
                                        isActive
                                            ? 'bg-muted text-sky-500 font-bold shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    }`}
                                >
                                    <IconComponent className={`w-5 h-5 md:w-4 md:h-4 shrink-0 ${isActive ? 'text-sky-500' : 'text-muted-foreground'}`} />
                                    <span className="hidden md:inline truncate">{item.label}</span>
                                </button>
                            );
                        })
                    )}

                    {/* Plans & Billing Tab: Hamesha accessible taake tenant resubscribe/upgrade kar sake */}
                    <button
                        onClick={() => navigate('/dashboard/plans')}
                        title="Plans & Billing"
                        className={`w-full flex items-center justify-center md:justify-between gap-3 px-2 md:px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer relative group ${
                            activeTab === 'plans'
                                ? 'bg-muted text-amber-500 font-bold shadow-xs'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <Crown className="w-5 h-5 md:w-4 md:h-4 text-amber-500 shrink-0" />
                            <span className="hidden md:inline truncate">Plans & Billing</span>
                        </div>
                        {needsPlanAttention && (
                            <span className="hidden md:inline-flex px-1.5 py-0.5 rounded bg-red-500/15 text-red-500 text-[9px] font-extrabold uppercase">
                                Renew
                            </span>
                        )}
                    </button>

                    {/* 30-day expiry lock indicator */}
                    {is30DaysExpired && (
                        <div className="hidden md:flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-500 font-semibold">
                            <Lock className="w-3.5 h-3.5 shrink-0" />
                            <span>30-day cycle expired. Renew plan to unlock modules.</span>
                        </div>
                    )}
                </nav>
            </div>

            {/* Footer Area: Theme Switcher */}
            <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center justify-center md:justify-between p-2 md:p-2.5 bg-muted/40 rounded-xl border border-border">
                    <span className="hidden md:inline text-[11px] font-medium text-muted-foreground">Theme Mode</span>
                    <button
                        onClick={toggleDarkMode}
                        title={isDarkMode ? "Dark Mode" : "Light Mode"}
                        className="p-1.5 md:px-2.5 md:py-1.5 rounded-lg bg-card text-xs font-semibold shadow-xs border border-border flex items-center gap-1.5 text-foreground cursor-pointer hover:bg-muted transition"
                    >
                        {isDarkMode ? (
                            <>
                                <Sun className="w-4 h-4 md:w-3.5 md:h-3.5 text-amber-400" />
                                <span className="hidden md:inline">Dark</span>
                            </>
                        ) : (
                            <>
                                <Moon className="w-4 h-4 md:w-3.5 md:h-3.5 text-sky-500" />
                                <span className="hidden md:inline">Light</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </aside>
    );
}

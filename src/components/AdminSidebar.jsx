import React from 'react';
import {
    LayoutDashboard,
    Building2,
    Megaphone,
    ShieldCheck,
    LogOut
} from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab, onLogout }) {
    const handleLogoutClick = () => {
        if (onLogout) {
            onLogout();
        } else {
            localStorage.removeItem('adminToken');
            window.location.href = '/admin/login';
        }
    };

    return (
        <aside className="w-72 bg-card border-r border-border h-screen sticky top-0 flex flex-col justify-between p-5 shrink-0 select-none z-30">
            <div>
                <div className="flex items-center gap-3 mb-8 px-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold shadow-md">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-extrabold text-sm text-foreground block leading-tight">Superadmin Portal</span>
                        <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Enterprise AI Core</span>
                    </div>
                </div>

                <nav className="space-y-1.5">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            activeTab === 'overview'
                                ? 'bg-muted text-amber-500 font-bold shadow-xs'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard Overview</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('businesses')}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            activeTab === 'businesses'
                                ? 'bg-muted text-amber-500 font-bold shadow-xs'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                    >
                        <Building2 className="w-4 h-4" />
                        <span>Manage Businesses</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('announcements')}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            activeTab === 'announcements'
                                ? 'bg-muted text-amber-500 font-bold shadow-xs'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                    >
                        <Megaphone className="w-4 h-4" />
                        <span>System Broadcasts</span>
                    </button>
                </nav>
            </div>

            <div className="pt-4 border-t border-border">
                <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                    <LogOut className="w-4 h-4" /> Logout Admin
                </button>
            </div>
        </aside>
    );
}
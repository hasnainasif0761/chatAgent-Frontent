import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    Clock,
    AlertCircle,
    ArrowRight,
    Eye,
    Building2,
    Loader2
} from 'lucide-react';
import API from '../services/api';

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [metrics, setMetrics] = useState({
        totalAlerts: 0,
        pendingCount: 0,
        expiredCount: 0,
        pendingRevenue: 0,
        expiredRevenueAtRisk: 0
    });

    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const loadRecentAlerts = async () => {
        try {
            setLoading(true);
            // Latest 7 pending_approval & expired records
            const res = await API.get('/admin/businesses/pending-expired-alerts?status=all&limit=7');
            if (res.data?.success) {
                setItems((res.data.businesses || []).slice(0, 7));
                if (res.data.metrics) setMetrics(res.data.metrics);
            }
        } catch (err) {
            console.error('Failed to load bell notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecentAlerts();
        const interval = setInterval(loadRecentAlerts, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const handleToggle = () => {
        const next = !open;
        setOpen(next);
        if (next) loadRecentAlerts();
    };

    const handleViewDetail = (businessName) => {
        setOpen(false);
        navigate(`/admin/businesses/pending-expired?search=${encodeURIComponent(businessName)}`);
    };

    const handleViewAll = () => {
        setOpen(false);
        navigate('/admin/businesses/pending-expired');
    };

    const badgeCount = metrics.totalAlerts || items.length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={handleToggle}
                aria-label="Pending and Expired Business Notifications"
                className="relative p-2.5 rounded-xl bg-card border border-border hover:bg-muted transition cursor-pointer shadow-2xs flex items-center justify-center"
            >
                <Bell className="w-4 h-4 text-foreground" />
                {badgeCount > 0 && (
                    <span className="absolute -top-1.5  min-w-[19px] h-[19px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                        {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2.5 w-[360px] sm:w-[420px] bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                                Pending & Expired Alerts
                            </h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                {metrics.pendingCount} Pending • {metrics.expiredCount} Expired •{' '}
                                <span className="text-amber-600 font-bold">
                                    ${(metrics.pendingRevenue || 0) + (metrics.expiredRevenueAtRisk || 0)} at risk
                                </span>
                            </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600">
                            Latest {Math.min(items.length, 7)}
                        </span>
                    </div>

                    {/* List of Latest 6-7 Pending / Expired Businesses */}
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-border">
                        {loading ? (
                            <div className="p-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                                <span>Checking latest alerts...</span>
                            </div>
                        ) : items.length > 0 ? (
                            items.map((biz) => {
                                const isExpired = biz.planStatus === 'expired';
                                return (
                                    <div
                                        key={biz._id}
                                        className="p-3.5 hover:bg-muted/40 transition flex items-center justify-between gap-3"
                                    >
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                <span className="font-bold text-xs text-foreground truncate">
                                                    {biz.businessName}
                                                </span>
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                                        isExpired
                                                            ? 'bg-red-500/10 text-red-600'
                                                            : 'bg-amber-500/10 text-amber-600'
                                                    }`}
                                                >
                                                    {isExpired ? 'Expired' : 'Pending'}
                                                </span>
                                                {biz.isSlaBreached && (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-600 text-white">
                                                        SLA &gt;24h
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-[11px] text-muted-foreground truncate">
                                                {biz.name} • <span className="uppercase font-semibold">{biz.planType}</span> (${biz.tierPrice ?? 0})
                                            </div>

                                            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                {isExpired ? (
                                                    <AlertCircle className="w-3 h-3 text-red-500" />
                                                ) : (
                                                    <Clock className="w-3 h-3 text-amber-500" />
                                                )}
                                                <span>
                                                    {biz.daysElapsed > 0
                                                        ? `${biz.daysElapsed}d ${biz.hoursElapsed % 24}h ago`
                                                        : `${biz.hoursElapsed || 0}h ago`}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleViewDetail(biz.businessName)}
                                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-600 hover:text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                                        >
                                            <Eye className="w-3 h-3" />
                                            <span>View Detail</span>
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-xs text-muted-foreground">
                                No pending or expired businesses right now.
                            </div>
                        )}
                    </div>

                    {/* Footer Button: View All Businesses */}
                    <div className="p-3 border-t border-border bg-muted/30">
                        <button
                            type="button"
                            onClick={handleViewAll}
                            className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                        >
                            <span>View All Businesses</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
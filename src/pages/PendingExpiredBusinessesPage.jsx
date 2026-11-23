import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    Eye,
    FileText,
    Download,
    Sparkles,
    RotateCcw,
    Image as ImageIcon,
    X,
    DollarSign,
    ShieldAlert,
    Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import NotificationBell from '../components/NotificationBell';

export default function PendingExpiredBusinessesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const searchInputRef = useRef(null);

    const initialSearch = searchParams.get('search') || '';
    const [searchInput, setSearchInput] = useState(initialSearch);
    const [appliedSearch, setAppliedSearch] = useState(initialSearch);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending_approval' | 'expired'

    const [businesses, setBusinesses] = useState([]);
    const [metrics, setMetrics] = useState({
        totalAlerts: 0,
        pendingCount: 0,
        expiredCount: 0,
        pendingRevenue: 0,
        expiredRevenueAtRisk: 0,
        slaBreachedCount: 0
    });
    const [loading, setLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    // Slip Lightbox Modal
    const [previewSlipUrl, setPreviewSlipUrl] = useState(null);

    // Reject Reason Modal
    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // Sync if URL ?search= changes (e.g. clicking View Detail from Bell)
    useEffect(() => {
        const urlSearch = searchParams.get('search') || '';
        setSearchInput(urlSearch);
        setAppliedSearch(urlSearch);
    }, [searchParams]);

    // Keyboard shortcut '/' to focus search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (
                e.key === '/' &&
                document.activeElement?.tagName !== 'INPUT' &&
                document.activeElement?.tagName !== 'TEXTAREA'
            ) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const fetchFilteredAlerts = async (searchQuery = appliedSearch, filterStatus = statusFilter) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                status: filterStatus,
                search: searchQuery,
                limit: '100'
            });
            const res = await API.get(`/admin/businesses/pending-expired-alerts?${params.toString()}`);
            if (res.data?.success) {
                setBusinesses(res.data.businesses || []);
                if (res.data.metrics) setMetrics(res.data.metrics);
            }
        } catch (err) {
            toast.error('Failed to load pending and expired businesses.');
        } finally {
            setLoading(false);
        }
    };

    // Live search as user types
    useEffect(() => {
        const timer = setTimeout(() => {
            setAppliedSearch(searchInput);
            fetchFilteredAlerts(searchInput, statusFilter);
        }, 200);
        return () => clearTimeout(timer);
    }, [searchInput, statusFilter]);

    const handleSearchButtonClick = (e) => {
        e?.preventDefault();
        setAppliedSearch(searchInput);
        if (searchInput.trim()) {
            setSearchParams({ search: searchInput.trim() });
        } else {
            setSearchParams({});
        }
        fetchFilteredAlerts(searchInput, statusFilter);
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setAppliedSearch('');
        setSearchParams({});
        fetchFilteredAlerts('', statusFilter);
    };

    const runGovernanceAction = async (userId, actionType, reason = '') => {
        try {
            setActionLoadingId(userId);
            const res = await API.post(`/admin/business/${userId}/subscription-action`, {
                actionType,
                reason
            });
            if (res.data?.success) {
                toast.success(res.data.message);
                fetchFilteredAlerts(appliedSearch, statusFilter);
            }
        } catch (err) {
            toast.error('Action failed.');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleConfirmReject = async (e) => {
        e.preventDefault();
        if (!rejectTarget) return;
        await runGovernanceAction(
            rejectTarget._id,
            'reject',
            rejectReason.trim() || 'Payment proof rejected by Superadmin.'
        );
        setRejectTarget(null);
        setRejectReason('');
    };

    const handleExportCSV = () => {
        if (!businesses.length) {
            toast.info('No records to export.');
            return;
        }
        const headers = [
            'Business Name',
            'Owner Name',
            'Email',
            'Phone',
            'Plan Type',
            'Plan Status',
            'Tier Price ($)',
            'Age (Hours)'
        ];
        const rows = businesses.map((b) => [
            `"${(b.businessName || '').replace(/"/g, '""')}"`,
            `"${(b.name || '').replace(/"/g, '""')}"`,
            `"${b.email || ''}"`,
            `"${b.phone || ''}"`,
            b.planType || '',
            b.planStatus || '',
            b.tierPrice ?? 0,
            b.hoursElapsed ?? 0
        ]);
        const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `pending-expired-businesses-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const buildSlipUrl = (slipPath) => {
        if (!slipPath) return '';
        if (slipPath.startsWith('http')) return slipPath;
        return `https://agentic-ai-website-driver.vercel.app/${slipPath.replace(/^\/+/, '')}`;
    };

    const handleSidebarTabChange = (tab) => {
        navigate('/admin/dashboard', { state: { activeTab: tab } });
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans">
            <AdminSidebar
                activeTab="businesses"
                setActiveTab={handleSidebarTabChange}
                onLogout={handleLogout}
            />

            <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-full space-y-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Top Bar with Bell */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">
                                Pending & Expired Businesses Queue
                            </h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Only accounts with <strong className="text-amber-600">Pending Approval</strong> or{' '}
                                <strong className="text-red-600">Expired</strong> status • SLA & revenue recovery console
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={handleExportCSV}
                                className="px-3.5 py-2 rounded-xl bg-card border border-border hover:bg-muted text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                            >
                                <Download className="w-3.5 h-3.5 text-amber-500" />
                                <span>Export CSV</span>
                            </button>
                            <NotificationBell />
                        </div>
                    </div>

                    {/* SaaS Financial & SLA Telemetry Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-card border border-border p-4 rounded-2xl shadow-2xs">
                            <div className="flex justify-between items-center text-[11px] font-bold uppercase text-muted-foreground">
                                <span>Pending Approvals</span>
                                <Clock className="w-4 h-4 text-amber-500" />
                            </div>
                            <div className="text-2xl font-black mt-2 text-amber-600">
                                {metrics.pendingCount || 0}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Pending Inflow: <strong className="text-foreground">${metrics.pendingRevenue || 0}</strong>
                            </p>
                        </div>

                        <div className="bg-card border border-border p-4 rounded-2xl shadow-2xs">
                            <div className="flex justify-between items-center text-[11px] font-bold uppercase text-muted-foreground">
                                <span>Expired Accounts</span>
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                            </div>
                            <div className="text-2xl font-black mt-2 text-red-600">
                                {metrics.expiredCount || 0}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Revenue at Risk: <strong className="text-red-600">${metrics.expiredRevenueAtRisk || 0}</strong>
                            </p>
                        </div>

                        <div className="bg-card border border-border p-4 rounded-2xl shadow-2xs">
                            <div className="flex justify-between items-center text-[11px] font-bold uppercase text-muted-foreground">
                                <span>SLA Breached (&gt;24h)</span>
                                <ShieldAlert className="w-4 h-4 text-rose-600" />
                            </div>
                            <div className="text-2xl font-black mt-2 text-rose-600">
                                {metrics.slaBreachedCount || 0}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Awaiting verification over 24 hours
                            </p>
                        </div>

                        <div className="bg-card border border-border p-4 rounded-2xl shadow-2xs">
                            <div className="flex justify-between items-center text-[11px] font-bold uppercase text-muted-foreground">
                                <span>Total Recovery Pool</span>
                                <DollarSign className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="text-2xl font-black mt-2 text-emerald-600">
                                ${(metrics.pendingRevenue || 0) + (metrics.expiredRevenueAtRisk || 0)}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Across <strong className="text-foreground">{metrics.totalAlerts || 0}</strong> alert accounts
                            </p>
                        </div>
                    </div>

                    {/* Search Bar + "Search Business" Button + Status Pills */}
                    <div className="bg-card border border-border p-5 rounded-2xl shadow-2xs space-y-4">
                        <form
                            onSubmit={handleSearchButtonClick}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                        >
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Type business name, owner, email, or phone... (Press '/' to focus)"
                                    className="w-full bg-background border border-border rounded-xl pl-10 pr-9 py-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                {searchInput && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        title="Clear search"
                                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs shrink-0"
                            >
                                <Search className="w-3.5 h-3.5" />
                                <span>Search Business</span>
                            </button>

                            {appliedSearch && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Show All</span>
                                </button>
                            )}
                        </form>

                        {/* Status Filter Tabs */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
                            <div className="flex items-center gap-2 flex-wrap">
                                {[
                                    { key: 'all', label: `All (${metrics.totalAlerts || 0})` },
                                    { key: 'pending_approval', label: `Pending Approval (${metrics.pendingCount || 0})` },
                                    { key: 'expired', label: `Expired (${metrics.expiredCount || 0})` }
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setStatusFilter(tab.key)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                            statusFilter === tab.key
                                                ? 'bg-amber-600 text-white shadow-2xs'
                                                : 'bg-muted text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {appliedSearch && (
                                <span className="text-[11px] text-muted-foreground">
                                    Filtered by: <strong className="text-amber-600">"{appliedSearch}"</strong> (
                                    {businesses.length} match{businesses.length === 1 ? '' : 'es'})
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Filtered Pending & Expired Businesses Table */}
                    <div className="bg-card border border-border rounded-2xl shadow-2xs overflow-hidden">
                        {loading ? (
                            <div className="p-16 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                                <span>Loading matching pending & expired businesses...</span>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-muted text-muted-foreground uppercase border-b border-border">
                                        <tr>
                                            <th className="p-3.5">Business & Owner</th>
                                            <th className="p-3.5">Plan & Value</th>
                                            <th className="p-3.5">Status & Aging</th>
                                            <th className="p-3.5">Payment Slip</th>
                                            <th className="p-3.5 text-right">Governance & Detail Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {businesses.length > 0 ? (
                                            businesses.map((b) => {
                                                const isExpired = b.planStatus === 'expired';
                                                const isBusy = actionLoadingId === b._id;
                                                const slipUrl = buildSlipUrl(b.paymentSlip);

                                                return (
                                                    <tr key={b._id} className="hover:bg-muted/40 transition">
                                                        <td className="p-3.5">
                                                            <div className="font-bold text-foreground text-sm flex items-center gap-2">
                                                                <span>{b.businessName}</span>
                                                                {b.isSlaBreached && (
                                                                    <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black uppercase">
                                                                        SLA &gt;24h
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-muted-foreground text-[11px]">
                                                                {b.name} • {b.email}
                                                            </div>
                                                            {b.rejectionReason && (
                                                                <div className="text-[10px] text-red-500 mt-0.5">
                                                                    Note: {b.rejectionReason}
                                                                </div>
                                                            )}
                                                        </td>

                                                        <td className="p-3.5">
                                                            <span className="font-extrabold uppercase text-amber-600 block">
                                                                {b.planType} Plan
                                                            </span>
                                                            <span className="text-muted-foreground font-semibold">
                                                                ${b.tierPrice ?? 0} / cycle
                                                            </span>
                                                        </td>

                                                        <td className="p-3.5">
                                                            <span
                                                                className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase inline-block ${
                                                                    isExpired
                                                                        ? 'bg-red-500/10 text-red-600'
                                                                        : 'bg-amber-500/10 text-amber-600'
                                                                }`}
                                                            >
                                                                {isExpired ? 'Expired' : 'Pending Approval'}
                                                            </span>
                                                            <div className="text-[11px] text-muted-foreground mt-1">
                                                                {b.daysElapsed > 0
                                                                    ? `${b.daysElapsed}d ${b.hoursElapsed % 24}h ago`
                                                                    : `${b.hoursElapsed || 0}h ago`}
                                                            </div>
                                                        </td>

                                                        <td className="p-3.5">
                                                            {slipUrl ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setPreviewSlipUrl(slipUrl)}
                                                                    className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 text-sky-600 hover:bg-sky-600 hover:text-white text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                                                                >
                                                                    <ImageIcon className="w-3.5 h-3.5" />
                                                                    <span>Inspect Slip</span>
                                                                </button>
                                                            ) : (
                                                                <span className="text-muted-foreground italic text-[11px]">
                                                                    No Slip
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="p-3.5">
                                                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                                <button
                                                                    type="button"
                                                                    disabled={isBusy}
                                                                    onClick={() => runGovernanceAction(b._id, 'approve')}
                                                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                                                                >
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                                    <span>Approve</span>
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    disabled={isBusy}
                                                                    onClick={() => runGovernanceAction(b._id, 'grace_7d')}
                                                                    title="Grant 7-day courtesy grace period"
                                                                    className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 text-purple-600 hover:bg-purple-600 hover:text-white text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                                                                >
                                                                    <Sparkles className="w-3.5 h-3.5" />
                                                                    <span>7d Grace</span>
                                                                </button>

                                                                {!isExpired && (
                                                                    <button
                                                                        type="button"
                                                                        disabled={isBusy}
                                                                        onClick={() => setRejectTarget(b)}
                                                                        className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                                                                    >
                                                                        <XCircle className="w-3.5 h-3.5" />
                                                                        <span>Reject</span>
                                                                    </button>
                                                                )}

                                                                <button
                                                                    type="button"
                                                                    onClick={() => navigate(`/admin/businesses/${b._id}`)}
                                                                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-600 hover:text-white text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                                                                >
                                                                    <FileText className="w-3.5 h-3.5" />
                                                                    <span>Full Report</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="p-10 text-center text-muted-foreground">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Eye className="w-5 h-5 text-muted-foreground" />
                                                        <span>
                                                            No pending or expired businesses match your current filter.
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Slip Lightbox Modal */}
            {previewSlipUrl && (
                <div
                    onClick={() => setPreviewSlipUrl(null)}
                    className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-card border border-border rounded-2xl p-4 max-w-2xl w-full space-y-3 shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-border pb-2.5">
                            <span className="text-xs font-extrabold uppercase">Payment Proof Preview</span>
                            <button
                                type="button"
                                onClick={() => setPreviewSlipUrl(null)}
                                className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="max-h-[70vh] overflow-auto flex justify-center bg-muted/30 rounded-xl p-2">
                            <img
                                src={previewSlipUrl}
                                alt="Payment Slip"
                                className="max-w-full h-auto rounded-lg object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Reason Modal */}
            {rejectTarget && (
                <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <div>
                                <h3 className="text-sm font-black">Reject Subscription Request</h3>
                                <p className="text-xs text-muted-foreground">{rejectTarget.businessName}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setRejectTarget(null)}
                                className="p-1.5 rounded-lg bg-muted cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-muted-foreground mb-1">
                                    Rejection Reason (Optional)
                                </label>
                                <textarea
                                    rows="3"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="e.g., Blurry payment screenshot or amount mismatch..."
                                    className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground outline-none focus:ring-1 focus:ring-red-500"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setRejectTarget(null)}
                                    className="px-4 py-2 rounded-xl bg-muted font-bold cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
                                >
                                    Confirm Reject
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
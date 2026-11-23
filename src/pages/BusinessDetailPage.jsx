import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Building2,
    Users,
    CreditCard,
    ShieldCheck,
    Cpu,
    Globe,
    Monitor,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Printer,
    Lock,
    Database,
    History,
    Ban,
    Loader2,
    Activity
} from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../services/api';
import AdminSidebar from '../components/AdminSidebar';

const PLAN_PRICES = {
    free: 0,
    basic: 29,
    silver: 79,
    golden: 149
};

export default function BusinessDetailPage() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [detailData, setDetailData] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchDetailedBusiness = async () => {
        try {
            setLoading(true);
            const res = await API.get(`/admin/business/${userId}/details`);
            if (res.data.success) {
                setDetailData(res.data.data);
            } else {
                toast.error(res.data.message || 'Could not load business details.');
            }
        } catch (err) {
            toast.error('Failed to fetch detailed business profile.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) fetchDetailedBusiness();
    }, [userId]);

    const handleQuickToggleSuspend = async () => {
        try {
            setActionLoading(true);
            const res = await API.put(`/admin/business/${userId}`, { actionType: 'suspend' });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchDetailedBusiness();
            }
        } catch (err) {
            toast.error('Failed to update suspension status.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleExportPDF = () => {
        window.print();
    };

    const handleSidebarTabChange = (tab) => {
        navigate('/superadmin/dashboard', { state: { activeTab: tab } });
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-background text-foreground font-sans">
                <div className="no-print">
                    <AdminSidebar
                        activeTab="businesses"
                        setActiveTab={handleSidebarTabChange}
                        onLogout={handleLogout}
                    />
                </div>
                <main className="flex-1 flex items-center justify-center gap-2 text-sm p-6">
                    <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                    <span>Loading complete business intelligence...</span>
                </main>
            </div>
        );
    }

    if (!detailData || !detailData.business) {
        return (
            <div className="flex min-h-screen bg-background text-foreground font-sans">
                <div className="no-print">
                    <AdminSidebar
                        activeTab="businesses"
                        setActiveTab={handleSidebarTabChange}
                        onLogout={handleLogout}
                    />
                </div>
                <main className="flex-1 p-8 flex flex-col items-center justify-center gap-4">
                    <p className="text-sm text-muted-foreground">Business record not found.</p>
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                        Back to Dashboard
                    </button>
                </main>
            </div>
        );
    }

    const {
        business,
        visitorStats = {},
        loginHistory = [],
        aiSetup = {},
        paymentHistory = [],
        totalPaidAmount = 0,
        auditLogs = [],
        riskFlags = []
    } = detailData;

    const usedMessages = aiSetup.messagesUsed ?? business.messagesUsed ?? 0;
    const quotaLimit = aiSetup.usageLimit ?? business.usageLimit ?? 15;
    const quotaPercent = quotaLimit > 0 ? Math.min(100, Math.round((usedMessages / quotaLimit) * 100)) : 0;
    console.log("Ya Quote ha",quotaLimit)
    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans print:block print:bg-white print:text-black">
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: #fff !important; color: #000 !important; }
                }
            `}</style>

            {/* Left Sidebar */}
            <div className="no-print">
                <AdminSidebar
                    activeTab="businesses"
                    setActiveTab={handleSidebarTabChange}
                    onLogout={handleLogout}
                />
            </div>

            {/* Right Main Content */}
            <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-full print:p-2">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Top Navigation & Export Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5 no-print">
                        <div className="flex items-center gap-3">
                            <div>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                                        {business.businessName}
                                    </h1>
                                    <span
                                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                            business.planStatus === 'active'
                                                ? 'bg-emerald-500/10 text-emerald-500'
                                                : business.planStatus === 'suspended'
                                                ? 'bg-red-500/10 text-red-500'
                                                : 'bg-amber-500/10 text-amber-500'
                                        }`}
                                    >
                                        {business.planStatus}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600">
                                        {business.planType} Plan
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Complete Tenant Forensic Report • Owner: {business.name} ({business.email})
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <button
                                disabled={actionLoading}
                                onClick={handleQuickToggleSuspend}
                                className="px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                            >
                                <Ban className="w-3.5 h-3.5" />
                                <span>{business.planStatus === 'suspended' ? 'Activate Account' : 'Suspend Account'}</span>
                            </button>

                            <button
                                onClick={handleExportPDF}
                                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Export PDF Report</span>
                            </button>
                        </div>
                    </div>

                    {/* Risk / Anomaly Alert Banner */}
                    {riskFlags.length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-red-600">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Risk & Anomaly Alerts ({riskFlags.length})</span>
                            </div>
                            <ul className="list-disc list-inside text-xs text-red-700 dark:text-red-300 space-y-0.5">
                                {riskFlags.map((flag, i) => (
                                    <li key={i}>{flag}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Top 4 KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-card border border-border p-4 rounded-2xl shadow-2xs">
                            <div className="flex justify-between items-center text-[11px] font-bold uppercase text-muted-foreground">
                                <span>Total Visitors / Sessions</span>
                                <Users className="w-4 h-4 text-sky-500" />
                            </div>
                            <div className="text-2xl font-black mt-2">{visitorStats.totalVisitors ?? 0}</div>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Avg Duration: <strong className="text-foreground">{visitorStats.avgDuration || '0s'}</strong>
                            </p>
                        </div>

                        <div className="bg-card border border-border p-4 rounded-2xl shadow-2xs">
                            <div className="flex justify-between items-center text-[11px] font-bold uppercase text-muted-foreground">
                                <span>Total Logins Recorded</span>
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="text-2xl font-black mt-2">{business.loginCount ?? loginHistory.length}</div>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Last Login:{' '}
                                <strong className="text-foreground">
                                    {business.lastLoginAt ? new Date(business.lastLoginAt).toLocaleString() : 'N/A'}
                                </strong>
                            </p>
                        </div>

                        <div className="bg-card border border-border p-4 rounded-2xl shadow-2xs">
                            <div className="flex justify-between items-center text-[11px] font-bold uppercase text-muted-foreground">
                                <span>Total Amount Paid</span>
                                <CreditCard className="w-4 h-4 text-purple-500" />
                            </div>
                            <div className="text-2xl font-black mt-2 text-purple-600">${totalPaidAmount}</div>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Across <strong className="text-foreground">{paymentHistory.length}</strong> payment entries
                            </p>
                        </div>

                        <div className="bg-card border border-border p-4 rounded-2xl shadow-2xs">
                            <div className="flex justify-between items-center text-[11px] font-bold uppercase text-muted-foreground">
                                <span>Quota Consumption</span>
                                <Activity className="w-4 h-4 text-amber-500" />
                            </div>
                            <div className="text-2xl font-black mt-2 text-amber-600">{quotaPercent}%</div>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                {usedMessages} / {quotaLimit} messages used
                            </p>
                        </div>
                    </div>

                    {/* Business Identity + AI Configuration (API Key Strictly Hidden) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-2xs space-y-4">
                            <div className="flex items-center gap-2 border-b border-border pb-3">
                                <Building2 className="w-4 h-4 text-amber-500" />
                                <h2 className="text-sm font-extrabold uppercase tracking-wider">Business & Subscription Profile</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                    <span className="text-muted-foreground block">Business Name</span>
                                    <span className="font-bold text-sm">{business.businessName}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Owner Name</span>
                                    <span className="font-bold text-sm">{business.name}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Email Address</span>
                                    <span className="font-semibold">{business.email}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Phone</span>
                                    <span className="font-semibold">{business.phone || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Location</span>
                                    <span className="font-semibold">
                                        {business.city || 'N/A'}, {business.country || 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Registered Date</span>
                                    <span className="font-semibold">
                                        {new Date(business.createdAt || Date.now()).toLocaleDateString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Active Plan & Tier Price</span>
                                    <span className="font-bold uppercase text-amber-600">
                                        {business.planType} (${PLAN_PRICES[business.planType] ?? 0})
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Account Status</span>
                                    <span className="font-bold uppercase">{business.planStatus}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border border-border p-6 rounded-2xl shadow-2xs space-y-4">
                            <div className="flex items-center justify-between border-b border-border pb-3">
                                <div className="flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-sky-500" />
                                    <h2 className="text-sm font-extrabold uppercase tracking-wider">AI Integration & Data Sources</h2>
                                </div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                                    <Lock className="w-3 h-3" /> API Key Hidden
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                    <span className="text-muted-foreground block">AI Provider / Engine</span>
                                    <span className="font-bold text-sm">{aiSetup.aiProvider || 'Configured AI Model'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Model Name</span>
                                    <span className="font-semibold">{aiSetup.modelName || 'Default Enterprise LLM'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">API Key Status</span>
                                    <span className="font-mono text-[11px] bg-muted px-2 py-1 rounded inline-flex items-center gap-1.5">
                                        <Lock className="w-3 h-3 text-muted-foreground" />
                                        {aiSetup.hasApiKey ? '•••••••••••••••• (Hidden)' : 'Not Provided / Default'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Agent Setups Count</span>
                                    <span className="font-bold">{aiSetup.agentCount ?? 1} Active Setup(s)</span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-border/70 space-y-2 text-xs">
                                <div className="flex items-center gap-1.5 font-bold text-muted-foreground">
                                    <Database className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Connected Data Sources</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(aiSetup.dataSources && aiSetup.dataSources.length > 0
                                        ? aiSetup.dataSources
                                        : ['Sheets / SQL / Knowledge Base']
                                    ).map((src, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2.5 py-1 rounded-lg bg-muted text-foreground font-semibold text-[11px]"
                                        >
                                            {typeof src === 'string' ? src : src.name || src.type || 'Data Source'}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Complete Payment History Table + Har Payment ki Amount + Total */}
                    <div className="bg-card border border-border p-6 rounded-2xl shadow-2xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                            <div>
                                <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-purple-500" />
                                    Complete Payment History & Ledger
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Every payment entry, plan tier, price/amount sent, proof slip, and cumulative total
                                </p>
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-extrabold text-purple-600">
                                Total Payments Received: ${totalPaidAmount}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-muted text-muted-foreground uppercase border-b border-border">
                                    <tr>
                                        <th className="p-3">#</th>
                                        <th className="p-3">Date & Time</th>
                                        <th className="p-3">Plan Tier</th>
                                        <th className="p-3">Amount Sent</th>
                                        <th className="p-3">Updated By</th>
                                        <th className="p-3 text-right">Payment Slip</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {paymentHistory.length > 0 ? (
                                        paymentHistory.map((item, idx) => {
                                            const planKey = (item.planType || business.planType || 'basic').toLowerCase();
                                            const entryAmount =
                                                typeof item.amount === 'number'
                                                    ? item.amount
                                                    : PLAN_PRICES[planKey] ?? 0;

                                            return (
                                                <tr key={idx} className="hover:bg-muted/40 transition">
                                                    <td className="p-3 font-semibold">{idx + 1}</td>
                                                    <td className="p-3 text-muted-foreground">
                                                        {new Date(item.date || item.createdAt || Date.now()).toLocaleString()}
                                                    </td>
                                                    <td className="p-3 font-bold uppercase text-amber-600">{planKey}</td>
                                                    <td className="p-3 font-extrabold text-emerald-600">${entryAmount}</td>
                                                    <td className="p-3 text-muted-foreground">{item.updatedBy || 'Admin / Tenant'}</td>
                                                    <td className="p-3 text-right">
                                                        {item.slip ? (
                                                            <a
                                                                href={`https://agentic-ai-website-driver.vercel.app/${item.slip}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="px-3 py-1 bg-primary text-primary-foreground rounded-lg font-bold text-[11px] hover:opacity-90"
                                                            >
                                                                View Slip
                                                            </a>
                                                        ) : (
                                                            <span className="text-muted-foreground italic text-[11px]">No Slip</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="p-6 text-center text-muted-foreground">
                                                No payment records found for this business yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                {paymentHistory.length > 0 && (
                                    <tfoot className="bg-muted/60 border-t-2 border-border font-extrabold text-xs">
                                        <tr>
                                            <td colSpan="3" className="p-3 text-right uppercase">Grand Total Paid:</td>
                                            <td colSpan="3" className="p-3 text-purple-600 text-sm">${totalPaidAmount}</td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>

                    {/* Login History (IP Address + Browser/Device) & Audit Trail */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-2xs space-y-4">
                            <div className="flex items-center gap-2 border-b border-border pb-3">
                                <Globe className="w-4 h-4 text-sky-500" />
                                <h2 className="text-sm font-extrabold uppercase tracking-wider">Login History (IP & Browser)</h2>
                            </div>

                            <div className="overflow-x-auto max-h-72">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-muted text-muted-foreground uppercase border-b border-border">
                                        <tr>
                                            <th className="p-2.5">Timestamp</th>
                                            <th className="p-2.5">IP Address</th>
                                            <th className="p-2.5">Browser / Device</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {loginHistory.length > 0 ? (
                                            loginHistory.map((log, i) => (
                                                <tr key={i} className="hover:bg-muted/30">
                                                    <td className="p-2.5 text-muted-foreground whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(log.timestamp || log.date || Date.now()).toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="p-2.5 font-mono text-[11px] font-semibold">
                                                        {log.ip || log.ipAddress || 'Unknown IP'}
                                                    </td>
                                                    <td className="p-2.5">
                                                        <span className="inline-flex items-center gap-1">
                                                            <Monitor className="w-3 h-3 text-muted-foreground" />
                                                            {log.browser || log.userAgent || 'Standard Browser'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="p-5 text-center text-muted-foreground">
                                                    No login session logs recorded yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-card border border-border p-6 rounded-2xl shadow-2xs space-y-4">
                            <div className="flex items-center gap-2 border-b border-border pb-3">
                                <History className="w-4 h-4 text-amber-500" />
                                <h2 className="text-sm font-extrabold uppercase tracking-wider">Admin Audit & Activity Timeline</h2>
                            </div>

                            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 text-xs">
                                {auditLogs.length > 0 ? (
                                    auditLogs.map((act, idx) => (
                                        <div key={idx} className="p-3 rounded-xl bg-muted/40 border border-border flex justify-between items-start gap-2">
                                            <div>
                                                <div className="font-bold text-foreground">{act.action || act.event || 'Account Update'}</div>
                                                {act.details && <div className="text-muted-foreground text-[11px] mt-0.5">{act.details}</div>}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {new Date(act.createdAt || act.date || Date.now()).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-5 text-center text-muted-foreground flex flex-col items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <span>Account created & monitored under enterprise governance.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

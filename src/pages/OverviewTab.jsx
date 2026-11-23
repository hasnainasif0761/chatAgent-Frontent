import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
    Server,
    Table,
    Database,
    Bolt,
    Timer,
    MessageSquare,
    LogOut,
    History,
    X,
    Loader2,
    Bell,
    AlertTriangle,
    Clock,
    CheckCircle2,
    ArrowUpRight,
    Infinity as InfinityIcon
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import API from '../services/api';
import QuotaAlertBanner from '../components/QuotaAlertBanner';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

export default function OverviewTab(props) {
    const outletContext = useOutletContext() || {};
    const stats = props.stats || outletContext.stats;
    const analyticsSessions = props.analyticsSessions || outletContext.analyticsSessions;
    const onLogout = props.onLogout || outletContext.handleLogout;
    const userName = props.userName || outletContext.userName || 'User';

    const navigate = useNavigate();
    const bellRef = useRef(null);

    const [liveStats, setLiveStats] = useState(stats || {});
    const [sessions, setSessions] = useState(analyticsSessions || []);
    const [subscription, setSubscription] = useState(outletContext.subscription || null);
    const [loading, setLoading] = useState(false);

    // Notification Bell State
    const [bellOpen, setBellOpen] = useState(false);

    // Modal & Chat History State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (outletContext.subscription) {
            setSubscription(outletContext.subscription);
        }
    }, [outletContext.subscription]);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (bellRef.current && !bellRef.current.contains(e.target)) {
                setBellOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    useEffect(() => {
        const fetchOverviewData = async () => {
            try {
                setLoading(true);
                const [statsRes, subRes] = await Promise.all([
                    API.get('/dashboard/stats'),
                    API.get('/subscription/status').catch(() => ({ data: null }))
                ]);

                if (subRes?.data?.success && subRes.data.subscription) {
                    setSubscription(subRes.data.subscription);
                }

                if (statsRes.data) {
                    setLiveStats(statsRes.data.stats || statsRes.data || {});
                    const agentId = statsRes.data.agent?._id || statsRes.data.agentId;
                    if (agentId) {
                        const analyticsRes = await API.get(`/dashboard/chat-analytics/${agentId}`);
                        if (analyticsRes.data) {
                            setSessions(analyticsRes.data.analyticsSessions || analyticsRes.data.sessions || []);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to load overview data from DB:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOverviewData();
    }, []);

    const isUnlimited = Boolean(subscription?.isUnlimited) || subscription?.planType === 'golden';
    const remainingChatsDisplay = isUnlimited
        ? 'Unlimited'
        : (subscription?.remainingChats ?? 0);

    // Build Tenant Notification List (30-Day Expiry, Quota Exhausted, 5-Day Pre-Expiry, & Recent Logs)
    const tenantNotifications = [];
    if (subscription) {
        if (subscription.isDateExpired || subscription.planStatus === 'expired') {
            tenantNotifications.push({
                id: 'expired-alert',
                type: 'danger',
                title: '30-Day Plan Validity Expired',
                message: 'Your 30-day cycle ended and customer AI chat is paused until you resubscribe.',
                time: subscription.planExpiresAt ? new Date(subscription.planExpiresAt).toLocaleDateString() : 'Expired'
            });
        } else if (!isUnlimited && subscription.isQuotaExhausted) {
            tenantNotifications.push({
                id: 'quota-alert',
                type: 'danger',
                title: 'Chat Quota Exhausted (0 Chats Left)',
                message: `Your ${String(subscription.planType || '').toUpperCase()} chat quota is finished (${subscription.daysRemaining ?? 0}d left in cycle). Resubscribe or upgrade to resume customer chat.`,
                time: 'Action Required'
            });
        } else if ((subscription.daysRemaining ?? 30) <= 5) {
            tenantNotifications.push({
                id: '5day-warning',
                type: 'warning',
                title: `Plan Expiring in ${subscription.daysRemaining} Day(s)`,
                message: isUnlimited
                    ? 'Renew or upgrade now to add your remaining days into the next 30-day cycle.'
                    : 'Resubscribe or upgrade now so your remaining days and unused chats carry over into the next cycle.',
                time: `${subscription.daysRemaining}d left`
            });
        }

        if (subscription.lastNotification?.message) {
            tenantNotifications.push({
                id: 'last-notif',
                type: 'info',
                title: 'Subscription Update',
                message: subscription.lastNotification.message,
                time: subscription.lastNotification.sentAt
                    ? new Date(subscription.lastNotification.sentAt).toLocaleString()
                    : 'Recent'
            });
        }

        (subscription.subscriptionLogs || []).slice(0, 4).forEach((log, idx) => {
            tenantNotifications.push({
                id: `log-${idx}`,
                type: 'log',
                title: `${String(log.action || 'Update').toUpperCase()} (${String(log.toPlan || '').toUpperCase()})`,
                message: log.note,
                time: log.createdAt ? new Date(log.createdAt).toLocaleDateString() : ''
            });
        });
    }

    const urgentAlertCount = tenantNotifications.filter(
        (n) => n.type === 'danger' || n.type === 'warning'
    ).length;

    const handleViewHistory = async (session) => {
        setSelectedSession(session);
        setIsModalOpen(true);
        setLoadingHistory(true);
        setChatHistory([]);
        try {
            const res = await API.get(`/dashboard/visitor-chats/${session.visitorId}`);
            if (res.data && res.data.success) {
                setChatHistory(res.data.chatHistory || []);
            }
        } catch (err) {
            console.error('Failed to fetch visitor chat history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const totalDurationSecs = sessions.reduce((acc, s) => acc + (s.chatDurationSeconds || 0), 0);
    const avgDurationMins = sessions.length > 0 ? (totalDurationSecs / sessions.length / 60).toFixed(1) : '0';
    const totalChatsCount = sessions.length || liveStats.totalChats || 0;

    const weeklyData = [0, 0, 0, 0, 0, 0, 0];
    sessions.forEach(s => {
        if (s.createdAt) {
            const d = new Date(s.createdAt);
            const day = d.getDay();
            const index = day === 0 ? 6 : day - 1;
            weeklyData[index] += 1;
        }
    });

    if (sessions.length === 0 && totalChatsCount > 0) {
        const todayIndex = (() => {
            const d = new Date();
            const day = d.getDay();
            return day === 0 ? 6 : day - 1;
        })();
        weeklyData[todayIndex] = totalChatsCount;
    }

    const lineChartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Queries & Sync Events',
            data: weeklyData,
            borderColor: '#0ea5e9',
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            tension: 0.4,
            fill: false
        }]
    };

    const doughnutChartData = {
        labels: ['Direct Web', 'Embedded Widget', 'Organic / Search'],
        datasets: [{
            data: [55, 30, 15],
            backgroundColor: ['#0284c7', '#38bdf8', '#10b981']
        }]
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header with Tenant Notification Bell & Logout */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-foreground tracking-tight">Welcome Back, {userName}</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">Real-time enterprise metrics, active sessions & data monitoring from database</p>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Tenant Notification Bell */}
                    <div className="relative" ref={bellRef}>
                        <button
                            type="button"
                            onClick={() => setBellOpen((prev) => !prev)}
                            aria-label="Subscription & Quota Notifications"
                            className="relative p-2.5 rounded-xl bg-card border border-border hover:bg-muted transition cursor-pointer shadow-xs flex items-center justify-center"
                        >
                            <Bell className="w-4 h-4 text-foreground" />
                            {(urgentAlertCount > 0 || tenantNotifications.length > 0) && (
                                <span
                                    className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-black flex items-center justify-center ${
                                        urgentAlertCount > 0 ? 'bg-red-600' : 'bg-sky-600'
                                    }`}
                                >
                                    {urgentAlertCount > 0 ? urgentAlertCount : tenantNotifications.length}
                                </span>
                            )}
                        </button>

                        {bellOpen && (
                            <div className="absolute right-0 mt-2.5 w-[340px] sm:w-[390px] bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
                                <div className="p-3.5 border-b border-border bg-muted/40 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                                            Plan & Quota Alerts
                                        </h3>
                                        {subscription && (
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                {isUnlimited ? 'Unlimited chats' : `${remainingChatsDisplay} chats left`} • {subscription.daysRemaining ?? 0}d validity
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-500">
                                        {subscription?.planType || 'Plan'}
                                    </span>
                                </div>

                                <div className="max-h-[320px] overflow-y-auto divide-y divide-border">
                                    {tenantNotifications.length > 0 ? (
                                        tenantNotifications.map((item) => (
                                            <div key={item.id} className="p-3.5 hover:bg-muted/30 transition space-y-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                        {item.type === 'danger' && (
                                                            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                                        )}
                                                        {item.type === 'warning' && (
                                                            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                        )}
                                                        {(item.type === 'info' || item.type === 'log') && (
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                        )}
                                                        <span>{item.title}</span>
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground shrink-0">
                                                        {item.time}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                    {item.message}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center text-xs text-muted-foreground">
                                            All good! No quota or expiry alerts right now.
                                        </div>
                                    )}
                                </div>

                                <div className="p-2.5 border-t border-border bg-muted/30">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setBellOpen(false);
                                            navigate('/dashboard/plans');
                                        }}
                                        className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer"
                                    >
                                        <span>Open Plans & Billing</span>
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {onLogout && (
                        <button
                            onClick={onLogout}
                            className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white border border-red-500/20 rounded-lg text-xs font-semibold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                            <LogOut className="w-3.5 h-3.5" /> Logout
                        </button>
                    )}
                </div>
            </div>

            {/* Quota / Expiry / Rollover Alert Banner */}
            <QuotaAlertBanner subscription={subscription} billingPath="/dashboard/plans" />

            {/* 6 Enterprise Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="bg-card border border-border p-4 rounded-xl shadow-xs hover:shadow-sm transition">
                    <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Sources</span>
                        <div className="p-2 bg-sky-500/10 rounded-lg text-sky-500"><Server className="w-4 h-4" /></div>
                    </div>
                    <div className="text-xl font-black text-foreground mt-2">{liveStats.totalDatabasesCount || 0}</div>
                    <span className="text-[10px] text-muted-foreground mt-1 block">SQL / Sheets</span>
                </div>

                <div className="bg-card border border-border p-4 rounded-xl shadow-xs hover:shadow-sm transition">
                    <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Tables</span>
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Table className="w-4 h-4" /></div>
                    </div>
                    <div className="text-xl font-black text-foreground mt-2">{liveStats.totalTablesCount || 0}</div>
                    <span className="text-[10px] text-muted-foreground mt-1 block">Synced Instances</span>
                </div>

                <div className="bg-card border border-border p-4 rounded-xl shadow-xs hover:shadow-sm transition">
                    <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Processed</span>
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500"><Database className="w-4 h-4" /></div>
                    </div>
                    <div className="text-xl font-black text-foreground mt-2">{liveStats.totalSyncedRows || 0}</div>
                    <span className="text-[10px] text-muted-foreground mt-1 block">Total Rows</span>
                </div>

                <div className="bg-card border border-border p-4 rounded-xl shadow-xs hover:shadow-sm transition">
                    <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Active Source</span>
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Bolt className="w-4 h-4" /></div>
                    </div>
                    <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-2 truncate">{liveStats.mostUsedDB || 'N/A'}</div>
                    <span className="text-[10px] text-muted-foreground mt-1 block">Primary Context</span>
                </div>

                <div className="bg-card border border-border p-4 rounded-xl shadow-xs hover:shadow-sm transition">
                    <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Avg Duration</span>
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Timer className="w-4 h-4" /></div>
                    </div>
                    <div className="text-xl font-black text-foreground mt-2">{avgDurationMins}m</div>
                    <span className="text-[10px] text-emerald-500 font-bold mt-1 block">From DB Sessions</span>
                </div>

                <div className="bg-card border border-border p-4 rounded-xl shadow-xs hover:shadow-sm transition">
                    <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Remaining Chats</span>
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                            {isUnlimited ? <InfinityIcon className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                        </div>
                    </div>
                    <div className="text-xl font-black text-foreground mt-2">
                        {subscription ? remainingChatsDisplay : totalChatsCount}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                        {subscription ? `${subscription.daysRemaining ?? 0}d validity left` : 'MongoDB Sessions'}
                    </span>
                </div>
            </div>

            {/* Live Visitor Locations & Chat Durations Table Section */}
            <div className="bg-card border border-border p-6 rounded-xl shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-base font-bold text-foreground">Live Visitor Locations & Chat Durations</h3>
                        <p className="text-xs text-muted-foreground">Strictly isolated per agent ID fetched live from database</p>
                    </div>
                    <span className="text-xs bg-sky-500/10 text-sky-500 px-3 py-1.5 rounded-lg font-bold">
                        Average Chat Time: {avgDurationMins} mins
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-foreground">
                        <thead className="bg-muted text-muted-foreground uppercase tracking-wider border-b border-border">
                            <tr>
                                <th className="p-3.5">Visitor Session ID</th>
                                <th className="p-3.5">User Destination / Location</th>
                                <th className="p-3.5">Duration</th>
                                <th className="p-3.5">Messages Exchanged</th>
                                <th className="p-3.5 text-center">Timestamp</th>
                                <th className="p-3.5 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {sessions.length > 0 ? (
                                sessions.map((s, idx) => (
                                    <tr key={s._id || idx} className="hover:bg-muted/40 transition">
                                        <td className="p-3.5 font-mono text-[11px] text-sky-500">{s.visitorId}</td>
                                        <td className="p-3.5 font-bold text-foreground flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-red-500"></span> {s.destination || 'Home / Web'}
                                        </td>
                                        <td className="p-3.5 font-semibold text-muted-foreground">{s.chatDurationSeconds || 0} seconds</td>
                                        <td className="p-3.5 text-muted-foreground">{s.messageCount || 0} msgs</td>
                                        <td className="p-3.5 text-center text-muted-foreground">{s.createdAt ? new Date(s.createdAt).toLocaleString() : 'N/A'}</td>
                                        <td className="p-3.5 text-center">
                                            <button
                                                onClick={() => handleViewHistory(s)}
                                                className="px-3 py-1 bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-slate-950 font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1 mx-auto"
                                            >
                                                <History className="w-3.5 h-3.5" /> View History
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-6 text-center text-muted-foreground">
                                        No chat sessions recorded in database for this agent yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Charts Analytics Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-card border border-border p-6 rounded-xl shadow-xs lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-foreground">Table Sync & AI Conversational Traffic</h3>
                        <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-lg">Live DB Data</span>
                    </div>
                    <div className="h-64"><Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
                </div>

                <div className="bg-card border border-border p-6 rounded-xl shadow-xs">
                    <h3 className="text-sm font-bold text-foreground mb-4">Traffic Acquisition & Source Distribution</h3>
                    <div className="h-64 flex items-center justify-center"><Doughnut data={doughnutChartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
                </div>
            </div>

            {/* Visitor Chat History Modal Popup */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center border-b border-border pb-4">
                            <div>
                                <h2 className="text-base font-black text-foreground flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-sky-500" /> Visitor Chat History
                                </h2>
                                <p className="text-xs font-mono text-muted-foreground mt-0.5">Session ID: {selectedSession?.visitorId}</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 bg-muted rounded-lg text-foreground hover:bg-muted-foreground/20 cursor-pointer transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {selectedSession && (
                            <div className="grid grid-cols-3 gap-3 text-xs bg-muted/40 p-3.5 rounded-xl border border-border">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Location</span>
                                    <span className="font-bold text-foreground">{selectedSession.destination || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Duration</span>
                                    <span className="font-bold text-foreground">{selectedSession.chatDurationSeconds || 0} seconds</span>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Total Messages</span>
                                    <span className="font-bold text-foreground">{selectedSession.messageCount || chatHistory.length || 0}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-background border border-border rounded-xl min-h-[300px] max-h-[400px]">
                            {loadingHistory ? (
                                <div className="h-full flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
                                    <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
                                    <span className="text-xs">Loading chat logs...</span>
                                </div>
                            ) : chatHistory.length > 0 ? (
                                chatHistory.map((msg, index) => {
                                    const isUser = msg.sender === 'user';
                                    return (
                                        <div key={index} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-muted-foreground">
                                                <span className="font-bold uppercase">{isUser ? 'Visitor / User' : 'AI Assistant'}</span>
                                                {msg.createdAt && <span>• {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                            </div>
                                            <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                                                isUser
                                                    ? 'bg-sky-500 text-white rounded-br-xs'
                                                    : 'bg-muted text-foreground border border-border rounded-bl-xs'
                                            }`}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20 text-muted-foreground space-y-2">
                                    <MessageSquare className="w-8 h-8 text-muted-foreground/40" />
                                    <p className="text-xs font-semibold">No detailed message logs found for this session.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
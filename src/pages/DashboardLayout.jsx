import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import API from '../services/api';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import TopAlertBanner from '../components/TopAlertBanner';

export default function DashboardLayout() {
    const [stats, setStats] = useState({});
    const [recentSetups, setRecentSetups] = useState([]);
    const [agent, setAgent] = useState(null);
    const [analyticsSessions, setAnalyticsSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme === 'dark';
    }
    // Default theme White (Light mode) rahegi agar localStorage mein kuch na ho
    localStorage.setItem('theme', 'light');
    return false;
});
    const [activeSystemBroadcast, setActiveSystemBroadcast] = useState(null);

    const userData = JSON.parse(localStorage.getItem("user") || '{}');
    const userName = userData.name || 'User';

    useEffect(() => {
        const fetchBroadcast = async () => {
            try {
                const res = await API.get('/admin/system-broadcast');
                if (res.data && res.data.success && res.data.broadcast) {
                    setActiveSystemBroadcast(res.data.broadcast);
                }
            } catch (err) {
                console.log("No active broadcast found:", err.message);
            }
        };
        fetchBroadcast();
    }, []);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, setupsRes] = await Promise.all([
                API.get('/dashboard/stats'),
                API.get('/dashboard/recent-setups')
            ]);

            if (statsRes.data) {
                setStats(statsRes.data);
                const currentAgent = statsRes.data.agent || null;
                setAgent(currentAgent);

                const agentId = currentAgent?._id || currentAgent?.id;
                if (agentId) {
                    try {
                        const analyticsRes = await API.get(`/dashboard/chat-analytics/${agentId}`);
                        if (analyticsRes.data && analyticsRes.data.sessions) {
                            setAnalyticsSessions(analyticsRes.data.sessions);
                        }
                    } catch (analyticsErr) {
                        console.warn('Analytics fetch failed:', analyticsErr);
                    }
                }
            }

            if (setupsRes.data) {
                const setupsArray = setupsRes.data.setups || setupsRes.data.recentSetups || (Array.isArray(setupsRes.data) ? setupsRes.data : []);
                setRecentSetups(setupsArray);
            }
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
            toast.error('Failed to load dashboard information.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/authentication";
    };

    const handleViewHistory = async (visitorId) => {
        try {
            const res = await API.get(`/dashboard/lead-history/${visitorId}`);
            if (res.data && res.data.lead) {
                toast.info(`Lead History loaded for: ${res.data.lead.name || visitorId}`);
            }
        } catch (err) {
            toast.error('Could not load chat history for this visitor.');
        }
    };

    if (loading && !stats.totalDatabasesCount) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500 mr-2" />
                <span className="text-sm font-semibold">Loading Enterprise Dashboard...</span>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans">
            {/* Sidebar Component */}
            <Sidebar 
                planStatus={agent?.planStatus}
                toggleDarkMode={toggleDarkMode}
                isDarkMode={isDarkMode}
            />

            {/* Main Content Area */}
            <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-full">
                <TopAlertBanner
                    planStatus={agent?.planStatus}
                    pendingPaymentDetails={agent?.pendingPaymentDetails}
                    broadcast={activeSystemBroadcast}
                />
                
                {/* Outlet passes context to all nested child routes */}
                <Outlet context={{ stats, recentSetups, agent, analyticsSessions, fetchDashboardData, handleLogout, handleViewHistory, userName }} />
            </main>
        </div>
    );
}
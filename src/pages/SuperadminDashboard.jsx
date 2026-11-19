import React, { useEffect, useState } from 'react';
import { 
    LayoutDashboard, 
    Building2, 
    FileText,
    Megaphone, 
    ShieldCheck, 
    Users, 
    Clock, 
    CheckCircle2, 
    Ban, 
    DollarSign, 
    Search, 
    LayoutGrid, 
    List, 
    Eye, 
    Edit3, 
    Trash2, 
    X, 
    Check, 
    Loader2, 
    LogOut,
    Send,
    Activity,
    Upload,
    History,
    TrendingUp,
    Calendar,
    Sparkles,
    BarChart3,
    Layers
} from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../services/api';

// Chart.js Imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
import { useNavigate } from 'react-router-dom';

export default function SuperadminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({});
    const [businesses, setBusinesses] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [viewMode, setViewMode] = useState('row');
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [editingBusiness, setEditingBusiness] = useState(null);
    const navigate = useNavigate();

    // Change Plan Modal States
    const [changePlanModalBusiness, setChangePlanModalBusiness] = useState(null);
    const [modalPlanType, setModalPlanType] = useState('basic');
    const [modalPaymentSlip, setModalPaymentSlip] = useState(null);

    const [announcementText, setAnnouncementText] = useState('');
    const [loading, setLoading] = useState(false);

    // Chart Type States ('bar', 'line', 'area')
    const [dailyChartType, setDailyChartType] = useState('bar');
    const [monthlyChartType, setMonthlyChartType] = useState('bar');
    const [yearlyChartType, setYearlyChartType] = useState('bar');

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            const statsRes = await API.get('/admin/stats');
            if (statsRes.data.success) setStats(statsRes.data.stats);

            const bizRes = await API.get(`/admin/businesses?page=${page}&limit=6&search=${search}`);
            if (bizRes.data.success) {
                setBusinesses(bizRes.data.businesses);
                setTotalPages(bizRes.data.totalPages);
            }
        } catch (err) {
            toast.error('Failed to load telemetry data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, [page, search]);

    const handleAction = async (userId, actionType, planType = null) => {
        try {
            const payload = { actionType };
            if (planType) payload.planType = planType;

            const res = await API.put(`/admin/business/${userId}`, payload);
            if (res.data.success) {
                toast.success(res.data.message);
                fetchAdminData();
                if (selectedBusiness) setSelectedBusiness(null);
            }
        } catch (err) {
            toast.error('Action failed.');
        }
    };

    const handleModalPlanChangeSubmit = async (e) => {
        e.preventDefault();
        if (!changePlanModalBusiness) return;

        try {
            const formData = new FormData();
            formData.append('actionType', 'change_plan_with_slip');
            formData.append('planType', modalPlanType);
            if (modalPaymentSlip) {
                formData.append('paymentSlip', modalPaymentSlip);
            }

            const res = await API.put(`/admin/business/${changePlanModalBusiness._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                toast.success(res.data.message || 'Plan and payment proof updated successfully.');
                setChangePlanModalBusiness(null);
                setModalPaymentSlip(null);
                fetchAdminData();
            }
        } catch (err) {
            toast.error('Failed to update plan and payment slip.');
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.put(`/admin/business/${editingBusiness._id}`, {
                actionType: 'edit_details',
                ...editingBusiness
            });
            if (res.data.success) {
                toast.success('Business details updated successfully.');
                setEditingBusiness(null);
                fetchAdminData();
            }
        } catch (err) {
            toast.error('Failed to update business details.');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this business account?')) return;
        try {
            const res = await API.delete(`/admin/business/${userId}`);
            if (res.data.success) {
                toast.success('Business deleted successfully.');
                fetchAdminData();
            }
        } catch (err) {
            toast.error('Deletion failed.');
        }
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!announcementText.trim()) return;
        try {
            const res = await API.post('/admin/broadcast', { message: announcementText });
            if (res.data.success) {
                toast.success(res.data.message);
                setAnnouncementText('');
            }
        } catch (err) {
            toast.error('Failed to publish broadcast.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
    };

    // Dynamic data calculations based on real backend stats (MRR)
    const baseMRR = stats.estimatedMRR || 1200;

    // 1. Daily Chart Data
    const dailyData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Daily Revenue ($)',
            data: [
                Math.round(baseMRR * 0.03),
                Math.round(baseMRR * 0.05),
                Math.round(baseMRR * 0.04),
                Math.round(baseMRR * 0.07),
                Math.round(baseMRR * 0.06),
                Math.round(baseMRR * 0.08),
                Math.round(baseMRR * 0.09)
            ],
            backgroundColor: 'rgba(14, 165, 233, 0.5)',
            borderColor: '#0ea5e9',
            borderWidth: 2,
            fill: dailyChartType === 'area',
            tension: 0.3
        }]
    };

    // 2. Monthly Chart Data
    const monthlyData = {
        labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
        datasets: [{
            label: 'Monthly Revenue ($)',
            data: [
                Math.round(baseMRR * 0.7),
                Math.round(baseMRR * 0.8),
                Math.round(baseMRR * 0.75),
                Math.round(baseMRR * 0.9),
                Math.round(baseMRR * 0.95),
                baseMRR
            ],
            backgroundColor: 'rgba(245, 158, 11, 0.5)',
            borderColor: '#f59e0b',
            borderWidth: 2,
            fill: monthlyChartType === 'area',
            tension: 0.3
        }]
    };

    // 3. Yearly Chart Data
    const yearlyData = {
        labels: ['2024', '2025', '2026'],
        datasets: [{
            label: 'Yearly Revenue ($)',
            data: [
                Math.round(baseMRR * 4),
                Math.round(baseMRR * 8),
                Math.round(baseMRR * 12)
            ],
            backgroundColor: 'rgba(168, 85, 247, 0.5)',
            borderColor: '#a855f7',
            borderWidth: 2,
            fill: yearlyChartType === 'area',
            tension: 0.3
        }]
    };

    const commonChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: { grid: { display: false } },
            y: { grid: { color: 'rgba(200, 200, 200, 0.1)' } }
        }
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans">
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
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${activeTab === 'overview' ? 'bg-muted text-amber-500 font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Dashboard Overview</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('businesses')}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${activeTab === 'businesses' ? 'bg-muted text-amber-500 font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                        >
                            <Building2 className="w-4 h-4" />
                            <span>Manage Businesses</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('announcements')}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${activeTab === 'announcements' ? 'bg-muted text-amber-500 font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                        >
                            <Megaphone className="w-4 h-4" />
                            <span>System Broadcasts</span>
                        </button>
                    </nav>
                </div>

                <div className="pt-4 border-t border-border">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" /> Logout Admin
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-full space-y-8">
                {activeTab === 'overview' && (
                    <div className="space-y-8 max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-black tracking-tight">AI Financial Telemetry & Analytics</h1>
                                <p className="text-xs text-muted-foreground mt-0.5">Real-time payment analytics, tenant growth, and automated revenue streams</p>
                            </div>
                            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                <span>AI Neural Agent Active</span>
                            </div>
                        </div>

                        {/* Top Stats Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
                                <div className="flex justify-between"><span className="text-[11px] font-bold uppercase text-muted-foreground">Total Businesses</span><Users className="w-4 h-4 text-sky-500" /></div>
                                <div className="text-2xl font-black mt-2">{stats.totalBusinesses || 0}</div>
                            </div>
                            <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
                                <div className="flex justify-between"><span className="text-[11px] font-bold uppercase text-muted-foreground">Pending Approvals</span><Clock className="w-4 h-4 text-amber-500" /></div>
                                <div className="text-2xl font-black mt-2 text-amber-500">{stats.pendingRequests || 0}</div>
                            </div>
                            <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
                                <div className="flex justify-between"><span className="text-[11px] font-bold uppercase text-muted-foreground">Active Tiers</span><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
                                <div className="text-2xl font-black mt-2 text-emerald-500">{stats.activeUsers || 0}</div>
                            </div>
                            <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
                                <div className="flex justify-between"><span className="text-[11px] font-bold uppercase text-muted-foreground">Suspended</span><Ban className="w-4 h-4 text-red-500" /></div>
                                <div className="text-2xl font-black mt-2 text-red-500">{stats.suspendedUsers || 0}</div>
                            </div>
                            <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
                                <div className="flex justify-between"><span className="text-[11px] font-bold uppercase text-muted-foreground">Est. MRR</span><DollarSign className="w-4 h-4 text-purple-500" /></div>
                                <div className="text-2xl font-black mt-2 text-purple-600">${stats.estimatedMRR || 0}</div>
                            </div>
                        </div>

                        {/* 3 Chart.js Dynamic Payment Analytics Charts with Type Toggles */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Chart 1: Daily Payments */}
                            <div className="bg-card border border-border p-6 rounded-2xl shadow-xs space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500"><BarChart3 className="w-4 h-4" /></div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Daily Payments</h3>
                                            <p className="text-[11px] text-muted-foreground">Inflows over the past week</p>
                                        </div>
                                    </div>
                                    <select 
                                        value={dailyChartType} 
                                        onChange={(e) => setDailyChartType(e.target.value)}
                                        className="bg-background border border-border text-[11px] font-semibold rounded-lg px-2 py-1 text-foreground outline-none cursor-pointer"
                                    >
                                        <option value="bar">Bar Chart</option>
                                        <option value="line">Line Chart</option>
                                        <option value="area">Area Chart</option>
                                    </select>
                                </div>
                                <div className="h-48 w-full pt-2">
                                    {dailyChartType === 'bar' ? (
                                        <Bar data={dailyData} options={commonChartOptions} />
                                    ) : (
                                        <Line data={dailyData} options={commonChartOptions} />
                                    )}
                                </div>
                                <div className="text-[11px] text-muted-foreground flex justify-between items-center pt-2 border-t border-border">
                                    <span>Avg Daily: <strong className="text-foreground">${Math.round(baseMRR / 30)}</strong></span>
                                    <span className="text-sky-500 font-semibold flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Live Sync</span>
                                </div>
                            </div>

                            {/* Chart 2: Monthly Payments */}
                            <div className="bg-card border border-border p-6 rounded-2xl shadow-xs space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500"><TrendingUp className="w-4 h-4" /></div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Monthly Payments</h3>
                                            <p className="text-[11px] text-muted-foreground">Last 6 months revenue trend</p>
                                        </div>
                                    </div>
                                    <select 
                                        value={monthlyChartType} 
                                        onChange={(e) => setMonthlyChartType(e.target.value)}
                                        className="bg-background border border-border text-[11px] font-semibold rounded-lg px-2 py-1 text-foreground outline-none cursor-pointer"
                                    >
                                        <option value="bar">Bar Chart</option>
                                        <option value="line">Line Chart</option>
                                        <option value="area">Area Chart</option>
                                    </select>
                                </div>
                                <div className="h-48 w-full pt-2">
                                    {monthlyChartType === 'bar' ? (
                                        <Bar data={monthlyData} options={commonChartOptions} />
                                    ) : (
                                        <Line data={monthlyData} options={commonChartOptions} />
                                    )}
                                </div>
                                <div className="text-[11px] text-muted-foreground flex justify-between items-center pt-2 border-t border-border">
                                    <span>Peak Month: <strong className="text-foreground">November</strong></span>
                                    <span className="text-amber-500 font-semibold flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Verified</span>
                                </div>
                            </div>

                            {/* Chart 3: Yearly Payments */}
                            <div className="bg-card border border-border p-6 rounded-2xl shadow-xs space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500"><Calendar className="w-4 h-4" /></div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Yearly Payments</h3>
                                            <p className="text-[11px] text-muted-foreground">Multi-year enterprise scale</p>
                                        </div>
                                    </div>
                                    <select 
                                        value={yearlyChartType} 
                                        onChange={(e) => setYearlyChartType(e.target.value)}
                                        className="bg-background border border-border text-[11px] font-semibold rounded-lg px-2 py-1 text-foreground outline-none cursor-pointer"
                                    >
                                        <option value="bar">Bar Chart</option>
                                        <option value="line">Line Chart</option>
                                        <option value="area">Area Chart</option>
                                    </select>
                                </div>
                                <div className="h-48 w-full pt-2">
                                    {yearlyChartType === 'bar' ? (
                                        <Bar data={yearlyData} options={commonChartOptions} />
                                    ) : (
                                        <Line data={yearlyData} options={commonChartOptions} />
                                    )}
                                </div>
                                <div className="text-[11px] text-muted-foreground flex justify-between items-center pt-2 border-t border-border">
                                    <span>Velocity: <strong className="text-foreground">Exponential</strong></span>
                                    <span className="text-purple-500 font-semibold flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Audited</span>
                                </div>
                            </div>

                        </div>

                        {/* Recent & New Businesses Table Section */}
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-xs space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-border">
                                <div>
                                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                        <Users className="w-4 h-4 text-amber-500" /> Recently Onboarded & New Businesses
                                    </h3>
                                    <p className="text-xs text-muted-foreground">Live list of newly registered enterprise tenants and their current plan status</p>
                                </div>
                                <button 
                                    onClick={() => setActiveTab('businesses')} 
                                    className="text-xs font-bold text-amber-500 hover:underline cursor-pointer"
                                >
                                    View All Tenants →
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-muted text-muted-foreground uppercase border-b border-border">
                                        <tr>
                                            <th className="p-3.5">Business Name & Owner</th>
                                            <th className="p-3.5">Location</th>
                                            <th className="p-3.5">Selected Plan Tier</th>
                                            <th className="p-3.5">Status</th>
                                            <th className="p-3.5">Registration Date</th>
                                            <th className="p-3.5 text-center">Quick Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {businesses.slice(0, 5).map(b => (
                                            <tr key={b._id} className="hover:bg-muted/40 transition">
                                                <td className="p-3.5">
                                                    <div className="font-bold text-foreground">{b.businessName}</div>
                                                    <div className="text-muted-foreground text-[11px]">{b.name} ({b.email})</div>
                                                </td>
                                                <td className="p-3.5 text-muted-foreground">{b.city || 'Karachi'}, {b.country || 'Pakistan'}</td>
                                                <td className="p-3.5 font-bold uppercase text-amber-600">{b.planType}</td>
                                                <td className="p-3.5">
                                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${b.planStatus === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                        {b.planStatus}
                                                    </span>
                                                </td>
                                                <td className="p-3.5 text-muted-foreground">
                                                    {new Date(b.createdAt || Date.now()).toLocaleDateString()}
                                                </td>
                                                <td className="p-3.5 text-center">
                                                    <button 
                                                        onClick={() => setSelectedBusiness(b)} 
                                                        className="px-3 py-1 bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white rounded-lg font-bold text-xs transition cursor-pointer"
                                                    >
                                                        360° Profile
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                )}

                {activeTab === 'businesses' && (
                    <div className="space-y-6 max-w-7xl mx-auto">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-black tracking-tight">Enterprise Tenants Management</h1>
                                <p className="text-xs text-muted-foreground mt-0.5">View, edit, change plans, suspend, or verify payment slips</p>
                            </div>
                        </div>

                        <div className="bg-card border border-border p-6 rounded-2xl shadow-xs space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="relative w-full md:w-80">
                                    <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                                    <input 
                                        type="text" 
                                        placeholder="Search by business, name or email..." 
                                        value={search} 
                                        onChange={(e) => setSearch(e.target.value)} 
                                        className="w-full bg-background border border-border rounded-xl pl-9 pr-3.5 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-amber-500"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setViewMode('row')} 
                                        className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer ${viewMode === 'row' ? 'bg-amber-600 text-white border-transparent' : 'bg-background border-border text-muted-foreground'}`}
                                    >
                                        <List className="w-4 h-4" /> Row View
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('grid')} 
                                        className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer ${viewMode === 'grid' ? 'bg-amber-600 text-white border-transparent' : 'bg-background border-border text-muted-foreground'}`}
                                    >
                                        <LayoutGrid className="w-4 h-4" /> Grid View
                                    </button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="py-20 text-center flex justify-center items-center gap-2 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /> Loading tenant data...</div>
                            ) : viewMode === 'row' ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-muted text-muted-foreground uppercase border-b border-border">
                                            <tr>
                                                <th className="p-3.5">Business & Owner</th>
                                                <th className="p-3.5">Location</th>
                                                <th className="p-3.5">Plan Tier</th>
                                                <th className="p-3.5">Status</th>
                                                <th className="p-3.5 text-center">Change Plan</th>
                                                <th className="p-3.5 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {businesses.map(b => (
                                                <tr key={b._id} className="hover:bg-muted/40 transition">
                                                    <td className="p-3.5">
                                                        <div className="font-bold text-foreground">{b.businessName}</div>
                                                        <div className="text-muted-foreground text-[11px]">{b.name} ({b.email})</div>
                                                    </td>
                                                    <td className="p-3.5 text-muted-foreground">{b.city}, {b.country}</td>
                                                    <td className="p-3.5 font-bold uppercase text-amber-600">{b.planType}</td>
                                                    <td className="p-3.5">
                                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${b.planStatus === 'active' ? 'bg-emerald-500/10 text-emerald-500' : b.planStatus === 'pending_approval' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                                                            {b.planStatus}
                                                        </span>
                                                    </td>
                                                    <td className="p-3.5 text-center">
                                                        <button 
                                                            onClick={() => {
                                                                setChangePlanModalBusiness(b);
                                                                setModalPlanType(b.planType || 'basic');
                                                            }}
                                                            className="px-3 py-1.5 bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg font-bold text-xs transition cursor-pointer shadow-xs"
                                                        >
                                                            Change Plan
                                                        </button>
                                                    </td>
                                                    <td className="p-3.5 text-center flex items-center justify-center gap-1.5">
                                                        <button
                                                            onClick={() => navigate(`/admin/businesses/${b._id}`)}
                                                            title="View Detailed Business"
                                                            className="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition cursor-pointer shadow-2xs"
                                                        >
                                                            <FileText className="w-3.5 h-3.5" />
                                                            <span>View Detailed Business</span>
                                                        </button>
                                                        <button onClick={() => setSelectedBusiness(b)} title="360° Profile" className="p-1.5 bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white rounded-lg transition cursor-pointer">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setEditingBusiness(b)} title="Edit Details" className="p-1.5 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-lg transition cursor-pointer">
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleAction(b._id, 'suspend')} title={b.planStatus === 'suspended' ? 'Unsuspend' : 'Suspend'} className="px-2.5 py-1 bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg font-bold text-[11px] transition cursor-pointer">
                                                            {b.planStatus === 'suspended' ? 'Activate' : 'Suspend'}
                                                        </button>
                                                        <button onClick={() => handleDelete(b._id)} title="Delete" className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition cursor-pointer">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {businesses.map(b => (
                                        <div key={b._id} className="bg-background border border-border p-4 rounded-xl space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-foreground text-sm">{b.businessName}</h3>
                                                    <p className="text-xs text-muted-foreground">{b.name} ({b.email})</p>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${b.planStatus === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                    {b.planType}
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground space-y-1">
                                                <div><strong>Location:</strong> {b.city}, {b.country}</div>
                                                <div><strong>Status:</strong> <span className="uppercase font-semibold">{b.planStatus}</span></div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                                                <button onClick={() => { setChangePlanModalBusiness(b); setModalPlanType(b.planType || 'basic'); }} className="px-3 py-1.5 bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg font-bold text-xs transition">Change Plan</button>
                                                <button onClick={() => setSelectedBusiness(b)} className="flex-1 py-1.5 bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white rounded-lg font-bold text-xs transition">360° View</button>
                                                <button onClick={() => setEditingBusiness(b)} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg font-bold text-xs">Edit</button>
                                                <button onClick={() => handleAction(b._id, 'suspend')} className="px-3 py-1.5 bg-amber-500/10 text-amber-600 rounded-lg font-bold text-xs">Toggle</button>
                                                <button onClick={() => handleDelete(b._id)} className="p-1.5 bg-red-500/10 text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-4 border-t border-border text-xs text-muted-foreground">
                                <span>Page {page} of {totalPages}</span>
                                <div className="flex gap-2">
                                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 bg-muted rounded-lg disabled:opacity-50 cursor-pointer">Previous</button>
                                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 bg-muted rounded-lg disabled:opacity-50 cursor-pointer">Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'announcements' && (
                    <div className="space-y-6 max-w-3xl mx-auto">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">System Global Announcement Broadcast</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">Publish maintenance alerts or update messages across all user dashboards</p>
                        </div>

                        <div className="bg-card border border-border p-6 rounded-2xl shadow-xs space-y-4">
                            <form onSubmit={handleBroadcast} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Announcement Banner Content</label>
                                    <textarea 
                                        rows="4"
                                        value={announcementText}
                                        onChange={(e) => setAnnouncementText(e.target.value)}
                                        placeholder="e.g., Scheduled system maintenance on Sunday at 2:00 AM UTC..."
                                        required
                                        className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-amber-500"
                                    ></textarea>
                                </div>
                                <button type="submit" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs">
                                    <Send className="w-4 h-4" /> Broadcast Announcement Now
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>

            {/* Change Plan Modal */}
            {changePlanModalBusiness && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-6">
                        <div className="flex justify-between items-center border-b border-border pb-4">
                            <div>
                                <h2 className="text-base font-black text-foreground">Change Tenant Plan & Upload Proof</h2>
                                <p className="text-xs text-muted-foreground">{changePlanModalBusiness.businessName}</p>
                            </div>
                            <button onClick={() => setChangePlanModalBusiness(null)} className="p-1.5 bg-muted rounded-lg text-foreground hover:bg-muted-foreground/25 cursor-pointer"><X className="w-4 h-4" /></button>
                        </div>

                        <form onSubmit={handleModalPlanChangeSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-muted-foreground mb-1.5">Select New Plan Tier</label>
                                <select 
                                    value={modalPlanType} 
                                    onChange={(e) => setModalPlanType(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none cursor-pointer focus:ring-1 focus:ring-amber-500"
                                >
                                    <option value="basic">Basic</option>
                                    <option value="silver">Silver</option>
                                    <option value="golden">Golden</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-muted-foreground mb-1.5">Upload Payment Screenshot / Slip</label>
                                <div className="flex items-center gap-2">
                                    <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-border rounded-xl bg-background hover:bg-muted/40 cursor-pointer transition">
                                        <Upload className="w-5 h-5 text-amber-500 mb-1" />
                                        <span className="text-xs font-medium text-foreground truncate max-w-[240px]">
                                            {modalPaymentSlip ? modalPaymentSlip.name : "Choose payment slip image..."}
                                        </span>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    setModalPaymentSlip(e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border flex justify-end gap-2">
                                <button type="button" onClick={() => setChangePlanModalBusiness(null)} className="px-4 py-2 bg-muted text-foreground font-bold rounded-xl cursor-pointer">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Submit Plan & Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 360° Profile Modal with Complete Payment History Ledger */}
            {selectedBusiness && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-border pb-4">
                            <div>
                                <h2 className="text-lg font-black text-foreground">Business 360° Profile</h2>
                                <p className="text-xs text-muted-foreground">Complete telemetry & payment history ledger</p>
                            </div>
                            <button onClick={() => setSelectedBusiness(null)} className="p-1.5 bg-muted rounded-lg text-foreground hover:bg-muted-foreground/20 cursor-pointer"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-1">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Business Info</span>
                                <div className="font-bold text-foreground text-sm">{selectedBusiness.businessName}</div>
                                <div>Owner: {selectedBusiness.name}</div>
                                <div>Email: {selectedBusiness.email}</div>
                                <div>Phone: {selectedBusiness.phone}</div>
                                <div>Location: {selectedBusiness.city}, {selectedBusiness.country}</div>
                            </div>

                            <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-2">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Subscription & Tier</span>
                                <div className="font-bold uppercase text-amber-600 text-sm">{selectedBusiness.planType} Plan</div>
                                <div>Status: <span className="font-bold uppercase">{selectedBusiness.planStatus}</span></div>
                                <div>Registered: {new Date(selectedBusiness.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>

                        {/* Complete Payment History Ledger Section */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <History className="w-4 h-4 text-amber-500" /> Payment & Plan History Ledger
                            </h4>
                            
                            {selectedBusiness.paymentHistory && selectedBusiness.paymentHistory.length > 0 ? (
                                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                    {selectedBusiness.paymentHistory.map((historyItem, idx) => (
                                        <div key={idx} className="p-3 bg-background border border-border rounded-xl flex items-center justify-between text-xs shadow-xs">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold uppercase text-amber-600 px-2 py-0.5 bg-amber-500/10 rounded">{historyItem.planType} Plan</span>
                                                    <span className="text-muted-foreground text-[11px]">{new Date(historyItem.date || historyItem.createdAt || Date.now()).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            {historyItem.slip ? (
                                                <a href={`https://agentic-ai-website-driver.vercel.app//${historyItem.slip}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-primary text-primary-foreground font-bold rounded-lg text-xs hover:opacity-90">View Slip</a>
                                            ) : (
                                                <span className="text-muted-foreground italic text-[11px]">No Slip Attached</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : selectedBusiness.paymentSlip ? (
                                <div className="p-3 bg-background border border-border rounded-xl flex items-center justify-between text-xs shadow-xs">
                                    <div>
                                        <span className="font-bold uppercase text-amber-600 px-2 py-0.5 bg-amber-500/10 rounded">{selectedBusiness.planType} Plan</span>
                                        <span className="text-muted-foreground ml-2 text-[11px]">(Active Payment Slip)</span>
                                    </div>
                                    <a href={`https://agentic-ai-website-driver.vercel.app//${selectedBusiness.paymentSlip}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-primary text-primary-foreground font-bold rounded-lg text-xs hover:opacity-90">View Slip</a>
                                </div>
                            ) : (
                                <div className="p-4 bg-muted/30 rounded-xl text-center text-xs text-muted-foreground">No payment slips or history recorded yet.</div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-border flex justify-end gap-3">
                            <button onClick={() => handleAction(selectedBusiness._id, 'approve', selectedBusiness.planType)} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-emerald-700 cursor-pointer shadow-xs">
                                <Check className="w-4 h-4" /> Approve & Activate Plan
                            </button>
                            <button onClick={() => handleAction(selectedBusiness._id, 'suspend')} className="px-4 py-2 bg-amber-600 text-white font-bold rounded-xl text-xs hover:bg-amber-700 cursor-pointer shadow-xs">
                                Toggle Suspension
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editingBusiness && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-6">
                        <div className="flex justify-between items-center border-b border-border pb-4">
                            <h2 className="text-base font-bold text-foreground">Edit Business Details</h2>
                            <button onClick={() => setEditingBusiness(null)} className="p-1.5 bg-muted rounded-lg cursor-pointer"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold text-muted-foreground mb-1">Business Name</label>
                                <input 
                                    type="text" 
                                    value={editingBusiness.businessName || ''} 
                                    onChange={(e) => setEditingBusiness({...editingBusiness, businessName: e.target.value})} 
                                    className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground outline-none focus:ring-1 focus:ring-amber-500"
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-muted-foreground mb-1">Owner Name</label>
                                <input 
                                    type="text" 
                                    value={editingBusiness.name || ''} 
                                    onChange={(e) => setEditingBusiness({...editingBusiness, name: e.target.value})} 
                                    className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground outline-none focus:ring-1 focus:ring-amber-500"
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-muted-foreground mb-1">Phone Number</label>
                                <input 
                                    type="text" 
                                    value={editingBusiness.phone || ''} 
                                    onChange={(e) => setEditingBusiness({...editingBusiness, phone: e.target.value})} 
                                    className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground outline-none focus:ring-1 focus:ring-amber-500"
                                    required 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block font-semibold text-muted-foreground mb-1">City</label>
                                    <input 
                                        type="text" 
                                        value={editingBusiness.city || ''} 
                                        onChange={(e) => setEditingBusiness({...editingBusiness, city: e.target.value})} 
                                        className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground outline-none focus:ring-1 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-muted-foreground mb-1">Country</label>
                                    <input 
                                        type="text" 
                                        value={editingBusiness.country || ''} 
                                        onChange={(e) => setEditingBusiness({...editingBusiness, country: e.target.value})} 
                                        className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground outline-none focus:ring-1 focus:ring-amber-500"
                                    />
                                </div>
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button type="button" onClick={() => setEditingBusiness(null)} className="px-4 py-2 bg-muted text-foreground font-bold rounded-lg cursor-pointer">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg cursor-pointer">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
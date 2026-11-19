import React from 'react';
import { Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './pages/DashboardLayout';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminLogin from './pages/AdminLogin';
import SuperadminDashboard from './pages/SuperadminDashboard';
import UserProfile from './pages/UserProfile';

// Dashboard Tabs components
import OverviewTab from './pages/OverviewTab';
import DatabaseSetupTab from './pages/DatabaseSetupTab';
import AgentGeneratorTab from './pages/AgentGeneratorTab';
import RecentSetupsTab from './pages/RecentSetupsTab';
import PlansPage from './pages/PlansPage';
import BusinessDetailPage from './pages/BusinessDetailPage';

// Wrapper components for nested outlet context routing
function OverviewTabWrapper() {
    const { stats, analyticsSessions, handleLogout, handleViewHistory, userName } = useOutletContext();
    return <OverviewTab stats={stats} analyticsSessions={analyticsSessions} onLogout={handleLogout} onViewHistory={handleViewHistory} userName={userName} />;
}

function DatabaseSetupTabWrapper() {
    const { agent, fetchDashboardData } = useOutletContext();
    return <DatabaseSetupTab agent={agent} refreshAgent={fetchDashboardData} />;
}

function AgentGeneratorTabWrapper() {
    const { agent, fetchDashboardData } = useOutletContext();
    return <AgentGeneratorTab agent={agent} refreshAgent={fetchDashboardData} />;
}

function RecentSetupsTabWrapper() {
    const { recentSetups, fetchDashboardData } = useOutletContext();
    return <RecentSetupsTab recentSetups={recentSetups} onRefresh={fetchDashboardData} />;
}

function PlansPageWrapper() {
    const { agent } = useOutletContext();
    return <PlansPage user={agent} />;
}

// Protected Route for Regular Users
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/authentication" replace />;
    }
    return children;
};

// Protected Route for Superadmin
const AdminProtectedRoute = ({ children }) => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        return <Navigate to="/admin/login" replace />;
    }
    return children;
};

export default function App() {
    return (
        <Routes>
            <Route path='*' element={<NotFoundPage/>} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/" element={<Navigate to="/landing" replace />} />
            <Route path="/authentication" element={<AuthPage />} />
            
            {/* Regular User Dashboard with Nested Sub-Routes */}
            <Route
                path="/dashboard/*"
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="overview" replace />} />
                <Route path="overview" element={<OverviewTabWrapper />} />
                <Route path="database" element={<DatabaseSetupTabWrapper />} />
                <Route path="generator" element={<AgentGeneratorTabWrapper />} />
                <Route path="recent" element={<RecentSetupsTabWrapper />} />
                <Route path="plans" element={<PlansPageWrapper />} />
                <Route path="profile" element={<UserProfile />} />
                
                {/* AI Chat Workspace tab route */}
                <Route path="workspace" element={
                    <div className="space-y-6 max-w-5xl mx-auto">
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">AI Agent Workspace</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">Contextual query testing environment connected with your database schema</p>
                        </div>
                        <div className="bg-card border border-border p-6 rounded-xl h-[480px] flex flex-col justify-between shadow-xs">
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                <div className="bg-muted p-3.5 rounded-xl max-w-lg text-xs text-foreground border border-border">
                                    <span className="font-bold text-sky-500 block mb-1">AI Assistant Ready:</span>
                                    Ask any data-related question. The model uses your selected tables and database schema automatically.
                                </div>
                            </div>
                            <div className="flex gap-2 pt-3 border-t border-border">
                                <input 
                                    type="text" 
                                    placeholder="Type your data query..." 
                                    className="flex-1 bg-background border border-border rounded-lg px-3.5 py-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary" 
                                />
                                <button className="px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:opacity-90 transition cursor-pointer">
                                    Send Query
                                </button>
                            </div>
                        </div>
                    </div>
                } />
            </Route>

            {/* Superadmin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
                path="/superadmin/dashboard"
                element={
                    <AdminProtectedRoute>
                        <SuperadminDashboard />
                    </AdminProtectedRoute>
                }
            />
            <Route path="/admin/businesses/:userId" element={<BusinessDetailPage />} />
        </Routes>
    );
}
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
import PendingExpiredBusinessesPage from './pages/PendingExpiredBusinessesPage';
import ChatWorkspaceTab from './pages/ChatWorkspaceTab';

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

function ChatWorkspaceTabWrapper() {
    const { agent, fetchDashboardData } = useOutletContext();
    return <ChatWorkspaceTab agent={agent} refreshAgent={fetchDashboardData} />;
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
            <Route path="*" element={<NotFoundPage />} />
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
                <Route path="workspace" element={<ChatWorkspaceTabWrapper />} />
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
            <Route
                path="/admin/businesses/:userId"
                element={
                    <AdminProtectedRoute>
                        <BusinessDetailPage />
                    </AdminProtectedRoute>
                }
            />
            <Route
                path="/admin/businesses/pending-expired"
                element={
                    <AdminProtectedRoute>
                        <PendingExpiredBusinessesPage />
                    </AdminProtectedRoute>
                }
            />
        </Routes>
    );
}
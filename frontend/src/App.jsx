import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HelperSidebar from './components/HelperSidebar';
import AdminSidebar from './components/AdminSidebar';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CompleteSignup from './pages/CompleteSignup';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import UserServices from './pages/user/Services';
import UserRequest from './pages/user/Request';
import UserTrack from './pages/user/Track';
import UserChat from './pages/user/Chat';
import UserDocuments from './pages/user/Documents';
import UserProfile from './pages/user/Profile';
import UserVault from './pages/user/Vault';
import UserAIChat from './pages/user/AIChat';

// Helper Pages
import HelperDashboard from './pages/helper/Dashboard';
import HelperRequests from './pages/helper/Requests';
import HelperTasks from './pages/helper/Tasks';
import HelperChat from './pages/helper/Chat';
import HelperEarnings from './pages/helper/Earnings';
import HelperProfile from './pages/helper/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminHelpers from './pages/admin/Helpers';
import AdminVerification from './pages/admin/Verification';
import AdminTasks from './pages/admin/Tasks';
import AdminPayments from './pages/admin/Payments';

// Legacy pages kept for backward compat
import AIAssistant from './pages/AIAssistant';
import Documents from './pages/Documents';
import Reminders from './pages/Reminders';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Services from './pages/Services';
import AdminPanel from './pages/AdminPanel';
import RequestService from './pages/RequestService';

// ── Route Guards ──────────────────────────────────────────────────
function LoadingScreen() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-bg">
            <div className="text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <p className="text-sm text-text-light font-medium">Loading RetireAssist...</p>
            </div>
        </div>
    );
}

function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();
    if (loading) return <LoadingScreen />;
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const home = user.role === 'admin' ? '/admin/dashboard' : user.role === 'helper' ? '/helper/dashboard' : '/user/dashboard';
        return <Navigate to={home} replace />;
    }
    return children;
}

// ── Layouts ───────────────────────────────────────────────────────
function isDesktop() { return window.innerWidth >= 1024; }

function AppLayout({ children, SidebarComponent }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => setSidebarOpen(isDesktop());
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!isDesktop()) setSidebarOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = sidebarOpen && !isDesktop() ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [sidebarOpen]);

    const SC = SidebarComponent || Sidebar;

    return (
        <div className="min-h-screen bg-bg">
            <SC open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Navbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(p => !p)} />
            <main className="pt-20 min-h-screen transition-all duration-200" style={{ marginLeft: sidebarOpen && isDesktop() ? '16rem' : '0' }}>
                <div className="p-4 lg:p-6">{children}</div>
            </main>
        </div>
    );
}

function UserLayout({ children }) { return <AppLayout SidebarComponent={Sidebar}>{children}</AppLayout>; }
function HelperLayout({ children }) { return <AppLayout SidebarComponent={HelperSidebar}>{children}</AppLayout>; }
function AdminLayout({ children }) { return <AppLayout SidebarComponent={AdminSidebar}>{children}</AppLayout>; }

// ── Main App ──────────────────────────────────────────────────────
export default function App() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/complete-signup" element={<ProtectedRoute><CompleteSignup /></ProtectedRoute>} />

            {/* User Panel */}
            <Route path="/user/dashboard" element={<ProtectedRoute allowedRoles={['user']}><UserLayout><UserDashboard /></UserLayout></ProtectedRoute>} />
            <Route path="/user/services" element={<ProtectedRoute allowedRoles={['user']}><UserLayout><UserServices /></UserLayout></ProtectedRoute>} />
            <Route path="/user/request" element={<ProtectedRoute allowedRoles={['user']}><UserLayout><UserRequest /></UserLayout></ProtectedRoute>} />
            <Route path="/user/track" element={<ProtectedRoute allowedRoles={['user']}><UserLayout><UserTrack /></UserLayout></ProtectedRoute>} />
            <Route path="/user/track/:id" element={<ProtectedRoute allowedRoles={['user']}><UserLayout><UserTrack /></UserLayout></ProtectedRoute>} />
            <Route path="/user/chat" element={<ProtectedRoute allowedRoles={['user']}><UserLayout><UserChat /></UserLayout></ProtectedRoute>} />
            <Route path="/user/chat/:requestId" element={<ProtectedRoute allowedRoles={['user']}><UserLayout><UserChat /></UserLayout></ProtectedRoute>} />
            <Route path="/user/documents" element={<ProtectedRoute allowedRoles={['user']}><UserLayout><UserDocuments /></UserLayout></ProtectedRoute>} />
            <Route path="/user/profile" element={<ProtectedRoute allowedRoles={['user']}><UserLayout><UserProfile /></UserLayout></ProtectedRoute>} />
            <Route path="/user/vault" element={<ProtectedRoute allowedRoles={['user']}><UserLayout><UserVault /></UserLayout></ProtectedRoute>} />
            <Route path="/user/ai-chat" element={<ProtectedRoute allowedRoles={['user']}><UserLayout><UserAIChat /></UserLayout></ProtectedRoute>} />

            {/* Helper Panel */}
            <Route path="/helper/dashboard" element={<ProtectedRoute allowedRoles={['helper']}><HelperLayout><HelperDashboard /></HelperLayout></ProtectedRoute>} />
            <Route path="/helper/requests" element={<ProtectedRoute allowedRoles={['helper']}><HelperLayout><HelperRequests /></HelperLayout></ProtectedRoute>} />
            <Route path="/helper/tasks" element={<ProtectedRoute allowedRoles={['helper']}><HelperLayout><HelperTasks /></HelperLayout></ProtectedRoute>} />
            <Route path="/helper/tasks/:id" element={<ProtectedRoute allowedRoles={['helper']}><HelperLayout><HelperTasks /></HelperLayout></ProtectedRoute>} />
            <Route path="/helper/chat" element={<ProtectedRoute allowedRoles={['helper']}><HelperLayout><HelperChat /></HelperLayout></ProtectedRoute>} />
            <Route path="/helper/chat/:requestId" element={<ProtectedRoute allowedRoles={['helper']}><HelperLayout><HelperChat /></HelperLayout></ProtectedRoute>} />
            <Route path="/helper/earnings" element={<ProtectedRoute allowedRoles={['helper']}><HelperLayout><HelperEarnings /></HelperLayout></ProtectedRoute>} />
            <Route path="/helper/profile" element={<ProtectedRoute allowedRoles={['helper']}><HelperLayout><HelperProfile /></HelperLayout></ProtectedRoute>} />

            {/* Admin Panel */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/helpers" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminHelpers /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/verification" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminVerification /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/tasks" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminTasks /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminPayments /></AdminLayout></ProtectedRoute>} />

            {/* Legacy redirects for backward compat */}
            <Route path="/dashboard" element={<ProtectedRoute><LegacyRedirect /></ProtectedRoute>} />
            <Route path="/assistant" element={<ProtectedRoute><UserLayout><AIAssistant /></UserLayout></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><UserLayout><Documents /></UserLayout></ProtectedRoute>} />
            <Route path="/reminders" element={<ProtectedRoute><UserLayout><Reminders /></UserLayout></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><UserLayout><Services /></UserLayout></ProtectedRoute>} />
            <Route path="/requests" element={<ProtectedRoute><UserLayout><RequestService /></UserLayout></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><UserLayout><Notifications /></UserLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserLayout><Profile /></UserLayout></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminPanel /></AdminLayout></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function LegacyRedirect() {
    const { user } = useAuth();
    const home = user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'helper' ? '/helper/dashboard' : '/user/dashboard';
    return <Navigate to={home} replace />;
}

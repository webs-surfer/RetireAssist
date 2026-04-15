import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, UserCheck, ClipboardList, DollarSign, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
    const { API } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/admin/stats').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const s = stats || {};

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-dark mb-1">Admin Dashboard</h1>
                <p className="text-text-light text-sm">Platform overview and key metrics.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    { icon: Users, label: 'Total Users', value: s.totalUsers, gradient: 'bg-gradient-to-br from-blue-500 to-cyan-400', to: '/admin/users' },
                    { icon: UserCheck, label: 'Total Helpers', value: s.totalHelpers, gradient: 'bg-gradient-to-br from-emerald-500 to-teal-400', to: '/admin/helpers' },
                    { icon: AlertCircle, label: 'Pending KYC', value: s.pendingHelpers, gradient: 'bg-gradient-to-br from-orange-400 to-rose-400', to: '/admin/verification' },
                    { icon: ClipboardList, label: 'Total Requests', value: s.totalRequests, gradient: 'bg-gradient-to-br from-violet-500 to-purple-400', to: '/admin/tasks' },
                    { icon: ShieldCheck, label: 'Completed Tasks', value: s.completedRequests, gradient: 'bg-gradient-to-br from-green-500 to-emerald-400', to: '/admin/tasks' },
                    { icon: DollarSign, label: 'Platform Revenue', value: `₹${(s.totalRevenue || 0).toLocaleString('en-IN')}`, gradient: 'bg-gradient-to-br from-yellow-400 to-orange-400', to: '/admin/payments' },
                ].map((card, i) => (
                    <Link key={i} to={card.to} className={`${card.gradient} card-gradient p-5 rounded-xl no-underline block hover:-translate-y-0.5 transition-transform`}>
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3"><card.icon size={20} className="text-white" /></div>
                        <p className="text-2xl font-bold text-white">{loading ? '...' : (card.value ?? 0)}</p>
                        <p className="text-sm text-white/80 mt-0.5">{card.label}</p>
                    </Link>
                ))}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { to: '/admin/verification', label: 'Review Pending KYC', icon: ShieldCheck, desc: 'Approve or reject helper applications', color: 'border-orange-200 bg-orange-50' },
                    { to: '/admin/tasks', label: 'Monitor Tasks', icon: ClipboardList, desc: 'View all active service requests', color: 'border-purple-200 bg-purple-50' },
                    { to: '/admin/payments', label: 'Manage Payments', icon: DollarSign, desc: 'Oversee all payment transactions', color: 'border-green-200 bg-green-50' },
                ].map(item => (
                    <Link key={item.to} to={item.to} className={`p-4 rounded-xl border-2 ${item.color} no-underline hover:shadow-sm transition-all`}>
                        <item.icon size={20} className="text-text-dark mb-2" />
                        <p className="text-sm font-bold text-text-dark">{item.label}</p>
                        <p className="text-xs text-text-muted mt-0.5">{item.desc}</p>
                        <ArrowRight size={14} className="mt-2 text-text-muted" />
                    </Link>
                ))}
            </div>
        </motion.div>
    );
}

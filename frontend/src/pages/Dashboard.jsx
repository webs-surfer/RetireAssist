import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, FileText, Bell, CheckCircle, Calendar, TrendingUp, Bot, ArrowRight, Send, Clock, Shield, Zap, FolderOpen } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const gradients = [
    'bg-gradient-to-br from-blue-500 to-cyan-400',
    'bg-gradient-to-br from-emerald-500 to-teal-400',
    'bg-gradient-to-br from-orange-400 to-rose-400',
    'bg-gradient-to-br from-violet-500 to-purple-400',
];

export default function Dashboard() {
    const { user, API } = useAuth();
    const [pension, setPension] = useState(null);
    const [reminders, setReminders] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            API.get('/pension/status').catch(() => ({ data: null })),
            API.get('/reminders').catch(() => ({ data: [] })),
            API.get('/documents').catch(() => ({ data: [] })),
        ]).then(([p, r, d]) => {
            setPension(p.data);
            setReminders(r.data || []);
            setDocuments(d.data || []);
        }).finally(() => setLoading(false));
    }, []);

    const pendingReminders = reminders.filter(r => r.status === 'pending');
    const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const stats = [
        { icon: Send, label: 'Active Requests', value: pendingReminders.length, gradient: gradients[0] },
        { icon: CheckCircle, label: 'Completed Tasks', value: reminders.filter(r => r.status === 'completed').length, gradient: gradients[1] },
        { icon: FileText, label: 'Pending Documents', value: documents.length, gradient: gradients[2] },
        { icon: Bell, label: 'Upcoming Reminders', value: pendingReminders.length, gradient: gradients[3] },
    ];

    const activities = [
        { icon: Send, text: 'Pension Application Submitted', time: '2 hours ago', color: 'text-primary-light bg-blue-50' },
        { icon: Clock, text: 'ITR Filing In Progress', time: '5 hours ago', color: 'text-warning bg-yellow-50' },
        { icon: CheckCircle, text: 'Insurance Claim Approved', time: '1 day ago', color: 'text-accent bg-emerald-50' },
        { icon: FileText, text: 'Life Certificate Uploaded', time: '2 days ago', color: 'text-violet-600 bg-violet-50' },
    ];

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-5">
            {/* Welcome */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-text-dark">Welcome To Retire Assist</h1>
                    <p className="text-sm text-text-light mt-0.5">Your trusted digital companion for managing pension documents, insurance claims, and government reimbursements.</p>
                </div>
                <span className="trust-badge"><Shield size={12} /> Secure Platform</span>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <motion.div key={i} variants={fadeUp} className={`${s.gradient} card-gradient p-5 rounded-xl cursor-pointer`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <s.icon size={20} className="text-white" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white">{s.value}</p>
                        <p className="text-sm text-white/80 mt-0.5">{s.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Two Column */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Pension Details */}
                <motion.div variants={fadeUp} className="card">
                    <h2 className="text-base font-bold text-text-dark mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-primary" /> Pension Details
                    </h2>
                    <div className="space-y-0">
                        {[
                            ['Pension ID', pension?.pensionId || 'PEN-2024-001234'],
                            ['Type', pension?.pensionType || 'Government Service Pension'],
                            ['Monthly Amount', `₹${(pension?.monthlyAmount || 25000).toLocaleString('en-IN')}`],
                            ['Last Payment', pension?.lastPaymentDate || 'Feb 28, 2026'],
                            ['Next Payment', pension?.nextPaymentDate || 'Mar 31, 2026'],
                            ['Bank', `${pension?.bankName || 'State Bank of India'}`],
                        ].map(([label, value], i, arr) => (
                            <div key={i} className={`flex justify-between items-center py-3 ${i < arr.length - 1 ? 'border-b border-border/60' : ''}`}>
                                <span className="text-sm text-text-light">{label}</span>
                                <span className="text-sm font-semibold text-text-dark">{value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div variants={fadeUp} className="card">
                    <h2 className="text-base font-bold text-text-dark mb-4 flex items-center gap-2">
                        <Zap size={18} className="text-warning" /> Recent Activity
                    </h2>
                    <div className="space-y-3">
                        {activities.map((a, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-bg rounded-lg">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${a.color}`}>
                                    <a.icon size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-dark">{a.text}</p>
                                    <p className="text-xs text-text-muted">{a.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div variants={fadeUp} className="card">
                <h2 className="text-base font-bold text-text-dark mb-4">⚡ Quick Actions</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { to: '/assistant', icon: Bot, label: 'AI Assistant', desc: 'Ask a question', color: 'from-blue-500 to-cyan-400' },
                        { to: '/documents', icon: FolderOpen, label: 'Document Vault', desc: 'Upload files', color: 'from-violet-500 to-purple-400' },
                        { to: '/services', icon: FileText, label: 'Services', desc: 'Step-by-step help', color: 'from-emerald-500 to-teal-400' },
                        { to: '/requests', icon: Send, label: 'New Request', desc: 'Request a service', color: 'from-orange-400 to-rose-400' },
                    ].map(item => (
                        <Link key={item.to} to={item.to} className={`bg-gradient-to-br ${item.color} rounded-xl p-4 text-white no-underline hover:shadow-lg hover:-translate-y-0.5 transition-all`}>
                            <item.icon size={22} className="mb-2" />
                            <p className="font-semibold text-sm">{item.label}</p>
                            <p className="text-xs text-white/70">{item.desc}</p>
                        </Link>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}

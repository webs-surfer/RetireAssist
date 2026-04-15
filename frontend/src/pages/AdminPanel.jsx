import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Users, FileText, CheckCircle, Clock, Search, Send, Bell, Eye, BarChart3, Megaphone } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const gradients = [
    'bg-gradient-to-br from-blue-500 to-cyan-400',
    'bg-gradient-to-br from-emerald-500 to-teal-400',
    'bg-gradient-to-br from-violet-500 to-purple-400',
    'bg-gradient-to-br from-orange-400 to-rose-400',
];

export default function AdminPanel() {
    const { API } = useAuth();
    const [tab, setTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [announcement, setAnnouncement] = useState({ title: '', message: '' });
    const [stats, setStats] = useState({ totalUsers: 0, activeRequests: 0, completedTasks: 0, pendingVerification: 0 });

    useEffect(() => {
        Promise.all([
            API.get('/admin/users').catch(() => ({ data: [] })),
            API.get('/admin/documents').catch(() => ({ data: [] })),
            API.get('/admin/stats').catch(() => ({ data: {} })),
        ]).then(([u, d, s]) => {
            setUsers(u.data || []);
            setDocs(d.data || []);
            setStats({ totalUsers: (u.data || []).length, activeRequests: (d.data || []).filter(x => x.status !== 'verified').length, completedTasks: (d.data || []).filter(x => x.status === 'verified').length, pendingVerification: (d.data || []).filter(x => x.status === 'pending').length, ...s.data });
        }).finally(() => setLoading(false));
    }, []);

    const updateDocStatus = async (id, status) => { try { await API.put(`/admin/documents/${id}`, { status }); setDocs(d => d.map(x => x._id === id ? { ...x, status } : x)); } catch { } };
    const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

    const statCards = [
        { icon: Users, label: 'Total Users', value: stats.totalUsers, gradient: gradients[0] },
        { icon: Send, label: 'Active Requests', value: stats.activeRequests, gradient: gradients[1] },
        { icon: CheckCircle, label: 'Completed Tasks', value: stats.completedTasks, gradient: gradients[2] },
        { icon: Clock, label: 'Pending Verification', value: stats.pendingVerification, gradient: gradients[3] },
    ];

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
    ];

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-5">
                <Shield size={24} className="text-primary" />
                <div>
                    <h1 className="text-2xl font-bold text-text-dark">Admin Panel</h1>
                    <p className="text-sm text-text-light">Manage users, documents, and platform services</p>
                </div>
            </motion.div>

            {/* Tabs */}
            <motion.div variants={fadeUp} className="flex gap-1 mb-5 bg-bg rounded-xl p-1 border border-border">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium cursor-pointer border-none transition-all ${tab === t.id ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-sm' : 'bg-transparent text-text-light hover:text-text'}`}>
                        <t.icon size={15} /> {t.label}
                    </button>
                ))}
            </motion.div>

            {/* Overview */}
            {tab === 'overview' && (
                <motion.div variants={stagger}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                        {statCards.map((s, i) => (
                            <motion.div key={i} variants={fadeUp} className={`${s.gradient} card-gradient p-5 rounded-xl`}>
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                                    <s.icon size={20} className="text-white" />
                                </div>
                                <p className="text-3xl font-bold text-white">{s.value}</p>
                                <p className="text-sm text-white/80 mt-0.5">{s.label}</p>
                            </motion.div>
                        ))}
                    </div>
                    <motion.div variants={fadeUp} className="card">
                        <h3 className="font-bold text-text-dark mb-3">Recent Users</h3>
                        <div className="space-y-2">
                            {users.slice(0, 5).map(u => (
                                <div key={u._id} className="flex items-center gap-3 p-3 bg-bg rounded-lg">
                                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        {u.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-text-dark">{u.name}</p>
                                        <p className="text-xs text-text-muted">{u.email}</p>
                                    </div>
                                    <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-info'}`}>{u.role}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Users */}
            {tab === 'users' && (
                <motion.div variants={fadeUp}>
                    <div className="card">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-2 bg-bg rounded-lg px-3 py-2 flex-1">
                                <Search size={16} className="text-text-muted" />
                                <input type="text" className="bg-transparent border-none outline-none text-sm w-full" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-border">
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-text-muted uppercase">Name</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-text-muted uppercase">Email</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-text-muted uppercase">Role</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-text-muted uppercase">Pension ID</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-text-muted uppercase">Actions</th>
                                </tr></thead>
                                <tbody>
                                    {filteredUsers.map(u => (
                                        <tr key={u._id} className="border-b border-border/60 hover:bg-bg transition-colors">
                                            <td className="py-3 px-3 font-medium">{u.name}</td>
                                            <td className="py-3 px-3 text-text-light">{u.email}</td>
                                            <td className="py-3 px-3"><span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-info'}`}>{u.role}</span></td>
                                            <td className="py-3 px-3 text-text-muted font-mono text-xs">{u.pensionId || '—'}</td>
                                            <td className="py-3 px-3"><button className="btn-ghost !px-2 !py-1 !min-h-0 text-xs"><Eye size={12} /> View</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Documents */}
            {tab === 'documents' && (
                <motion.div variants={fadeUp}>
                    <div className="card">
                        <h3 className="font-bold text-text-dark mb-4">Document Review</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-border">
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-text-muted uppercase">Type</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-text-muted uppercase">User</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-text-muted uppercase">Status</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-text-muted uppercase">Actions</th>
                                </tr></thead>
                                <tbody>
                                    {docs.map(d => (
                                        <tr key={d._id} className="border-b border-border/60 hover:bg-bg transition-colors">
                                            <td className="py-3 px-3 font-medium">{d.type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                                            <td className="py-3 px-3 text-text-light">{d.userId?.name || '—'}</td>
                                            <td className="py-3 px-3"><span className={`badge ${d.status === 'verified' ? 'badge-success' : d.status === 'processing' ? 'badge-warning' : 'badge-info'}`}>{d.status}</span></td>
                                            <td className="py-3 px-3 flex gap-2">
                                                <button onClick={() => updateDocStatus(d._id, 'verified')} className="btn-ghost !px-2 !py-1 !min-h-0 text-xs !text-accent"><CheckCircle size={12} /> Verify</button>
                                                <button onClick={() => updateDocStatus(d._id, 'rejected')} className="btn-ghost !px-2 !py-1 !min-h-0 text-xs !text-danger">Reject</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Announcements */}
            {tab === 'announcements' && (
                <motion.div variants={fadeUp} className="card max-w-xl">
                    <h3 className="font-bold text-text-dark mb-4 flex items-center gap-2"><Megaphone size={18} className="text-warning" /> Broadcast Announcement</h3>
                    <form onSubmit={(e) => { e.preventDefault(); setAnnouncement({ title: '', message: '' }); }} className="space-y-3">
                        <div><label className="label">Title</label><input className="input" placeholder="Announcement title" value={announcement.title} onChange={e => setAnnouncement({ ...announcement, title: e.target.value })} required /></div>
                        <div><label className="label">Message</label><textarea className="input min-h-[100px]" placeholder="Write your announcement..." value={announcement.message} onChange={e => setAnnouncement({ ...announcement, message: e.target.value })} required /></div>
                        <button type="submit" className="btn-primary"><Bell size={16} /> Send Announcement</button>
                    </form>
                </motion.div>
            )}
        </motion.div>
    );
}

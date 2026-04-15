import { motion } from 'framer-motion';
import { Bell, CheckCircle, Clock, FileText, AlertTriangle, Send, Shield, Trash2, Info } from 'lucide-react';
import { useState } from 'react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const initialNotifications = [
    { id: 1, icon: Clock, title: 'Pension application is under review', desc: 'Your pension application #PEN-2024-001234 is being processed.', time: '2 hours ago', type: 'info', read: false },
    { id: 2, icon: CheckCircle, title: 'Insurance claim documents verified', desc: 'Your health insurance claim documents have been verified successfully.', time: '5 hours ago', type: 'success', read: false },
    { id: 3, icon: AlertTriangle, title: 'ITR filing deadline reminder', desc: 'Your income tax return is due by July 31, 2026. File now to avoid penalties.', time: '1 day ago', type: 'warning', read: false },
    { id: 4, icon: Send, title: 'Life Certificate submitted', desc: 'Your Jeevan Pramaan life certificate has been submitted successfully.', time: '2 days ago', type: 'success', read: true },
    { id: 5, icon: FileText, title: 'Bank details update confirmed', desc: 'Your pension bank account has been updated to SBI A/c ending 8901.', time: '3 days ago', type: 'info', read: true },
    { id: 6, icon: Shield, title: 'Security alert — new login detected', desc: 'A new login was detected from Chrome on Mac. If this was not you, please change your password.', time: '5 days ago', type: 'danger', read: true },
];

const typeColors = {
    info: { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'text-primary-light' },
    success: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'text-accent' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-100', icon: 'text-warning' },
    danger: { bg: 'bg-red-50', border: 'border-red-100', icon: 'text-danger' },
};

export default function Notifications() {
    const [notifications, setNotifications] = useState(initialNotifications);
    const [filter, setFilter] = useState('all');

    const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    const remove = (id) => setNotifications(prev => prev.filter(n => n.id !== id));
    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.read) : notifications.filter(n => n.read);
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <div>
                    <h1 className="text-2xl font-bold text-text-dark flex items-center gap-2">
                        <Bell size={24} /> Notifications
                        {unreadCount > 0 && <span className="badge-info">{unreadCount} new</span>}
                    </h1>
                    <p className="text-sm text-text-light mt-0.5">Stay updated on your requests and documents</p>
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllRead} className="btn-ghost text-sm !text-primary-light">
                        <CheckCircle size={14} /> Mark all as read
                    </button>
                )}
            </motion.div>

            <motion.div variants={fadeUp} className="flex gap-2 mb-4">
                {[['all', 'All'], ['unread', 'Unread'], ['read', 'Read']].map(([f, l]) => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer transition-all ${filter === f ? 'bg-gradient-to-r from-primary to-secondary text-white border-transparent' : 'bg-white text-text-light border-border hover:border-primary/30'}`}>
                        {l}
                    </button>
                ))}
            </motion.div>

            <motion.div variants={stagger} className="space-y-3">
                {filtered.length === 0 ? (
                    <motion.div variants={fadeUp} className="card text-center py-10">
                        <Info size={36} className="mx-auto mb-3 text-text-muted" />
                        <h3 className="font-bold text-text-dark">No notifications</h3>
                        <p className="text-sm text-text-light mt-1">You're all caught up!</p>
                    </motion.div>
                ) : (
                    filtered.map(n => {
                        const colors = typeColors[n.type] || typeColors.info;
                        return (
                            <motion.div key={n.id} variants={fadeUp} onClick={() => markRead(n.id)}
                                className={`card flex items-start gap-3 cursor-pointer ${!n.read ? `${colors.bg} ${colors.border}` : 'hover:bg-bg'}`}>
                                <div className={`w-9 h-9 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
                                    <n.icon size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`text-sm font-semibold ${!n.read ? 'text-text-dark' : 'text-text-light'}`}>{n.title}</h3>
                                        {!n.read && <span className="w-2 h-2 bg-primary-light rounded-full flex-shrink-0" />}
                                    </div>
                                    <p className="text-xs text-text-muted mt-0.5">{n.desc}</p>
                                    <p className="text-[11px] text-text-muted mt-1">{n.time}</p>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-red-50 transition-all cursor-pointer border-none bg-transparent flex-shrink-0">
                                    <Trash2 size={14} />
                                </button>
                            </motion.div>
                        );
                    })
                )}
            </motion.div>
        </motion.div>
    );
}

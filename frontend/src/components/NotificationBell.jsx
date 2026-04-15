import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function NotificationBell() {
    const { API } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const fetchNotifications = () => {
        API.get('/notifications').then(r => setNotifications(r.data || [])).catch(() => {});
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const unread = notifications.filter(n => !n.isRead).length;

    const markAllRead = async () => {
        await API.put('/notifications/read-all').catch(() => {});
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const markOneRead = async (id) => {
        await API.put(`/notifications/${id}/read`).catch(() => {});
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(p => !p)}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-bg hover:bg-gray-100 transition-colors cursor-pointer border-none"
            >
                <Bell size={18} className="text-text-dark" />
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-11 w-80 bg-white border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <h3 className="text-sm font-bold text-text-dark">Notifications</h3>
                        {unread > 0 && (
                            <button onClick={markAllRead} className="text-xs text-primary hover:underline cursor-pointer bg-transparent border-none font-medium">
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-8 text-center text-text-muted text-sm">
                                <Bell size={28} className="mx-auto mb-2 text-gray-200" />
                                No notifications yet
                            </div>
                        ) : (
                            notifications.slice(0, 10).map(n => (
                                <div
                                    key={n._id}
                                    onClick={() => markOneRead(n._id)}
                                    className={`flex gap-3 px-4 py-3 border-b border-border/50 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-sm flex-shrink-0">
                                        {n.type === 'payment' ? '💰' : n.type === 'kyc' ? '🪪' : n.type === 'task' ? '📋' : n.type === 'rating' ? '⭐' : '🔔'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-text-dark truncate">{n.title || 'Notification'}</p>
                                        <p className="text-xs text-text-muted mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                                        <p className="text-[10px] text-text-muted mt-1">{new Date(n.createdAt).toLocaleDateString('en-IN')}</p>
                                    </div>
                                    {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="px-4 py-2.5 border-t border-border text-center">
                        <Link to="/notifications" onClick={() => setOpen(false)} className="text-xs text-primary hover:underline font-medium no-underline">
                            View all notifications →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { ClipboardList, Search } from 'lucide-react';

const statusColors = { pending: 'bg-yellow-100 text-yellow-700', accepted: 'bg-blue-100 text-blue-700', in_progress: 'bg-purple-100 text-purple-700', documents_submitted: 'bg-orange-100 text-orange-700', completed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };

export default function AdminTasks() {
    const { API } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const q = filter ? `?status=${filter}` : '';
        API.get(`/admin/requests${q}`).then(r => setRequests(r.data)).catch(() => {}).finally(() => setLoading(false));
    }, [filter]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div><h1 className="text-2xl font-bold text-text-dark mb-1">Task Monitor</h1><p className="text-text-light text-sm">Monitor all service requests across the platform.</p></div>

            <div className="flex gap-2 flex-wrap">
                {['', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium ${filter === s ? 'bg-primary text-white border-primary' : 'bg-white text-text-dark border-border hover:border-primary/40'}`}>
                        {s || 'All'} {!s && `(${requests.length})`}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />)}</div>
            ) : (
                <div className="card p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-bg border-b border-border">
                                <tr>{['Service', 'User', 'Helper', 'Status', 'Document', 'Price', 'Date'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-muted">{h}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {requests.map(r => (
                                    <tr key={r._id} className="hover:bg-bg/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span>{r.service?.icon || '📄'}</span>
                                                <span className="font-medium text-text-dark">{r.serviceName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-text-light">{r.user?.name}</td>
                                        <td className="px-4 py-3 text-text-light">{r.helper?.name || '—'}</td>
                                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[r.status]}`}>{r.status?.replace('_', ' ')}</span></td>
                                        <td className="px-4 py-3"><span className="encrypted-badge">🔒 Encrypted</span></td>
                                        <td className="px-4 py-3 text-text-dark font-medium">{r.agreedPrice > 0 ? `₹${r.agreedPrice}` : '—'}</td>
                                        <td className="px-4 py-3 text-text-muted">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                                    </tr>
                                ))}
                                {requests.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted">No tasks found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

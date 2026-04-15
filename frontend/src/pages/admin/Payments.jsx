import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle, Clock } from 'lucide-react';

const statusColors = { created: 'bg-gray-100 text-gray-600', pending: 'bg-yellow-100 text-yellow-700', completed: 'bg-green-100 text-green-700', failed: 'bg-red-100 text-red-700', refunded: 'bg-blue-100 text-blue-700' };

export default function AdminPayments() {
    const { API } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/admin/payments').then(r => setPayments(r.data)).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const totalRevenue = payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.platformFee || 0), 0);
    const totalTransacted = payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div><h1 className="text-2xl font-bold text-text-dark mb-1">Payments</h1><p className="text-text-light text-sm">All payment transactions on the platform.</p></div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Transacted', value: `₹${totalTransacted.toLocaleString('en-IN')}`, icon: DollarSign, color: 'from-blue-500 to-cyan-400' },
                    { label: 'Platform Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: CheckCircle, color: 'from-emerald-500 to-teal-400' },
                    { label: 'Total Transactions', value: payments.length, icon: Clock, color: 'from-violet-500 to-purple-400' },
                ].map((s, i) => (
                    <div key={i} className={`bg-gradient-to-br ${s.color} p-5 rounded-xl`}>
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3"><s.icon size={20} className="text-white" /></div>
                        <p className="text-2xl font-bold text-white">{loading ? '...' : s.value}</p>
                        <p className="text-sm text-white/80">{s.label}</p>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-xl" />)}</div>
            ) : (
                <div className="card p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-bg border-b border-border">
                                <tr>{['Service', 'User', 'Helper', 'Amount', 'Document', 'Platform Fee', 'Status', 'Date'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-muted">{h}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {payments.map(p => (
                                    <tr key={p._id} className="hover:bg-bg/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-text-dark">{p.request?.serviceName || '—'}</td>
                                        <td className="px-4 py-3 text-text-light">{p.payer?.name}</td>
                                        <td className="px-4 py-3 text-text-light">{p.payee?.name}</td>
                                        <td className="px-4 py-3 font-bold text-text-dark">₹{p.amount}</td>
                                        <td className="px-4 py-3"><span className="encrypted-badge">🔒 Encrypted</span></td>
                                        <td className="px-4 py-3 text-emerald-600 font-medium">₹{p.platformFee}</td>
                                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[p.status]}`}>{p.status}</span></td>
                                        <td className="px-4 py-3 text-text-muted">{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                                    </tr>
                                ))}
                                {payments.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-text-muted">No payments yet</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

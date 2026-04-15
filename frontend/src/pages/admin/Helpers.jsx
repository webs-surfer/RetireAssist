import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Clock, X, CheckCircle } from 'lucide-react';

export default function AdminHelpers() {
    const { API } = useAuth();
    const [helpers, setHelpers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const fetchHelpers = () => {
        const q = filter ? `?status=${filter}` : '';
        API.get(`/admin/helpers${q}`).then(r => setHelpers(r.data)).catch(() => {}).finally(() => setLoading(false));
    };

    useEffect(() => { fetchHelpers(); }, [filter]);

    const verify = async (id, action) => {
        await API.put(`/admin/helpers/${id}/verify`, { action }).catch(e => alert(e.response?.data?.message));
        fetchHelpers();
    };

    const statusColors = { incomplete: 'bg-gray-100 text-gray-600', pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-dark mb-1">Helper Management</h1>
                    <p className="text-text-light text-sm">View helpers and manage their KYC verification.</p>
                </div>
                <Link to="/admin/verification" className="text-xs bg-orange-100 text-orange-700 px-3 py-2 rounded-lg no-underline font-medium hover:bg-orange-200">Review KYC →</Link>
            </div>

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
                {['', 'incomplete', 'pending', 'approved', 'rejected'].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium ${filter === s ? 'bg-primary text-white border-primary' : 'bg-white text-text-dark border-border hover:border-primary/40'}`}>
                        {s || 'All'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-24 bg-gray-100" />)}</div>
            ) : helpers.length === 0 ? (
                <div className="card text-center py-12"><p className="text-text-light">No helpers found.</p></div>
            ) : (
                <div className="space-y-4">
                    {helpers.map(h => (
                        <motion.div key={h._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center text-xl flex-shrink-0 font-bold text-emerald-600">
                                    {h.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-bold text-text-dark">{h.name}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[h.onboardingStatus]}`}>{h.onboardingStatus}</span>
                                        {h.isVerified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Verified</span>}
                                    </div>
                                    <p className="text-xs text-text-muted">{h.email}</p>
                                    {h.services?.length > 0 && <p className="text-xs text-text-light mt-1">{h.services.join(', ')}</p>}
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-text-muted flex items-center gap-0.5"><Star size={11} className="text-yellow-400" /> {h.rating || 0} ({h.totalReviews || 0} reviews)</span>
                                        <span className="text-xs text-text-muted">Joined {new Date(h.createdAt).toLocaleDateString('en-IN')}</span>
                                    </div>
                                </div>
                                {h.onboardingStatus === 'pending' && (
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button onClick={() => verify(h._id, 'approve')} className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-green-600 font-medium">
                                            <CheckCircle size={12} /> Approve
                                        </button>
                                        <button onClick={() => verify(h._id, 'reject')} className="flex items-center gap-1 text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-red-600 font-medium">
                                            <X size={12} /> Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

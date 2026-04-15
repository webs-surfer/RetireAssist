import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { CheckCircle, XCircle } from 'lucide-react';
import { validateAadhaar } from '../../utils/verhoeff';

export default function AdminVerification() {
    const [helpers, setHelpers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(null);

    const fetchHelpers = () => {
        api.get('/admin/helpers?status=pending').then(r => setHelpers(r.data || [])).catch(() => {}).finally(() => setLoading(false));
    };
    useEffect(() => { fetchHelpers(); }, []);

    const handleDecision = async (helperId, decision) => {
        if (decision === 'rejected' && !rejectReason.trim()) { alert('Please enter a rejection reason'); return; }
        setProcessing(helperId);
        try {
            await api.put(`/admin/helpers/${helperId}/verify`, { decision, rejectionReason: rejectReason });
            fetchHelpers();
            setSelected(null);
            setRejectReason('');
        } catch (e) { alert('Failed: ' + (e.response?.data?.message || e.message)); }
        finally { setProcessing(null); }
    };

    if (loading) return <div className="p-6 text-text-muted text-sm animate-pulse">Loading...</div>;

    return (
        <div className="p-6 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-text-dark">KYC Verification</h1>
                <p className="text-sm text-text-muted">{helpers.length} pending applications</p>
            </div>

            {helpers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-border p-10 text-center">
                    <CheckCircle size={40} className="text-emerald-300 mx-auto mb-4" />
                    <p className="font-semibold text-text-dark">All caught up!</p>
                    <p className="text-sm text-text-muted mt-1">No pending KYC applications</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {helpers.map(h => {
                        const aadhaarV = validateAadhaar(h.aadhaarEncrypted ? '(encrypted)' : '');
                        return (
                            <div key={h._id} className="bg-white rounded-2xl border border-border p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        {h.faceImage ? (
                                            <img src={`http://localhost:5001${h.faceImage}`} alt="Face" className="w-16 h-16 rounded-xl object-cover border border-border" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-300">{h.name?.[0]?.toUpperCase()}</div>
                                        )}
                                        <div>
                                            <h3 className="font-bold text-text-dark">{h.name}</h3>
                                            <p className="text-xs text-text-muted">{h.email}</p>
                                            <p className="text-xs text-text-muted mt-0.5">City: {h.city || '—'}</p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {h.services?.slice(0, 3).map(s => (
                                                    <span key={s} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => setSelected(selected === h._id ? null : h._id)}
                                            className="px-3 py-1.5 rounded-lg bg-gray-50 border border-border text-xs font-medium text-text-dark cursor-pointer hover:bg-gray-100"
                                        >
                                            {selected === h._id ? 'Hide Details' : 'Review'}
                                        </button>
                                        <button
                                            onClick={() => handleDecision(h._id, 'approved')}
                                            disabled={processing === h._id}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold cursor-pointer hover:bg-emerald-600 disabled:opacity-50 border-none"
                                        >
                                            <CheckCircle size={13} /> Approve
                                        </button>
                                        <button
                                            onClick={() => { setSelected(h._id); setRejectReason(''); }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-bold cursor-pointer hover:bg-red-100"
                                        >
                                            <XCircle size={13} /> Reject
                                        </button>
                                    </div>
                                </div>

                                {selected === h._id && (
                                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                                        {/* Aadhaar doc */}
                                        {h.aadhaarDoc && (
                                            <div>
                                                <p className="text-xs font-semibold text-text-muted mb-2">Aadhaar Document</p>
                                                <img src={`http://localhost:5001${h.aadhaarDoc}`} alt="Aadhaar" className="max-h-48 rounded-xl border border-border object-contain" />
                                            </div>
                                        )}

                                        {/* Encrypted Aadhaar metadata note */}
                                        <div>
                                            <p className="text-xs font-semibold text-text-muted mb-1">Aadhaar Number</p>
                                            <p className="text-xs font-mono text-text-dark">(Document visible above for manual review)</p>
                                            <p className="encrypted-note">
                                                🔒 Stored encrypted — admin view is metadata only
                                            </p>
                                        </div>

                                        {/* Reject with reason */}
                                        <div>
                                            <label className="block text-xs font-semibold text-text-muted mb-1">Rejection Reason (required for rejection)</label>
                                            <textarea
                                                value={rejectReason}
                                                onChange={e => setRejectReason(e.target.value)}
                                                placeholder="e.g. Aadhaar image is blurry, please re-upload..."
                                                rows={2}
                                                className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40 resize-none"
                                            />
                                            <button
                                                onClick={() => handleDecision(h._id, 'rejected')}
                                                disabled={processing === h._id || !rejectReason.trim()}
                                                className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-bold cursor-pointer hover:bg-red-600 disabled:opacity-50 border-none"
                                            >
                                                <XCircle size={14} /> Confirm Reject
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

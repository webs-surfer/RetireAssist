import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import RatingModal from '../../components/RatingModal';
import { CreditCard, Download, Clock, CheckCircle, AlertCircle, Star } from 'lucide-react';

const STATUS_COLOR = { pending: 'bg-amber-100 text-amber-700', accepted: 'bg-blue-100 text-blue-700', in_progress: 'bg-indigo-100 text-indigo-700', documents_submitted: 'bg-violet-100 text-violet-700', completed: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700' };

export default function Track() {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [payingId, setPayingId] = useState(null);
    const [ratingRequest, setRatingRequest] = useState(null);

    const fetchRequests = () => {
        api.get('/requests/mine').then(r => setRequests(r.data || [])).catch(() => {}).finally(() => setLoading(false));
    };

    useEffect(() => { fetchRequests(); }, []);

    const handlePayNow = async (request) => {
        setPayingId(request._id);
        try {
            const { data } = await api.post('/payments/order', { requestId: request._id });

            if (data.keyId === 'demo_mode') {
                // Mock payment flow for demo
                const mockConfirm = window.confirm(`Demo Payment: ₹${data.order.amount / 100} for "${request.serviceName}". Click OK to complete mock payment.`);
                if (!mockConfirm) { setPayingId(null); return; }
                await api.post('/payments/verify', { paymentId: data.payment._id, razorpayOrderId: data.order.id, razorpayPaymentId: `mock_${Date.now()}` });
                alert('Payment successful! Documents unlocked.');
                fetchRequests();
                return;
            }

            // Real Razorpay
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            document.body.appendChild(script);
            script.onload = () => {
                const rzp = new window.Razorpay({
                    key: data.keyId,
                    amount: data.order.amount,
                    currency: 'INR',
                    name: 'RetireAssist',
                    description: request.serviceName,
                    order_id: data.order.id,
                    handler: async (response) => {
                        await api.post('/payments/verify', {
                            paymentId: data.payment._id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        });
                        alert('Payment verified! Document unlocked.');
                        fetchRequests();
                    },
                    prefill: { name: user?.name, email: user?.email },
                    theme: { color: '#6366f1' }
                });
                rzp.open();
            };
        } catch (e) {
            alert('Payment failed: ' + (e.response?.data?.message || e.message));
        } finally {
            setPayingId(null);
        }
    };

    const handleRate = async (rating, comment) => {
        await api.post(`/tasks/${ratingRequest._id}/rate`, { rating, comment });
        fetchRequests();
    };

    const handleDownload = async (request) => {
        const doc = request.documents?.[request.documents.length - 1];
        if (!doc?.url) return alert('No document available');
        window.open(doc.url, '_blank');
    };

    if (loading) return <div className="p-6 text-text-muted text-sm animate-pulse">Loading your requests...</div>;

    return (
        <div className="p-6 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-text-dark">Track Requests</h1>
                <p className="text-sm text-text-muted mt-0.5">{requests.length} total requests</p>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-border p-10 text-center">
                    <Clock size={40} className="text-gray-200 mx-auto mb-4" />
                    <p className="font-semibold text-text-dark">No requests yet</p>
                    <p className="text-sm text-text-muted mt-1">Browse services to get started</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map(r => (
                        <div key={r._id} className="bg-white rounded-2xl border border-border p-5">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div>
                                    <h3 className="font-bold text-text-dark">{r.serviceName || 'Service Request'}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[r.status] || 'bg-gray-100 text-gray-700'}`}>
                                            {r.status?.replace('_', ' ')}
                                        </span>
                                        {r.agreedPrice > 0 && <span className="text-xs text-text-muted">₹{r.agreedPrice}</span>}
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    {/* Pay Now button — show when completed and not yet paid */}
                                    {r.status === 'completed' && r.paymentStatus !== 'paid' && !r.rating && (
                                        <button
                                            onClick={() => handlePayNow(r)}
                                            disabled={payingId === r._id}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold cursor-pointer hover:opacity-90 disabled:opacity-50"
                                        >
                                            <CreditCard size={15} />
                                            {payingId === r._id ? 'Processing...' : 'Pay Now'}
                                        </button>
                                    )}
                                    {/* Download document — after payment */}
                                    {r.paymentStatus === 'paid' && r.documents?.length > 0 && (
                                        <button
                                            onClick={() => handleDownload(r)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-bold cursor-pointer hover:opacity-90"
                                        >
                                            <Download size={15} /> Download
                                        </button>
                                    )}
                                    {/* Rate button — after payment */}
                                    {r.paymentStatus === 'paid' && !r.rating && r.status === 'completed' && (
                                        <button
                                            onClick={() => setRatingRequest(r)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-bold cursor-pointer hover:opacity-90"
                                        >
                                            <Star size={15} /> Rate Helper
                                        </button>
                                    )}
                                    {r.rating && (
                                        <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-medium">
                                            <Star size={14} className="fill-yellow-400 text-yellow-400" /> {r.rating}/5
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Timeline */}
                            {r.timeline?.length > 0 && (
                                <div className="space-y-2 pt-3 border-t border-border/50">
                                    {r.timeline.slice(-4).map((t, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs">
                                            <CheckCircle size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-text-muted capitalize">{t.message || t.status?.replace('_', ' ')}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {r.helper && (
                                <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xs font-bold text-primary">
                                        {r.helper?.name?.[0]?.toUpperCase()}
                                    </div>
                                    <span className="text-xs text-text-muted">Assigned Helper: <span className="font-medium text-text-dark">{r.helper?.name}</span></span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {ratingRequest && (
                <RatingModal
                    onSubmit={handleRate}
                    onClose={() => setRatingRequest(null)}
                    serviceName={ratingRequest.serviceName}
                />
            )}
        </div>
    );
}

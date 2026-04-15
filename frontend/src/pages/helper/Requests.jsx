import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ClipboardList, Clock, IndianRupee, User, CheckCircle, X,
    Search, Filter, ShieldAlert, ArrowRight, Sparkles,
    MapPin, Star, Zap, ChevronRight
} from 'lucide-react';

/* ─── Design Tokens ──────────────────────────────────────────── */
const C = {
    primary: '#1E3A8A',
    blue: '#3B82F6',
    cyan: '#06B6D4',
    green: '#10B981',
    purple: '#8B5CF6',
    amber: '#F59E0B',
    red: '#EF4444',
    text: '#0F172A',
    textLight: '#64748B',
    border: 'rgba(226,232,240,0.8)',
    card: '#FFFFFF',
};

/* ─── Motion Variants ────────────────────────────────────────── */
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.06, ease: 'easeOut' } })
};

/* ─── Priority Config ────────────────────────────────────────── */
const priorityConfig = {
    urgent: { color: '#EF4444', bg: 'rgba(239,68,68,0.09)', label: '🔴 Urgent', icon: Zap },
    normal: { color: '#64748B', bg: 'rgba(100,116,139,0.09)', label: '⚪ Normal', icon: Clock },
    flexible: { color: '#10B981', bg: 'rgba(16,185,129,0.09)', label: '🟢 Flexible', icon: Star },
};

const statusConfig = {
    pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'Pending' },
    accepted: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', label: 'Accepted' },
    in_progress: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', label: 'In Progress' },
    completed: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', label: 'Completed' },
    cancelled: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', label: 'Cancelled' },
};

/* ─── KYC Banner ─────────────────────────────────────────────── */
function KYCBanner() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
                maxWidth: 640, margin: '60px auto', padding: '0 20px',
                fontFamily: "'Inter', system-ui, sans-serif",
            }}
        >
            {/* Glow blob */}
            <div style={{
                position: 'absolute', width: 400, height: 400,
                background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
                borderRadius: '50%', left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 0,
            }} />

            <div style={{
                background: '#fff', borderRadius: 28,
                border: '1px solid rgba(245,158,11,0.2)',
                boxShadow: '0 20px 60px rgba(245,158,11,0.12), 0 4px 16px rgba(0,0,0,0.06)',
                overflow: 'hidden', position: 'relative', zIndex: 1,
            }}>
                {/* Top accent bar */}
                <div style={{
                    height: 4, background: 'linear-gradient(90deg, #F59E0B, #EF4444, #8B5CF6)',
                }} />

                <div style={{ padding: '48px 44px', textAlign: 'center' }}>
                    {/* Shield icon with rings */}
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: 28 }}>
                        <div style={{
                            position: 'absolute', inset: -16,
                            background: 'rgba(245,158,11,0.08)',
                            borderRadius: '50%', animation: 'pulse-ring 2s ease-in-out infinite',
                        }} />
                        <div style={{
                            width: 88, height: 88,
                            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 12px 32px rgba(245,158,11,0.25)',
                            border: '3px solid rgba(245,158,11,0.2)',
                        }}>
                            <ShieldAlert size={40} color="#D97706" />
                        </div>
                    </div>

                    <h2 style={{
                        fontSize: 26, fontWeight: 800, color: C.text,
                        marginBottom: 10, letterSpacing: '-0.02em',
                    }}>
                        KYC Verification Required
                    </h2>
                    <p style={{
                        fontSize: 15, color: C.textLight, lineHeight: 1.6,
                        marginBottom: 32, maxWidth: 380, margin: '0 auto 32px',
                    }}>
                        Complete your <strong style={{ color: C.text }}>Aadhaar &amp; face verification</strong> to unlock request browsing and start earning.
                    </p>

                    {/* Steps */}
                    <div style={{
                        display: 'flex', gap: 12, marginBottom: 32, justifyContent: 'center',
                    }}>
                        {[
                            { icon: '📋', label: 'Upload Aadhaar' },
                            { icon: '🤳', label: 'Face Scan' },
                            { icon: '✅', label: 'Get Verified' },
                        ].map((step, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                    background: 'linear-gradient(135deg,#FEF3C7,#FDE68A)',
                                    border: '1px solid rgba(245,158,11,0.25)',
                                    borderRadius: 14, padding: '10px 14px', textAlign: 'center',
                                    minWidth: 90,
                                }}>
                                    <div style={{ fontSize: 22, marginBottom: 4 }}>{step.icon}</div>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: '#92400E', margin: 0 }}>{step.label}</p>
                                </div>
                                {i < 2 && <ChevronRight size={16} color="#D97706" />}
                            </div>
                        ))}
                    </div>

                    <a href="/helper/profile" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 10,
                        padding: '14px 32px', borderRadius: 14, fontWeight: 700, fontSize: 15,
                        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                        color: '#fff', textDecoration: 'none',
                        boxShadow: '0 8px 24px rgba(245,158,11,0.4)',
                        transition: 'all 0.2s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(245,158,11,0.5)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(245,158,11,0.4)'; }}
                    >
                        Complete KYC Now <ArrowRight size={18} />
                    </a>

                    <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 14 }}>
                        Takes only 2–3 minutes · Fully secure
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes pulse-ring {
                    0%, 100% { transform: scale(1); opacity: 0.4; }
                    50% { transform: scale(1.15); opacity: 0.15; }
                }
            `}</style>
        </motion.div>
    );
}

/* ─── Request Card ───────────────────────────────────────────── */
function RequestCard({ req, i, onAccept }) {
    const priority = priorityConfig[req.priority] || priorityConfig.normal;
    const status = statusConfig[req.status] || statusConfig.pending;

    return (
        <motion.div
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -4, boxShadow: '0 20px 48px rgba(59,130,246,0.12)' }}
            style={{
                background: '#fff', borderRadius: 20,
                border: '1px solid rgba(226,232,240,0.9)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                overflow: 'hidden', cursor: 'default',
                transition: 'box-shadow 0.3s, transform 0.3s',
            }}
        >
            {/* Left Accent */}
            <div style={{ display: 'flex' }}>
                <div style={{
                    width: 4,
                    background: `linear-gradient(180deg, ${priority.color}, ${priority.color}44)`,
                    flexShrink: 0,
                }} />

                <div style={{ flex: 1, padding: '20px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        {/* Service Icon */}
                        <div style={{
                            width: 52, height: 52, flexShrink: 0,
                            background: 'linear-gradient(135deg,#EEF2FF,#E0F2FE)',
                            borderRadius: 16, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: 26,
                            border: '1px solid rgba(99,102,241,0.1)',
                            boxShadow: '0 4px 12px rgba(99,102,241,0.08)',
                        }}>
                            {req.service?.icon || '📄'}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Title Row */}
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                                <h3 style={{
                                    fontSize: 15, fontWeight: 700, color: C.text,
                                    margin: 0, flexShrink: 0,
                                }}>
                                    {req.serviceName || req.serviceType || 'Service Request'}
                                </h3>

                                {/* Priority Badge */}
                                <span style={{
                                    fontSize: 11, fontWeight: 700, padding: '3px 10px',
                                    borderRadius: 999, background: priority.bg, color: priority.color,
                                    border: `1px solid ${priority.color}22`,
                                }}>
                                    {priority.label}
                                </span>

                                {/* Status Badge */}
                                <span style={{
                                    fontSize: 11, fontWeight: 700, padding: '3px 10px',
                                    borderRadius: 999, background: status.bg, color: status.color,
                                    border: `1px solid ${status.color}22`,
                                    textTransform: 'capitalize',
                                }}>
                                    {status.label}
                                </span>
                            </div>

                            {/* Description */}
                            {req.description && (
                                <p style={{
                                    fontSize: 13, color: C.textLight, margin: '0 0 12px',
                                    lineHeight: 1.55, display: '-webkit-box',
                                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                }}>
                                    {req.description}
                                </p>
                            )}

                            {/* Meta Row */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
                                {req.user?.name && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.textLight, fontWeight: 600 }}>
                                        <User size={13} color={C.blue} />
                                        {req.user.name}
                                    </span>
                                )}
                                {req.proposedPrice > 0 && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: C.green }}>
                                        <IndianRupee size={13} />
                                        ₹{req.proposedPrice} budget
                                    </span>
                                )}
                                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.textLight, fontWeight: 600 }}>
                                    <Clock size={13} color={C.textLight} />
                                    {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </span>
                                {req.location?.city && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.textLight, fontWeight: 600 }}>
                                        <MapPin size={13} color={C.textLight} />
                                        {req.location.city}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Accept Button */}
                        <button
                            onClick={() => onAccept(req)}
                            style={{
                                flexShrink: 0, alignSelf: 'center',
                                padding: '10px 20px', borderRadius: 12,
                                background: 'linear-gradient(135deg,#3B82F6,#6366F1)',
                                color: '#fff', border: 'none', cursor: 'pointer',
                                fontSize: 13, fontWeight: 700,
                                boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                                display: 'flex', alignItems: 'center', gap: 6,
                                transition: 'all 0.2s', whiteSpace: 'nowrap',
                                fontFamily: 'inherit',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.4)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.3)'; }}
                        >
                            <CheckCircle size={15} /> Accept
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/* ─── Accept Modal ───────────────────────────────────────────── */
function AcceptModal({ req, onClose, onConfirm, loading }) {
    const [price, setPrice] = useState(req?.proposedPrice?.toString() || '');

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
                backdropFilter: 'blur(6px)', zIndex: 50,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
                fontFamily: "'Inter', system-ui, sans-serif",
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#fff', borderRadius: 24, width: '100%', maxWidth: 440,
                    overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '24px 28px 20px',
                    borderBottom: '1px solid rgba(226,232,240,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: '0 0 4px' }}>
                            Accept Request
                        </h3>
                        <p style={{ fontSize: 13, color: C.textLight, margin: 0, fontWeight: 500 }}>
                            {req?.serviceName}
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        background: '#F1F5F9', border: 'none', borderRadius: 10,
                        width: 36, height: 36, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.2s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
                        onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
                    >
                        <X size={18} color={C.textLight} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px 28px 28px' }}>
                    {/* Budget info */}
                    <div style={{
                        background: 'linear-gradient(135deg,#F0FDF4,#ECFDF5)',
                        border: '1px solid rgba(16,185,129,0.2)',
                        borderRadius: 14, padding: '14px 18px', marginBottom: 20,
                        display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                        <IndianRupee size={18} color={C.green} />
                        <div>
                            <p style={{ fontSize: 12, color: C.textLight, margin: '0 0 2px', fontWeight: 600 }}>User's Budget</p>
                            <p style={{ fontSize: 20, fontWeight: 900, color: C.green, margin: 0 }}>
                                ₹{req?.proposedPrice || 0}
                            </p>
                        </div>
                    </div>

                    {/* Price input */}
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Your Quoted Price (₹)
                    </label>
                    <div style={{ position: 'relative', marginBottom: 24 }}>
                        <div style={{
                            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                            color: C.textLight, pointerEvents: 'none',
                        }}>
                            <IndianRupee size={16} />
                        </div>
                        <input
                            type="number"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            placeholder="Enter your price"
                            style={{
                                width: '100%', padding: '13px 14px 13px 38px',
                                borderRadius: 13, border: '2px solid #E2E8F0',
                                fontSize: 16, fontWeight: 700, color: C.text,
                                background: '#F8FAFC', outline: 'none',
                                boxSizing: 'border-box', transition: 'all 0.2s',
                                fontFamily: 'inherit',
                            }}
                            onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.1)'; }}
                            onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.background = '#F8FAFC'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={onClose} style={{
                            flex: 1, padding: '13px', borderRadius: 13,
                            border: '2px solid #E2E8F0', background: '#fff',
                            fontSize: 14, fontWeight: 700, color: C.textLight,
                            cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onConfirm(req._id, parseFloat(price) || 0)}
                            disabled={loading}
                            style={{
                                flex: 1, padding: '13px', borderRadius: 13,
                                background: loading ? '#CBD5E1' : 'linear-gradient(135deg,#3B82F6,#6366F1)',
                                border: 'none', color: '#fff',
                                fontSize: 14, fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                boxShadow: loading ? 'none' : '0 6px 18px rgba(99,102,241,0.35)',
                                transition: 'all 0.2s', fontFamily: 'inherit',
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    Accepting…
                                </>
                            ) : (
                                <><CheckCircle size={16} /> Confirm Accept</>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ─── Filter Chip ────────────────────────────────────────────── */
function FilterChip({ label, active, onClick }) {
    return (
        <button onClick={onClick} style={{
            padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', border: active ? 'none' : '1.5px solid #E2E8F0',
            background: active ? 'linear-gradient(135deg,#3B82F6,#6366F1)' : '#fff',
            color: active ? '#fff' : '#64748B',
            boxShadow: active ? '0 4px 12px rgba(99,102,241,0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'all 0.2s', fontFamily: 'inherit',
            transform: active ? 'scale(1.04)' : 'scale(1)',
        }}>
            {label}
        </button>
    );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function HelperRequests() {
    const { API, user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [modalReq, setModalReq] = useState(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const fetchRequests = () => {
        setLoading(true);
        API.get('/requests/available')
            .then(r => setRequests(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleConfirmAccept = async (requestId, agreedPrice) => {
        setAccepting(true);
        try {
            await API.put(`/requests/${requestId}/accept`, { agreedPrice });
            setModalReq(null);
            fetchRequests();
        } catch (e) {
            alert(e.response?.data?.message || 'Error accepting request.');
        } finally {
            setAccepting(false);
        }
    };

    /* KYC Gate */
    if (!user?.isVerified) return <KYCBanner />;

    /* Filtering */
    const filters = ['all', 'urgent', 'normal', 'flexible'];
    const filtered = requests.filter(r => {
        const matchesFilter = filter === 'all' || r.priority === filter;
        const matchesSearch = !search ||
            r.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
            r.description?.toLowerCase().includes(search.toLowerCase()) ||
            r.user?.name?.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div style={{ padding: '4px 0 48px', fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* ── Page Header ── */}
            <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible"
                style={{
                    background: '#fff', borderRadius: 22,
                    border: '1px solid rgba(226,232,240,0.8)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    padding: '24px 28px', marginBottom: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 16,
                }}
            >
                <div>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)',
                        borderRadius: 999, padding: '4px 14px', marginBottom: 8,
                    }}>
                        <Sparkles size={12} color={C.blue} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Browse Requests
                        </span>
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.02em' }}>
                        Available Jobs
                    </h1>
                    <p style={{ fontSize: 14, color: C.textLight, margin: '4px 0 0', fontWeight: 500 }}>
                        {loading ? 'Loading…' : `${filtered.length} request${filtered.length !== 1 ? 's' : ''} available near you`}
                    </p>
                </div>

                {/* Search bar */}
                <div style={{ position: 'relative', width: 280 }}>
                    <Search size={16} color={C.textLight} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search requests…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%', padding: '11px 14px 11px 40px',
                            borderRadius: 13, border: '2px solid #E2E8F0',
                            fontSize: 14, fontWeight: 500, color: C.text,
                            background: '#F8FAFC', outline: 'none',
                            boxSizing: 'border-box', transition: 'all 0.2s',
                            fontFamily: 'inherit',
                        }}
                        onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.1)'; }}
                        onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.background = '#F8FAFC'; e.target.style.boxShadow = 'none'; }}
                    />
                </div>
            </motion.div>

            {/* ── Filter Chips ── */}
            <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible"
                style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
                    <Filter size={14} color={C.textLight} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Priority</span>
                </div>
                {filters.map(f => (
                    <FilterChip key={f} label={f === 'all' ? '✨ All' : priorityConfig[f]?.label || f} active={filter === f} onClick={() => setFilter(f)} />
                ))}
            </motion.div>

            {/* ── Content ── */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} style={{
                            background: '#fff', borderRadius: 20,
                            border: '1px solid rgba(226,232,240,0.8)',
                            height: 120, animation: 'skeleton-pulse 1.5s ease-in-out infinite',
                        }} />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <motion.div variants={fadeUp} custom={2} initial="hidden" animate="visible"
                    style={{
                        background: '#fff', borderRadius: 22, padding: '60px 32px',
                        textAlign: 'center', border: '1px solid rgba(226,232,240,0.8)',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                    }}
                >
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#EEF2FF,#E0F2FE)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                    }}>
                        <ClipboardList size={32} color={C.blue} />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>
                        {search || filter !== 'all' ? 'No matching requests' : 'No requests yet'}
                    </h3>
                    <p style={{ fontSize: 14, color: C.textLight, maxWidth: 320, margin: '0 auto' }}>
                        {search || filter !== 'all'
                            ? 'Try adjusting your filters or search term.'
                            : 'New requests from users will appear here. Check back soon!'}
                    </p>
                    {(search || filter !== 'all') && (
                        <button onClick={() => { setSearch(''); setFilter('all'); }} style={{
                            marginTop: 20, padding: '10px 22px', borderRadius: 12,
                            background: 'linear-gradient(135deg,#3B82F6,#6366F1)', color: '#fff',
                            border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                            fontFamily: 'inherit',
                        }}>
                            Clear Filters
                        </button>
                    )}
                </motion.div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {filtered.map((req, i) => (
                        <RequestCard key={req._id} req={req} i={i} onAccept={setModalReq} />
                    ))}
                </div>
            )}

            {/* ── Accept Modal ── */}
            <AnimatePresence>
                {modalReq && (
                    <AcceptModal
                        req={modalReq}
                        onClose={() => setModalReq(null)}
                        onConfirm={handleConfirmAccept}
                        loading={accepting}
                    />
                )}
            </AnimatePresence>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes skeleton-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}

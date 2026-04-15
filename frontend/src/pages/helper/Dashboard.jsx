import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ClipboardList, CheckSquare, DollarSign, Star,
    Wrench, ArrowRight, Clock, AlertCircle,
    MessageCircle, Sparkles, TrendingUp
} from 'lucide-react';

/* ─── Motion Variants ──────────────────────────────────────── */
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};
const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

/* ─── Design Tokens (same palette as Landing Page) ─────────── */
const C = {
    primary:   '#1E3A8A',
    blue:      '#3B82F6',
    cyan:      '#06B6D4',
    green:     '#10B981',
    purple:    '#8B5CF6',
    amber:     '#F59E0B',
    text:      '#0F172A',
    textLight: '#64748B',
    border:    'rgba(226,232,240,0.8)',
    card:      '#FFFFFF',
    bg:        'linear-gradient(160deg,#F8FAFC 0%,#EEF2FF 55%,#F0FDF4 100%)',
};

/* ─── Stat Card ─────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, grad, shadowColor, loading }) {
    return (
        <motion.div
            variants={fadeUp}
            whileHover={{ y: -5, boxShadow: `0 20px 40px ${shadowColor}` }}
            style={{
                background: C.card,
                borderRadius: '20px',
                padding: '28px 24px',
                border: `1px solid ${C.border}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'default',
                transition: 'box-shadow 0.3s',
            }}
        >
            {/* Top gradient accent bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: grad }} />
            {/* Icon */}
            <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: grad, display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: 16,
                boxShadow: `0 8px 18px ${shadowColor}`,
            }}>
                <Icon size={22} color="#fff" />
            </div>
            <p style={{ fontSize: 32, fontWeight: 900, color: C.text, lineHeight: 1, marginBottom: 6 }}>
                {loading ? '—' : value}
            </p>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {label}
            </p>
        </motion.div>
    );
}

/* ─── Quick Action Card ─────────────────────────────────────── */
function ActionCard({ to, label, desc, icon: Icon, grad, shadowColor, colorPrimary }) {
    return (
        <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
            <Link to={to} style={{ textDecoration: 'none' }}>
                <div
                    style={{
                        background: C.card,
                        borderRadius: '16px',
                        padding: '20px',
                        border: `1px solid ${C.border}`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        transition: 'all 0.25s ease',
                        cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = `0 12px 28px ${shadowColor}`;
                        e.currentTarget.style.borderColor = colorPrimary + '40';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                        e.currentTarget.style.borderColor = C.border;
                    }}
                >
                    <div style={{
                        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                        background: grad, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', boxShadow: `0 6px 16px ${shadowColor}`,
                    }}>
                        <Icon size={20} color="#fff" />
                    </div>
                    <div>
                        <p style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 2 }}>{label}</p>
                        <p style={{ fontSize: 12, color: C.textLight, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {desc} <ArrowRight size={10} />
                        </p>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

/* ─── Main Dashboard Component ──────────────────────────────── */
export default function HelperDashboard() {
    const { user, API } = useAuth();
    const [requests, setRequests] = useState({ available: [], mine: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            API.get('/requests/available').catch(() => ({ data: [] })),
            API.get('/requests/mine').catch(() => ({ data: [] }))
        ]).then(([avail, mine]) => {
            setRequests({ available: avail.data, mine: mine.data });
        }).finally(() => setLoading(false));
    }, []);

    const myActive    = requests.mine?.filter(r => !['completed', 'cancelled'].includes(r.status)) || [];
    const myCompleted = requests.mine?.filter(r => r.status === 'completed') || [];

    const stats = [
        { icon: ClipboardList, label: 'Available',  value: requests.available?.length || 0,                              grad: `linear-gradient(135deg,${C.blue},${C.cyan})`,    shadowColor: 'rgba(59,130,246,0.22)' },
        { icon: CheckSquare,   label: 'Active Tasks', value: myActive.length,                                            grad: `linear-gradient(135deg,${C.green},#14B8A6)`,     shadowColor: 'rgba(16,185,129,0.22)' },
        { icon: TrendingUp,    label: 'Completed',   value: myCompleted.length,                                          grad: `linear-gradient(135deg,${C.purple},#A855F7)`,    shadowColor: 'rgba(139,92,246,0.22)' },
        { icon: DollarSign,    label: 'Total Earned', value: `₹${(user?.earnings || 0).toLocaleString('en-IN')}`,        grad: `linear-gradient(135deg,${C.amber},#EF4444)`,     shadowColor: 'rgba(245,158,11,0.22)' },
    ];

    const actions = [
        { to: '/helper/requests', label: 'Browse Requests',  desc: 'Find new work',     icon: ClipboardList,  grad: `linear-gradient(135deg,${C.blue},#6366F1)`,   shadowColor: 'rgba(59,130,246,0.2)',  colorPrimary: C.blue   },
        { to: '/helper/tasks',    label: 'My Tasks',         desc: 'View active work',  icon: CheckSquare,    grad: `linear-gradient(135deg,${C.green},#059669)`,  shadowColor: 'rgba(16,185,129,0.2)', colorPrimary: C.green  },
        { to: '/helper/chat',     label: 'Messages',         desc: 'Chat with users',   icon: MessageCircle,  grad: `linear-gradient(135deg,${C.purple},#7C3AED)`, shadowColor: 'rgba(139,92,246,0.2)', colorPrimary: C.purple },
        { to: '/helper/earnings', label: 'Earnings',         desc: 'Track your wallet', icon: DollarSign,     grad: `linear-gradient(135deg,${C.amber},#D97706)`,  shadowColor: 'rgba(245,158,11,0.2)', colorPrimary: C.amber  },
    ];

    const maxW = { width: '100%' };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger}
            style={{ padding: '8px 0 40px', minHeight: '85vh' }}>

            {/* ── Header ──────────────────────────────────────── */}
            <motion.div variants={fadeUp}
                style={{
                    ...maxW,
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center',
                    justifyContent: 'space-between', gap: 16, marginBottom: 32,
                    background: C.card, borderRadius: 20, padding: '24px 28px',
                    border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                }}
            >
                <div>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'rgba(30,58,138,0.07)', border: '1px solid rgba(30,58,138,0.12)',
                        borderRadius: 999, padding: '4px 14px', marginBottom: 10,
                    }}>
                        <Sparkles size={12} color={C.blue} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Helper Portal</span>
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, margin: 0, lineHeight: 1.2 }}>
                        Welcome back,{' '}
                        <span style={{ background: `linear-gradient(90deg,${C.primary},${C.blue})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {user?.name?.split(' ')[0]}!
                        </span>
                    </h1>
                    <p style={{ margin: '6px 0 0', fontSize: 14, color: C.textLight, fontWeight: 500 }}>
                        Here's a snapshot of your activity today.
                    </p>
                </div>

                {!user?.isVerified && (
                    <Link to="/helper/profile" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                        background: 'linear-gradient(135deg,#fef3c7,#fde68a)',
                        color: '#92400E', border: '1px solid #fcd34d',
                        boxShadow: '0 4px 12px rgba(245,158,11,0.2)', textDecoration: 'none',
                    }}>
                        <AlertCircle size={15} />
                        {user?.onboardingStatus === 'incomplete' ? 'Complete KYC' : user?.onboardingStatus === 'pending' ? 'KYC Pending Review' : 'KYC Rejected — Fix Now'}
                    </Link>
                )}
            </motion.div>

            {/* ── Stat Cards ──────────────────────────────────── */}
            <motion.div variants={stagger}
                style={{ ...maxW, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginBottom: 24 }}
            >
                {stats.map((s, i) => (
                    <StatCard key={i} loading={loading} {...s} />
                ))}
            </motion.div>

            {/* ── Middle Row: Quick Actions + Rating ──────────── */}
            <motion.div variants={stagger}
                style={{ ...maxW, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18, marginBottom: 24 }}
            >
                {/* Quick Actions */}
                <motion.div variants={fadeUp}
                    style={{
                        background: C.card, borderRadius: 20, padding: '24px 24px 20px',
                        border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                        <Wrench size={15} color={C.blue} />
                        <span style={{ fontSize: 12, fontWeight: 800, color: C.text, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick Actions</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {actions.map(a => <ActionCard key={a.to} {...a} />)}
                    </div>
                </motion.div>

                {/* Rating Card */}
                <motion.div variants={fadeUp}
                    style={{
                        background: C.card, borderRadius: 20, padding: '24px',
                        border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        position: 'relative', overflow: 'hidden',
                    }}
                >
                    {/* Background watermark */}
                    <div style={{ position: 'absolute', right: -16, bottom: -16, opacity: 0.04 }}>
                        <Star size={130} color={C.amber} />
                    </div>
                    {/* Top gradient bar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${C.amber},#F97316)` }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                        <Star size={15} color={C.amber} />
                        <span style={{ fontSize: 12, fontWeight: 800, color: C.text, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Rating</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
                        <div style={{
                            fontSize: 52, fontWeight: 900, lineHeight: 1,
                            background: `linear-gradient(135deg,${C.amber},#D97706)`,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            {user?.rating || '—'}
                        </div>
                        <div>
                            <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
                                {[1,2,3,4,5].map(n => (
                                    <Star key={n} size={18}
                                        style={{ fill: n <= Math.round(user?.rating || 0) ? C.amber : '#E2E8F0', color: n <= Math.round(user?.rating || 0) ? C.amber : '#E2E8F0' }}
                                    />
                                ))}
                            </div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                {user?.totalReviews || 0} Verified Reviews
                            </p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* ── New Requests Preview ─────────────────────────── */}
            {requests.available?.length > 0 && (
                <motion.div variants={fadeUp}
                    style={{
                        ...maxW,
                        background: C.card, borderRadius: 20, padding: '24px',
                        border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Clock size={15} color={C.blue} />
                            <span style={{ fontSize: 12, fontWeight: 800, color: C.text, textTransform: 'uppercase', letterSpacing: '0.08em' }}>New Opportunities</span>
                        </div>
                        <Link to="/helper/requests" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 12, fontWeight: 700, color: C.blue,
                            background: 'rgba(59,130,246,0.08)', padding: '6px 14px',
                            borderRadius: 10, textDecoration: 'none', border: '1px solid rgba(59,130,246,0.15)',
                        }}>
                            View All <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                        {requests.available.slice(0, 3).map((req) => (
                            <Link key={req._id} to="/helper/requests" style={{ textDecoration: 'none' }}>
                                <div
                                    style={{
                                        background: '#F8FAFC', borderRadius: 14, padding: '16px',
                                        border: `1px solid ${C.border}`, transition: 'all 0.25s ease', cursor: 'pointer',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(59,130,246,0.12)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.border; }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: C.blue, background: 'rgba(59,130,246,0.08)', padding: '3px 10px', borderRadius: 999 }}>
                                            {req.serviceName || req.serviceType || 'Service'}
                                        </span>
                                        <span style={{ fontSize: 13, fontWeight: 800, color: C.green }}>
                                            ₹{req.proposedPrice > 0 ? req.proposedPrice : 'TBD'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: 13, color: C.textLight, margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {req.description || 'No description provided'}
                                    </p>
                                    <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 10, fontWeight: 600 }}>
                                        {req.user?.name || 'User'} · {req.priority} priority
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText, Activity, Shield, MessageSquare,
    ChevronRight, AlertTriangle, TrendingUp, Star, ArrowRight
} from 'lucide-react';
import api from '../../utils/api';

/* ── Design tokens (same as landing page) ───────────────────── */
const C = {
    primary:   '#1E3A8A',
    blue:      '#3B82F6',
    cyan:      '#06B6D4',
    green:     '#10B981',
    purple:    '#8B5CF6',
    amber:     '#F59E0B',
    rose:      '#F43F5E',
    text:      '#0F172A',
    textLight: '#64748B',
    border:    'rgba(226,232,240,0.8)',
    card:      '#FFFFFF',
};

const fadeUp = {
    hidden:  { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};
const stagger = {
    visible: { transition: { staggerChildren: 0.1 } },
};

const SERVICE_TILES = [
    { title: 'Income Tax',         icon: '🧾', desc: 'ITR filing, Form 15H, refunds',       link: '/user/services?category=tax',        grad: `linear-gradient(135deg,${C.blue},#6366F1)` },
    { title: 'Banking',            icon: '🏦', desc: 'Account issues, KYC, FD',             link: '/user/services?category=banking',     grad: `linear-gradient(135deg,${C.green},#14B8A6)` },
    { title: 'Financial Planning', icon: '📈', desc: 'Investment, pension advice',           link: '/user/services?category=finance',     grad: `linear-gradient(135deg,${C.purple},#A855F7)` },
    { title: 'Legal Aid',          icon: '⚖️', desc: 'Property, will, legal docs',          link: '/user/services?category=legal',       grad: `linear-gradient(135deg,#F97316,${C.rose})` },
    { title: 'Health Services',    icon: '🏥', desc: 'Healthcare, CGHS, insurance',         link: '/user/services?category=healthcare',  grad: `linear-gradient(135deg,${C.rose},#EC4899)` },
    { title: 'Govt Schemes',       icon: '🇮🇳', desc: 'PM VVVY, EPFO, gratuity',           link: '/user/services?category=government',  grad: `linear-gradient(135deg,${C.amber},#D97706)` },
];

const PENSIONER_TILES = [
    { label: 'My Documents', icon: '📂', link: '/user/vault',      desc: 'E2E Encrypted Vault',        grad: `linear-gradient(135deg,#6366F1,${C.purple})` },
    { label: 'AI Assistant', icon: '🤖', link: '/user/ai-chat',    desc: 'ITR, Form 15H, schemes',     grad: `linear-gradient(135deg,${C.purple},#7C3AED)` },
    { label: 'OCR Upload',   icon: '📄', link: '/user/documents',  desc: 'Scan pension certificate',    grad: `linear-gradient(135deg,${C.amber},#F97316)` },
    { label: 'Track Helper', icon: '📍', link: '/user/track',      desc: 'Live task status',            grad: `linear-gradient(135deg,${C.green},#14B8A6)` },
    { label: 'Find Helper',  icon: '🔍', link: '/user/services',   desc: 'Nearby verified helpers',     grad: `linear-gradient(135deg,${C.blue},${C.cyan})` },
    { label: 'Chat',         icon: '💬', link: '/user/chat',       desc: 'Message your helper',         grad: `linear-gradient(135deg,${C.rose},#EC4899)` },
];

function StatCard({ label, value, icon: Icon, grad, shadowColor }) {
    return (
        <motion.div variants={fadeUp} whileHover={{ y: -4, boxShadow: `0 16px 32px ${shadowColor}` }}
            style={{
                background: C.card, borderRadius: 18, padding: '22px 20px',
                border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                position: 'relative', overflow: 'hidden', transition: 'box-shadow 0.3s',
            }}
        >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: grad }} />
            <div style={{ width: 40, height: 40, borderRadius: 12, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, boxShadow: `0 6px 14px ${shadowColor}` }}>
                <Icon size={18} color="#fff" />
            </div>
            <p style={{ fontSize: 28, fontWeight: 900, color: C.text, lineHeight: 1, marginBottom: 4 }}>{value}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
        </motion.div>
    );
}

function TileCard({ icon, title, desc, link, grad }) {
    return (
        <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link to={link} style={{
                display: 'block', background: grad, borderRadius: 18, padding: '22px 18px',
                textDecoration: 'none', color: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease',
            }}>
                <p style={{ fontSize: 28, marginBottom: 8 }}>{icon}</p>
                <p style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{title || desc.split(',')[0]}</p>
                <p style={{ fontSize: 12, opacity: 0.8, lineHeight: 1.4 }}>{desc}</p>
            </Link>
        </motion.div>
    );
}

export default function UserDashboard() {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/requests/mine').then(r => setRequests(r.data || [])).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const activeRequests    = requests.filter(r => !['completed', 'cancelled'].includes(r.status));
    const completedRequests = requests.filter(r => r.status === 'completed');

    const greeting = () => {
        const h = new Date().getHours();
        return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
    };

    const stats = [
        { label: 'Active Tasks',  value: loading ? '—' : activeRequests.length,    icon: Activity,      grad: `linear-gradient(135deg,${C.blue},${C.cyan})`,     shadowColor: 'rgba(59,130,246,0.2)' },
        { label: 'Completed',     value: loading ? '—' : completedRequests.length,  icon: Shield,        grad: `linear-gradient(135deg,${C.green},#14B8A6)`,      shadowColor: 'rgba(16,185,129,0.2)' },
        { label: 'Documents',     value: user?.isPensioner ? '🔒' : '—',            icon: FileText,      grad: `linear-gradient(135deg,${C.purple},#A855F7)`,     shadowColor: 'rgba(139,92,246,0.2)' },
        { label: 'AI Chats',      value: '∞',                                       icon: MessageSquare, grad: `linear-gradient(135deg,${C.amber},#F97316)`,      shadowColor: 'rgba(245,158,11,0.2)' },
    ];

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} style={{ padding: '8px 0 40px' }}>

            {/* ── Header ───────────────────────────────────────── */}
            <motion.div variants={fadeUp} style={{
                display: 'flex', flexWrap: 'wrap', alignItems: 'center',
                justifyContent: 'space-between', gap: 16, marginBottom: 32,
                background: C.card, borderRadius: 20, padding: '24px 28px',
                border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}>
                <div>
                    <p style={{ fontSize: 13, color: C.textLight, fontWeight: 600, marginBottom: 4 }}>{greeting()},</p>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, margin: 0, lineHeight: 1.2 }}>
                        <span style={{ background: `linear-gradient(90deg,${C.primary},${C.blue})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {user?.name}
                        </span>{' '}👋
                    </h1>
                    <div style={{ marginTop: 8 }}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999,
                            background: user?.isPensioner ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
                            color: user?.isPensioner ? C.amber : C.blue,
                            border: `1px solid ${user?.isPensioner ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)'}`,
                        }}>
                            {user?.isPensioner ? '🏅 Pensioner Member' : '👤 Regular Member'}
                        </span>
                    </div>
                </div>
                <Link to="/user/ai-chat" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 20px', borderRadius: 14, fontSize: 13, fontWeight: 700,
                    background: `linear-gradient(135deg,${C.purple},#7C3AED)`,
                    color: '#fff', textDecoration: 'none',
                    boxShadow: '0 6px 20px rgba(139,92,246,0.3)', transition: 'opacity 0.2s',
                }}>
                    🤖 AI Assistant
                </Link>
            </motion.div>

            {/* ── Pensioner Alert ───────────────────────────────── */}
            {user?.isPensioner && !user?.dataCompleteness?.pension && (
                <motion.div variants={fadeUp} style={{
                    marginBottom: 24, padding: '16px 20px', borderRadius: 16,
                    background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)',
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                }}>
                    <AlertTriangle size={20} style={{ color: C.amber, flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#92400E', margin: 0, marginBottom: 4 }}>Complete your pensioner profile</p>
                        <p style={{ fontSize: 12, color: '#B45309', margin: 0 }}>Upload your pension certificate to unlock AI form filling and document management.</p>
                    </div>
                    <Link to="/user/vault" style={{
                        padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                        background: `linear-gradient(135deg,${C.amber},#D97706)`,
                        color: '#fff', textDecoration: 'none', flexShrink: 0,
                    }}>
                        Upload Now
                    </Link>
                </motion.div>
            )}

            {/* ── Stats ─────────────────────────────────────────── */}
            <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
                {stats.map(s => <StatCard key={s.label} {...s} />)}
            </motion.div>

            {/* ── Service / Pensioner Tiles ─────────────────────── */}
            <motion.div variants={fadeUp} style={{
                background: C.card, borderRadius: 20, padding: '24px',
                border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 24,
            }}>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: '0 0 18px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {user?.isPensioner ? '🏅 Pensioner Quick Access' : '⚡ Services Available'}
                </h2>

                {/* Pensioner: show pension + bank info if available */}
                {user?.isPensioner && user?.dataCompleteness?.pension && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                        <div style={{ padding: '16px', borderRadius: 14, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
                            <p style={{ fontSize: 11, color: C.textLight, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>🏅 Pension Details</p>
                            {user.pensionId && <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{user.pensionId}</p>}
                            {user.monthlyPension && <p style={{ fontSize: 13, color: C.green, fontWeight: 700 }}>₹{user.monthlyPension}/mo</p>}
                        </div>
                        {user.bankName && (
                            <div style={{ padding: '16px', borderRadius: 14, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
                                <p style={{ fontSize: 11, color: C.textLight, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>🏦 Bank Details</p>
                                <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{user.bankName}</p>
                                {user.ifscCode && <p style={{ fontSize: 12, color: C.textLight }}>{user.ifscCode}</p>}
                            </div>
                        )}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                    {(user?.isPensioner ? PENSIONER_TILES : SERVICE_TILES).map(t => (
                        <TileCard key={t.title || t.label} icon={t.icon} title={t.title || t.label} desc={t.desc} link={t.link} grad={t.grad} />
                    ))}
                </div>
            </motion.div>

            {/* ── Active Requests ───────────────────────────────── */}
            {activeRequests.length > 0 && (
                <motion.div variants={fadeUp} style={{
                    background: C.card, borderRadius: 20, padding: '24px',
                    border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h2 style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            ⚡ Active Requests
                        </h2>
                        <Link to="/user/track" style={{ fontSize: 12, fontWeight: 700, color: C.blue, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {activeRequests.slice(0, 3).map(r => (
                            <Link key={r._id} to="/user/track" style={{
                                display: 'flex', alignItems: 'center', gap: 14,
                                padding: '14px 16px', borderRadius: 14,
                                background: '#F8FAFC', border: `1px solid ${C.border}`,
                                textDecoration: 'none', transition: 'all 0.2s ease',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(59,130,246,0.1)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.border; }}
                            >
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg,${C.blue},${C.cyan})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Activity size={18} color="#fff" />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0, marginBottom: 3 }}>{r.serviceName || 'Service Request'}</p>
                                    <p style={{ fontSize: 12, color: C.textLight, margin: 0 }}>
                                        Status: <span style={{ fontWeight: 700, color: C.blue, textTransform: 'capitalize' }}>{r.status?.replace('_', ' ')}</span>
                                    </p>
                                </div>
                                <ChevronRight size={16} style={{ color: C.textLight, flexShrink: 0 }} />
                            </Link>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

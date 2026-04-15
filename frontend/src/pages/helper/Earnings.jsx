import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Clock, CheckCircle, Sparkles } from 'lucide-react';

const C = {
    text:      '#0F172A',
    textLight: '#64748B',
    border:    'rgba(226,232,240,0.8)',
    card:      '#FFFFFF',
    green:     '#10B981',
    amber:     '#F59E0B',
    purple:    '#8B5CF6',
    blue:      '#3B82F6',
    cyan:      '#06B6D4',
};

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

export default function HelperEarnings() {
    const { user, API } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/payments/history').then(r => setPayments(r.data || [])).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const totalEarned = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.helperPayout || 0), 0);
    const pending     = payments.filter(p => p.status !== 'completed').reduce((sum, p) => sum + (p.helperPayout || 0), 0);
    const completed   = user?.completedTasks || payments.filter(p => p.status === 'completed').length;

    const stats = [
        { icon: DollarSign, label: 'Total Earned',     value: `₹${(user?.earnings || totalEarned).toLocaleString('en-IN')}`, grad: `linear-gradient(135deg,${C.green},#14B8A6)`,  shadowColor: 'rgba(16,185,129,0.22)' },
        { icon: Clock,      label: 'Pending Payout',   value: `₹${pending.toLocaleString('en-IN')}`,                          grad: `linear-gradient(135deg,${C.amber},#F97316)`,  shadowColor: 'rgba(245,158,11,0.22)'  },
        { icon: TrendingUp, label: 'Completed Tasks',  value: loading ? '—' : completed,                                      grad: `linear-gradient(135deg,${C.purple},#A855F7)`, shadowColor: 'rgba(139,92,246,0.22)'  },
    ];

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} style={{ padding: '8px 0 40px' }}>

            {/* Header */}
            <motion.div variants={fadeUp} style={{
                background: C.card, borderRadius: 20, padding: '24px 28px', marginBottom: 24,
                border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                display: 'flex', alignItems: 'center', gap: 10,
            }}>
                <div style={{ flex: 1 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8,
                        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                        borderRadius: 999, padding: '4px 12px',
                    }}>
                        <Sparkles size={11} color={C.green} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.10em' }}>Earnings Overview</span>
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0, lineHeight: 1.2 }}>Wallet &amp; Earnings</h1>
                    <p style={{ fontSize: 13, color: C.textLight, marginTop: 6, fontWeight: 500 }}>Track your income and payouts from completed tasks.</p>
                </div>
            </motion.div>

            {/* Stat Cards */}
            <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
                {stats.map((s, i) => (
                    <motion.div key={i} variants={fadeUp}
                        whileHover={{ y: -5, boxShadow: `0 18px 36px ${s.shadowColor}` }}
                        style={{
                            background: C.card, borderRadius: 20, padding: '24px 22px',
                            border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            position: 'relative', overflow: 'hidden', transition: 'box-shadow 0.3s',
                        }}
                    >
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.grad }} />
                        <div style={{
                            width: 46, height: 46, borderRadius: 14, background: s.grad,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: 16, boxShadow: `0 8px 18px ${s.shadowColor}`,
                        }}>
                            <s.icon size={20} color="#fff" />
                        </div>
                        <p style={{ fontSize: 30, fontWeight: 900, color: C.text, lineHeight: 1, marginBottom: 6 }}>
                            {loading ? '—' : s.value}
                        </p>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Payment History */}
            <motion.div variants={fadeUp} style={{
                background: C.card, borderRadius: 20, padding: '24px',
                border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
                <h2 style={{ fontSize: 12, fontWeight: 800, color: C.text, margin: '0 0 18px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Payment History
                </h2>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[1,2,3].map(i => (
                            <div key={i} style={{ height: 56, borderRadius: 12, background: '#F1F5F9', animation: 'pulse 1.5s infinite' }} />
                        ))}
                    </div>
                ) : payments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(30,58,138,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', border: '1px solid rgba(30,58,138,0.08)' }}>
                            <DollarSign size={28} color="#CBD5E1" />
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>No earnings yet</p>
                        <p style={{ fontSize: 13, color: C.textLight }}>Complete tasks to start earning and see your payment history here.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {payments.map(p => (
                            <div key={p._id} style={{
                                display: 'flex', alignItems: 'center', gap: 14,
                                padding: '14px 16px', borderRadius: 14,
                                background: '#F8FAFC', border: `1px solid ${C.border}`,
                            }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: p.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                }}>
                                    {p.status === 'completed'
                                        ? <CheckCircle size={18} color={C.green} />
                                        : <Clock size={18} color={C.amber} />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0, marginBottom: 3 }}>{p.request?.serviceName || 'Service'}</p>
                                    <p style={{ fontSize: 12, color: C.textLight, margin: 0 }}>{new Date(p.createdAt).toLocaleDateString('en-IN')}</p>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <p style={{ fontSize: 15, fontWeight: 800, color: C.green, margin: 0, marginBottom: 2 }}>+₹{p.helperPayout}</p>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700,
                                        padding: '2px 8px', borderRadius: 999, textTransform: 'capitalize',
                                        background: p.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                        color: p.status === 'completed' ? C.green : C.amber,
                                    }}>
                                        {p.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

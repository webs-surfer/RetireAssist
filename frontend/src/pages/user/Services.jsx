import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Clock, IndianRupee, FileText, Bot,
    UserCheck, X, ArrowRight, ChevronRight, Sparkles,
    Layers, TrendingUp, Send
} from 'lucide-react';

/* ── Category Config ──────────────────────────────────────────── */
const categories = ['all', 'pension', 'tax', 'insurance', 'government', 'banking', 'healthcare', 'legal'];

const categoryConfig = {
    all:        { emoji: '✨', label: 'All',        grad: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#6366F1' },
    pension:    { emoji: '🏦', label: 'Pension',    grad: 'linear-gradient(135deg,#3B82F6,#06B6D4)', color: '#3B82F6' },
    tax:        { emoji: '📊', label: 'Tax',        grad: 'linear-gradient(135deg,#F59E0B,#EF4444)', color: '#F59E0B' },
    insurance:  { emoji: '🛡️', label: 'Insurance', grad: 'linear-gradient(135deg,#10B981,#059669)', color: '#10B981' },
    government: { emoji: '🏛️', label: 'Government',grad: 'linear-gradient(135deg,#8B5CF6,#6366F1)', color: '#8B5CF6' },
    banking:    { emoji: '💳', label: 'Banking',    grad: 'linear-gradient(135deg,#06B6D4,#3B82F6)', color: '#06B6D4' },
    healthcare: { emoji: '🏥', label: 'Healthcare', grad: 'linear-gradient(135deg,#EF4444,#F97316)', color: '#EF4444' },
    legal:      { emoji: '⚖️', label: 'Legal',     grad: 'linear-gradient(135deg,#64748B,#475569)', color: '#64748B' },
};

const statusConfig = {
    pending:     { color: '#D97706', bg: 'rgba(245,158,11,0.1)',  label: 'Pending' },
    assigned:    { color: '#2563EB', bg: 'rgba(59,130,246,0.1)',  label: 'Assigned' },
    'in-progress':{ color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', label: 'In Progress' },
    completed:   { color: '#059669', bg: 'rgba(16,185,129,0.1)',  label: 'Completed' },
    cancelled:   { color: '#DC2626', bg: 'rgba(239,68,68,0.1)',   label: 'Cancelled' },
};

/* ── Animations ───────────────────────────────────────────────── */
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.05, ease: 'easeOut' } }),
};

/* ── Service Card ─────────────────────────────────────────────── */
function ServiceCard({ service, index, onClick }) {
    const cat = categoryConfig[service.category] || categoryConfig.all;
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            custom={index}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -6 }}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: '#fff', borderRadius: 20, cursor: 'pointer',
                border: hovered ? `1.5px solid ${cat.color}40` : '1.5px solid rgba(226,232,240,0.9)',
                boxShadow: hovered
                    ? `0 20px 48px rgba(0,0,0,0.1), 0 0 0 3px ${cat.color}12`
                    : '0 2px 10px rgba(0,0,0,0.04)',
                overflow: 'hidden', transition: 'box-shadow 0.3s, border 0.3s',
                position: 'relative',
            }}
        >
            {/* Top gradient bar */}
            <div style={{
                height: 3, background: cat.grad,
                opacity: hovered ? 1 : 0, transition: 'opacity 0.3s',
            }} />

            <div style={{ padding: '20px' }}>
                {/* Icon + Title Row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                    <div style={{
                        width: 52, height: 52, flexShrink: 0, borderRadius: 16,
                        background: hovered ? cat.grad : `${cat.color}12`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, transition: 'background 0.3s',
                        boxShadow: hovered ? `0 8px 20px ${cat.color}30` : 'none',
                    }}>
                        {service.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                            fontSize: 15, fontWeight: 700, color: '#0F172A',
                            margin: '0 0 4px', lineHeight: 1.3,
                        }}>
                            {service.name}
                        </h3>
                        <p style={{
                            fontSize: 12.5, color: '#64748B', margin: 0,
                            lineHeight: 1.5, display: '-webkit-box',
                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                            {service.description}
                        </p>
                    </div>
                </div>

                {/* Meta Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                    <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: 12, fontWeight: 600, color: '#64748B',
                        background: '#F1F5F9', padding: '4px 10px', borderRadius: 999,
                    }}>
                        <Clock size={11} /> {service.estimatedDays}d
                    </span>
                    <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: 12, fontWeight: 700, color: '#10B981',
                        background: 'rgba(16,185,129,0.08)', padding: '4px 10px', borderRadius: 999,
                    }}>
                        <IndianRupee size={11} /> ₹{service.basePrice}
                    </span>
                    <span style={{
                        fontSize: 11, fontWeight: 700, padding: '4px 10px',
                        borderRadius: 999, textTransform: 'capitalize',
                        background: `${cat.color}12`, color: cat.color,
                        border: `1px solid ${cat.color}20`,
                    }}>
                        {cat.emoji} {service.category}
                    </span>
                </div>

                {/* Documents */}
                {service.requiredDocuments?.length > 0 && (
                    <div style={{
                        paddingTop: 10, borderTop: '1px solid rgba(226,232,240,0.7)',
                        display: 'flex', alignItems: 'flex-start', gap: 6,
                    }}>
                        <FileText size={11} color="#94A3B8" style={{ flexShrink: 0, marginTop: 2 }} />
                        <p style={{ fontSize: 11, color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
                            {service.requiredDocuments.slice(0, 3).join(', ')}
                            {service.requiredDocuments.length > 3 && ` +${service.requiredDocuments.length - 3} more`}
                        </p>
                    </div>
                )}

                {/* CTA hint on hover */}
                <div style={{
                    marginTop: 10, display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 12, fontWeight: 700, color: cat.color,
                    opacity: hovered ? 1 : 0, transition: 'opacity 0.2s',
                }}>
                    View details <ArrowRight size={13} />
                </div>
            </div>
        </motion.div>
    );
}

/* ── Category Chip ────────────────────────────────────────────── */
function CategoryChip({ cat, active, onClick }) {
    const cfg = categoryConfig[cat];
    return (
        <button onClick={onClick} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 999, cursor: 'pointer',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 13, fontWeight: 600,
            transition: 'all 0.22s',
            background: active ? cfg.grad : '#fff',
            color: active ? '#fff' : '#64748B',
            border: active ? 'none' : '1.5px solid #E2E8F0',
            boxShadow: active ? `0 4px 14px ${cfg.color}35` : '0 1px 3px rgba(0,0,0,0.04)',
            transform: active ? 'scale(1.05)' : 'scale(1)',
        }}>
            <span style={{ fontSize: 14 }}>{cfg.emoji}</span>
            {cfg.label}
        </button>
    );
}

/* ── Main Component ───────────────────────────────────────────── */
export default function UserServices() {
    const { API } = useAuth();
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedService, setSelectedService] = useState(null);

    useEffect(() => {
        setLoading(true);
        API.get(`/services${category !== 'all' ? `?category=${category}` : ''}`)
            .then(r => setServices(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [category]);

    useEffect(() => {
        API.get('/requests/mine').then(r => setRequests(r.data)).catch(() => {});
    }, []);

    const filtered = services.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())
    );

    const activeRequests = requests.filter(r => !['completed', 'cancelled'].includes(r.status));

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", paddingBottom: 48 }}>

            {/* ── Hero Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                style={{
                    background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 60%, #06B6D4 100%)',
                    borderRadius: 24, padding: '32px 32px 28px',
                    marginBottom: 24,
                    position: 'relative', overflow: 'hidden',
                    boxShadow: '0 16px 48px rgba(59,130,246,0.25)',
                }}
            >
                {/* Decorative blobs */}
                <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', filter: 'blur(40px)' }} />
                <div style={{ position: 'absolute', bottom: -40, left: 100, width: 160, height: 160, background: 'rgba(6,182,212,0.15)', borderRadius: '50%', filter: 'blur(40px)' }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Layers size={16} color="rgba(255,255,255,0.7)" />
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Service Catalogue
                        </span>
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                        Browse Services
                    </h1>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', margin: '0 0 24px', maxWidth: 420 }}>
                        Find the right service and get help from AI or a verified helper — all in one place.
                    </p>

                    {/* Search Bar */}
                    <div style={{ position: 'relative', maxWidth: 500 }}>
                        <Search size={16} color="rgba(255,255,255,0.5)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search services..."
                            style={{
                                width: '100%', padding: '13px 16px 13px 44px',
                                borderRadius: 14, border: '2px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
                                fontSize: 14, fontWeight: 500, color: '#fff', outline: 'none',
                                boxSizing: 'border-box', transition: 'all 0.2s',
                                fontFamily: "'Inter', system-ui, sans-serif",
                            }}
                            onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.2)'; e.target.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                            onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.12)'; e.target.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                        />
                    </div>
                </div>

                {/* Stats Row */}
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
                    {[
                        { label: 'Total Services', value: services.length, icon: Layers },
                        { label: 'Active Requests', value: activeRequests.length, icon: TrendingUp },
                        { label: 'Categories', value: categories.length - 1, icon: Sparkles },
                    ].map((s, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 12, padding: '8px 14px',
                        }}>
                            <s.icon size={14} color="rgba(255,255,255,0.7)" />
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{s.value}</span>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ── Category Chips ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.35 }}
                style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}
            >
                {categories.map(cat => (
                    <CategoryChip key={cat} cat={cat} active={category === cat} onClick={() => setCategory(cat)} />
                ))}
            </motion.div>

            {/* ── Active Requests Banner ── */}
            {activeRequests.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    style={{
                        background: 'linear-gradient(135deg,#EEF2FF,#E0F2FE)',
                        border: '1px solid rgba(99,102,241,0.2)', borderRadius: 18,
                        padding: '16px 20px', marginBottom: 22,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <Send size={15} color="#6366F1" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1E3A8A' }}>
                            Active Requests ({activeRequests.length})
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {activeRequests.slice(0, 3).map(req => {
                            const sc = statusConfig[req.status] || statusConfig.pending;
                            return (
                                <div key={req._id}
                                    onClick={() => navigate(`/user/track/${req._id}`)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        background: '#fff', borderRadius: 12, padding: '10px 14px',
                                        cursor: 'pointer', border: '1px solid rgba(226,232,240,0.7)',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                        transition: 'box-shadow 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.12)'}
                                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'}
                                >
                                    <div style={{
                                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                                        background: 'linear-gradient(135deg,#EEF2FF,#E0F2FE)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                                    }}>📋</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {req.serviceName || 'Service Request'}
                                        </p>
                                        {req.helperName && (
                                            <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>Helper: {req.helperName}</p>
                                        )}
                                    </div>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                                        background: sc.bg, color: sc.color, whiteSpace: 'nowrap',
                                    }}>
                                        {sc.label}
                                    </span>
                                    <ChevronRight size={15} color="#94A3B8" />
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* ── Results heading ── */}
            {!loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#64748B', margin: 0 }}>
                        {filtered.length} service{filtered.length !== 1 ? 's' : ''} {search ? `for "${search}"` : `in ${categoryConfig[category]?.label || 'All'}`}
                    </p>
                    {search && (
                        <button onClick={() => setSearch('')} style={{
                            fontSize: 12, fontWeight: 700, color: '#6366F1', background: 'none',
                            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                            fontFamily: 'inherit',
                        }}>
                            <X size={13} /> Clear
                        </button>
                    )}
                </motion.div>
            )}

            {/* ── Service Grid ── */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} style={{
                            height: 180, borderRadius: 20,
                            background: 'linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 1.5s ease-in-out infinite',
                        }} />
                    ))}
                    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
                </div>
            ) : filtered.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{
                        textAlign: 'center', padding: '60px 32px',
                        background: '#fff', borderRadius: 20,
                        border: '1.5px solid rgba(226,232,240,0.8)',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                    }}
                >
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%', margin: '0 auto 18px',
                        background: 'linear-gradient(135deg,#EEF2FF,#E0F2FE)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
                    }}>🔍</div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>No services found</h3>
                    <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>Try a different search term or category.</p>
                </motion.div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
                    {filtered.map((service, i) => (
                        <ServiceCard
                            key={service._id}
                            service={service}
                            index={i}
                            onClick={() => setSelectedService(service)}
                        />
                    ))}
                </div>
            )}

            {/* ── Service Detail Drawer ── */}
            <AnimatePresence>
                {selectedService && (() => {
                    const cat = categoryConfig[selectedService.category] || categoryConfig.all;
                    return (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setSelectedService(null)}
                                style={{
                                    position: 'fixed', inset: 0,
                                    background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)', zIndex: 50,
                                }}
                            />
                            <motion.div
                                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                                style={{
                                    position: 'fixed', top: 0, right: 0, bottom: 0,
                                    width: '100%', maxWidth: 440,
                                    background: '#fff', zIndex: 51,
                                    boxShadow: '-20px 0 60px rgba(0,0,0,0.18)',
                                    display: 'flex', flexDirection: 'column',
                                    fontFamily: "'Inter', system-ui, sans-serif",
                                }}
                            >
                                {/* Drawer Header */}
                                <div style={{
                                    background: cat.grad, padding: '28px 24px 24px', flexShrink: 0, position: 'relative', overflow: 'hidden',
                                }}>
                                    <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
                                    <button
                                        onClick={() => setSelectedService(null)}
                                        style={{
                                            position: 'absolute', top: 16, right: 16,
                                            width: 34, height: 34, borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.2)', border: 'none',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                                        }}
                                    >
                                        <X size={17} />
                                    </button>
                                    <div style={{
                                        width: 58, height: 58, borderRadius: 18,
                                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 28, marginBottom: 14,
                                        border: '1px solid rgba(255,255,255,0.25)',
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                    }}>
                                        {selectedService.icon}
                                    </div>
                                    <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 6px', position: 'relative' }}>
                                        {selectedService.name}
                                    </h2>
                                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: 0, position: 'relative' }}>
                                        {selectedService.description}
                                    </p>
                                    {/* Meta pills */}
                                    <div style={{ display: 'flex', gap: 8, marginTop: 14, position: 'relative' }}>
                                        <span style={{
                                            display: 'flex', alignItems: 'center', gap: 5,
                                            background: 'rgba(255,255,255,0.18)', borderRadius: 999,
                                            padding: '5px 12px', fontSize: 12, fontWeight: 700, color: '#fff',
                                        }}>
                                            <Clock size={12} /> {selectedService.estimatedDays} days
                                        </span>
                                        <span style={{
                                            display: 'flex', alignItems: 'center', gap: 5,
                                            background: 'rgba(255,255,255,0.18)', borderRadius: 999,
                                            padding: '5px 12px', fontSize: 12, fontWeight: 700, color: '#fff',
                                        }}>
                                            <IndianRupee size={12} /> ₹{selectedService.basePrice}
                                        </span>
                                    </div>
                                </div>

                                {/* Drawer Body */}
                                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                                    {/* Required Documents */}
                                    {selectedService.requiredDocuments?.length > 0 && (
                                        <div style={{
                                            background: '#F8FAFC', border: '1px solid rgba(226,232,240,0.8)',
                                            borderRadius: 16, padding: '16px', marginBottom: 20,
                                        }}>
                                            <p style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <FileText size={13} color={cat.color} /> Required Documents
                                            </p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                {selectedService.requiredDocuments.map((doc, i) => (
                                                    <span key={i} style={{
                                                        fontSize: 11, fontWeight: 600, color: '#475569',
                                                        background: '#fff', padding: '5px 12px', borderRadius: 999,
                                                        border: '1px solid rgba(226,232,240,0.9)',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                                    }}>
                                                        {doc}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>
                                        How would you like to proceed?
                                    </p>

                                    {/* AI Help Option */}
                                    <div
                                        onClick={() => { setSelectedService(null); navigate(`/user/ai-chat?service=${encodeURIComponent(selectedService.name)}`); }}
                                        style={{
                                            background: 'linear-gradient(135deg,#FAF5FF,#EDE9FE)',
                                            border: '1.5px solid rgba(139,92,246,0.2)',
                                            borderRadius: 16, padding: '18px', marginBottom: 12,
                                            cursor: 'pointer', transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(139,92,246,0.12)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                                                background: 'linear-gradient(135deg,#8B5CF6,#6366F1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: '0 6px 16px rgba(139,92,246,0.3)',
                                            }}>
                                                <Bot size={20} color="#fff" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>Ask AI Assistant</p>
                                                <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>Instant answers, no waiting</p>
                                            </div>
                                            <ArrowRight size={16} color="#8B5CF6" />
                                        </div>
                                        <p style={{ fontSize: 12, color: '#64748B', margin: '12px 0 0', lineHeight: 1.55 }}>
                                            Get instant answers about <strong style={{ color: '#0F172A' }}>{selectedService.name}</strong> from our AI — no appointment needed.
                                        </p>
                                    </div>

                                    {/* Helper Option */}
                                    <div
                                        onClick={() => { setSelectedService(null); navigate('/user/request', { state: { service: selectedService } }); }}
                                        style={{
                                            background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)',
                                            border: '1.5px solid rgba(59,130,246,0.2)',
                                            borderRadius: 16, padding: '18px',
                                            cursor: 'pointer', transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,0.12)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                                                background: 'linear-gradient(135deg,#1E3A8A,#3B82F6)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: '0 6px 16px rgba(59,130,246,0.3)',
                                            }}>
                                                <UserCheck size={20} color="#fff" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>Find a Verified Helper</p>
                                                <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>Professional hands-on help</p>
                                            </div>
                                            <ArrowRight size={16} color="#3B82F6" />
                                        </div>
                                        <p style={{ fontSize: 12, color: '#64748B', margin: '12px 0 0', lineHeight: 1.55 }}>
                                            Connect with a verified helper in your city for hands-on assistance with <strong style={{ color: '#0F172A' }}>{selectedService.name}</strong>.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    );
                })()}
            </AnimatePresence>
        </div>
    );
}

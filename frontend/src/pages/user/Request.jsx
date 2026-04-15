import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Send, CheckCircle, User, ChevronRight, ArrowLeft, Globe, Zap, Clock } from 'lucide-react';

const mockHelpers = [
    { _id: 'm1', name: 'Rajesh Kumar', rating: 4.8, totalReviews: 47, services: ['pension', 'government'], bio: 'Retired government officer. Expert in pension and documentation.', location: '2.3 km', isVerified: true },
    { _id: 'm2', name: 'Priya Sharma', rating: 4.6, totalReviews: 32, services: ['tax', 'banking', 'legal'], bio: 'CA with 10+ years helping senior citizens with tax filing.', location: '3.1 km', isVerified: true },
    { _id: 'm3', name: 'Suresh Nair', rating: 4.9, totalReviews: 63, services: ['insurance', 'healthcare'], bio: 'Insurance specialist focused on hassle-free claim processing.', location: '4.5 km', isVerified: true },
    { _id: 'm4', name: 'Anita Devi', rating: 4.5, totalReviews: 28, services: ['pension', 'tax', 'government'], bio: 'Social worker helping senior citizens navigate government schemes.', location: '5.0 km', isVerified: true },
];

const AVATAR_COLORS = ['#4F46E5','#059669','#D97706','#7C3AED'];

const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 12,
    border: '1.5px solid #E2E8F0', background: '#F8FAFC',
    fontSize: 14, fontWeight: 500, color: '#0F172A',
    outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
    fontFamily: "'Inter', system-ui, sans-serif",
};

export default function UserRequest() {
    const { API } = useAuth();
    const { state } = useLocation();
    const navigate = useNavigate();

    const [step, setStep] = useState(state?.service ? 2 : 1);
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(state?.service || null);
    const [helpers, setHelpers] = useState([]);
    const [loadingHelpers, setLoadingHelpers] = useState(false);
    const [selectedHelper, setSelectedHelper] = useState(null);
    const [form, setForm] = useState({ description: '', proposedPrice: '', priority: 'normal', location: '' });
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (step === 1) API.get('/services').then(r => setServices(Array.isArray(r.data) ? r.data : [])).catch(() => {});
        if (step === 2) {
            setLoadingHelpers(true);
            API.get('/helpers')
                .then(r => { const d = Array.isArray(r.data) ? r.data : []; setHelpers(d.length > 0 ? d : mockHelpers); })
                .catch(() => setHelpers(mockHelpers))
                .finally(() => setLoadingHelpers(false));
            if (selectedService) setForm(f => ({ ...f, proposedPrice: selectedService.basePrice?.toString() || '' }));
        }
    }, [step]);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload = {
                serviceId: selectedService._id,
                serviceName: selectedService.name,
                description: form.description,
                helperId: selectedHelper?._id?.startsWith('m') ? null : selectedHelper?._id,
                proposedPrice: parseFloat(form.proposedPrice) || 0,
                priority: form.priority,
                location: form.location,
            };
            const res = await API.post('/requests', payload);
            setDone(true);
            setTimeout(() => navigate(`/user/track/${res.data._id}`), 2000);
        } catch { alert('Error creating request. Please try again.'); }
        finally { setSubmitting(false); }
    };

    /* ── Success screen ── */
    if (done) return (
        <motion.div
            initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontFamily: "'Inter', system-ui, sans-serif" }}
        >
            <div style={{ width: 96, height: 96, borderRadius: 32, background: 'linear-gradient(135deg,#059669,#34D399)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 16px 48px rgba(5,150,105,0.3)' }}>
                <CheckCircle size={48} color="#fff" />
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>Request Submitted!</h2>
            <p style={{ fontSize: 14, color: '#64748B', fontWeight: 500 }}>Redirecting to tracking page...</p>
        </motion.div>
    );

    const steps = ['Select Service', 'Find Helper', 'Confirm'];

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", paddingBottom: 48 }}>

            {/* ── Page Header ── */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Request a Service</h1>
                <p style={{ fontSize: 14, color: '#64748B', fontWeight: 500, margin: 0 }}>Choose a service and connect with a verified helper near you.</p>
            </motion.div>

            {/* ── Stepper ── */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                style={{ display: 'flex', alignItems: 'center', marginBottom: 28, gap: 0 }}
            >
                {steps.map((label, i) => {
                    const done_ = step > i + 1;
                    const active = step === i + 1;
                    return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                <div style={{
                                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 13, fontWeight: 800,
                                    background: done_ ? 'linear-gradient(135deg,#059669,#10B981)' : active ? 'linear-gradient(135deg,#4F46E5,#7C3AED)' : '#F1F5F9',
                                    color: (done_ || active) ? '#fff' : '#94A3B8',
                                    boxShadow: active ? '0 4px 14px rgba(99,102,241,0.35)' : done_ ? '0 4px 14px rgba(5,150,105,0.25)' : 'none',
                                    transition: 'all 0.3s',
                                }}>
                                    {done_ ? '✓' : i + 1}
                                </div>
                                <span style={{
                                    fontSize: 12, fontWeight: 700,
                                    color: active ? '#4F46E5' : done_ ? '#059669' : '#94A3B8',
                                    display: 'none',
                                    ...(window.innerWidth > 480 ? { display: 'inline' } : {}),
                                }}>{label}</span>
                            </div>
                            {i < 2 && (
                                <div style={{ flex: 1, height: 2, margin: '0 10px', borderRadius: 999, background: done_ ? 'linear-gradient(90deg,#059669,#10B981)' : '#E2E8F0', transition: 'background 0.3s' }} />
                            )}
                        </div>
                    );
                })}
            </motion.div>

            <AnimatePresence mode="wait">

                {/* ── STEP 1: Select Service ── */}
                {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {services.length === 0 ? (
                                [1,2,3,4].map(i => (
                                    <div key={i} style={{ height: 80, borderRadius: 18, background: 'linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                                ))
                            ) : services.map((svc, idx) => (
                                <motion.button key={svc._id}
                                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                    onClick={() => { setSelectedService(svc); setStep(2); }}
                                    style={{
                                        width: '100%', padding: '16px 20px', borderRadius: 18, cursor: 'pointer',
                                        background: '#fff', border: '1.5px solid #E2E8F0',
                                        display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                                        boxShadow: '0 1px 6px rgba(0,0,0,0.04)', transition: 'all 0.2s',
                                        fontFamily: 'inherit',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#A5B4FC'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    <div style={{ width: 48, height: 48, borderRadius: 15, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                                        {svc.icon || '🔧'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 3px' }}>{svc.name}</p>
                                        <p style={{ fontSize: 12, color: '#64748B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{svc.description}</p>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <p style={{ fontSize: 16, fontWeight: 800, color: '#4F46E5', margin: '0 0 2px' }}>₹{svc.basePrice}</p>
                                        <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, margin: 0 }}>{svc.estimatedDays}d est.</p>
                                    </div>
                                    <ChevronRight size={18} color="#CBD5E1" />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── STEP 2: Details + Helper ── */}
                {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                    >
                        {/* Selected service pill */}
                        <div style={{
                            background: 'linear-gradient(135deg,#EEF2FF,#E0F2FE)', border: '1.5px solid #C7D2FE',
                            borderRadius: 18, padding: '14px 18px',
                            display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                {selectedService?.icon || '🔧'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 14, fontWeight: 800, color: '#1E3A8A', margin: '0 0 2px' }}>{selectedService?.name}</p>
                                <p style={{ fontSize: 11, color: '#6366F1', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{selectedService?.category}</p>
                            </div>
                            <button onClick={() => setStep(1)} style={{
                                fontSize: 12, fontWeight: 700, color: '#4F46E5', background: 'rgba(99,102,241,0.1)',
                                border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '5px 12px',
                                cursor: 'pointer', fontFamily: 'inherit',
                            }}>Change</button>
                        </div>

                        {/* Request Details */}
                        <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #E2E8F0', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Send size={13} color="#4F46E5" />
                                </div>
                                Request Details
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Describe what you need help with..."
                                    rows={3}
                                    style={{ ...inputStyle, resize: 'none' }}
                                    onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; e.target.style.background = '#fff'; }}
                                    onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F8FAFC'; }}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Budget (₹)</label>
                                        <input
                                            type="number"
                                            value={form.proposedPrice}
                                            onChange={e => setForm(f => ({ ...f, proposedPrice: e.target.value }))}
                                            placeholder={selectedService?.basePrice}
                                            style={inputStyle}
                                            onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; e.target.style.background = '#fff'; }}
                                            onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F8FAFC'; }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Priority</label>
                                        <select
                                            value={form.priority}
                                            onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                                            style={{ ...inputStyle, cursor: 'pointer' }}
                                            onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; e.target.style.background = '#fff'; }}
                                            onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F8FAFC'; }}
                                        >
                                            <option value="low">🟢 Low</option>
                                            <option value="normal">🔵 Normal</option>
                                            <option value="urgent">🔴 Urgent</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={15} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                    <input
                                        value={form.location}
                                        onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                                        placeholder="Your location (city/area)"
                                        style={{ ...inputStyle, paddingLeft: 36 }}
                                        onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; e.target.style.background = '#fff'; }}
                                        onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F8FAFC'; }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Helper Selection */}
                        <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #E2E8F0', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={13} color="#059669" />
                                </div>
                                Select a Helper
                                <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', marginLeft: 2 }}>(optional)</span>
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {/* Post publicly */}
                                <button onClick={() => setSelectedHelper(null)} style={{
                                    width: '100%', padding: '14px 16px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                                    border: `2px solid ${!selectedHelper ? '#6366F1' : '#E2E8F0'}`,
                                    background: !selectedHelper ? 'linear-gradient(135deg,#EEF2FF,#E0E7FF)' : '#F8FAFC',
                                    transition: 'all 0.2s', fontFamily: 'inherit',
                                    boxShadow: !selectedHelper ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 12, background: !selectedHelper ? 'rgba(99,102,241,0.15)' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Globe size={18} color={!selectedHelper ? '#4F46E5' : '#94A3B8'} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: !selectedHelper ? '#4F46E5' : '#0F172A', margin: '0 0 2px' }}>Post publicly — any helper can accept</p>
                                            <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Zap size={10} color="#F59E0B" /> Fastest option. First available helper will respond.
                                            </p>
                                        </div>
                                    </div>
                                </button>

                                {/* Helper cards */}
                                {loadingHelpers ? (
                                    [1,2,3].map(i => (
                                        <div key={i} style={{ height: 74, borderRadius: 14, background: 'linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                                    ))
                                ) : helpers.map((helper, idx) => {
                                    const isSelected = selectedHelper?._id === helper._id;
                                    const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                                    const initials = helper.name.split(' ').map(n => n[0]).join('').slice(0, 2);
                                    return (
                                        <button key={helper._id} onClick={() => setSelectedHelper(helper)} style={{
                                            width: '100%', padding: '12px 14px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                                            border: `2px solid ${isSelected ? color : '#E2E8F0'}`,
                                            background: isSelected ? `${color}08` : '#fff',
                                            transition: 'all 0.2s', fontFamily: 'inherit',
                                            boxShadow: isSelected ? `0 0 0 3px ${color}18` : '0 1px 4px rgba(0,0,0,0.03)',
                                        }}
                                            onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.07)'; } }}
                                            onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.03)'; } }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{
                                                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                                                    background: `linear-gradient(135deg,${color}22,${color}44)`,
                                                    border: `1.5px solid ${color}40`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 15, fontWeight: 800, color: color,
                                                }}>{initials}</div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                                        <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>{helper.name}</p>
                                                        {helper.isVerified && (
                                                            <span style={{ fontSize: 10, fontWeight: 700, background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', borderRadius: 999, padding: '2px 7px' }}>
                                                                ✓ Verified
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p style={{ fontSize: 11, color: '#64748B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {helper.bio?.slice(0, 58)}...
                                                    </p>
                                                </div>
                                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', marginBottom: 3 }}>
                                                        <Star size={12} color="#F59E0B" fill="#F59E0B" />
                                                        <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{helper.rating}</span>
                                                    </div>
                                                    <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                                                        <MapPin size={10} /> {typeof helper.location === 'string' ? helper.location : (helper.city || 'Nearby')}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => setStep(1)} style={{
                                padding: '14px 20px', borderRadius: 16, cursor: 'pointer',
                                background: '#fff', border: '1.5px solid #E2E8F0',
                                fontSize: 14, fontWeight: 700, color: '#64748B',
                                display: 'flex', alignItems: 'center', gap: 7,
                                fontFamily: 'inherit', transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#F8FAFC'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#fff'; }}
                            >
                                <ArrowLeft size={15} /> Back
                            </button>
                            <button onClick={handleSubmit} disabled={submitting} style={{
                                flex: 1, padding: '14px 20px', borderRadius: 16, cursor: submitting ? 'wait' : 'pointer',
                                background: submitting ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                                border: 'none', color: '#fff',
                                fontSize: 14, fontWeight: 800,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                fontFamily: 'inherit', transition: 'all 0.2s',
                                boxShadow: submitting ? 'none' : '0 6px 20px rgba(99,102,241,0.35)',
                            }}
                                onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(99,102,241,0.45)'; } }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.35)'; }}
                            >
                                {submitting ? (
                                    <><div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTop: '2.5px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Submitting...</>
                                ) : (
                                    <><Send size={16} /> {selectedHelper ? `Request ${selectedHelper.name.split(' ')[0]}` : 'Post Request'}</>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
            `}</style>
        </div>
    );
}

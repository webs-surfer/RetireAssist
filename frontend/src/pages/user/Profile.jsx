import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Eye, EyeOff, Shield, CheckCircle, Edit3,
    X, Save, Phone, MapPin, Calendar, CreditCard,
    Landmark, Building2, FileText, Wallet, Sparkles, Lock
} from 'lucide-react';

/* ── Masked Sensitive Field ──────────────────────────────────── */
function MaskedField({ label, value, icon: Icon, color = '#6366F1' }) {
    const [revealed, setRevealed] = useState(false);
    const timer = useRef(null);
    const toggle = () => {
        if (revealed) { setRevealed(false); clearTimeout(timer.current); }
        else { setRevealed(true); timer.current = setTimeout(() => setRevealed(false), 30000); }
    };
    useEffect(() => () => clearTimeout(timer.current), []);

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', borderRadius: 14,
            background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(226,232,240,0.8)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
            <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: `${color}12`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {Icon ? <Icon size={16} color={color} /> : <Lock size={16} color={color} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', margin: 0, fontFamily: revealed ? "'Inter', sans-serif" : 'monospace', letterSpacing: revealed ? 0 : '0.15em' }}>
                    {revealed ? value : '● ● ● ● ● ●'}
                </p>
            </div>
            <button onClick={toggle} style={{
                width: 32, height: 32, borderRadius: 9, border: 'none', cursor: 'pointer',
                background: 'rgba(226,232,240,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#64748B', transition: 'all 0.2s',
            }}
                onMouseEnter={e => e.currentTarget.style.background = '#EEF2FF'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(226,232,240,0.6)'}
            >
                {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
        </div>
    );
}

/* ── Regular Field ───────────────────────────────────────────── */
function InfoField({ label, value, icon: Icon, color = '#3B82F6' }) {
    if (!value) return null;
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', borderRadius: 14,
            background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(226,232,240,0.8)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
            <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: `${color}12`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {Icon && <Icon size={16} color={color} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', margin: 0 }}>{value}</p>
            </div>
        </div>
    );
}

/* ── Section Card ────────────────────────────────────────────── */
function SectionCard({ title, gradient, icon: Icon, children, action }) {
    return (
        <div style={{
            background: '#fff', borderRadius: 20,
            border: '1px solid rgba(226,232,240,0.8)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            overflow: 'hidden',
        }}>
            <div style={{
                padding: '14px 18px', background: gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Icon size={16} color="#fff" />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{title}</span>
                </div>
                {action}
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {children}
            </div>
        </div>
    );
}

/* ── Edit Input ──────────────────────────────────────────────── */
function EditInput({ label, value, onChange, type = 'text' }) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
            <input
                type={type}
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                style={{
                    width: '100%', padding: '10px 14px', borderRadius: 12,
                    border: '1.5px solid rgba(226,232,240,0.9)',
                    fontSize: 13, fontWeight: 500, color: '#0F172A',
                    outline: 'none', boxSizing: 'border-box',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    background: '#F8FAFC', transition: 'all 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(226,232,240,0.9)'; e.target.style.background = '#F8FAFC'; e.target.style.boxShadow = 'none'; }}
            />
        </div>
    );
}

/* ── Avatar Component ────────────────────────────────────────── */
function Avatar({ user }) {
    const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
    return (
        <div style={{ position: 'relative' }}>
            {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} style={{
                    width: 88, height: 88, borderRadius: 24,
                    objectFit: 'cover',
                    border: '4px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 8px 24px rgba(99,102,241,0.25)',
                }} />
            ) : (
                <div style={{
                    width: 88, height: 88, borderRadius: 24,
                    background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em',
                    border: '4px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
                }}>
                    {initials}
                </div>
            )}
            {/* Online dot */}
            <div style={{
                position: 'absolute', bottom: 4, right: 4,
                width: 14, height: 14, borderRadius: '50%',
                background: '#10B981', border: '2px solid #fff',
                boxShadow: '0 0 6px rgba(16,185,129,0.5)',
            }} />
        </div>
    );
}

/* ── Main Component ──────────────────────────────────────────── */
export default function UserProfile() {
    const { user: authUser } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        api.get('/auth/profile').then(r => {
            setUser(r.data);
            setEditForm({ name: r.data.name || '', phone: r.data.phone || '', city: r.data.city || '', dob: r.data.dob || '' });
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await api.put('/auth/profile', editForm);
            setUser(data.user || data);
            setEditing(false);
            setToast('Profile updated successfully!');
            setTimeout(() => setToast(''), 3500);
        } catch (e) {
            alert(e.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, fontFamily: 'Inter, sans-serif' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', animation: 'pulse 1.5s ease-in-out infinite' }}>
                    <User size={22} color="#fff" />
                </div>
                <p style={{ fontSize: 14, color: '#64748B', fontWeight: 600 }}>Loading profile...</p>
            </div>
        </div>
    );

    if (!user) return <div style={{ padding: 24, color: '#64748B', fontSize: 14 }}>Profile not found.</div>;

    const hasDocData = user.aadhaarNumber || user.panNumber || user.dob
        || user.pensionId || user.bankName || user.bankAccountNumber;

    const completionFields = ['name', 'phone', 'city', 'dob', 'aadhaarNumber', 'panNumber'];
    const completionPct = Math.round((completionFields.filter(f => user[f]).length / completionFields.length) * 100);

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", paddingBottom: 48 }}>

            {/* ── Toast ── */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                        style={{
                            position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
                            background: 'linear-gradient(135deg,#10B981,#059669)',
                            color: '#fff', borderRadius: 14, padding: '12px 20px',
                            display: 'flex', alignItems: 'center', gap: 8,
                            fontSize: 13, fontWeight: 700, zIndex: 100,
                            boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
                        }}>
                        <CheckCircle size={16} /> {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Hero Header Card ── */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                style={{
                    borderRadius: 24, overflow: 'hidden', marginBottom: 20,
                    boxShadow: '0 12px 40px rgba(99,102,241,0.18)',
                    position: 'relative',
                }}
            >
                {/* Background gradient */}
                <div style={{
                    background: 'linear-gradient(135deg,#1E3A8A 0%,#4F46E5 50%,#7C3AED 100%)',
                    padding: '28px 24px 76px', position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', bottom: -20, left: 80, width: 120, height: 120, background: 'rgba(139,92,246,0.15)', borderRadius: '50%' }} />

                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                            <Avatar user={user} />
                            <div style={{ paddingTop: 4 }}>
                                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                                    {user.name}
                                </h1>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 8px', fontWeight: 500 }}>
                                    {user.email}
                                </p>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                                    padding: '4px 12px', borderRadius: 999,
                                    border: '1px solid rgba(255,255,255,0.2)',
                                }}>
                                    <Sparkles size={11} color="#FCD34D" />
                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#FCD34D', textTransform: 'capitalize' }}>
                                        {user.role || 'User'} Account
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Link to="/user/vault" style={{
                            display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none',
                            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.25)', borderRadius: 12,
                            padding: '8px 14px', fontSize: 12, fontWeight: 700, color: '#fff',
                            transition: 'all 0.2s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                        >
                            <Shield size={13} /> Document Vault
                        </Link>
                    </div>
                </div>

                {/* Completion Card — overlapping footer */}
                <div style={{
                    background: '#fff', margin: '0 16px',
                    borderRadius: 18, padding: '16px 20px',
                    marginTop: -52, position: 'relative',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(226,232,240,0.6)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>Profile Completion</p>
                            <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>
                                {completionPct < 100 ? 'Add more info to strengthen your profile' : 'Your profile is complete! 🎉'}
                            </p>
                        </div>
                        <span style={{
                            fontSize: 22, fontWeight: 800, color: completionPct >= 80 ? '#10B981' : completionPct >= 50 ? '#F59E0B' : '#6366F1',
                            letterSpacing: '-0.02em',
                        }}>
                            {completionPct}%
                        </span>
                    </div>
                    <div style={{ height: 7, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${completionPct}%` }}
                            transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
                            style={{
                                height: '100%', borderRadius: 999,
                                background: completionPct >= 80
                                    ? 'linear-gradient(90deg,#10B981,#059669)'
                                    : completionPct >= 50
                                    ? 'linear-gradient(90deg,#F59E0B,#D97706)'
                                    : 'linear-gradient(90deg,#6366F1,#8B5CF6)',
                            }}
                        />
                    </div>
                </div>

                {/* White bottom padding to close the card */}
                <div style={{ background: '#fff', height: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }} />
            </motion.div>

            {/* ── Basic Information ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: 16 }}>
                <SectionCard
                    title="Basic Information"
                    gradient="linear-gradient(135deg,#1E3A8A,#3B82F6)"
                    icon={User}
                    action={
                        !editing ? (
                            <button onClick={() => setEditing(true)} style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
                                fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'inherit',
                            }}>
                                <Edit3 size={12} /> Edit
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => setEditing(false)} style={{
                                    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
                                    fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'inherit',
                                    display: 'flex', alignItems: 'center', gap: 5,
                                }}>
                                    <X size={12} /> Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving} style={{
                                    background: 'rgba(255,255,255,0.9)', border: 'none',
                                    borderRadius: 10, padding: '6px 14px', cursor: saving ? 'wait' : 'pointer',
                                    fontSize: 12, fontWeight: 700, color: '#1E3A8A', fontFamily: 'inherit',
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    opacity: saving ? 0.7 : 1,
                                }}>
                                    <Save size={12} /> {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )
                    }
                >
                    <AnimatePresence mode="wait">
                        {editing ? (
                            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {[
                                    { key: 'name', label: 'Full Name' },
                                    { key: 'phone', label: 'Phone Number' },
                                    { key: 'city', label: 'City' },
                                    { key: 'dob', label: 'Date of Birth', type: 'date' },
                                ].map(f => (
                                    <EditInput key={f.key} label={f.label} type={f.type}
                                        value={editForm[f.key]}
                                        onChange={v => setEditForm(p => ({ ...p, [f.key]: v }))} />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <InfoField label="Full Name"      value={user.name}  icon={User}     color="#3B82F6" />
                                <InfoField label="Phone"          value={user.phone} icon={Phone}    color="#10B981" />
                                <InfoField label="City"           value={user.city}  icon={MapPin}   color="#F59E0B" />
                                <InfoField label="Date of Birth"  value={user.dob}   icon={Calendar} color="#8B5CF6" />
                                {!user.phone && !user.city && !user.dob && (
                                    <p style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500, textAlign: 'center', padding: '8px 0' }}>
                                        Click <strong>Edit</strong> to add more details
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </SectionCard>
            </motion.div>

            {/* ── Document Data ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                {hasDocData ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Identity */}
                        {(user.aadhaarNumber || user.panNumber) && (
                            <SectionCard title="Identity" gradient="linear-gradient(135deg,#7C3AED,#6366F1)" icon={CreditCard}>
                                {user.aadhaarNumber && <MaskedField label="Aadhaar Number" value={user.aadhaarNumber} icon={CreditCard} color="#7C3AED" />}
                                {user.panNumber && <MaskedField label="PAN Number" value={user.panNumber} icon={FileText} color="#6366F1" />}
                            </SectionCard>
                        )}

                        {/* Pension */}
                        {user.isPensioner && (user.pensionId || user.monthlyPension || user.schemeName) && (
                            <SectionCard title="Pension Details" gradient="linear-gradient(135deg,#059669,#10B981)" icon={Wallet}>
                                <InfoField label="Pension ID"      value={user.pensionId}      icon={FileText}   color="#10B981" />
                                <InfoField label="Monthly Pension" value={user.monthlyPension && `₹${user.monthlyPension}`} icon={Wallet} color="#059669" />
                                <InfoField label="Scheme"          value={user.schemeName}     icon={Landmark}  color="#047857" />
                            </SectionCard>
                        )}

                        {/* Bank */}
                        {(user.bankName || user.bankAccountNumber) && (
                            <SectionCard title="Bank Details" gradient="linear-gradient(135deg,#0369A1,#0284C7)" icon={Building2}>
                                <InfoField label="Bank Name"       value={user.bankName}          icon={Building2} color="#0284C7" />
                                <MaskedField label="Account Number" value={user.bankAccountNumber} icon={CreditCard} color="#0369A1" />
                                <InfoField label="IFSC Code"       value={user.ifscCode}          icon={FileText}  color="#0EA5E9" />
                            </SectionCard>
                        )}
                    </div>
                ) : (
                    <SectionCard title="Document Data" gradient="linear-gradient(135deg,#64748B,#475569)" icon={Shield}>
                        <div style={{ textAlign: 'center', padding: '20px 12px' }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
                                background: 'linear-gradient(135deg,#EEF2FF,#E0F2FE)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Shield size={28} color="#6366F1" />
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>
                                No document data yet
                            </h3>
                            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 18px', lineHeight: 1.6 }}>
                                Upload your documents to auto-fill Aadhaar, PAN, pension, and bank details.
                            </p>
                            <Link to="/user/vault" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                                color: '#fff', padding: '10px 22px', borderRadius: 12,
                                fontSize: 13, fontWeight: 700, textDecoration: 'none',
                                boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(99,102,241,0.4)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.35)'; }}
                            >
                                <Shield size={15} /> Go to Document Vault
                            </Link>
                        </div>
                    </SectionCard>
                )}
            </motion.div>
        </div>
    );
}

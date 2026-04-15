import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, User, Mail, Phone, Lock, Users } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import PhotoCapture from '../components/PhotoCapture';

export default function Signup() {
    const { signup, getRoleHome, setUserAndToken, API } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [googleError, setGoogleError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('user');
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });

    const updateForm = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleGoogleSignup = async (credentialResponse) => {
        setGoogleError('');
        try {
            const res = await API.post('/auth/google', { credential: credentialResponse.credential, role: selectedRole });
            const { token, user } = res.data;
            setUserAndToken(user, token);
            if (!user.profilePhoto) {
                navigate('/complete-signup');
            } else {
                navigate(getRoleHome(user.role));
            }
        } catch (err) {
            setGoogleError(err.response?.data?.message || 'Google sign-up failed.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step === 1) {
            if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
            if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
            setError(''); setStep(2); return;
        }
        if (step === 2) {
            setError(''); setStep(3); return;
        }
        // Step 3: submit with photo
        if (!capturedPhoto) { setError('Please capture your photo before signing up'); return; }
        setError(''); setLoading(true);
        try {
            const u = await signup({
                ...form,
                role: selectedRole,
                profilePhoto: capturedPhoto
            });
            navigate(getRoleHome(u.role));
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        } finally { setLoading(false); }
    };

    /* ── Shared inline styles ── */
    const inputStyle = {
        width: '100%', padding: '14px 14px 14px 42px', background: '#f9fafb',
        border: '1.5px solid #e5e7eb', borderRadius: '14px', fontSize: '15px',
        fontWeight: 500, color: '#111827', outline: 'none', transition: 'all 0.2s',
        boxSizing: 'border-box', fontFamily: 'inherit',
    };
    const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' };
    const focusIn = (e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; e.target.style.background = '#fff'; };
    const focusOut = (e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #eef2ff 100%)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 24px', fontFamily: "'Inter', system-ui, sans-serif" }}>
            <div style={{ width: '100%', maxWidth: '1050px', display: 'flex', flexDirection: 'row', borderRadius: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.12)', background: '#fff' }}>

                {/* ── Left Branding Panel ── */}
                <div style={{
                    width: '420px', minWidth: '420px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 30%, #818cf8 60%, #38bdf8 100%)',
                    borderRadius: '24px', padding: '48px 40px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    position: 'relative', overflow: 'hidden', color: '#fff',
                }}>
                    {/* Decorative blobs */}
                    <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: '240px', height: '240px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '240px', height: '240px', background: 'rgba(56,189,248,0.15)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        {/* Logo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
                            <div style={{ width: '52px', height: '52px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                                <Shield size={26} color="#fff" />
                            </div>
                            <span style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>Retire Assist</span>
                        </div>

                        {/* Heading */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ fontSize: '38px', fontWeight: 800, lineHeight: 1.15, marginBottom: '16px' }}
                        >
                            Start your{' '}
                            <span style={{ color: '#bae6fd' }}>journey today</span>
                        </motion.h1>
                        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: '36px', maxWidth: '340px' }}>
                            Join thousands of retirees managing pensions securely with AI-powered assistance.
                        </p>

                        {/* Feature List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {[
                                { icon: '🔐', text: 'Bank-grade encryption' },
                                { icon: '🤖', text: 'AI-guided onboarding' },
                                { icon: '⚡', text: 'Get started in minutes' }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.12 + 0.2 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '14px',
                                        background: 'rgba(255,255,255,0.12)', borderRadius: '16px',
                                        padding: '14px 18px', border: '1px solid rgba(255,255,255,0.1)',
                                        backdropFilter: 'blur(8px)',
                                    }}
                                >
                                    <div style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                                        {item.icon}
                                    </div>
                                    <span style={{ fontWeight: 600, fontSize: '15px', color: 'rgba(255,255,255,0.95)' }}>{item.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Right Form Panel ── */}
                <div style={{ flex: 1, padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                    <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>
                        <div style={{ marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '6px', letterSpacing: '-0.02em' }}>Create Account</h2>
                            <p style={{ color: '#6b7280', fontSize: '15px', fontWeight: 500 }}>
                                Step {step} of 3 — {step === 1 ? 'Your details' : step === 2 ? 'Choose your role' : 'Take your photo'}
                            </p>
                        </div>

                        {/* Step Progress Bar */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
                            {[1, 2, 3].map(s => (
                                <div key={s} style={{
                                    flex: 1, height: '5px', borderRadius: '999px',
                                    background: step >= s ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : '#e5e7eb',
                                    transition: 'background 0.4s ease',
                                }} />
                            ))}
                        </div>

                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{ marginBottom: '20px', padding: '14px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '14px', color: '#b91c1c', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}
                            >
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                            {/* ── Step 1: Personal Details ── */}
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>Full Name</label>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}><User size={18} /></div>
                                            <input required value={form.name} onChange={e => updateForm('name', e.target.value)}
                                                placeholder="Your full name" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Email</label>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}><Mail size={18} /></div>
                                            <input required type="email" value={form.email} onChange={e => updateForm('email', e.target.value)}
                                                placeholder="email@example.com" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Phone</label>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}><Phone size={18} /></div>
                                            <input type="tel" value={form.phone} onChange={e => updateForm('phone', e.target.value)}
                                                placeholder="+91 98765 43210" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={labelStyle}>Password</label>
                                            <div style={{ position: 'relative' }}>
                                                <div style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}><Lock size={18} /></div>
                                                <input required type="password" value={form.password} onChange={e => updateForm('password', e.target.value)}
                                                    placeholder="Min 6 chars" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Confirm</label>
                                            <div style={{ position: 'relative' }}>
                                                <div style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}><Lock size={18} /></div>
                                                <input required type="password" value={form.confirmPassword} onChange={e => updateForm('confirmPassword', e.target.value)}
                                                    placeholder="Re-enter" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── Step 2: Role Selection ── */}
                            {step === 2 && (
                                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                    <div>
                                        <label style={{ ...labelStyle, marginBottom: '12px', fontSize: '14px' }}>I am signing up as a...</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            {[
                                                { value: 'user', label: '👤 Service User', desc: 'I need help with pension' },
                                                { value: 'helper', label: '🤝 Helper', desc: 'I want to assist others' },
                                            ].map(r => (
                                                <button
                                                    key={r.value}
                                                    type="button"
                                                    onClick={() => setSelectedRole(r.value)}
                                                    style={{
                                                        padding: '20px 18px', borderRadius: '16px', textAlign: 'left', cursor: 'pointer',
                                                        transition: 'all 0.2s', fontFamily: 'inherit',
                                                        border: selectedRole === r.value ? '2px solid #4f46e5' : '2px solid #e5e7eb',
                                                        background: selectedRole === r.value ? '#eef2ff' : '#fff',
                                                        boxShadow: selectedRole === r.value ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
                                                    }}
                                                >
                                                    <p style={{ fontWeight: 700, fontSize: '15px', color: '#111827', marginBottom: '4px' }}>{r.label}</p>
                                                    <p style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>{r.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => { setStep(1); setError(''); }} style={{
                                        background: 'none', border: 'none', color: '#6366f1', fontWeight: 700, fontSize: '14px',
                                        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', padding: '4px 0',
                                    }}>
                                        ← Back to details
                                    </button>
                                </motion.div>
                            )}

                            {/* ── Step 3: Photo Capture ── */}
                            {step === 3 && (
                                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>Take Your Photo</h3>
                                        <p style={{ fontSize: '13px', color: '#6b7280' }}>This helps verified helpers identify you during appointments</p>
                                    </div>
                                    <PhotoCapture onCapture={setCapturedPhoto} capturedPhoto={capturedPhoto} />
                                    <button type="button" onClick={() => { setStep(2); setError(''); }} style={{
                                        background: 'none', border: 'none', color: '#6366f1', fontWeight: 700, fontSize: '14px',
                                        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', padding: '4px 0',
                                    }}>
                                        ← Back to role selection
                                    </button>
                                </motion.div>
                            )}

                            {/* Submit / Continue Button */}
                            <button
                                type="submit"
                                disabled={loading || (step === 3 && !capturedPhoto)}
                                style={{
                                    width: '100%', padding: '14px',
                                    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                                    color: '#fff', border: 'none', borderRadius: '14px',
                                    fontSize: '16px', fontWeight: 700,
                                    cursor: (loading || (step === 3 && !capturedPhoto)) ? 'not-allowed' : 'pointer',
                                    opacity: (loading || (step === 3 && !capturedPhoto)) ? 0.6 : 1,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
                                    transition: 'all 0.2s', fontFamily: 'inherit',
                                }}
                            >
                                {loading ? (
                                    <>
                                        <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                        Creating Account...
                                    </>
                                ) : step < 3 ? (
                                    <>Continue <ArrowRight size={20} /></>
                                ) : (
                                    <>Create Account 🚀</>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', margin: '28px 0 20px', gap: '16px' }}>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>or sign up with Google</span>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                        </div>

                        {/* Google Sign-Up Role Selector */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>
                                <Users size={12} /> Sign up as
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                {[
                                    { value: 'user', label: '👤 Service User' },
                                    { value: 'helper', label: '🤝 Helper' },
                                ].map(r => (
                                    <button key={r.value} type="button" onClick={() => setSelectedRole(r.value)} style={{
                                        padding: '8px 12px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                                        cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
                                        border: selectedRole === r.value ? '2px solid #4f46e5' : '2px solid #e5e7eb',
                                        background: selectedRole === r.value ? '#eef2ff' : '#fff',
                                        color: selectedRole === r.value ? '#4f46e5' : '#6b7280',
                                    }}>
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                            {googleError && (
                                <div style={{ marginBottom: '8px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#b91c1c', fontSize: '13px', fontWeight: 600 }}>
                                    {googleError}
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <GoogleLogin
                                    onSuccess={handleGoogleSignup}
                                    onError={() => setGoogleError('Google sign-up failed. Check your VITE_GOOGLE_CLIENT_ID.')}
                                    theme="outline"
                                    shape="rectangular"
                                    width="100%"
                                    text="signup_with"
                                />
                            </div>
                        </div>

                        {/* Bottom Link */}
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>
                                Already have an account?{' '}
                                <Link to="/login" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Keyframe for spinner */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

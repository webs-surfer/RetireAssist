import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Shield, CheckCircle, Eye, EyeOff, Phone, RotateCcw, Users } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const TAB = { EMAIL: 'email', PHONE: 'phone' };

export default function Login() {
    const { login, API, getRoleHome, setUserAndToken } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState(TAB.EMAIL);
    const [form, setForm] = useState({ email: '', password: '' });
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpDemoMsg, setOtpDemoMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState('user');

    // Email/Password login
    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const user = await login(form.email, form.password);
            navigate(getRoleHome(user.role));
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally { setLoading(false); }
    };

    // Google OAuth login
    const handleGoogleSuccess = async (credentialResponse) => {
        setError(''); setLoading(true);
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
            setError(err.response?.data?.message || 'Google login failed.');
        } finally { setLoading(false); }
    };

    // Phone OTP: send
    const handleSendOtp = async () => {
        if (!phone || phone.length < 10) { setError('Enter a valid 10-digit phone number'); return; }
        setError(''); setLoading(true);
        try {
            const res = await API.post('/auth/send-otp', { phone: `+91${phone.replace(/\D/g, '')}` });
            setOtpSent(true);
            if (res.data.demo) setOtpDemoMsg('📱 Demo mode: OTP printed in your backend terminal.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP.');
        } finally { setLoading(false); }
    };

    // Phone OTP: verify
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) { setError('Enter the 6-digit OTP'); return; }
        setError(''); setLoading(true);
        try {
            const res = await API.post('/auth/verify-otp', { phone: `+91${phone.replace(/\D/g, '')}`, otp });
            const { token, user } = res.data;
            setUserAndToken(user, token);
            navigate(getRoleHome(user.role));
        } catch (err) {
            setError(err.response?.data?.message || 'OTP verification failed.');
        } finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #eef2ff 100%)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 24px', fontFamily: "'Inter', system-ui, sans-serif" }}>
            <div style={{ width: '100%', maxWidth: '1050px', display: 'flex', flexDirection: 'row', borderRadius: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.12)', overflow: 'hidden', background: '#fff' }}>

                {/* ── Left Branding Panel ── */}
                <div style={{
                    width: '440px',
                    minWidth: '440px',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 30%, #818cf8 60%, #38bdf8 100%)',
                    borderRadius: '24px',
                    padding: '48px 40px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    color: '#fff',
                    flexShrink: 0,
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
                            style={{ fontSize: '40px', fontWeight: 800, lineHeight: 1.15, marginBottom: '16px' }}
                        >
                            Secure your{' '}
                            <span style={{ color: '#bae6fd' }}>digital legacy</span>
                        </motion.h1>
                        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: '36px', maxWidth: '340px' }}>
                            Your trusted partner for modern, secure, and intelligent pension management.
                        </p>

                        {/* Feature List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {[
                                { icon: '🤖', text: 'AI-Powered Assistance' },
                                { icon: '🔒', text: 'AES-256-GCM Document Vault' },
                                { icon: '✅', text: 'Verified Helpers Network' }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.12 + 0.2 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        background: 'rgba(255,255,255,0.12)',
                                        borderRadius: '16px',
                                        padding: '14px 18px',
                                        border: '1px solid rgba(255,255,255,0.1)',
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
                    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>

                        <div style={{ marginBottom: '28px' }}>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '6px', letterSpacing: '-0.02em' }}>Welcome Back</h2>
                            <p style={{ color: '#6b7280', fontSize: '15px', fontWeight: 500 }}>Log in to your account to continue</p>
                        </div>

                        {/* Tab Switcher */}
                        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '16px', padding: '4px', marginBottom: '24px', position: 'relative' }}>
                            <button
                                onClick={() => { setTab(TAB.EMAIL); setError(''); }}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '12px 16px',
                                    borderRadius: '14px',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    border: 'none',
                                    transition: 'all 0.25s ease',
                                    position: 'relative',
                                    zIndex: 2,
                                    color: tab === TAB.EMAIL ? '#4338ca' : '#6b7280',
                                    background: tab === TAB.EMAIL ? '#fff' : 'transparent',
                                    boxShadow: tab === TAB.EMAIL ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                                }}
                            >
                                <Mail size={16} /> Email
                            </button>
                            <button
                                onClick={() => { setTab(TAB.PHONE); setError(''); }}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '12px 16px',
                                    borderRadius: '14px',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    border: 'none',
                                    transition: 'all 0.25s ease',
                                    position: 'relative',
                                    zIndex: 2,
                                    color: tab === TAB.PHONE ? '#4338ca' : '#6b7280',
                                    background: tab === TAB.PHONE ? '#fff' : 'transparent',
                                    boxShadow: tab === TAB.PHONE ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                                }}
                            >
                                <Phone size={16} /> Phone
                            </button>
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

                        {/* ── Email / Password ── */}
                        {tab === TAB.EMAIL && (
                            <motion.form
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.25 }}
                                onSubmit={handleEmailLogin}
                                style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
                            >
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            id="login-email"
                                            type="email"
                                            style={{ width: '100%', padding: '14px 14px 14px 42px', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '14px', fontSize: '15px', fontWeight: 500, color: '#111827', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                                            placeholder="Enter your email"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; e.target.style.background = '#fff'; }}
                                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            id="login-password"
                                            type={showPassword ? 'text' : 'password'}
                                            style={{ width: '100%', padding: '14px 48px 14px 42px', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '14px', fontSize: '15px', fontWeight: 500, color: '#111827', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                                            placeholder="Enter your password"
                                            value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; e.target.style.background = '#fff'; }}
                                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ position: 'absolute', top: '50%', right: '14px', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    id="login-submit"
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '14px',
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.7 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
                                        transition: 'all 0.2s',
                                        marginTop: '4px',
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            Sign In <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        )}

                        {/* ── Phone OTP ── */}
                        {tab === TAB.PHONE && (
                            <motion.form
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.25 }}
                                onSubmit={handleVerifyOtp}
                                style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
                            >
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>Mobile Number</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', background: '#f3f4f6', border: '1.5px solid #e5e7eb', borderRadius: '14px', fontWeight: 700, color: '#4b5563', fontSize: '15px', flexShrink: 0, userSelect: 'none' }}>+91</div>
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <div style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
                                                <Phone size={18} />
                                            </div>
                                            <input
                                                id="otp-phone"
                                                type="tel"
                                                style={{ width: '100%', padding: '14px 14px 14px 42px', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '14px', fontSize: '15px', fontWeight: 500, color: '#111827', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                                                placeholder="10-digit number"
                                                value={phone}
                                                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                maxLength={10}
                                                disabled={otpSent}
                                                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; e.target.style.background = '#fff'; }}
                                                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {!otpSent ? (
                                    <button
                                        type="button"
                                        id="send-otp-btn"
                                        onClick={handleSendOtp}
                                        disabled={loading || phone.length < 10}
                                        style={{
                                            width: '100%', padding: '14px', background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 700,
                                            cursor: (loading || phone.length < 10) ? 'not-allowed' : 'pointer',
                                            opacity: (loading || phone.length < 10) ? 0.6 : 1,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            boxShadow: '0 4px 14px rgba(5,150,105,0.3)', transition: 'all 0.2s',
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                                Sending...
                                            </>
                                        ) : (
                                            <>Send OTP <ArrowRight size={20} /></>
                                        )}
                                    </button>
                                ) : (
                                    <>
                                        {otpDemoMsg && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                style={{ padding: '14px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', color: '#92400e', fontSize: '14px', fontWeight: 600 }}
                                            >
                                                {otpDemoMsg}
                                            </motion.div>
                                        )}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>Enter 6-digit OTP</label>
                                                <button
                                                    type="button"
                                                    onClick={() => { setOtpSent(false); setOtp(''); setOtpDemoMsg(''); }}
                                                    style={{ fontSize: '12px', fontWeight: 700, color: '#4f46e5', background: '#eef2ff', border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                >
                                                    <RotateCcw size={12} /> Resend
                                                </button>
                                            </div>
                                            <input
                                                id="otp-input"
                                                type="text"
                                                style={{ width: '100%', padding: '16px', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '14px', fontSize: '28px', fontWeight: 800, color: '#111827', textAlign: 'center', letterSpacing: '0.4em', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                                                placeholder="000000"
                                                maxLength={6}
                                                value={otp}
                                                onChange={e => setOtp(e.target.value.replace(/\D/, '').slice(0, 6))}
                                                autoComplete="one-time-code"
                                                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; e.target.style.background = '#fff'; }}
                                                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
                                            />
                                        </div>
                                        <button
                                            id="verify-otp-btn"
                                            type="submit"
                                            disabled={loading || otp.length !== 6}
                                            style={{
                                                width: '100%', padding: '14px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 700,
                                                cursor: (loading || otp.length !== 6) ? 'not-allowed' : 'pointer',
                                                opacity: (loading || otp.length !== 6) ? 0.6 : 1,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                boxShadow: '0 4px 14px rgba(79,70,229,0.35)', transition: 'all 0.2s',
                                            }}
                                        >
                                            {loading ? (
                                                <>
                                                    <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                                    Verifying...
                                                </>
                                            ) : (
                                                <>Verify & Sign In <CheckCircle size={20} /></>
                                            )}
                                        </button>
                                    </>
                                )}
                            </motion.form>
                        )}

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', margin: '28px 0', gap: '16px' }}>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>or</span>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                        </div>

                        {/* Role Selector for Google Login */}
                        <div style={{ marginBottom: 16 }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Users size={11} /> Sign in as
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                {[
                                    { role: 'user',   label: 'Service User', emoji: '👤', color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE' },
                                    { role: 'helper', label: 'Helper',       emoji: '🤝', color: '#059669', bg: '#ECFDF5', border: '#6EE7B7' },
                                ].map(opt => (
                                    <button
                                        key={opt.role}
                                        type="button"
                                        onClick={() => setSelectedRole(opt.role)}
                                        style={{
                                            padding: '11px 14px', borderRadius: 14,
                                            border: `2px solid ${selectedRole === opt.role ? opt.border : '#E5E7EB'}`,
                                            background: selectedRole === opt.role ? opt.bg : '#fff',
                                            cursor: 'pointer', transition: 'all 0.2s',
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            fontSize: 13, fontWeight: 700,
                                            color: selectedRole === opt.role ? opt.color : '#6B7280',
                                            boxShadow: selectedRole === opt.role ? `0 0 0 3px ${opt.color}15` : 'none',
                                            fontFamily: 'inherit',
                                        }}
                                        onMouseEnter={e => { if (selectedRole !== opt.role) { e.currentTarget.style.borderColor = opt.border; e.currentTarget.style.background = opt.bg + '60'; } }}
                                        onMouseLeave={e => { if (selectedRole !== opt.role) { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#fff'; } }}
                                    >
                                        <span style={{ fontSize: 18 }}>{opt.emoji}</span>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Google Login */}
                        <div style={{
                            background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: 16,
                            padding: '14px 16px', display: 'flex', justifyContent: 'center',
                            transition: 'all 0.2s',
                        }}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google login failed.')}
                                theme="outline"
                                size="large"
                                text="continue_with"
                                shape="pill"
                                width="100%"
                            />
                        </div>

                        {/* Sign up link */}
                        <div style={{ textAlign: 'center', marginTop: '32px' }}>
                            <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>
                                Don't have an account yet?{' '}
                                <Link to="/signup" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>
                                    Create Account
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

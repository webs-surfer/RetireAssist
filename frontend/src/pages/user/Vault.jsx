import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import ManualEntryForm from '../../components/ManualEntryForm';
import DocumentScanUpload from '../../components/DocumentScanUpload';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Plus, Lock, Unlock, FileText, Trash2,
    Download, ArrowLeft, X, Eye, EyeOff, CheckCircle,
    AlertCircle, Sparkles, FolderOpen
} from 'lucide-react';
import { deriveKey, encryptFile, decryptBlob } from '../../utils/cryptoVault';

/* ── Config ──────────────────────────────────────────────────── */
const DOC_TYPES = [
    { key: 'aadhaar', label: 'Aadhaar Card',        icon: '🪪', color: '#6366F1', bg: '#EEF2FF' },
    { key: 'pan',     label: 'PAN Card',             icon: '💳', color: '#0284C7', bg: '#E0F2FE' },
    { key: 'pension', label: 'Pension Certificate',  icon: '🏅', color: '#059669', bg: '#ECFDF5', pensionerOnly: true },
    { key: 'bank',    label: 'Bank Details',         icon: '🏦', color: '#D97706', bg: '#FFFBEB' },
    { key: 'photo',   label: 'Photo',                icon: '📷', color: '#7C3AED', bg: '#F5F3FF' },
];

const IDLE_TIMEOUT = 15 * 60 * 1000;

/* ── Password Strength ───────────────────────────────────────── */
function getStrength(pwd) {
    if (!pwd) return { score: 0, label: '', color: '#E2E8F0' };
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    if (s <= 1) return { score: 25, label: 'Weak', color: '#EF4444' };
    if (s === 2) return { score: 50, label: 'Fair', color: '#F59E0B' };
    if (s === 3) return { score: 75, label: 'Good', color: '#10B981' };
    return { score: 100, label: 'Strong 💪', color: '#059669' };
}

/* ── Password Input ──────────────────────────────────────────── */
function PasswordInput({ label, value, onChange, placeholder, onKeyDown }) {
    const [show, setShow] = useState(false);
    return (
        <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    onKeyDown={onKeyDown}
                    style={{
                        width: '100%', padding: '13px 44px 13px 16px', borderRadius: 14,
                        border: '1.5px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)',
                        fontSize: 14, fontWeight: 500, color: '#fff', outline: 'none',
                        boxSizing: 'border-box', transition: 'all 0.2s',
                        fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(167,139,250,0.7)'; e.target.style.background = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = '0 0 0 3px rgba(167,139,250,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
                <button onClick={() => setShow(p => !p)} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center',
                }}>
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </div>
    );
}

/* ── Main Component ──────────────────────────────────────────── */
export default function Vault() {
    const { user } = useAuth();
    const [unlocked, setUnlocked] = useState(false);
    const [vaultKey, setVaultKey] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isNewVault, setIsNewVault] = useState(null);
    const idleTimer = useRef(null);

    const [showAddFlow, setShowAddFlow] = useState(false);
    const [selectedDocType, setSelectedDocType] = useState(null);
    const [uploadMode, setUploadMode] = useState(null);

    const resetIdle = useCallback(() => {
        if (idleTimer.current) clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => {
            setUnlocked(false); setVaultKey(null); setPassword(''); setDocs([]);
        }, IDLE_TIMEOUT);
    }, []);

    useEffect(() => {
        if (unlocked) {
            resetIdle();
            const events = ['mousemove', 'keypress', 'click', 'scroll'];
            events.forEach(e => window.addEventListener(e, resetIdle));
            return () => { events.forEach(e => window.removeEventListener(e, resetIdle)); clearTimeout(idleTimer.current); };
        }
    }, [unlocked, resetIdle]);

    useEffect(() => {
        api.get('/auth/profile').then(r => setIsNewVault(!r.data.vaultSetup)).catch(() => setIsNewVault(true));
    }, []);

    const handleUnlock = async () => {
        if (!password || password.length < 4) { setError('Password must be at least 4 characters'); return; }
        if (isNewVault && password !== confirmPassword) { setError('Passwords do not match'); return; }
        setLoading(true); setError('');
        try {
            const key = await deriveKey(password, 'retireassist-vault');
            setVaultKey(key);
            if (isNewVault) { await api.put('/auth/profile', { vaultSetup: true }); setIsNewVault(false); }
            setUnlocked(true);
            const { data } = await api.get('/documents');
            setDocs(data || []);
        } catch { setError('Failed to unlock vault. Wrong password?'); }
        finally { setLoading(false); }
    };

    const handleLock = () => {
        setUnlocked(false); setVaultKey(null); setPassword('');
        setDocs([]); setShowAddFlow(false); setSelectedDocType(null); setUploadMode(null);
    };

    const handleDeleteDoc = async (docId) => {
        if (!window.confirm('Delete this encrypted document?')) return;
        try { await api.delete(`/documents/${docId}`); setDocs(p => p.filter(d => d._id !== docId)); }
        catch { alert('Delete failed'); }
    };

    const handleDownloadDoc = async (doc) => {
        try {
            const { data } = await api.get(`/documents/${doc._id}/blob`);
            const encryptedBlob = Uint8Array.from(atob(data.encryptedBlob), c => c.charCodeAt(0));
            const decrypted = await decryptBlob(encryptedBlob, data.iv, vaultKey);
            const blob = new Blob([decrypted], { type: data.fileType || 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = data.originalName || 'document'; a.click();
            URL.revokeObjectURL(url);
        } catch { alert('Decrypt / download failed'); }
    };

    const handleSaveToProfile = () => { setShowAddFlow(false); setSelectedDocType(null); setUploadMode(null); };
    const handleExtracted = () => { setShowAddFlow(false); setSelectedDocType(null); setUploadMode(null); };
    const filteredDocTypes = DOC_TYPES.filter(d => !d.pensionerOnly || user?.isPensioner);
    const strength = getStrength(password);

    /* ── LOCKED SCREEN ── */
    if (!unlocked) {
        return (
            <div style={{
                minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Inter', system-ui, sans-serif", padding: '24px',
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    style={{ width: '100%', maxWidth: 440 }}
                >
                    {/* Dark Card */}
                    <div style={{
                        background: 'linear-gradient(160deg,#0F172A 0%,#1E1B4B 50%,#0F172A 100%)',
                        borderRadius: 28, overflow: 'hidden',
                        boxShadow: '0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(167,139,250,0.15)',
                    }}>
                        {/* Top section */}
                        <div style={{ padding: '40px 36px 32px', position: 'relative', overflow: 'hidden' }}>
                            {/* Glow orbs */}
                            <div style={{ position: 'absolute', top: -60, left: -40, width: 200, height: 200, background: 'radial-gradient(circle,rgba(99,102,241,0.2),transparent 70%)', pointerEvents: 'none' }} />
                            <div style={{ position: 'absolute', bottom: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle,rgba(139,92,246,0.15),transparent 70%)', pointerEvents: 'none' }} />

                            {/* Shield Icon */}
                            <div style={{ textAlign: 'center', marginBottom: 24, position: 'relative' }}>
                                <div style={{
                                    width: 80, height: 80, borderRadius: 26,
                                    background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 16px',
                                    boxShadow: '0 12px 40px rgba(99,102,241,0.5), 0 0 0 8px rgba(99,102,241,0.1)',
                                    animation: 'shield-pulse 2.5s ease-in-out infinite',
                                }}>
                                    <Shield size={38} color="#fff" />
                                </div>
                                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                                    {isNewVault ? 'Create Your Vault' : 'Encrypted Vault'}
                                </h1>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>
                                    {isNewVault === null ? 'Loading...' : isNewVault
                                        ? 'Set a secure password. Your documents are encrypted locally — we never see them.'
                                        : 'Enter your vault password to access your encrypted documents.'}
                                </p>
                            </div>

                            {/* Security badges */}
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
                                {['AES-256', 'Local Only', 'Zero-Knowledge'].map(b => (
                                    <div key={b} style={{
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
                                        borderRadius: 999, padding: '4px 10px',
                                        fontSize: 10, fontWeight: 700, color: '#A5B4FC',
                                    }}>
                                        <CheckCircle size={9} /> {b}
                                    </div>
                                ))}
                            </div>

                            {/* Form */}
                            {isNewVault !== null && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {isNewVault && (
                                        <div style={{
                                            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                                            borderRadius: 14, padding: '12px 14px',
                                            display: 'flex', alignItems: 'flex-start', gap: 10,
                                        }}>
                                            <Sparkles size={14} color="#A5B4FC" style={{ flexShrink: 0, marginTop: 1 }} />
                                            <p style={{ fontSize: 12, color: '#A5B4FC', margin: 0, lineHeight: 1.55 }}>
                                                <strong style={{ color: '#C4B5FD' }}>First Time Setup</strong> — Choose a strong password. We never store it, so there's no recovery option.
                                            </p>
                                        </div>
                                    )}

                                    <PasswordInput
                                        label={isNewVault ? 'Create Password' : 'Vault Password'}
                                        value={password}
                                        onChange={e => { setPassword(e.target.value); setError(''); }}
                                        placeholder={isNewVault ? 'Create a strong password' : 'Enter vault password'}
                                        onKeyDown={e => e.key === 'Enter' && !isNewVault && handleUnlock()}
                                    />

                                    {/* Strength meter */}
                                    {isNewVault && password && (
                                        <div>
                                            <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden', marginBottom: 4 }}>
                                                <motion.div
                                                    animate={{ width: `${strength.score}%` }}
                                                    transition={{ duration: 0.3 }}
                                                    style={{ height: '100%', background: strength.color, borderRadius: 999 }}
                                                />
                                            </div>
                                            <p style={{ fontSize: 11, fontWeight: 700, color: strength.color, textAlign: 'right', margin: 0 }}>{strength.label}</p>
                                        </div>
                                    )}

                                    {isNewVault && (
                                        <PasswordInput
                                            label="Confirm Password"
                                            value={confirmPassword}
                                            onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                                            placeholder="Confirm your password"
                                            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                                        />
                                    )}

                                    {/* Match indicator */}
                                    {isNewVault && confirmPassword && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
                                            {password === confirmPassword
                                                ? <><CheckCircle size={13} color="#10B981" /><span style={{ color: '#34D399' }}>Passwords match</span></>
                                                : <><AlertCircle size={13} color="#F87171" /><span style={{ color: '#F87171' }}>Passwords don't match</span></>
                                            }
                                        </div>
                                    )}

                                    {error && (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                                            borderRadius: 12, padding: '10px 14px',
                                            fontSize: 13, fontWeight: 600, color: '#F87171',
                                        }}>
                                            <AlertCircle size={14} /> {error}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleUnlock}
                                        disabled={loading}
                                        style={{
                                            width: '100%', padding: '14px', borderRadius: 14,
                                            background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                                            border: 'none', cursor: loading ? 'wait' : 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                            fontSize: 15, fontWeight: 800, color: '#fff',
                                            boxShadow: loading ? 'none' : '0 6px 20px rgba(99,102,241,0.4)',
                                            transition: 'all 0.2s', fontFamily: 'inherit',
                                        }}
                                        onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(99,102,241,0.5)'; } }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.4)'; }}
                                    >
                                        {loading ? (
                                            <><div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTop: '2.5px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Processing...</>
                                        ) : (
                                            <>{isNewVault ? <><Unlock size={17} /> Create Vault</> : <><Unlock size={17} /> Unlock Vault</>}</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '12px 36px 20px', borderTop: '1px solid rgba(255,255,255,0.06)',
                            textAlign: 'center',
                        }}>
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0, fontWeight: 600 }}>
                                🔒 Auto-locks after 15 minutes of inactivity
                            </p>
                        </div>
                    </div>
                </motion.div>

                <style>{`
                    @keyframes shield-pulse {
                        0%,100% { box-shadow: 0 12px 40px rgba(99,102,241,0.5), 0 0 0 8px rgba(99,102,241,0.1); }
                        50% { box-shadow: 0 12px 40px rgba(99,102,241,0.6), 0 0 0 14px rgba(99,102,241,0.06); }
                    }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    /* ── UNLOCKED SCREEN ── */
    const docTypeMap = Object.fromEntries(DOC_TYPES.map(d => [d.key, d]));

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", paddingBottom: 48 }}>

            {/* ── Header ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                style={{
                    background: 'linear-gradient(135deg,#059669 0%,#10B981 60%,#34D399 100%)',
                    borderRadius: 22, padding: '22px 26px', marginBottom: 20, position: 'relative', overflow: 'hidden',
                    boxShadow: '0 12px 40px rgba(16,185,129,0.25)',
                }}
            >
                <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 16, flexShrink: 0,
                            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Unlock size={22} color="#fff" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 3px', letterSpacing: '-0.01em' }}>
                                Vault Unlocked
                            </h1>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: 0, fontWeight: 500 }}>
                                {docs.length} encrypted document{docs.length !== 1 ? 's' : ''} · AES-256 secured
                            </p>
                        </div>
                    </div>
                    <button onClick={handleLock} style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 12, padding: '9px 16px', cursor: 'pointer',
                        fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'inherit',
                        transition: 'all 0.2s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                    >
                        <Lock size={14} /> Lock Vault
                    </button>
                </div>
            </motion.div>

            {/* ── Add Document Flow ── */}
            <AnimatePresence mode="wait">
                {showAddFlow ? (
                    <motion.div key="add-flow"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        style={{
                            background: '#fff', borderRadius: 20, marginBottom: 20,
                            border: '1px solid rgba(226,232,240,0.8)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden',
                        }}
                    >
                        {/* Flow Header */}
                        <div style={{
                            padding: '16px 20px', background: 'linear-gradient(135deg,#1E3A8A,#4F46E5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {(selectedDocType || uploadMode) && (
                                    <button onClick={() => {
                                        if (uploadMode) setUploadMode(null);
                                        else setSelectedDocType(null);
                                    }} style={{
                                        width: 30, height: 30, borderRadius: 9, border: 'none', cursor: 'pointer',
                                        background: 'rgba(255,255,255,0.15)', color: '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <ArrowLeft size={15} />
                                    </button>
                                )}
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                                    {!selectedDocType ? 'Select Document Type'
                                        : !uploadMode ? `${docTypeMap[selectedDocType]?.icon} ${docTypeMap[selectedDocType]?.label}`
                                        : uploadMode === 'manual' ? 'Enter Details Manually' : 'Scan / Upload Document'}
                                </span>
                            </div>
                            <button onClick={() => { setShowAddFlow(false); setSelectedDocType(null); setUploadMode(null); }} style={{
                                width: 30, height: 30, borderRadius: 9, border: 'none', cursor: 'pointer',
                                background: 'rgba(255,255,255,0.15)', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <X size={15} />
                            </button>
                        </div>

                        <div style={{ padding: '20px' }}>
                            {/* Step 1: Pick doc type */}
                            {!selectedDocType && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12 }}>
                                    {filteredDocTypes.map(dt => (
                                        <button key={dt.key} onClick={() => setSelectedDocType(dt.key)} style={{
                                            padding: '18px 14px', borderRadius: 16, cursor: 'pointer',
                                            background: dt.bg, border: `1.5px solid ${dt.color}20`,
                                            textAlign: 'center', transition: 'all 0.2s', fontFamily: 'inherit',
                                        }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = dt.color + '60'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${dt.color}18`; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = dt.color + '20'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                        >
                                            <div style={{ fontSize: 32, marginBottom: 8 }}>{dt.icon}</div>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{dt.label}</p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Step 2: Upload mode */}
                            {selectedDocType && !uploadMode && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    {[
                                        { key: 'manual', icon: '✏️', title: 'Enter Manually', desc: 'Type in your document details directly', color: '#4F46E5', bg: '#EEF2FF' },
                                        { key: 'scan', icon: '📸', title: 'Scan & Upload', desc: 'Upload a photo or PDF for AI extraction', color: '#7C3AED', bg: '#F5F3FF' },
                                    ].map(opt => (
                                        <button key={opt.key} onClick={() => setUploadMode(opt.key)} style={{
                                            padding: '22px', borderRadius: 16, cursor: 'pointer',
                                            background: opt.bg, border: `1.5px solid ${opt.color}20`,
                                            textAlign: 'center', transition: 'all 0.2s', fontFamily: 'inherit',
                                        }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = opt.color + '50'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${opt.color}15`; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = opt.color + '20'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                        >
                                            <div style={{ fontSize: 36, marginBottom: 10 }}>{opt.icon}</div>
                                            <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>{opt.title}</p>
                                            <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{opt.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Step 3: Forms */}
                            {selectedDocType && uploadMode === 'manual' && (
                                <ManualEntryForm docType={selectedDocType} onSave={handleSaveToProfile} />
                            )}
                            {selectedDocType && uploadMode === 'scan' && (
                                <DocumentScanUpload docType={selectedDocType} onExtracted={handleExtracted} onSwitchToManual={() => setUploadMode('manual')} />
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.button
                        key="add-btn"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowAddFlow(true)}
                        whileHover={{ scale: 1.01 }}
                        style={{
                            width: '100%', padding: '16px', borderRadius: 18, cursor: 'pointer',
                            background: 'rgba(99,102,241,0.04)',
                            border: '2px dashed rgba(99,102,241,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            fontSize: 14, fontWeight: 700, color: '#4F46E5',
                            marginBottom: 20, transition: 'all 0.2s', fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
                    >
                        <div style={{
                            width: 30, height: 30, borderRadius: 9, background: 'rgba(99,102,241,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Plus size={16} color="#4F46E5" />
                        </div>
                        Add Document to Vault
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── Document List ── */}
            {docs.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{
                        background: '#fff', borderRadius: 20, padding: '48px 32px', textAlign: 'center',
                        border: '1px solid rgba(226,232,240,0.8)',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    }}
                >
                    <div style={{ width: 72, height: 72, borderRadius: 24, margin: '0 auto 18px', background: 'linear-gradient(135deg,#EEF2FF,#E0F2FE)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FolderOpen size={32} color="#6366F1" />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>Vault is empty</h3>
                    <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>Click "Add Document" above to securely store your documents.</p>
                </motion.div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {docs.map((doc, i) => {
                        const dt = docTypeMap[doc.docType] || { icon: '📄', color: '#64748B', bg: '#F8FAFC' };
                        return (
                            <motion.div
                                key={doc._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                style={{
                                    background: '#fff', borderRadius: 16, padding: '14px 18px',
                                    display: 'flex', alignItems: 'center', gap: 14,
                                    border: '1px solid rgba(226,232,240,0.8)',
                                    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                                    transition: 'box-shadow 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)'}
                            >
                                <div style={{
                                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                                    background: dt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                                    border: `1px solid ${dt.color}20`,
                                }}>
                                    {dt.icon}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {doc.originalName}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: dt.bg, color: dt.color }}>
                                            {dt.icon} {doc.docType}
                                        </span>
                                        <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>
                                            {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                    <button onClick={() => handleDownloadDoc(doc)} title="Decrypt & Download" style={{
                                        width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                                        background: 'rgba(99,102,241,0.08)', color: '#4F46E5',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
                                    >
                                        <Download size={15} />
                                    </button>
                                    <button onClick={() => handleDeleteDoc(doc._id)} title="Delete" style={{
                                        width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                                        background: 'rgba(239,68,68,0.06)', color: '#EF4444',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.14)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

import { useState, useEffect } from 'react';
import { validateAadhaar } from '../utils/verhoeff';
import api from '../utils/api';
import { encryptFile } from '../utils/cryptoVault';
import { CheckCircle, XCircle, X, Save, FileText, AlertCircle } from 'lucide-react';

const DOC_LABELS = { aadhaar: 'Aadhaar Card', pan: 'PAN Card', pension: 'Pension Certificate', bank: 'Bank Details', photo: 'Photo' };
const DOC_ICONS  = { aadhaar: '🪪', pan: '💳', pension: '🏅', bank: '🏦', photo: '📷' };
const DOC_COLORS = { aadhaar: '#4F46E5', pan: '#0284C7', pension: '#059669', bank: '#D97706', photo: '#7C3AED' };

const REQUIRED_FIELDS = {
    aadhaar: ['aadhaarNumber'],
    pan: ['panNumber'],
    pension: ['pensionId', 'monthlyPension'],
    bank: ['bankAccountNumber', 'bankName', 'ifscCode'],
    photo: [],
};

function validateFieldValue(key, value) {
    if (key === 'aadhaarNumber') {
        const r = validateAadhaar(value);
        return r.valid ? null : r.error;
    }
    if (key === 'panNumber') return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value?.toUpperCase()) ? null : 'Format: ABCDE1234F';
    if (key === 'ifscCode')  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value?.toUpperCase()) ? null : 'Format: ABCD0123456';
    return null;
}

const FIELD_LABELS = {
    name: 'Full Name', dob: 'Date of Birth', aadhaarNumber: 'Aadhaar Number',
    panNumber: 'PAN Number', pensionId: 'Pension ID', monthlyPension: 'Monthly Pension (₹)',
    schemeName: 'Scheme Name', bankName: 'Bank Name', accountNumber: 'Account Number',
    bankAccountNumber: 'Account Number', ifscCode: 'IFSC Code',
};

export default function ExtractionConfirmModal({ extractedFields, docType, onConfirm, onCancel, file, vaultKey }) {
    const [fields, setFields] = useState({});
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => { setFields({ ...extractedFields }); }, [extractedFields]);

    const update = (key, val) => {
        setFields(p => ({ ...p, [key]: val }));
        setErrors(p => ({ ...p, [key]: undefined }));
    };

    const handleSave = async () => {
        const newErrors = {};
        (REQUIRED_FIELDS[docType] || []).forEach(k => { if (!fields[k]?.toString().trim()) newErrors[k] = 'Required'; });
        Object.entries(fields).forEach(([k, v]) => {
            if (v && ['aadhaarNumber', 'panNumber', 'ifscCode'].includes(k)) {
                const err = validateFieldValue(k, v);
                if (err) newErrors[k] = err;
            }
        });
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

        setSaving(true);
        try {
            const payload = { ...fields };
            if (payload.panNumber)  payload.panNumber  = payload.panNumber.toUpperCase();
            if (payload.ifscCode)   payload.ifscCode   = payload.ifscCode.toUpperCase();
            if (payload.accountNumber && !payload.bankAccountNumber) {
                payload.bankAccountNumber = payload.accountNumber;
                delete payload.accountNumber;
            }
            await api.put('/auth/profile', payload);

            let newDoc = null;
            if (file && vaultKey) {
                try {
                    const { encryptedBlob, iv } = await encryptFile(file, vaultKey);
                    const fd = new FormData();
                    fd.append('encryptedBlob', new Blob([encryptedBlob]));
                    fd.append('iv', iv);
                    fd.append('fileType', file.type);
                    fd.append('originalName', file.name);
                    fd.append('docType', docType || 'other');
                    const { data } = await api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                    newDoc = data.document;
                } catch (err) { console.error('Vault upload failed:', err); }
            }

            setToast(`Profile updated from ${DOC_LABELS[docType] || 'document'}`);
            setTimeout(() => { setToast(''); onConfirm(payload, newDoc); }, 1200);
        } catch (e) {
            setErrors({ _submit: e.response?.data?.message || 'Save failed' });
        } finally { setSaving(false); }
    };

    const allValid = () => (REQUIRED_FIELDS[docType] || []).every(k => fields[k]?.toString().trim());
    const accentColor = DOC_COLORS[docType] || '#4F46E5';

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(6px)', zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
            fontFamily: "'Inter', system-ui, sans-serif",
            animation: 'fade-in 0.18s ease-out',
        }}>
            <div style={{
                background: '#fff', borderRadius: 24, width: '100%', maxWidth: 440,
                boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(226,232,240,0.6)',
                overflow: 'hidden', animation: 'slide-up 0.22s cubic-bezier(0.16,1,0.3,1)',
            }}>
                {/* ── Gradient Header ── */}
                <div style={{
                    background: `linear-gradient(135deg, #1E3A8A 0%, ${accentColor} 100%)`,
                    padding: '20px 22px', position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: 'rgba(255,255,255,0.07)', borderRadius: '50%', pointerEvents: 'none' }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                                background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
                                border: '1.5px solid rgba(255,255,255,0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                            }}>
                                {DOC_ICONS[docType] || '📄'}
                            </div>
                            <div>
                                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 2px', letterSpacing: '-0.01em' }}>
                                    Review Extracted Data
                                </h3>
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', margin: 0, fontWeight: 500 }}>
                                    {DOC_LABELS[docType] || 'Document'} · Check and correct before saving
                                </p>
                            </div>
                        </div>
                        <button onClick={onCancel} style={{
                            width: 32, height: 32, borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: 'rgba(255,255,255,0.15)', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.15s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* ── Fields ── */}
                <div style={{ padding: '18px 22px 8px', maxHeight: 320, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {Object.entries(fields).map(([k, v]) => {
                            const hasError = !!errors[k];
                            const aadhaarLive = k === 'aadhaarNumber' && v && v.replace(/\s/g, '').length >= 12;
                            const panLive     = k === 'panNumber'     && v && v.length >= 10;
                            const liveErr     = (aadhaarLive || panLive) ? validateFieldValue(k, v) : null;
                            const liveOk      = (aadhaarLive || panLive) && !liveErr;

                            return (
                                <div key={k}>
                                    <label style={{
                                        display: 'block', fontSize: 10, fontWeight: 800,
                                        color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6,
                                    }}>
                                        {FIELD_LABELS[k] || k}
                                    </label>
                                    <input
                                        value={v || ''}
                                        onChange={e => update(k, e.target.value)}
                                        style={{
                                            width: '100%', padding: '11px 14px', borderRadius: 12, boxSizing: 'border-box',
                                            border: `1.5px solid ${hasError ? '#FCA5A5' : liveOk ? '#6EE7B7' : '#E2E8F0'}`,
                                            background: hasError ? '#FFF5F5' : liveOk ? '#ECFDF5' : '#F8FAFC',
                                            fontSize: 14, fontWeight: 600, color: '#0F172A', outline: 'none',
                                            transition: 'all 0.2s', fontFamily: 'inherit',
                                        }}
                                        onFocus={e => { e.target.style.borderColor = accentColor; e.target.style.boxShadow = `0 0 0 3px ${accentColor}18`; e.target.style.background = '#fff'; }}
                                        onBlur={e => {
                                            e.target.style.boxShadow = 'none';
                                            e.target.style.borderColor = hasError ? '#FCA5A5' : liveOk ? '#6EE7B7' : '#E2E8F0';
                                            e.target.style.background  = hasError ? '#FFF5F5'  : liveOk ? '#ECFDF5'  : '#F8FAFC';
                                        }}
                                    />
                                    {/* Live validation */}
                                    {(aadhaarLive || panLive) && (
                                        <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: liveErr ? '#EF4444' : '#059669' }}>
                                            {liveErr ? <XCircle size={12} /> : <CheckCircle size={12} />}
                                            {liveErr || (k === 'aadhaarNumber' ? 'Valid Aadhaar (Verhoeff ✓)' : 'Valid PAN ✓')}
                                        </div>
                                    )}
                                    {hasError && !liveErr && (
                                        <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#EF4444' }}>
                                            <XCircle size={12} /> {errors[k]}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Status banners ── */}
                <div style={{ padding: '6px 22px 0' }}>
                    {errors._submit && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#FFF5F5', border: '1px solid #FCA5A5', borderRadius: 12, marginBottom: 10, fontSize: 13, fontWeight: 600, color: '#EF4444' }}>
                            <AlertCircle size={14} /> {errors._submit}
                        </div>
                    )}
                    {toast && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 12, marginBottom: 10, fontSize: 13, fontWeight: 600, color: '#059669' }}>
                            <CheckCircle size={14} /> {toast}
                        </div>
                    )}
                </div>

                {/* ── Action Buttons ── */}
                <div style={{ padding: '14px 22px 20px', display: 'flex', gap: 10 }}>
                    <button onClick={onCancel} style={{
                        flex: 1, padding: '12px', borderRadius: 14,
                        border: '1.5px solid #E2E8F0', background: '#fff', cursor: 'pointer',
                        fontSize: 13, fontWeight: 700, color: '#64748B', fontFamily: 'inherit', transition: 'all 0.2s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!allValid() || saving}
                        style={{
                            flex: 2, padding: '12px', borderRadius: 14, border: 'none',
                            background: (!allValid() || saving) ? 'rgba(99,102,241,0.4)' : `linear-gradient(135deg, #4F46E5, ${accentColor})`,
                            cursor: (!allValid() || saving) ? 'not-allowed' : 'pointer',
                            color: '#fff', fontSize: 13, fontWeight: 800, fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            boxShadow: (!allValid() || saving) ? 'none' : '0 4px 16px rgba(99,102,241,0.35)',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { if (allValid() && !saving) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.4)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.35)'; }}
                    >
                        {saving ? (
                            <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Saving...</>
                        ) : (
                            <><Save size={14} /> Save to Profile</>
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fade-in  { from{opacity:0} to{opacity:1} }
                @keyframes slide-up { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
                @keyframes spin     { to{transform:rotate(360deg)} }
            `}</style>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { validateAadhaar } from '../utils/verhoeff';
import api from '../utils/api';
import { CheckCircle, XCircle, Save, Upload } from 'lucide-react';

const DOC_LABELS = { aadhaar: 'Aadhaar Card', pan: 'PAN Card', pension: 'Pension Certificate', bank: 'Bank Details', photo: 'Photo' };

const FIELD_DEFS = {
    aadhaar: [
        { key: 'name', label: 'Full Name', type: 'text', required: true },
        { key: 'dob', label: 'Date of Birth', type: 'date', required: true },
        { key: 'aadhaarNumber', label: 'Aadhaar Number', type: 'text', required: true, validate: 'aadhaar' },
    ],
    pan: [
        { key: 'panNumber', label: 'PAN Number', type: 'text', required: true, validate: 'pan' },
        { key: 'name', label: 'Full Name', type: 'text', required: true },
    ],
    pension: [
        { key: 'pensionId', label: 'Pension ID', type: 'text', required: true },
        { key: 'monthlyPension', label: 'Monthly Pension (₹)', type: 'number', required: true },
        { key: 'schemeName', label: 'Scheme Name', type: 'text', required: false },
    ],
    bank: [
        { key: 'bankName', label: 'Bank Name', type: 'text', required: true },
        { key: 'bankAccountNumber', label: 'Account Number', type: 'text', required: true },
        { key: 'ifscCode', label: 'IFSC Code', type: 'text', required: true, validate: 'ifsc' },
    ],
    photo: [],
};

function validateField(key, value, validationType) {
    if (!validationType) return null;
    if (validationType === 'aadhaar') {
        const r = validateAadhaar(value);
        return r.valid ? null : r.error;
    }
    if (validationType === 'pan') {
        return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value?.toUpperCase()) ? null : 'Format: ABCDE1234F';
    }
    if (validationType === 'ifsc') {
        return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value?.toUpperCase()) ? null : 'Format: ABCD0123456';
    }
    return null;
}

export default function ManualEntryForm({ docType, onSave }) {
    const fields = FIELD_DEFS[docType] || [];
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [photoFile, setPhotoFile] = useState(null);

    const update = (key, val) => {
        setForm(p => ({ ...p, [key]: val }));
        setErrors(p => ({ ...p, [key]: undefined }));
    };

    const handleSubmit = async () => {
        // Validate
        const newErrors = {};
        fields.forEach(f => {
            if (f.required && !form[f.key]?.trim()) newErrors[f.key] = 'Required';
            else if (f.validate) {
                const err = validateField(f.key, form[f.key], f.validate);
                if (err) newErrors[f.key] = err;
            }
        });
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

        setSaving(true);
        try {
            // Build payload - uppercase PAN and IFSC
            const payload = { ...form };
            if (payload.panNumber) payload.panNumber = payload.panNumber.toUpperCase();
            if (payload.ifscCode) payload.ifscCode = payload.ifscCode.toUpperCase();

            await api.put('/auth/profile', payload);
            setToast(`${DOC_LABELS[docType]} details saved to your profile.`);
            if (onSave) onSave(payload);
            setTimeout(() => setToast(''), 3000);
        } catch (e) {
            setErrors({ _submit: e.response?.data?.message || 'Save failed' });
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = async () => {
        if (!photoFile) return;
        setSaving(true);
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                await api.put('/auth/profile', { profilePhoto: e.target.result });
                setToast('Photo saved to your profile.');
                if (onSave) onSave({ profilePhoto: e.target.result });
                setTimeout(() => setToast(''), 3000);
                setSaving(false);
            };
            reader.readAsDataURL(photoFile);
        } catch (e) {
            setErrors({ _submit: 'Photo upload failed' });
            setSaving(false);
        }
    };

    // Photo-only flow
    if (docType === 'photo') {
        return (
            <div className="space-y-4">
                <label className="flex flex-col items-center justify-center h-36 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary cursor-pointer transition-colors">
                    <input type="file" accept="image/*" className="hidden" onChange={e => setPhotoFile(e.target.files?.[0])} />
                    {photoFile ? (
                        <div className="flex flex-col items-center gap-2">
                            <CheckCircle size={24} className="text-emerald-500" />
                            <span className="text-sm text-emerald-700 font-medium">{photoFile.name}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <Upload size={24} className="text-gray-300" />
                            <span className="text-sm text-text-muted">Select a photo</span>
                        </div>
                    )}
                </label>
                {toast && <p className="text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">{toast}</p>}
                <button onClick={handlePhotoUpload} disabled={!photoFile || saving} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold cursor-pointer hover:opacity-90 disabled:opacity-50 border-none">
                    {saving ? 'Saving...' : 'Save Photo'}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {fields.map(f => (
                <div key={f.key}>
                    <label className="block text-sm font-medium text-text-dark mb-1">
                        {f.label} {f.required && <span className="text-red-400">*</span>}
                    </label>
                    <input
                        type={f.type}
                        value={form[f.key] || ''}
                        onChange={e => update(f.key, e.target.value)}
                        placeholder={f.label}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors[f.key] ? 'border-red-300 bg-red-50/30' : 'border-border'}`}
                    />
                    {/* Live validation badges */}
                    {f.validate === 'aadhaar' && form[f.key]?.replace(/\s/g, '').length >= 12 && (
                        <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${validateField(f.key, form[f.key], 'aadhaar') ? 'text-red-500' : 'text-emerald-600'}`}>
                            {validateField(f.key, form[f.key], 'aadhaar') ? <XCircle size={12} /> : <CheckCircle size={12} />}
                            {validateField(f.key, form[f.key], 'aadhaar') || 'Valid Aadhaar (Verhoeff ✓)'}
                        </div>
                    )}
                    {f.validate === 'pan' && form[f.key]?.length >= 10 && (
                        <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${validateField(f.key, form[f.key], 'pan') ? 'text-red-500' : 'text-emerald-600'}`}>
                            {validateField(f.key, form[f.key], 'pan') ? <XCircle size={12} /> : <CheckCircle size={12} />}
                            {validateField(f.key, form[f.key], 'pan') || 'Valid PAN ✓'}
                        </div>
                    )}
                    {f.validate === 'ifsc' && form[f.key]?.length >= 11 && (
                        <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${validateField(f.key, form[f.key], 'ifsc') ? 'text-red-500' : 'text-emerald-600'}`}>
                            {validateField(f.key, form[f.key], 'ifsc') ? <XCircle size={12} /> : <CheckCircle size={12} />}
                            {validateField(f.key, form[f.key], 'ifsc') || 'Valid IFSC ✓'}
                        </div>
                    )}
                    {errors[f.key] && !f.validate && <p className="mt-1 text-xs text-red-500">{errors[f.key]}</p>}
                </div>
            ))}

            {errors._submit && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{errors._submit}</p>}
            {toast && <p className="text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg flex items-center gap-1"><CheckCircle size={14} /> {toast}</p>}

            <button onClick={handleSubmit} disabled={saving} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold cursor-pointer hover:opacity-90 disabled:opacity-50 border-none">
                <Save size={15} /> {saving ? 'Saving...' : 'Save to Profile'}
            </button>
        </div>
    );
}

import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Upload, FileText, Scan, CheckCircle, AlertCircle, X } from 'lucide-react';

const DOC_TYPES = [
    { key: 'pension_certificate', label: 'Pension Certificate', icon: '🏅', accept: 'image/*,.pdf' },
    { key: 'aadhaar', label: 'Aadhaar Card', icon: '🪪', accept: 'image/*,.pdf' },
    { key: 'pan', label: 'PAN Card', icon: '💳', accept: 'image/*,.pdf' },
    { key: 'photo', label: 'Profile Photo', icon: '🖼️', accept: 'image/*' }
];

export default function Documents() {
    const { user } = useAuth();
    const [ocrResult, setOcrResult] = useState(null);
    const [ocrLoading, setOcrLoading] = useState(false);
    const [ocrDocType, setOcrDocType] = useState(null);
    const [editedFields, setEditedFields] = useState({});
    const [applying, setApplying] = useState(false);
    const [success, setSuccess] = useState(null);
    const fileRefs = useRef({});

    const handleUploadForOcr = async (file, docType) => {
        setOcrLoading(true);
        setOcrDocType(docType);
        setOcrResult(null);
        try {
            const fd = new FormData();
            fd.append('document', file);
            const { data } = await api.post('/documents/ocr', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setOcrResult(data.fields);
            setEditedFields(
                Object.fromEntries(Object.entries(data.fields).filter(([, v]) => v !== null).map(([k, v]) => [k, String(v)]))
            );
        } catch (e) {
            alert('OCR failed: ' + (e.response?.data?.message || e.message));
        } finally {
            setOcrLoading(false);
        }
    };

    const handleApplyFields = async () => {
        setApplying(true);
        try {
            await api.put('/auth/profile', {
                ...Object.fromEntries(Object.entries(editedFields).filter(([, v]) => v !== ''))
            });
            setSuccess('Profile auto-filled from document!');
            setOcrResult(null);
            setEditedFields({});
            setTimeout(() => setSuccess(null), 3000);
        } catch (e) {
            alert('Profile update failed: ' + (e.response?.data?.message || e.message));
        } finally {
            setApplying(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-text-dark">Documents</h1>
                <p className="text-sm text-text-muted mt-0.5">Upload documents and extract data automatically with AI OCR</p>
            </div>

            {success && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                    <CheckCircle size={16} /> {success}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
                {DOC_TYPES.map(dt => (
                    <div key={dt.key} className="bg-white rounded-2xl border border-border p-4 hover:border-primary/40 transition-colors">
                        <p className="text-2xl mb-2">{dt.icon}</p>
                        <p className="text-sm font-semibold text-text-dark mb-0.5">{dt.label}</p>
                        <p className="text-xs text-text-muted mb-3">Upload to extract data with AI OCR</p>
                        <input
                            type="file"
                            accept={dt.accept}
                            ref={el => fileRefs.current[dt.key] = el}
                            onChange={e => { if (e.target.files[0]) handleUploadForOcr(e.target.files[0], dt.key); }}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileRefs.current[dt.key]?.click()}
                            disabled={ocrLoading}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50 border-none"
                        >
                            {ocrLoading && ocrDocType === dt.key ? <Scan size={13} className="animate-spin" /> : <Upload size={13} />}
                            {ocrLoading && ocrDocType === dt.key ? 'Scanning...' : 'Upload & Scan'}
                        </button>
                    </div>
                ))}
            </div>

            {/* OCR result modal */}
            {ocrResult && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-text-dark">AI Extracted Fields</h3>
                                <p className="text-xs text-text-muted mt-0.5">Review and edit before applying to profile</p>
                            </div>
                            <button onClick={() => setOcrResult(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer bg-transparent border-none">
                                <X size={15} />
                            </button>
                        </div>
                        <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                            {Object.entries(editedFields).map(([k, v]) => (
                                <div key={k}>
                                    <label className="block text-xs font-medium text-text-muted mb-1 capitalize">{k.replace(/([A-Z])/g, ' $1')}</label>
                                    <input
                                        value={v}
                                        onChange={e => setEditedFields(p => ({ ...p, [k]: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    />
                                </div>
                            ))}
                            {Object.keys(editedFields).length === 0 && (
                                <div className="py-6 text-center text-sm text-text-muted">
                                    <AlertCircle size={28} className="mx-auto mb-2 text-gray-300" />
                                    No fields could be extracted. Document may be unclear.
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setOcrResult(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium cursor-pointer bg-white text-text-dark">Discard</button>
                            {Object.keys(editedFields).length > 0 && (
                                <button
                                    onClick={handleApplyFields}
                                    disabled={applying}
                                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold cursor-pointer disabled:opacity-50"
                                >
                                    {applying ? 'Applying...' : 'Apply to Profile'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-5">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🔒</span>
                    <h3 className="font-bold text-indigo-800 text-sm">End-to-End Encrypted Vault</h3>
                </div>
                <p className="text-xs text-indigo-600 mb-3">Your documents are encrypted client-side before upload. Server never sees plaintext.</p>
                <a href="/user/vault" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold no-underline hover:bg-indigo-700 transition-colors">
                    <FileText size={13} /> Open Encrypted Vault
                </a>
            </div>
        </div>
    );
}

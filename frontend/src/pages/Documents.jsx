import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FolderOpen, Upload, Download, Trash2, Eye, Shield, Lock, ScanLine, CheckCircle, Loader } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const docTypeEmoji = {
    'aadhaar': '🪪', 'pan': '💳', 'pension_id': '📋',
    'insurance': '🛡️', 'bank_statement': '🏦', 'life_certificate': '📜'
};

export default function Documents() {
    const { API } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [type, setType] = useState('aadhaar');
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    const fetchDocs = () => {
        API.get('/documents')
            .then(r => setDocuments(r.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchDocs(); }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setScanResult(null);
        setScanning(true);

        const formData = new FormData();
        formData.append('document', file);
        formData.append('documentType', type);

        // Always stop the scan animation after 1.5s (visual feedback cap)
        const scanTimer = setTimeout(() => setScanning(false), 1500);

        try {
            const res = await API.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data?.extractedData) setScanResult(res.data.extractedData);
            // Reset file state + input
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchDocs();
        } catch {
            // silently handle error
        } finally {
            // Always clear timer + reset both states so UI never gets stuck
            clearTimeout(scanTimer);
            setScanning(false);
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        try { await API.delete(`/documents/${id}`); fetchDocs(); } catch {}
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <div>
                    <h1 className="text-2xl font-bold text-text-dark flex items-center gap-2"><FolderOpen size={24} /> Document Vault</h1>
                    <p className="text-sm text-text-light mt-0.5">Securely store and manage your important documents</p>
                </div>
                <span className="trust-badge"><Lock size={12} /> 256-bit Encrypted</span>
            </motion.div>

            {/* Security Banner */}
            <motion.div variants={fadeUp} className="card bg-gradient-to-r from-primary to-secondary text-white mb-5 flex items-center gap-3">
                <Shield size={22} />
                <div>
                    <p className="font-semibold text-sm">Bank-Grade Document Security</p>
                    <p className="text-xs text-blue-100">Your documents are encrypted with 256-bit security and stored in a certified vault.</p>
                </div>
            </motion.div>

            {/* Upload */}
            <motion.div variants={fadeUp} className="card mb-5">
                <h2 className="text-base font-bold text-text-dark mb-4 flex items-center gap-2"><Upload size={18} className="text-primary" /> Upload Document</h2>
                <form onSubmit={handleUpload} className="flex flex-col sm:flex-row items-end gap-3">
                    <div className="flex-1 w-full">
                        <label className="label">Document Type</label>
                        <select className="input" value={type} onChange={e => setType(e.target.value)}>
                            <option value="aadhaar">🪪 Aadhaar Card</option>
                            <option value="pan">💳 PAN Card</option>
                            <option value="pension_id">📋 Pension ID</option>
                            <option value="insurance">🛡️ Insurance Documents</option>
                            <option value="bank_statement">🏦 Bank Statement</option>
                            <option value="life_certificate">📜 Life Certificate</option>
                        </select>
                    </div>
                    <div className="flex-1 w-full">
                        <label className="label">File</label>
                        <div
                            className="border-2 border-dashed border-border rounded-lg p-3 text-center hover:border-primary-light transition-all cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={e => setFile(e.target.files?.[0] || null)}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                            <p className="text-sm font-medium text-text">{file ? file.name : 'Click to select file'}</p>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={uploading || !file}
                        className="btn-primary !px-6 disabled:opacity-50 w-full sm:w-auto"
                    >
                        {uploading ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </form>
            </motion.div>

            {/* OCR Scanner */}
            {scanning && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card mb-5 bg-blue-50 border-blue-100">
                    <div className="flex items-center gap-3">
                        <ScanLine size={20} className="text-primary-light animate-pulse" />
                        <div>
                            <p className="font-semibold text-sm text-primary">Scanning Document...</p>
                            <p className="text-xs text-text-light">Extracting information with OCR</p>
                        </div>
                    </div>
                    <div className="mt-3 space-y-2">
                        {['Scanning Document...', 'Extracting Information...', 'Auto Filling Data...'].map((step, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-text-light">
                                <Loader size={12} className="animate-spin text-primary-light" /> {step}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {scanResult && Object.keys(scanResult).length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card mb-5 border-accent/20 bg-emerald-50">
                    <h3 className="font-bold text-sm text-accent mb-3 flex items-center gap-2"><CheckCircle size={16} /> Extracted Information</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.entries(scanResult).map(([key, value]) => value && (
                            <div key={key} className="p-2 bg-white rounded-lg">
                                <p className="text-[11px] text-text-muted uppercase font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                <p className="text-sm font-semibold text-text-dark">{typeof value === 'object' ? Object.values(value).join(', ') : value}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Documents Grid */}
            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading
                    ? Array(3).fill(0).map((_, i) => <div key={i} className="card animate-pulse h-40 bg-bg" />)
                    : documents.length === 0
                        ? (
                            <div className="col-span-full card text-center py-10">
                                <FolderOpen size={36} className="mx-auto mb-3 text-text-muted" />
                                <h3 className="font-bold text-text-dark">No documents yet</h3>
                                <p className="text-sm text-text-light mt-1">Upload your first document to get started</p>
                            </div>
                        )
                        : documents.map(doc => (
                            <motion.div key={doc._id} variants={fadeUp} className="card group hover:border-primary/20">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-2xl">{docTypeEmoji[doc.type] || '📄'}</span>
                                    <span className={`badge ${doc.status === 'verified' ? 'badge-success' : doc.status === 'processing' ? 'badge-warning' : 'badge-info'}`}>
                                        {doc.status}
                                    </span>
                                </div>
                                <h3 className="font-bold text-sm text-text-dark mb-0.5">
                                    {doc.type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </h3>
                                <p className="text-xs text-text-muted mb-3 truncate">{doc.filename || 'Document'}</p>
                                <div className="flex items-center gap-2">
                                    <button className="btn-ghost !px-2 !py-1 !min-h-0 text-xs"><Eye size={12} /> Preview</button>
                                    <button className="btn-ghost !px-2 !py-1 !min-h-0 text-xs"><Download size={12} /></button>
                                    <button
                                        onClick={() => handleDelete(doc._id)}
                                        className="btn-ghost !px-2 !py-1 !min-h-0 text-xs !text-danger hover:!bg-red-50"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                }
            </motion.div>
        </motion.div>
    );
}

import { useState, useRef } from 'react';
import api from '../utils/api';
import ExtractionConfirmModal from './ExtractionConfirmModal';
import { Upload, Scan, FileText, AlertCircle } from 'lucide-react';

export default function DocumentScanUpload({ docType, onExtracted, onSwitchToManual, vaultKey }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [extractedFields, setExtractedFields] = useState(null);
    const [emptyResult, setEmptyResult] = useState(false);
    const fileRef = useRef(null);

    const handleFileSelect = (f) => {
        setFile(f);
        setEmptyResult(false);
        setExtractedFields(null);
        if (f && f.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target.result);
            reader.readAsDataURL(f);
        } else {
            setPreview(null);
        }
    };

    const handleExtract = async () => {
        if (!file) return;
        setLoading(true);
        setEmptyResult(false);
        try {
            const fd = new FormData();
            fd.append('document', file);
            fd.append('docType', docType);
            const { data } = await api.post('/documents/ocr', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            const fields = data.fields || {};
            if (Object.keys(fields).length === 0) {
                setEmptyResult(true);
            } else {
                setExtractedFields(fields);
            }
        } catch (e) {
            setEmptyResult(true);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = (editedFields, newDoc) => {
        setExtractedFields(null);
        if (onExtracted) onExtracted(editedFields, newDoc);
    };

    return (
        <div className="space-y-4">
            {/* File input */}
            <label
                className={`flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed cursor-pointer hover:border-primary transition-colors ${file ? 'border-emerald-300 bg-emerald-50/30' : 'border-gray-200'}`}
            >
                <input
                    type="file"
                    ref={fileRef}
                    accept="image/*, application/pdf"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
                {preview ? (
                    <img src={preview} alt="Preview" className="max-h-32 rounded-lg object-contain" />
                ) : file ? (
                    <div className="flex flex-col items-center gap-2">
                        <FileText size={28} className="text-emerald-500" />
                        <span className="text-sm text-emerald-700 font-medium truncate max-w-[200px]">{file.name}</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Upload size={28} className="text-gray-300" />
                        <span className="text-sm text-text-muted">Tap to upload document image</span>
                        <span className="text-xs text-text-muted">Accepted: Images, PDF</span>
                    </div>
                )}
            </label>

            {/* Extract button */}
            {file && !extractedFields && !emptyResult && (
                <button
                    onClick={handleExtract}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-bold cursor-pointer hover:opacity-90 disabled:opacity-50 border-none"
                >
                    {loading ? (
                        <><Scan size={15} className="animate-spin" /> Reading your document...</>
                    ) : (
                        <><Scan size={15} /> Extract Data</>
                    )}
                </button>
            )}

            {/* Empty result - OCR failed */}
            {emptyResult && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-amber-800">Could not read this document automatically.</p>
                            <p className="text-xs text-amber-600 mt-1">Please enter your details manually instead.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onSwitchToManual && onSwitchToManual()}
                        className="mt-3 w-full py-2 rounded-xl border border-amber-300 bg-white text-amber-700 text-sm font-semibold cursor-pointer hover:bg-amber-50"
                    >
                        Enter Manually Instead
                    </button>
                </div>
            )}

            {/* Extraction confirm modal */}
            {extractedFields && (
                <ExtractionConfirmModal
                    extractedFields={extractedFields}
                    docType={docType}
                    onConfirm={handleConfirm}
                    onCancel={() => setExtractedFields(null)}
                    file={file}
                    vaultKey={vaultKey}
                />
            )}
        </div>
    );
}

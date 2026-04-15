import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Upload, CheckCircle, Clock, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { generateHelperKeyPair } from '../../utils/cryptoVault';

const STATUS_COLOR = { pending: 'bg-amber-100 text-amber-700', accepted: 'bg-blue-100 text-blue-700', in_progress: 'bg-indigo-100 text-indigo-700', documents_submitted: 'bg-violet-100 text-violet-700', completed: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700' };

export default function Tasks() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});
    const [uploading, setUploading] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(null);

    useEffect(() => {
        // Generate RSA key pair on first login if not set
        const ensureKeyPair = async () => {
            if (!user?.publicKey && user?.role === 'helper') {
                const stored = sessionStorage.getItem('helperPrivateKey');
                if (!stored) {
                    try {
                        const { publicKey, privateKey } = await generateHelperKeyPair();
                        sessionStorage.setItem('helperPrivateKey', JSON.stringify(privateKey));
                        await api.put('/helpers/public-key', { publicKey: JSON.stringify(publicKey) });
                    } catch (e) { console.error('Key pair generation failed:', e); }
                }
            }
        };
        ensureKeyPair();

        api.get('/requests/available?myTasks=true').then(r => setTasks(r.data?.tasks || r.data || [])).catch(() => {}).finally(() => setLoading(false));
    }, [user]);

    const fetchTasks = () => {
        api.get('/requests/available?myTasks=true').then(r => setTasks(r.data?.tasks || r.data || [])).catch(() => {});
    };

    const updateStatus = async (taskId, status, note) => {
        setStatusUpdating(taskId);
        try {
            await api.put(`/tasks/${taskId}/status`, { status, note });
            fetchTasks();
        } catch (e) { alert('Status update failed'); }
        finally { setStatusUpdating(null); }
    };

    const handleDocUpload = async (taskId, file) => {
        setUploading(taskId);
        const fd = new FormData();
        fd.append('finalDocument', file);
        try {
            await api.post(`/tasks/${taskId}/document`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert('Document uploaded successfully!');
            fetchTasks();
        } catch (e) { alert('Upload failed: ' + (e.response?.data?.message || e.message)); }
        finally { setUploading(null); }
    };

    const C = { text: '#0F172A', textLight: '#64748B', border: 'rgba(226,232,240,0.8)', card: '#FFFFFF', blue: '#3B82F6', green: '#10B981', amber: '#F59E0B' };

    if (loading) return (
        <div style={{ padding: '32px', textAlign: 'center', color: C.textLight, fontSize: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(59,130,246,0.2)', borderTopColor: C.blue, margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
            Loading tasks...
        </div>
    );

    return (
        <div style={{ padding: '8px 0 40px' }}>
            {/* Header */}
            <div style={{
                background: C.card, borderRadius: 20, padding: '24px 28px', marginBottom: 24,
                border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8,
                    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)',
                    borderRadius: 999, padding: '4px 12px',
                }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.10em' }}>⚡ My Tasks</span>
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0, lineHeight: 1.2 }}>Task Management</h1>
                <p style={{ fontSize: 13, color: C.textLight, marginTop: 6, fontWeight: 500 }}>
                    {tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you
                </p>
            </div>

            {tasks.length === 0 ? (

                <div className="bg-white rounded-2xl border border-border p-10 text-center">
                    <Clock size={40} className="text-gray-200 mx-auto mb-4" />
                    <p className="font-semibold text-text-dark">No tasks yet</p>
                    <p className="text-sm text-text-muted mt-1">Accept service requests to see them here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tasks.map(t => (
                        <div key={t._id} className="bg-white rounded-2xl border border-border overflow-hidden">
                            <div className="flex items-start justify-between gap-4 p-5">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-text-dark">{t.serviceName || 'Service Task'}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[t.status] || 'bg-gray-100 text-gray-700'}`}>
                                            {t.status?.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs text-text-muted">Client: {t.user?.name}</span>
                                    </div>
                                </div>
                                <button onClick={() => setExpanded(p => ({ ...p, [t._id]: !p[t._id] }))} className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-dark cursor-pointer bg-transparent border-none">
                                    {expanded[t._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            </div>

                            {expanded[t._id] && (
                                <div className="px-5 pb-5 border-t border-border/50 pt-4 space-y-4">
                                    {/* Timeline */}
                                    {t.timeline?.length > 0 && (
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-text-muted mb-2">Activity Log</p>
                                            {t.timeline.map((e, i) => (
                                                <div key={i} className="flex items-start gap-2 text-xs text-text-muted">
                                                    <CheckCircle size={12} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                                                    <span>{e.message || e.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Status update buttons */}
                                    <div className="flex gap-2 flex-wrap">
                                        {t.status === 'accepted' && (
                                            <button onClick={() => updateStatus(t._id, 'in_progress', 'Work started')} disabled={statusUpdating === t._id} className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-bold cursor-pointer hover:opacity-90 disabled:opacity-50 border-none">
                                                Mark In Progress
                                            </button>
                                        )}
                                        {t.status === 'in_progress' && (
                                            <button onClick={() => updateStatus(t._id, 'documents_submitted', 'Documents ready for review')} disabled={statusUpdating === t._id} className="px-3 py-1.5 rounded-lg bg-violet-500 text-white text-xs font-bold cursor-pointer hover:opacity-90 disabled:opacity-50 border-none">
                                                Mark Docs Submitted
                                            </button>
                                        )}
                                        {t.status === 'documents_submitted' && (
                                            <button onClick={() => updateStatus(t._id, 'completed', 'Task completed successfully')} disabled={statusUpdating === t._id} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold cursor-pointer hover:opacity-90 disabled:opacity-50 border-none">
                                                Mark Completed ✓
                                            </button>
                                        )}
                                    </div>

                                    {/* Upload final document */}
                                    {['in_progress', 'documents_submitted', 'completed'].includes(t.status) && (
                                        <div>
                                            <p className="text-xs font-semibold text-text-muted mb-2">Upload Final Document</p>
                                            <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary text-primary text-xs font-medium cursor-pointer hover:bg-primary/5">
                                                <Upload size={13} /> {uploading === t._id ? 'Uploading...' : 'Upload Document'}
                                                <input type="file" className="hidden" disabled={uploading === t._id} onChange={e => e.target.files[0] && handleDocUpload(t._id, e.target.files[0])} />
                                            </label>
                                            {t.documents?.length > 0 && (
                                                <p className="text-xs text-emerald-600 mt-1">✓ {t.documents.length} document(s) uploaded</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

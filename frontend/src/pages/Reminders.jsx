import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Bell, Plus, Calendar, CheckCircle, Clock, AlertTriangle, Trash2, X } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };
const priorityColors = { high: 'border-l-danger bg-red-50/30', medium: 'border-l-warning bg-yellow-50/30', low: 'border-l-info bg-blue-50/30' };

export default function Reminders() {
    const { API } = useAuth();
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('all');
    const [form, setForm] = useState({ title: '', description: '', dueDate: '', type: 'pension', priority: 'medium' });

    const fetch = () => { API.get('/reminders').then(r => setReminders(r.data || [])).catch(() => { }).finally(() => setLoading(false)); };
    useEffect(fetch, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try { await API.post('/reminders', form); setShowForm(false); setForm({ title: '', description: '', dueDate: '', type: 'pension', priority: 'medium' }); fetch(); } catch { }
    };
    const toggleStatus = async (id) => { try { await API.put(`/reminders/${id}/toggle`); fetch(); } catch { } };
    const handleDelete = async (id) => { try { await API.delete(`/reminders/${id}`); fetch(); } catch { } };

    const filtered = filter === 'all' ? reminders : filter === 'pending' ? reminders.filter(r => r.status === 'pending') : reminders.filter(r => r.status === 'completed');
    const counts = { all: reminders.length, pending: reminders.filter(r => r.status === 'pending').length, completed: reminders.filter(r => r.status === 'completed').length };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <div>
                    <h1 className="text-2xl font-bold text-text-dark flex items-center gap-2"><Bell size={24} /> Reminders</h1>
                    <p className="text-sm text-text-light mt-0.5">Never miss a deadline for your pension and government tasks</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary"><Plus size={16} /> New Reminder</button>
            </motion.div>

            {/* Add Form */}
            {showForm && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card mb-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-text-dark">Create Reminder</h3>
                        <button onClick={() => setShowForm(false)} className="w-7 h-7 rounded-lg bg-bg flex items-center justify-center cursor-pointer border-none text-text-muted"><X size={14} /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div><label className="label">Title</label><input className="input" placeholder="e.g., Submit Life Certificate" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
                        <div><label className="label">Description</label><textarea className="input min-h-[60px]" placeholder="Brief description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                        <div className="grid grid-cols-3 gap-3">
                            <div><label className="label">Due Date</label><input type="date" className="input" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} required /></div>
                            <div><label className="label">Type</label>
                                <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                    <option value="pension">Pension</option><option value="tax">Tax</option><option value="insurance">Insurance</option><option value="documents">Documents</option>
                                </select>
                            </div>
                            <div><label className="label">Priority</label>
                                <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                                    <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn-primary">Create Reminder</button>
                    </form>
                </motion.div>
            )}

            {/* Filters */}
            <motion.div variants={fadeUp} className="flex gap-2 mb-4">
                {[['all', 'All'], ['pending', 'Pending'], ['completed', 'Done']].map(([f, l]) => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer transition-all ${filter === f ? 'bg-gradient-to-r from-primary to-secondary text-white border-transparent' : 'bg-white text-text-light border-border hover:border-primary/30'}`}>
                        {l} ({counts[f]})
                    </button>
                ))}
            </motion.div>

            {/* Reminders List */}
            <motion.div variants={stagger} className="space-y-3">
                {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="card animate-pulse h-16 bg-bg" />) :
                    filtered.length === 0 ? (
                        <div className="card text-center py-10">
                            <Bell size={36} className="mx-auto mb-3 text-text-muted" />
                            <h3 className="font-bold text-text-dark">No reminders</h3>
                            <p className="text-sm text-text-light mt-1">Create your first reminder to stay on track</p>
                        </div>
                    ) : filtered.map(r => {
                        const isOverdue = r.status === 'pending' && new Date(r.dueDate) < new Date();
                        return (
                            <motion.div key={r._id} variants={fadeUp} className={`card border-l-4 ${priorityColors[r.priority] || priorityColors.medium} flex items-center gap-3`}>
                                <button onClick={() => toggleStatus(r._id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer bg-transparent ${r.status === 'completed' ? 'border-accent bg-accent' : 'border-border hover:border-primary-light'}`}>
                                    {r.status === 'completed' && <CheckCircle size={14} className="text-white" />}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-semibold text-sm ${r.status === 'completed' ? 'line-through text-text-muted' : 'text-text-dark'}`}>{r.title}</h3>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-xs text-text-muted flex items-center gap-1"><Calendar size={11} /> {new Date(r.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        <span className={`badge text-[10px] ${r.priority === 'high' ? 'badge-danger' : r.priority === 'medium' ? 'badge-warning' : 'badge-info'}`}>{r.priority}</span>
                                        {isOverdue && <span className="badge badge-danger text-[10px]"><AlertTriangle size={10} /> Overdue</span>}
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(r._id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-red-50 cursor-pointer border-none bg-transparent"><Trash2 size={14} /></button>
                            </motion.div>
                        );
                    })
                }
            </motion.div>
        </motion.div>
    );
}

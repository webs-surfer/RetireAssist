import { useState } from 'react';
import { motion } from 'framer-motion';
import { Landmark, FileText, Building2, Shield, CreditCard, Fingerprint, Upload, Send, ArrowRight, X, CheckCircle } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const services = [
    { icon: Landmark, title: 'Pension Application', desc: 'Apply and track your pension application', gradient: 'from-blue-500 to-cyan-400' },
    { icon: FileText, title: 'Life Certificate Submission', desc: 'Submit Jeevan Pramaan digitally', gradient: 'from-emerald-500 to-teal-400' },
    { icon: Building2, title: 'Income Tax Filing', desc: 'Simplified ITR filing with AI assistance', gradient: 'from-purple-500 to-violet-400' },
    { icon: Shield, title: 'Insurance Claim Assistance', desc: 'File and track insurance claims easily', gradient: 'from-orange-400 to-rose-400' },
    { icon: CreditCard, title: 'Bank Detail Update', desc: 'Update your pension bank account', gradient: 'from-pink-500 to-fuchsia-400' },
    { icon: Fingerprint, title: 'Aadhaar Update', desc: 'Update Aadhaar-linked details', gradient: 'from-sky-500 to-blue-400' },
];

export default function RequestService() {
    const [selectedService, setSelectedService] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({ fullName: '', phone: '', serviceType: '', notes: '' });
    const [file, setFile] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => { setSubmitted(false); setSelectedService(null); setForm({ fullName: '', phone: '', serviceType: '', notes: '' }); setFile(null); }, 3000);
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="mb-5">
                <h1 className="text-2xl font-bold text-text-dark">Request a Service</h1>
                <p className="text-sm text-text-light mt-0.5">Select a service and submit your request. We'll handle the rest.</p>
            </motion.div>

            {submitted && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card border-accent/20 mb-5 flex items-center gap-3 bg-emerald-50">
                    <CheckCircle size={20} className="text-accent" />
                    <div>
                        <p className="font-semibold text-accent text-sm">Request Submitted Successfully!</p>
                        <p className="text-xs text-text-light">You can track your request from the "My Requests" page.</p>
                    </div>
                </motion.div>
            )}

            {!selectedService ? (
                <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((s, i) => (
                        <motion.div key={i} variants={fadeUp} onClick={() => { setSelectedService(s); setForm({ ...form, serviceType: s.title }); }}
                            className="card cursor-pointer group hover:border-primary/20 hover:shadow-md">
                            <div className={`w-12 h-12 bg-gradient-to-br ${s.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <s.icon size={24} className="text-white" />
                            </div>
                            <h3 className="font-bold text-text-dark mb-1">{s.title}</h3>
                            <p className="text-sm text-text-light">{s.desc}</p>
                            <div className="mt-3 flex items-center gap-1 text-primary-light text-sm font-medium">
                                Request Now <ArrowRight size={14} />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <motion.div variants={fadeUp} className="card max-w-xl">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 bg-gradient-to-br ${selectedService.gradient} rounded-lg flex items-center justify-center`}>
                                <selectedService.icon size={20} className="text-white" />
                            </div>
                            <h3 className="font-bold text-text-dark">{selectedService.title}</h3>
                        </div>
                        <button onClick={() => setSelectedService(null)} className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center border-none cursor-pointer text-text-muted hover:text-text">
                            <X size={16} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div><label className="label">Full Name</label><input className="input" placeholder="Enter your full name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required /></div>
                        <div><label className="label">Phone Number</label><input type="tel" className="input" placeholder="Enter phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></div>
                        <div><label className="label">Service Type</label><input className="input bg-bg" value={form.serviceType} readOnly /></div>
                        <div>
                            <label className="label">Upload Documents</label>
                            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary-light transition-all cursor-pointer" onClick={() => document.getElementById('req-upload')?.click()}>
                                <input type="file" id="req-upload" className="hidden" onChange={e => setFile(e.target.files?.[0])} />
                                <Upload size={24} className="mx-auto mb-2 text-text-muted" />
                                <p className="text-sm font-medium text-text">{file ? file.name : 'Click to upload documents'}</p>
                                <p className="text-xs text-text-muted mt-1">PDF, JPG, PNG (Max 10MB)</p>
                            </div>
                        </div>
                        <div><label className="label">Additional Notes</label><textarea className="input min-h-[80px]" placeholder="Any additional information..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
                        <button type="submit" className="btn-primary w-full"><Send size={16} /> Create Request</button>
                    </form>
                </motion.div>
            )}

            {/* Progress Tracker Sample */}
            <motion.div variants={fadeUp} className="card mt-5">
                <h2 className="text-base font-bold text-text-dark mb-4">📊 Request Tracking</h2>
                <div className="flex items-center justify-between relative">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-border z-0" />
                    {['Request Created', 'Document Verification', 'Processing', 'Completed'].map((stage, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= 1 ? 'bg-gradient-to-br from-primary to-secondary text-white' : 'bg-bg text-text-muted border border-border'}`}>
                                {i < 1 ? <CheckCircle size={14} /> : i + 1}
                            </div>
                            <p className={`text-[11px] mt-2 font-medium text-center max-w-[80px] ${i <= 1 ? 'text-primary' : 'text-text-muted'}`}>{stage}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}

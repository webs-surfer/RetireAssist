import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Landmark, FileText, Building2, Shield, CreditCard, Fingerprint, ChevronDown, ChevronUp, ExternalLink, Phone } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const services = [
    {
        icon: Landmark, title: 'Pension Application', category: 'Government', gradient: 'from-blue-500 to-cyan-400',
        steps: ['Visit pension.gov.in or RetireAssist portal', 'Fill basic details — PPO No., PAN, Aadhaar', 'Upload supporting documents', 'Submit and track status'],
        helpline: '1800-11-1960', website: 'https://pension.gov.in'
    },
    {
        icon: FileText, title: 'Life Certificate (Jeevan Pramaan)', category: 'Government', gradient: 'from-emerald-500 to-teal-400',
        steps: ['Download Jeevan Pramaan app or use biometric device', 'Enter Aadhaar and pension details', 'Authenticate using fingerprint/iris scan', 'Certificate generated digitally'],
        helpline: '1800-11-1960', website: 'https://jeevanpramaan.gov.in'
    },
    {
        icon: Building2, title: 'Income Tax Filing (ITR)', category: 'Financial', gradient: 'from-purple-500 to-violet-400',
        steps: ['Gather Form 16, bank statements, investment proofs', 'Login to incometax.gov.in', 'Choose ITR form based on income sources', 'Fill details and verify using Aadhaar OTP'],
        helpline: '1800-180-1961', website: 'https://incometax.gov.in'
    },
    {
        icon: Shield, title: 'Insurance Claim', category: 'Healthcare', gradient: 'from-orange-400 to-rose-400',
        steps: ['Collect medical bills, discharge summary', 'Fill insurance claim form from provider', 'Upload all documents', 'Track claim status with reference number'],
        helpline: '155255', website: 'https://irdai.gov.in'
    },
    {
        icon: CreditCard, title: 'Bank Account Update', category: 'Financial', gradient: 'from-pink-500 to-fuchsia-400',
        steps: ['Request bank account update from pension office', 'Submit cancelled cheque of new account', 'Provide Aadhaar-linked verification', 'Wait for confirmation (15-30 days)'],
        helpline: '1800-11-1960', website: 'https://pension.gov.in'
    },
    {
        icon: Fingerprint, title: 'Aadhaar Update', category: 'Government', gradient: 'from-sky-500 to-blue-400',
        steps: ['Visit nearest Aadhaar centre or go online', 'Select type of update (address, mobile, name)', 'Submit supporting documents', 'Collect update receipt and track'],
        helpline: '1947', website: 'https://uidai.gov.in'
    },
];

export default function Services() {
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [filterCategory, setFilterCategory] = useState('All');

    const categories = ['All', 'Government', 'Financial', 'Healthcare'];
    const filtered = filterCategory === 'All' ? services : services.filter(s => s.category === filterCategory);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="mb-5">
                <h1 className="text-2xl font-bold text-text-dark flex items-center gap-2"><BookOpen size={24} /> Services Guide</h1>
                <p className="text-sm text-text-light mt-0.5">Step-by-step guides for government and financial services</p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex gap-2 mb-5">
                {categories.map(c => (
                    <button key={c} onClick={() => setFilterCategory(c)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer transition-all ${filterCategory === c ? 'bg-gradient-to-r from-primary to-secondary text-white border-transparent' : 'bg-white text-text-light border-border hover:border-primary/30'}`}>
                        {c}
                    </button>
                ))}
            </motion.div>

            <motion.div variants={stagger} className="space-y-3">
                {filtered.map((service, i) => (
                    <motion.div key={i} variants={fadeUp} className="card hover:border-primary/20">
                        <div onClick={() => setExpandedIndex(expandedIndex === i ? null : i)} className="flex items-center gap-4 cursor-pointer">
                            <div className={`w-11 h-11 bg-gradient-to-br ${service.gradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                <service.icon size={22} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-text-dark text-sm">{service.title}</h3>
                                <span className="badge badge-primary text-[10px]">{service.category}</span>
                            </div>
                            {expandedIndex === i ? <ChevronUp size={18} className="text-text-muted" /> : <ChevronDown size={18} className="text-text-muted" />}
                        </div>

                        {expandedIndex === i && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-border">
                                <h4 className="text-sm font-semibold text-text-dark mb-3">📝 Step-by-Step Guide</h4>
                                <div className="space-y-2 mb-4">
                                    {service.steps.map((step, j) => (
                                        <div key={j} className="flex items-start gap-3 p-2 bg-bg rounded-lg">
                                            <span className="w-6 h-6 bg-gradient-to-br from-primary to-secondary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{j + 1}</span>
                                            <p className="text-sm text-text-light">{step}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <a href={service.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary-light font-medium hover:underline no-underline">
                                        <ExternalLink size={14} /> Official Website
                                    </a>
                                    <a href={`tel:${service.helpline}`} className="flex items-center gap-1 text-accent font-medium hover:underline no-underline">
                                        <Phone size={14} /> Helpline: {service.helpline}
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </motion.div>

            {/* Emergency */}
            <motion.div variants={fadeUp} className="card mt-5 bg-gradient-to-r from-primary to-secondary text-white">
                <h3 className="font-bold mb-2">📞 Emergency Helplines</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[['Pension Helpline', '1800-11-1960'], ['Income Tax', '1800-180-1961'], ['UIDAI', '1947']].map(([label, num]) => (
                        <a key={num} href={`tel:${num}`} className="flex items-center gap-2 p-2 bg-white/10 rounded-lg text-white no-underline hover:bg-white/20 transition-all">
                            <Phone size={14} /> <span className="text-sm"><strong>{label}</strong><br />{num}</span>
                        </a>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}

import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Shield, FileText, CreditCard, Edit3 } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

export default function Profile() {
    const { user } = useAuth();

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
            <motion.div variants={fadeUp} className="mb-5">
                <h1 className="text-2xl font-bold text-text-dark">My Profile</h1>
                <p className="text-sm text-text-light mt-0.5">Manage your personal information and account settings</p>
            </motion.div>

            {/* Profile Card */}
            <motion.div variants={fadeUp} className="card mb-4">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                        <User size={28} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text-dark">{user?.name || 'User'}</h2>
                        <p className="text-sm text-text-muted">{user?.email}</p>
                        <span className="badge-primary mt-1">{user?.role === 'admin' ? '🛡️ Administrator' : '👤 Pensioner'}</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { icon: Mail, label: 'Email', value: user?.email || 'Not set' },
                        { icon: Phone, label: 'Phone', value: user?.phone || 'Not set' },
                        { icon: Calendar, label: 'Age', value: user?.age ? `${user.age} years` : 'Not set' },
                        { icon: MapPin, label: 'Location', value: 'India' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-bg rounded-lg">
                            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-primary-light border border-border">
                                <item.icon size={16} />
                            </div>
                            <div>
                                <p className="text-[11px] text-text-muted font-medium uppercase">{item.label}</p>
                                <p className="text-sm font-semibold text-text-dark">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Pension Info */}
            <motion.div variants={fadeUp} className="card mb-4">
                <h3 className="text-base font-bold text-text-dark mb-4 flex items-center gap-2">
                    <FileText size={18} className="text-primary" /> Pension Information
                </h3>
                <div className="space-y-0">
                    {[
                        ['Pension ID', user?.pensionId || 'PEN-2024-001234'],
                        ['Pension Status', user?.pensionStatus || 'Active'],
                        ['Monthly Pension', `₹${(user?.monthlyPension || 25000).toLocaleString('en-IN')}`],
                        ['Aadhaar', user?.aadhaarNumber || '•••• •••• ••••'],
                    ].map(([label, value], i, arr) => (
                        <div key={i} className={`flex justify-between items-center py-3 ${i < arr.length - 1 ? 'border-b border-border/60' : ''}`}>
                            <span className="text-sm text-text-light">{label}</span>
                            <span className="text-sm font-semibold text-text-dark">{value}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Bank Details */}
            <motion.div variants={fadeUp} className="card mb-4">
                <h3 className="text-base font-bold text-text-dark mb-4 flex items-center gap-2">
                    <CreditCard size={18} className="text-accent" /> Bank Details
                </h3>
                <div className="space-y-0">
                    {[
                        ['Bank Name', user?.bankDetails?.bankName || 'State Bank of India'],
                        ['Account Number', user?.bankDetails?.accountNumber || '•••••••8901'],
                        ['IFSC Code', user?.bankDetails?.ifsc || 'SBIN0001234'],
                    ].map(([label, value], i, arr) => (
                        <div key={i} className={`flex justify-between items-center py-3 ${i < arr.length - 1 ? 'border-b border-border/60' : ''}`}>
                            <span className="text-sm text-text-light">{label}</span>
                            <span className="text-sm font-semibold text-text-dark">{value}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Security */}
            <motion.div variants={fadeUp} className="card bg-gradient-to-r from-primary to-secondary text-white">
                <div className="flex items-center gap-3">
                    <Shield size={24} />
                    <div>
                        <h3 className="font-bold">Account Security</h3>
                        <p className="text-sm text-blue-100">Your account is protected with 256-bit encryption. All data is stored securely.</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

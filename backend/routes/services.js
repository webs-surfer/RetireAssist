const express = require('express');
const mongoose = require('mongoose');
const Service = require('../models/Service');
const { authMiddleware } = require('../middleware/auth');


const router = express.Router();

// Seed services if empty
const defaultServices = [
    { name: 'Pension Application', category: 'pension', description: 'Help with applying for government pension benefits', icon: '🏦', estimatedDays: 14, basePrice: 1000, requiredDocuments: ['Aadhaar Card', 'Service Certificate', 'Bank Passbook', 'PAN Card'], steps: ['Document collection', 'Form filling', 'Submission to department', 'Follow-up & tracking', 'Pension ID receipt'] },
    { name: 'Life Certificate Submission', category: 'pension', description: 'Annual life certificate submission for pension continuity', icon: '📜', estimatedDays: 2, basePrice: 300, requiredDocuments: ['Aadhaar Card', 'Pension Passbook'], steps: ['Identity verification', 'Certificate generation', 'Bank submission'] },
    { name: 'Income Tax Return Filing', category: 'tax', description: 'ITR filing for senior citizens with pension income', icon: '📊', estimatedDays: 5, basePrice: 800, requiredDocuments: ['Form 16', 'Bank Statements', 'PAN Card', 'Aadhaar Card'], steps: ['Income assessment', 'Deduction calculation', 'ITR form preparation', 'Filing & acknowledgement'] },
    { name: 'Insurance Claim', category: 'insurance', description: 'Process health or life insurance claim paperwork', icon: '🛡️', estimatedDays: 10, basePrice: 1200, requiredDocuments: ['Policy Document', 'Claim Form', 'Hospital Bills', 'Aadhaar Card'], steps: ['Claim initiation', 'Document verification', 'Insurer coordination', 'Settlement tracking'] },
    { name: 'Aadhaar Update', category: 'government', description: 'Update address, mobile, or biometrics on Aadhaar', icon: '🪪', estimatedDays: 7, basePrice: 400, requiredDocuments: ['Original Aadhaar', 'Address Proof'], steps: ['Application filling', 'Document upload', 'Biometric booking', 'Update tracking'] },
    { name: 'Bank Account Services', category: 'banking', description: 'Assist with senior citizen bank account features and issues', icon: '🏛️', estimatedDays: 3, basePrice: 500, requiredDocuments: ['Aadhaar', 'PAN Card', 'Passport Photo'], steps: ['Bank visit coordination', 'Form assistance', 'Issue resolution'] },
    { name: 'Medical Reimbursement', category: 'healthcare', description: 'CGHS/ESIC medical reimbursement claim processing', icon: '🏥', estimatedDays: 21, basePrice: 1500, requiredDocuments: ['Medical Bills', 'Prescription', 'CGHS Card', 'Discharge Summary'], steps: ['Bill verification', 'Claim form filling', 'Department submission', 'Reimbursement tracking'] },
    { name: 'Legal Document Assistance', category: 'legal', description: 'Help with wills, nominations, and legal paperwork', icon: '⚖️', estimatedDays: 7, basePrice: 2000, requiredDocuments: ['Identity Proof', 'Property Documents'], steps: ['Consultation', 'Draft preparation', 'Notarization', 'Registration'] },
    { name: 'PF Withdrawal', category: 'pension', description: 'Provident Fund final settlement and withdrawal', icon: '💰', estimatedDays: 30, basePrice: 800, requiredDocuments: ['PF Account Details', 'Aadhaar', 'Bank Passbook', 'Resignation Letter'], steps: ['Form 19/31 preparation', 'Online submission', 'Employer attestation', 'EPFO follow-up'] },
    { name: 'Government Scheme Enrollment', category: 'government', description: 'Enroll in senior citizen government welfare schemes', icon: '🏛️', estimatedDays: 10, basePrice: 600, requiredDocuments: ['Age Proof', 'Income Certificate', 'Resident Certificate'], steps: ['Scheme identification', 'Eligibility check', 'Application filing', 'Enrollment confirmation'] },
];

async function seedServices() {
    try {
        const count = await Service.countDocuments();
        if (count === 0) await Service.insertMany(defaultServices);
    } catch (e) { console.error('Service seed error:', e.message); }
}
seedServices();

// GET /api/services
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;

        // DEMO MODE FALLBACK — return static data when DB is not connected
        if (mongoose.connection.readyState !== 1) {
            let result = defaultServices;
            if (category && category !== 'all') {
                result = defaultServices.filter(s => s.category === category);
            }
            return res.json(result.map((s, i) => ({ ...s, _id: `demo_svc_${i}`, isActive: true })));
        }

        const filter = { isActive: true };
        if (category && category !== 'all') filter.category = category;
        const services = await Service.find(filter).sort({ category: 1 });
        res.json(services);
    } catch (error) {
        // Fallback to static data on any error
        let result = defaultServices;
        const { category } = req.query;
        if (category && category !== 'all') result = defaultServices.filter(s => s.category === category);
        return res.json(result.map((s, i) => ({ ...s, _id: `demo_svc_${i}`, isActive: true })));
    }
});


// GET /api/services/:id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching service', error: error.message });
    }
});

module.exports = router;

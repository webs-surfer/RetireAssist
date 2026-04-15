const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/pension/status
router.get('/status', authMiddleware, async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);

        res.json({
            pensionId: user.pensionId || 'PEN-2024-001234',
            status: user.pensionStatus || 'active',
            monthlyAmount: user.monthlyPension || 25000,
            lastPaymentDate: '2026-02-28',
            nextPaymentDate: '2026-03-31',
            bankAccount: user.bankDetails?.accountNumber
                ? `XXXX${user.bankDetails.accountNumber.slice(-4)}`
                : 'XXXX1234',
            bankName: user.bankDetails?.bankName || 'State Bank of India',
            pensionType: 'Government Service Pension',
            department: 'Central Government',
            retirementDate: '2020-06-30'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pension status', error: error.message });
    }
});

// GET /api/pension/history
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const history = [
            { month: 'February 2026', amount: 25000, status: 'credited', date: '2026-02-28', transactionId: 'TXN20260228001' },
            { month: 'January 2026', amount: 25000, status: 'credited', date: '2026-01-31', transactionId: 'TXN20260131001' },
            { month: 'December 2025', amount: 25000, status: 'credited', date: '2025-12-31', transactionId: 'TXN20251231001' },
            { month: 'November 2025', amount: 24000, status: 'credited', date: '2025-11-30', transactionId: 'TXN20251130001' },
            { month: 'October 2025', amount: 24000, status: 'credited', date: '2025-10-31', transactionId: 'TXN20251031001' },
            { month: 'September 2025', amount: 24000, status: 'credited', date: '2025-09-30', transactionId: 'TXN20250930001' },
        ];
        res.json({ history, totalReceived: 147000 });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pension history', error: error.message });
    }
});

module.exports = router;

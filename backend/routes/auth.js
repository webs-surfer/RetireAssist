const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// In-memory store for Demo Mode when MongoDB is not connected
const demoUsers = new Map();
const demoUsersByEmail = new Map();

// Pre-seed demo accounts so users can always log in during demo mode
(function seedDemoAccounts() {
    const seeds = [
        {
            _id: 'demo_user_001',
            name: 'Tanishq Bawa',
            email: 'dkr0012@gmail.com',
            password: 'demo1234',
            role: 'user',
            isPensioner: true,
            phone: '7412589652',
            city: 'Delhi',
            dataCompleteness: {},
            vaultSetup: false,
        },
        {
            _id: 'demo_helper_001',
            name: 'Demo Helper',
            email: 'helper@demo.com',
            password: 'demo1234',
            role: 'helper',
            isPensioner: false,
            isVerified: true,
            onboardingStatus: 'approved',
            dataCompleteness: {},
        },
        {
            _id: 'demo_user_002',
            name: 'Raamu',
            email: 'raamu@gmail.com',
            password: 'demo1234',
            role: 'user',
            isPensioner: false,
            dataCompleteness: {},
            vaultSetup: false,
        },
        {
            _id: 'demo_admin_001',
            name: 'Admin',
            email: 'admin@retireassist.com',
            password: 'admin1234',
            role: 'admin',
            isPensioner: false,
            dataCompleteness: {},
        },
    ];
    seeds.forEach(u => {
        demoUsers.set(u._id, u);
        // Register both original case and lowercase so login is case-insensitive
        demoUsersByEmail.set(u.email.toLowerCase(), u);
    });
    console.log('✅ Demo accounts seeded (DB offline fallback)');
})();


function buildUserPayload(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPensioner: user.isPensioner,
        phone: user.phone,
        city: user.city,
        dob: user.dob,
        profilePhoto: user.profilePhoto,
        avatar: user.avatar,
        // Plain-text profile fields (from OCR / manual entry)
        aadhaarNumber: user.aadhaarNumber,
        panNumber: user.panNumber,
        pensionId: user.pensionId,
        monthlyPension: user.monthlyPension,
        schemeName: user.schemeName,
        bankAccountNumber: user.bankAccountNumber,
        bankName: user.bankName,
        ifscCode: user.ifscCode,
        // Encrypted PII — client decrypts with vault key
        aadhaarEncrypted: user.aadhaarEncrypted,
        aadhaarIv: user.aadhaarIv,
        panEncrypted: user.panEncrypted,
        panIv: user.panIv,
        pensionIdEncrypted: user.pensionIdEncrypted,
        pensionIdIv: user.pensionIdIv,
        monthlyPensionEncrypted: user.monthlyPensionEncrypted,
        monthlyPensionIv: user.monthlyPensionIv,
        // Data completeness
        dataCompleteness: user.dataCompleteness,
        // Helper fields
        isVerified: user.isVerified,
        onboardingStatus: user.onboardingStatus,
        publicKey: user.publicKey,
        rating: user.rating,
        earnings: user.earnings,
        completedTasks: user.completedTasks,
        services: user.services
    };
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, phone, role, isPensioner, profilePhoto } = req.body;

        // DEMO MODE FALLBACK
        if (mongoose.connection.readyState !== 1) {
            console.log('⚡ Using Demo Mode for Signup (No DB Connection)');
            if (demoUsersByEmail.has(email)) return res.status(400).json({ message: 'User already exists with this email' });
            const assignedRole = ['user', 'helper'].includes(role) ? role : 'user';
            const demoUser = {
                _id: 'demo_' + Date.now().toString(), name, email, password, phone, role: assignedRole,
                isPensioner: assignedRole === 'user' ? !!isPensioner : false,
                profilePhoto: profilePhoto || null,
                dataCompleteness: { photo: !!profilePhoto }
            };
            demoUsers.set(demoUser._id, demoUser);
            demoUsersByEmail.set(email, demoUser);
            const token = jwt.sign({ id: demoUser._id, email: demoUser.email, role: demoUser.role, name: demoUser.name }, JWT_SECRET, { expiresIn: '7d' });
            return res.status(201).json({ message: 'Account created successfully (Demo Mode)', token, user: demoUser });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists with this email' });
        const allowedRoles = ['user', 'helper'];
        const assignedRole = allowedRoles.includes(role) ? role : 'user';
        // Only save auth fields — all profile fields stay null
        const user = new User({
            name, email, password, phone,
            role: assignedRole,
            isPensioner: assignedRole === 'user' ? !!isPensioner : false,
            profilePhoto: profilePhoto || null
        });
        if (profilePhoto) {
            user.dataCompleteness.photo = true;
        }
        await user.save();
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ message: 'Account created successfully', token, user: buildUserPayload(user) });
    } catch (error) {
        res.status(500).json({ message: 'Error creating account', error: error.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // DEMO MODE FALLBACK
        if (mongoose.connection.readyState !== 1) {
            console.log('⚡ Using Demo Mode for Login (No DB Connection)');
            const demoUser = demoUsersByEmail.get(email.toLowerCase());
            if (!demoUser || demoUser.password !== password) return res.status(400).json({ message: 'Invalid email or password. Demo mode: use password "demo1234"' });
            const token = jwt.sign({ id: demoUser._id, email: demoUser.email, role: demoUser.role, name: demoUser.name }, JWT_SECRET, { expiresIn: '7d' });
            return res.json({ message: 'Login successful (Demo Mode)', token, user: demoUser });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ message: 'Login successful', token, user: buildUserPayload(user) });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// GET /api/auth/profile  (also aliased as /me)
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            const demoUser = demoUsers.get(req.user.id);
            if (!demoUser) return res.status(404).json({ message: 'User not found' });
            const userCopy = { ...demoUser }; delete userCopy.password;
            return res.json(userCopy);
        }
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

// GET /api/auth/me — alias
router.get('/me', authMiddleware, async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            const demoUser = demoUsers.get(req.user.id);
            if (!demoUser) return res.status(404).json({ message: 'User not found (Demo Mode)' });
            const userCopy = { ...demoUser }; delete userCopy.password;
            return res.json(userCopy);
        }
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
});

// PUT /api/auth/profile — with pension guard, null-protection, dataCompleteness
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const body = req.body;

        // DEMO MODE FALLBACK
        if (mongoose.connection.readyState !== 1) {
            const demoUser = demoUsers.get(req.user.id);
            if (!demoUser) return res.status(404).json({ message: 'User not found (Demo Mode)' });
            // Merge allowed fields into the in-memory user
            const allowed = ['name', 'phone', 'city', 'dob', 'bio', 'profilePhoto', 'vaultSetup',
                'aadhaarNumber', 'panNumber', 'pensionId', 'schemeName', 'bankAccountNumber',
                'bankName', 'ifscCode', 'monthlyPension', 'isPensioner'];
            allowed.forEach(k => {
                if (body[k] !== undefined && body[k] !== null && body[k] !== '') demoUser[k] = body[k];
            });
            if (body.vaultSetup !== undefined) demoUser.vaultSetup = !!body.vaultSetup;
            const userCopy = { ...demoUser }; delete userCopy.password;
            return res.json({ user: userCopy });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Pension guard: non-pensioners cannot store pension data
        if (!user.isPensioner && (body.pensionId || body.monthlyPension || body.pensionIdEncrypted)) {
            return res.status(400).json({ message: 'Non-pensioner users cannot store pension data' });
        }


        const update = {};

        // Helper: only set a field if the new value is non-null (never overwrite existing non-null with null)
        const safeSet = (key, val) => {
            if (val !== undefined && val !== null && val !== '') {
                update[key] = val;
            }
        };

        // Basic profile fields
        safeSet('name', body.name);
        safeSet('phone', body.phone);
        safeSet('city', body.city);
        safeSet('dob', body.dob);
        safeSet('bio', body.bio);
        safeSet('profilePhoto', body.profilePhoto);
        if (body.vaultSetup !== undefined) update.vaultSetup = !!body.vaultSetup;

        // Plain-text profile fields (from OCR / manual entry)
        safeSet('aadhaarNumber', body.aadhaarNumber);
        safeSet('panNumber', body.panNumber);
        safeSet('pensionId', body.pensionId);
        safeSet('schemeName', body.schemeName);
        safeSet('bankAccountNumber', body.bankAccountNumber);
        safeSet('bankName', body.bankName);
        safeSet('ifscCode', body.ifscCode);
        if (body.monthlyPension !== undefined && body.monthlyPension !== null) {
            update.monthlyPension = Number(body.monthlyPension);
        }

        // Encrypted PII — store ciphertext directly, never plaintext
        if (body.aadhaarEncrypted) { update.aadhaarEncrypted = body.aadhaarEncrypted; update.aadhaarIv = body.aadhaarIv; }
        if (body.panEncrypted) { update.panEncrypted = body.panEncrypted; update.panIv = body.panIv; }
        if (body.pensionIdEncrypted) { update.pensionIdEncrypted = body.pensionIdEncrypted; update.pensionIdIv = body.pensionIdIv; }
        if (body.monthlyPensionEncrypted) { update.monthlyPensionEncrypted = body.monthlyPensionEncrypted; update.monthlyPensionIv = body.monthlyPensionIv; }

        // Helper fields
        if (body.services !== undefined) update.services = body.services;
        if (body.location !== undefined) update.location = body.location;
        if (body.bankDetails !== undefined) update.bankDetails = body.bankDetails;

        // Update dataCompleteness flags
        if (body.aadhaarEncrypted || body.aadhaarNumber)
            update['dataCompleteness.aadhaar'] = true;
        if (body.panEncrypted || body.panNumber)
            update['dataCompleteness.pan'] = true;
        if (body.pensionId && user.isPensioner)
            update['dataCompleteness.pension'] = true;
        if (body.bankAccountNumber)
            update['dataCompleteness.bank'] = true;
        if (body.profilePhoto)
            update['dataCompleteness.photo'] = true;

        const updatedUser = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('-password');
        res.json({ message: 'Profile updated', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
});

// Google OAuth (preserved from existing)
router.post('/google', async (req, res) => {
    try {
        const { credential, role } = req.body;
        if (!credential) return res.status(400).json({ message: 'Google credential required' });
        let googleUser;
        const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
        
        try {
            if (GOOGLE_CLIENT_ID) {
                const { OAuth2Client } = require('google-auth-library');
                const client = new OAuth2Client(GOOGLE_CLIENT_ID);
                const ticket = await client.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
                googleUser = ticket.getPayload();
            } else {
                const parts = credential.split('.');
                if (parts.length !== 3) return res.status(400).json({ message: 'Invalid Google credential' });
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                googleUser = { sub: payload.sub, email: payload.email, name: payload.name, picture: payload.picture };
                if (!googleUser.email) return res.status(400).json({ message: 'Demo mode: invalid Google token' });
            }
        } catch (authError) {
            console.error('Google token verification failed:', authError.message);
            return res.status(400).json({ message: 'Invalid or expired Google token' });
        }
        const { sub: googleId, email, name, picture } = googleUser;
        let user = await User.findOne({ $or: [{ googleId }, { email }] });
        if (!user) {
            const allowedRoles = ['user', 'helper'];
            user = await User.create({ name, email, googleId, avatar: picture, role: allowedRoles.includes(role) ? role : 'user', password: Math.random().toString(36) + 'G!' });
        } else if (!user.googleId) { user.googleId = googleId; await user.save(); }
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ message: 'Google login successful', token, user: buildUserPayload(user) });
    } catch (error) {
        res.status(500).json({ message: 'Google authentication failed', error: error.message });
    }
});

// OTP routes preserved
const otpStore = new Map();
router.post('/send-otp', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone || phone.length < 10) return res.status(400).json({ message: 'Valid phone number required' });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000;
        otpStore.set(phone, { otp, expiresAt });
        console.log(`\n📱 OTP for ${phone}: ${otp} (Demo mode)\n`);
        res.json({ message: 'OTP sent (check server terminal in demo mode)', demo: true });
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
});

router.post('/verify-otp', async (req, res) => {
    try {
        const { phone, otp, name, role } = req.body;
        const record = otpStore.get(phone);
        if (!record) return res.status(400).json({ message: 'OTP not found' });
        if (Date.now() > record.expiresAt) { otpStore.delete(phone); return res.status(400).json({ message: 'OTP expired' }); }
        if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
        otpStore.delete(phone);
        let user = await User.findOne({ phone });
        if (!user) {
            const allowedRoles = ['user', 'helper'];
            user = await User.create({ name: name || `User-${phone.slice(-4)}`, phone, email: `${phone}@phone.retireassist.com`, role: allowedRoles.includes(role) ? role : 'user', password: Math.random().toString(36) + 'P!' });
        }
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ message: 'OTP verified', token, user: buildUserPayload(user) });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying OTP', error: error.message });
    }
});

module.exports = router;

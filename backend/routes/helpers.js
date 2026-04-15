const express = require('express');
const User = require('../models/User');
const Request = require('../models/Request');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/kyc');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user.id}_${Date.now()}_${file.originalname}`);
    }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const helperOnly = (req, res, next) => {
    if (req.user.role !== 'helper') return res.status(403).json({ message: 'Helper access only' });
    next();
};

// GET /api/helpers — search by city and service
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { service, city, lat, lng, radius = 50 } = req.query;
        const filter = { role: 'helper', isVerified: true };
        if (service) filter.services = { $in: [service] };
        if (city) filter.city = { $regex: city, $options: 'i' };

        let helpers;
        if (lat && lng) {
            helpers = await User.find({
                ...filter,
                location: { $near: { $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] }, $maxDistance: parseFloat(radius) * 1000 } }
            }).select('-password -aadhaarEncrypted -panEncrypted -pensionIdEncrypted -bankDetails').limit(20);
        } else {
            helpers = await User.find(filter).select('-password -aadhaarEncrypted -panEncrypted -pensionIdEncrypted -bankDetails').limit(30);
        }
        res.json(helpers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching helpers', error: error.message });
    }
});

// GET /api/helpers/profile/me
router.get('/profile/me', authMiddleware, helperOnly, async (req, res) => {
    try {
        const helper = await User.findById(req.user.id).select('-password');
        res.json(helper);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

// GET /api/helpers/:id — public profile
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const helper = await User.findOne({ _id: req.params.id, role: 'helper' }).select('-password -aadhaarEncrypted -panEncrypted -bankDetails');
        if (!helper) return res.status(404).json({ message: 'Helper not found' });
        res.json(helper);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching helper', error: error.message });
    }
});

// PUT /api/helpers/profile
router.put('/profile', authMiddleware, helperOnly, async (req, res) => {
    try {
        const { name, phone, bio, services, bankDetails, location, city } = req.body;
        const update = {};
        if (name !== undefined) update.name = name;
        if (phone !== undefined) update.phone = phone;
        if (bio !== undefined) update.bio = bio;
        if (services !== undefined) update.services = services;
        if (bankDetails !== undefined) update.bankDetails = bankDetails;
        if (location !== undefined) update.location = location;
        if (city !== undefined) update.city = city;
        const helper = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('-password');
        res.json({ message: 'Profile updated', helper });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
});

// POST /api/helpers/onboard — KYC upload
router.post('/onboard', authMiddleware, helperOnly, upload.fields([
    { name: 'aadhaarDoc', maxCount: 1 },
    { name: 'faceImage', maxCount: 1 }
]), async (req, res) => {
    try {
        const { services, city, lat, lng } = req.body;
        const update = { onboardingStatus: 'pending' };
        if (req.files?.aadhaarDoc) update.aadhaarDoc = `/uploads/kyc/${req.files.aadhaarDoc[0].filename}`;
        if (req.files?.faceImage) update.faceImage = `/uploads/kyc/${req.files.faceImage[0].filename}`;
        if (services) update.services = Array.isArray(services) ? services : [services];
        if (city) update.city = city;
        if (lat && lng) {
            update.location = {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
            };
        }
        const helper = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('-password');
        res.json({ message: 'KYC documents submitted. Awaiting admin verification.', helper });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting KYC', error: error.message });
    }
});

// PUT /api/helpers/public-key — store RSA-OAEP public key
router.put('/public-key', authMiddleware, helperOnly, async (req, res) => {
    try {
        const { publicKey } = req.body;
        if (!publicKey) return res.status(400).json({ message: 'publicKey required' });
        await User.findByIdAndUpdate(req.user.id, { publicKey });
        res.json({ message: 'Public key stored successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error storing public key', error: error.message });
    }
});

module.exports = router;

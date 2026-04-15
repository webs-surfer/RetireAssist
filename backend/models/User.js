const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    role: { type: String, enum: ['user', 'helper', 'admin'], default: 'user' },
    isPensioner: { type: Boolean, default: false },

    // Encrypted PII fields (AES-GCM, encrypted client-side, server stores ciphertext only)
    aadhaarEncrypted: { type: String, default: null },
    aadhaarIv: { type: String, default: null },
    panEncrypted: { type: String, default: null },
    panIv: { type: String, default: null },
    pensionIdEncrypted: { type: String, default: null },
    pensionIdIv: { type: String, default: null },
    monthlyPensionEncrypted: { type: String, default: null },
    monthlyPensionIv: { type: String, default: null },

    // Plain-text profile fields (from OCR or manual entry)
    aadhaarNumber: { type: String, default: null },
    panNumber: { type: String, default: null },
    pensionId: { type: String, default: null },
    monthlyPension: { type: Number, default: null },
    schemeName: { type: String, default: null },
    bankAccountNumber: { type: String, default: null },
    bankName: { type: String, default: null },
    ifscCode: { type: String, default: null },

    // Profile fields — all default null
    dob: { type: String, default: null },
    age: { type: Number, default: null },
    profilePhoto: { type: String, default: null },
    city: { type: String, default: '' },
    googleId: { type: String, default: '' },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    vaultSetup: { type: Boolean, default: false },

    // Data completeness tracking
    dataCompleteness: {
        aadhaar: { type: Boolean, default: false },
        pan:     { type: Boolean, default: false },
        pension: { type: Boolean, default: false },
        photo:   { type: Boolean, default: false },
        bank:    { type: Boolean, default: false },
    },

    // Legacy compat
    pensionStatus: { type: String, enum: ['active', 'pending', 'suspended', 'inactive'], default: 'active' },
    bankDetails: {
        accountNumber: { type: String, default: '' },
        ifsc: { type: String, default: '' },
        bankName: { type: String, default: '' }
    },

    // Helper-specific fields
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [77.5946, 12.9716] }
    },
    services: [{ type: String }],
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    onboardingStatus: { type: String, enum: ['incomplete', 'pending', 'submitted', 'approved', 'rejected'], default: 'incomplete' },
    aadhaarDoc: { type: String, default: '' },
    faceImage: { type: String, default: '' },
    publicKey: { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
    earnings: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

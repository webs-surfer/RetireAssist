const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Encrypted payload — server never sees plaintext
    encryptedBlob: { type: Buffer, required: true },
    iv: { type: String, required: true },   // base64 12-byte nonce
    fileType: { type: String, default: 'application/octet-stream' },
    originalName: { type: String, default: 'document' },
    docType: {
        type: String,
        enum: ['pension_certificate', 'aadhaar', 'pan', 'photo', 'other'],
        default: 'other'
    },
    size: { type: Number, default: 0 },
    // Per-helper RSA-OAEP wrapped AES key shares
    taskShares: [{
        helperId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        encryptedKey: { type: String } // base64 RSA-OAEP encrypted AES key
    }]
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);

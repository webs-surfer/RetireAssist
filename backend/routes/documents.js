const express = require('express');
const Document = require('../models/Document');
const Request = require('../models/Request');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Admin 403 guard — admins cannot access document content
function denyAdmin(req, res, next) {
    if (req.user.role === 'admin') {
        return res.status(403).json({ message: 'Admins cannot access document content — E2E encrypted' });
    }
    next();
}

// POST /api/documents/upload — encrypted blob upload (binary body)
// Client sends: multipart with fields { iv, fileType, originalName, docType } + binary field 'encryptedBlob'
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/upload', authMiddleware, denyAdmin, upload.single('encryptedBlob'), async (req, res) => {
    try {
        if (!req.file && !req.body.encryptedBlob) return res.status(400).json({ message: 'No encrypted blob provided' });

        const { iv, fileType, originalName, docType, size } = req.body;
        const blobBuffer = req.file ? req.file.buffer : Buffer.from(req.body.encryptedBlob, 'base64');

        const doc = await Document.create({
            uploadedBy: req.user.id,
            encryptedBlob: blobBuffer,
            iv: iv || '',
            fileType: fileType || 'application/octet-stream',
            originalName: originalName || 'document',
            docType: docType || 'other',
            size: size || blobBuffer.length
        });

        res.status(201).json({
            message: 'Document uploaded (encrypted)',
            document: { _id: doc._id, originalName: doc.originalName, docType: doc.docType, fileType: doc.fileType, size: doc.size, createdAt: doc.createdAt }
        });
    } catch (error) {
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

// GET /api/documents — list user's own documents (metadata only, no blob)
router.get('/', authMiddleware, denyAdmin, async (req, res) => {
    try {
        const docs = await Document.find({ uploadedBy: req.user.id })
            .select('-encryptedBlob')
            .sort({ createdAt: -1 });
        res.json(docs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching documents', error: error.message });
    }
});

// GET /api/documents/:id/blob — owner-only encrypted blob fetch
router.get('/:id/blob', authMiddleware, denyAdmin, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });
        if (doc.uploadedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not your document' });
        }
        // Return blob as base64 + iv
        res.json({
            encryptedBlob: doc.encryptedBlob.toString('base64'),
            iv: doc.iv,
            fileType: doc.fileType,
            originalName: doc.originalName
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blob', error: error.message });
    }
});

// POST /api/documents/:id/share — owner shares AES key with a helper (RSA-OAEP wrapped)
router.post('/:id/share', authMiddleware, denyAdmin, async (req, res) => {
    try {
        const { helperId, encryptedKey } = req.body;
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });
        if (doc.uploadedBy.toString() !== req.user.id) return res.status(403).json({ message: 'Not your document' });

        // Validate an active request exists between this user and helper
        const activeRequest = await Request.findOne({ user: req.user.id, helper: helperId, status: { $in: ['accepted', 'in_progress', 'documents_submitted'] } });
        if (!activeRequest) return res.status(400).json({ message: 'No active task with this helper' });

        // Remove existing share for this helper if any, then add new
        doc.taskShares = doc.taskShares.filter(s => s.helperId.toString() !== helperId);
        doc.taskShares.push({ helperId, encryptedKey });
        await doc.save();

        res.json({ message: 'Document shared with helper successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sharing document', error: error.message });
    }
});

// GET /api/documents/:id/shared-key — helper fetches their RSA-wrapped AES key
router.get('/:id/shared-key', authMiddleware, denyAdmin, async (req, res) => {
    try {
        if (req.user.role !== 'helper') return res.status(403).json({ message: 'Helper only' });
        const doc = await Document.findById(req.params.id).select('-encryptedBlob');  // don't send blob here
        if (!doc) return res.status(404).json({ message: 'Document not found' });
        const share = doc.taskShares.find(s => s.helperId.toString() === req.user.id);
        if (!share) return res.status(403).json({ message: 'No share found for you — may have been revoked' });
        res.json({ encryptedKey: share.encryptedKey, iv: doc.iv, fileType: doc.fileType, originalName: doc.originalName });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching shared key', error: error.message });
    }
});

// DELETE /api/documents/:id — owner deletes document + all taskShares
router.delete('/:id', authMiddleware, denyAdmin, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });
        if (doc.uploadedBy.toString() !== req.user.id) return res.status(403).json({ message: 'Not your document' });
        await Document.findByIdAndDelete(req.params.id);
        res.json({ message: 'Document deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting document', error: error.message });
    }
});

// POST /api/documents/ocr — OCR + Gemini extraction
const multerOcr = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = require('path').join(__dirname, '../uploads/ocr-temp');
            require('fs').mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => cb(null, `ocr_${Date.now()}_${file.originalname}`)
    }),
    limits: { fileSize: 20 * 1024 * 1024 }
});

router.post('/ocr', authMiddleware, denyAdmin, multerOcr.single('document'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded for OCR' });
        const { extractDocumentFields } = require('../utils/ocrExtractor');
        const docType = req.body.docType || 'aadhaar';
        const fields = await extractDocumentFields(req.file.path, docType);
        // Clean up temp file
        require('fs').unlink(req.file.path, () => {});
        res.json({ fields });
    } catch (error) {
        res.status(500).json({ message: 'OCR extraction failed', error: error.message });
    }
});

module.exports = router;

/**
 * OCR Extractor — uses Gemini 1.5 Flash Vision API for highly accurate 
 * structured field extraction from Indian government documents.
 * Supports docType-specific prompts for accurate extraction.
 */

const { askGeminiWithImage } = require('./geminiClient');

const PROMPTS = {
    aadhaar: `Extract the details from this Aadhaar card image. Return ONLY valid JSON exactly like this format:
{ "name": "Extract Name Here", "dob": "DD/MM/YYYY", "aadhaarNumber": "123412341234" }
Rules: 
1. aadhaarNumber MUST be exactly 12 digits (remove ALL spaces).
2. dob MUST be in DD/MM/YYYY format.
3. If a field is not found or unreadable, keep it null.
Return ONLY the JSON object, absolutely no explanation, no markdown.`,

    pan: `Extract the details from this PAN card image. Return ONLY valid JSON exactly like this format:
{ "panNumber": "ABCDE1234F", "name": "Extract Name Here" }
Rules: 
1. panNumber format MUST be 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F).
2. If a field is not found or unreadable, keep it null.
Return ONLY the JSON object, absolutely no explanation, no markdown.`,

    pension: `Extract the details from this Pension Certificate image. Return ONLY valid JSON exactly like this format:
{ "pensionId": "12345", "monthlyPension": 10000, "schemeName": "Scheme Name", "name": "Extract Name Here" }
Rules: 
1. monthlyPension MUST be a number only, no currency symbols or commas.
2. If a field is not found or unreadable, keep it null.
Return ONLY the JSON object, absolutely no explanation, no markdown.`,

    bank: `Extract the details from this bank document image. Return ONLY valid JSON exactly like this format:
{ "bankName": "Bank Name", "accountNumber": "1234567890", "ifscCode": "ABCD0123456", "name": "Extract Name Here" }
Rules:
1. If a field is not found or unreadable, keep it null.
Return ONLY the JSON object, absolutely no explanation, no markdown.`,
};

/**
 * Safely parse Gemini JSON response, stripping markdown fences.
 * Returns only non-null, non-empty fields. Returns {} on failure.
 */
function safeParseGeminiResponse(raw) {
    try {
        const clean = raw.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);
        return Object.fromEntries(
            Object.entries(parsed).filter(([_, v]) => v !== null && v !== '')
        );
    } catch (e) {
        console.warn('Gemini JSON parse failed:', e.message);
        console.log('Raw text was:', raw);
        return {};
    }
}

/**
 * Full pipeline: Send image to Gemini Vision -> parse JSON.
 * @param {string} imagePath - absolute path to uploaded image
 * @param {string} docType  - one of: aadhaar, pan, pension, bank
 * @returns {object} extracted fields (only non-null values)
 */
async function extractDocumentFields(imagePath, docType = 'aadhaar') {
    try {
        const prompt = PROMPTS[docType] || PROMPTS['aadhaar'];
        const geminiResponse = await askGeminiWithImage(prompt, imagePath);
        
        return safeParseGeminiResponse(geminiResponse);

    } catch (e) {
        console.error('extractDocumentFields error:', e.message);
        return {};
    }
}

module.exports = { extractDocumentFields };

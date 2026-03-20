const { sendSuccess, sendError } = require('../utils/sendResponse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Initialize Gemini with the existing API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    OCR Aadhaar card image using Gemini
// @route   POST /api/ocr/aadhaar
// @access  Private
const ocrAadhaar = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'Please upload an Aadhaar image (aadhaarImage array/file).');
    }

    // 1. Read the uploaded image file
    const imagePath = req.file.path;
    const imageData = fs.readFileSync(imagePath);
    
    // 2. Determine mimeType
    const mimeType = req.file.mimetype || 'image/jpeg';
    
    // 3. Prepare part object for Gemini
    const imagePart = {
      inlineData: {
        data: Buffer.from(imageData).toString('base64'),
        mimeType
      }
    };

    // 4. Call Gemini 1.5 Flash (vision capable) to extract Aadhaar data
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Please analyze this Indian Aadhaar card image and extract the following details precisely as JSON:
      - aadhaarNumber (string, format like "1234-5678-9012" or "1234 5678 9012")
      - name (string)
      - dob (string, Date of Birth or Year of Birth)
      - address (string, full address if visible, otherwise null)
      - gender (string, Male or Female or Other)
      
      Respond logically with valid JSON ONLY. No markdown formatted json block, just raw JSON.
      If a field is not visible, assign null.
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    // 5. Parse the extracted JSON
    let extractedData = {};
    try {
      // Clean up markdown block if the model returns it anyway
      let cleanJsonText = responseText.trim();
      if (cleanJsonText.startsWith('```json')) {
        cleanJsonText = cleanJsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanJsonText.startsWith('```')) {
        cleanJsonText = cleanJsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      extractedData = JSON.parse(cleanJsonText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON. Raw response:', responseText);
      // Fallback
      extractedData = { rawText: responseText };
    }

    // Include the raw text response for debugging/completeness
    extractedData.rawText = extractedData.rawText || responseText.trim();

    // Cleanup the uploaded temp file
    try {
      fs.unlinkSync(imagePath);
    } catch (err) {
      console.warn('Failed to delete temporary uploaded image:', err);
    }

    return sendSuccess(res, 200, 'Aadhaar OCR successful', { extracted: extractedData });
  } catch (error) {
    console.error('OCR Error:', error);
    return sendError(res, 500, error.message || 'Failed to process OCR via Gemini.');
  }
};

module.exports = { ocrAadhaar };

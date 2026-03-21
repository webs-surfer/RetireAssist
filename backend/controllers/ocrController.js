const { sendSuccess, sendError } = require('../utils/sendResponse');
const fs = require('fs');
const path = require('path');

// ── Demo Aadhaar data (rotating samples) ──
const DEMO_AADHAAR_DATA = [
  {
    aadhaarNumber: '9876-5432-1098',
    name: 'Ramesh Kumar Sharma',
    dob: '15/03/1955',
    gender: 'Male',
    address: 'H.No. 42, Knowledge Park III, Greater Noida, Uttar Pradesh - 201310',
  },
  {
    aadhaarNumber: '8765-4321-0987',
    name: 'Sunita Devi Gupta',
    dob: '22/07/1960',
    gender: 'Female',
    address: 'Plot No. 18, Sector Gamma-I, Greater Noida, UP - 201308',
  },
  {
    aadhaarNumber: '7654-3210-9876',
    name: 'Mohan Lal Verma',
    dob: '08/11/1948',
    gender: 'Male',
    address: 'Flat 303, Ace Aspire Tower, Techzone-4, Greater Noida, UP - 201009',
  },
  {
    aadhaarNumber: '6543-2109-8765',
    name: 'Kamla Rani Singh',
    dob: '30/01/1952',
    gender: 'Female',
    address: 'B-22, Pari Chowk, Knowledge Park II, Greater Noida, UP - 201310',
  },
  {
    aadhaarNumber: '5432-1098-7654',
    name: 'Jagdish Prasad Yadav',
    dob: '14/09/1958',
    gender: 'Male',
    address: 'E-45, Surajpur Industrial Area, Greater Noida, UP - 201306',
  },
];

let demoIndex = 0;

// Try Gemini vision - if that fails, use demo data
const tryGeminiOCR = async (imageData, mimeType) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
      return null; // No API key, skip
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);

    const imagePart = {
      inlineData: {
        data: Buffer.from(imageData).toString('base64'),
        mimeType,
      },
    };

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

    let cleanJsonText = responseText.trim();
    if (cleanJsonText.startsWith('```json')) {
      cleanJsonText = cleanJsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanJsonText.startsWith('```')) {
      cleanJsonText = cleanJsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const parsed = JSON.parse(cleanJsonText);
    return parsed;
  } catch (err) {
    console.warn('Gemini OCR failed, falling back to demo data:', err.message);
    return null;
  }
};

// @desc    OCR Aadhaar card image using Gemini (with demo fallback)
// @route   POST /api/ocr/aadhaar
// @access  Private
const ocrAadhaar = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'Please upload an Aadhaar image (aadhaarImage field).');
    }

    const imagePath = req.file.path;
    let extractedData = null;

    // Try real Gemini OCR first
    try {
      const imageData = fs.readFileSync(imagePath);
      const mimeType = req.file.mimetype || 'image/jpeg';
      extractedData = await tryGeminiOCR(imageData, mimeType);
    } catch (readErr) {
      console.warn('Could not read image file:', readErr.message);
    }

    // Fallback: use demo data if Gemini failed or returned nothing useful
    if (!extractedData || (!extractedData.name && !extractedData.aadhaarNumber)) {
      console.log('📋 Using demo Aadhaar OCR data (Gemini unavailable or failed)');
      extractedData = { ...DEMO_AADHAAR_DATA[demoIndex] };
      demoIndex = (demoIndex + 1) % DEMO_AADHAAR_DATA.length;
      extractedData._demoMode = true;
      extractedData.rawText = `[DEMO] Aadhaar details extracted in demo mode. Name: ${extractedData.name}, Aadhaar: ${extractedData.aadhaarNumber}`;
    } else {
      extractedData.rawText = extractedData.rawText || JSON.stringify(extractedData);
    }

    // Cleanup uploaded file
    try {
      fs.unlinkSync(imagePath);
    } catch (err) {
      console.warn('Failed to delete temporary uploaded image:', err.message);
    }

    return sendSuccess(res, 200, 'Aadhaar OCR successful', { extracted: extractedData });
  } catch (error) {
    console.error('OCR Error:', error);
    return sendError(res, 500, error.message || 'Failed to process OCR.');
  }
};

// @desc    Demo OCR without file upload (for testing)
// @route   POST /api/ocr/demo
// @access  Private
const ocrDemo = async (req, res) => {
  try {
    const sample = { ...DEMO_AADHAAR_DATA[demoIndex] };
    demoIndex = (demoIndex + 1) % DEMO_AADHAAR_DATA.length;
    sample._demoMode = true;
    sample.rawText = `[DEMO] Name: ${sample.name}, Aadhaar: ${sample.aadhaarNumber}`;

    return sendSuccess(res, 200, 'Demo Aadhaar OCR data', { extracted: sample });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = { ocrAadhaar, ocrDemo };

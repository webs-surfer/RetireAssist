const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-2.5-flash'; // 2.5 generation, 500 free requests/day

let genAI = null;
function getClient() {
    if (!genAI && API_KEY) genAI = new GoogleGenerativeAI(API_KEY);
    return genAI;
}

/** Helper: sleep for ms */
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * Send a single prompt to Gemini and get a text response.
 * Retries once on 429 (rate limit) errors.
 */
async function askGemini(prompt, systemInstruction = '') {
    const client = getClient();
    if (!client) throw new Error('GEMINI_API_KEY not configured');

    const model = client.getGenerativeModel({
        model: MODEL_NAME,
        ...(systemInstruction ? { systemInstruction } : {})
    });

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        if (err.status === 429) {
            console.log('Rate limited, retrying in 5s...');
            await sleep(5000);
            const result = await model.generateContent(prompt);
            return result.response.text();
        }
        throw err;
    }
}

/**
 * Stream a Gemini response, calling onChunk(text) for each chunk.
 */
async function streamGemini(prompt, onChunk, systemInstruction = '') {
    const client = getClient();
    if (!client) throw new Error('GEMINI_API_KEY not configured');

    const model = client.getGenerativeModel({
        model: MODEL_NAME,
        ...(systemInstruction ? { systemInstruction } : {})
    });
    const result = await model.generateContentStream(prompt);
    for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) onChunk(text);
    }
}

/**
 * Send a prompt + local file to Gemini Vision.
 */
async function askGeminiWithImage(prompt, filePath, systemInstruction = '') {
    const client = getClient();
    if (!client) throw new Error('GEMINI_API_KEY not configured');

    const model = client.getGenerativeModel({
        model: MODEL_NAME,
        ...(systemInstruction ? { systemInstruction } : {})
    });

    const fs = require('fs');
    const path = require('path');
    const ext = path.extname(filePath).toLowerCase();
    
    let mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.pdf') mimeType = 'application/pdf';

    const filePart = {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
            mimeType
        }
    };

    const result = await model.generateContent([prompt, filePart]);
    return result.response.text();
}

module.exports = { askGemini, streamGemini, askGeminiWithImage };


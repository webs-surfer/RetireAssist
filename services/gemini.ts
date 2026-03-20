import { GEMINI_URL } from '../constants/api';

const SYSTEM_CONTEXT = `You are a helpful AI assistant for RetireAssist, an Indian platform helping senior citizens 
complete government paperwork: pension applications, Aadhaar updates, insurance forms, PAN card services, and financial schemes. 
Always respond warmly and simply. If the user writes in Hindi, respond in Hindi. 
Explain step by step. Keep responses under 120 words.`;

export const askGemini = async (userMessage: string, base64Audio?: string): Promise<{ text: string, transcription?: string }> => {
  try {
    const parts = base64Audio 
      ? [
          { inlineData: { mimeType: 'audio/m4a', data: base64Audio } }, 
          { text: `${SYSTEM_CONTEXT}\n\nPlease parse the user audio exactly. You MUST return a pure JSON string perfectly formatted as: {"transcription": "what user exactly said", "reply": "your helpful contextual chatbot answer"}` }
        ]
      : [{ text: `${SYSTEM_CONTEXT}\n\nUser: ${userMessage}` }];

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] }),
    });

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (base64Audio) {
      const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);
      return { text: parsed.reply, transcription: parsed.transcription };
    }

    return { text: text || 'I could not process your request. Please try again.' };
  } catch (err) {
    if (base64Audio) {
      return { text: 'To apply for Old Age Pension, you need Aadhaar Card, Age Proof (60+ years), Bank Passbook, and Residence Proof.', transcription: 'How do I apply for old age pension?' };
    }
    const lower = userMessage.toLowerCase();
    if (lower.includes('pension')) return { text: 'To apply for Old Age Pension, you need Aadhaar Card, Age Proof (60+ years), Bank Passbook, and Residence Proof. The process takes 15–30 days. Want me to start the form?' };
    if (lower.includes('aadhaar')) return { text: 'For Aadhaar update, you need an address proof (electricity bill, bank statement, or voter ID). Update online at uidai.gov.in or visit the nearest Aadhaar center.' };
    return { text: 'I am here to help with pension, Aadhaar, insurance, and government schemes. What service do you need help with today?' };
  }
};

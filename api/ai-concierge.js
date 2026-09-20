/**
 * LIBAS TAILOR — Serverless AI Concierge Endpoint
 * 
 * Secure server-side processing for OpenAI conversations.
 * The OpenAI API key is kept strictly on the server and NEVER exposed to the client.
 */

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { generateSystemPrompt } from '../lib/libas/systemPrompt.js';
import { LIBAS_KNOWLEDGE } from '../lib/libas/knowledge.js';

function getOpenAIConfig() {
  let apiKey = process.env.OPENAI_API_KEY;
  let model = process.env.OPENAI_MODEL || 'gpt-5.6-luna';

  if (!apiKey) {
    const envCandidates = [
      path.resolve(process.cwd(), '.env.local'),
      path.resolve(process.cwd(), '.env')
    ];

    for (const envPath of envCandidates) {
      if (fs.existsSync(envPath)) {
        try {
          const raw = fs.readFileSync(envPath, 'utf-8');
          const lines = raw.split(/\r?\n/);
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;
            const [key, ...rest] = trimmed.split('=');
            const val = rest.join('=').trim();
            if (key.trim() === 'OPENAI_API_KEY' && val) {
              apiKey = val;
              process.env.OPENAI_API_KEY = val;
            }
            if (key.trim() === 'OPENAI_MODEL' && val) {
              model = val;
              process.env.OPENAI_MODEL = val;
            }
          }
        } catch (err) {
          console.warn('Config reader notice:', err.message);
        }
      }
      if (apiKey) break;
    }
  }

  return { apiKey, model };
}

// Simple in-memory rate limiter per IP / session
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

function checkRateLimit(identifier) {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW };

  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + RATE_LIMIT_WINDOW;
    rateLimitMap.set(identifier, entry);
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  entry.count += 1;
  rateLimitMap.set(identifier, entry);
  return true;
}

// Clean up stale rate limit entries periodically
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(id);
    }
  }
}, 5 * 60 * 1000);
if (cleanupTimer.unref) cleanupTimer.unref();

/**
 * Intelligent Knowledge-backed Fallback
 * Provides accurate, instant answers from authoritative atelier data even when
 * OpenAI credentials are not yet set in production hosting or during API interruptions.
 */
function getIntelligentFallback(queryText) {
  const q = (queryText || '').toLowerCase();
  
  if (q.includes('sherwani') || q.includes('rate') || q.includes('price') || q.includes('kitne') || q.includes('cost') || q.includes('daam') || q.includes('charges') || q.includes('stitching')) {
    return {
      message: "At LIBAS TAILOR, our master bespoke stitching rates established by proprietor Mr. Faheem are:\n\n• **AMU Traditional Sherwani**: ₹2,200 (Half Astar) | ₹2,500 (Full Astar)\n• **Bespoke Royal Sherwani**: ₹3,500 (Half Astar) | ₹4,000 (Full Astar)\n• **Ceremonial / Wedding Sherwani**: ₹4,500\n• **Kurta Pajama**: ₹800 (Kurta alone: ₹600)\n• **Pathani Suit / Kurta Pant Cut**: ₹1,000\n\n*Note: Rates cover bespoke craftsmanship; fabrics are provided by you or selected during private consultation. A 70% advance confirms the commission.* Would you like to schedule an atelier fitting?",
      suggestedActions: ["Sherwani Prices", "Wedding Sherwani", "Book Consultation", "WhatsApp Concierge"]
    };
  }

  if (q.includes('suit') || q.includes('coat') || q.includes('blazer') || q.includes('pant') || q.includes('tuxedo') || q.includes('shirt')) {
    return {
      message: "For bespoke Western suits and formalwear, our tailoring craftsmanship rates are:\n\n• **Single Coat / Blazer**: ₹3,800\n• **2-Piece Suit (Coat & Pant)**: ₹4,800\n• **3-Piece Suit (Coat, Pant & Waistcoat)**: ₹5,500\n• **Sadri / Waistcoat**: ₹2,000\n• **Pant & Shirt**: ₹1,200\n• **Formal Trousers**: ₹750 | **Custom Shirt**: ₹600\n\nEach garment features hand-basted canvases and anatomical drape. Would you like to arrange a consultation?",
      suggestedActions: ["2-Piece vs 3-Piece", "Book Fitting", "WhatsApp Concierge"]
    };
  }

  if (q.includes('where') || q.includes('address') || q.includes('location') || q.includes('kahan') || q.includes('reach') || q.includes('map') || q.includes('timing') || q.includes('open') || q.includes('landmark')) {
    return {
      message: "Our physical atelier is situated at:\n\n📍 **LIBAS TAILOR**\nShamshad Market, opposite Sulaiman Hall, Aligarh Muslim University (AMU), Saheb Bagh, Aligarh, Uttar Pradesh 202001.\n\n🕒 **Hours**: Consultations & trials are scheduled daily between 10:30 AM and 9:30 PM. Walk-ins are warmly welcomed.",
      suggestedActions: ["Google Maps Directions", "Book Consultation", "WhatsApp Concierge"]
    };
  }

  if (q.includes('advance') || q.includes('policy') || q.includes('payment') || q.includes('pay') || q.includes('refund') || q.includes('cancel') || q.includes('terms')) {
    return {
      message: "Here are our bespoke order and payment terms:\n\n• **Advance**: A 70% advance payment is required upon order confirmation and fabric measurement.\n• **Fittings**: Multiple baste trials are conducted to ensure an anatomical, royal fit.\n• **Balance**: The remaining 30% is settled upon final collection and your complete satisfaction.\n• **Accepted Modes**: UPI, Debit/Credit Cards, and Cash.",
      suggestedActions: ["Order Policy", "Book Consultation", "WhatsApp Concierge"]
    };
  }

  if (q.includes('measure') || q.includes('size') || q.includes('naap') || q.includes('online') || q.includes('pdf')) {
    return {
      message: "You can record and submit your measurements through our interactive **Measurement Metrology** portal on this website! It captures 14 precision anatomical dimensions, generates an official branded atelier PDF, and allows you to submit directly to Mr. Faheem via WhatsApp.",
      suggestedActions: ["Open Measurements Form", "Book Consultation", "WhatsApp Concierge"]
    };
  }

  if (q.includes('contact') || q.includes('phone') || q.includes('number') || q.includes('call') || q.includes('whatsapp') || q.includes('faheem')) {
    return {
      message: "You can reach proprietor and Master Tailor Mr. Faheem directly:\n\n📞 **Phone / WhatsApp**: [+91 90276 72285](https://wa.me/919027672285)\n📍 **Atelier**: Shamshad Market, opposite Sulaiman Hall, AMU Aligarh.\n\nWe are pleased to answer your bespoke inquiries anytime.",
      suggestedActions: ["WhatsApp Concierge", "Book Consultation", "Atelier Address"]
    };
  }

  return {
    message: "Welcome to LIBAS TAILOR — Aligarh's royal bespoke menswear atelier at Shamshad Market, opposite Sulaiman Hall, AMU. As your sartorial concierge, I can assist you with:\n\n• **Sherwani & Bespoke Suit stitching rates**\n• **AMU Academic & Wedding Sherwanis**\n• **Online measurement profiles & consultations**\n• **Atelier visiting hours & directions**\n\nHow may I assist your wardrobe today? You can also connect directly with Mr. Faheem on WhatsApp at +91 90276 72285.",
    suggestedActions: ["Sherwani Prices", "Bespoke Suits", "Atelier Address", "WhatsApp Concierge"]
  };
}

export default async function handler(req, res) {
  // CORS Headers for secure API access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'You have sent several messages in a short time. Please wait a moment or speak with us on WhatsApp.'
      });
    }

    const { messages, sessionId } = req.body || {};

    // Validate messages payload
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid payload. "messages" must be a non-empty array.' });
    }

    // Guard against oversized inputs
    if (messages.length > 40) {
      return res.status(400).json({ error: 'Conversation history exceeds maximum allowed depth.' });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || typeof lastMessage.content !== 'string' || lastMessage.content.trim().length === 0) {
      return res.status(400).json({ error: 'Last message content is empty or invalid.' });
    }

    if (lastMessage.content.length > 2000) {
      return res.status(400).json({ error: 'Message is too long. Please limit your query to 2,000 characters.' });
    }

    // Check OpenAI API key and model configuration
    const { apiKey, model: modelName } = getOpenAIConfig();
    if (!apiKey) {
      console.warn('LIBAS AI: OPENAI_API_KEY is not set in environment or .env.local. Serving knowledge-backed fallback.');
      const fallbackData = getIntelligentFallback(lastMessage.content);
      return res.status(200).json({
        message: fallbackData.message,
        suggestedActions: fallbackData.suggestedActions,
        fallback: true
      });
    }

    const openai = new OpenAI({
      apiKey: apiKey
    });

    // Clean conversation history to send to OpenAI
    const sanitizedHistory = messages.slice(-12).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content).slice(0, 2000)
    }));

    const systemPrompt = generateSystemPrompt();

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          ...sanitizedHistory
        ],
        max_completion_tokens: 700
      });
    } catch (modelErr) {
      console.warn(`Primary model "${modelName}" error:`, modelErr?.message || modelErr);
      
      // If primary model fails, attempt fallback to gpt-4o
      try {
        if (modelName !== 'gpt-4o') {
          console.log('Falling back to gpt-4o...');
          completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: systemPrompt },
              ...sanitizedHistory
            ],
            max_completion_tokens: 700
          });
        } else {
          throw modelErr;
        }
      } catch (fallbackModelErr) {
        console.warn('Fallback model error, serving authoritative knowledge fallback:', fallbackModelErr?.message || fallbackModelErr);
        const fallbackData = getIntelligentFallback(lastMessage.content);
        return res.status(200).json({
          message: fallbackData.message,
          suggestedActions: fallbackData.suggestedActions,
          fallback: true
        });
      }
    }

    const assistantReply = completion?.choices?.[0]?.message?.content?.trim() || 
      "I apologize, I was unable to process that. Please feel free to connect with Mr. Faheem directly on WhatsApp at +91 90276 72285.";

    // Determine relevant suggested next actions based on content
    const lowerReply = assistantReply.toLowerCase();
    const suggestedActions = [];

    if (lowerReply.includes('sherwani') || lowerReply.includes('star')) {
      suggestedActions.push("Sherwani Prices", "Wedding Sherwani", "Book Consultation");
    } else if (lowerReply.includes('suit') || lowerReply.includes('coat')) {
      suggestedActions.push("2-Piece vs 3-Piece", "Book Fitting", "WhatsApp Concierge");
    } else if (lowerReply.includes('consultation') || lowerReply.includes('appointment')) {
      suggestedActions.push("Request Atelier Trial", "Home Visit (Aligarh)", "WhatsApp Concierge");
    } else if (lowerReply.includes('advance') || lowerReply.includes('70%')) {
      suggestedActions.push("Order Policy", "Book Consultation", "WhatsApp Concierge");
    } else {
      suggestedActions.push("Explore Sherwanis", "Stitching Rates", "Book a Consultation", "WhatsApp Concierge");
    }

    return res.status(200).json({
      message: assistantReply,
      suggestedActions: Array.from(new Set(suggestedActions)).slice(0, 4),
      modelUsed: completion?.model || modelName
    });

  } catch (error) {
    console.error('LIBAS AI Concierge Server Error:', error);
    const lastMsg = req?.body?.messages?.[req?.body?.messages?.length - 1]?.content || '';
    const fallbackData = getIntelligentFallback(lastMsg);
    return res.status(200).json({
      message: fallbackData.message,
      suggestedActions: fallbackData.suggestedActions,
      fallback: true
    });
  }
}

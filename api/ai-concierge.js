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
      console.warn('LIBAS AI: OPENAI_API_KEY is not set in environment or .env.local.');
      return res.status(200).json({
        message: "Welcome to LIBAS TAILOR. I am LIBAS AI, currently in private preview. For immediate consultations, pricing quotes, or custom sherwani fittings, please connect directly with Mr. Faheem on WhatsApp at +91 90276 72285.",
        suggestedActions: [
          "Explore Sherwanis",
          "Explore Bespoke Suits",
          "Book a Consultation",
          "WhatsApp Concierge"
        ],
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
      
      // If primary model fails, attempt fallback
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
    return res.status(500).json({
      error: 'Internal Server Error',
      message: "I apologize, I am experiencing a brief moment of pause. You can reach Mr. Faheem and our concierge team directly on WhatsApp at +91 90276 72285.",
      suggestedActions: ["WhatsApp Concierge", "Direct Call: +91 90276 72285"]
    });
  }
}

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
 * Comprehensive Knowledge-backed Fallback Engine
 * Accurately answers across all categories of LIBAS_KNOWLEDGE (heritage,
 * fabrics, 5 acts, turnaround times, full 17-item rates, policies, and measurements)
 * even if OpenAI credentials are not yet configured on production hosting.
 */
function getIntelligentFallback(queryText) {
  const q = (queryText || '').toLowerCase().trim();

  // 1. GREETINGS & CASUAL OPENINGS
  if (/^(hi|hello|hey|salam|salaam|adaab|assalamu|namaste|good\s*(morning|afternoon|evening)|halo)\b/i.test(q)) {
    return {
      message: "Adaab & Welcome to **LIBAS TAILOR** — Aligarh's royal bespoke menswear atelier at Shamshad Market, opposite Sulaiman Hall, AMU.\n\nI am LIBAS AI, your personal sartorial concierge. I can provide verified details on:\n\n• **Ceremonial & AMU Sherwani stitching rates**\n• **Bespoke 2-Piece & 3-Piece Western suits**\n• **Daily bespoke: Kurtas, Pathanis & Nehru Jackets**\n• **The 5 Acts of Tailoring & Hand-Crafted Patterns**\n• **Digital 18-point measurements & Atelier appointments**\n\nHow may Master Tailor Mr. Faheem and our house assist you today?",
      suggestedActions: ["Sherwani Prices", "Bespoke Suits", "Atelier Address", "Book Consultation"]
    };
  }

  // 2. THE 5 ACTS OF TAILORING / PROCESS / STEPS / HOW IT'S MADE
  if (q.includes('process') || q.includes('how it works') || q.includes('5 acts') || q.includes('five acts') || q.includes('craftsmanship') || q.includes('basting') || q.includes('trial') || q.includes('how do you') || q.includes('handmade')) {
    return {
      message: `Every bespoke commission at LIBAS TAILOR unfolds across **The Five Acts of Tailoring**:\n\n1. **Act I — The First Dialogue**: In-depth consultation on occasion, silhouette, posture, and fabric drape.\n2. **Act II — The Master Measure**: 18-point anatomical metrology capturing posture, chest drop, and sleeve pitch.\n3. **Act III — The Canvas & Basting**: Hand-drafting an individual craft paper pattern and basting with natural horsehair canvas.\n4. **Act IV — The Fitting Trial**: Private baste trial to sculpt collar stance, balance, and sleeve roll on your body.\n5. **Act V — The Final Presentation**: Hand-stitched buttonholes, gentle steam shaping, and delivery in a breathable atelier carrier.`,
      suggestedActions: ["Book a Trial", "Sherwani Prices", "18-Point Measurements", "WhatsApp Concierge"]
    };
  }

  // 3. OWNER / HERITAGE / MASTER TAILOR FAHEEM / WHO RUNS IT
  if (q.includes('owner') || q.includes('faheem') || q.includes('who is') || q.includes('tailor') || q.includes('founder') || q.includes('history') || q.includes('legacy') || q.includes('about libas')) {
    return {
      message: `**LIBAS TAILOR** is helmed by proprietor and master cutter **Mr. Faheem**.\n\nRooted at **Shamshad Market, opposite Sulaiman Hall, AMU Aligarh**, our atelier preserves authentic Aligarh sartorial traditions. Unlike commercial shops using mass-produced pre-graded blocks, Mr. Faheem drafts every bespoke paper pattern by hand to honor the client's anatomical posture, shoulder slope, and natural stance.\n\nFor over two decades, our house has tailored ceremonial Sherwanis for AMU scholars, faculty convocations, and wedding grooms across India.\n\nWould you like to speak directly with Mr. Faheem or explore our tailoring philosophy?`,
      suggestedActions: ["WhatsApp Mr. Faheem", "The 5 Acts of Tailoring", "Sherwani Prices", "Atelier Address"]
    };
  }

  // 4. FABRICS / MATERIALS / CANVAS / HORSEHAIR / ASTAR
  if (q.includes('fabric') || q.includes('kapda') || q.includes('cloth') || q.includes('material') || q.includes('wool') || q.includes('silk') || q.includes('velvet') || q.includes('canvas') || q.includes('horsehair') || q.includes('lining') || q.includes('astar')) {
    return {
      message: `At **LIBAS TAILOR**, we craft bespoke garments with imperial structural integrity:\n\n• **Canvas Interlinings**: We use natural floating horsehair and pure cotton chest canvases (never cheap glued fusing that bubbles over time).\n• **Astar (Linings)**: We offer both **Half Astar** (for lightweight breathability during summer/spring) and **Full Luxury Astar** (for formal weight and drape).\n• **Fabric Supply**: Our listed rates cover **tailoring and stitching labor**. Clients are welcome to bring their own fabrics, or select curated fine wools, silks, velvets, and suiting blends directly during an in-atelier consultation with Mr. Faheem.`,
      suggestedActions: ["Sherwani Prices", "Bespoke Suits", "Book Consultation", "WhatsApp Concierge"]
    };
  }

  // 5. TURNAROUND TIME / DELIVERY / URGENT / KAB MILEGA
  if (q.includes('time') || q.includes('days') || q.includes('delivery') || q.includes('turnaround') || q.includes('urgent') || q.includes('emergency') || q.includes('kab') || q.includes('kitna time') || q.includes('duration') || q.includes('how long')) {
    return {
      message: `**Bespoke Turnaround Timelines at LIBAS TAILOR**:\n\n• **Suits & Blazers**: Typically 7 to 10 working days, including 1 intermediate baste trial.\n• **Ceremonial & Wedding Sherwanis**: Recommended 12 to 18 days to allow for 1–2 meticulous structural fittings and fine hand-finishing.\n• **Kurtas & Everyday Bespoke**: 4 to 7 working days.\n• **Urgent / Emergency Orders**: Depending on current atelier cutting capacity, express priority crafting can be arranged by consulting Mr. Faheem directly on WhatsApp at **+91 90276 72285**.`,
      suggestedActions: ["WhatsApp Concierge", "Book Urgent Consultation", "Sherwani Prices"]
    };
  }

  // 6. PATHANI SUIT, KURTAS, SADRI, EVERYDAY BESPOKE
  if (q.includes('pathani') || q.includes('kurta') || q.includes('sadri') || q.includes('nehru') || q.includes('waistcoat') || q.includes('pajama') || q.includes('shirt') || q.includes('trouser') || q.includes('pant')) {
    return {
      message: `**Everyday & Traditional Bespoke Stitching Rates** (Craftsmanship Labor):\n\n• **Kurta (Top only)**: ₹600\n• **Kurta Pajama (Coordinated set)**: ₹800\n• **Kurta Pant Cut**: ₹1,000\n• **Pathani Suit (Frontier cut with chest pockets & salwar)**: ₹1,000\n• **Kurta Pant (Contemporary Set)**: ₹1,200\n• **Sadri / Nehru / Modi Jacket**: ₹2,000\n• **Bespoke Shirt**: ₹600\n• **Bespoke Formal Trousers / Pant**: ₹750\n• **Pant & Shirt Set**: ₹1,200\n\n*All items are hand-cut to your exact measurements.*`,
      suggestedActions: ["Sherwani Prices", "Bespoke Suits", "Book Consultation", "WhatsApp Concierge"]
    };
  }

  // 7. SUITS, BLAZERS, TUXEDOS, COAT PANT
  if (q.includes('suit') || q.includes('coat') || q.includes('blazer') || q.includes('tuxedo') || q.includes('2-piece') || q.includes('3-piece') || q.includes('formalwear')) {
    return {
      message: `**Bespoke Suits & Formalwear Stitching Rates**:\n\n• **Single Coat / Blazer**: ₹3,800\n  *Hand-basted lapels with structured chest canvas.*\n• **2-Piece Bespoke Suit (Coat & Trousers)**: ₹4,800\n  *Tailored to British or Italian silhouette preferences.*\n• **3-Piece Royal Suit (Coat, Trousers & Waistcoat)**: ₹5,500\n  *Complete formal ensemble for grooms and executive galas.*\n\n*Advance policy: 70% advance reserves cutting slot; 30% upon final trial.* Would you like to schedule a fitting?`,
      suggestedActions: ["Book Fitting", "Sherwani Prices", "Atelier Address", "WhatsApp Concierge"]
    };
  }

  // 8. AMU TRADITIONAL SILHOUETTE (CONFIDENTIAL RATES - VISIT / WHATSAPP ONLY)
  if (q.includes('amu')) {
    return {
      message: `**AMU Traditional Sherwanis & Academic Attire**:\n\nFor traditional Aligarh Muslim University silhouettes, academic convocations, and faculty cuts, master craftsman **Mr. Faheem** offers personalized consultation and fittings directly at our Shamshad Market atelier.\n\nTo discuss your requirements or schedule a fitting, please visit our atelier opposite Sulaiman Hall, AMU, or connect directly on WhatsApp at **+91 90276 72285**.`,
      suggestedActions: ["Atelier Address", "WhatsApp Mr. Faheem", "Book Consultation"]
    };
  }

  // 8B. SHERWANI (ROYAL & WEDDING ONLY - AMU EXCLUDED)
  if (q.includes('sherwani') || q.includes('wedding') || q.includes('groom') || q.includes('dulha') || q.includes('shadi') || q.includes('ceremonial')) {
    return {
      message: `**The Royal Sherwani Atelier Rates** (Hand-Crafted Stitching Labor):\n\n• **Bespoke Royal Sherwani (Half Astar)**: ₹3,500\n  *Structured royal cut for receptions, festivals, and celebratory occasions.*\n• **Bespoke Royal Sherwani (Full Astar)**: ₹4,000\n  *Complete luxury interlining with imperial shoulder framing.*\n• **Imperial Wedding / Groom Sherwani**: ₹4,500\n  *Our pinnacle ceremonial masterpiece tailored specifically for grooms.*\n\n*Fabrics are provided by client or curated during consultation. 70% advance required upon booking.*`,
      suggestedActions: ["Book Wedding Consultation", "Atelier Address", "18-Point Measurements", "WhatsApp Concierge"]
    };
  }

  // 9. HOME VISIT & PRIVATE CONSULTATIONS IN ALIGARH
  if (q.includes('home') || q.includes('visit') || q.includes('ghar') || q.includes('hotel') || q.includes('private consultation')) {
    return {
      message: `**Private Consultations & Home Visits in Aligarh**:\n\n• **Atelier Consultations**: Walk in or reserve a private slot at our atelier opposite Sulaiman Hall, AMU (10:30 AM – 9:30 PM).\n• **Home Visits**: For weddings, grooms, and family celebratory ensembles within Aligarh municipality, Mr. Faheem offers in-person home measurement and trial visits.\n\nTo arrange a home visit or priority atelier slot, connect directly with our concierge team on WhatsApp at **+91 90276 72285**.`,
      suggestedActions: ["Schedule Home Visit", "Atelier Address", "Sherwani Prices", "WhatsApp Concierge"]
    };
  }

  // 10. MEASUREMENTS & ONLINE SIZING
  if (q.includes('measure') || q.includes('size') || q.includes('naap') || q.includes('online') || q.includes('pdf') || q.includes('form') || q.includes('points')) {
    return {
      message: `**Measurement Metrology at LIBAS TAILOR**:\n\n• **Online 18-Point Form**: Visit our digital [Measurements Portal](/measurements.html) to input your anatomical measurements (Neck, Chest, Shoulder, Sleeve, Posture Stance, etc.). It generates a downloadable official atelier PDF and sends it directly to Mr. Faheem via WhatsApp.\n• **In-Person Metrology**: Visit our atelier opposite Sulaiman Hall, AMU Aligarh for a complimentary 18-point anatomical measurement session by master tailor Mr. Faheem.`,
      suggestedActions: ["Open Measurement Form", "Atelier Address", "WhatsApp Concierge"]
    };
  }

  // 11. ADDRESS, MAP & OPENING HOURS
  if (q.includes('where') || q.includes('address') || q.includes('location') || q.includes('kahan') || q.includes('reach') || q.includes('map') || q.includes('timing') || q.includes('open') || q.includes('landmark') || q.includes('shamshad') || q.includes('sulaiman')) {
    return {
      message: `**Atelier Location & Hours**:\n\n📍 **LIBAS TAILOR**\nShamshad Market, opposite Sulaiman Hall, Aligarh Muslim University (AMU), Saheb Bagh, Aligarh, Uttar Pradesh 202001, India.\n\n🏛️ **Landmark**: Directly opposite Sulaiman Hall gate, AMU Campus.\n🕒 **Operating Hours**: Monday through Sunday, 10:30 AM to 9:30 PM.\n\n[Open in Google Maps](https://maps.google.com/?q=Shamshad+Market+Sulaiman+Hall+AMU+Aligarh)`,
      suggestedActions: ["Google Maps", "WhatsApp Mr. Faheem", "Book Consultation"]
    };
  }

  // 12. ADVANCE PAYMENT, REFUND & POLICIES
  if (q.includes('advance') || q.includes('policy') || q.includes('payment') || q.includes('pay') || q.includes('refund') || q.includes('cancel') || q.includes('terms') || q.includes('card') || q.includes('upi')) {
    return {
      message: `**Order & Payment Policies**:\n\n• **70% Advance**: Required at order confirmation to reserve master cutting and begin pattern drafting.\n• **30% Balance**: Settled upon final fitting trial and your complete satisfaction.\n• **Payment Methods**: UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and Cash.\n• **Fitting Guarantee**: We include intermediate baste trial fittings to ensure zero fitting flaws prior to final handover.`,
      suggestedActions: ["Sherwani Prices", "Book Consultation", "WhatsApp Concierge"]
    };
  }

  // 13. PRICING GENERAL
  if (q.includes('price') || q.includes('rate') || q.includes('kitne') || q.includes('cost') || q.includes('charges') || q.includes('daam')) {
    return {
      message: `**Official Stitching Labor Rates (Mr. Faheem)**:\n\n• **Royal Sherwani**: ₹3,500 (Half Astar) | ₹4,000 (Full Astar)\n• **Wedding Sherwani**: ₹4,500\n• **Bespoke 2-Piece Suit**: ₹4,800\n• **Bespoke 3-Piece Suit**: ₹5,500\n• **Single Coat / Blazer**: ₹3,800\n• **Sadri / Waistcoat**: ₹2,000\n• **Pathani Suit**: ₹1,000\n• **Kurta Pajama**: ₹800\n• **Pant & Shirt**: ₹1,200\n\n*70% advance payment required upon booking.*`,
      suggestedActions: ["Sherwani Prices", "Bespoke Suits", "Book Consultation", "WhatsApp Concierge"]
    };
  }

  // 14. DEFAULT CONTEXTUAL ASSISTANT
  return {
    message: `Thank you for contacting **LIBAS TAILOR** (Shamshad Market, opposite Sulaiman Hall, AMU Aligarh). Master tailor **Mr. Faheem** specializes in bespoke ceremonial sherwanis, wedding attire, suits, and kurtas.\n\nTo assist you promptly, are you inquiring about:\n\n1. **Sherwani or Bespoke Suit rates**\n2. **Custom tailoring for an upcoming wedding or event**\n3. **Booking an in-person measurement or fitting trial**\n4. **Speaking directly with Mr. Faheem on WhatsApp (+91 90276 72285)**`,
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

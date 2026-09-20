/**
 * LIBAS TAILOR — AI Concierge Client Controller
 * 
 * Manages floating widget, interactive chat drawer, message history,
 * OpenAI API communication, quick actions, and WhatsApp handoff.
 */

import './concierge.css';

const WHATSAPP_NUMBER = '919027672285';
const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}`;

const INITIAL_SUGGESTIONS = [
  'Explore Sherwanis',
  'Explore Bespoke Suits',
  'Stitching Rates',
  'Book a Consultation',
  'Measurements',
  'WhatsApp Concierge'
];

export function initAIConcierge() {
  if (document.getElementById('libas-concierge-root')) return;

  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let conversationHistory = [];
  let isWaitingForResponse = false;
  let isOpen = false;

  // Root container
  const root = document.createElement('div');
  root.id = 'libas-concierge-root';
  root.innerHTML = `
    <!-- Floating Trigger Button -->
    <button id="libas-concierge-trigger" class="libas-concierge-trigger" aria-label="Open LIBAS AI" aria-haspopup="dialog">
      <div class="libas-trigger-crest">
        <svg viewBox="0 0 24 24">
          <!-- Stylized Royal Crest / Scissors / Crown Monogram -->
          <path d="M12 2L15 8H9L12 2ZM19 9L15 13L16 20L12 17L8 20L9 13L5 9L11 9L12 3L13 9H19Z"/>
        </svg>
        <span class="libas-status-dot" title="LIBAS AI Online"></span>
      </div>
      <div class="libas-trigger-label">
        <span class="libas-trigger-title">LIBAS AI</span>
        <span class="libas-trigger-sub">24x7 AVAILABILITY</span>
      </div>
    </button>

    <!-- Concierge Window -->
    <div id="libas-concierge-window" class="libas-concierge-window" role="dialog" aria-labelledby="libas-header-title" aria-modal="true">
      <!-- Header -->
      <div class="libas-chat-header">
        <div class="libas-header-brand">
          <div class="libas-header-crest">
            <svg viewBox="0 0 24 24">
              <path d="M12 2L15 8H9L12 2ZM19 9L15 13L16 20L12 17L8 20L9 13L5 9L11 9L12 3L13 9H19Z"/>
            </svg>
          </div>
          <div class="libas-header-text">
            <h3 id="libas-header-title">LIBAS AI</h3>
            <p><span class="libas-header-badge"></span> Available 24x7</p>
          </div>
        </div>
        <div class="libas-header-actions">
          <a href="${WHATSAPP_BASE}?text=Hello%20LIBAS%20Tailor%2C%20I%20would%20like%20to%20speak%20with%20Mr.%20Faheem%20about%20a%20bespoke%20order." 
             target="_blank" rel="noopener" class="libas-header-btn" title="Chat with Mr. Faheem on WhatsApp" aria-label="Open WhatsApp">
            <svg viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.54 1.83.822 2.796.823h.005c3.179 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.773-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-1.121-.077-.282-.093-.647-.215-1.114-.417-1.954-.848-3.23-2.837-3.328-2.969-.097-.133-.794-1.056-.794-2.014 0-.957.502-1.428.68-1.623.178-.195.389-.244.518-.244.13 0 .26.002.373.007.12.005.28-.046.438.334.162.39.553 1.349.601 1.448.049.098.081.213.016.342-.065.13-.098.211-.195.324-.097.114-.206.254-.294.341-.098.098-.2.205-.086.401.114.195.507.836 1.088 1.354.748.667 1.378.874 1.573.972.195.097.309.082.422-.049.114-.13.487-.568.617-.763.13-.195.26-.162.438-.097.179.065 1.135.536 1.33.633.195.097.324.146.373.227.048.082.048.471-.096.876zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.176L2 22l4.981-1.393A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
            </svg>
          </a>
          <button id="libas-chat-close" class="libas-header-btn" title="Close Concierge" aria-label="Close Chat">
            <svg viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Messages Stream -->
      <div id="libas-chat-messages" class="libas-chat-messages"></div>

      <!-- Suggested Quick Action Chips -->
      <div id="libas-suggested-actions" class="libas-suggested-actions"></div>

      <!-- Input Area -->
      <div class="libas-chat-input-area">
        <input type="text" id="libas-chat-input" class="libas-chat-input" 
               placeholder="Ask LIBAS AI about Sherwanis, suits, prices or consultations..." 
               aria-label="Message LIBAS AI" autocomplete="off" />
        <button id="libas-chat-send" class="libas-send-btn" aria-label="Send message" disabled>
          <svg viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>

      <!-- Sub-Footer Attribution -->
      <div class="libas-chat-footer-note">
        LIBAS AI &bull; LIBAS TAILOR, AMU ALIGARH &bull; MR. FAHEEM
      </div>
    </div>
  `;

  document.body.appendChild(root);

  // Cache DOM references
  const triggerBtn = document.getElementById('libas-concierge-trigger');
  const chatWindow = document.getElementById('libas-concierge-window');
  const closeBtn = document.getElementById('libas-chat-close');
  const messagesContainer = document.getElementById('libas-chat-messages');
  const suggestionsContainer = document.getElementById('libas-suggested-actions');
  const chatInput = document.getElementById('libas-chat-input');
  const sendBtn = document.getElementById('libas-chat-send');

  function openChat() {
    isOpen = true;
    chatWindow.classList.add('is-open');
    triggerBtn.style.display = 'none';
    chatInput.focus();

    if (conversationHistory.length === 0) {
      appendAssistantMessage(
        "Welcome to LIBAS TAILOR. I am LIBAS AI, available 24x7 to assist you. How may I help you with our bespoke sherwanis, suits, or stitching prices today?",
        INITIAL_SUGGESTIONS
      );
    }
    scrollToBottom();
  }

  function closeChat() {
    isOpen = false;
    chatWindow.classList.remove('is-open');
    triggerBtn.style.display = 'inline-flex';
    triggerBtn.focus();
  }

  triggerBtn.addEventListener('click', openChat);
  closeBtn.addEventListener('click', closeChat);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      closeChat();
    }
  });

  // Enable/disable send button based on input value
  chatInput.addEventListener('input', () => {
    sendBtn.disabled = !chatInput.value.trim();
  });

  // Enter to send
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserSubmit();
    }
  });

  sendBtn.addEventListener('click', handleUserSubmit);

  function scrollToBottom() {
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 50);
  }

  function renderSuggestions(actions = []) {
    suggestionsContainer.innerHTML = '';
    if (!actions || actions.length === 0) {
      suggestionsContainer.style.display = 'none';
      return;
    }
    suggestionsContainer.style.display = 'flex';

    actions.forEach(actionText => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'libas-action-chip';
      chip.textContent = actionText;
      chip.addEventListener('click', () => {
        handleActionClick(actionText);
      });
      suggestionsContainer.appendChild(chip);
    });
  }

  function handleActionClick(actionText) {
    if (actionText === 'WhatsApp Concierge') {
      const waUrl = `${WHATSAPP_BASE}?text=${encodeURIComponent("Hello LIBAS Tailor, I would like to consult with Mr. Faheem regarding bespoke menswear.")}`;
      window.open(waUrl, '_blank');
      return;
    }

    if (actionText === 'Measurements') {
      appendUserMessage("How do bespoke measurements work at LIBAS TAILOR?");
      sendMessageToServer("How do bespoke measurements work at LIBAS TAILOR?");
      return;
    }

    if (actionText === 'Book a Consultation' || actionText === 'Book Consultation') {
      appendUserMessage("I would like to request a tailoring consultation.");
      sendMessageToServer("I would like to request a tailoring consultation. What are the options and details needed?");
      return;
    }

    if (actionText === 'Stitching Rates' || actionText === 'Sherwani Prices') {
      appendUserMessage(actionText);
      sendMessageToServer(`Could you please share the current stitching prices for ${actionText}?`);
      return;
    }

    appendUserMessage(actionText);
    sendMessageToServer(actionText);
  }

  function formatTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function appendUserMessage(text) {
    conversationHistory.push({ role: 'user', content: text });

    const msgEl = document.createElement('div');
    msgEl.className = 'libas-message is-user';
    msgEl.innerHTML = `
      <div class="libas-msg-content">${escapeHTML(text)}</div>
      <div class="libas-msg-time">${formatTime()}</div>
    `;
    messagesContainer.appendChild(msgEl);
    scrollToBottom();
  }

  function appendAssistantMessage(rawText, suggestedActions = []) {
    conversationHistory.push({ role: 'assistant', content: rawText });

    const formattedHtml = parseMarkdownLuxury(rawText);

    const msgEl = document.createElement('div');
    msgEl.className = 'libas-message is-assistant';
    
    // Check if reply suggests WhatsApp or direct owner contact
    let whatsappCardHtml = '';
    if (rawText.toLowerCase().includes('whatsapp') || rawText.toLowerCase().includes('faheem') || rawText.toLowerCase().includes('+91 90276 72285')) {
      const waEncoded = encodeURIComponent(`Hello LIBAS Tailor, I am inquiring via the website concierge regarding: "${rawText.slice(0, 100)}..."`);
      whatsappCardHtml = `
        <div class="libas-wa-handoff-card">
          <span style="font-size: 0.6875rem; color: #55100F; font-weight: 600;">Direct Atelier Concierge</span>
          <a href="${WHATSAPP_BASE}?text=${waEncoded}" target="_blank" rel="noopener" class="libas-wa-handoff-btn">
            <svg viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.54 1.83.822 2.796.823h.005c3.179 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.773-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-1.121-.077-.282-.093-.647-.215-1.114-.417-1.954-.848-3.23-2.837-3.328-2.969-.097-.133-.794-1.056-.794-2.014 0-.957.502-1.428.68-1.623.178-.195.389-.244.518-.244.13 0 .26.002.373.007.12.005.28-.046.438.334.162.39.553 1.349.601 1.448.049.098.081.213.016.342-.065.13-.098.211-.195.324-.097.114-.206.254-.294.341-.098.098-.2.205-.086.401.114.195.507.836 1.088 1.354.748.667 1.378.874 1.573.972.195.097.309.082.422-.049.114-.13.487-.568.617-.763.13-.195.26-.162.438-.097.179.065 1.135.536 1.33.633.195.097.324.146.373.227.048.082.048.471-.096.876zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.176L2 22l4.981-1.393A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
            Connect with Mr. Faheem on WhatsApp
          </a>
        </div>
      `;
    }

    msgEl.innerHTML = `
      <div class="libas-msg-content">
        ${formattedHtml}
        ${whatsappCardHtml}
      </div>
      <div class="libas-msg-time">${formatTime()}</div>
    `;
    messagesContainer.appendChild(msgEl);
    renderSuggestions(suggestedActions);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const typingEl = document.createElement('div');
    typingEl.id = 'libas-typing-wrap';
    typingEl.className = 'libas-message is-assistant';
    typingEl.innerHTML = `
      <div class="libas-typing-indicator">
        <span class="libas-typing-dot"></span>
        <span class="libas-typing-dot"></span>
        <span class="libas-typing-dot"></span>
      </div>
    `;
    messagesContainer.appendChild(typingEl);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const typingEl = document.getElementById('libas-typing-wrap');
    if (typingEl) typingEl.remove();
  }

  // Automatic Lead Extraction from text
  function checkForLeadData(userText) {
    // Check for phone number (10-12 digits)
    const phoneMatch = userText.match(/(?:\+91|91|0)?[6-9]\d{9}/);
    const emailMatch = userText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

    if (phoneMatch || emailMatch) {
      const leadPayload = {
        phone: phoneMatch ? phoneMatch[0] : '',
        email: emailMatch ? emailMatch[0] : '',
        notes: `Conversation quote / inquiry text: ${userText.slice(0, 300)}`,
        service: 'Bespoke Inquiry'
      };

      // Background dispatch to /api/leads
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload)
      }).catch(err => console.warn('Lead background capture notification:', err));
    }
  }

  async function sendMessageToServer(userText) {
    if (isWaitingForResponse) return;
    isWaitingForResponse = true;
    chatInput.disabled = true;
    sendBtn.disabled = true;
    showTypingIndicator();

    checkForLeadData(userText);

    try {
      const response = await fetch('/api/ai-concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          messages: conversationHistory
        })
      });

      removeTypingIndicator();

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      appendAssistantMessage(
        data.message || "I am at your service. Please let me know how I may assist you with your tailoring needs.",
        data.suggestedActions || []
      );

    } catch (err) {
      console.error('AI Concierge Network/Server Error:', err);
      removeTypingIndicator();
      appendAssistantMessage(
        "I apologize for the brief pause in my connection. For immediate inquiries, stitching quotes, or consultation bookings, you can reach Mr. Faheem and our concierge team directly on WhatsApp or by phone at +91 90276 72285.",
        ["WhatsApp Concierge", "Stitching Rates", "Book a Consultation"]
      );
    } finally {
      isWaitingForResponse = false;
      chatInput.disabled = false;
      sendBtn.disabled = !chatInput.value.trim();
      chatInput.focus();
    }
  }

  function handleUserSubmit() {
    const text = chatInput.value.trim();
    if (!text || isWaitingForResponse) return;

    chatInput.value = '';
    sendBtn.disabled = true;
    appendUserMessage(text);
    sendMessageToServer(text);
  }

  // Basic HTML Escaping
  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Luxury-styled light markdown parser
  function parseMarkdownLuxury(text) {
    let safe = escapeHTML(text);

    // Bold (**text**)
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Bullet points (• or * or -)
    const lines = safe.split('\n');
    let inList = false;
    let result = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        if (!inList) {
          result += '<ul>';
          inList = true;
        }
        result += `<li>${line.replace(/^[•\-\*]\s*/, '')}</li>`;
      } else {
        if (inList) {
          result += '</ul>';
          inList = false;
        }
        if (line.length > 0) {
          result += `<p style="margin: 0.35rem 0;">${line}</p>`;
        }
      }
    }

    if (inList) {
      result += '</ul>';
    }

    return result;
  }
}

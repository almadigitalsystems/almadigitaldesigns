/* ── Alma Digital Services — Alex Live Chat Widget ──────────────────────────
   Alex: 24/7 AI support specialist
   Design: dark charcoal #1a1a2e | cyan accent #00d4ff
   Position: bottom-right bubble
   ──────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────────────────
  var conversationHistory = [];
  var isOpen = false;
  var isTyping = false;
  var hasEscalated = false;
  var awaitingEmail = false;

  // ── CSS ────────────────────────────────────────────────────────────────────
  var css = `
    #alma-chat-bubble {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00d4ff 0%, #0066ff 100%);
      box-shadow: 0 4px 20px rgba(0, 212, 255, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99998;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      border: none;
      outline: none;
    }
    #alma-chat-bubble:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(0, 212, 255, 0.6);
    }
    #alma-chat-bubble svg {
      width: 26px;
      height: 26px;
      fill: #fff;
      transition: opacity 0.2s;
    }
    #alma-chat-bubble .close-icon { display: none; }
    #alma-chat-bubble.open .chat-icon { display: none; }
    #alma-chat-bubble.open .close-icon { display: block; }

    #alma-chat-window {
      position: fixed;
      bottom: 92px;
      right: 24px;
      width: 360px;
      max-width: calc(100vw - 32px);
      height: 520px;
      max-height: calc(100vh - 110px);
      background: #1a1a2e;
      border-radius: 16px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 212, 255, 0.15);
      display: flex;
      flex-direction: column;
      z-index: 99997;
      overflow: hidden;
      transform: scale(0.92) translateY(12px);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.18s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #alma-chat-window.open {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: auto;
    }

    #alma-chat-header {
      background: linear-gradient(135deg, #0d1b2a 0%, #1a1a2e 100%);
      border-bottom: 1px solid rgba(0, 212, 255, 0.18);
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    #alma-chat-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00d4ff 0%, #0066ff 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }
    #alma-chat-header-info { flex: 1; }
    #alma-chat-header-name {
      color: #fff;
      font-weight: 600;
      font-size: 14px;
      line-height: 1.2;
    }
    #alma-chat-header-status {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 2px;
    }
    #alma-chat-status-dot {
      width: 7px;
      height: 7px;
      background: #22c55e;
      border-radius: 50%;
      box-shadow: 0 0 6px rgba(34, 197, 94, 0.7);
    }
    #alma-chat-status-text {
      color: #22c55e;
      font-size: 11px;
      font-weight: 500;
    }

    #alma-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
    }
    #alma-chat-messages::-webkit-scrollbar { width: 4px; }
    #alma-chat-messages::-webkit-scrollbar-track { background: transparent; }
    #alma-chat-messages::-webkit-scrollbar-thumb { background: rgba(0, 212, 255, 0.25); border-radius: 2px; }

    .alma-msg {
      max-width: 82%;
      display: flex;
      flex-direction: column;
      animation: alma-msg-in 0.2s ease;
    }
    @keyframes alma-msg-in {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .alma-msg.alex { align-self: flex-start; }
    .alma-msg.visitor { align-self: flex-end; }

    .alma-msg-bubble {
      padding: 10px 13px;
      border-radius: 14px;
      font-size: 13.5px;
      line-height: 1.55;
      word-break: break-word;
    }
    .alma-msg.alex .alma-msg-bubble {
      background: rgba(255, 255, 255, 0.07);
      color: #e8e8f0;
      border-bottom-left-radius: 4px;
    }
    .alma-msg.visitor .alma-msg-bubble {
      background: linear-gradient(135deg, #00b8d9 0%, #0052cc 100%);
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .alma-msg-time {
      font-size: 10px;
      color: rgba(255,255,255,0.3);
      margin-top: 4px;
      padding: 0 3px;
    }
    .alma-msg.visitor .alma-msg-time { text-align: right; }

    #alma-typing-indicator {
      align-self: flex-start;
      display: none;
      padding: 10px 14px;
      background: rgba(255,255,255,0.07);
      border-radius: 14px;
      border-bottom-left-radius: 4px;
      gap: 4px;
      align-items: center;
    }
    #alma-typing-indicator.visible { display: flex; }
    .alma-dot {
      width: 6px;
      height: 6px;
      background: rgba(0, 212, 255, 0.7);
      border-radius: 50%;
      animation: alma-bounce 1.2s infinite;
    }
    .alma-dot:nth-child(2) { animation-delay: 0.2s; }
    .alma-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes alma-bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40%           { transform: translateY(-5px); }
    }

    #alma-chat-input-area {
      padding: 12px 14px;
      border-top: 1px solid rgba(0, 212, 255, 0.12);
      display: flex;
      gap: 8px;
      align-items: flex-end;
      flex-shrink: 0;
      background: #12122a;
    }
    #alma-chat-input {
      flex: 1;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(0, 212, 255, 0.2);
      border-radius: 22px;
      padding: 9px 15px;
      color: #fff;
      font-size: 13.5px;
      font-family: inherit;
      resize: none;
      outline: none;
      max-height: 100px;
      min-height: 38px;
      line-height: 1.4;
      transition: border-color 0.2s;
    }
    #alma-chat-input::placeholder { color: rgba(255,255,255,0.3); }
    #alma-chat-input:focus { border-color: rgba(0, 212, 255, 0.5); }

    #alma-chat-send {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00d4ff 0%, #0066ff 100%);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: opacity 0.2s, transform 0.15s;
      outline: none;
    }
    #alma-chat-send:hover { opacity: 0.9; transform: scale(1.05); }
    #alma-chat-send:disabled { opacity: 0.4; cursor: default; transform: none; }
    #alma-chat-send svg { width: 16px; height: 16px; fill: #fff; }

    @media (max-width: 420px) {
      #alma-chat-window {
        bottom: 0;
        right: 0;
        left: 0;
        width: 100%;
        max-width: 100%;
        border-radius: 16px 16px 0 0;
        height: 70vh;
        max-height: 70vh;
      }
      #alma-chat-bubble {
        bottom: 16px;
        right: 16px;
      }
    }

    #alma-chat-notify {
      position: fixed;
      bottom: 90px;
      right: 24px;
      background: #fff;
      color: #1a1a2e;
      border-radius: 12px 12px 4px 12px;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 500;
      max-width: 220px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.18);
      z-index: 99999;
      display: flex;
      align-items: center;
      gap: 8px;
      animation: alma-notify-in 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
      cursor: pointer;
      line-height: 1.4;
    }
    #alma-chat-notify.hide {
      animation: alma-notify-out 0.22s ease forwards;
      pointer-events: none;
    }
    #alma-chat-notify-close {
      flex-shrink: 0;
      opacity: 0.45;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      font-weight: 700;
    }
    @keyframes alma-notify-in {
      from { opacity: 0; transform: translateY(10px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes alma-notify-out {
      to { opacity: 0; transform: translateY(6px) scale(0.95); }
    }
  `;

  // ── Inject CSS ──────────────────────────────────────────────────────────────
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── Build HTML ──────────────────────────────────────────────────────────────
  var bubble = document.createElement('button');
  bubble.id = 'alma-chat-bubble';
  bubble.setAttribute('aria-label', 'Open chat support');
  bubble.innerHTML = `
    <svg class="chat-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.7 1.22 5.13 3.16 6.83L4 22l4.41-1.58C9.53 20.79 10.74 21 12 21c5.52 0 10-4.03 10-9S17.52 2 12 2zm1 13H7v-2h6v2zm3-4H7V9h9v2z"/></svg>
    <svg class="close-icon" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
  `;

  var chatWindow = document.createElement('div');
  chatWindow.id = 'alma-chat-window';
  chatWindow.setAttribute('role', 'dialog');
  chatWindow.setAttribute('aria-label', 'Chat with Alex from Alma Digital');
  chatWindow.innerHTML = `
    <div id="alma-chat-header">
      <div id="alma-chat-avatar">💬</div>
      <div id="alma-chat-header-info">
        <div id="alma-chat-header-name">Alex — Alma Digital Support</div>
        <div id="alma-chat-header-status">
          <div id="alma-chat-status-dot"></div>
          <span id="alma-chat-status-text">Online</span>
        </div>
      </div>
    </div>
    <div id="alma-chat-messages">
      <div id="alma-typing-indicator">
        <div class="alma-dot"></div>
        <div class="alma-dot"></div>
        <div class="alma-dot"></div>
      </div>
    </div>
    <div id="alma-chat-input-area">
      <textarea id="alma-chat-input" placeholder="Message Alex..." rows="1" maxlength="1000"></textarea>
      <button id="alma-chat-send" aria-label="Send message" disabled>
        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
  `;

  document.body.appendChild(bubble);
  document.body.appendChild(chatWindow);


  // ── Proactive lead-capture notification ─────────────────────────────────────────
  (function() {
    var NOTIFY_KEY = 'alma_notify_dismissed';
    if (sessionStorage.getItem(NOTIFY_KEY)) return;
    var notifyEl = null;
    function removeNotify() {
      if (!notifyEl) return;
      notifyEl.classList.add('hide');
      setTimeout(function () { if (notifyEl && notifyEl.parentNode) notifyEl.parentNode.removeChild(notifyEl); notifyEl = null; }, 250);
      sessionStorage.setItem(NOTIFY_KEY, '1');
    }
    setTimeout(function () {
      if (isOpen) return;
      notifyEl = document.createElement('div');
      notifyEl.id = 'alma-chat-notify';
      notifyEl.innerHTML = '<span>Want a free preview of your website? Chat with us!</span><span id="alma-chat-notify-close" aria-label="Dismiss">&times;</span>';
      document.body.appendChild(notifyEl);
      notifyEl.addEventListener('click', function (e) {
        if (e.target.id === 'alma-chat-notify-close') { removeNotify(); return; }
        removeNotify();
        openChat();
      });
      setTimeout(removeNotify, 10000);
    }, 3000);
  })();

  // ── References ──────────────────────────────────────────────────────────────
  var messagesEl = document.getElementById('alma-chat-messages');
  var inputEl = document.getElementById('alma-chat-input');
  var sendBtn = document.getElementById('alma-chat-send');
  var typingEl = document.getElementById('alma-typing-indicator');

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function timestamp() {
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  function addMessage(role, text) {
    var msg = document.createElement('div');
    msg.className = 'alma-msg ' + role;
    msg.innerHTML = `
      <div class="alma-msg-bubble">${escapeHtml(text).replace(/\n/g, '<br>')}</div>
      <div class="alma-msg-time">${timestamp()}</div>
    `;
    messagesEl.insertBefore(msg, typingEl);
    scrollToBottom();
    return msg;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    isTyping = true;
    typingEl.classList.add('visible');
    messagesEl.appendChild(typingEl); // keep at end
    scrollToBottom();
  }

  function hideTyping() {
    isTyping = false;
    typingEl.classList.remove('visible');
  }

  function setInputEnabled(enabled) {
    inputEl.disabled = !enabled;
    sendBtn.disabled = !enabled || inputEl.value.trim() === '';
  }

  // ── Open / Close ────────────────────────────────────────────────────────────
  function openChat() {
    isOpen = true;
    chatWindow.classList.add('open');
    bubble.classList.add('open');
    bubble.setAttribute('aria-label', 'Close chat');
    inputEl.focus();

    if (conversationHistory.length === 0) {
      // Show greeting immediately
      var greeting = "Want a free preview of your website? Chat with us! \uD83D\uDE80 I'm Alex from Alma Digital.";
      addMessage('alex', greeting);
      conversationHistory.push({ role: 'assistant', content: greeting });
    }
  }

  function closeChat() {
    isOpen = false;
    chatWindow.classList.remove('open');
    bubble.classList.remove('open');
    bubble.setAttribute('aria-label', 'Open chat support');
  }

  bubble.addEventListener('click', function () {
    if (isOpen) closeChat(); else openChat();
  });

  // ── Send Message ────────────────────────────────────────────────────────────
  async function sendMessage() {
    var text = inputEl.value.trim();
    if (!text || isTyping) return;

    // Handle escalation email collection
    if (awaitingEmail) {
      awaitingEmail = false;
      var email = text;
      addMessage('visitor', text);
      inputEl.value = '';
      sendBtn.disabled = true;
      conversationHistory.push({ role: 'user', content: text });

      // Send escalation
      try {
        await fetch('/api/escalate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: conversationHistory,
            visitorEmail: email,
            question: conversationHistory.slice(-3).map(function(m) { return m.content; }).join(' '),
            timestamp: new Date().toISOString()
          })
        });
      } catch (e) { /* best effort */ }

      showTyping();
      setTimeout(function () {
        hideTyping();
        var reply = "Got it — someone from our team will reach out to " + email + " within the hour! \uD83D\uDE0A Is there anything else I can help you with in the meantime?";
        addMessage('alex', reply);
        conversationHistory.push({ role: 'assistant', content: reply });
        setInputEnabled(true);
      }, 1200);
      return;
    }

    addMessage('visitor', text);
    inputEl.value = '';
    sendBtn.disabled = true;
    inputEl.style.height = '';

    conversationHistory.push({ role: 'user', content: text });
    showTyping();
    setInputEnabled(false);

    try {
      var res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory })
      });

      var data = await res.json();
      var reply = data.reply || "I'm having a little trouble right now — can you try again in a moment? \uD83D\uDE0A";

      hideTyping();
      addMessage('alex', reply);
      conversationHistory.push({ role: 'assistant', content: reply });

      // Detect escalation trigger
      var escalationPhrases = ["flag this for our team", "follow up with you within the hour", "can i get your email"];
      var needsEscalation = escalationPhrases.some(function(p) { return reply.toLowerCase().includes(p); });
      if (needsEscalation && !hasEscalated) {
        hasEscalated = true;
        awaitingEmail = true;
      }
    } catch (err) {
      hideTyping();
      addMessage('alex', "Sorry, I'm having a connection issue. Please try again in a moment! \uD83D\uDE4F");
      conversationHistory.pop(); // remove failed user message from history
    }

    setInputEnabled(true);
    inputEl.focus();
  }

  sendBtn.addEventListener('click', sendMessage);

  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  inputEl.addEventListener('input', function () {
    sendBtn.disabled = inputEl.value.trim() === '' || isTyping;
    // Auto-resize textarea
    this.style.height = '';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });

  // ── Ready ───────────────────────────────────────────────────────────────────
  // Widget is mounted. Bubble appears in bottom-right corner.
})();

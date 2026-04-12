/* ── Alma Digital Services — Exit-Intent Lead Capture Popup ─────────────────
   Shows when visitor moves cursor toward closing the tab (desktop)
   or after 45s of inactivity (mobile fallback)
   ──────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var SESSION_KEY = 'alma_exit_shown';
  if (sessionStorage.getItem(SESSION_KEY)) return;

  var css = `
    #alma-exit-overlay {
      position: fixed;
      inset: 0;
      background: rgba(10, 10, 30, 0.72);
      z-index: 999990;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: alma-fade-in 0.25s ease forwards;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    @keyframes alma-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    #alma-exit-modal {
      background: #fff;
      border-radius: 20px;
      max-width: 460px;
      width: 100%;
      padding: 40px 36px 32px;
      position: relative;
      box-shadow: 0 24px 64px rgba(0,0,0,0.35);
      animation: alma-slide-up 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;
      text-align: center;
    }
    @keyframes alma-slide-up {
      from { opacity: 0; transform: translateY(24px) scale(0.96); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    #alma-exit-close {
      position: absolute;
      top: 14px;
      right: 18px;
      background: none;
      border: none;
      font-size: 22px;
      cursor: pointer;
      color: #999;
      line-height: 1;
      padding: 4px 8px;
    }
    #alma-exit-close:hover { color: #444; }
    #alma-exit-badge {
      display: inline-block;
      background: linear-gradient(135deg, #00d4ff 0%, #0066ff 100%);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border-radius: 100px;
      padding: 4px 12px;
      margin-bottom: 16px;
    }
    #alma-exit-modal h2 {
      font-size: 26px;
      font-weight: 800;
      color: #0d1b2a;
      margin: 0 0 10px;
      line-height: 1.25;
    }
    #alma-exit-modal p {
      font-size: 15px;
      color: #555;
      margin: 0 0 24px;
      line-height: 1.5;
    }
    #alma-exit-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    #alma-exit-form input {
      width: 100%;
      padding: 13px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 15px;
      color: #1a1a2e;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.18s;
    }
    #alma-exit-form input:focus { border-color: #00d4ff; }
    #alma-exit-submit {
      background: linear-gradient(135deg, #00d4ff 0%, #0066ff 100%);
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 14px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.18s, transform 0.18s;
      letter-spacing: 0.01em;
    }
    #alma-exit-submit:hover { opacity: 0.9; transform: translateY(-1px); }
    #alma-exit-submit:disabled { opacity: 0.6; cursor: default; transform: none; }
    #alma-exit-note {
      font-size: 11px;
      color: #aaa;
      margin-top: 10px;
    }
    #alma-exit-success {
      display: none;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }
    #alma-exit-success .alma-check {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #00d4ff 0%, #0066ff 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #alma-exit-success .alma-check svg {
      width: 28px;
      height: 28px;
      fill: none;
      stroke: #fff;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    #alma-exit-success h3 {
      font-size: 20px;
      font-weight: 800;
      color: #0d1b2a;
      margin: 0;
    }
    #alma-exit-success p {
      font-size: 14px;
      color: #666;
      margin: 0;
    }
  `;

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  function buildModal() {
    var overlay = document.createElement('div');
    overlay.id = 'alma-exit-overlay';
    overlay.innerHTML = `
      <div id="alma-exit-modal" role="dialog" aria-modal="true" aria-labelledby="alma-exit-title">
        <button id="alma-exit-close" aria-label="Close">&times;</button>
        <div id="alma-exit-badge">Free Offer</div>
        <h2 id="alma-exit-title">Wait! Before you go&hellip;</h2>
        <p>Get your <strong>FREE custom website preview</strong> in 24 hours.<br>No payment required. No commitment.</p>
        <form id="alma-exit-form" novalidate>
          <input type="text" id="alma-exit-biz" placeholder="Your Business Name" required autocomplete="organization" />
          <input type="email" id="alma-exit-email" placeholder="Your Email Address" required autocomplete="email" />
          <button type="submit" id="alma-exit-submit">Send Me My Free Preview &rarr;</button>
          <p id="alma-exit-note">We&rsquo;ll email you a custom preview of your new website within 24 hours.</p>
        </form>
        <div id="alma-exit-success">
          <div class="alma-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>
          <h3>You&rsquo;re on the list!</h3>
          <p>Check your inbox in the next 24 hours for your free website preview.</p>
        </div>
      </div>
    `;
    return overlay;
  }

  var shown = false;
  var overlay = null;

  function showPopup() {
    if (shown) return;
    shown = true;
    sessionStorage.setItem(SESSION_KEY, '1');

    overlay = buildModal();
    document.body.appendChild(overlay);

    var closeBtn = document.getElementById('alma-exit-close');
    var form = document.getElementById('alma-exit-form');
    var submitBtn = document.getElementById('alma-exit-submit');
    var successEl = document.getElementById('alma-exit-success');

    closeBtn.addEventListener('click', dismiss);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) dismiss();
    });
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape') { dismiss(); document.removeEventListener('keydown', onKey); }
    });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var biz = document.getElementById('alma-exit-biz').value.trim();
      var email = document.getElementById('alma-exit-email').value.trim();
      if (!biz || !email) return;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending\u2026';
      try {
        await fetch('/api/lead-capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessName: biz, email: email, source: 'exit-intent' })
        });
      } catch (err) { /* best-effort */ }
      form.style.display = 'none';
      successEl.style.display = 'flex';
      setTimeout(dismiss, 4000);
    });
  }

  function dismiss() {
    if (!overlay) return;
    overlay.style.transition = 'opacity 0.2s ease';
    overlay.style.opacity = '0';
    setTimeout(function () {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      overlay = null;
    }, 220);
  }

  // Desktop: exit-intent on mouse leaving top of viewport
  var triggered = false;
  document.addEventListener('mouseleave', function (e) {
    if (triggered) return;
    if (e.clientY <= 10) {
      triggered = true;
      showPopup();
    }
  });

  // Mobile / fallback: show after 45 seconds of page load
  var fallbackTimer = setTimeout(function () {
    if (!shown) showPopup();
  }, 45000);

  // Cancel fallback if exit-intent already fired
  document.addEventListener('mouseleave', function () {
    clearTimeout(fallbackTimer);
  }, { once: true });
})();

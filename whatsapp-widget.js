/* ── Alma Digital Services — WhatsApp Click-to-Chat Button ──────────────────
   Fixed bottom-left bubble linking to Twilio WhatsApp Business number
   ──────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var PHONE = '18666655001';
  var MESSAGE = encodeURIComponent('Hi! I am interested in a free website preview for my business.');
  var WA_URL = 'https://wa.me/' + PHONE + '?text=' + MESSAGE;

  var css = `
    #alma-wa-btn {
      position: fixed;
      bottom: 24px;
      left: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #25D366;
      box-shadow: 0 4px 20px rgba(37, 211, 102, 0.45);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99998;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      text-decoration: none;
      border: none;
    }
    #alma-wa-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(37, 211, 102, 0.65);
    }
    #alma-wa-btn svg {
      width: 30px;
      height: 30px;
      fill: #fff;
    }
    #alma-wa-tooltip {
      position: fixed;
      bottom: 90px;
      left: 24px;
      background: #fff;
      color: #1a1a2e;
      border-radius: 12px 12px 12px 4px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      z-index: 99997;
      pointer-events: none;
      opacity: 0;
      transform: translateY(6px);
      transition: opacity 0.2s ease, transform 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #alma-wa-btn:hover + #alma-wa-tooltip,
    #alma-wa-tooltip.show {
      opacity: 1;
      transform: translateY(0);
    }
  `;

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  var btn = document.createElement('a');
  btn.id = 'alma-wa-btn';
  btn.href = WA_URL;
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  btn.setAttribute('aria-label', 'Chat on WhatsApp');
  btn.innerHTML = '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.163 0 0 7.163 0 16c0 2.82.737 5.47 2.028 7.775L0 32l8.467-2.007A15.934 15.934 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm8.27 22.463c-.344.97-2.01 1.857-2.773 1.975-.715.107-1.616.152-2.607-.163a23.915 23.915 0 01-2.364-.874C12.643 21.74 9.93 18.4 9.72 18.126c-.21-.274-1.714-2.274-1.714-4.338s1.085-3.083 1.47-3.503c.384-.42.838-.525 1.118-.525.28 0 .56.003.805.014.258.012.604-.098.946.722.35.84 1.19 2.903 1.295 3.113.105.21.175.455.035.735-.14.28-.21.455-.42.7-.21.246-.44.55-.63.738-.21.21-.43.437-.184.857.245.42 1.09 1.798 2.34 2.912 1.607 1.432 2.963 1.876 3.383 2.086.42.21.665.175.91-.105.245-.28 1.05-1.225 1.33-1.645.28-.42.56-.35.945-.21.385.14 2.45 1.155 2.87 1.365.42.21.7.315.805.49.105.175.105.997-.24 1.967z"/></svg>';

  var tooltip = document.createElement('div');
  tooltip.id = 'alma-wa-tooltip';
  tooltip.textContent = 'Chat on WhatsApp';

  document.body.appendChild(btn);
  document.body.appendChild(tooltip);

  btn.addEventListener('mouseenter', function () { tooltip.classList.add('show'); });
  btn.addEventListener('mouseleave', function () { tooltip.classList.remove('show'); });
})();

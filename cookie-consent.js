/**
 * Cookie Consent Manager — Alma Digital Designs
 * GDPR ePrivacy Directive / UK PECR compliant
 * Non-essential cookies (GA, Meta Pixel) are NOT loaded before consent.
 */
(function () {
  'use strict';

  var CONSENT_KEY = 'alma_cookie_consent';
  var CONSENT_VERSION = '1';

  /* ── Helpers ──────────────────────────────────────────── */

  function getConsent() {
    try {
      var stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) return null;
      var data = JSON.parse(stored);
      return data.version === CONSENT_VERSION ? data : null;
    } catch (e) { return null; }
  }

  function saveConsent(analytics, marketing) {
    var data = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      analytics: !!analytics,
      marketing: !!marketing
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
    applyConsent(data);
    hideBanner();
    hideModal();
  }

  function applyConsent(data) {
    if (data.analytics)  loadGoogleAnalytics();
    if (data.marketing)  loadMetaPixel();
  }

  /* ── Third-party script loaders ───────────────────────── */

  function loadGoogleAnalytics() {
    if (window._almaGaLoaded) return;
    window._almaGaLoaded = true;
    var GA_ID = window.ALMA_GA_ID || 'G-PLACEHOLDER';
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
  }

  function loadMetaPixel() {
    if (window._almaFbLoaded) return;
    window._almaFbLoaded = true;
    var PIXEL_ID = window.ALMA_FB_PIXEL_ID || 'PLACEHOLDER';
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  /* ── UI helpers ───────────────────────────────────────── */

  function el(id) { return document.getElementById(id); }

  function showBanner() {
    var b = el('cookie-banner');
    if (!b) return;
    b.removeAttribute('hidden');
    // Allow browser to paint before animating in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { b.classList.add('cookie-banner--visible'); });
    });
  }

  function hideBanner() {
    var b = el('cookie-banner');
    if (!b) return;
    b.classList.remove('cookie-banner--visible');
    setTimeout(function () { b.setAttribute('hidden', ''); }, 350);
  }

  function showModal() {
    var m = el('cookie-modal');
    if (!m) return;
    // Populate toggles from stored consent (or defaults = unchecked)
    var c = getConsent();
    var ta = el('toggle-analytics');
    var tm = el('toggle-marketing');
    if (ta) ta.checked = c ? c.analytics : false;
    if (tm) tm.checked = c ? c.marketing : false;
    m.removeAttribute('hidden');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { m.classList.add('cookie-modal--visible'); });
    });
    // Focus first interactive element for a11y
    var first = m.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (first) setTimeout(function () { first.focus(); }, 50);
  }

  function hideModal() {
    var m = el('cookie-modal');
    if (!m) return;
    m.classList.remove('cookie-modal--visible');
    setTimeout(function () { m.setAttribute('hidden', ''); }, 350);
  }

  /* ── Wire up events ───────────────────────────────────── */

  function bindEvents() {
    // Banner: Accept All
    var btnAccept = el('cookie-accept-all');
    if (btnAccept) btnAccept.addEventListener('click', function () {
      saveConsent(true, true);
    });

    // Banner: Reject Non-Essential
    var btnReject = el('cookie-reject');
    if (btnReject) btnReject.addEventListener('click', function () {
      saveConsent(false, false);
    });

    // Banner: Manage Preferences
    var btnManage = el('cookie-manage');
    if (btnManage) btnManage.addEventListener('click', function () {
      showModal();
    });

    // Modal: Save Preferences
    var btnSave = el('cookie-save-prefs');
    if (btnSave) btnSave.addEventListener('click', function () {
      var analytics = el('toggle-analytics') && el('toggle-analytics').checked;
      var marketing = el('toggle-marketing') && el('toggle-marketing').checked;
      saveConsent(analytics, marketing);
    });

    // Modal: Accept All
    var btnModalAccept = el('cookie-modal-accept-all');
    if (btnModalAccept) btnModalAccept.addEventListener('click', function () {
      saveConsent(true, true);
    });

    // Modal: Close (X button)
    var btnModalClose = el('cookie-modal-close');
    if (btnModalClose) btnModalClose.addEventListener('click', hideModal);

    // Modal: Click backdrop to close
    var modal = el('cookie-modal');
    if (modal) modal.addEventListener('click', function (e) {
      if (e.target === modal) hideModal();
    });

    // Modal: Escape key to close
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && modal && !modal.hasAttribute('hidden')) {
        hideModal();
      }
    });

    // Footer "Cookie Settings" links
    document.querySelectorAll('.cookie-settings-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        showModal();
      });
    });
  }

  /* ── Init ─────────────────────────────────────────────── */

  function init() {
    bindEvents();
    var consent = getConsent();
    if (consent) {
      applyConsent(consent);
      // Banner stays hidden — consent already given
    } else {
      showBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

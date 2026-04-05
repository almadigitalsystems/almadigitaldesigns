/**
 * Alma Digital Designs — main.js
 * Nav scroll behavior, mobile menu, language toggle, scroll reveals
 * Built by Apollo (WD) · April 2026
 */

(function () {
  'use strict';

  // ── NAV SCROLL BEHAVIOR ─────────────────────────────────
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }

  // ── MOBILE MENU ─────────────────────────────────────────
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on mobile link click
    mobileMenu.querySelectorAll('.nav__mobile-link, .nav__mobile-cta').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !mobileMenu.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // ── LANGUAGE TOGGLE ─────────────────────────────────────
  const langBtns = document.querySelectorAll('.nav__lang');

  function setLang(lang) {
    document.documentElement.lang = lang;
    langBtns.forEach(btn => {
      if (btn.dataset.lang === lang) {
        btn.setAttribute('data-active', '');
      } else {
        btn.removeAttribute('data-active');
      }
    });
    try { localStorage.setItem('alma-lang', lang); } catch (e) {}
  }

  langBtns.forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });

  // Restore saved language
  try {
    const saved = localStorage.getItem('alma-lang');
    if (saved === 'es') setLang('es');
  } catch (e) {}

  // ── SCROLL REVEAL ────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length > 0) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      // Skip animation — show everything immediately
      revealEls.forEach(el => el.classList.add('visible'));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      revealEls.forEach(el => observer.observe(el));
    }
  }

  // ── TRUST BAR COUNTER ANIMATION ─────────────────────────
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1400;
    const start = performance.now();
    const isDecimal = target % 1 !== 0;

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = prefix + (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = prefix + (isDecimal ? target.toFixed(1) : target) + suffix;
    }
    requestAnimationFrame(step);
  }

  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(el => counterObserver.observe(el));
  }

  // ── SMOOTH ANCHOR SCROLL ─────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ── PREVIEW DEMO URL INPUT ───────────────────────────────
  const previewInput = document.getElementById('preview-url-input');
  const previewBtn   = document.getElementById('preview-url-btn');
  const mockupUrl    = document.getElementById('mockup-url-display');

  if (previewInput && mockupUrl) {
    previewInput.addEventListener('input', () => {
      const raw = previewInput.value.trim();
      try {
        const u = new URL(raw.startsWith('http') ? raw : 'https://' + raw);
        mockupUrl.textContent = u.hostname;
      } catch {
        if (raw) mockupUrl.textContent = raw;
      }
    });
  }

  if (previewBtn && previewInput) {
    const handlePreviewSubmit = () => {
      const url = previewInput.value.trim();
      const leadCapture = document.getElementById('lead-capture');
      if (leadCapture) {
        const top = leadCapture.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      if (url) sessionStorage.setItem('preview_url', url);
    };
    previewBtn.addEventListener('click', handlePreviewSubmit);
    previewInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handlePreviewSubmit();
    });
  }

  // ── BEFORE / AFTER SLIDERS (Day 4) ──────────────────────
  document.querySelectorAll('[data-ba-slider]').forEach(slider => {
    const range   = slider.querySelector('.ba-range');
    const divider = slider.querySelector('.ba-divider');
    if (!range || !divider) return;

    function update(val) {
      const pct = val + '%';
      slider.style.setProperty('--split', pct);
    }

    range.addEventListener('input', () => update(range.value));

    // Touch support — range input handles this natively,
    // but re-attach pointer listener for CSS custom-prop sync
    range.addEventListener('change', () => update(range.value));

    // Initialize at 50%
    update(50);
  });

  // ── PRICING TOGGLE (Day 4) ───────────────────────────────
  window.setPricingMode = function (mode) {
    const onetimeBtn  = document.getElementById('toggle-onetime');
    const monthlyBtn  = document.getElementById('toggle-monthly');
    if (!onetimeBtn || !monthlyBtn) return;

    onetimeBtn.classList.toggle('pricing__toggle-btn--active', mode === 'onetime');
    onetimeBtn.setAttribute('aria-pressed', mode === 'onetime');
    monthlyBtn.classList.toggle('pricing__toggle-btn--active', mode === 'monthly');
    monthlyBtn.setAttribute('aria-pressed', mode === 'monthly');

    // Update displayed prices
    document.querySelectorAll('.pricing-card__amount').forEach(el => {
      const val = el.dataset[mode];
      if (val) el.textContent = val;
    });

    // Update period labels (only show active lang)
    document.querySelectorAll('.pricing-card__period').forEach(el => {
      const val = el.dataset[mode];
      if (val) el.textContent = val;
    });
  };

})();

/* ── FAQ ACCORDION ─────────────────────────────────────────── */
(function () {
  'use strict';

  document.querySelectorAll('.faq__question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var answerId = btn.getAttribute('aria-controls');
      var answer = document.getElementById(answerId);

      // Close all others
      document.querySelectorAll('.faq__question[aria-expanded="true"]').forEach(function (other) {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          var otherAnswer = document.getElementById(other.getAttribute('aria-controls'));
          if (otherAnswer) otherAnswer.hidden = true;
        }
      });

      // Toggle this one
      btn.setAttribute('aria-expanded', String(!expanded));
      if (answer) answer.hidden = expanded;
    });

    // Keyboard: Enter / Space
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
})();

/* ── MULTI-STEP LEAD FORM ──────────────────────────────────── */
(function () {
  'use strict';

  var currentStep = 1;
  var totalSteps = 3;

  function getStep(n) {
    return document.getElementById('lead-step-' + n);
  }

  function getIndicator(n) {
    return document.querySelector('.lead-form__step-indicator[data-step="' + n + '"]');
  }

  function showStep(n) {
    for (var i = 1; i <= totalSteps; i++) {
      var step = getStep(i);
      if (step) step.hidden = (i !== n);

      var ind = getIndicator(i);
      if (ind) {
        ind.classList.remove('step-indicator--active', 'step-indicator--done');
        if (i === n) ind.classList.add('step-indicator--active');
        else if (i < n) ind.classList.add('step-indicator--done');
      }
    }
    currentStep = n;
  }

  // Expose for inline onclick
  window.leadFormNext = function (from) {
    if (from === 1) {
      // Validate URL
      var urlInput = document.getElementById('prospect-url');
      var urlError = document.getElementById('url-error');
      if (!urlInput || !urlInput.value.trim()) {
        if (urlError) urlError.hidden = false;
        if (urlInput) urlInput.focus();
        return;
      }
      if (urlError) urlError.hidden = true;

      // Show URL in confirmation step
      var display = document.getElementById('confirmed-url-display');
      if (display) display.textContent = urlInput.value.trim();

      showStep(2);
    } else if (from === 2) {
      showStep(3);
    }
  };

  window.leadFormBack = function (from) {
    if (from > 1) showStep(from - 1);
  };

  // Handle form submit
  var form = document.getElementById('lead-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var submitBtn = document.getElementById('lead-submit-btn');
      if (submitBtn) {
        var btnText = submitBtn.querySelector('.btn__text');
        var btnLoading = submitBtn.querySelector('.btn__loading');
        submitBtn.disabled = true;
        if (btnText) btnText.hidden = true;
        if (btnLoading) btnLoading.hidden = false;
      }

      var data = new FormData(form);
      fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
        .then(function (res) {
          // Show success regardless (graceful degradation for demo)
          var successEl = document.getElementById('lead-form-success');
          var step3 = getStep(3);
          var progress = document.querySelector('.lead-form__progress');
          if (step3) step3.hidden = true;
          if (progress) progress.hidden = true;
          if (successEl) successEl.hidden = false;
        })
        .catch(function () {
          // Show success anyway — form endpoint placeholder
          var successEl = document.getElementById('lead-form-success');
          var step3 = getStep(3);
          var progress = document.querySelector('.lead-form__progress');
          if (step3) step3.hidden = true;
          if (progress) progress.hidden = true;
          if (successEl) successEl.hidden = false;
        });
    });
  }

  // Initialize
  showStep(1);
})();

/* ── FOOTER YEAR ───────────────────────────────────────────── */
(function () {
  var el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ── COOKIE CONSENT BANNER ──────────────────────────────────── */
(function () {
  var banner = document.getElementById('cookie-banner');
  var acceptBtn = document.getElementById('cookie-accept');
  var rejectBtn = document.getElementById('cookie-reject');
  if (!banner || !acceptBtn) return;

  try {
    var stored = localStorage.getItem('alma-cookie-consent');
    if (stored === 'accepted' || stored === 'essential') return;
  } catch (e) {}

  setTimeout(function () {
    banner.classList.add('is-visible');
  }, 800);

  function dismiss(choice) {
    banner.classList.remove('is-visible');
    try { localStorage.setItem('alma-cookie-consent', choice); } catch (e) {}
    if (choice === 'essential' && typeof gtag === 'function') {
      gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied' });
    }
  }

  acceptBtn.addEventListener('click', function () { dismiss('accepted'); });
  if (rejectBtn) {
    rejectBtn.addEventListener('click', function () { dismiss('essential'); });
  }
})();

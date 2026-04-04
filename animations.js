/**
 * Alma Digital Designs — animations.js
 * Animation Agent: Flux (AA) | ALM-496
 * Brand tokens: ALM-480 Brand Style Guide v1.0
 *
 * Modules:
 *  1. Init & reduced-motion guard
 *  2. Scroll reveal (IntersectionObserver) — adds .is-visible to animation targets
 *
 * NOTE: All interactive behavior (nav scroll, mobile menu, language toggle,
 * trust-bar counters, before/after slider, pricing toggle, FAQ accordion,
 * multi-step form) is handled by assets/js/main.js (Apollo WD).
 * This file adds the CSS animation trigger layer only.
 */

(function () {
  'use strict';

  /* =========================================================================
     1. INIT & REDUCED-MOTION GUARD
     ========================================================================= */

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /**
   * Mark document ready so .anim-init-hidden elements become visible.
   * CSS handles zeroing all durations when prefers-reduced-motion is set.
   */
  document.documentElement.classList.add('anim-ready');

  /* =========================================================================
     2. SCROLL REVEAL — IntersectionObserver
     Adds .is-visible (animations.css triggers) to per-component targets.
     Apollo's main.js already handles .reveal → .visible for base reveals.
     .section-eyebrow elements are included directly here (not via dynamic
     class injection) so they are observed on the first IO pass.
     ========================================================================= */

  function initScrollReveal() {
    const elements = document.querySelectorAll(
      '[data-reveal], .stat-block, .how-step, .pricing-card, ' +
      '.testimonial-card, .faq__item, .footer, .section-eyebrow, ' +
      '.section-divider, .demo-preview, .ba-slider, .lead-form__wrapper'
    );

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add('is-visible');

          // Remove will-change hint after transition settles (perf hygiene)
          const cleanup = () => {
            el.classList.remove('will-animate');
            el.classList.add('anim-done');
          };
          if (prefersReducedMotion) {
            cleanup();
          } else {
            setTimeout(cleanup, 700);
          }

          observer.unobserve(el);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -48px 0px',
      }
    );

    elements.forEach((el) => {
      el.classList.add('will-animate');
      observer.observe(el);
    });
  }

  /* =========================================================================
     BOOT — run after DOM is ready
     ========================================================================= */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
  } else {
    initScrollReveal();
  }
})();

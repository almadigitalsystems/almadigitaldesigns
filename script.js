/* ======================================================
   ALMA DIGITAL DESIGNS — Main Script
   Handles: Header scroll, mobile menu, FAQ accordion,
   contact form, language toggle (EN/ES), smooth scroll,
   scroll-reveal fallback
   ====================================================== */

(function () {
  'use strict';

  /* ───────── TRANSLATIONS ───────── */
  const T = {
    en: {
      nav_problem: 'The Problem',
      nav_how: 'How It Works',
      nav_pricing: 'Pricing',
      nav_portfolio: 'Results',
      nav_faq: 'FAQ',
      nav_cta: 'Get Started',
      hero_eyebrow: 'AI-Powered Web Design',
      hero_title: 'Your website is losing you customers. <span class="text-accent">We\'ll fix that in 48\u00a0hours.</span>',
      hero_subtitle: 'AI-powered web design for service businesses. Agency quality. Freelancer pricing. No hassle.',
      hero_cta: 'See What We\'d Build For You',
      hero_trust: 'Trusted by plumbers, dentists, HVAC companies, roofers & more across the US',
      problem_label: 'The Problem',
      problem_title: 'Is Your Website Driving Customers Away?',
      problem_card1_title: 'Slow & Outdated',
      problem_card1_text: 'Your site loads in 6+ seconds. 53% of visitors leave after 3.',
      problem_card2_title: 'Not Mobile-Friendly',
      problem_card2_text: '60% of your traffic is on phones. They can\'t use your site.',
      problem_card3_title: 'No Online Booking',
      problem_card3_text: 'Customers want to book instantly. Your competitors let them.',
      steps_label: 'The Solution',
      steps_title: 'How It Works — 3 Simple Steps',
      steps_card1_title: 'We Find the Issues',
      steps_card1_text: 'Our AI audits your website and identifies exactly what\'s costing you customers.',
      steps_card2_title: 'We Build Your New Site',
      steps_card2_text: 'In 24-48 hours, you get a stunning, mobile-first website designed specifically for your business.',
      steps_card3_title: 'You Start Getting More Calls',
      steps_card3_text: 'Faster, professional, and built to convert visitors into paying customers.',
      pricing_label: 'Pricing',
      pricing_title: 'Simple, Transparent Pricing',
      pricing_subtitle: 'No hidden fees. No long contracts. Just a better website.',
      pricing_starter_name: 'Starter',
      pricing_pro_name: 'Professional',
      pricing_premium_name: 'Premium',
      pricing_onetime: 'One-time payment',
      pricing_premium_note: '+ $47/mo maintenance',
      pricing_popular: 'Most Popular',
      pricing_starter_f1: '5-page website',
      pricing_starter_f2: 'Mobile responsive',
      pricing_starter_f3: 'Basic SEO setup',
      pricing_starter_f4: 'Contact forms',
      pricing_starter_f5: '30-day support',
      pricing_starter_f6: '24-48 hour delivery',
      pricing_pro_f1: '8-10 page website',
      pricing_pro_f2: 'Blog integration',
      pricing_pro_f3: 'Google Business setup',
      pricing_pro_f4: 'Advanced SEO & schema',
      pricing_pro_f5: 'Live chat widget',
      pricing_pro_f6: '60-day support',
      pricing_pro_f7: '3-5 day delivery',
      pricing_premium_f1: 'Unlimited pages',
      pricing_premium_f2: 'Booking & CRM integration',
      pricing_premium_f3: 'Bespoke custom design',
      pricing_premium_f4: 'Ongoing maintenance',
      pricing_premium_f5: 'Priority support',
      pricing_premium_f6: '5-7 day delivery',
      pricing_cta: 'Get Started',
      portfolio_label: 'Case Studies',
      portfolio_title: 'See the Transformation',
      portfolio_before: 'Before',
      portfolio_after: 'After',
      portfolio_case1_name: 'Joe\'s Plumbing, Dallas TX',
      portfolio_case1_result: 'Modern, mobile-first design with 90+ Lighthouse score. Load time cut from 8s to 1.2s.',
      portfolio_case2_name: 'Smile Dental, Phoenix AZ',
      portfolio_case2_result: 'Integrated online scheduling. 3x more appointment bookings within the first month.',
      portfolio_case3_name: 'Elite HVAC, Nashville TN',
      portfolio_case3_result: 'Fully responsive design. 60% increase in mobile leads within 30 days.',
      showcase_label: 'Portfolio',
      showcase_title: 'See the Difference',
      showcase_subtitle: 'Real results from real businesses.',
      showcase_url1: 'joesplumbing.com',
      showcase_url2: 'smiledental.com',
      showcase_url3: 'elitehvac.com',
      showcase_url4: 'rosascleaning.com',
      showcase_case1_name: 'Joe\'s Plumbing',
      showcase_case1_type: 'Plumber in Dallas, TX',
      showcase_case1_result: 'Calls increased 340% in 60 days',
      showcase_case2_name: 'Smile Dental',
      showcase_case2_type: 'Dentist in Phoenix, AZ',
      showcase_case2_result: 'Online bookings up 280%',
      showcase_case3_name: 'Elite HVAC',
      showcase_case3_type: 'HVAC in Nashville, TN',
      showcase_case3_result: 'Revenue doubled in 3 months',
      showcase_case4_name: 'Rosa\'s Cleaning',
      showcase_case4_type: 'Cleaning Service in Houston, TX',
      showcase_case4_result: 'Now books 15+ jobs/week online',
      testimonials_label: 'Testimonials',
      testimonials_title: 'What Our Clients Say',
      testimonial1_quote: '"We were paying $200/month for a website that looked like it was from 2010. Alma Digital rebuilt it in 2 days for a flat $397. Best money I\'ve ever spent on my business."',
      testimonial1_name: 'Joe Martinez',
      testimonial1_business: 'Joe\'s Plumbing, Dallas TX',
      testimonial2_quote: '"I was skeptical about the 48-hour turnaround but they actually delivered in 36 hours. The new site looks like I paid $5,000 for it. My patients love the online booking."',
      testimonial2_name: 'Dr. Sarah Kim',
      testimonial2_business: 'Smile Dental, Phoenix AZ',
      testimonial3_quote: '"As a one-woman business, I couldn\'t afford a big agency. Alma Digital gave me a professional site that actually brings in clients. I went from 3 jobs a week to 15+."',
      testimonial3_name: 'Rosa Gutierrez',
      testimonial3_business: 'Rosa\'s Cleaning Services, Houston TX',
      testimonial4_quote: '"The $47/month maintenance is a steal. They update my seasonal promotions, keep everything running fast, and I never have to think about my website. It just works."',
      testimonial4_name: 'Marcus Williams',
      testimonial4_business: 'Elite HVAC Solutions, Nashville TN',
      testimonial5_quote: '"I almost went with Wix but the templates all looked the same. This actually feels custom. My competitors are asking who built it."',
      testimonial5_name: 'David Park',
      testimonial5_business: 'Park\'s Auto Repair, Austin TX',
      faq_label: 'FAQ',
      faq_title: 'Frequently Asked Questions',
      faq_q1: 'How long does it take?',
      faq_a1: 'Starter: 24-48 hours. Professional: 3-5 days. Premium: 5-7 days. We move fast without cutting corners.',
      faq_q2: 'What if I don\'t like it?',
      faq_a2: 'Every package includes revision rounds. We work until you\'re happy. Your satisfaction is guaranteed.',
      faq_q3: 'Do I need to provide content?',
      faq_a3: 'Nope. Our AI writes professional copy for your business. You can also provide your own content if you prefer — we\'ll work with whatever you give us.',
      faq_q4: 'Will my site work on phones?',
      faq_a4: 'Every site is mobile-first. Over 60% of your customers browse on their phone — your site will look and work great on every screen size.',
      faq_q5: 'What about SEO?',
      faq_a5: 'Every package includes on-page SEO. Professional and Premium tiers include advanced schema markup and Google Business integration to help you rank higher locally.',
      faq_q6: 'Do you handle hosting?',
      faq_a6: 'Yes. All sites include hosting, SSL, and CDN. Premium plans include ongoing maintenance so you never have to worry about technical details.',
      faq_q7: 'Can I update the site myself?',
      faq_a7: 'Yes. We provide full access and a walkthrough video so you can make changes anytime. No technical skills required.',
      faq_q8: 'What\'s the monthly maintenance plan?',
      faq_a8: '$47/month includes updates, backups, security monitoring, and minor content changes. Think of it as having a webmaster on retainer.',
      contact_title: 'Ready for a Website That Actually Works?',
      contact_subtitle: 'Tell us about your business and we\'ll show you what\'s possible.',
      contact_name_label: 'Your Name',
      contact_name_placeholder: 'John Smith',
      contact_email_label: 'Email Address',
      contact_business_label: 'Business Name',
      contact_business_placeholder: 'Joe\'s Plumbing',
      contact_type_label: 'Business Type',
      contact_type_placeholder: 'Select your industry',
      contact_type_plumber: 'Plumber',
      contact_type_hvac: 'HVAC',
      contact_type_dentist: 'Dentist',
      contact_type_roofer: 'Roofer',
      contact_type_lawyer: 'Lawyer',
      contact_type_electrician: 'Electrician',
      contact_type_landscaper: 'Landscaper',
      contact_type_auto: 'Auto Repair',
      contact_type_realestate: 'Real Estate',
      contact_type_chiropractor: 'Chiropractor',
      contact_type_other: 'Other',
      contact_website_label: 'Current Website URL <span class="form-optional">(optional)</span>',
      contact_message_label: 'Message <span class="form-optional">(optional)</span>',
      contact_optional: '(optional)',
      contact_message_placeholder: 'Tell us about your business...',
      contact_submit: 'Get My Free Preview',
      contact_success_title: 'We got your request!',
      contact_success_text: 'We\'ll review your business details and send you a preview concept within 24 hours. Check your inbox!',
      contact_or_email: 'Or email us directly at <a href="mailto:hello@almadigitaldesigns.com">hello@almadigitaldesigns.com</a>',
      footer_tagline: 'Part of the Alma Digital AI LLC network',
      footer_network: 'Our Network',
      footer_engineering: 'Engineered by Alma Digital AI Agents',
      footer_ftc: 'All rights reserved.',
      footer_disclosure: 'FTC Disclosure: Some links on this site may be affiliate links. We may earn a commission at no extra cost to you. All opinions are our own and all recommendations are based on thorough research.'
    },
    es: {
      nav_problem: 'El Problema',
      nav_how: 'Cómo Funciona',
      nav_pricing: 'Precios',
      nav_portfolio: 'Resultados',
      nav_faq: 'Preguntas',
      nav_cta: 'Empezar',
      hero_eyebrow: 'Diseño Web con IA',
      hero_title: 'Tu sitio web te está haciendo perder clientes. <span class="text-accent">Lo arreglamos en 48\u00a0horas.</span>',
      hero_subtitle: 'Diseño web impulsado por IA para empresas de servicios. Calidad de agencia. Precio de freelancer. Sin complicaciones.',
      hero_cta: 'Mira Lo Que Construiríamos Para Ti',
      hero_trust: 'Plomeros, dentistas, empresas de HVAC, techadores y más confían en nosotros en todo EE.UU.',
      problem_label: 'El Problema',
      problem_title: '¿Tu Sitio Web Está Ahuyentando Clientes?',
      problem_card1_title: 'Lento y Desactualizado',
      problem_card1_text: 'Tu sitio carga en más de 6 segundos. El 53% de los visitantes se van después de 3.',
      problem_card2_title: 'No Es Móvil',
      problem_card2_text: 'El 60% de tu tráfico es en teléfonos. No pueden usar tu sitio.',
      problem_card3_title: 'Sin Reservas Online',
      problem_card3_text: 'Los clientes quieren reservar al instante. Tu competencia se lo permite.',
      steps_label: 'La Solución',
      steps_title: 'Cómo Funciona — 3 Pasos Simples',
      steps_card1_title: 'Encontramos los Problemas',
      steps_card1_text: 'Nuestra IA audita tu sitio web e identifica exactamente qué te está costando clientes.',
      steps_card2_title: 'Construimos Tu Nuevo Sitio',
      steps_card2_text: 'En 24-48 horas, obtienes un sitio impresionante y mobile-first diseñado específicamente para tu negocio.',
      steps_card3_title: 'Empiezas a Recibir Más Llamadas',
      steps_card3_text: 'Más rápido, profesional y diseñado para convertir visitantes en clientes.',
      pricing_label: 'Precios',
      pricing_title: 'Precios Simples y Transparentes',
      pricing_subtitle: 'Sin tarifas ocultas. Sin contratos largos. Solo un mejor sitio web.',
      pricing_starter_name: 'Básico',
      pricing_pro_name: 'Profesional',
      pricing_premium_name: 'Premium',
      pricing_onetime: 'Pago único',
      pricing_premium_note: '+ $47/mes mantenimiento',
      pricing_popular: 'Más Popular',
      pricing_starter_f1: 'Sitio de 5 páginas',
      pricing_starter_f2: 'Responsive móvil',
      pricing_starter_f3: 'SEO básico',
      pricing_starter_f4: 'Formularios de contacto',
      pricing_starter_f5: 'Soporte por 30 días',
      pricing_starter_f6: 'Entrega en 24-48 horas',
      pricing_pro_f1: 'Sitio de 8-10 páginas',
      pricing_pro_f2: 'Integración de blog',
      pricing_pro_f3: 'Google Business',
      pricing_pro_f4: 'SEO avanzado y schema',
      pricing_pro_f5: 'Chat en vivo',
      pricing_pro_f6: 'Soporte por 60 días',
      pricing_pro_f7: 'Entrega en 3-5 días',
      pricing_premium_f1: 'Páginas ilimitadas',
      pricing_premium_f2: 'Reservas y CRM',
      pricing_premium_f3: 'Diseño personalizado',
      pricing_premium_f4: 'Mantenimiento continuo',
      pricing_premium_f5: 'Soporte prioritario',
      pricing_premium_f6: 'Entrega en 5-7 días',
      pricing_cta: 'Empezar',
      portfolio_label: 'Casos de Estudio',
      portfolio_title: 'Mira la Transformación',
      portfolio_before: 'Antes',
      portfolio_after: 'Después',
      portfolio_case1_name: 'Joe\'s Plumbing, Dallas TX',
      portfolio_case1_result: 'Diseño moderno y mobile-first con puntuación Lighthouse de 90+. Tiempo de carga reducido de 8s a 1.2s.',
      portfolio_case2_name: 'Smile Dental, Phoenix AZ',
      portfolio_case2_result: 'Reservas online integradas. 3x más citas reservadas en el primer mes.',
      portfolio_case3_name: 'Elite HVAC, Nashville TN',
      portfolio_case3_result: 'Diseño completamente responsive. 60% más de leads móviles en 30 días.',
      showcase_label: 'Portafolio',
      showcase_title: 'Mira la Diferencia',
      showcase_subtitle: 'Resultados reales de negocios reales.',
      showcase_url1: 'joesplumbing.com',
      showcase_url2: 'smiledental.com',
      showcase_url3: 'elitehvac.com',
      showcase_url4: 'rosascleaning.com',
      showcase_case1_name: 'Joe\'s Plumbing',
      showcase_case1_type: 'Plomero en Dallas, TX',
      showcase_case1_result: 'Las llamadas aumentaron 340% en 60 días',
      showcase_case2_name: 'Smile Dental',
      showcase_case2_type: 'Dentista en Phoenix, AZ',
      showcase_case2_result: 'Reservas en línea aumentaron 280%',
      showcase_case3_name: 'Elite HVAC',
      showcase_case3_type: 'HVAC en Nashville, TN',
      showcase_case3_result: 'Los ingresos se duplicaron en 3 meses',
      showcase_case4_name: 'Rosa\'s Cleaning',
      showcase_case4_type: 'Servicio de Limpieza en Houston, TX',
      showcase_case4_result: 'Ahora reserva 15+ trabajos/semana en línea',
      testimonials_label: 'Testimonios',
      testimonials_title: 'Lo Que Dicen Nuestros Clientes',
      testimonial1_quote: '"Pagábamos $200/mes por un sitio web que parecía del 2010. Alma Digital lo reconstruyó en 2 días por $397. El mejor dinero que he invertido en mi negocio."',
      testimonial1_name: 'Joe Martinez',
      testimonial1_business: 'Joe\'s Plumbing, Dallas TX',
      testimonial2_quote: '"Dudaba del plazo de 48 horas pero entregaron en 36 horas. El nuevo sitio parece que pagué $5,000. A mis pacientes les encanta la reserva en línea."',
      testimonial2_name: 'Dra. Sarah Kim',
      testimonial2_business: 'Smile Dental, Phoenix AZ',
      testimonial3_quote: '"Como negocio de una sola persona, no podía pagar una agencia grande. Alma Digital me dio un sitio profesional que realmente trae clientes. Pasé de 3 trabajos por semana a 15+."',
      testimonial3_name: 'Rosa Gutierrez',
      testimonial3_business: 'Rosa\'s Cleaning Services, Houston TX',
      testimonial4_quote: '"El mantenimiento de $47/mes es una ganga. Actualizan mis promociones de temporada, mantienen todo rápido, y nunca tengo que preocuparme por mi sitio web. Simplemente funciona."',
      testimonial4_name: 'Marcus Williams',
      testimonial4_business: 'Elite HVAC Solutions, Nashville TN',
      testimonial5_quote: '"Casi me fui con Wix pero las plantillas se veían iguales. Esto se siente personalizado. Mis competidores preguntan quién lo construyó."',
      testimonial5_name: 'David Park',
      testimonial5_business: 'Park\'s Auto Repair, Austin TX',
      faq_label: 'Preguntas Frecuentes',
      faq_title: 'Preguntas Frecuentes',
      faq_q1: '¿Cuánto tiempo tarda?',
      faq_a1: 'Básico: 24-48 horas. Profesional: 3-5 días. Premium: 5-7 días. Nos movemos rápido sin sacrificar calidad.',
      faq_q2: '¿Qué pasa si no me gusta?',
      faq_a2: 'Todos los paquetes incluyen rondas de revisión. Trabajamos hasta que estés satisfecho. Tu satisfacción está garantizada.',
      faq_q3: '¿Necesito proporcionar contenido?',
      faq_a3: 'No. Nuestra IA escribe texto profesional para tu negocio. También puedes proporcionar tu propio contenido si lo prefieres.',
      faq_q4: '¿Mi sitio funcionará en teléfonos?',
      faq_a4: 'Cada sitio es mobile-first. Más del 60% de tus clientes navegan en su teléfono — tu sitio se verá genial en cualquier pantalla.',
      faq_q5: '¿Qué hay del SEO?',
      faq_a5: 'Todos los paquetes incluyen SEO en página. Los niveles Profesional y Premium incluyen schema markup avanzado e integración con Google Business.',
      faq_q6: '¿Manejan el hosting?',
      faq_a6: 'Sí. Todos los sitios incluyen hosting, SSL y CDN. Los planes Premium incluyen mantenimiento continuo.',
      faq_q7: '¿Puedo actualizar el sitio yo mismo?',
      faq_a7: 'Sí. Te damos acceso completo y un video tutorial para que puedas hacer cambios cuando quieras. No se necesitan habilidades técnicas.',
      faq_q8: '¿Qué incluye el plan de mantenimiento mensual?',
      faq_a8: '$47/mes incluye actualizaciones, respaldos, monitoreo de seguridad y cambios menores de contenido.',
      contact_title: '¿Listo Para un Sitio Web Que Realmente Funcione?',
      contact_subtitle: 'Cuéntanos sobre tu negocio y te mostraremos lo que es posible.',
      contact_name_label: 'Tu Nombre',
      contact_name_placeholder: 'Juan García',
      contact_email_label: 'Correo Electrónico',
      contact_business_label: 'Nombre del Negocio',
      contact_business_placeholder: 'Plomería García',
      contact_type_label: 'Tipo de Negocio',
      contact_type_placeholder: 'Selecciona tu industria',
      contact_type_plumber: 'Plomero',
      contact_type_hvac: 'HVAC',
      contact_type_dentist: 'Dentista',
      contact_type_roofer: 'Techador',
      contact_type_lawyer: 'Abogado',
      contact_type_electrician: 'Electricista',
      contact_type_landscaper: 'Jardinero',
      contact_type_auto: 'Taller Mecánico',
      contact_type_realestate: 'Bienes Raíces',
      contact_type_chiropractor: 'Quiropráctico',
      contact_type_other: 'Otro',
      contact_website_label: 'URL del Sitio Web Actual <span class="form-optional">(opcional)</span>',
      contact_message_label: 'Mensaje <span class="form-optional">(opcional)</span>',
      contact_optional: '(opcional)',
      contact_message_placeholder: 'Cuéntanos sobre tu negocio...',
      contact_submit: 'Obtener Mi Vista Previa Gratis',
      contact_success_title: '¡Recibimos tu solicitud!',
      contact_success_text: 'Revisaremos los detalles de tu negocio y te enviaremos un concepto de vista previa dentro de 24 horas. ¡Revisa tu bandeja de entrada!',
      contact_or_email: 'O escríbenos directamente a <a href="mailto:hello@almadigitaldesigns.com">hello@almadigitaldesigns.com</a>',
      footer_tagline: 'Parte de la red Alma Digital AI LLC',
      footer_network: 'Nuestra Red',
      footer_engineering: 'Diseñado por Agentes de IA de Alma Digital',
      footer_ftc: 'Todos los derechos reservados.',
      footer_disclosure: 'Divulgación FTC: Algunos enlaces en este sitio pueden ser enlaces de afiliados. Podemos ganar una comisión sin costo adicional para ti. Todas las opiniones son nuestras y las recomendaciones se basan en investigación exhaustiva.'
    }
  };

  let currentLang = 'en';

  /* ───────── HEADER SCROLL ───────── */
  const header = document.getElementById('header');

  function onScroll() {
    if (window.scrollY > 50) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ───────── MOBILE MENU ───────── */
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');

  if (mobileBtn && mobileNav) {
    mobileBtn.addEventListener('click', () => {
      const open = mobileBtn.classList.toggle('is-open');
      mobileNav.classList.toggle('is-open');
      mobileBtn.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileBtn.classList.remove('is-open');
        mobileNav.classList.remove('is-open');
        mobileBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ───────── SMOOTH SCROLL ───────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        const offset = header ? header.offsetHeight : 0;
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
      }
    });
  });

  /* ───────── CONTACT FORM ───────── */
  const form = document.getElementById('contactForm');
  const successEl = document.getElementById('contactSuccess');

  if (form && successEl) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const required = ['#name', '#email', '#business', '#businessType'];
      let ok = true;
      required.forEach(sel => {
        const f = form.querySelector(sel);
        if (!f) return;
        if (!f.value.trim() || (f.type === 'email' && !f.value.includes('@'))) {
          f.style.borderColor = '#ff5050';
          ok = false;
        } else {
          f.style.borderColor = '';
        }
      });
      if (!ok) return;

      // Build mailto link to send form data to business email
      const name = (form.querySelector('#name').value || '').trim();
      const email = (form.querySelector('#email').value || '').trim();
      const business = (form.querySelector('#business').value || '').trim();
      const businessType = (form.querySelector('#businessType').value || '').trim();
      const website = (form.querySelector('#website').value || '').trim();
      const message = (form.querySelector('#message').value || '').trim();

      const body = [
        'Name: ' + name,
        'Email: ' + email,
        'Business: ' + business,
        'Business Type: ' + businessType,
        website ? 'Website: ' + website : '',
        message ? 'Message: ' + message : ''
      ].filter(Boolean).join('\n');

      const mailtoUrl = 'mailto:hello@almadigitaldesigns.com'
        + '?subject=' + encodeURIComponent('New Website Inquiry from ' + name)
        + '&body=' + encodeURIComponent(body);
      window.location.href = mailtoUrl;

      form.hidden = true;
      successEl.hidden = false;
    });
  }

  /* ───────── LANGUAGE TOGGLE ───────── */
  function applyLang(lang) {
    currentLang = lang;
    const t = T[lang];
    if (!t) return;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] == null) return;
      if (t[key].includes('<')) el.innerHTML = t[key]; else el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key] != null) el.placeholder = t[key];
    });
    document.querySelectorAll('.lang-toggle__option').forEach(o => {
      o.classList.toggle('lang-toggle__option--active', o.dataset.lang === lang);
    });
  }

  const langBtn = document.getElementById('langToggle');
  if (langBtn) {
    langBtn.addEventListener('click', e => {
      const opt = e.target.closest('.lang-toggle__option');
      if (opt && opt.dataset.lang) applyLang(opt.dataset.lang);
    });
  }

  /* ───────── SCROLL REVEAL FALLBACK ───────── */
  /* ───────── BEFORE/AFTER SHOWCASE (static side-by-side, no slider needed) ───────── */

  // Add reveal class to cards
  document.querySelectorAll(
    '.problem__card, .steps__card, .pricing__card, .portfolio__card, .showcase__card, .testimonials__card, .faq__item'
  ).forEach(el => el.classList.add('reveal'));

  if (!CSS.supports('animation-timeline', 'scroll()')) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transition = 'opacity 0.5s cubic-bezier(0.16,1,0.3,1)';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  }

})();

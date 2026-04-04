# Meta Tags Specification — almadigitaldesigns.com

## Instructions for Apollo (WD)
Insert these inside `<head>` for each page. Character counts are noted.
- Title: max 60 characters (Google truncates at ~60)
- Description: max 160 characters (Google truncates at ~155-160)

---

## Homepage — index.html

```html
<title>Alma Digital Designs | AI-Powered Website Redesign Agency</title>
<!-- 55 chars -->

<meta name="description" content="We redesign outdated websites into revenue-generating machines. See a free AI-powered preview of your new site before you commit. Get started today.">
<!-- 152 chars -->

<meta name="keywords" content="web design agency, website redesign, AI website design, professional web design, small business web design">

<link rel="canonical" href="https://almadigitaldesigns.com/" />
```

---

## Privacy Policy Page — privacy.html

```html
<title>Privacy Policy | Alma Digital Designs</title>
<!-- 46 chars -->

<meta name="description" content="Read the Alma Digital Designs privacy policy. Learn how we collect, use, and protect your personal data in compliance with GDPR and CCPA.">
<!-- 137 chars -->

<link rel="canonical" href="https://almadigitaldesigns.com/privacy" />
<meta name="robots" content="noindex, follow" />
```

---

## Terms of Service Page — terms.html

```html
<title>Terms of Service | Alma Digital Designs</title>
<!-- 49 chars -->

<meta name="description" content="Review the terms and conditions governing use of Alma Digital Designs services and the almadigitaldesigns.com website.">
<!-- 118 chars -->

<link rel="canonical" href="https://almadigitaldesigns.com/terms" />
<meta name="robots" content="noindex, follow" />
```

---

## Section-Specific Meta (for SPA anchor sections)
If Apollo builds the site as a single-page application with anchor links,
these apply to the homepage only. If separate pages are created per section, use these.

### /pricing (if standalone page)
```html
<title>Web Design Pricing | Alma Digital Designs</title>
<!-- 49 chars -->

<meta name="description" content="Transparent web design pricing from Alma Digital Designs. Choose the plan that fits your budget. Free website preview included with every quote.">
<!-- 144 chars -->

<link rel="canonical" href="https://almadigitaldesigns.com/#pricing" />
```

### /portfolio (if standalone page)
```html
<title>Website Redesign Portfolio | Alma Digital Designs</title>
<!-- 56 chars -->

<meta name="description" content="See real before-and-after website redesign examples from Alma Digital Designs. Browse results by industry. Our work speaks for itself.">
<!-- 134 chars -->

<link rel="canonical" href="https://almadigitaldesigns.com/#portfolio" />
```

---

## Global Meta Tags (apply to ALL pages)

```html
<!-- Charset and Viewport (must be first) -->
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<!-- Author and Branding -->
<meta name="author" content="Alma Digital Designs" />

<!-- Theme color for browser chrome (use brand primary color) -->
<meta name="theme-color" content="#0a0a0f" />

<!-- Robots default (override per-page as needed) -->
<meta name="robots" content="index, follow" />

<!-- Geo / Local SEO -->
<meta name="geo.region" content="US" />
<meta name="geo.placename" content="United States" />

<!-- Language -->
<html lang="en">
<!-- For Spanish version: lang="es" -->
```

---

## Language Alternates (EN/ES Toggle)

```html
<!-- On English version -->
<link rel="alternate" hreflang="en" href="https://almadigitaldesigns.com/" />
<link rel="alternate" hreflang="es" href="https://almadigitaldesigns.com/?lang=es" />
<link rel="alternate" hreflang="x-default" href="https://almadigitaldesigns.com/" />
```

---

## Prospect Preview Pages (Template)
For each prospect preview page Apollo (WD) builds, use this template.
Replace [BUSINESS_NAME], [CITY], [STATE], [SLUG].

```html
<title>[BUSINESS_NAME] Website Redesign Preview | Alma Digital Designs</title>
<!-- Keep under 60 chars: "Acme Co Redesign Preview | Alma Digital" = 40 chars -->

<meta name="description" content="See your new [BUSINESS_NAME] website before you commit. Alma Digital Designs built you a free AI-powered preview. Claim it today — no obligation.">

<link rel="canonical" href="https://almadigitaldesigns.com/preview/[SLUG]" />

<!-- Block indexing on prospect pages — these are private previews -->
<meta name="robots" content="noindex, nofollow" />
```

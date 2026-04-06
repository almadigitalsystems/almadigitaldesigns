# Open Graph + Twitter Card Tags — almadigitalservices.com

## Instructions for Apollo (WD)
Insert these inside `<head>` on every page. The OG image should be 1200x630px.
Create a single branded OG image asset at: `assets/images/og-image.jpg`

Recommended OG image content:
- Dark background matching brand color scheme
- Alma Digital Designs logo (top-left)
- Bold headline: "AI-Powered Website Redesigns"
- Subtext: "Free Preview Before You Commit"
- A split before/after website mockup visual

---

## Homepage — index.html

```html
<!-- Open Graph (Facebook, LinkedIn, WhatsApp, Slack) -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://almadigitalservices.com/" />
<meta property="og:site_name" content="Alma Digital Designs" />
<meta property="og:title" content="Alma Digital Designs | AI-Powered Website Redesign Agency" />
<meta property="og:description" content="We redesign outdated websites into revenue-generating machines. See a free AI-powered preview of your new site before you commit." />
<meta property="og:image" content="https://almadigitalservices.com/assets/images/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Alma Digital Designs - AI-Powered Website Redesigns" />
<meta property="og:locale" content="en_US" />
<meta property="og:locale:alternate" content="es_ES" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@almadigital" />
<meta name="twitter:creator" content="@almadigital" />
<meta name="twitter:title" content="Alma Digital Designs | AI-Powered Website Redesign Agency" />
<meta name="twitter:description" content="We redesign outdated websites into revenue-generating machines. See a free AI-powered preview of your new site before you commit." />
<meta name="twitter:image" content="https://almadigitalservices.com/assets/images/og-image.jpg" />
<meta name="twitter:image:alt" content="Alma Digital Designs - AI-Powered Website Redesigns" />
```

---

## Privacy Policy Page — privacy.html

```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://almadigitalservices.com/privacy" />
<meta property="og:site_name" content="Alma Digital Designs" />
<meta property="og:title" content="Privacy Policy | Alma Digital Designs" />
<meta property="og:description" content="Read the Alma Digital Designs privacy policy. We are committed to protecting your personal data." />
<meta property="og:image" content="https://almadigitalservices.com/assets/images/og-image.jpg" />
<meta property="og:locale" content="en_US" />

<meta name="twitter:card" content="summary" />
<meta name="twitter:site" content="@almadigital" />
<meta name="twitter:title" content="Privacy Policy | Alma Digital Designs" />
<meta name="twitter:description" content="Read the Alma Digital Designs privacy policy." />
```

---

## Terms of Service Page — terms.html

```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://almadigitalservices.com/terms" />
<meta property="og:site_name" content="Alma Digital Designs" />
<meta property="og:title" content="Terms of Service | Alma Digital Designs" />
<meta property="og:description" content="Review the terms and conditions for using Alma Digital Designs services." />
<meta property="og:image" content="https://almadigitalservices.com/assets/images/og-image.jpg" />
<meta property="og:locale" content="en_US" />

<meta name="twitter:card" content="summary" />
<meta name="twitter:site" content="@almadigital" />
<meta name="twitter:title" content="Terms of Service | Alma Digital Designs" />
<meta name="twitter:description" content="Review the terms and conditions for using Alma Digital Designs services." />
```

---

## Prospect Preview Pages (Template)
Replace [BUSINESS_NAME], [CITY], [SLUG], [PREVIEW_IMAGE_URL].

```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://almadigitalservices.com/preview/[SLUG]" />
<meta property="og:site_name" content="Alma Digital Designs" />
<meta property="og:title" content="Your Free Website Preview is Ready, [BUSINESS_NAME]" />
<meta property="og:description" content="Alma Digital Designs built a free AI-powered preview of your redesigned [BUSINESS_NAME] website. Click to see it — no obligation, no credit card." />
<meta property="og:image" content="[PREVIEW_IMAGE_URL]" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="en_US" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@almadigital" />
<meta name="twitter:title" content="Your Free Website Preview is Ready, [BUSINESS_NAME]" />
<meta name="twitter:description" content="Alma Digital Designs built a free AI-powered preview of your redesigned website. No obligation." />
<meta name="twitter:image" content="[PREVIEW_IMAGE_URL]" />
```

---

## OG Image Spec for Designer
- Dimensions: 1200 x 630 px
- Format: JPG (optimized, under 200KB)
- Filename: `og-image.jpg` (saved to `assets/images/`)
- Background: Brand dark color (approx #0a0a0f or per style guide)
- Include Alma logo, tagline, and a website mockup split-screen
- Test at: https://opengraph.xyz or https://cards-dev.twitter.com/validator

# Schema Markup — almadigitaldesigns.com

## Instructions for Apollo (WD)
Insert each `<script type="application/ld+json">` block in the `<head>` section of the
relevant page. The homepage should include all three schemas: LocalBusiness, Service, and
BreadcrumbList. The FAQ schema only applies to the FAQ section page (or homepage if single-page).

---

## 1. LocalBusiness Schema
**Page:** index.html (homepage)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Alma Digital Designs",
  "url": "https://almadigitaldesigns.com",
  "logo": "https://almadigitaldesigns.com/assets/images/logo.png",
  "image": "https://almadigitaldesigns.com/assets/images/og-image.jpg",
  "description": "AI-powered website redesign agency that transforms outdated business websites into revenue-generating digital experiences. Free preview before you commit.",
  "telephone": "+1-INSERT-PHONE",
  "email": "hello@almadigitaldesigns.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "INSERT STREET ADDRESS",
    "addressLocality": "INSERT CITY",
    "addressRegion": "INSERT STATE",
    "postalCode": "INSERT ZIP",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "INSERT_LAT",
    "longitude": "INSERT_LNG"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "09:00",
      "closes": "18:00"
    }
  ],
  "sameAs": [
    "https://www.facebook.com/almadigitaldesigns",
    "https://www.instagram.com/almadigitaldesigns",
    "https://www.linkedin.com/company/almadigitaldesigns",
    "https://twitter.com/almadigital"
  ],
  "priceRange": "$$",
  "currenciesAccepted": "USD",
  "paymentAccepted": "Credit Card, ACH Transfer",
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "hasMap": "https://maps.google.com/?q=INSERT+ADDRESS"
}
</script>
```

**NOTE:** Replace all INSERT_ placeholders with real business data when available.

---

## 2. Service Schema
**Page:** index.html (homepage, can also be on a /services page if created)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Website Redesign",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Alma Digital Designs",
    "url": "https://almadigitaldesigns.com"
  },
  "name": "AI-Powered Website Redesign",
  "description": "We redesign outdated business websites using AI to deliver stunning, conversion-optimized sites. You see a free preview before committing. Pure HTML/CSS/JS — fast, mobile-first, and SEO-ready.",
  "url": "https://almadigitaldesigns.com",
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Website Redesign Packages",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Starter Redesign",
          "description": "Professional website redesign for small businesses. Up to 5 pages, mobile-first, SEO-optimized."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Growth Redesign",
          "description": "Full website redesign with lead capture, analytics integration, and monthly maintenance."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Premium AI Redesign",
          "description": "Complete AI-powered redesign with custom animations, interactive tools, and ongoing optimization."
        }
      }
    ]
  }
}
</script>
```

---

## 3. FAQ Schema
**Page:** index.html (homepage, applied to the FAQ section)
Update the FAQ questions/answers to match the actual copy Clive (CA) writes.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does a website redesign cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our website redesign packages start at [INSERT PRICE]. We offer tiered pricing based on the size and complexity of your site. You can see a free preview of your new website before committing to any package."
      }
    },
    {
      "@type": "Question",
      "name": "How long does a website redesign take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most website redesigns are completed within 7-14 days depending on scope. Our AI-powered process dramatically speeds up design and development so you get a stunning result faster than traditional agencies."
      }
    },
    {
      "@type": "Question",
      "name": "Can I see my new website before I pay?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. We build a free AI-powered preview of your redesigned website before you commit to anything. Enter your current website URL and we will show you exactly what your new site will look like."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need to provide any information to get started?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "All we need to start is your current website URL. Our AI analyzes your existing site and generates a free preview. We then follow up with your contact details to send it over."
      }
    },
    {
      "@type": "Question",
      "name": "Will my new website work on mobile devices?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely. Every website we build is mobile-first and tested across all screen sizes and devices. We also ensure it scores 95 or above on Google PageSpeed for fast load times."
      }
    },
    {
      "@type": "Question",
      "name": "Do you offer ongoing website maintenance?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Our Growth and Premium packages include ongoing maintenance and optimization. We become your long-term digital growth partner, continuously improving your site's performance and conversion rate."
      }
    }
  ]
}
</script>
```

**NOTE:** Clive (CA) should update these answers with the finalized copy from ALM-483.

---

## 4. BreadcrumbList Schema
**Page:** All pages except homepage

```html
<!-- Example for Privacy Policy page -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://almadigitaldesigns.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Privacy Policy",
      "item": "https://almadigitaldesigns.com/privacy"
    }
  ]
}
</script>
```

---

## 5. WebSite Schema (for Sitelinks Searchbox)
**Page:** index.html (homepage only)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Alma Digital Designs",
  "url": "https://almadigitaldesigns.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://almadigitaldesigns.com/?s={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
</script>
```

---

## Validation
After launch, validate all schema at: https://search.google.com/test/rich-results

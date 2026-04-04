# SEO Integration Checklist — For Apollo (WD)
## All items must be complete before Day 7 performance pass

This checklist covers everything Taylor (SEO) has prepared. Reference the linked files
for exact code to copy-paste. Do not write your own meta tags — use the specs here.

---

## Files to Reference

| File | What It Contains |
|------|-----------------|
| `seo/meta-tags.md` | Title tags, meta descriptions, canonical URLs, robots meta |
| `seo/og-tags.md` | Open Graph + Twitter Card tags for all pages |
| `seo/schema-markup.md` | JSON-LD blocks (LocalBusiness, Service, FAQ, BreadcrumbList, WebSite) |
| `seo/heading-hierarchy.md` | H1–H6 structure for every section and page |
| `seo/keywords.md` | Keyword targets per section (for copy placement guidance) |
| `seo/image-alt-tags.md` | Alt text rules and templates for every image type |
| `sitemap.xml` | Drop in project root — update `lastmod` dates at launch |
| `robots.txt` | Drop in project root — no changes needed |

---

## index.html — `<head>` Checklist

### Required in `<head>` (in this order):
- [ ] `<meta charset="UTF-8" />`
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`
- [ ] `<title>` — from `meta-tags.md` homepage section
- [ ] `<meta name="description">` — from `meta-tags.md`
- [ ] `<meta name="keywords">` — from `meta-tags.md`
- [ ] `<meta name="robots" content="index, follow" />`
- [ ] `<meta name="author" content="Alma Digital Designs" />`
- [ ] `<meta name="theme-color" content="#0a0a0f" />` (update to exact brand color from style guide)
- [ ] `<link rel="canonical" href="https://almadigitaldesigns.com/" />`
- [ ] hreflang alternates (EN/ES) — from `meta-tags.md`
- [ ] All OG tags — from `og-tags.md`
- [ ] All Twitter Card tags — from `og-tags.md`
- [ ] LocalBusiness schema JSON-LD — from `schema-markup.md`
- [ ] Service schema JSON-LD — from `schema-markup.md`
- [ ] FAQPage schema JSON-LD — from `schema-markup.md`
- [ ] WebSite schema JSON-LD — from `schema-markup.md`

### Schema Placeholders That Need Real Data (flag to manager):
- `telephone` in LocalBusiness schema
- `streetAddress`, `addressLocality`, `addressRegion`, `postalCode` in LocalBusiness schema
- `geo.latitude` / `geo.longitude` in LocalBusiness schema
- `sameAs` social media URLs (confirm correct handles)
- `hasMap` Google Maps URL
- FAQ answer prices (`[INSERT PRICE]`) — wait for Clive (CA) finalized copy

---

## privacy.html — `<head>` Checklist
- [ ] `<title>` — from `meta-tags.md` privacy section
- [ ] `<meta name="description">` — from `meta-tags.md`
- [ ] `<meta name="robots" content="noindex, follow" />`
- [ ] `<link rel="canonical" href="https://almadigitaldesigns.com/privacy" />`
- [ ] OG + Twitter tags — from `og-tags.md` privacy section
- [ ] BreadcrumbList schema — from `schema-markup.md`

---

## terms.html — `<head>` Checklist
- [ ] `<title>` — from `meta-tags.md` terms section
- [ ] `<meta name="description">` — from `meta-tags.md`
- [ ] `<meta name="robots" content="noindex, follow" />`
- [ ] `<link rel="canonical" href="https://almadigitaldesigns.com/terms" />`
- [ ] OG + Twitter tags — from `og-tags.md` terms section
- [ ] BreadcrumbList schema — from `schema-markup.md`

---

## Body / Content Checklist

### Heading Hierarchy
- [ ] Exactly ONE `<h1>` on homepage — see `heading-hierarchy.md`
- [ ] All section headings use correct H2 level — see `heading-hierarchy.md`
- [ ] H3s used for sub-items within sections
- [ ] No heading levels skipped

### Images
- [ ] Every `<img>` has an `alt` attribute (empty `alt=""` is OK for decorative)
- [ ] Before/after portfolio images have descriptive alt text — see `image-alt-tags.md`
- [ ] All non-hero images have `loading="lazy"`
- [ ] Hero/first LCP image uses `loading="eager"` or no loading attribute

### Root Files
- [ ] `sitemap.xml` placed in project root
- [ ] `robots.txt` placed in project root
- [ ] `sitemap.xml` `lastmod` dates updated to actual launch date before deploy

---

## Prospect Preview Pages (Template)
For each prospect preview page, use the noindex template from `meta-tags.md` and
the OG template from `og-tags.md`. These pages must NEVER be indexed.

---

## Post-Launch Validation (Day 6 / Before Day 7)
- [ ] Run https://search.google.com/test/rich-results on homepage
- [ ] Check all OG tags with https://opengraph.xyz
- [ ] Verify robots.txt at https://almadigitaldesigns.com/robots.txt
- [ ] Verify sitemap.xml at https://almadigitaldesigns.com/sitemap.xml
- [ ] Submit sitemap to Google Search Console
- [ ] Confirm noindex on /privacy, /terms, and all /preview/* pages

---

## Questions?
Tag @Taylor (SEO) in the relevant task comment.

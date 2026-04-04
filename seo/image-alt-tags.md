# Image Alt Tag Specification — almadigitaldesigns.com
## For: Apollo (WD)

### Why Alt Tags Matter for SEO
- Google Image Search: good alt text drives image traffic
- Accessibility: screen readers read alt text (required for WCAG 2.1)
- Ranking signal: alt text reinforces page topic and keyword relevance
- Core Web Vitals: lazy-loaded images still need alt text

---

### Rules for Writing Alt Text
1. **Describe the image accurately** — what is literally shown
2. **Include keywords naturally** — do not keyword-stuff
3. **Keep it under 125 characters**
4. **Decorative images**: use `alt=""` (empty) — do not describe decorative dividers, backgrounds, or icons that add no content meaning
5. **Logos**: use `alt="Alma Digital Designs logo"` (not just `alt="logo"`)
6. **Before/after sliders**: describe both states (see examples below)

---

### Section-by-Section Alt Text Guidance

#### Logo
```html
<img src="assets/images/logo.png" alt="Alma Digital Designs logo" width="180" height="48">
```

#### Hero Section

| Image/Asset                          | Alt Text                                                           |
|--------------------------------------|---------------------------------------------------------------------|
| Hero background or animated visual   | `alt=""` if purely decorative                                       |
| Website mockup in hero               | `alt="Website redesign mockup showing modern dark-themed design"`   |
| Hero split-screen preview            | `alt="Before and after website redesign comparison"`                |

#### Problem Section

| Image/Asset                          | Alt Text                                                           |
|--------------------------------------|---------------------------------------------------------------------|
| Sad/frustrated business owner icon   | `alt=""` (decorative icon)                                          |
| Slow website speed graph             | `alt="Chart showing slow website load time costing business leads"` |
| Mobile fail screenshot               | `alt="Non-mobile-friendly website example on smartphone"`           |
| Trust signal / stat graphic          | `alt=""` (if purely decorative chart used for visual effect)        |

#### How It Works

| Image/Asset                                  | Alt Text                                                         |
|----------------------------------------------|-------------------------------------------------------------------|
| Step 1 icon (website URL input)               | `alt=""` (decorative step icon)                                   |
| Step 2 icon (AI building)                     | `alt=""` (decorative step icon)                                   |
| Step 3 icon (preview reveal)                  | `alt=""` (decorative step icon)                                   |
| AI process illustration/animation still       | `alt="AI-powered website redesign process visualization"`         |

#### Pricing Section

| Image/Asset                     | Alt Text                                                           |
|---------------------------------|---------------------------------------------------------------------|
| Check mark icons                | `alt=""` (decorative)                                               |
| Recommended badge               | `alt="Recommended plan badge"`                                      |
| Pricing illustration            | `alt="Website redesign pricing tiers — Starter, Growth, Premium"`  |

#### Portfolio / Before-After Sliders

```html
<!-- Before image -->
<img src="assets/portfolio/client-A-before.jpg"
     alt="[Industry] business website before redesign — outdated layout, poor mobile experience"
     loading="lazy">

<!-- After image -->
<img src="assets/portfolio/client-A-after.jpg"
     alt="[Industry] business website after Alma Digital Designs redesign — modern, mobile-first design"
     loading="lazy">
```

Template pattern: `"[INDUSTRY] [BUSINESS TYPE] website [before/after] redesign"`

Examples:
- `alt="Restaurant website before redesign — outdated layout with poor mobile experience"`
- `alt="Restaurant website after Alma Digital Designs redesign — modern dark design with online ordering"`
- `alt="HVAC company website transformation — before and after Alma Digital Designs redesign"`

#### Testimonials

| Image/Asset                          | Alt Text                                                           |
|--------------------------------------|---------------------------------------------------------------------|
| Client photo                         | `alt="[Client name], [title] at [company]"`                        |
| Star rating graphic                  | `alt="5-star rating"`                                               |
| Video thumbnail                      | `alt="Video testimonial from [client name] — [company]"`           |
| Play button icon                     | `alt=""` (decorative)                                               |

#### FAQ Section

| Image/Asset                | Alt Text         |
|----------------------------|------------------|
| Accordion expand icon (+)  | `alt=""` (decorative) |
| Accordion collapse icon (–)| `alt=""` (decorative) |

#### Lead Capture Form

| Image/Asset                     | Alt Text                                              |
|---------------------------------|-------------------------------------------------------|
| Progress bar indicator          | `alt=""` (decorative)                                 |
| Website audit screenshot        | `alt="Live website audit showing [BUSINESS_NAME] site issues"` |
| Step icons                      | `alt=""` (decorative)                                 |

#### Footer

| Image/Asset              | Alt Text                                     |
|--------------------------|----------------------------------------------|
| Footer logo              | `alt="Alma Digital Designs"`                  |
| Social media icons       | `alt="Alma Digital Designs on [Platform]"`   |
| Payment method icons     | `alt="[Card/Payment method name]"`           |

---

### Lazy Loading Requirement
ALL images except the first visible image in the hero must use:
```html
loading="lazy"
```

The hero background image or first visible image should use:
```html
loading="eager"
```
(or omit loading attribute, which defaults to eager)

This is critical for Core Web Vitals (Largest Contentful Paint).

---

### Checklist Before Launch
- [ ] Every `<img>` tag has an `alt` attribute (even if empty for decorative images)
- [ ] No alt text over 125 characters
- [ ] Before/after portfolio images have descriptive, keyword-rich alt text
- [ ] Logo alt text is exactly `"Alma Digital Designs logo"`
- [ ] All non-hero images have `loading="lazy"`
- [ ] No duplicate alt text across multiple images on the same page

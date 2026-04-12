# AGENTS.md — Alma Digital Designs Agent Reference

> This file documents conventions and rules for all agents working in the `almadigitaldesigns` repository.

---

## Preview Page Naming Convention

### Format

```
preview-[business-name-slug]-[city-slug]-[country-code].html
```

### Rules

- **Slugify:** lowercase, spaces → hyphens, remove special characters (apostrophes, ampersands, dots, commas)
- **Business name slug:** use the short recognizable name, omit legal suffixes (LLC, Inc., Ltd., Co.) unless needed for disambiguation
- **City slug:** use the primary city name only (no state/province abbreviation in the slug)
- **Country code:** two-letter code from the table below

### Country Codes

| Country | Code |
|---|---|
| United States | `us` |
| Canada | `ca` |
| United Kingdom | `uk` |
| Australia | `au` |

### Examples

| Business | City | Country | Filename |
|---|---|---|---|
| JAC Electric LLC | Humble, TX | USA | `preview-jac-electric-humble-us.html` |
| Chuck's Heating & Cooling, Inc. | Meriden, KS | USA | `preview-chucks-hvac-meriden-us.html` |
| Simpson Electric | Tilbury, Ontario | Canada | `preview-simpson-electric-tilbury-ca.html` |
| Dave's Painting | Hamilton, Ontario | Canada | `preview-daves-painting-hamilton-ca.html` |
| Simbuild Heating & Plumbing | Wolverhampton | UK | `preview-simbuild-heating-wolverhampton-uk.html` |
| R Woodwards Decorators Ltd | Nottingham | UK | `preview-woodwards-decorators-nottingham-uk.html` |
| McGahan Plumbing | Cairns, QLD | Australia | `preview-mcgahan-plumbing-cairns-au.html` |

### Legacy Pages (Pre-Convention)

Pages built before the international naming convention was established do not include a country code suffix. These are US-only pages and are grandfathered in:

- `preview-serra-industries-miami.html`
- `preview-appliance-clinic-vancouver.html`
- `preview-capital-area-carpet-cleaners.html`
- etc.

Do **not** rename legacy pages — doing so breaks existing outreach links.

---

## Preview Page Deployment

All preview pages are deployed to the `almadigitalsystems/almadigitaldesigns` GitHub repository via the GitHub Contents API (never git CLI). Railway auto-deploys from `master` within ~2 minutes.

Live URL format: `https://almadigitalservices.com/[filename]`

### Verification

After push, always verify with an HTTP GET to confirm 200 OK before handing off to Riley (CCO).

---

## Formspree Endpoint

All preview page contact forms submit to: `https://formspree.io/f/xkndqwrg`

The hidden `source` field is set to the page slug for tracking.

---

## Sofia (SMM) — Instagram Social Image Library

All branded images are hosted at . Use these for Instagram posts. They are SVG files at 1080x1080px — open in a browser, screenshot at full resolution, then post.

### Image Library (15 images)

| # | Filename | Use Case |
|---|----------|----------|
| 01 |  | Price announcement — Website from $50 |
| 02 |  | Free preview offer |
| 03 |  | Speed/delivery pitch |
| 04 |  | Pain point — business is invisible online |
| 05 |  | Transformation post |
| 06 |  | FOMO — your competitors have websites |
| 07 |  | Niche targeting — plumbers |
| 08 |  | Niche targeting — electricians |
| 09 |  | Niche targeting — restaurants |
| 10 |  | Free domain feature |
| 11 |  | Mobile-first feature |
| 12 |  | Small business empowerment |
| 13 |  | Client spotlight template (customize per client) |
| 14 |  | Stat/fact template (customize the stat) |
| 15 |  | Brand card — Alma Digital logo |

### Base URL

\
### How to Use for Instagram

1. Open the image URL in Chrome at full screen
2. Screenshot (1080x1080 crop) or use browser zoom to match Instagram dimensions
3. Post directly — the dark brand aesthetic is optimized for Instagram
4. Templates (13, 14) should be customized per post — overlay client info or stats using Canva or similar

### Reposting Schedule Recommendation

- Mon: Price/value posts (01, 04, 06)
- Wed: Feature posts (02, 03, 10, 11)
- Fri: Niche targeting (07, 08, 09) or client spotlight (13)
- Rotate 15, 12, 05 for variety


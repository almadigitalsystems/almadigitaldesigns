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

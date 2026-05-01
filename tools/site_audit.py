"""
site_audit.py â€” Alma Digital Site Audit Tool
Scores a prospect's website and returns the single most impactful finding
as an email hook sentence for cold outreach.

Usage:
  python site_audit.py <url> [--industry "Nail Salon"] [--city "Austin TX"]

Output (JSON):
  {
    "url": "...",
    "score": 0-100,
    "top_issue": "mobile_speed | no_cta | no_ssl | no_meta_desc | no_h1 | no_phone",
    "hook_sentence": "We analyzed your site and found ...",
    "all_findings": {...}
  }
"""

import sys
import json
import re
import urllib.request
import urllib.parse
import urllib.error
import ssl
import time

# â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

PAGESPEED_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
PAGESPEED_KEY = ""   # set via env var GOOGLE_API_KEY if available
USER_AGENT = "Mozilla/5.0 (compatible; AlmaDigitalAudit/1.0)"
TIMEOUT = 12  # seconds

# Issue priority order â€” first match = top finding reported in hook
PRIORITY_ORDER = [
    "no_ssl",
    "speed_critical",   # <40
    "no_cta",
    "no_phone",
    "no_meta_desc",
    "speed_poor",       # 40-59
    "no_h1",
    "speed_needs_work", # 60-74
]


# â”€â”€ Fetch helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

def fetch_html(url, timeout=TIMEOUT):
    """Fetch the raw HTML of a URL. Returns (html_str, final_url, error)."""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            charset = resp.headers.get_content_charset() or "utf-8"
            return resp.read().decode(charset, errors="replace"), resp.url, None
    except urllib.error.URLError as e:
        return None, url, str(e)
    except Exception as e:
        return None, url, str(e)


def fetch_pagespeed(url, strategy="mobile", api_key=""):
    """Call Google PageSpeed Insights. Returns (score_int_or_None, lcp_ms, fcp_ms, error)."""
    params = {"url": url, "strategy": strategy}
    if api_key:
        params["key"] = api_key
    query = urllib.parse.urlencode(params)
    full_url = f"{PAGESPEED_API}?{query}"
    req = urllib.request.Request(full_url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read())
            cats = data.get("lighthouseResult", {}).get("categories", {})
            perf = cats.get("performance", {})
            score = perf.get("score")
            score_int = int(round(score * 100)) if score is not None else None

            audits = data.get("lighthouseResult", {}).get("audits", {})
            lcp = audits.get("largest-contentful-paint", {}).get("numericValue")
            fcp = audits.get("first-contentful-paint", {}).get("numericValue")
            return score_int, lcp, fcp, None
    except Exception as e:
        return None, None, None, str(e)


# â”€â”€ HTML analysis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

def check_ssl(url):
    return url.lower().startswith("https://")


def check_viewport(html):
    return bool(re.search(r'<meta[^>]+name=["\']viewport["\']', html, re.I))


def check_meta_description(html):
    m = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']{10,})["\']', html, re.I)
    if not m:
        m = re.search(r'<meta[^>]+content=["\']([^"\']{10,})["\'][^>]+name=["\']description["\']', html, re.I)
    return m is not None


def check_h1(html):
    return bool(re.search(r'<h1[\s>]', html, re.I))


def check_cta(html):
    """Look for booking/contact/appointment call-to-action elements."""
    cta_patterns = [
        r'book\s*(now|appointment|online)',
        r'schedule\s*(now|appointment|today|a\s+call)',
        r'get\s*(a\s+)?quote',
        r'contact\s*us',
        r'request\s*(a\s+)?(service|appointment|quote)',
        r'call\s*(us|now|today)',
        r'href=["\'][^"\']*contact[^"\']*["\']',
        r'href=["\'][^"\']*booking[^"\']*["\']',
        r'href=["\'][^"\']*schedule[^"\']*["\']',
        r'href=["\'][^"\']*appointment[^"\']*["\']',
    ]
    for pattern in cta_patterns:
        if re.search(pattern, html, re.I):
            return True
    return False


def check_phone_number(html):
    """Look for a visible phone number on the page."""
    phone_patterns = [
        r'\(?\d{3}\)?[\s\-\.]\d{3}[\s\-\.]\d{4}',  # (555) 123-4567
        r'tel:\+?\d{10,}',                            # tel: links
        r'href=["\']tel:',
    ]
    for pattern in phone_patterns:
        if re.search(pattern, html):
            return True
    return False


def check_title(html):
    m = re.search(r'<title>([^<]{3,})</title>', html, re.I)
    return m.group(1).strip() if m else None


# â”€â”€ Hook sentence generation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

def build_hook(top_issue, findings, industry="business", city="your area", url=""):
    """Return a personalized email hook sentence for the top issue."""
    mobile_score = findings.get("mobile_score")

    hooks = {
        "no_ssl": (
            "Your site is still running on HTTP â€” Google flags it as 'Not Secure' to every visitor, "
            "which kills trust before they even read your services."
        ),
        "speed_critical": (
            f"Your site scored {mobile_score}/100 on mobile speed â€” Google considers anything below 50 a critical failure "
            f"and actively pushes your site down in search results for {city}."
        ),
        "no_cta": (
            f"We visited your site and couldn't find a clear way to book or contact you â€” "
            f"visitors are landing on your page and leaving without taking action."
        ),
        "no_phone": (
            f"Your phone number isn't visible on your homepage â€” "
            f"customers who want to call are bouncing to a competitor who makes it easy."
        ),
        "no_meta_desc": (
            f"Your site has no meta description, which means Google is either showing nothing "
            f"or auto-generating gibberish in your search listing for {industry} in {city}."
        ),
        "speed_poor": (
            f"Your site scored {mobile_score}/100 on mobile speed â€” "
            f"most {industry} sites in {city} are above 65, and slow sites lose 53% of mobile visitors before the page even loads."
        ),
        "no_h1": (
            f"Your homepage has no clear headline â€” Google can't tell what your business does, "
            f"which hurts your ranking for {industry} searches in {city}."
        ),
        "speed_needs_work": (
            f"Your site scored {mobile_score}/100 on mobile speed â€” "
            f"there's room to improve, and faster sites convert significantly more visitors into customers."
        ),
    }

    return hooks.get(top_issue, f"We found several issues on your site that are likely hurting your traffic and bookings in {city}.")


# â”€â”€ Scoring â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

def compute_overall_score(findings):
    """Produce a 0-100 score summarizing the site health."""
    score = 100

    if not findings.get("ssl"):
        score -= 25
    mobile = findings.get("mobile_score")
    if mobile is not None:
        if mobile < 40:
            score -= 30
        elif mobile < 60:
            score -= 20
        elif mobile < 75:
            score -= 10
    if not findings.get("has_cta"):
        score -= 15
    if not findings.get("has_phone"):
        score -= 10
    if not findings.get("has_meta_desc"):
        score -= 10
    if not findings.get("has_h1"):
        score -= 5
    if not findings.get("has_viewport"):
        score -= 5

    return max(0, min(100, score))


# â”€â”€ Main audit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

def run_audit(url, industry="business", city="your area", api_key=""):
    # Normalise URL
    if not url.startswith("http"):
        url = "https://" + url

    result = {
        "url": url,
        "industry": industry,
        "city": city,
        "score": None,
        "top_issue": None,
        "hook_sentence": None,
        "all_findings": {},
        "errors": [],
    }

    # 1. SSL check (immediate, no network)
    ssl_ok = check_ssl(url)

    # 2. Fetch HTML
    html, final_url, html_err = fetch_html(url)
    if html_err:
        result["errors"].append(f"HTML fetch failed: {html_err}")
    if not html:
        html = ""

    # 3. HTML checks
    has_viewport = check_viewport(html)
    has_meta_desc = check_meta_description(html)
    has_h1 = check_h1(html)
    has_cta = check_cta(html)
    has_phone = check_phone_number(html)
    title = check_title(html)

    # 4. PageSpeed (try, but don't block on failure)
    mobile_score, lcp, fcp, ps_err = fetch_pagespeed(url, "mobile", api_key)
    if ps_err:
        result["errors"].append(f"PageSpeed API: {ps_err}")

    # 5. Aggregate findings
    findings = {
        "ssl": ssl_ok,
        "mobile_score": mobile_score,
        "lcp_ms": lcp,
        "fcp_ms": fcp,
        "has_viewport": has_viewport,
        "has_meta_desc": has_meta_desc,
        "has_h1": has_h1,
        "has_cta": has_cta,
        "has_phone": has_phone,
        "page_title": title,
    }
    result["all_findings"] = findings

    # 6. Determine active issues
    active_issues = []
    if not ssl_ok:
        active_issues.append("no_ssl")
    if mobile_score is not None:
        if mobile_score < 40:
            active_issues.append("speed_critical")
        elif mobile_score < 60:
            active_issues.append("speed_poor")
        elif mobile_score < 75:
            active_issues.append("speed_needs_work")
    if not has_cta:
        active_issues.append("no_cta")
    if not has_phone:
        active_issues.append("no_phone")
    if not has_meta_desc:
        active_issues.append("no_meta_desc")
    if not has_h1:
        active_issues.append("no_h1")

    # 7. Pick top issue by priority
    top_issue = None
    for issue in PRIORITY_ORDER:
        if issue in active_issues:
            top_issue = issue
            break

    result["top_issue"] = top_issue
    result["active_issues"] = active_issues
    result["score"] = compute_overall_score(findings)

    if top_issue:
        result["hook_sentence"] = build_hook(top_issue, findings, industry, city, url)
    else:
        result["hook_sentence"] = (
            f"We analyzed your site and found opportunities to improve your visibility "
            f"and conversion rate for {industry} customers in {city}."
        )

    return result


# â”€â”€ CLI entry point â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

if __name__ == "__main__":
    import os

    if len(sys.argv) < 2:
        print("Usage: python site_audit.py <url> [--industry '...'] [--city '...']")
        sys.exit(1)

    url = sys.argv[1]
    industry = "business"
    city = "your area"

    args = sys.argv[2:]
    for i, arg in enumerate(args):
        if arg == "--industry" and i + 1 < len(args):
            industry = args[i + 1]
        if arg == "--city" and i + 1 < len(args):
            city = args[i + 1]

    api_key = os.environ.get("GOOGLE_API_KEY", "")

    print(f"Auditing: {url}", file=sys.stderr)
    print(f"Industry: {industry} | City: {city}", file=sys.stderr)
    print("Fetching PageSpeed data (may take 10-20s)...", file=sys.stderr)

    audit = run_audit(url, industry=industry, city=city, api_key=api_key)

    print(json.dumps(audit, indent=2))

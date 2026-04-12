'use strict';

const crypto = require('crypto');
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const Stripe = require('stripe');

const app = express();

// Save raw body for Stripe webhook signature verification
app.use(express.json({
  limit: '1mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
}));

// ── SERRAINDUSTRIES.COM VIRTUAL HOST ROUTING ─────────────────────────────────
// Serve Serra Industries website when Host is serraindustries.com
app.use((req, res, next) => {
  const host = (req.hostname || '').toLowerCase();
  if (host === 'serraindustries.com' || host === 'www.serraindustries.com') {
    const urlPath = req.path;
    // Map clean URLs to HTML files
    const pageMap = {
      '/': '/serraindustries/index.html',
      '/about': '/serraindustries/about.html',
      '/services': '/serraindustries/services.html',
      '/portfolio': '/serraindustries/portfolio.html',
      '/contact': '/serraindustries/contact.html',
    };
    const mapped = pageMap[urlPath] || pageMap[urlPath.replace(/\/$/, '')] || null;
    if (mapped) {
      return res.sendFile(require('path').join(__dirname, mapped));
    }
    // Serve other static assets from serraindustries dir
    const stripped = urlPath.startsWith('/serraindustries') ? urlPath : '/serraindustries' + urlPath;
    return require('express').static(require('path').join(__dirname))(
      Object.assign(req, { url: stripped }), res, next
    );
  }
  next();
});

app.use(express.static(path.join(__dirname)));

// ── ALEX SYSTEM PROMPT ────────────────────────────────────────────────────────

const ALEX_SYSTEM_PROMPT = `You are Alex, a friendly and knowledgeable support specialist at Alma Digital Services. You are warm, helpful, and genuinely excited to help clients and visitors.

Company: Alma Digital Services
Website: almadigitalservices.com
Email: desk@almawebcreative.com

Our services:
- Starter Plan: $50 one-time (5 pages) or $17/month with hosting and maintenance
- Growth Plan: $100 one-time (10 pages) or $23/month with hosting and maintenance
- Premium Plan: $150 one-time (20+ pages) or $33/month with hosting and maintenance
- Free domain if you don't already have one
- Free preview before any payment
- Up to unlimited revisions before you pay
- 48 hour delivery
- Cancel hosting anytime
- Transfer fee $25 before 6 months
- Free transfer after 6 months

Your job:
- Help visitors understand our plans and pricing
- Help existing clients with DNS setup and domain connection questions
- Answer questions about the website build process
- Handle billing and cancellation questions
- Make everyone feel welcome and supported
- Never make them feel stupid — technical things are confusing and that is perfectly okay

DNS knowledge — you know step by step instructions for connecting domains from these registrars: GoDaddy, Namecheap, Wix, Squarespace, Google Domains, and any other registrar using plain English instructions.

Rules:
- Always be warm and conversational — never robotic
- Use simple plain English — no technical jargon
- Use emojis occasionally but not excessively
- Never say you are an AI — you are Alex
- Keep responses short and easy to read
- Always end with a question or offer to help further
- If you truly cannot help say "Let me flag this for our team right away — someone will follow up with you within the hour!" and collect their email address`;

// ── GMAIL TRANSPORTER ─────────────────────────────────────────────────────────

function createMailTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER_1 || 'desk@almawebcreative.com',
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN_1,
    },
  });
}

// ── DOMAIN AVAILABILITY via RDAP ──────────────────────────────────────────────
// Uses the public RDAP protocol (no API key required).
// 404 = available, 200 = registered.

async function checkDomainAvailable(domain) {
  try {
    const tld = domain.split('.').pop();
    // Use Verisign for .com/.net (most reliable), fallback to rdap.org
    const urls = tld === 'com' || tld === 'net'
      ? [`https://rdap.verisign.com/${tld}/v1/domain/${domain}`]
      : [`https://rdap.org/domain/${domain}`];

    const res = await fetch(urls[0], {
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
    });
    return res.status === 404;
  } catch {
    return null; // unknown
  }
}

// ── API: CHAT ─────────────────────────────────────────────────────────────────

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: ALEX_SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', response.status, err);
      return res.status(502).json({ error: 'Chat service unavailable' });
    }

    const data = await response.json();
    res.json({ reply: data.content?.[0]?.text || '' });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── API: ESCALATE ─────────────────────────────────────────────────────────────

app.post('/api/escalate', async (req, res) => {
  try {
    const { transcript, visitorEmail, question, timestamp } = req.body;

    const transporter = createMailTransporter();

    const transcriptText = Array.isArray(transcript)
      ? transcript.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n\n')
      : String(transcript || '');

    const mailOptions = {
      from: `"Alma Digital Chat" <${process.env.GMAIL_USER_1 || 'desk@almawebcreative.com'}>`,
      to: 'desk@almawebcreative.com',
      subject: `Live Chat Escalation — ${new Date(timestamp || Date.now()).toLocaleString('en-US', { timeZone: 'America/New_York' })} EST`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#1a1a2e;border-bottom:2px solid #00d4ff;padding-bottom:10px">
            Live Chat Escalation Alert
          </h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            <tr>
              <td style="padding:8px;font-weight:bold;width:140px">Visitor Email</td>
              <td style="padding:8px">${visitorEmail || 'Not provided'}</td>
            </tr>
            <tr style="background:#f9f9f9">
              <td style="padding:8px;font-weight:bold">Timestamp</td>
              <td style="padding:8px">${new Date(timestamp || Date.now()).toLocaleString('en-US', { timeZone: 'America/New_York' })} EST</td>
            </tr>
            <tr>
              <td style="padding:8px;font-weight:bold">Last Question</td>
              <td style="padding:8px">${question || 'See transcript'}</td>
            </tr>
          </table>
          <h3 style="color:#1a1a2e">Full Transcript</h3>
          <pre style="background:#f4f4f4;padding:15px;border-radius:6px;white-space:pre-wrap;font-size:13px">${transcriptText}</pre>
          <p style="color:#666;font-size:12px;margin-top:20px">
            Sent automatically by the Alma Digital live chat system.
            Follow up within 1 hour.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error('Escalation email error:', err);
    res.json({ success: false, error: String(err.message) });
  }
});

// ── API: DOMAIN SEARCH ────────────────────────────────────────────────────────
// Returns 4-6 available domain options for a given business name.
// Uses RDAP protocol for availability checking (no API key required).
// Cloudflare Registrar search is attempted first; RDAP used as fallback.

app.get('/api/domain-search', async (req, res) => {
  try {
    const { q, city, tld } = req.query;
    if (!q) return res.status(400).json({ error: 'q (business name) required' });

    const base = q.toLowerCase().replace(/[^a-z0-9]/g, '');
    const citySlug = (city || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    // Generate 6 candidate variations
    const candidates = [
      `${base}.com`,
      `${base}.co`,
      citySlug ? `${base}${citySlug}.com` : `get${base}.com`,
      `get${base}.com`,
      `${base}services.com`,
      `${base}online.com`,
    ].filter((v, i, a) => a.indexOf(v) === i);

    // Check each domain's availability via RDAP
    const results = await Promise.all(
      candidates.map(async (domain) => {
        const available = await checkDomainAvailable(domain);
        return { domain, available };
      })
    );

    const available = results.filter(r => r.available === true);
    const unknown = results.filter(r => r.available === null);

    // Return available domains (or unknown if we couldn't check)
    const toReturn = available.length >= 4
      ? available.slice(0, 6)
      : [...available, ...unknown].slice(0, 6);

    res.json({
      domains: toReturn,
      query: q,
      checked: results.length,
      availableCount: available.length,
    });
  } catch (err) {
    console.error('Domain search error:', err);
    res.status(500).json({ error: 'Domain search unavailable' });
  }
});

// ── API: DOMAIN REGISTER ──────────────────────────────────────────────────────
// Called ONLY after Stripe payment webhook confirms payment.

app.post('/api/domain-register', async (req, res) => {
  try {
    const { domain, stripePaymentIntentId } = req.body;
    if (!domain || !stripePaymentIntentId) {
      return res.status(400).json({ error: 'domain and stripePaymentIntentId required' });
    }

    // Register via Cloudflare Registrar API
    const cfRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/registrar/domains/${encodeURIComponent(domain)}/register`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auto_renew: true,
          privacy: true,
          registrant_contact: {
            first_name: 'Robert',
            last_name: 'Pando',
            email: 'desk@almawebcreative.com',
            address: '6401 SW 118th Ave',
            city: 'Miami',
            state: 'FL',
            zip: '33183',
            country: 'US',
            phone: '+1.3055550000',
          },
        }),
      }
    );

    const cfData = await cfRes.json();

    if (!cfData.success) {
      console.error('Cloudflare registration error:', cfData.errors);
      return res.status(502).json({ success: false, errors: cfData.errors });
    }

    res.json({ success: true, domain, result: cfData.result });
  } catch (err) {
    console.error('Domain register error:', err);
    res.status(500).json({ error: 'Domain registration failed' });
  }
});

// ── API: DNS SETUP ────────────────────────────────────────────────────────────
// Called immediately after domain registration. Points domain to Railway.

app.post('/api/dns-setup', async (req, res) => {
  try {
    const { domain, zoneId, railwayUrl } = req.body;
    if (!domain || !zoneId || !railwayUrl) {
      return res.status(400).json({ error: 'domain, zoneId, and railwayUrl required' });
    }

    const target = railwayUrl.replace(/^https?:\/\//, '');

    const records = [
      { type: 'CNAME', name: '@', content: target, proxied: true },
      { type: 'CNAME', name: 'www', content: target, proxied: true },
    ];

    const results = await Promise.all(
      records.map(async (record) => {
        const cfRes = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...record, ttl: 1 }),
          }
        );
        return cfRes.json();
      })
    );

    const allOk = results.every(r => r.success);
    res.json({ success: allOk, results });
  } catch (err) {
    console.error('DNS setup error:', err);
    res.status(500).json({ error: 'DNS setup failed' });
  }
});

// ── API: DNS PROPAGATION CHECK ────────────────────────────────────────────────

app.get('/api/dns-check', async (req, res) => {
  try {
    const { domain, expected } = req.query;
    if (!domain) return res.status(400).json({ error: 'domain required' });

    const r = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=CNAME`
    );
    const data = await r.json();
    const answer = data.Answer?.[0]?.data || null;
    const resolved = expected
      ? answer === expected || answer?.includes(expected)
      : !!answer;

    res.json({ domain, resolved, answer, status: data.Status });
  } catch (err) {
    console.error('DNS check error:', err);
    res.status(500).json({ error: 'DNS check failed' });
  }
});

// ── API: STRIPE WEBHOOK ───────────────────────────────────────────────────────
// Receives payment confirmations from Stripe and creates Paperclip tasks for Mila.
// Supports: checkout.session.completed, payment_intent.succeeded,
//           customer.subscription.created

app.post('/api/stripe-webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Verify Stripe signature to reject forged requests
  if (webhookSecret && sig) {
    try {
      const rawBody = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
      const elements = sig.split(',');
      const tsEntry = elements.find(el => el.startsWith('t='));
      const sigEntries = elements.filter(el => el.startsWith('v1='));

      if (!tsEntry || sigEntries.length === 0) {
        console.error('Stripe webhook: malformed signature header');
        return res.status(400).json({ error: 'Invalid signature header' });
      }

      const timestamp = tsEntry.split('=')[1];
      const payload = `${timestamp}.${rawBody}`;
      const expected = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');
      const valid = sigEntries.some(entry => entry.split('=').slice(1).join('=') === expected);

      if (!valid) {
        console.error('Stripe webhook: signature mismatch');
        return res.status(400).json({ error: 'Signature verification failed' });
      }

      // Reject stale webhooks (older than 5 minutes)
      const age = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
      if (age > 300) {
        console.error('Stripe webhook: stale event, age:', age);
        return res.status(400).json({ error: 'Webhook too old' });
      }
    } catch (err) {
      console.error('Stripe webhook signature error:', err);
      return res.status(400).json({ error: 'Signature check error' });
    }
  } else if (webhookSecret) {
    // Secret is configured but signature header is missing — reject
    console.error('Stripe webhook: missing stripe-signature header');
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  const event = req.body;
  const eventType = event?.type;

  console.log(`Stripe webhook received: ${eventType} (id: ${event?.id})`);

  const supportedEvents = [
    'checkout.session.completed',
    'payment_intent.succeeded',
    'customer.subscription.created',
  ];

  if (!supportedEvents.includes(eventType)) {
    // Acknowledge events we don't handle
    return res.json({ received: true });
  }

  try {
    // Extract payment details depending on event type
    let email = null;
    let amountCents = null;
    let currency = 'usd';
    let products = 'Unknown plan';
    let paymentId = event?.id;

    if (eventType === 'checkout.session.completed') {
      const session = event.data?.object || {};
      email = session.customer_details?.email || session.customer_email || null;
      amountCents = session.amount_total;
      currency = session.currency || 'usd';
      paymentId = session.payment_intent || session.id;
      // Extract line items metadata if available
      const metadata = session.metadata || {};
      products = metadata.plan || metadata.product || metadata.products || 'Website plan';
    } else if (eventType === 'payment_intent.succeeded') {
      const pi = event.data?.object || {};
      email = pi.receipt_email || null;
      amountCents = pi.amount;
      currency = pi.currency || 'usd';
      paymentId = pi.id;
      const metadata = pi.metadata || {};
      products = metadata.plan || metadata.product || metadata.products || 'Website plan';
    } else if (eventType === 'customer.subscription.created') {
      const sub = event.data?.object || {};
      amountCents = sub.items?.data?.[0]?.price?.unit_amount;
      currency = sub.currency || 'usd';
      paymentId = sub.id;
      const metadata = sub.metadata || {};
      products = metadata.plan || metadata.product || sub.items?.data?.[0]?.price?.nickname || 'Monthly plan';
      // email comes from customer object — not embedded in subscription
      email = metadata.email || null;
    }

    const amountDisplay = amountCents != null
      ? `$${(amountCents / 100).toFixed(2)} ${currency.toUpperCase()}`
      : 'Amount unknown';

    const taskTitle = `New client payment confirmed — start onboarding for ${email || 'unknown client'}`;
    const taskDescription = [
      `**Payment confirmed** via Stripe webhook (\`${eventType}\`).`,
      '',
      `- **Email:** ${email || 'Not captured — check Stripe dashboard'}`,
      `- **Amount:** ${amountDisplay}`,
      `- **Products/Plan:** ${products}`,
      `- **Payment ID:** \`${paymentId}\``,
      `- **Event ID:** \`${event.id}\``,
      '',
      '> **IMPORTANT:** The payment email may differ from the prospect\'s contact email. Always cross-reference with Instantly leads (campaign_id `b80b7623`) and the Google Sheet at https://docs.google.com/spreadsheets/d/14hDlASmDxl434OtkRiN6pJVu6-Bdca83lFlsTqHn-zQ to find the correct contact email before sending any onboarding communications.',
      '',
      'Start full onboarding pipeline immediately:',
      '1. Verify the correct contact email via Instantly leads and Google Sheet before any outreach',
      '2. Reach out to client and confirm their domain situation',
      '3. Trigger domain registration or DNS setup as needed',
      '4. Kick off website build process',
      '5. All steps per the onboarding checklist',
    ].join('\n');

    const paperclipUrl = process.env.PAPERCLIP_API_URL || 'http://127.0.0.1:3100';
    const companyId = process.env.PAPERCLIP_COMPANY_ID || 'aa9191d4-249a-4574-88f2-1284571ad537';
    const milaAgentId = '4c048967-aae9-4f50-8d77-6c83322d10f1';
    const goalId = 'f45eaf59-e75b-4a0a-b6db-b1c7633abb14';

    const taskRes = await fetch(`${paperclipUrl}/api/companies/${companyId}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer local-board',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: taskTitle,
        description: taskDescription,
        priority: 'critical',
        assigneeAgentId: milaAgentId,
        goalId,
      }),
    });

    if (!taskRes.ok) {
      const errText = await taskRes.text();
      console.error('Failed to create Mila task:', taskRes.status, errText);
      // Still return 200 to Stripe so it doesn't retry — log the failure
    } else {
      const taskData = await taskRes.json();
      console.log(`Mila onboarding task created: ${taskData.identifier} for ${email}`);
    }

    // Schedule upsell email sequence for this new client
    if (email) {
      try {
        const clientName = (() => {
          if (eventType === 'checkout.session.completed') {
            const s = event.data?.object || {};
            return s.customer_details?.name || s.metadata?.client_name || null;
          }
          return (event.data?.object?.metadata?.client_name) || null;
        })();
        const siteUrl = (event.data?.object?.metadata?.site_url) || 'https://almadigitalservices.com';
        const scheduled = scheduleUpsellSequence({
          clientEmail: email,
          clientName: clientName || email,
          siteUrl,
          planName: products,
          paymentTimestamp: new Date().toISOString(),
        });
        await notifyRileyUpsellTriggered({
          clientEmail: email,
          clientName: clientName || email,
          planName: products,
          entries: scheduled,
        });
      } catch (upsellErr) {
        console.error('Upsell scheduling error:', upsellErr.message);
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook processing error:', err);
    // Return 200 to avoid Stripe retries for non-transient errors
    res.json({ received: true, warning: 'Event received but processing encountered an error' });
  }
});

// ── STRIPE CHECKOUT SESSION ───────────────────────────────────────────────────

const STRIPE_PLANS = {
  starter: { name: 'Starter', websiteCents: 5000, hostingCents: 1700 },
  growth:  { name: 'Growth',  websiteCents: 10000, hostingCents: 2300 },
  premium: { name: 'Premium', websiteCents: 15000, hostingCents: 3300 },
};

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const { plan, withHosting, withCarePlan } = req.body;
    const planData = STRIPE_PLANS[plan];
    if (!planData) return res.status(400).json({ error: 'Invalid plan' });

    const baseUrl = process.env.BASE_URL || 'https://almadigitalservices.com';
    const needsSubscription = withHosting || withCarePlan;
    let session;

    if (needsSubscription) {
      // Subscription mode — includes any recurring items (hosting and/or care plan)
      // One-time build fee goes as a first-invoice item via subscription_data.add_invoice_items
      const lineItems = [];
      if (withHosting) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: { name: `${planData.name} Website Hosting` },
            unit_amount: planData.hostingCents,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        });
      }
      if (withCarePlan) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: { name: 'Website Care Plan' },
            unit_amount: 2900,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        });
      }

      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: lineItems,
        subscription_data: {
          add_invoice_items: [{
            price_data: {
              currency: 'usd',
              product_data: { name: `${planData.name} Website Build (One-Time)` },
              unit_amount: planData.websiteCents,
            },
          }],
          metadata: { plan, withHosting: String(!!withHosting), withCarePlan: String(!!withCarePlan) },
        },
        metadata: { plan, type: needsSubscription ? 'subscription' : 'build_only' },
        success_url: `${baseUrl}/thank-you`,
        cancel_url: `${baseUrl}/checkout`,
      });
    } else {
      // One-time payment mode — website build only
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: `${planData.name} Website Build` },
            unit_amount: planData.websiteCents,
          },
          quantity: 1,
        }],
        metadata: { plan, type: 'build_only' },
        success_url: `${baseUrl}/thank-you`,
        cancel_url: `${baseUrl}/checkout`,
      });
    }

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout session error:', err);
    res.status(500).json({ error: 'Unable to create checkout session' });
  }
});

// ── PAGES: PORTFOLIO & REFERRAL ───────────────────────────────────────────────

app.get('/portfolio', (req, res) => {
  res.sendFile(path.join(__dirname, 'portfolio.html'));
});

app.get('/referral', (req, res) => {
  res.sendFile(path.join(__dirname, 'referral.html'));
});

app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, 'checkout.html'));
});

app.get('/thank-you', (req, res) => {
  res.sendFile(path.join(__dirname, 'thank-you.html'));
});

app.get('/care-plan', (req, res) => {
  res.sendFile(path.join(__dirname, 'care-plan.html'));
});

// ── API: LEAD CAPTURE (exit-intent popup) ────────────────────────────────────

app.post('/api/lead-capture', async (req, res) => {
  try {
    const { businessName, email, source } = req.body;
    const transporter = createMailTransporter();
    await transporter.sendMail({
      from: `"Alma Digital Leads" <${process.env.GMAIL_USER_1 || 'desk@almawebcreative.com'}>`,
      to: 'desk@almawebcreative.com',
      subject: `New Lead Captured — ${businessName || 'Unknown Business'}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#1a1a2e;border-bottom:2px solid #00d4ff;padding-bottom:10px">New Lead — Exit Intent Popup</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;font-weight:bold;width:160px">Business Name</td><td style="padding:8px">${businessName || 'Not provided'}</td></tr>
            <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${email || 'Not provided'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Source</td><td style="padding:8px">${source || 'website'}</td></tr>
            <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">Time</td><td style="padding:8px">${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST</td></tr>
          </table>
          <p style="color:#666;font-size:12px;margin-top:20px">Send a free website preview within 24 hours.</p>
        </div>
      `,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Lead capture email error:', err);
    res.json({ success: false });
  }
});

// ── API: REFERRAL SUBMISSION ──────────────────────────────────────────────────

app.post('/api/referral', async (req, res) => {
  try {
    const { yourName, yourEmail, friendBusinessName, rewardChoice } = req.body;
    const transporter = createMailTransporter();
    await transporter.sendMail({
      from: `"Alma Digital Referrals" <${process.env.GMAIL_USER_1 || 'desk@almawebcreative.com'}>`,
      to: 'desk@almawebcreative.com',
      subject: `New Referral — ${friendBusinessName || 'Unknown Business'} referred by ${yourName || 'Unknown'}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#1a1a2e;border-bottom:2px solid #00d4ff;padding-bottom:10px">New Referral Submission</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;font-weight:bold;width:200px">Referrer Name</td><td style="padding:8px">${yourName || 'Not provided'}</td></tr>
            <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">Referrer Email</td><td style="padding:8px">${yourEmail || 'Not provided'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Friend's Business</td><td style="padding:8px">${friendBusinessName || 'Not provided'}</td></tr>
            <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">Reward Choice</td><td style="padding:8px">${rewardChoice === 'upgrade' ? 'Free Website Upgrade' : '$10 Cash'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Submitted</td><td style="padding:8px">${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST</td></tr>
          </table>
          <p style="color:#666;font-size:12px;margin-top:20px">Reach out to <strong>${friendBusinessName}</strong> with a free preview. Pay the referrer once the friend converts.</p>
        </div>
      `,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Referral email error:', err);
    res.json({ success: false });
  }
});


// ── UPSELL EMAIL QUEUE ────────────────────────────────────────────────────────
// Schedules automated upsell emails at Days 7, 14, 45, and 60 after payment.
// Queue persisted in upsell-queue.json; log in upsell-log.json.

const fs = require('fs');
const UPSELL_QUEUE_FILE = path.join(__dirname, 'upsell-queue.json');
const UPSELL_LOG_FILE   = path.join(__dirname, 'upsell-log.json');

function readUpsellQueue() {
  try { return JSON.parse(fs.readFileSync(UPSELL_QUEUE_FILE, 'utf8')); } catch { return []; }
}
function writeUpsellQueue(queue) {
  fs.writeFileSync(UPSELL_QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf8');
}
function appendUpsellLog(entry) {
  const log = (() => { try { return JSON.parse(fs.readFileSync(UPSELL_LOG_FILE, 'utf8')); } catch { return []; } })();
  log.push(entry);
  fs.writeFileSync(UPSELL_LOG_FILE, JSON.stringify(log, null, 2), 'utf8');
}

// Schedule 4 emails for a new paying client
function scheduleUpsellSequence({ clientEmail, clientName, siteUrl, planName, paymentTimestamp }) {
  const base = new Date(paymentTimestamp);
  const steps = [
    { day: 7,  subject: 'How is your new site performing?',             upgradePrice: '$29/mo',      type: 'care_plan' },
    { day: 14, subject: 'Want more pages on your site?',                upgradePrice: '$60 add-on',  type: 'growth' },
    { day: 45, subject: 'Your competitors are investing in SEO',        upgradePrice: 'ask us',      type: 'premium' },
    { day: 60, subject: 'Keeping your site live — quick action needed', upgradePrice: '$17/mo + Care Plan', type: 'renewal' },
  ];

  const queue = readUpsellQueue();
  const added = [];
  for (const step of steps) {
    const scheduledAt = new Date(base.getTime() + step.day * 86400000).toISOString();
    const entry = {
      id: `${clientEmail}-day${step.day}-${Date.now()}`,
      clientEmail,
      clientName: clientName || '',
      siteUrl: siteUrl || '',
      planName: planName || 'Website plan',
      upgradePrice: step.upgradePrice,
      day: step.day,
      type: step.type,
      subject: step.subject,
      scheduledAt,
      sentAt: null,
      msgId: null,
      paymentTimestamp: base.toISOString(),
    };
    queue.push(entry);
    added.push(entry);
  }
  writeUpsellQueue(queue);
  console.log('[upsell] Scheduled ' + added.length + ' emails for ' + clientEmail + ' (Days 7/14/45/60)');
  return added;
}

// Email templates per upsell step
function buildUpsellHtml({ clientName, siteUrl, planName, upgradePrice, type }) {
  const name = clientName || 'there';
  const greeting = '<p>Hi ' + name + ',</p>';
  const footer = '<p style="color:#888;font-size:12px;margin-top:30px">You\'re receiving this because you recently launched a website with Alma Digital. <a href="mailto:desk@almawebcreative.com?subject=Unsubscribe">Unsubscribe</a></p>';

  const bodies = {
    care_plan:
      greeting +
      '<p>It\'s been a week since your new site went live — congratulations again!</p>' +
      '<p>We wanted to check in: <strong>is everything looking the way you\'d hoped?</strong></p>' +
      '<p>Many of our clients find that after launch, they want small tweaks — updated hours, a new photo, adjusted copy. That\'s where our <strong>Care Plan (' + upgradePrice + ')</strong> comes in.</p>' +
      '<p>It covers unlimited small updates so your site always stays current.</p>' +
      '<p><a href="https://almadigitalservices.com" style="background:#0066cc;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;display:inline-block;margin-top:10px">Learn about the Care Plan</a></p>',
    growth:
      greeting +
      '<p>Two weeks in — how\'s the site performing? We\'d love to hear!</p>' +
      '<p>A lot of our clients at this stage start thinking about <strong>adding more pages</strong> — a blog, a services detail page, a team page, or a portfolio section.</p>' +
      '<p>Our <strong>Growth upgrade (' + upgradePrice + ')</strong> gets you up to 3 additional pages, fully designed to match your existing site.</p>' +
      '<p><a href="https://almadigitalservices.com" style="background:#0066cc;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;display:inline-block;margin-top:10px">Add more pages</a></p>',
    premium:
      greeting +
      '<p>Quick question: have you noticed any new customers mentioning they found you online?</p>' +
      '<p>Your competitors are actively investing in SEO — making sure they show up when potential customers search for services like yours.</p>' +
      '<p>Our <strong>Premium upgrade</strong> includes on-page SEO optimization, schema markup, and monthly content tweaks to help you rank higher.</p>' +
      '<p><a href="https://almadigitalservices.com" style="background:#0066cc;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;display:inline-block;margin-top:10px">See Premium features</a></p>',
    renewal:
      greeting +
      '<p>Just a quick heads-up — your hosting is coming up for renewal soon.</p>' +
      '<p>Your site has been live and running smoothly. To keep it that way, renewal is <strong>' + upgradePrice + '</strong>.</p>' +
      '<p>If you haven\'t already, now is a great time to add our <strong>Care Plan</strong> so we can keep making small improvements each month.</p>' +
      '<p><a href="https://almadigitalservices.com" style="background:#0066cc;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;display:inline-block;margin-top:10px">Renew now</a></p>',
  };

  const body = bodies[type] || bodies.care_plan;
  return (
    '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#222">' +
    '<div style="background:#1a1a2e;padding:20px;text-align:center"><span style="color:#00d4ff;font-size:20px;font-weight:bold">Alma Digital</span></div>' +
    '<div style="padding:30px 20px">' +
    body +
    '<p style="margin-top:30px">Best,<br><strong>Roberto — Alma Digital</strong></p>' +
    footer +
    '</div></div>'
  );
}

// Send a single queued upsell email
async function sendUpsellEmail(entry) {
  try {
    const transporter = createMailTransporter();
    const html = buildUpsellHtml(entry);
    const info = await transporter.sendMail({
      from: '"Alma Digital" <' + (process.env.GMAIL_USER_1 || 'desk@almawebcreative.com') + '>',
      to: entry.clientEmail,
      subject: entry.subject,
      html,
    });
    console.log('[upsell] Sent Day ' + entry.day + ' email to ' + entry.clientEmail + ' msgId: ' + info.messageId);
    return info.messageId;
  } catch (err) {
    console.error('[upsell] Failed to send Day ' + entry.day + ' email to ' + entry.clientEmail + ':', err.message);
    return null;
  }
}

// Create Riley notification task in Paperclip when a sequence is triggered
async function notifyRileyUpsellTriggered({ clientEmail, clientName, planName, entries }) {
  try {
    const paperclipUrl = process.env.PAPERCLIP_API_URL || 'http://127.0.0.1:3100';
    const companyId = process.env.PAPERCLIP_COMPANY_ID || 'aa9191d4-249a-4574-88f2-1284571ad537';
    const rileyAgentId = 'f82b2f40-f33b-4595-981d-36ca3149dbe8';
    const goalId = 'f45eaf59-e75b-4a0a-b6db-b1c7633abb14';
    const scheduleDates = entries.map(function(e) {
      return 'Day ' + e.day + ': ' + new Date(e.scheduledAt).toLocaleDateString('en-US', { timeZone: 'America/New_York' });
    }).join(', ');
    await fetch(paperclipUrl + '/api/companies/' + companyId + '/issues', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer local-board', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Upsell sequence started for ' + (clientName || clientEmail) + ' — monitor replies',
        description: 'Automated upsell sequence triggered after Stripe payment.\n\n- **Client:** ' + (clientName || 'Unknown') + ' (' + clientEmail + ')\n- **Plan:** ' + planName + '\n- **Schedule:** ' + scheduleDates + '\n\nPlease monitor replies to desk@almawebcreative.com and follow up personally on any interest shown.',
        priority: 'medium',
        assigneeAgentId: rileyAgentId,
        goalId,
      }),
    });
    console.log('[upsell] Riley notified for ' + clientEmail + ' upsell sequence');
  } catch (err) {
    console.error('[upsell] Failed to notify Riley:', err.message);
  }
}

// Process the upsell queue — send any emails due now
async function processUpsellQueue() {
  const queue = readUpsellQueue();
  const now = new Date();
  let changed = false;

  for (const entry of queue) {
    if (entry.sentAt) continue;
    if (new Date(entry.scheduledAt) > now) continue;

    const msgId = await sendUpsellEmail(entry);
    entry.sentAt = now.toISOString();
    entry.msgId = msgId;
    changed = true;

    appendUpsellLog({
      clientEmail: entry.clientEmail,
      clientName: entry.clientName,
      type: entry.type,
      day: entry.day,
      sentAt: entry.sentAt,
      msgId: entry.msgId,
      subject: entry.subject,
    });
  }

  if (changed) writeUpsellQueue(queue);
}


// ── HEALTH CHECK ─────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', env: process.env.NODE_ENV || 'production', ts: new Date().toISOString() });
});

// ── FALLBACK ──────────────────────────────────────────────────────────────────

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── START ─────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Alma Digital Services running on port ${PORT}`);

  // Process upsell queue every hour
  setInterval(() => {
    processUpsellQueue().catch(err => console.error('[upsell] Queue processing error:', err));
  }, 60 * 60 * 1000);
  console.log('[upsell] Hourly email queue processor started');
});

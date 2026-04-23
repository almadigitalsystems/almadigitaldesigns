'use strict';



const crypto = require('crypto');

const express = require('express');

const path = require('path');

const nodemailer = require('nodemailer');

const Stripe = require('stripe');

// ── TIKTOK EVENTS API ─────────────────────────────────────────────────────────
// Server-side conversion tracking — fires even when users have ad blockers.
// Credentials read from environment variables (set in Railway).
async function sendTiktokEvent(eventName, { email = null, value = null, currency = 'USD' } = {}) {
  const pixelId = process.env.TIKTOK_PIXEL_ID;
  const token = process.env.TIKTOK_EVENTS_API_TOKEN;
  if (!pixelId || !token) {
    console.warn('TikTok Events API: missing TIKTOK_PIXEL_ID or TIKTOK_EVENTS_API_TOKEN env vars');
    return null;
  }
  const crypto = require('crypto');
  const hashedEmail = email ? crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex') : undefined;
  const payload = {
    pixel_code: pixelId,
    event: eventName,
    timestamp: String(Math.floor(Date.now() / 1000)),
    context: { user: hashedEmail ? { email: hashedEmail } : {} },
    properties: {}
  };
  if (value != null) { payload.properties.value = value; payload.properties.currency = currency; }
  try {
    const res = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
      method: 'POST',
      headers: { 'Access-Token': token, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log(`TikTok event '${eventName}' sent:`, data?.code === 0 ? 'OK' : JSON.stringify(data));
    return data;
  } catch (err) {
    console.error('TikTok Events API error:', err.message);
    return null;
  }
}
// ─────────────────────────────────────────────────────────────────────────────




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




    // Fire TikTok server-side Purchase event for successful payments
    if (eventType === 'checkout.session.completed' || eventType === 'payment_intent.succeeded') {
      const orderValue = amountCents != null ? amountCents / 100 : null;
      sendTiktokEvent('Purchase', { email, value: orderValue, currency: currency?.toUpperCase() || 'USD' })
        .catch(err => console.error('TikTok Purchase event failed:', err));
    }

    const paperclipUrl = process.env.PAPERCLIP_API_URL || 'http://127.0.0.1:3100';

    const companyId = process.env.PAPERCLIP_COMPANY_ID || 'aa9191d4-249a-4574-88f2-1284571ad537';

    const goalId = 'f45eaf59-e75b-4a0a-b6db-b1c7633abb14';



    // Detect branding orders vs web design orders

    const sessionMetadata = (eventType === 'checkout.session.completed' ? (event.data?.object?.metadata || {}) : {});

    const isBrandingOrder = sessionMetadata.service === 'branding';



    let taskTitle, taskDescription, assigneeAgentId;



    if (isBrandingOrder) {

      // ── BRANDING ORDER → Frida (Art Specialist) ──

      const fridaAgentId = '81fabfba-11f6-42d9-916b-e82da6279073';

      const tier = sessionMetadata.tier || 'unknown';

      const businessName = sessionMetadata.business_name || 'Unknown business';

      const businessType = sessionMetadata.business_type || 'Unknown type';

      const styleAndColors = sessionMetadata.style_and_colors || 'No preferences specified';

      const tierNames = { '1': 'Logo Only ($25)', '2': 'Brand Starter ($50)', '3': 'Full Brand Identity ($100)' };

      const tierName = tierNames[tier] || `Tier ${tier}`;



      taskTitle = `Branding order: ${tierName} for ${businessName}`;

      taskDescription = [

        `**Branding order confirmed** via Stripe webhook (\`${eventType}\`).`,

        '',

        `## Client Details`,

        `- **Email:** ${email || 'Not captured — check Stripe dashboard'}`,

        `- **Business Name:** ${businessName}`,

        `- **Business Type:** ${businessType}`,

        `- **Style & Color Preferences:** ${styleAndColors}`,

        '',

        `## Order Details`,

        `- **Tier:** ${tierName}`,

        `- **Amount:** ${amountDisplay}`,

        `- **Payment ID:** \`${paymentId}\``,

        `- **Event ID:** \`${event.id}\``,

        '',

        `## Tier Deliverables`,

        ...(tier === '1' ? [

          '- 2 logo concepts, 3 revisions',

          '- PNG + SVG + PDF, light and dark versions',

          '- 24hr delivery',

        ] : tier === '2' ? [

          '- 3 logo concepts, 5 revisions',

          '- PNG + SVG + PDF, light and dark versions',

          '- Color palette + typography',

          '- Social media kit (FB/IG/LinkedIn profile + cover)',

          '- Email signature',

          '- 24hr delivery',

        ] : tier === '3' ? [

          '- 5 logo concepts, unlimited revisions',

          '- PNG + SVG + PDF, light and dark versions',

          '- Color palette + typography',

          '- Social media kit (FB/IG/LinkedIn profile + cover)',

          '- Email signature',

          '- Full brand style guide PDF',

          '- Business card design + letterhead',

          '- 5 custom social post templates',

          '- Brand voice and tagline',

          '- 24hr delivery',

        ] : ['- Check tier details in branding pipeline spec']),

        '',

        'Begin branding fulfillment pipeline immediately per the pipeline spec.',

      ].join('\n');

      assigneeAgentId = fridaAgentId;

    } else {

      // ── WEB DESIGN ORDER → Mila (CSS) ──

      const milaAgentId = '4c048967-aae9-4f50-8d77-6c83322d10f1';



      taskTitle = `New client payment confirmed — start onboarding for ${email || 'unknown client'}`;

      taskDescription = [

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

      assigneeAgentId = milaAgentId;

    }



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

        assigneeAgentId,

        goalId,

      }),

    });



    if (!taskRes.ok) {

      const errText = await taskRes.text();

      console.error(`Failed to create ${isBrandingOrder ? 'branding fulfillment' : 'Mila onboarding'} task:`, taskRes.status, errText);

      // Still return 200 to Stripe so it doesn't retry — log the failure

    } else {

      const taskData = await taskRes.json();

      console.log(`${isBrandingOrder ? 'Branding fulfillment' : 'Mila onboarding'} task created: ${taskData.identifier} for ${email}`);

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



app.get('/ftc-disclosure', (req, res) => {

  res.sendFile(path.join(__dirname, 'ftc-disclosure.html'));

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




// -- API: WHATSAPP LEAD -------------------------------------------------------

app.post('/whatsapp-lead', express.urlencoded({ extended: false }), async (req, res) => {
  // Always return 200 so Studio does not retry
  res.status(200).json({ success: true });
  try {
    const { businessName, city, email, phone } = req.body;
    const transporter = createMailTransporter();
    await transporter.sendMail({
      from: `"Alma Digital WhatsApp" <${process.env.GMAIL_USER_1 || 'desk@almawebcreative.com'}>`,
      to: 'desk@almawebcreative.com',
      subject: `New WhatsApp Lead — ${businessName || 'Unknown Business'}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#1a1a2e;border-bottom:2px solid #00d4ff;padding-bottom:10px">New WhatsApp Lead 📲</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;font-weight:bold;width:200px">Business Name</td><td style="padding:8px">${businessName || 'Not provided'}</td></tr>
            <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">City</td><td style="padding:8px">${city || 'Not provided'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${email || 'Not provided'}</td></tr>
            <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">WhatsApp Number</td><td style="padding:8px">${phone || 'Not provided'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Received</td><td style="padding:8px">${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST</td></tr>
          </table>
          <p style="color:#555;margin-top:16px">Follow up with a free website preview for <strong>${businessName || 'this business'}</strong>!</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[whatsapp-lead] email error:', err.message);
  }
});


// ── API: TRACK EVENT (called by Riley agent to fire TikTok server-side events) ──

app.post('/api/track-event', async (req, res) => {
  try {
    const { eventName, email, value, currency } = req.body;
    if (!eventName) {
      return res.status(400).json({ success: false, error: 'eventName is required' });
    }
    const result = await sendTiktokEvent(eventName, { email, value, currency });
    res.json({ success: true, result });
  } catch (err) {
    console.error('[track-event] error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── TIKTOK OAUTH CALLBACK ─────────────────────────────────────────────────────
// Redirect URI registered in TikTok Developer App for Login Kit & Content Posting API
// TikTok redirects here with ?code=AUTHORIZATION_CODE&state=alma123 after user authorizes

app.get('/auth/tiktok/callback', async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;

  if (!code) {
    console.error('[tiktok-callback] No authorization code received');
    return res.status(400).send('Authorization failed: no code received');
  }

  try {
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY || '',
        client_secret: process.env.TIKTOK_CLIENT_SECRET || '',
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.TIKTOK_REDIRECT_URI || 'https://almadigitalservices.com/auth/tiktok/callback'
      }).toString()
    });

    const tokens = await tokenRes.json();

    if (tokens.error) {
      console.error('[tiktok-callback] Token exchange error:', tokens.error, tokens.error_description);
      return res.status(400).send(`Token exchange failed: ${tokens.error_description || tokens.error}`);
    }

    const accessToken = tokens.data?.access_token || tokens.access_token;
    const openId = tokens.data?.open_id || tokens.open_id;

    console.log(`[tiktok-callback] TikTok OAuth success. open_id: ${openId}`);
    console.log(`[tiktok-callback] TIKTOK_ACCESS_TOKEN_ALM=${accessToken}`);
    console.log(`[tiktok-callback] TIKTOK_OPEN_ID_ALM=${openId}`);

    res.send(`<html><body><h2>TikTok connected successfully!</h2><p>Open ID: ${openId}</p><p>Access token received and logged. You can close this window.</p></body></html>`);
  } catch (err) {
    console.error('[tiktok-callback] Error during token exchange:', err.message);
    res.status(500).send('Internal error during token exchange');
  }
});

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

});


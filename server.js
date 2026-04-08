'use strict';

const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json({ limit: '1mb' }));
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
    // Don't fail the request — escalation is best-effort
    res.json({ success: false, error: String(err.message) });
  }
});

// ── API: DOMAIN SEARCH ────────────────────────────────────────────────────────
// Called by Emily (agent) via Mila's task when client wants a new domain.
// Returns 4-6 available domain options based on business name variations.

app.get('/api/domain-search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'q (business name) required' });

    const base = q.toLowerCase().replace(/[^a-z0-9]/g, '');
    const city = (req.query.city || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const tld = req.query.tld || '.com';

    const candidates = [
      `${base}.com`,
      `${base}.co`,
      city ? `${base}${city}.com` : `get${base}.com`,
      `get${base}.com`,
      `${base}services.com`,
      `${base}online.com`,
    ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 6);

    const results = await Promise.all(
      candidates.map(async (domain) => {
        try {
          const cfRes = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/registrar/domains/search?query=${encodeURIComponent(domain.replace(/\..+$/, ''))}&limit=1`,
            {
              headers: {
                Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
              },
            }
          );
          const cfData = await cfRes.json();
          // Check if the specific domain appears in results as available
          const match = cfData.result?.find?.(
            (r) => r.name === domain && r.available === true
          );
          return { domain, available: !!match };
        } catch {
          return { domain, available: null };
        }
      })
    );

    const available = results.filter((r) => r.available !== false);
    res.json({ domains: available.slice(0, 6) });
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

    const allOk = results.every((r) => r.success);
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
    const resolved = expected ? answer === expected || answer?.includes(expected) : !!answer;

    res.json({ domain, resolved, answer, status: data.Status });
  } catch (err) {
    console.error('DNS check error:', err);
    res.status(500).json({ error: 'DNS check failed' });
  }
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

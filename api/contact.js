export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, message } = req.body || {};
  if (!name || !email || !message)
    return res.status(400).json({ error: 'Missing fields' });

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(500).json({ error: 'Not configured' });

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: ['homerjaredme@gmail.com'],
      reply_to: email,
      subject: `Portfolio message from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap">${message}</p>
      `,
    }),
  });

  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    return res.status(502).json({ error: body.message || 'Send failed' });
  }

  return res.status(200).json({ ok: true });
}

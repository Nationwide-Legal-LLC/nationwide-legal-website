const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') return res.status(200).send('OK');

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {
      const params = new URLSearchParams(body);
      body = Object.fromEntries(params.entries());
    }
  }

  const { firstName, lastName, email, phone, firm, subject, message } = body || {};

  if (!email || !message) {
    return res.status(400).json({ error: 'Missing required fields', received: body });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { ciphers: 'SSLv3' }
  });

  try {
    await transporter.sendMail({
      from: `"Nationwide Legal Website" <${process.env.SMTP_USER}>`,
      to: 'anikola@nationwidelegal.com, sales@nationwidelegal.com, mlazcano@nationwidelegal.com',
      replyTo: email,
      subject: `New Contact: ${subject || 'General Inquiry'} — ${firm || 'Unknown Firm'}`,
      html: `<h2 style="color:#22315C;font-family:sans-serif">New Contact Form Submission</h2>
        <table style="font-family:sans-serif;font-size:14px;width:100%">
          <tr><td style="padding:8px;color:#666"><b>Name</b></td><td>${firstName} ${lastName}</td></tr>
          <tr><td style="padding:8px;color:#666"><b>Email</b></td><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px;color:#666"><b>Phone</b></td><td>${phone || 'Not provided'}</td></tr>
          <tr><td style="padding:8px;color:#666"><b>Firm</b></td><td>${firm || 'Not provided'}</td></tr>
          <tr><td style="padding:8px;color:#666"><b>Subject</b></td><td>${subject || 'Not provided'}</td></tr>
          <tr><td style="padding:8px;color:#666"><b>Message</b></td><td>${message.replace(/\n/g,'<br>')}</td></tr>
        </table>`
    });
    return res.redirect(302, '/#/contact?success=1');
  } catch (err) {
    console.error('Mail error:', err);
    return res.redirect(302, '/#/contact?error=1');
  }
};

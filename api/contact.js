const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { firstName, lastName, email, phone, firm, subject, message } = req.body;
  if (!email || !message) return res.status(400).json({ error: 'Missing required fields' });
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: 587, secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { ciphers: 'SSLv3' }
  });
  try {
    await transporter.sendMail({
      from: '"Nationwide Legal" <' + process.env.SMTP_USER + '>',
      to: 'anikola@nationwidelegal.com, sales@nationwidelegal.com, mlazcano@nationwidelegal.com',
      replyTo: email,
      subject: 'New Contact: ' + (subject||'General Inquiry') + ' - ' + (firm||'Unknown Firm'),
      html: '<b>Name:</b> ' + firstName + ' ' + lastName + '<br><b>Email:</b> ' + email + '<br><b>Phone:</b> ' + (phone||'N/A') + '<br><b>Firm:</b> ' + (firm||'N/A') + '<br><b>Subject:</b> ' + (subject||'N/A') + '<br><b>Message:</b><br>' + message
    });
    return res.status(200).json({ success: true });
  } catch(err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed' });
  }
};

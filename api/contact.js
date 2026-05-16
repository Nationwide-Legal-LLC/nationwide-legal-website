const https = require('https');
const querystring = require('querystring');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {
      const p = new URLSearchParams(body);
      body = Object.fromEntries(p.entries());
    }
  }

  const { firstName, lastName, email, phone, firm, subject, message } = body || {};

  if (!email || !message) {
    return res.status(400).json({ error: 'Missing required fields', received: body });
  }

  const data = querystring.stringify({
    from: 'Nationwide Legal Website <postmaster@sales.nationwidelegal.com>',
    to: 'anikola@nationwidelegal.com,sales@nationwidelegal.com,mlazcano@nationwidelegal.com',
    'h:Reply-To': email,
    subject: `New Contact: ${subject || 'General Inquiry'} - ${firm || 'Unknown Firm'}`,
    html: `<h2 style="color:#22315C;font-family:sans-serif">New Contact Form Submission</h2>
      <table style="font-family:sans-serif;font-size:14px;width:100%">
        <tr><td style="padding:8px;color:#666"><b>Name</b></td><td>${firstName} ${lastName}</td></tr>
        <tr><td style="padding:8px;color:#666"><b>Email</b></td><td><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding:8px;color:#666"><b>Phone</b></td><td>${phone || 'Not provided'}</td></tr>
        <tr><td style="padding:8px;color:#666"><b>Firm</b></td><td>${firm || 'Not provided'}</td></tr>
        <tr><td style="padding:8px;color:#666"><b>Subject</b></td><td>${subject || 'Not provided'}</td></tr>
        <tr><td style="padding:8px;color:#666;vertical-align:top"><b>Message</b></td><td>${message.replace(/\n/g,'<br>')}</td></tr>
      </table>`
  });

  const auth = Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64');

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.mailgun.net',
      path: '/v3/sales.nationwidelegal.com/messages',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const request = https.request(options, (response) => {
      let responseData = '';
      response.on('data', (chunk) => { responseData += chunk; });
      response.on('end', () => {
        if (response.statusCode === 200) {
          res.status(200).json({ success: true });
        } else {
          console.error('Mailgun error:', response.statusCode, responseData);
          res.status(500).json({ error: 'Failed to send', details: responseData });
        }
        resolve();
      });
    });

    request.on('error', (err) => {
      console.error('Request error:', err);
      res.status(500).json({ error: err.message });
      resolve();
    });

    request.write(data);
    request.end();
  });
};

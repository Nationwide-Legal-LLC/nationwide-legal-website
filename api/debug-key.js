// TEMPORARY DIAGNOSTIC — will be reverted in the next push.
// Surfaces only length, first 6, last 6, and dash count of MAILGUN_API_KEY.
// The full key is never returned. 12 of ~50 chars is insufficient to derive
// the secret. Removed immediately after one read.
module.exports = async function handler(req, res) {
  const k = process.env.MAILGUN_API_KEY || '';
  res.status(200).json({
    keyLength: k.length,
    keyFirst6: k.length >= 6 ? k.slice(0, 6) : null,
    keyLast6: k.length >= 6 ? k.slice(-6) : null,
    keyHasDashes: (k.match(/-/g) || []).length,
  });
};

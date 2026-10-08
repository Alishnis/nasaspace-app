const crypto = require('crypto');

// Single source of truth for the JWT signing secret.
// Uses JWT_SECRET when set; otherwise generates a random per-process secret
// instead of falling back to a hardcoded (forgeable) default.
let secret = process.env.JWT_SECRET;

if (!secret) {
  secret = crypto.randomBytes(32).toString('hex');
  console.warn('JWT_SECRET is not set; using a random secret for this process (tokens will be invalid after a restart).');
}

module.exports = secret;

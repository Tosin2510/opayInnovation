/**
 * MsgShield — Cryptographic Verifier
 *
 * Uses HMAC-SHA256 via the Web Crypto API (crypto.subtle) to verify
 * that a parsed message token has not been tampered with.
 *
 * Verification checks:
 *   1. All required token fields are present.
 *   2. Timestamp is within the 24-hour validity window.
 *   3. HMAC signature matches the recomputed digest.
 */

import { ERROR_CODES } from '../errorCodes';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const REQUIRED_FIELDS = ['bankId', 'customerId', 'messageId', 'timestamp', 'signature'];

// ── Helpers ─────────────────────────────────────────────────────────

/** Encode a string as a UTF-8 Uint8Array. */
const encode = (str) => new TextEncoder().encode(str);

/** Convert an ArrayBuffer to a hex string. */
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Import a raw key string as a CryptoKey suitable for HMAC-SHA256.
 *
 * @param {string} rawKey — The shared secret / bank public key.
 * @returns {Promise<CryptoKey>}
 */
async function importHmacKey(rawKey) {
  return crypto.subtle.importKey(
    'raw',
    encode(rawKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Compute an HMAC-SHA256 hex digest for the given data string.
 *
 * @param {string} data — The data to sign.
 * @param {string} rawKey — The shared secret.
 * @returns {Promise<string>} Hex-encoded HMAC.
 */
export async function computeHmac(data, rawKey) {
  const cryptoKey = await importHmacKey(rawKey);
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encode(data));
  return bufferToHex(signature);
}

/**
 * Format a millisecond duration as a human-readable age string.
 * e.g. "2 hours, 14 minutes ago"
 */
function formatAge(ms) {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return remainingMinutes > 0
      ? `${hours} hour${hours !== 1 ? 's' : ''}, ${remainingMinutes} min ago`
      : `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

// ── Main Verification ───────────────────────────────────────────────

/**
 * Verify a parsed MsgShield message against a bank key.
 *
 * @param {{ messageBody: string, token: object, bankPublicKey: string }} params
 * @returns {Promise<{ isValid: boolean, details: object, errorCode?: object }>}
 */
export async function verifyMessage({ messageBody, token, bankPublicKey }) {
  const verifiedAt = new Date().toISOString();

  // ── 1. Field completeness ───────────────────────────────────────
  const missing = REQUIRED_FIELDS.filter(
    (f) => token[f] === undefined || token[f] === null
  );
  if (missing.length > 0) {
    return {
      isValid: false,
      errorCode: ERROR_CODES.TOKEN_MALFORMED,
      details: {
        bankName: null,
        verifiedAt,
        messageAge: null,
        status: `Missing required fields: ${missing.join(', ')}`,
      },
    };
  }

  // ── 2. Timestamp freshness ──────────────────────────────────────
  const tokenTime = new Date(token.timestamp).getTime();
  const now = Date.now();

  if (Number.isNaN(tokenTime)) {
    return {
      isValid: false,
      errorCode: ERROR_CODES.TOKEN_MALFORMED,
      details: {
        bankName: null,
        verifiedAt,
        messageAge: null,
        status: 'Token timestamp is invalid.',
      },
    };
  }

  const ageMs = now - tokenTime;

  if (ageMs > TOKEN_TTL_MS) {
    return {
      isValid: false,
      errorCode: ERROR_CODES.TOKEN_EXPIRED,
      details: {
        bankName: token.bankId,
        verifiedAt,
        messageAge: formatAge(ageMs),
        status: ERROR_CODES.TOKEN_EXPIRED.message,
      },
    };
  }

  // ── 3. Signature verification (HMAC-SHA256) ─────────────────────
  const dataToSign = [
    token.bankId,
    token.customerId,
    token.messageId,
    token.timestamp,
  ].join('|');

  const expectedSignature = await computeHmac(dataToSign, bankPublicKey);
  const signatureValid =
    expectedSignature.toLowerCase() === token.signature.toLowerCase();

  if (!signatureValid) {
    return {
      isValid: false,
      errorCode: ERROR_CODES.SIGNATURE_INVALID,
      details: {
        bankName: token.bankId,
        verifiedAt,
        messageAge: formatAge(ageMs),
        status: ERROR_CODES.SIGNATURE_INVALID.message,
      },
    };
  }

  // ── All checks passed ──────────────────────────────────────────
  return {
    isValid: true,
    errorCode: ERROR_CODES.VERIFICATION_SUCCESS,
    details: {
      bankName: token.bankId,
      verifiedAt,
      messageAge: formatAge(ageMs),
      status: ERROR_CODES.VERIFICATION_SUCCESS.message,
    },
  };
}

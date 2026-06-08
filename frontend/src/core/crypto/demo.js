/**
 * MsgShield — Demo Message Generator
 *
 * Produces sample raw message strings for testing the parser + verifier pipeline.
 * Supported types: 'valid' | 'expired' | 'tampered' | 'invalid'
 */

import { computeHmac } from './verifier';

// ── Demo Constants ──────────────────────────────────────────────────

/** Hardcoded HMAC key used for all demo signatures. */
export const DEMO_BANK_KEY = 'msgshield-demo-secret-key-2026';

/** Three Nigerian banks available in the demo. */
export const DEMO_BANKS = Object.freeze([
  { id: 'opay',   name: 'OPay',   shortCode: 'OPY' },
  { id: 'kuda',   name: 'Kuda',   shortCode: 'KDA' },
  { id: 'gtbank', name: 'GTBank', shortCode: 'GTB' },
]);

// ── Internals ───────────────────────────────────────────────────────

const TOKEN_DELIMITER = '||MSGSHIELD_TOKEN::';

/** Generate a pseudo-random message ID. */
function generateMessageId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'MSG-';
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/** Generate a pseudo-random customer ID. */
function generateCustomerId() {
  return `CUS-${Math.floor(100000000 + Math.random() * 900000000)}`;
}

/** Pick a random bank from DEMO_BANKS. */
function randomBank() {
  return DEMO_BANKS[Math.floor(Math.random() * DEMO_BANKS.length)];
}

/**
 * Build the signing payload and compute a real HMAC-SHA256 signature.
 *
 * @returns {Promise<string>} Hex-encoded HMAC.
 */
async function signToken({ bankId, customerId, messageId, timestamp }) {
  const data = [bankId, customerId, messageId, timestamp].join('|');
  return computeHmac(data, DEMO_BANK_KEY);
}

/**
 * Encode a token object to a base64 string.
 */
function encodeToken(tokenObj) {
  return btoa(JSON.stringify(tokenObj));
}

// ── Sample message bodies ───────────────────────────────────────────

const SAMPLE_MESSAGES = [
  'Acct: *1234\nCredit: NGN 150,000.00\nFrom: John Doe\nRef: TRF/OPY/063829471\nBal: NGN 523,800.50',
  'Acct: *5678\nDebit: NGN 25,000.00\nTo: Jane Smith\nRef: TRF/KDA/019283746\nBal: NGN 98,200.00',
  'Acct: *9012\nCredit: NGN 500,000.00\nFrom: ABC Ltd\nRef: TRF/GTB/847261935\nBal: NGN 1,240,000.75',
  'Acct: *3456\nDebit: NGN 5,500.00\nTo: DSTV/Multichoice\nRef: BIL/OPY/746382910\nBal: NGN 42,100.00',
];

function randomMessageBody() {
  return SAMPLE_MESSAGES[Math.floor(Math.random() * SAMPLE_MESSAGES.length)];
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Generate a demo raw message string for the given scenario.
 *
 * @param {'valid' | 'expired' | 'tampered' | 'invalid'} type
 * @returns {Promise<string>} A raw message string ready for `parseMessage()`.
 */
export async function generateDemoMessage(type = 'valid') {
  const bank = randomBank();
  const customerId = generateCustomerId();
  const messageId = generateMessageId();
  const messageBody = randomMessageBody();

  switch (type) {
    // ── Valid: fresh timestamp, correct signature ──────────────────
    case 'valid': {
      const timestamp = new Date().toISOString();
      const signature = await signToken({
        bankId: bank.id,
        customerId,
        messageId,
        timestamp,
      });

      const token = { bankId: bank.id, customerId, messageId, timestamp, signature };
      return `${messageBody}${TOKEN_DELIMITER}${encodeToken(token)}`;
    }

    // ── Expired: timestamp is 48 hours in the past ────────────────
    case 'expired': {
      const expiredDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const timestamp = expiredDate.toISOString();
      const signature = await signToken({
        bankId: bank.id,
        customerId,
        messageId,
        timestamp,
      });

      const token = { bankId: bank.id, customerId, messageId, timestamp, signature };
      return `${messageBody}${TOKEN_DELIMITER}${encodeToken(token)}`;
    }

    // ── Tampered: valid structure but corrupted signature ──────────
    case 'tampered': {
      const timestamp = new Date().toISOString();
      // Compute a real signature then corrupt it
      const realSignature = await signToken({
        bankId: bank.id,
        customerId,
        messageId,
        timestamp,
      });
      const tamperedSignature =
        'deadbeef' + realSignature.slice(8); // corrupt first 8 hex chars

      const token = {
        bankId: bank.id,
        customerId,
        messageId,
        timestamp,
        signature: tamperedSignature,
      };
      return `${messageBody}${TOKEN_DELIMITER}${encodeToken(token)}`;
    }

    // ── Invalid: no token appended at all ─────────────────────────
    case 'invalid': {
      return messageBody; // plain message, no delimiter or token
    }

    default:
      throw new Error(
        `[DEMO] Unknown message type "${type}". Use: valid, expired, tampered, invalid.`
      );
  }
}

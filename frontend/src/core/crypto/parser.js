/**
 * MsgShield — Message Parser
 *
 * Expected raw message format:
 *   [MESSAGE_BODY]||MSGSHIELD_TOKEN::[base64_encoded_token]
 *
 * The base64-decoded token is a JSON object:
 *   { bankId, customerId, messageId, timestamp, signature }
 */

import { ERROR_CODES } from '../errorCodes';

const TOKEN_DELIMITER = '||MSGSHIELD_TOKEN::';
const REQUIRED_TOKEN_FIELDS = [
  'bankId',
  'customerId',
  'messageId',
  'timestamp',
  'signature',
];

/**
 * Parse a raw MsgShield message string and extract the embedded token.
 *
 * @param {string} rawMessage — The full message string including the token suffix.
 * @returns {{ messageBody: string, token: object, rawToken: string }}
 * @throws {Error} With a descriptive message if parsing fails.
 */
export function parseMessage(rawMessage) {
  if (!rawMessage || typeof rawMessage !== 'string') {
    throw new Error(
      `[${ERROR_CODES.TOKEN_NOT_FOUND.code}] ${ERROR_CODES.TOKEN_NOT_FOUND.message}`
    );
  }

  // ── Locate the delimiter ──────────────────────────────────────────
  const delimiterIndex = rawMessage.indexOf(TOKEN_DELIMITER);

  if (delimiterIndex === -1) {
    throw new Error(
      `[${ERROR_CODES.TOKEN_NOT_FOUND.code}] ${ERROR_CODES.TOKEN_NOT_FOUND.message}`
    );
  }

  const messageBody = rawMessage.slice(0, delimiterIndex).trim();
  const rawToken = rawMessage
    .slice(delimiterIndex + TOKEN_DELIMITER.length)
    .trim();

  if (!rawToken) {
    throw new Error(
      `[${ERROR_CODES.TOKEN_NOT_FOUND.code}] ${ERROR_CODES.TOKEN_NOT_FOUND.message}`
    );
  }

  // ── Decode the base64 token ───────────────────────────────────────
  let decoded;
  try {
    decoded = atob(rawToken);
  } catch {
    throw new Error(
      `[${ERROR_CODES.TOKEN_MALFORMED.code}] ${ERROR_CODES.TOKEN_MALFORMED.message} (base64 decode failed)`
    );
  }

  // ── Parse the JSON payload ────────────────────────────────────────
  let token;
  try {
    token = JSON.parse(decoded);
  } catch {
    throw new Error(
      `[${ERROR_CODES.TOKEN_MALFORMED.code}] ${ERROR_CODES.TOKEN_MALFORMED.message} (JSON parse failed)`
    );
  }

  // ── Validate required fields ──────────────────────────────────────
  const missingFields = REQUIRED_TOKEN_FIELDS.filter(
    (field) => token[field] === undefined || token[field] === null
  );

  if (missingFields.length > 0) {
    throw new Error(
      `[${ERROR_CODES.TOKEN_MALFORMED.code}] ${ERROR_CODES.TOKEN_MALFORMED.message} ` +
        `(missing fields: ${missingFields.join(', ')})`
    );
  }

  return { messageBody, token, rawToken };
}

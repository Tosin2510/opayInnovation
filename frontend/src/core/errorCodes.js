/**
 * MsgShield — Standardized Error & Status Codes
 * Each code carries a machine-readable `code`, a user-friendly `message`,
 * and a `severity` level used by the UI to pick colours / icons.
 */

export const ERROR_CODES = Object.freeze({
  TOKEN_NOT_FOUND: {
    code: 'TOKEN_NOT_FOUND',
    message: 'No MsgShield verification token was found in this message.',
    severity: 'error',
  },

  TOKEN_MALFORMED: {
    code: 'TOKEN_MALFORMED',
    message:
      'The verification token is corrupted or incorrectly formatted and cannot be decoded.',
    severity: 'error',
  },

  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    message:
      'This message\'s verification token has expired. Tokens are valid for 24 hours.',
    severity: 'warning',
  },

  SIGNATURE_INVALID: {
    code: 'SIGNATURE_INVALID',
    message:
      'The cryptographic signature does not match. This message may have been tampered with.',
    severity: 'error',
  },

  BANK_NOT_RECOGNIZED: {
    code: 'BANK_NOT_RECOGNIZED',
    message:
      'The issuing bank could not be identified. Verification cannot proceed.',
    severity: 'error',
  },

  VERIFICATION_SUCCESS: {
    code: 'VERIFICATION_SUCCESS',
    message:
      'Message verified successfully. The signature is valid and the token has not expired.',
    severity: 'success',
  },
});

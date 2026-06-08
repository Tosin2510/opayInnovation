import { useState, useCallback } from 'react';
import { parseMessage } from '../../core/crypto/parser';
import { verifyMessage } from '../../core/crypto/verifier';
import { generateDemoMessage, DEMO_BANK_KEY } from '../../core/crypto/demo';
import ValidationResult from './ValidationResult';
import './Validator.css';

const DEMO_SCENARIOS = [
  { label: 'Valid Message', type: 'valid' },
  { label: 'Expired Token', type: 'expired' },
  { label: 'Tampered Message', type: 'tampered' },
  { label: 'No Token', type: 'invalid' },
];

/**
 * Validator — core feature section of MsgShield.
 * Users paste a bank SMS, click Verify, and see crypto results.
 */
function Validator() {
  const [inputMessage, setInputMessage] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);

  /* ---- Fill textarea with demo data ---- */
  const handleDemoClick = useCallback(async (type) => {
    try {
      const demo = await generateDemoMessage(type);
      setInputMessage(demo);
      setVerificationResult(null);
      setError(null);
    } catch (err) {
      setError(`Failed to generate demo: ${err.message}`);
    }
  }, []);

  /* ---- Verify flow: parse → verify → display ---- */
  const handleVerify = useCallback(async () => {
    if (!inputMessage.trim()) {
      setError('Please paste a message to verify.');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);
    setError(null);

    try {
      const parsed = parseMessage(inputMessage);

      // Simulate real crypto work with a 1.5s delay
      await new Promise((r) => setTimeout(r, 1500));

      const result = await verifyMessage({
        messageBody: parsed.messageBody,
        token: parsed.token,
        bankPublicKey: DEMO_BANK_KEY,
      });

      setVerificationResult(result);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during verification.');
    } finally {
      setIsVerifying(false);
    }
  }, [inputMessage]);

  return (
    <section className="validator" id="validator">
      <h2 className="validator__title">Message Validator</h2>
      <p className="validator__subtitle">
        Paste the message you received and we&apos;ll verify its authenticity
      </p>

      {/* Textarea Card */}
      <div className="validator__card">
        <textarea
          className="validator__textarea"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Paste your bank SMS or notification message here…"
          spellCheck={false}
        />

        {/* Demo quick-action buttons */}
        <div className="validator__demos">
          {DEMO_SCENARIOS.map(({ label, type }) => (
            <button
              key={type}
              type="button"
              className="validator__demo-btn"
              onClick={() => handleDemoClick(type)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Verify Button */}
      <button
        type="button"
        className="validator__verify-btn"
        onClick={handleVerify}
        disabled={isVerifying}
      >
        {isVerifying ? 'Verifying…' : 'Verify Message'}
      </button>

      {/* Result */}
      <ValidationResult
        result={verificationResult}
        error={error}
        isVerifying={isVerifying}
      />
    </section>
  );
}

export default Validator;

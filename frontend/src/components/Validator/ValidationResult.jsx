import './ValidationResult.css';

/**
 * ValidationResult — displays verification outcomes with
 * scanning animation, success/failure/error states.
 *
 * Props:
 *   result      — null | { isValid: boolean, details: object }
 *   error       — string | null
 *   isVerifying — boolean
 */
function ValidationResult({ result, error, isVerifying }) {
  /* -------- Scanning / Loading -------- */
  if (isVerifying) {
    return (
      <div className="validation-result">
        <div className="validation-result__scanning">
          <div className="validation-result__scan-icon">🔍</div>
          <p className="validation-result__scan-text">
            Verifying cryptographic signature…
          </p>
          <div className="validation-result__progress-track">
            <div className="validation-result__progress-bar" />
          </div>
        </div>
      </div>
    );
  }

  /* -------- Error State -------- */
  if (error) {
    return (
      <div className="validation-result">
        <div className="validation-result__card validation-result__card--error">
          <div className="validation-result__shield validation-result__shield--error">
            ⚠
          </div>
          <h3 className="validation-result__heading validation-result__heading--error">
            Verification Error
          </h3>
          <p className="validation-result__error-msg">{error}</p>
        </div>
      </div>
    );
  }

  /* -------- Idle / No Result -------- */
  if (!result) {
    return null;
  }

  /* -------- Success -------- */
  if (result.isValid) {
    const { bankName, verifiedAt, messageAge } = result.details || {};

    return (
      <div className="validation-result">
        <div className="validation-result__card validation-result__card--success">
          <div className="validation-result__shield validation-result__shield--success">
            ✓
          </div>
          <h3 className="validation-result__heading validation-result__heading--success">
            Message Verified
          </h3>
          <p className="validation-result__status-label validation-result__status-label--success">
            Authentic · Cryptographically Signed
          </p>

          <div className="validation-result__details">
            {bankName && (
              <div className="validation-result__detail-item">
                <div className="validation-result__detail-label">Bank</div>
                <div className="validation-result__detail-value">{bankName}</div>
              </div>
            )}
            {verifiedAt && (
              <div className="validation-result__detail-item">
                <div className="validation-result__detail-label">Verified At</div>
                <div className="validation-result__detail-value">
                  {new Date(verifiedAt).toLocaleString()}
                </div>
              </div>
            )}
            {messageAge && (
              <div className="validation-result__detail-item">
                <div className="validation-result__detail-label">Message Age</div>
                <div className="validation-result__detail-value">{messageAge}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* -------- Failure -------- */
  const { status, bankName, messageAge } = result.details || {};

  return (
    <div className="validation-result">
      <div className="validation-result__card validation-result__card--failure">
        <div className="validation-result__shield validation-result__shield--failure">
          ✗
        </div>
        <h3 className="validation-result__heading validation-result__heading--failure">
          Verification Failed
        </h3>
        <p className="validation-result__status-label validation-result__status-label--failure">
          {result.errorCode?.code === 'TOKEN_EXPIRED' ? 'Token Expired' : 'Signature Invalid'}
        </p>

        {status && <div className="validation-result__reason">{status}</div>}
        {bankName && (
          <div className="validation-result__detail-item" style={{ marginTop: '12px' }}>
            <div className="validation-result__detail-label">Bank</div>
            <div className="validation-result__detail-value">{bankName}</div>
          </div>
        )}
        {messageAge && (
          <div className="validation-result__detail-item">
            <div className="validation-result__detail-label">Message Age</div>
            <div className="validation-result__detail-value">{messageAge}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ValidationResult;

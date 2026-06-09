import { useState, useCallback, useEffect, useRef } from 'react';
import './SignupModal.css';

const TOTAL_STEPS = 4;

/**
 * Generate a unique customer ID:  MS-XXXXXXXXXX
 * (MS = MsgShield, 10 alphanumeric chars)
 */
function generateCustomerId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'MS-';
  for (let i = 0; i < 10; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * SignupModal — multi-step signup wizard.
 *
 * Props:
 *   isOpen    — boolean controlling visibility
 *   onClose   — callback to close the modal
 */
export default function SignupModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('forward'); // animation direction
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    customerId: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null); // null | 'success' | 'error'
  const [submitError, setSubmitError] = useState('');

  const modalRef = useRef(null);
  const inputRef = useRef(null);

  // Focus first input when step changes
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [step, isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setDirection('forward');
        setFormData({
          username: '', email: '', password: '', confirmPassword: '',
          customerId: '',
        });
        setErrors({});
        setSubmitResult(null);
        setSubmitError('');
      }, 300);
    }
  }, [isOpen]);

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  /* ──────────────────── Validation ──────────────────── */

  const validateStep = useCallback(() => {
    const newErrors = {};

    switch (step) {
      case 1: // Username
        if (!formData.username.trim()) {
          newErrors.username = 'Username is required';
        } else if (formData.username.trim().length < 3) {
          newErrors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
          newErrors.username = 'Only letters, numbers, and underscores';
        }
        break;

      case 2: // Email
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
          newErrors.email = 'Please enter a valid email address';
        }
        break;

      case 3: // Password
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        }
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [step, formData]);

  /* ──────────────────── Navigation ──────────────────── */

  const goNext = useCallback(() => {
    if (!validateStep()) return;

    // Generate customerId when moving to step 4 (review)
    if (step === 3) {
      setFormData((prev) => ({
        ...prev,
        customerId: prev.customerId || generateCustomerId(),
      }));
    }

    setDirection('forward');
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, [step, validateStep]);

  const goBack = useCallback(() => {
    setDirection('backward');
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  /* ──────────────────── Submit ──────────────────── */

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError('');

    const payload = {
      username: formData.username.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      customerId: formData.customerId,
    };

    try {
      const API_BASE = 'https://opayinnovation.onrender.com';
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Server responded with ${res.status}`);
      }

      setSubmitResult('success');
    } catch (err) {
      setSubmitError(err.message || 'Failed to connect to server');
      setSubmitResult('error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  // Handle Enter key to advance steps
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && step < TOTAL_STEPS) {
      e.preventDefault();
      goNext();
    }
  }, [step, goNext]);

  /* ──────────────────── Backdrop click ──────────────────── */

  const handleBackdropClick = useCallback((e) => {
    if (e.target === modalRef.current) onClose();
  }, [onClose]);

  if (!isOpen) return null;

  /* ──────────────────── Step Labels ──────────────────── */

  const stepLabels = ['Account', 'Email', 'Password', 'Confirm'];

  /* ──────────────────── Render ──────────────────── */

  return (
    <div
      className="signup-modal__backdrop"
      ref={modalRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Create account"
    >
      <div className="signup-modal">
        {/* Close button */}
        <button className="signup-modal__close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {/* Progress bar */}
        <div className="signup-modal__progress">
          {stepLabels.map((label, i) => (
            <div
              key={label}
              className={`signup-modal__step-dot ${i + 1 <= step ? 'active' : ''} ${i + 1 === step ? 'current' : ''}`}
            >
              <span className="signup-modal__dot-number">{i + 1 < step ? '✓' : i + 1}</span>
              <span className="signup-modal__dot-label">{label}</span>
            </div>
          ))}
          <div className="signup-modal__progress-track">
            <div
              className="signup-modal__progress-fill"
              style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="signup-modal__content" onKeyDown={handleKeyDown}>
          {/* ── Step 1: Username ── */}
          {step === 1 && (
            <div className={`signup-modal__step ${direction}`} key="step-1">
              <div className="signup-modal__step-icon">👤</div>
              <h2 className="signup-modal__title">Choose a Username</h2>
              <p className="signup-modal__desc">This is how you'll be identified on MsgShield</p>
              <div className="signup-modal__field">
                <input
                  ref={inputRef}
                  type="text"
                  className={`signup-modal__input ${errors.username ? 'has-error' : ''}`}
                  placeholder="e.g. grey_codes"
                  value={formData.username}
                  onChange={(e) => updateField('username', e.target.value)}
                  autoComplete="username"
                  maxLength={30}
                />
                {errors.username && <span className="signup-modal__error">{errors.username}</span>}
              </div>
            </div>
          )}

          {/* ── Step 2: Email ── */}
          {step === 2 && (
            <div className={`signup-modal__step ${direction}`} key="step-2">
              <div className="signup-modal__step-icon">📧</div>
              <h2 className="signup-modal__title">Your Email Address</h2>
              <p className="signup-modal__desc">We'll use this to verify your account</p>
              <div className="signup-modal__field">
                <input
                  ref={inputRef}
                  type="email"
                  className={`signup-modal__input ${errors.email ? 'has-error' : ''}`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  autoComplete="email"
                />
                {errors.email && <span className="signup-modal__error">{errors.email}</span>}
              </div>
            </div>
          )}

          {/* ── Step 3: Password ── */}
          {step === 3 && (
            <div className={`signup-modal__step ${direction}`} key="step-3">
              <div className="signup-modal__step-icon">🔒</div>
              <h2 className="signup-modal__title">Create a Password</h2>
              <p className="signup-modal__desc">Minimum 8 characters, make it strong</p>
              <div className="signup-modal__field">
                <input
                  ref={inputRef}
                  type="password"
                  className={`signup-modal__input ${errors.password ? 'has-error' : ''}`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  autoComplete="new-password"
                />
                {errors.password && <span className="signup-modal__error">{errors.password}</span>}
              </div>
              <div className="signup-modal__field">
                <input
                  type="password"
                  className={`signup-modal__input ${errors.confirmPassword ? 'has-error' : ''}`}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <span className="signup-modal__error">{errors.confirmPassword}</span>
                )}
              </div>
              {/* Password strength indicator */}
              <div className="signup-modal__strength">
                <div className={`signup-modal__strength-bar ${
                  formData.password.length >= 12 ? 'strong' :
                  formData.password.length >= 8 ? 'medium' :
                  formData.password.length > 0 ? 'weak' : ''
                }`} />
                <span className="signup-modal__strength-label">
                  {formData.password.length >= 12 ? 'Strong' :
                   formData.password.length >= 8 ? 'Good' :
                   formData.password.length > 0 ? 'Weak' : ''}
                </span>
              </div>
            </div>
          )}

          {/* ── Step 4: Review & Confirm ── */}
          {step === 4 && !submitResult && (
            <div className={`signup-modal__step ${direction}`} key="step-4">
              <div className="signup-modal__step-icon">✅</div>
              <h2 className="signup-modal__title">Review Your Details</h2>
              <p className="signup-modal__desc">Please review your information</p>

              <div className="signup-modal__review">
                <div className="signup-modal__review-grid">
                  <div className="signup-modal__review-item">
                    <span className="signup-modal__review-label">Username</span>
                    <span className="signup-modal__review-value">{formData.username}</span>
                  </div>
                  <div className="signup-modal__review-item">
                    <span className="signup-modal__review-label">Email</span>
                    <span className="signup-modal__review-value">{formData.email}</span>
                  </div>
                  <div className="signup-modal__review-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="signup-modal__review-label">Password</span>
                    <span className="signup-modal__review-value">{'•'.repeat(formData.password.length)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Success State ── */}
          {submitResult === 'success' && (
            <div className="signup-modal__step signup-modal__result" key="success">
              <div className="signup-modal__result-icon signup-modal__result-icon--success">✓</div>
              <h2 className="signup-modal__title">Account Created!</h2>
              <p className="signup-modal__desc">
                Welcome to MsgShield, <strong>{formData.username}</strong>.
                You can now verify bank messages.
              </p>
            </div>
          )}

          {/* ── Error State ── */}
          {submitResult === 'error' && (
            <div className="signup-modal__step signup-modal__result" key="error">
              <div className="signup-modal__result-icon signup-modal__result-icon--error">!</div>
              <h2 className="signup-modal__title">Something Went Wrong</h2>
              <p className="signup-modal__desc">{submitError}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="signup-modal__actions">
          {/* Back button (not on step 1 or after submit) */}
          {step > 1 && !submitResult && (
            <button type="button" className="signup-modal__btn signup-modal__btn--back" onClick={goBack}>
              ← Back
            </button>
          )}

          {/* Spacer */}
          {(step === 1 || submitResult) && <div />}

          {/* Next / Submit / Close */}
          {step < TOTAL_STEPS && !submitResult && (
            <button type="button" className="signup-modal__btn signup-modal__btn--next" onClick={goNext}>
              Continue →
            </button>
          )}

          {step === TOTAL_STEPS && !submitResult && (
            <button
              type="button"
              className="signup-modal__btn signup-modal__btn--submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="signup-modal__spinner" />
              ) : (
                'Create Account'
              )}
            </button>
          )}

          {submitResult === 'success' && (
            <button type="button" className="signup-modal__btn signup-modal__btn--next" onClick={onClose}>
              Get Started →
            </button>
          )}

          {submitResult === 'error' && (
            <button
              type="button"
              className="signup-modal__btn signup-modal__btn--next"
              onClick={() => { setSubmitResult(null); setSubmitError(''); }}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

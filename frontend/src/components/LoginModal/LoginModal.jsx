import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginModal.css';

export default function LoginModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const modalRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus first input
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll
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
        setFormData({ email: '', password: '' });
        setErrors({});
        setSubmitError('');
      }, 300);
    }
  }, [isOpen]);

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setSubmitError('');
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const API_BASE = 'https://opayinnovation.onrender.com';
      const res = await fetch(`${API_BASE}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Invalid email or password');
      }

      // Store auth in session storage
      sessionStorage.setItem(
        'msgshield_customer',
        JSON.stringify({ authenticated: true, email: formData.email.trim().toLowerCase(), ...data })
      );

      // Close modal and redirect
      onClose();
      navigate('/validator');

    } catch (err) {
      setSubmitError(err.message || 'Failed to connect to server');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onClose, navigate]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === modalRef.current) onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="login-modal__backdrop"
      ref={modalRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Customer Login"
    >
      <div className="login-modal">
        <button className="login-modal__close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="login-modal__content">
          <div className="login-modal__icon">👋</div>
          <h2 className="login-modal__title">Welcome Back</h2>
          <p className="login-modal__desc">Log in to verify bank messages</p>

          <form onSubmit={handleSubmit} className="login-modal__form">
            <div className="login-modal__field">
              <input
                ref={inputRef}
                type="email"
                className={`login-modal__input ${errors.email ? 'has-error' : ''}`}
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                autoComplete="email"
                disabled={isSubmitting}
              />
              {errors.email && <span className="login-modal__error">{errors.email}</span>}
            </div>

            <div className="login-modal__field">
              <input
                type="password"
                className={`login-modal__input ${errors.password ? 'has-error' : ''}`}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                autoComplete="current-password"
                disabled={isSubmitting}
              />
              {errors.password && <span className="login-modal__error">{errors.password}</span>}
            </div>

            {submitError && (
              <div className="login-modal__submit-error">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              className="login-modal__btn login-modal__btn--submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="login-modal__spinner" />
              ) : (
                'Log In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

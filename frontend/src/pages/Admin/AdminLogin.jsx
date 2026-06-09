import { useState, useRef } from 'react';
import './AdminLogin.css';

const API_BASE = 'https://opayinnovation.onrender.com';

export default function AdminLogin({ onAuthenticated }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  const triggerError = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
    inputRef.current?.select();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      triggerError('Please enter the admin key.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/bank/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success !== false) {
        // Store any token/data the backend returns
        sessionStorage.setItem(
          'msgshield_admin',
          JSON.stringify({ authenticated: true, ...data })
        );
        onAuthenticated();
      } else {
        triggerError(data.message || 'Invalid admin key. Access denied.');
      }
    } catch {
      triggerError('Cannot reach server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login">
      {/* Background orbs */}
      <div className="admin-login__orbs" aria-hidden="true">
        <div className="admin-login__orb admin-login__orb--1" />
        <div className="admin-login__orb admin-login__orb--2" />
      </div>

      <form
        className={`admin-login__card ${shake ? 'admin-login__card--shake' : ''}`}
        onSubmit={handleSubmit}
      >
        <div className="admin-login__icon">🛡️</div>
        <h1 className="admin-login__title">MsgShield Bank</h1>
        <p className="admin-login__subtitle">Admin Dashboard Access</p>

        <div className="admin-login__field">
          <input
            ref={inputRef}
            type="password"
            className={`admin-login__input ${error ? 'has-error' : ''}`}
            placeholder="Enter admin key"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            autoFocus
            disabled={isLoading}
          />
          {error && <span className="admin-login__error">{error}</span>}
        </div>

        <button type="submit" className="admin-login__btn" disabled={isLoading}>
          {isLoading ? (
            <><span className="admin-login__spinner" /> Authenticating...</>
          ) : (
            'Unlock Dashboard →'
          )}
        </button>

        <a href="/" className="admin-login__back">← Back to MsgShield</a>
      </form>
    </div>
  );
}

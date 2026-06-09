import { useEffect, useRef } from 'react';
import './Hero.css';

const STATS = [
  { value: '10,000+', label: 'Messages Verified' },
  { value: '50+', label: 'Banks Supported' },
  { value: '99.9%', label: 'Accuracy' },
];

export default function Hero({ onSignupClick }) {
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('hero__stats--visible');
          }
        });
      },
      { threshold: 0.3 },
    );

    const el = statsRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  return (
    <section id="home" className="hero">
      {/* Animated background orbs */}
      <div className="hero__orbs" aria-hidden="true">
        <div className="hero__orb hero__orb--blue" />
        <div className="hero__orb hero__orb--green" />
        <div className="hero__orb hero__orb--purple" />
      </div>

      {/* Floating shield */}
      <div className="hero__shield" aria-hidden="true">
        <svg
          className="hero__shield-svg"
          viewBox="0 0 120 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M60 8L12 30v40c0 32 20 54 48 64 28-10 48-32 48-64V30L60 8Z"
            stroke="url(#shieldGrad)"
            strokeWidth="2.5"
            fill="rgba(59,130,246,0.06)"
          />
          <path
            d="M50 68l10 12 20-24"
            stroke="#10b981"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <defs>
            <linearGradient id="shieldGrad" x1="12" y1="8" x2="108" y2="134">
              <stop stopColor="#059669" />
              <stop offset="1" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Content */}
      <div className="hero__content">
        <h1 className="hero__headline">
          Verify Every Message.{' '}
          <span className="hero__headline-accent">Trust No Scammer.</span>
        </h1>

        <p className="hero__subheadline">
          MsgShield uses cryptographic verification to instantly tell you if a
          bank message is authentic or fraudulent.
        </p>

        <div className="hero__actions">
          <button
            type="button"
            className="hero__btn hero__btn--primary"
            onClick={onSignupClick}
          >
            Sign Up Free
          </button>
          <a href="#validator" className="hero__btn hero__btn--outline">
            Start Verifying
          </a>
        </div>
      </div>

      {/* Stats bar */}
      <div className="hero__stats" ref={statsRef}>
        {STATS.map(({ value, label }) => (
          <div className="hero__stat" key={label}>
            <span className="hero__stat-value">{value}</span>
            <span className="hero__stat-label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

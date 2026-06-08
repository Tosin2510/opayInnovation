import { useEffect, useRef } from 'react';
import './HowItWorks.css';

const STEPS = [
  {
    num: '01',
    icon: '🔐',
    title: 'Bank Signs Message',
    desc: "The bank generates a unique cryptographic token using their private key, your customer ID, and a timestamp.",
  },
  {
    num: '02',
    icon: '📲',
    title: 'You Receive & Paste',
    desc: "When you get a suspicious message, simply paste it into MsgShield's validator.",
  },
  {
    num: '03',
    icon: '⚡',
    title: 'Instant Verification',
    desc: "Our engine validates the token against the bank's public key. Authentic or fake — you'll know in seconds.",
  },
];

/**
 * HowItWorks — explains the 3-step verification process
 * with scroll-triggered stagger animations.
 */
function HowItWorks() {
  const cardsRef = useRef([]);

  useEffect(() => {
    const nodes = cardsRef.current.filter(Boolean);
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="how-it-works" id="how-it-works">
      <h2 className="how-it-works__title">How It Works</h2>
      <p className="how-it-works__subtitle">
        Three simple steps to verify any bank message
      </p>

      <div className="how-it-works__cards">
        {STEPS.map((step, i) => (
          <div
            key={step.num}
            className="how-it-works__card"
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
          >
            <span className="how-it-works__watermark">{step.num}</span>
            <span className="how-it-works__step-num">{i + 1}</span>
            <span className="how-it-works__card-icon">{step.icon}</span>
            <h3 className="how-it-works__card-title">{step.title}</h3>
            <p className="how-it-works__card-desc">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Security / privacy note */}
      <div className="how-it-works__note">
        <span className="how-it-works__note-icon">🛡️</span>
        <p className="how-it-works__note-text">
          MsgShield never stores your messages. All verification happens locally
          in your browser.
        </p>
      </div>
    </section>
  );
}

export default HowItWorks;

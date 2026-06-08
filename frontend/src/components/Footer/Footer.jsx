import './Footer.css';

const QUICK_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Validator', href: '#validator' },
  { label: 'How It Works', href: '#how-it-works' },
];

const SOCIALS = [
  { icon: '𝕏', label: 'Twitter / X', href: '#' },
  { icon: '🔗', label: 'LinkedIn', href: '#' },
  { icon: '📧', label: 'Email', href: 'mailto:hello@msgshield.com' },
];

export default function Footer() {
  return (
    <footer className="footer">
      {/* Gradient top border */}
      <div className="footer__border" aria-hidden="true" />

      <div className="footer__inner">
        {/* About */}
        <div className="footer__col">
          <h3 className="footer__col-title">About</h3>
          <p className="footer__text">
            MsgShield is an independent cryptographic verification tool that
            helps you determine if bank SMS messages are authentic or
            fraudulent—instantly.
          </p>
        </div>

        {/* Quick Links */}
        <nav className="footer__col" aria-label="Quick links">
          <h3 className="footer__col-title">Quick Links</h3>
          <ul className="footer__link-list">
            {QUICK_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a href={href} className="footer__link">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div className="footer__col">
          <h3 className="footer__col-title">Contact</h3>
          <ul className="footer__link-list">
            <li>
              <a href="mailto:hello@msgshield.com" className="footer__link">
                hello@msgshield.com
              </a>
            </li>
          </ul>

          {/* Socials */}
          <div className="footer__socials">
            {SOCIALS.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                className="footer__social"
                aria-label={label}
                title={label}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <p className="footer__copyright">
          © 2025 MsgShield. Securing your messages.
        </p>
      </div>
    </footer>
  );
}

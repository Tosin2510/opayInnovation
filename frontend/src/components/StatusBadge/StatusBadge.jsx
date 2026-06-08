import './StatusBadge.css';

const STATUS_CONFIG = {
  success: { icon: '✓', text: 'Verified', className: 'status-badge--success' },
  error:   { icon: '✕', text: 'Fraudulent', className: 'status-badge--error' },
  warning: { icon: '!', text: 'Suspicious', className: 'status-badge--warning' },
  loading: { icon: '⟳', text: 'Analyzing…', className: 'status-badge--loading' },
  idle:    { icon: '○', text: 'Awaiting Input', className: 'status-badge--idle' },
};

export default function StatusBadge({ status = 'idle' }) {
  const { icon, text, className } = STATUS_CONFIG[status] || STATUS_CONFIG.idle;

  return (
    <span className={`status-badge ${className}`} role="status" aria-live="polite">
      <span className="status-badge__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="status-badge__text">{text}</span>
    </span>
  );
}

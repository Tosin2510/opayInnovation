import { useState, useEffect, useCallback } from 'react';
import { computeHmac } from '../../core/crypto/verifier';
import './AdminDashboard.css';

const TOKEN_DELIMITER = '||MSGSHIELD_TOKEN::';
const API_BASE = 'https://opayinnovation.onrender.com';

const MOCK_CUSTOMERS = [
  { username: 'grey_code', email: 'grey@example.com', customerId: 'MS-L2UUXDBSLW', createdAt: '2026-06-09T00:00:00Z' },
  { username: 'john_doe', email: 'john@example.com', customerId: 'MS-8K3NFHQ9RT', createdAt: '2026-06-08T14:30:00Z' },
  { username: 'ada_williams', email: 'ada@example.com', customerId: 'MS-P5XMWZ7YBC', createdAt: '2026-06-07T09:15:00Z' },
  { username: 'tosin_dev', email: 'tosin@example.com', customerId: 'MS-Q4RVNJL6AE', createdAt: '2026-06-06T18:45:00Z' },
];

function generateMessageId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'MSG-';
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-NG', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default function AdminDashboard({ onLogout }) {
  // Read session context
  const sessionData = JSON.parse(sessionStorage.getItem('msgshield_admin') || '{}');
  const bankName = sessionData.bankName || 'MsgShield Bank';
  const bankId = sessionData.bankId || 'msgshield-bank';
  const bankKey = sessionData.bankKey || 'msgshield-demo-secret-key-2026';

  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [search, setSearch] = useState('');

  // Compose state
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [signedOutput, setSignedOutput] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch customers (try API, fall back to mock)
  useEffect(() => {
    let cancelled = false;

    async function fetchCustomers() {
      try {
        const res = await fetch(`${API_BASE}/get`);
        if (!res.ok) throw new Error('API not available');
        const data = await res.json();
        if (!cancelled) {
          setCustomers(Array.isArray(data) ? data : data.customers || MOCK_CUSTOMERS);
        }
      } catch {
        if (!cancelled) setCustomers(MOCK_CUSTOMERS);
      } finally {
        if (!cancelled) setIsLoadingCustomers(false);
      }
    }

    fetchCustomers();
    return () => { cancelled = true; };
  }, []);

  // Filter customers
  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.username?.toLowerCase().includes(q) ||
      c.customerId?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  // Sign message
  const handleSign = useCallback(async () => {
    if (!selectedCustomer || !messageBody.trim()) return;

    setIsSigning(true);
    setSignedOutput('');

    try {
      const messageId = generateMessageId();
      const timestamp = new Date().toISOString();
      const customer = customers.find((c) => c.customerId === selectedCustomer);
      const customerId = customer?.customerId || selectedCustomer;

      const dataToSign = [bankId, customerId, messageId, timestamp].join('|');
      const signature = await computeHmac(dataToSign, bankKey);

      const token = { bankId, customerId, messageId, timestamp, signature };
      const base64Token = btoa(JSON.stringify(token));
      const output = `${messageBody.trim()}${TOKEN_DELIMITER}${base64Token}`;

      setSignedOutput(output);
    } catch (err) {
      setSignedOutput(`Error: ${err.message}`);
    } finally {
      setIsSigning(false);
    }
  }, [selectedCustomer, messageBody, customers]);

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(signedOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = signedOutput;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [signedOutput]);

  return (
    <div className="admin-dash">
      {/* ── Header ── */}
      <header className="admin-dash__header">
        <div className="admin-dash__header-inner">
          <div className="admin-dash__brand">
            <span className="admin-dash__brand-icon">🏛️</span>
            <span className="admin-dash__brand-name">{bankName}</span>
            <span className="admin-dash__brand-badge">Admin</span>
          </div>
          <button className="admin-dash__logout" onClick={onLogout} type="button">
            Logout
          </button>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="admin-dash__tabs">
        <button
          type="button"
          className={`admin-dash__tab ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <span className="admin-dash__tab-icon">👥</span>
          Customers
        </button>
        <button
          type="button"
          className={`admin-dash__tab ${activeTab === 'compose' ? 'active' : ''}`}
          onClick={() => setActiveTab('compose')}
        >
          <span className="admin-dash__tab-icon">✉️</span>
          Compose Message
        </button>
      </div>

      {/* ── Content ── */}
      <div className="admin-dash__content">
        {/* ── Customers Tab ── */}
        {activeTab === 'customers' && (
          <div className="admin-dash__section" key="customers">
            <div className="admin-dash__section-header">
              <h2 className="admin-dash__section-title">Registered Customers</h2>
              <span className="admin-dash__count">{customers.length} total</span>
            </div>

            <input
              type="text"
              className="admin-dash__search"
              placeholder="Search by username, email, or Customer ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {isLoadingCustomers ? (
              <div className="admin-dash__loading">
                <span className="admin-dash__spinner" />
                Loading customers...
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="admin-dash__empty">
                No customers found{search ? ` matching "${search}"` : ''}
              </div>
            ) : (
              <div className="admin-dash__table-wrap">
                <table className="admin-dash__table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Customer ID</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((c) => (
                      <tr key={c.customerId}>
                        <td className="admin-dash__cell-user">
                          <span className="admin-dash__avatar">
                            {c.username?.charAt(0).toUpperCase()}
                          </span>
                          {c.username}
                        </td>
                        <td>{c.email}</td>
                        <td>
                          <code className="admin-dash__id-badge">{c.customerId}</code>
                        </td>
                        <td>{formatDate(c.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Compose Tab ── */}
        {activeTab === 'compose' && (
          <div className="admin-dash__section" key="compose">
            <div className="admin-dash__section-header">
              <h2 className="admin-dash__section-title">Compose Signed Message</h2>
            </div>

            <div className="admin-dash__compose">
              {/* Customer select */}
              <label className="admin-dash__label">Recipient</label>
              <select
                className="admin-dash__select"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">Select a customer...</option>
                {customers.map((c) => (
                  <option key={c.customerId} value={c.customerId}>
                    {c.username} — {c.customerId}
                  </option>
                ))}
              </select>

              {/* Message body */}
              <label className="admin-dash__label">Message Body</label>
              <textarea
                className="admin-dash__textarea"
                rows={5}
                placeholder={'Acct: *1234\nCredit: NGN 150,000.00\nFrom: John Doe\nRef: TRF/MSB/063829471\nBal: NGN 523,800.50'}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
              />

              {/* Sign button */}
              <button
                type="button"
                className="admin-dash__sign-btn"
                onClick={handleSign}
                disabled={!selectedCustomer || !messageBody.trim() || isSigning}
              >
                {isSigning ? (
                  <><span className="admin-dash__spinner" /> Signing...</>
                ) : (
                  '🔐 Generate Signed Message'
                )}
              </button>

              {/* Output */}
              {signedOutput && (
                <div className="admin-dash__output">
                  <div className="admin-dash__output-header">
                    <span className="admin-dash__output-label">✅ Signed Message</span>
                    <button
                      type="button"
                      className="admin-dash__copy-btn"
                      onClick={handleCopy}
                    >
                      {copied ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                  <pre className="admin-dash__output-code">{signedOutput}</pre>
                  <p className="admin-dash__output-hint">
                    Paste this into the Validator on the home page to verify it
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

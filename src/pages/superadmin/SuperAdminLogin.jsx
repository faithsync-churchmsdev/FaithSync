import { useState } from 'react';
import { useApp } from '../../AppContext';
import { superAdminLogin } from '../../lib/auth';

export default function SuperAdminLogin({ onSuccess, onBack }) {
  const { setRole } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await superAdminLogin(email, password);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setRole('superadmin');
    onSuccess();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-bg)' }}>
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', padding: '40px 36px', width: '100%', maxWidth: '400px', border: '1px solid var(--border)', borderTop: '5px solid var(--accent)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>✝</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent)', fontSize: '1.6rem', marginBottom: '4px' }}>FaithSync</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.88rem' }}>Super Admin Access</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@email.com"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div style={{ background: '#fdecea', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: '0.88rem', marginBottom: '12px' }}>
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? '⏳ Logging in...' : '🔐 Login as Super Admin'}
          </button>
        </form>

        <button
          onClick={onBack}
          style={{ width: '100%', marginTop: '12px', background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
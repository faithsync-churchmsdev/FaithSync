import { useState } from 'react';
import { useApp } from '../../AppContext';
import { clerkLogin } from '../../lib/auth';
import './ClerkLogin.css';

export default function ClerkLogin({ onBack, onRegister }) {
  const { setRole, setCurrentChurch, setCurrentClerk } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await clerkLogin(email, password);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setRole('clerk');
    setCurrentClerk(result.clerk);
    setCurrentChurch(result.church);
  };

  return (
    <div className="clerk-login-page">
      <div className="clerk-login-card">

        {/* Header */}
        <div className="clerk-login-header">
          <div className="clerk-login-cross">✝</div>
          <h1>FaithSync</h1>
          <p>Parish Clerk Portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="clerk-login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="clerk@yourchurch.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-light)' }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="clerk-login-error">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary clerk-login-btn"
            disabled={loading}
          >
            {loading ? '⏳ Logging in...' : '🔐 Login to Clerk Panel'}
          </button>
        </form>

        {/* Divider */}
        <div className="clerk-login-divider">
          <span>or</span>
        </div>

        {/* Register church */}
        <div className="clerk-login-register">
          <p>Is your church not yet on FaithSync?</p>
          <button className="btn-secondary clerk-register-btn" onClick={onRegister}>
            ⛪ Register Your Church
          </button>
        </div>

        {/* Back */}
        <button className="clerk-login-back" onClick={onBack}>
          ← Back to Client View
        </button>

        <p className="clerk-login-note">
          After registering, your church must be approved by the FaithSync administrator before you can log in.
        </p>
      </div>
    </div>
  );
}
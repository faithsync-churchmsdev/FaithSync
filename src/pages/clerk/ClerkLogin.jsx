import { useState } from 'react';
import { useApp } from '../../AppContext';
import './ClerkLogin.css';

const PARISHES = [
  'Metropolitan Cathedral of the Immaculate Conception',
  'Archdiocesan Shrine of Our Lady of the Pillar (Fort Pilar)',
  'Other Parish',
];

export default function ClerkLogin({ onBack }) {
  const { setIsClerk, clerkAccounts, addClerkAccount } = useApp();
  const [view, setView] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', password: '' });
  const [reg, setReg] = useState({ firstName: '', lastName: '', email: '', phone: '', parish: PARISHES[0], role: 'Parish Clerk', username: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setR = (k, v) => setReg(p => ({ ...p, [k]: v }));

  const handleLogin = () => {
    setError('');
    // Default hardcoded account always works
    if (form.username === 'clerk' && form.password === 'faithsync2024') {
      setIsClerk(true); return;
    }
    // Check registered accounts
    const found = (clerkAccounts || []).find(a => a.username === form.username && a.password === form.password);
    if (found && !found.active) { setError('Your account is pending admin approval. Please contact the parish administrator.'); return; }
    if (found && found.active) { setIsClerk(true); return; }
    setError('Invalid username or password.');
  };

  const handleRegister = () => {
    setError('');
    if (!reg.firstName || !reg.lastName || !reg.username || !reg.password) {
      setError('Please fill in all required fields.'); return;
    }
    if (reg.password !== reg.confirm) {
      setError('Passwords do not match.'); return;
    }
    if (reg.password.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    const exists = (clerkAccounts || []).find(a => a.username === reg.username);
    if (exists || reg.username === 'clerk') {
      setError('Username already taken. Please choose another.'); return;
    }
    addClerkAccount({ ...reg, id: Date.now(), createdAt: new Date().toISOString() });
    setRegSuccess(true);
  };

  if (regSuccess) return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-cross">✝</span>
          <h1>FaithSync</h1>
          <p>Registration Successful</p>
        </div>
        <div className="reg-success-box">
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>✅</div>
          <h3>Account Created!</h3>
          <p>Welcome, <strong>{reg.firstName} {reg.lastName}</strong>.</p>
          <p style={{ marginTop: '6px', fontSize: '0.85rem', color: 'var(--text-light)' }}>Your account is pending admin approval. Please contact the parish administrator to activate your account.</p>
        </div>
        <button className="btn-primary btn-full" style={{ marginTop: '16px' }} onClick={() => { setView('login'); setRegSuccess(false); }}>
          ← Back to Login
        </button>
      </div>
    </div>
  );

  if (view === 'register') return (
    <div className="login-page">
      <div className="login-card login-card-wide">
        <div className="login-brand">
          <span className="login-cross">✝</span>
          <h1>FaithSync</h1>
          <p>Create Clerk Account</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <div className="reg-section-label">Personal Information</div>
        <div className="form-row">
          <div className="form-group">
            <label>First Name *</label>
            <input placeholder="Juan" value={reg.firstName} onChange={e => setR('firstName', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Last Name *</label>
            <input placeholder="Dela Cruz" value={reg.lastName} onChange={e => setR('lastName', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="clerk@parish.org" value={reg.email} onChange={e => setR('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input placeholder="09XXXXXXXXX" value={reg.phone} onChange={e => setR('phone', e.target.value)} />
          </div>
        </div>

        <div className="reg-section-label">Parish Assignment</div>
        <div className="form-row">
          <div className="form-group">
            <label>Parish *</label>
            <select value={reg.parish} onChange={e => setR('parish', e.target.value)}>
              {PARISHES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Role *</label>
            <select value={reg.role} onChange={e => setR('role', e.target.value)}>
              <option>Parish Clerk</option>
              <option>Records Officer</option>
              <option>Finance Officer</option>
              <option>Secretary</option>
              <option>Administrator</option>
            </select>
          </div>
        </div>

        <div className="reg-section-label">Login Credentials</div>
        <div className="form-group">
          <label>Username *</label>
          <input placeholder="Choose a username" value={reg.username} onChange={e => setR('username', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Password * (min. 8 chars)</label>
            <input type="password" placeholder="••••••••" value={reg.password} onChange={e => setR('password', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Confirm Password *</label>
            <input type="password" placeholder="••••••••" value={reg.confirm} onChange={e => setR('confirm', e.target.value)} />
          </div>
        </div>

        <div className="login-hint">
          <small>⚠️ New accounts require administrator approval before they can access the system.</small>
        </div>

        <button className="btn-primary btn-full" style={{ marginTop: '8px' }} onClick={handleRegister}>
          ✅ Create Account
        </button>
        <button className="btn-secondary btn-full" style={{ marginTop: '10px' }} onClick={() => { setView('login'); setError(''); }}>
          ← Back to Login
        </button>
      </div>
    </div>
  );

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-cross">✝</span>
          <h1>FaithSync</h1>
          <p>Clerk Portal Login</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <div className="form-group">
          <label>Username</label>
          <input type="text" placeholder="Enter username" value={form.username} onChange={e => set('username', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="Enter password" value={form.password} onChange={e => set('password', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>

        <button className="btn-primary btn-full" style={{ marginTop: '8px' }} onClick={handleLogin}>
          🔐 Login as Clerk
        </button>
        <button className="btn-outline btn-full" style={{ marginTop: '10px' }} onClick={() => { setView('register'); setError(''); }}>
          📝 Register New Clerk Account
        </button>
        <button className="btn-secondary btn-full" style={{ marginTop: '10px' }} onClick={onBack}>
          ← Back to Parish
        </button>
      </div>
    </div>
  );
}
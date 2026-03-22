import { useState } from 'react';
import { registerChurch } from '../lib/auth';

const TITLES = ['Fr.', 'Rev. Fr.', 'Msgr.', 'Bishop', 'Archbishop', 'Pastor', 'Deacon', 'Parish Council President', 'Parish Administrator', 'Other'];

function SuccessScreen({ churchName, onBack }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', width: '100%', maxWidth: '460px', border: '1px solid var(--border)', borderTop: '5px solid #27ae60', padding: '40px 36px', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>✅</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent)', fontSize: '1.5rem', marginBottom: '12px' }}>Registration Submitted!</h2>
        <p style={{ color: 'var(--text-mid)', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '8px' }}>
          <strong>{churchName}</strong> has been successfully registered on FaithSync.
        </p>
        <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', lineHeight: '1.7', marginBottom: '24px' }}>
          Your registration is now <strong>pending approval</strong> by the FaithSync administrator. Once approved, you will be able to log in using the credentials you provided.
        </p>
        <div style={{ background: 'var(--primary-pale)', border: '1px solid var(--primary-light)', borderRadius: 'var(--radius)', padding: '14px', marginBottom: '24px', fontSize: '0.85rem', color: 'var(--primary)', textAlign: 'left' }}>
          <p style={{ fontWeight: '700', marginBottom: '6px' }}>📋 What happens next?</p>
          <p style={{ marginBottom: '4px' }}>1. The FaithSync administrator reviews your registration.</p>
          <p style={{ marginBottom: '4px' }}>2. You receive an email once your church is approved.</p>
          <p>3. Log in using the email and password you registered with.</p>
        </div>
        <button className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem' }} onClick={onBack}>
          🔐 Go to Clerk Login
        </button>
      </div>
    </div>
  );
}

export default function ChurchRegister({ onBack, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    churchName: '', address: '', diocese: '', contactNumber: '',
    churchHeadName: '', churchHeadTitle: TITLES[0],
    registrantName: '', registrantGender: 'Male',
    email: '', password: '', confirmPassword: '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Show success screen after submission
  if (success) return <SuccessScreen churchName={form.churchName} onBack={onBack} />;

  const validateStep = () => {
    if (step === 1) {
      if (!form.churchName.trim()) return 'Church name is required.';
      if (!form.address.trim()) return 'Church address is required.';
      if (!form.contactNumber.trim()) return 'Contact number is required.';
    }
    if (step === 2) {
      if (!form.registrantName.trim()) return 'Your name is required.';
    }
    if (step === 3) {
      if (!form.email.trim()) return 'Email is required.';
      if (!form.password) return 'Password is required.';
      if (form.password.length < 6) return 'Password must be at least 6 characters.';
      if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    const result = await registerChurch(form);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setSuccess(true);
  };

  const inputStyle = { width: '100%' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', width: '100%', maxWidth: '520px', border: '1px solid var(--border)', borderTop: '5px solid var(--primary)' }}>

        <div style={{ padding: '28px 32px 0', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '6px' }}>✝</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent)', fontSize: '1.5rem', marginBottom: '4px' }}>Register Your Church</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Join FaithSync — Catholic Church Management System</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '20px 32px 0' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: step >= s ? 'var(--primary)' : 'var(--border)',
                color: step >= s ? 'white' : 'var(--text-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: '700', transition: 'all 0.3s'
              }}>{step > s ? '✓' : s}</div>
              {s < 3 && <div style={{ width: '40px', height: '2px', background: step > s ? 'var(--primary)' : 'var(--border)', transition: 'all 0.3s' }} />}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '52px', padding: '6px 32px 0' }}>
          {['Church Info', 'Registrant', 'Account'].map((l, i) => (
            <span key={l} style={{ fontSize: '0.72rem', color: step >= i + 1 ? 'var(--primary)' : 'var(--text-light)', fontWeight: '700' }}>{l}</span>
          ))}
        </div>

        <div style={{ padding: '24px 32px' }}>

          {/* STEP 1 — Church Info */}
          {step === 1 && (
            <>
              <div style={{ background: 'var(--primary-pale)', border: '1px solid var(--primary-light)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--primary)' }}>
                ℹ️ Please provide your church's official information. This will be reviewed by the FaithSync administrator before approval.
              </div>
              <div className="form-group">
                <label>Church Name *</label>
                <input style={inputStyle} placeholder="e.g., Metropolitan Cathedral of the Immaculate Conception" value={form.churchName} onChange={e => set('churchName', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Church Address *</label>
                <input style={inputStyle} placeholder="e.g., Zamboanga City, Zamboanga del Sur" value={form.address} onChange={e => set('address', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Diocese / Archdiocese</label>
                <input style={inputStyle} placeholder="e.g., Archdiocese of Zamboanga" value={form.diocese} onChange={e => set('diocese', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Church Contact Number *</label>
                <input style={inputStyle} placeholder="e.g., 09171234567" value={form.contactNumber} onChange={e => set('contactNumber', e.target.value)} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '0.9rem' }}>Church Head / Parish Priest (optional)</label>
                <div className="form-row">
                  <div className="form-group" style={{ flex: '0 0 140px' }}>
                    <label>Title</label>
                    <select value={form.churchHeadTitle} onChange={e => set('churchHeadTitle', e.target.value)}>
                      {TITLES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Full Name</label>
                    <input placeholder="e.g., Jose Santos" value={form.churchHeadName} onChange={e => set('churchHeadName', e.target.value)} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 2 — Registrant Info */}
          {step === 2 && (
            <>
              <div style={{ background: '#fff3e0', border: '1px solid #e67e22', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '16px', fontSize: '0.85rem', color: '#c0392b' }}>
                ⚠️ You are responsible for this registration. Once approved, the login credentials you provide will be the official clerk account for your church. Please make sure the right person receives them.
              </div>
              <div className="form-group">
                <label>Your Full Name *</label>
                <input style={inputStyle} placeholder="Name of the person filling this form" value={form.registrantName} onChange={e => set('registrantName', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Your Gender *</label>
                <select style={inputStyle} value={form.registrantGender} onChange={e => set('registrantGender', e.target.value)}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
              <div style={{ background: 'var(--primary-pale)', border: '1px solid var(--primary-light)', borderRadius: 'var(--radius)', padding: '12px 14px', fontSize: '0.85rem', color: 'var(--primary)', marginTop: '8px' }}>
                💡 <strong>Note:</strong> The email and password you set in the next step will be used by whoever manages the church system (the clerk). It doesn't have to be you — just make sure you pass those credentials to the right person once the church is approved.
              </div>
            </>
          )}

          {/* STEP 3 — Account Credentials */}
          {step === 3 && (
            <>
              <div style={{ background: 'var(--primary-pale)', border: '1px solid var(--primary-light)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--primary)' }}>
                🔐 These credentials will be used to log in to the FaithSync clerk panel for <strong>{form.churchName}</strong>.
              </div>
              <div className="form-group">
                <label>Clerk Email Address *</label>
                <input style={inputStyle} type="email" placeholder="e.g., clerk@yourchurch.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input style={inputStyle} type="password" placeholder="At least 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <input style={inputStyle} type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
              </div>
              <div style={{ background: 'var(--primary-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px', marginTop: '8px' }}>
                <p style={{ fontWeight: '700', color: 'var(--accent)', marginBottom: '8px', fontSize: '0.88rem' }}>📋 Registration Summary</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-mid)', marginBottom: '4px' }}>⛪ <strong>{form.churchName}</strong></p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-mid)', marginBottom: '4px' }}>📍 {form.address}</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-mid)', marginBottom: '4px' }}>👤 Registered by: {form.registrantName} ({form.registrantGender})</p>
                {form.churchHeadName && <p style={{ fontSize: '0.82rem', color: 'var(--text-mid)' }}>✝ {form.churchHeadTitle} {form.churchHeadName}</p>}
              </div>
            </>
          )}

          {error && (
            <div style={{ background: '#fdecea', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: '0.88rem', marginTop: '12px' }}>
              ❌ {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            {step > 1 && (
              <button className="btn-secondary" onClick={() => { setStep(s => s - 1); setError(''); }} style={{ flex: '0 0 auto' }}>
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button className="btn-primary" style={{ flex: 1 }} onClick={nextStep}>
                Next →
              </button>
            ) : (
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading}>
                {loading ? '⏳ Submitting...' : '✅ Submit Registration'}
              </button>
            )}
          </div>

          <button onClick={onBack} style={{ width: '100%', marginTop: '12px', background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontSize: '0.85rem' }}>
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useApp } from '../../AppContext';
import './RequestRecords.css';

const RECORD_CARDS = [
  { type: 'Baptismal Certificate', icon: '💧', color: '#3b9fd1', desc: 'Official proof of baptism in the Catholic Church.' },
  { type: 'Confirmation Certificate', icon: '🕊️', color: '#7c4dab', desc: 'Certificate of the Sacrament of Confirmation.' },
  { type: 'First Communion Certificate', icon: '🍞', color: '#c47d1e', desc: 'Certificate of First Holy Communion.' },
  { type: 'Marriage Certificate', icon: '💍', color: '#c0392b', desc: 'Official record of Catholic marriage ceremony.' },
  { type: 'Death / Funeral Record', icon: '📜', color: '#555e6e', desc: 'Funeral mass and burial documentation.' },
  { type: 'Other Document', icon: '📄', color: '#2e8b57', desc: 'Any other church document or certification.' },
];

const defaultForm = { fullName: '', contact: '', email: '', notes: '' };
const defaultErrors = { fullName: '', contact: '' };

export default function RequestRecords() {
  const { addRecordRequest, recordRequests } = useApp();
  const [view, setView] = useState('request'); // 'request' | 'success' | 'track'
  const [selectedType, setSelectedType] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState(defaultErrors);
  const [submittedRef, setSubmittedRef] = useState(null);
  const [trackInput, setTrackInput] = useState('');
  const [trackedRequest, setTrackedRequest] = useState(null);
  const [trackError, setTrackError] = useState('');

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required.';
    if (!form.contact.trim()) e.contact = 'Contact number is required.';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    // Generate ref here so we can show it
    const ref = `RR-${Date.now().toString().slice(-6)}`;
    addRecordRequest({ ...form, recordType: selectedType.type, referenceNumber: ref });
    setSubmittedRef(ref);
    setView('success');
  };

  const handleTrack = () => {
    setTrackError('');
    setTrackedRequest(null);
    const found = recordRequests.find(r => r.referenceNumber === trackInput.trim().toUpperCase());
    if (!found) { setTrackError('No request found with that reference number. Please check and try again.'); return; }
    setTrackedRequest(found);
  };

  const statusColor = (s) => s === 'Approved' ? '#27ae60' : s === 'Declined' ? '#e74c3c' : '#e67e22';
  const statusIcon = (s) => s === 'Approved' ? '✅' : s === 'Declined' ? '❌' : '⏳';

  // ── SUCCESS ──
  if (view === 'success') return (
    <div className="rr-page">
      <div className="request-success">
        <div className="success-icon">✅</div>
        <h2>Request Submitted!</h2>
        <p>Your request for a <strong>{selectedType?.type}</strong> has been sent to the parish clerk.</p>
        <div className="rr-ref-box">
          <p>Your Reference Number:</p>
          <div className="rr-ref-number">{submittedRef}</div>
          <small>Save this number to track the status of your request.</small>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
          <button className="btn-primary" onClick={() => { setForm(defaultForm); setSelectedType(null); setView('request'); }}>
            📄 Request Another
          </button>
          <button className="btn-secondary" onClick={() => { setTrackInput(submittedRef || ''); setView('track'); }}>
            🔍 Track My Request
          </button>
        </div>
      </div>
    </div>
  );

  // ── TRACK ──
  if (view === 'track') return (
    <div className="rr-page">
      <div className="rr-hero">
        <div className="rr-hero-icon">🔍</div>
        <h1>Track My Request</h1>
        <p>Enter your reference number to check the status of your record request.</p>
      </div>
      <div className="rr-container">
        <div className="card rr-track-card">
          <label style={{ fontWeight: 700, display: 'block', marginBottom: '8px' }}>Reference Number</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              placeholder="e.g. RR-123456"
              value={trackInput}
              onChange={e => { setTrackInput(e.target.value.toUpperCase()); setTrackError(''); setTrackedRequest(null); }}
              style={{ flex: 1 }}
            />
            <button className="btn-primary" onClick={handleTrack}>🔍 Track</button>
          </div>
          {trackError && <p className="rr-track-error">{trackError}</p>}

          {trackedRequest && (
            <div className="rr-track-result">
              <div className="rr-track-status" style={{ background: statusColor(trackedRequest.status) + '18', border: `2px solid ${statusColor(trackedRequest.status)}` }}>
                <span style={{ fontSize: '2rem' }}>{statusIcon(trackedRequest.status)}</span>
                <div>
                  <div style={{ fontWeight: 800, color: statusColor(trackedRequest.status), fontSize: '1.1rem' }}>{trackedRequest.status}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Current status of your request</div>
                </div>
              </div>
              <div className="rr-track-details">
                <TrackDetail label="Reference No." value={trackedRequest.referenceNumber} />
                <TrackDetail label="Document Type" value={trackedRequest.recordType} />
                <TrackDetail label="Name on Record" value={trackedRequest.fullName} />
                <TrackDetail label="Submitted" value={new Date(trackedRequest.id).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                {trackedRequest.status === 'Approved' && (
                  <div className="rr-track-note rr-approved-note">
                    ✅ Your request has been approved! Please visit the parish office to claim your document. Bring a valid ID.
                  </div>
                )}
                {trackedRequest.status === 'Declined' && (
                  <div className="rr-track-note rr-declined-note">
                    ❌ Your request was declined. Please contact the parish office for more information.
                  </div>
                )}
                {trackedRequest.status === 'Pending' && (
                  <div className="rr-track-note rr-pending-note">
                    ⏳ Your request is being reviewed by the clerk. Please check back later.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <button className="btn-secondary" style={{ marginTop: '16px' }} onClick={() => setView('request')}>← Back to Request</button>
      </div>
    </div>
  );

  // ── REQUEST FORM ──
  return (
    <div className="rr-page">
      <div className="rr-hero">
        <div className="rr-hero-icon">📄</div>
        <h1>Request Church Records</h1>
        <p>Select the type of document you need. The clerk will process and prepare it for you.</p>
      </div>

      <div className="rr-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 className="section-title" style={{ margin: 0 }}>📋 What document do you need?</h2>
          <button className="btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => setView('track')}>🔍 Track Existing Request</button>
        </div>
        <p className="section-sub">Click on the type of record you want to request.</p>

        <div className="rr-cards-grid">
          {RECORD_CARDS.map(rc => (
            <div
              key={rc.type}
              className={`rr-card ${selectedType?.type === rc.type ? 'rr-card-selected' : ''}`}
              style={{ borderTop: `5px solid ${rc.color}` }}
              onClick={() => setSelectedType(rc)}
            >
              <div className="rr-card-icon" style={{ background: rc.color + '18', color: rc.color }}>{rc.icon}</div>
              <div className="rr-card-title">{rc.type}</div>
              <div className="rr-card-desc">{rc.desc}</div>
              {selectedType?.type === rc.type && <div className="rr-selected-badge">✓ Selected</div>}
            </div>
          ))}
        </div>

        {selectedType && (
          <div className="rr-form-section">
            <div className="rr-form-header" style={{ borderLeft: `5px solid ${selectedType.color}` }}>
              <span style={{ fontSize: '1.8rem' }}>{selectedType.icon}</span>
              <div>
                <h3>Requesting: {selectedType.type}</h3>
                <p>Fill in your details so the clerk can process your request.</p>
              </div>
            </div>
            <div className="card">
              <div className="form-group">
                <label>Full Name (as it appears on the record) *</label>
                <input
                  placeholder="e.g. Juan Dela Cruz"
                  value={form.fullName}
                  onChange={e => set('fullName', e.target.value)}
                  className={errors.fullName ? 'input-error' : ''}
                />
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Number *</label>
                  <input
                    placeholder="09XXXXXXXXX"
                    value={form.contact}
                    onChange={e => set('contact', e.target.value)}
                    className={errors.contact ? 'input-error' : ''}
                  />
                  {errors.contact && <span className="field-error">{errors.contact}</span>}
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" placeholder="optional" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Notes / Additional Information</label>
                <textarea rows={3} placeholder="e.g. Year of baptism, names of parents, approximate date..." value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleSubmit}>
                  📨 Submit Request
                </button>
                <button className="btn-secondary" onClick={() => setSelectedType(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TrackDetail({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ minWidth: '130px', color: 'var(--text-light)', fontSize: '0.85rem' }}>{label}</span>
      <strong style={{ fontSize: '0.88rem' }}>{value}</strong>
    </div>
  );
}
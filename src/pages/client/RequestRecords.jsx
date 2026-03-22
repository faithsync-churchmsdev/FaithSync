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

function NoChurchWarning() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⛪</div>
      <h3 style={{ color: 'var(--accent)', marginBottom: '8px' }}>No Church Selected</h3>
      <p style={{ color: 'var(--text-light)', maxWidth: '360px', margin: '0 auto' }}>
        Please select a church from the banner at the top of the page before requesting a document.
      </p>
    </div>
  );
}

export default function RequestRecords() {
  const { addRecordRequest, recordRequests, selectedChurch } = useApp();
  const [view, setView] = useState('request');
  const [selectedType, setSelectedType] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [submittedRef, setSubmittedRef] = useState(null);
  const [trackInput, setTrackInput] = useState('');
  const [trackedRequest, setTrackedRequest] = useState(null);
  const [trackError, setTrackError] = useState('');

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const handleSubmit = async () => {
    if (!selectedChurch) { alert('Please select a church first from the banner at the top.'); return; }
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required.';
    if (!form.contact.trim()) e.contact = 'Contact number is required.';
    if (!form.email.trim()) e.email = 'Email is required for notifications.';
    if (Object.keys(e).length) { setErrors(e); return; }
    const ref = await addRecordRequest({ ...form, recordType: selectedType.type });
    setSubmittedRef(ref);
    setView('success');
  };

  const handleTrack = () => {
    setTrackError(''); setTrackedRequest(null);
    const found = (recordRequests || []).find(r => r.referenceNumber === trackInput.trim().toUpperCase());
    if (!found) { setTrackError('No request found with that reference number.'); return; }
    setTrackedRequest(found);
  };

  const statusColor = (s) => s === 'Approved' ? '#27ae60' : s === 'Declined' ? '#e74c3c' : '#e67e22';

  // SUCCESS
  if (view === 'success') return (
    <div className="rr-page">
      <div className="rr-success-page">
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
        <h2>Request Submitted!</h2>
        <p>Your request for a <strong>{selectedType?.type}</strong> has been submitted to <strong>{selectedChurch?.church_name}</strong>.</p>
        <div className="rr-ref-box">
          <p>Your Reference Number:</p>
          <strong className="rr-ref-number">{submittedRef}</strong>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: '8px' }}>Keep this number to track your request status.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => { setView('track'); setTrackInput(submittedRef); }}>🔍 Track This Request</button>
          <button className="btn-secondary" onClick={() => { setView('request'); setSelectedType(null); setForm(defaultForm); }}>← Request Another</button>
        </div>
      </div>
    </div>
  );

  // TRACK
  if (view === 'track') return (
    <div className="rr-page">
      <div className="rr-track-page">
        <div className="rr-track-header">
          <h2>🔍 Track Your Request</h2>
          <button className="btn-secondary" onClick={() => { setView('request'); setTrackInput(''); setTrackedRequest(null); setTrackError(''); }}>← Back</button>
        </div>
        <div className="rr-track-box">
          <label>Enter your Reference Number</label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <input placeholder="e.g., RR-123456" value={trackInput} onChange={e => setTrackInput(e.target.value.toUpperCase())} style={{ flex: 1 }} />
            <button className="btn-primary" onClick={handleTrack}>Track</button>
          </div>
          {trackError && <p style={{ color: 'var(--danger)', marginTop: '8px', fontSize: '0.88rem' }}>{trackError}</p>}
          {trackedRequest && (
            <div className="rr-track-result">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <strong>{trackedRequest.referenceNumber}</strong>
                <span className={`badge ${trackedRequest.status === 'Approved' ? 'badge-active' : trackedRequest.status === 'Declined' ? 'badge-inactive' : 'badge-pending'}`}>{trackedRequest.status}</span>
              </div>
              <p><strong>Document:</strong> {trackedRequest.recordType}</p>
              <p><strong>Name:</strong> {trackedRequest.fullName}</p>
              <p><strong>Contact:</strong> {trackedRequest.contact}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // MAIN — document type selection or form
  return (
    <div className="rr-page">
      <div className="rr-hero">
        <h1>📄 Request a Church Record</h1>
        <p>Request official sacramental documents from your parish.</p>
        {selectedChurch && (
          <div style={{ marginTop: '8px', background: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', display: 'inline-block' }}>
            ⛪ Requesting from: <strong>{selectedChurch.church_name}</strong>
          </div>
        )}
      </div>

      {!selectedChurch && <NoChurchWarning />}

      {selectedChurch && !selectedType && (
        <div className="rr-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h3>Select Document Type</h3>
            <button className="btn-secondary" onClick={() => setView('track')}>🔍 Track Existing Request</button>
          </div>
          <div className="rr-cards">
            {RECORD_CARDS.map(card => (
              <div key={card.type} className="rr-card" onClick={() => setSelectedType(card)} style={{ borderTop: `4px solid ${card.color}` }}>
                <div className="rr-card-icon" style={{ color: card.color }}>{card.icon}</div>
                <h3>{card.type}</h3>
                <p>{card.desc}</p>
                <span className="rr-card-select">Select →</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedChurch && selectedType && (
        <div className="rr-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <button className="btn-secondary" onClick={() => { setSelectedType(null); setForm(defaultForm); setErrors({}); }}>← Back</button>
            <h3>{selectedType.icon} {selectedType.type}</h3>
          </div>

          <div style={{ background: 'var(--primary-pale)', border: '1px solid var(--primary-light)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--primary)' }}>
            ⛪ Requesting from: <strong>{selectedChurch.church_name}</strong>
          </div>

          <div className="form-group">
            <label>Your Full Name *</label>
            <input value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Name as it appears on the record" />
            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Contact Number *</label>
              <input value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="e.g., 09171234567" />
              {errors.contact && <span className="field-error">{errors.contact}</span>}
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="Required for status notifications" />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
          </div>
          <div className="form-group">
            <label>Additional Notes</label>
            <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="e.g., approximate date of sacrament, purpose of request..." />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleSubmit}>📨 Submit Request</button>
            <button className="btn-secondary" onClick={() => { setSelectedType(null); setForm(defaultForm); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
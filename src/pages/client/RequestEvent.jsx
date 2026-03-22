import { useState } from 'react';
import { useApp } from '../../AppContext';
import { MASS_CATEGORIES, BASE_LOCATIONS, getEventType } from '../../data/events';
import EventModal from '../../components/EventModal';
import './RequestEvent.css';

function dateToObj(str) {
  const [y,m,d] = str.split('-').map(Number);
  return new Date(y, m-1, d);
}

const defaultForm = {
  fullName:'', contact:'', eventType:'Sunday Mass', preferredDate:'',
  preferredTime:'', location: BASE_LOCATIONS[0], email:'', notes:'', customType:'', customLocation:'',
};

// No church selected warning
function NoChurchWarning() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⛪</div>
      <h3 style={{ color: 'var(--accent)', marginBottom: '8px' }}>No Church Selected</h3>
      <p style={{ color: 'var(--text-light)', maxWidth: '360px', margin: '0 auto' }}>
        Please select a church from the banner at the top of the page before submitting a request.
      </p>
    </div>
  );
}

export default function RequestEvent() {
  const { addEventRequest, clientEvents, eventRequests, selectedChurch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitted, setSubmitted] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [errors, setErrors] = useState({});
  const [submittedRef, setSubmittedRef] = useState('');
  const [view, setView] = useState('main');
  const [trackInput, setTrackInput] = useState('');
  const [trackedRequest, setTrackedRequest] = useState(null);
  const [trackError, setTrackError] = useState('');

  const today = new Date(); today.setHours(0,0,0,0);
  const activeEvents = (clientEvents || []).filter(e => !e.archived && !e.done);
  const upcoming = [...activeEvents]
    .filter(e => { try { return dateToObj(e.date) >= today; } catch { return false; } })
    .sort((a,b) => dateToObj(a.date) - dateToObj(b.date));

  const allLocations = [...BASE_LOCATIONS, 'Other (please specify)'];
  const set = (k,v) => { setForm(p => ({...p,[k]:v})); setErrors(p => ({...p,[k]:''})); };

  const handleSubmit = async () => {
    if (!selectedChurch) { alert('Please select a church first from the banner at the top.'); return; }
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required.';
    if (!form.contact.trim()) errs.contact = 'Contact number is required.';
    if (!form.email.trim()) errs.email = 'Email is required for notifications.';
    if (!form.preferredDate) errs.preferredDate = 'Preferred date is required.';
    if (form.eventType === 'Manual Addition' && !form.customType.trim()) errs.customType = 'Please specify the event name.';
    if (form.location === 'Other (please specify)' && !form.customLocation.trim()) errs.customLocation = 'Please specify the location.';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const finalType = form.eventType === 'Manual Addition' ? form.customType.trim() : form.eventType;
    const finalLocation = form.location === 'Other (please specify)' ? form.customLocation.trim() : form.location;

    const ref = await addEventRequest({ ...form, eventType: finalType, location: finalLocation, title: finalType });
    setSubmittedRef(ref);
    setSubmitted(true);
    setShowForm(false);
  };

  const handleTrack = () => {
    setTrackError(''); setTrackedRequest(null);
    const found = (eventRequests || []).find(r => r.referenceNumber === trackInput.trim().toUpperCase());
    if (!found) { setTrackError('No request found with that reference number. Please check and try again.'); return; }
    setTrackedRequest(found);
  };

  if (view === 'track') return (
    <div className="request-page">
      <div className="rr-track-page">
        <div className="rr-track-header">
          <h2>🔍 Track Your Request</h2>
          <button className="btn-secondary" onClick={() => { setView('main'); setTrackInput(''); setTrackedRequest(null); setTrackError(''); }}>← Back</button>
        </div>
        <div className="rr-track-box">
          <label>Enter your Reference Number</label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <input placeholder="e.g., EV-123456" value={trackInput} onChange={e => setTrackInput(e.target.value.toUpperCase())} style={{ flex: 1 }} />
            <button className="btn-primary" onClick={handleTrack}>Track</button>
          </div>
          {trackError && <p style={{ color: 'var(--danger)', marginTop: '8px', fontSize: '0.88rem' }}>{trackError}</p>}
          {trackedRequest && (
            <div className="rr-track-result">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <strong style={{ fontSize: '1.1rem' }}>{trackedRequest.referenceNumber}</strong>
                <span className={`badge ${trackedRequest.status === 'Approved' ? 'badge-active' : trackedRequest.status === 'Declined' ? 'badge-inactive' : 'badge-pending'}`}>{trackedRequest.status}</span>
              </div>
              <p><strong>Event:</strong> {trackedRequest.eventType}</p>
              <p><strong>Date:</strong> {trackedRequest.preferredDate}</p>
              <p><strong>Location:</strong> {trackedRequest.location}</p>
              {trackedRequest.assignedPriest && <p><strong>Assigned Priest:</strong> ✝️ {trackedRequest.assignedPriest}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="request-page">
      <div className="req-hero">
        <h1>📅 Request an Event or Mass</h1>
        <p>Submit a request for a special mass, event, or church activity.</p>
        {selectedChurch && (
          <div style={{ marginTop: '8px', background: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', display: 'inline-block' }}>
            ⛪ Requesting to: <strong>{selectedChurch.church_name}</strong>
          </div>
        )}
      </div>

      {!selectedChurch && <NoChurchWarning />}

      {selectedChurch && (
        <div className="req-content">
          {submitted && (
            <div className="req-success-banner">
              ✅ Request submitted! Your reference number is <strong>{submittedRef}</strong>. You can track your request status using this number.
              <button className="btn-secondary" style={{ marginLeft: '12px', fontSize: '0.82rem' }} onClick={() => { setSubmitted(false); setView('track'); setTrackInput(submittedRef); }}>Track Request →</button>
            </div>
          )}

          <div className="req-actions-row">
            <button className="btn-primary" onClick={() => setShowForm(true)}>📝 Submit New Request</button>
            <button className="btn-secondary" onClick={() => setView('track')}>🔍 Track Existing Request</button>
          </div>

          {/* Upcoming events */}
          {upcoming.length > 0 && (
            <div className="req-upcoming">
              <h3>📅 Upcoming Events at {selectedChurch.church_name}</h3>
              <div className="req-event-list">
                {upcoming.slice(0, 5).map(ev => {
                  const type = getEventType(ev.type);
                  return (
                    <div key={ev.id} className="req-event-card" style={{ borderLeft: `4px solid ${type.color}` }} onClick={() => setSelectedEvent(ev)}>
                      <span style={{ fontSize: '1.2rem' }}>{type.icon}</span>
                      <div>
                        <strong>{ev.title}</strong>
                        <p>📅 {ev.date} · 🕐 {ev.time} · 📍 {ev.location}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2>📝 Event / Mass Request</h2>
              <button className="close-panel" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <div style={{ background: 'var(--primary-pale)', border: '1px solid var(--primary-light)', borderRadius: 'var(--radius)', padding: '8px 12px', marginBottom: '14px', fontSize: '0.85rem', color: 'var(--primary)' }}>
              ⛪ Sending to: <strong>{selectedChurch?.church_name}</strong>
            </div>

            <div className="form-group">
              <label>Your Full Name *</label>
              <input value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="e.g., Juan Dela Cruz" />
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
              <label>Event Type *</label>
              <select value={form.eventType} onChange={e => set('eventType', e.target.value)}>
                {MASS_CATEGORIES.map(cat => (
                  <optgroup key={cat.category} label={cat.category}>
                    {cat.types.map(t => <option key={t} value={t}>{t}</option>)}
                  </optgroup>
                ))}
              </select>
              {form.eventType === 'Manual Addition' && (
                <input style={{ marginTop: '8px' }} placeholder="Specify event name..." value={form.customType} onChange={e => set('customType', e.target.value)} />
              )}
              {errors.customType && <span className="field-error">{errors.customType}</span>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Preferred Date *</label>
                <input type="date" value={form.preferredDate} onChange={e => set('preferredDate', e.target.value)} min={new Date().toISOString().split('T')[0]} />
                {errors.preferredDate && <span className="field-error">{errors.preferredDate}</span>}
              </div>
              <div className="form-group">
                <label>Preferred Time</label>
                <input type="time" value={form.preferredTime} onChange={e => set('preferredTime', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Location</label>
              <select value={form.location} onChange={e => set('location', e.target.value)}>
                {allLocations.map(l => <option key={l}>{l}</option>)}
              </select>
              {form.location === 'Other (please specify)' && (
                <input style={{ marginTop: '8px' }} placeholder="Specify location..." value={form.customLocation} onChange={e => set('customLocation', e.target.value)} />
              )}
              {errors.customLocation && <span className="field-error">{errors.customLocation}</span>}
            </div>
            <div className="form-group">
              <label>Additional Notes</label>
              <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any special requests or details..." />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleSubmit}>📨 Submit Request</button>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {selectedEvent && <EventModal event={selectedEvent} isClerk={false} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
}
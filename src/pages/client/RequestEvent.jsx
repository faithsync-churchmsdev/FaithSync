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

export default function RequestEvent() {
  const { addEventRequest, events, eventRequests } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitted, setSubmitted] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [errors, setErrors] = useState({});
  const [submittedRef, setSubmittedRef] = useState('');
  const [view, setView] = useState('main'); // 'main' | 'track'
  const [trackInput, setTrackInput] = useState('');
  const [trackedRequest, setTrackedRequest] = useState(null);
  const [trackError, setTrackError] = useState('');

  const today = new Date(); today.setHours(0,0,0,0);
  const activeEvents = events.filter(e => !e.archived && !e.done);
  const upcoming = [...activeEvents]
    .filter(e => dateToObj(e.date) >= today)
    .sort((a,b) => dateToObj(a.date) - dateToObj(b.date));

  const allLocations = [...BASE_LOCATIONS, 'Other (please specify)'];
  const set = (k,v) => { setForm(p => ({...p,[k]:v})); setErrors(p => ({...p,[k]:''})); };


  const handleSubmit = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required.';
    if (!form.contact.trim()) errs.contact = 'Contact number is required.';
    if (!form.preferredDate) errs.preferredDate = 'Preferred date is required.';
    if (form.eventType === 'Manual Addition' && !form.customType.trim()) errs.customType = 'Please specify the event name.';
    if (form.location === 'Other (please specify)' && !form.customLocation.trim()) errs.customLocation = 'Please specify the location.';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    // Resolve final values
    const finalType = form.eventType === 'Manual Addition' ? form.customType.trim() : form.eventType;
    const finalLocation = form.location === 'Other (please specify)' ? form.customLocation.trim() : form.location;

    const ref = `EV-${Date.now().toString().slice(-6)}`;
    addEventRequest({ ...form, eventType: finalType, location: finalLocation, title: finalType, referenceNumber: ref });
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
          <h2>🔍 Track Event Request</h2>
          <p>Enter your reference number to check the status of your request.</p>
        </div>
        <div className="rr-track-form">
          <input placeholder="e.g. EV-123456" value={trackInput} onChange={e => setTrackInput(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && handleTrack()} />
          <button className="btn-primary" onClick={handleTrack}>🔍 Track</button>
        </div>
        {trackError && <div className="rr-track-error">❌ {trackError}</div>}
        {trackedRequest && (
          <div className="rr-track-result">
            <div className={`rr-status-box rr-status-${trackedRequest.status.toLowerCase()}`}>
              <div className="rr-status-icon">
                {trackedRequest.status === 'Pending' ? '⏳' : trackedRequest.status === 'Approved' ? '✅' : '❌'}
              </div>
              <div className="rr-status-label">{trackedRequest.status}</div>
            </div>
            <div className="rr-track-details">
              <p><strong>Reference:</strong> {trackedRequest.referenceNumber}</p>
              <p><strong>Event Type:</strong> {trackedRequest.eventType}</p>
              <p><strong>Requested By:</strong> {trackedRequest.fullName}</p>
              <p><strong>Preferred Date:</strong> {trackedRequest.preferredDate}</p>
              <p><strong>Location:</strong> {trackedRequest.location}</p>
              {trackedRequest.status === 'Pending' && <p className="rr-track-note">⏳ Your request is being reviewed by the parish clerk.</p>}
              {trackedRequest.status === 'Approved' && <p className="rr-track-note">✅ Your request has been approved! Please visit the parish office for confirmation.</p>}
              {trackedRequest.status === 'Declined' && <p className="rr-track-note">❌ Your request was declined. Please contact the parish office for details.</p>}
            </div>
          </div>
        )}
        <button className="btn-secondary" style={{marginTop:'16px'}} onClick={() => { setView('main'); setTrackedRequest(null); setTrackInput(''); setTrackError(''); }}>
          ← Back
        </button>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="request-page">
      <div className="request-success">
        <div className="success-icon">✅</div>
        <h2>Request Submitted!</h2>
        <p>Your event request has been sent to the clerk for review.</p>
        <div className="rr-ref-box" style={{margin:'16px 0'}}>
          <p>Your Reference Number:</p>
          <div className="rr-ref-number">{submittedRef}</div>
          <small>Save this to track your request status.</small>
        </div>
        <div style={{display:'flex',gap:'10px',justifyContent:'center',flexWrap:'wrap'}}>
          <button className="btn-secondary" onClick={() => { setView('track'); setTrackInput(submittedRef); setSubmitted(false); }}>🔍 Track My Request</button>
          <button className="btn-primary" onClick={() => { setForm(defaultForm); setErrors({}); setSubmitted(false); }}>Submit Another Request</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="request-page">
      <div className="re-hero">
        <div className="re-hero-icon">📅</div>
        <h1>Request Event / Mass</h1>
        <p>View upcoming parish events or submit a new event / mass request.</p>
        <button className="btn-primary re-cta-btn" onClick={() => setShowForm(true)}>
          📨 Submit an Event / Mass Request
        </button>
        <button className="btn-secondary re-cta-btn" style={{marginTop:'8px'}} onClick={() => setView('track')}>
          🔍 Track My Request
        </button>
      </div>

      {/* Upcoming Events Dashboard */}
      <div className="re-container">
        <h2 className="section-title">🗓️ All Upcoming Parish Events</h2>
        <p className="section-sub">These are the currently scheduled events. Click any to view details.</p>

        {upcoming.length === 0 ? (
          <div className="re-empty">
            <span>🕊️</span>
            <p>No upcoming events yet. Be the first to request one!</p>
          </div>
        ) : (
          <div className="re-events-grid">
            {upcoming.map(ev => {
              const type = getEventType(ev.type);
              return (
                <div key={ev.id} className="re-event-card" style={{borderTop:`4px solid ${type.color}`}} onClick={()=>setSelectedEvent(ev)}>
                  <div className="re-event-icon" style={{background:type.color+'22',color:type.color}}>{type.icon}</div>
                  <div className="re-event-body">
                    <div className="re-event-title">{ev.title}</div>
                    <div className="re-event-meta">📅 {ev.date}</div>
                    <div className="re-event-meta">🕐 {ev.time}</div>
                    <div className="re-event-meta">📍 {ev.location}</div>
                    {ev.priest && <div className="re-event-meta">✝️ {ev.priest}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Request Button (bottom) */}
      <div className="re-float-bar">
        <button className="btn-primary" onClick={() => setShowForm(true)}>📨 Request Event / Mass</button>
      </div>

      {/* Request Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal re-modal" onClick={e => e.stopPropagation()}>
            <h2>📅 Request an Event / Mass</h2>
            <p style={{color:'var(--text-light)',marginBottom:'20px',fontSize:'0.9rem'}}>Fill in the details below. The clerk will review and respond to your request.</p>

            <div className="form-group">
              <label>Full Name *</label>
              <input placeholder="e.g. Juan Dela Cruz" value={form.fullName} onChange={e=>set('fullName',e.target.value)} className={errors.fullName?'input-error':''} />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Contact Number *</label>
                <input placeholder="09XXXXXXXXX" value={form.contact} onChange={e=>set('contact',e.target.value)} className={errors.contact?'input-error':''} />
                {errors.contact && <span className="field-error">{errors.contact}</span>}
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="optional" value={form.email} onChange={e=>set('email',e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Type of Event / Mass *</label>
              <select value={form.eventType} onChange={e=>set('eventType',e.target.value)}>
                {MASS_CATEGORIES.map(cat => (
                  <optgroup key={cat.category} label={cat.category}>
                    {cat.types.map(t => <option key={t}>{t}</option>)}
                  </optgroup>
                ))}
              </select>
              {form.eventType === 'Manual Addition' && (
                <>
                  <input style={{marginTop:'8px'}} placeholder="Please specify event name" value={form.customType} onChange={e=>set('customType',e.target.value)} className={errors.customType?'input-error':''} />
                  {errors.customType && <span className="field-error">{errors.customType}</span>}
                </>
              )}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Preferred Date *</label>
                <input type="date" value={form.preferredDate} onChange={e=>set('preferredDate',e.target.value)} className={errors.preferredDate?'input-error':''} />
                {errors.preferredDate && <span className="field-error">{errors.preferredDate}</span>}
              </div>
              <div className="form-group">
                <label>Preferred Time</label>
                <input type="time" value={form.preferredTime} onChange={e=>set('preferredTime',e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Preferred Location</label>
              <select value={form.location} onChange={e=>set('location',e.target.value)}>
                {allLocations.map(l => <option key={l}>{l}</option>)}
              </select>
              {form.location === 'Other (please specify)' && (
                <>
                  <input style={{marginTop:'8px'}} placeholder="Enter location" value={form.customLocation} onChange={e=>set('customLocation',e.target.value)} className={errors.customLocation?'input-error':''} />
                  {errors.customLocation && <span className="field-error">{errors.customLocation}</span>}
                </>
              )}
            </div>
            <div className="form-group">
              <label>Notes / Special Requests</label>
              <textarea rows={3} placeholder="Any additional information..." value={form.notes} onChange={e=>set('notes',e.target.value)} />
            </div>
            <div style={{display:'flex',gap:'12px'}}>
              <button className="btn-primary" style={{flex:1}} onClick={handleSubmit}>📨 Submit Request</button>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {selectedEvent && (
        <EventModal event={selectedEvent} isClerk={false} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
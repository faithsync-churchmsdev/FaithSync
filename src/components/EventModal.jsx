import { useState } from 'react';
import { useApp } from '../AppContext';
import { getEventType, MASS_CATEGORIES, BASE_LOCATIONS } from '../data/events';
import './EventModal.css';

export default function EventModal({ event, isClerk, onClose }) {
  const { updateEvent, archiveEvent } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...event });
  const [customMass, setCustomMass] = useState('');
  const [customLocation, setCustomLocation] = useState('');

  const type = getEventType(event.type);
  const allMassTypes = MASS_CATEGORIES.flatMap(c => c.types);
  const allLocations = [...BASE_LOCATIONS, 'Manual Addition'];

  const handleSave = () => {
    const finalTitle = form.title === 'Manual Addition' ? customMass : form.title;
    const finalLocation = form.location === 'Manual Addition' ? customLocation : form.location;
    updateEvent(event.id, { ...form, title: finalTitle, location: finalLocation });
    setEditing(false);
    onClose();
  };

  const handleArchive = () => {
    if (window.confirm('Archive this event?')) {
      archiveEvent(event.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal event-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="event-modal-header" style={{ background: type.color }}>
          <div className="event-modal-icon">{type.icon}</div>
          <div>
            <h2>{event.title}</h2>
            <span className="event-modal-type">{type.label}</span>
          </div>
          <button className="close-panel" onClick={onClose} style={{marginLeft:'auto'}}>✕</button>
        </div>

        {!editing ? (
          <div className="event-detail-body">
            <div className="event-detail-row">
              <span>📅 Date</span><strong>{event.date}</strong>
            </div>
            <div className="event-detail-row">
              <span>🕐 Time</span><strong>{event.time}</strong>
            </div>
            <div className="event-detail-row">
              <span>📍 Location</span><strong>{event.location}</strong>
            </div>
            {event.priest && (
              <div className="event-detail-row">
                <span>👨‍⚕️ Priest</span><strong>{event.priest}</strong>
              </div>
            )}
            {event.notes && (
              <div className="event-detail-notes">
                <span>📝 Notes</span>
                <p>{event.notes}</p>
              </div>
            )}
            {isClerk && (
              <div className="event-modal-actions">
                <button className="btn-primary" onClick={() => setEditing(true)}>✏️ Edit Event</button>
                <button className="btn-danger" onClick={handleArchive}>🗃️ Archive</button>
              </div>
            )}
          </div>
        ) : (
          <div className="event-detail-body">
            <div className="form-group">
              <label>Event Type</label>
              <select value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}>
                {allMassTypes.map(t => <option key={t}>{t}</option>)}
              </select>
              {form.title === 'Manual Addition' && (
                <input placeholder="Enter custom event name" value={customMass} onChange={e => setCustomMass(e.target.value)} style={{marginTop:'8px'}} />
              )}
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Location</label>
              <select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}>
                {allLocations.map(l => <option key={l}>{l}</option>)}
              </select>
              {form.location === 'Manual Addition' && (
                <input placeholder="Enter custom location" value={customLocation} onChange={e => setCustomLocation(e.target.value)} style={{marginTop:'8px'}} />
              )}
            </div>
            <div className="form-group">
              <label>Priest</label>
              <input value={form.priest} onChange={e => setForm({ ...form, priest: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="event-modal-actions">
              <button className="btn-primary" onClick={handleSave}>💾 Save Changes</button>
              <button className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
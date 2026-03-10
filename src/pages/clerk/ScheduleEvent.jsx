import { useState } from 'react';
import ConfirmModal from '../../components/ConfirmModal';
import { useApp } from '../../AppContext';
import { MASS_CATEGORIES, BASE_LOCATIONS, getEventType } from '../../data/events';
import EventModal from '../../components/EventModal';
import './ScheduleEvent.css';

const PAGE_SIZE = 8;

const defaultForm = {
  title: 'Sunday Mass', category: MASS_CATEGORIES[0].category,
  date: '', time: '', location: BASE_LOCATIONS[0],
  priest: '', notes: '', customTitle: '', customLocation: '', customPriest: '',
  language: 'Filipino',
};

// Auto-detect event type from category
function getTypeFromCategory(category) {
  const map = {
    'Regular Masses': 'sunday_mass',
    'Sacraments': 'baptism',
    'Special Occasions': 'fiesta',
    'Novenas & Devotions': 'novena',
    'Community Events': 'meeting',
    'Youth & Education': 'catechism',
    'Funerals & Memorial': 'funeral',
    'Others': 'other',
  };
  return map[category] || 'other';
}

export default function ScheduleEvent() {
  const { events, addEvent, updateEvent, archiveEvent, markEventDone, priests } = useApp();
  const [showForm, setShowForm] = useState(false);

  const [cfm, setCfm] = useState({ open:false, msg:'', label:'', color:'', action:null });
  const askConfirm = (msg, label, color, action) => setCfm({ open:true, msg, label, color, action });
  const doCfm = () => { cfm.action && cfm.action(); setCfm(s=>({...s,open:false})); };
  const cancelCfm = () => setCfm(s=>({...s,open:false}));
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [viewEvent, setViewEvent] = useState(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const activePriests = (priests || []).filter(p => !p.archived && p.status === 'Active');
  const allLocations = [...BASE_LOCATIONS, 'Other (please specify)'];
  const activeEvents = events.filter(e => !e.archived);
  const filtered = filter ? activeEvents.filter(e => e.title.toLowerCase().includes(filter.toLowerCase())) : activeEvents;
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageEvents = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(true);
  };
  const openEdit = (ev) => {
    setForm({ ...ev, customTitle: '', customLocation: '', customPriest: '' });
    setEditingId(ev.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.date) { alert('Please select a date.'); return; }
    const finalTitle = form.title === 'Other (please specify)' ? form.customTitle : form.title;
    const finalLocation = form.location === 'Other (please specify)' ? form.customLocation : form.location;
    const finalPriest = form.priest === 'manual' ? form.customPriest : form.priest;
    const autoType = getTypeFromCategory(form.category);

    if (editingId) {
      updateEvent(editingId, { ...form, title: finalTitle, location: finalLocation, priest: finalPriest, type: autoType });
    } else {
      const dayEvents = activeEvents.filter(e => e.date === form.date);
      if (dayEvents.length >= 3) { alert('Maximum of 3 events per day reached.'); return; }
      addEvent({ ...form, title: finalTitle, location: finalLocation, priest: finalPriest, type: autoType, language: form.language });
    }
    setShowForm(false);
    setForm(defaultForm);
    setEditingId(null);
  };

  const currentTypes = MASS_CATEGORIES.find(c => c.category === form.category)?.types || [];

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <div>
          <h1>📅 Schedule Event</h1>
          <p>Add and manage parish events and masses. Click any row to view details.</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add New Event</button>
      </div>

      <div className="schedule-filter">
        <input placeholder="🔍 Search events..." value={filter} onChange={e => setFilter(e.target.value)} style={{maxWidth:'300px'}} />
      </div>

      <div style={{overflowX:'auto'}}>
        <table>
          <thead>
            <tr><th>Icon</th><th>Title</th><th>Date</th><th>Time</th><th>Location</th><th>Priest</th><th>Language</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {pageEvents.length === 0 ? (
              <tr><td colSpan={8} style={{textAlign:'center',padding:'30px',color:'var(--text-light)'}}>No events found.</td></tr>
            ) : pageEvents.map(ev => {
              const t = getEventType(ev.type);
              const isDone = ev.done;
              return (
                <tr
                  key={ev.id}
                  className={isDone ? 'row-done' : ''}
                  style={{cursor:'pointer'}}
                  onClick={() => setViewEvent(ev)}
                >
                  <td><span style={{fontSize:'1.3rem'}}>{t.icon}</span></td>
                  <td><strong>{ev.title}</strong></td>
                  <td>{ev.date}</td>
                  <td>{ev.time || '—'}</td>
                  <td style={{fontSize:'0.85rem',maxWidth:'160px'}}>{ev.location}</td>
                  <td>{ev.priest || '—'}</td>
                  <td>{ev.language || '—'}</td>
                  <td>
                    {isDone
                      ? <span className="badge badge-done">✓ Done</span>
                      : <span className="badge badge-active">Active</span>
                    }
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
                      <button className="btn-secondary" style={{padding:'5px 10px',fontSize:'0.78rem'}} onClick={() => openEdit(ev)}>✏️ Edit</button>
                      {!isDone && (
                        <button className="btn-done" style={{padding:'5px 10px',fontSize:'0.78rem'}} onClick={()=>askConfirm('Mark this event as done?','✅ Yes, Mark Done','var(--success)',()=>markEventDone(ev.id))}>✅ Done</button>
                      )}
                      <button className="btn-danger" style={{padding:'5px 10px',fontSize:'0.78rem'}} onClick={()=>askConfirm('Archive this event?','🗃️ Yes, Archive','var(--warning)',()=>archiveEvent(ev.id))}>🗃️ Archive</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
        </div>
      )}

      {/* Event Detail Modal */}
      {viewEvent && !showForm && (
        <EventModal event={viewEvent} isClerk={true} onClose={() => setViewEvent(null)} />
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal schedule-modal" onClick={e => e.stopPropagation()}>
            <h2>{editingId ? '✏️ Edit Event' : '➕ Add New Event'}</h2>

            <div className="form-group">
              <label>Event Category</label>
              <select value={form.category} onChange={e => {
                const cat = MASS_CATEGORIES.find(c => c.category === e.target.value);
                set('category', e.target.value);
                if (cat) set('title', cat.types[0]);
              }}>
                {MASS_CATEGORIES.map(c => <option key={c.category}>{c.category}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Event / Mass Type</label>
              <select value={form.title} onChange={e => set('title', e.target.value)}>
                {currentTypes.map(t => <option key={t}>{t}</option>)}
              </select>
              {form.title === 'Other (please specify)' && (
                <input style={{marginTop:'8px'}} placeholder="Please specify event name..." value={form.customTitle} onChange={e => set('customTitle', e.target.value)} />
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Time (free input)</label>
                <input type="time" value={form.time} onChange={e => set('time', e.target.value)} placeholder="e.g. 08:00" />
              </div>
            </div>

            <div className="form-group">
              <label>Mass / Event Language</label>
              <select value={form.language} onChange={e => set('language', e.target.value)}>
                <option>Filipino</option>
                <option>English</option>
                <option>Cebuano</option>
                <option>Spanish</option>
                <option>Latin</option>
                <option>Bilingual (Filipino/English)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Location</label>
              <select value={form.location} onChange={e => set('location', e.target.value)}>
                {allLocations.map(l => <option key={l}>{l}</option>)}
              </select>
              {form.location === 'Other (please specify)' && (
                <input style={{marginTop:'8px'}} placeholder="Enter location..." value={form.customLocation} onChange={e => set('customLocation', e.target.value)} />
              )}
            </div>

            <div className="form-group">
              <label>Officiating Priest</label>
              <select value={form.priest} onChange={e => set('priest', e.target.value)}>
                <option value="">— None / TBA —</option>
                {activePriests.map(p => (
                  <option key={p.id} value={`${p.title} ${p.firstName} ${p.lastName}`}>
                    {p.title} {p.firstName} {p.lastName} ({p.specialization})
                  </option>
                ))}
                <option value="manual">Other (please specify)</option>
              </select>
              {form.priest === 'manual' && (
                <input style={{marginTop:'8px'}} placeholder="Enter priest name..." value={form.customPriest} onChange={e => set('customPriest', e.target.value)} />
              )}
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>

            <div style={{display:'flex',gap:'12px',marginTop:'8px'}}>
              <button className="btn-primary" style={{flex:1}} onClick={handleSubmit}>💾 Save Event</button>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal isOpen={cfm.open} icon="🗃️" title={cfm.msg} confirmLabel={cfm.label} confirmColor={cfm.color} onConfirm={doCfm} onCancel={cancelCfm} />
    </div>
  );
}
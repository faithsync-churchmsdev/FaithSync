import { useState } from 'react';
import ConfirmModal from '../../components/ConfirmModal';
import { useApp } from '../../AppContext';
import './MassSchedule.css';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MASS_TYPES = ['Regular Mass', 'Vigil Mass', 'Special Mass', 'Novena Mass', 'Youth Mass', 'Filipino Mass', 'English Mass'];
const defaultSlot = { day: 'Sunday', time: '', type: 'Regular Mass', priest: '', location: '', language: 'Filipino', notes: '' };

export default function MassSchedule() {
  const { massSchedules, addMassSchedule, deleteMassSchedule, priests } = useApp();

  const [cfm, setCfm] = useState({ open: false, msg: '', label: '', color: '', action: null });
  const askConfirm = (msg, label, color, action) => setCfm({ open: true, msg, label, color, action });
  const doCfm = () => { cfm.action && cfm.action(); setCfm(s => ({ ...s, open: false })); };
  const cancelCfm = () => setCfm(s => ({ ...s, open: false }));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultSlot);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const activePriests = (priests || []).filter(p => !p.archived && p.status === 'Active');
  const schedules = massSchedules || [];

  const byDay = DAYS.reduce((acc, d) => {
    acc[d] = schedules.filter(s => s.day === d).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    return acc;
  }, {});

  const handleSave = async () => {
    const e = {};
    if (!form.time) e.time = 'Time is required.';
    if (!form.location) e.location = 'Location is required.';
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    await addMassSchedule({ ...form });
    setSaving(false);
    setForm(defaultSlot);
    setShowForm(false);
  };

  const fmtTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  return (
    <div className="massched-page">
      <div className="massched-header">
        <div>
          <h1>🕯️ Mass Schedule</h1>
          <p>Regular weekly mass schedule for the parish. Visible to all parishioners.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Mass Schedule</button>
      </div>

      {schedules.length === 0 ? (
        <div className="massched-empty">
          <span>⛪</span>
          <p>No mass schedules added yet. Click "+ Add Mass Schedule" to begin.</p>
        </div>
      ) : (
        <div className="massched-grid">
          {DAYS.map(day => byDay[day].length > 0 && (
            <div key={day} className="massched-day-card">
              <div className="massched-day-header">{day}</div>
              {byDay[day].map(s => (
                <div key={s.id} className="massched-slot">
                  <div className="massched-time">{fmtTime(s.time)}</div>
                  <div className="massched-info">
                    <strong>{s.type}</strong>
                    {s.priest && <span>✝️ {s.priest}</span>}
                    <span>📍 {s.location}</span>
                    {s.language && <span>🌐 {s.language}</span>}
                    {s.notes && <span className="massched-notes">{s.notes}</span>}
                  </div>
                  <button className="massched-del" onClick={() => askConfirm('Remove this mass schedule?', '🗑️ Yes, Remove', 'var(--danger)', () => deleteMassSchedule(s.id))}>✕</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🕯️ Add Mass Schedule</h3>
              <button onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Day *</label>
                  <select value={form.day} onChange={e => set('day', e.target.value)}>
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Time *</label>
                  <input type="time" value={form.time} onChange={e => set('time', e.target.value)} className={errors.time ? 'input-error' : ''} />
                  {errors.time && <span className="field-error">{errors.time}</span>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Mass Type</label>
                  <select value={form.type} onChange={e => set('type', e.target.value)}>
                    {MASS_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Language</label>
                  <select value={form.language} onChange={e => set('language', e.target.value)}>
                    <option>Filipino</option>
                    <option>English</option>
                    <option>Cebuano</option>
                    <option>Spanish</option>
                    <option>Latin</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Officiating Priest</label>
                <select value={form.priest} onChange={e => set('priest', e.target.value)}>
                  <option value="">— TBA —</option>
                  {activePriests.map(p => <option key={p.id} value={`${p.title} ${p.firstName} ${p.lastName}`}>{p.title} {p.firstName} {p.lastName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Location / Chapel *</label>
                <input placeholder="e.g., Main Cathedral, Side Chapel" value={form.location} onChange={e => set('location', e.target.value)} className={errors.location ? 'input-error' : ''} />
                {errors.location && <span className="field-error">{errors.location}</span>}
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input placeholder="e.g., With choir, For youth, etc." value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
                  {saving ? '⏳ Saving...' : 'Save Schedule'}
                </button>
                <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal isOpen={cfm.open} icon="🗃️" title={cfm.msg} confirmLabel={cfm.label} confirmColor={cfm.color} onConfirm={doCfm} onCancel={cancelCfm} />
    </div>
  );
}
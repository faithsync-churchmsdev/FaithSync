import { useState } from 'react';
import { useApp } from '../../AppContext';
import ConfirmModal from '../../components/ConfirmModal';
import './BulletinBoard.css';

const CATEGORIES = ['General Announcement', 'Prayer Intention', 'Upcoming Feast', 'Community News', 'Urgent Notice', 'Youth Ministry', 'Other'];
const CAT_COLORS = {
  'General Announcement': '#1a6fb5', 'Prayer Intention': '#9b59b6', 'Upcoming Feast': '#c0392b',
  'Community News': '#27ae60', 'Urgent Notice': '#e74c3c', 'Youth Ministry': '#e67e22', 'Other': '#7f8c8d',
};
const CAT_ICONS = {
  'General Announcement': '📢', 'Prayer Intention': '🙏', 'Upcoming Feast': '✝️',
  'Community News': '📰', 'Urgent Notice': '🚨', 'Youth Ministry': '👧', 'Other': '📌',
};

const defaultForm = { title: '', category: CATEGORIES[0], content: '', author: '', pinned: false };

export default function BulletinBoard() {
  const { bulletins, addBulletin, updateBulletin, deleteBulletin, togglePinBulletin } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = new post, id = editing
  const [form, setForm] = useState(defaultForm);
  const [filter, setFilter] = useState('All');
  const [errors, setErrors] = useState({});
  const [cfm, setCfm] = useState({ open: false, msg: '', label: '', color: '', action: null });
  const askConfirm = (msg, label, color, action) => setCfm({ open: true, msg, label, color, action });
  const doCfm = () => { cfm.action && cfm.action(); setCfm(s => ({ ...s, open: false })); };
  const cancelCfm = () => setCfm(s => ({ ...s, open: false }));

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const openNew = () => { setForm(defaultForm); setEditTarget(null); setErrors({}); setShowForm(true); };
  const openEdit = (b) => { setForm({ title: b.title, category: b.category, content: b.content, author: b.author || '', pinned: b.pinned || false }); setEditTarget(b.id); setErrors({}); setShowForm(true); };

  const items = (bulletins || []).slice().sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.id - a.id;
  });
  const filtered = filter === 'All' ? items : items.filter(b => b.category === filter);

  const handleSave = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (!form.content.trim()) e.content = 'Content is required.';
    if (Object.keys(e).length) { setErrors(e); return; }

    if (editTarget) {
      updateBulletin(editTarget, { ...form });
    } else {
      addBulletin({ ...form, id: Date.now(), createdAt: new Date().toISOString() });
    }
    setForm(defaultForm); setShowForm(false); setEditTarget(null);
  };

  const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="bulletin-page">
      <div className="bulletin-header">
        <div>
          <h1>📌 Bulletin Board</h1>
          <p>Post announcements, prayer intentions, and parish news visible to all parishioners.</p>
        </div>
        <button className="btn-primary" onClick={openNew}>+ New Post</button>
      </div>

      {/* Category filter */}
      <div className="bulletin-filters">
        {['All', ...CATEGORIES].map(c => (
          <button key={c} className={`filter-chip ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
            {CAT_ICONS[c] || '📋'} {c}
          </button>
        ))}
      </div>

      {/* Posts */}
      {filtered.length === 0 ? (
        <div className="bulletin-empty">
          <span>📭</span>
          <p>No announcements yet. Click "+ New Post" to add one.</p>
        </div>
      ) : (
        <div className="bulletin-grid">
          {filtered.map(b => (
            <div key={b.id} className={`bulletin-card ${b.pinned ? 'pinned' : ''}`} style={{ borderTop: `4px solid ${CAT_COLORS[b.category] || '#aaa'}` }}>
              {b.pinned && <div className="pinned-badge">📌 Pinned</div>}
              <div className="bulletin-card-header">
                <span className="bulletin-cat-icon">{CAT_ICONS[b.category] || '📌'}</span>
                <span className="bulletin-cat" style={{ color: CAT_COLORS[b.category] }}>{b.category}</span>
              </div>
              <h3 className="bulletin-title">{b.title}</h3>
              <p className="bulletin-content">{b.content}</p>
              <div className="bulletin-footer">
                <span>✍️ {b.author || 'Parish Clerk'} · {fmtDate(b.createdAt)}</span>
                <div className="bulletin-actions">
                  <button onClick={() => openEdit(b)} title="Edit post">✏️ Edit</button>
                  <button onClick={() => togglePinBulletin(b.id)} title={b.pinned ? 'Unpin' : 'Pin to top'}>
                    {b.pinned ? '📌 Unpin' : '📍 Pin'}
                  </button>
                  <button className="btn-danger-sm" onClick={() => askConfirm('Delete this bulletin post?', '🗑️ Yes, Delete', 'var(--danger)', () => deleteBulletin(b.id))}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New / Edit Post Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editTarget ? '✏️ Edit Bulletin Post' : '📌 New Bulletin Post'}</h3>
              <button onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label>Title *</label>
                <input placeholder="e.g., Sunday Mass Time Change" value={form.title} onChange={e => set('title', e.target.value)} className={errors.title ? 'input-error' : ''} />
                {errors.title && <span className="field-error">{errors.title}</span>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Author</label>
                  <input placeholder="Parish Clerk" value={form.author} onChange={e => set('author', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Content *</label>
                <textarea rows={5} placeholder="Write your announcement here..." value={form.content} onChange={e => set('content', e.target.value)} className={errors.content ? 'input-error' : ''} />
                {errors.content && <span className="field-error">{errors.content}</span>}
              </div>
              <label className="check-label">
                <input type="checkbox" checked={form.pinned} onChange={e => set('pinned', e.target.checked)} style={{ width: 'auto' }} />
                📌 Pin this post to top
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave}>
                  {editTarget ? '💾 Save Changes' : 'Post Announcement'}
                </button>
                <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={cfm.open} icon="🗑️" title={cfm.msg} confirmLabel={cfm.label} confirmColor={cfm.color} onConfirm={doCfm} onCancel={cancelCfm} />
    </div>
  );
}
import { useState } from 'react';
import { useApp } from '../../AppContext';
import { MINISTRIES } from '../../data/members';
import './RequestMembership.css';

const defaultForm = {
  lastName:'', firstName:'', middleName:'', birthday:'', gender:'Male',
  address:'', contact:'', email:'', ministry: MINISTRIES[0], notes:'', photo:'',
};

const PAGE_SIZE = 6;

export default function RequestMembership() {
  const { members, addMembershipRequest } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitted, setSubmitted] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterMinistry, setFilterMinistry] = useState('');
  const [page, setPage] = useState(1);

  const set = (k,v) => setForm(p => ({...p,[k]:v}));

  const activeMembers = members.filter(m => !m.archived);
  const filtered = activeMembers.filter(m => {
    const nameMatch = `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase());
    const minMatch = !filterMinistry || m.ministry === filterMinistry;
    return nameMatch && minMatch;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageMembers = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('photo', reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!form.lastName || !form.firstName || !form.birthday) {
      alert('Please fill in required fields.');
      return;
    }
    addMembershipRequest({...form});
    setSubmitted(true);
    setShowForm(false);
  };

  if (submitted) return (
    <div className="rm-page">
      <div className="request-success">
        <div className="success-icon">✅</div>
        <h2>Membership Request Submitted!</h2>
        <p>Your request has been sent to the clerk for review. We'll get back to you soon!</p>
        <button className="btn-primary" onClick={() => { setForm(defaultForm); setSubmitted(false); }}>Submit Another</button>
      </div>
    </div>
  );

  return (
    <div className="rm-page">
      {/* Hero */}
      <div className="rm-hero">
        <div className="rm-hero-icon">🙏</div>
        <h1>Parish Ministry Members</h1>
        <p>Meet the dedicated members of our parish ministries. Interested in joining? Click the button below!</p>
        <button className="btn-primary rm-cta-btn" onClick={() => setShowForm(true)}>
          ✋ Apply for Ministry Membership
        </button>
      </div>

      {/* Members Directory */}
      <div className="rm-container">
        <div className="rm-toolbar">
          <div className="rm-filters">
            <input
              placeholder="🔍 Search member..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{maxWidth:'220px'}}
            />
            <select
              value={filterMinistry}
              onChange={e => { setFilterMinistry(e.target.value); setPage(1); }}
              style={{maxWidth:'220px'}}
            >
              <option value="">All Ministries</option>
              {MINISTRIES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <span className="rm-count">{filtered.length} member{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {pageMembers.length === 0 ? (
          <div className="rm-empty">
            <span>👥</span>
            <p>No members found.</p>
          </div>
        ) : (
          <div className="rm-members-grid">
            {pageMembers.map(m => (
              <div key={m.id} className="rm-member-card" onClick={() => setSelected(m)}>
                <div className="rm-member-top" style={{background: m.status === 'Active' ? 'var(--primary)' : '#888'}}>
                  {m.photo
                    ? <img src={m.photo} alt="" className="rm-avatar" />
                    : <div className="rm-avatar-placeholder">{m.firstName[0]}{m.lastName[0]}</div>
                  }
                  <span className={`rm-status-dot ${m.status === 'Active' ? 'dot-active' : 'dot-inactive'}`} />
                </div>
                <div className="rm-member-body">
                  <div className="rm-member-name">{m.firstName} {m.lastName}</div>
                  <div className="rm-member-ministry">{m.ministry}</div>
                  <div className="rm-member-role">{m.role}</div>
                  <span className={`badge badge-${m.status.toLowerCase()}`} style={{marginTop:'8px',display:'inline-block'}}>{m.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination" style={{marginTop:'24px'}}>
            {Array.from({length:totalPages},(_,i) => (
              <button key={i} className={page===i+1?'active':''} onClick={()=>setPage(i+1)}>{i+1}</button>
            ))}
          </div>
        )}
      </div>

      {/* Member Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal rm-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="rm-detail-top">
              {selected.photo
                ? <img src={selected.photo} alt="" className="rm-detail-avatar" />
                : <div className="rm-detail-avatar-placeholder">{selected.firstName[0]}{selected.lastName[0]}</div>
              }
              <button className="close-panel" onClick={() => setSelected(null)} style={{position:'absolute',top:'12px',right:'12px'}}>✕</button>
            </div>
            <div className="rm-detail-body">
              <h2>{selected.firstName} {selected.middleName} {selected.lastName}</h2>
              <p style={{color:'var(--primary)',fontWeight:700}}>{selected.ministry}</p>
              <span className={`badge badge-${selected.status.toLowerCase()}`}>{selected.status} · {selected.role}</span>
              <div className="rm-detail-grid">
                <div><span>Gender</span><strong>{selected.gender}</strong></div>
                <div><span>Joined</span><strong>{selected.joined}</strong></div>
                {selected.contact && <div><span>Contact</span><strong>{selected.contact}</strong></div>}
                {selected.email && <div><span>Email</span><strong>{selected.email}</strong></div>}
              </div>
              {selected.skills?.length > 0 && (
                <div className="rm-detail-tags">
                  <span className="rm-tag-label">Skills</span>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginTop:'6px'}}>
                    {selected.skills.map(s => <span key={s} className="pd-tag">{s}</span>)}
                  </div>
                </div>
              )}
              <button className="btn-primary" style={{width:'100%',marginTop:'16px'}} onClick={() => { setSelected(null); setShowForm(true); }}>
                ✋ Apply to Join This Ministry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal rm-form-modal" onClick={e => e.stopPropagation()}>
            <h2>✋ Apply for Ministry Membership</h2>
            <p style={{color:'var(--text-light)',marginBottom:'20px',fontSize:'0.9rem'}}>Fill in your details. The clerk will review your application.</p>

            {/* Photo Upload */}
            <div className="rm-photo-upload">
              {form.photo
                ? <img src={form.photo} alt="" className="rm-form-avatar" />
                : <div className="rm-form-avatar-placeholder">{form.firstName?.[0] || '?'}{form.lastName?.[0] || ''}</div>
              }
              <div>
                <label className="btn-secondary" style={{cursor:'pointer',padding:'8px 16px',fontSize:'0.85rem',display:'inline-block'}}>
                  📷 Upload Your Photo
                  <input type="file" accept="image/*" style={{display:'none'}} onChange={handlePhoto} />
                </label>
                <p style={{fontSize:'0.78rem',color:'var(--text-light)',marginTop:'4px'}}>Optional — profile photo</p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group"><label>Last Name *</label><input value={form.lastName} onChange={e=>set('lastName',e.target.value)} /></div>
              <div className="form-group"><label>First Name *</label><input value={form.firstName} onChange={e=>set('firstName',e.target.value)} /></div>
              <div className="form-group"><label>Middle Name</label><input value={form.middleName} onChange={e=>set('middleName',e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Birthday *</label><input type="date" value={form.birthday} onChange={e=>set('birthday',e.target.value)} /></div>
              <div className="form-group"><label>Gender</label><select value={form.gender} onChange={e=>set('gender',e.target.value)}><option>Male</option><option>Female</option></select></div>
            </div>
            <div className="form-group"><label>Address</label><input value={form.address} onChange={e=>set('address',e.target.value)} /></div>
            <div className="form-row">
              <div className="form-group"><label>Contact Number</label><input placeholder="09XXXXXXXXX" value={form.contact} onChange={e=>set('contact',e.target.value)} /></div>
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} /></div>
            </div>
            <div className="form-group">
              <label>Ministry / Group to Join</label>
              <select value={form.ministry} onChange={e=>set('ministry',e.target.value)}>
                {MINISTRIES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Notes / Why do you want to join?</label><textarea rows={3} value={form.notes} onChange={e=>set('notes',e.target.value)} /></div>
            <div style={{display:'flex',gap:'12px'}}>
              <button className="btn-primary" style={{flex:1}} onClick={handleSubmit}>📨 Submit Application</button>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
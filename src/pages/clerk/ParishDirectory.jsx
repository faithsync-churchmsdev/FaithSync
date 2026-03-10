import { useState } from 'react';
import ConfirmModal from '../../components/ConfirmModal';
import { useApp } from '../../AppContext';
import { MINISTRIES, ROLES, STATUSES, SKILLS, AVAILABILITIES, PRIEST_TITLES, PRIEST_STATUSES } from '../../data/members';
import './ParishDirectory.css';

const TABS = ['Ministry Members', 'Priests', 'Parishioners'];
const PAGE_SIZE = 8;

export default function ParishDirectory() {
  const [tab, setTab] = useState('Ministry Members');
  const {
    members, addMember, updateMember, archiveMember,
    priests, addPriest, updatePriest, archivePriest,
    parishioners, addParishioner, updateParishioner, archiveParishioner,
  } = useApp();

  const counts = {
    'Ministry Members': members.filter(m => !m.archived).length,
    'Priests': priests.filter(p => !p.archived).length,
    'Parishioners': parishioners.filter(p => !p.archived).length,
  };

  return (
    <div className="pd-page">
      <div className="pd-header">
        <div>
          <h1>⛪ Parish Directory</h1>
          <p>Manage all church members — ministry volunteers, priests, and parishioners.</p>
        </div>
      </div>

      <div className="pd-tabs">
        {TABS.map(t => (
          <button key={t} className={`pd-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t} <span className="pd-count">{counts[t]}</span>
          </button>
        ))}
      </div>

      {tab === 'Ministry Members' && (
        <MinistryTab members={members} addMember={addMember} updateMember={updateMember} archiveMember={archiveMember} />
      )}
      {tab === 'Priests' && (
        <PriestsTab priests={priests} addPriest={addPriest} updatePriest={updatePriest} archivePriest={archivePriest} />
      )}
      {tab === 'Parishioners' && (
        <ParishionersTab parishioners={parishioners} addParishioner={addParishioner} updateParishioner={updateParishioner} archiveParishioner={archiveParishioner} />
      )}
    </div>
  );
}

// ─── MINISTRY MEMBERS TAB ───────────────────────────────────────────────────
function MinistryTab({ members, addMember, updateMember, archiveMember }) {
  const [showForm, setShowForm] = useState(false);
  const [cfm, setCfm] = useState({ open:false, msg:'', label:'', color:'', action:null });
  const askConfirm = (msg, label, color, action) => setCfm({ open:true, msg, label, color, action });
  const doCfm = () => { cfm.action && cfm.action(); setCfm(s=>({...s,open:false})); };
  const cancelCfm = () => setCfm(s=>({...s,open:false}));
  const [editId, setEditId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterMinistry, setFilterMinistry] = useState('');
  const [page, setPage] = useState(1);

  const defaultForm = {
    lastName:'', firstName:'', middleName:'', gender:'Male', birthday:'', address:'', contact:'', email:'',
    ministry: MINISTRIES[0], role: ROLES[0], status: STATUSES[0], skills:[], availability:[],
    joined: new Date().toISOString().split('T')[0], baptized:false, confirmed:false, firstCommunion:false, photo:'',
  };
  const [form, setForm] = useState(defaultForm);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const toggle = (arr, val) => arr.includes(val) ? arr.filter(x=>x!==val) : [...arr, val];

  const active = members.filter(m => !m.archived);
  const filtered = active.filter(m => {
    const nameMatch = `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase());
    const minMatch = !filterMinistry || m.ministry === filterMinistry;
    return nameMatch && minMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const shown = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const openAdd = () => { setForm(defaultForm); setEditId(null); setShowForm(true); };
  const openEdit = (m) => { setForm({...m, skills: m.skills||[], availability: m.availability||[]}); setEditId(m.id); setShowForm(true); };
  const handleSave = () => {
    if (!form.lastName || !form.firstName) { alert('Fill in required fields.'); return; }
    if (editId) updateMember(editId, form);
    else addMember(form);
    setShowForm(false);
  };
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('photo', reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="pd-toolbar">
        <div className="pd-filters">
          <input placeholder="🔍 Search member..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:'220px'}} />
          <select value={filterMinistry} onChange={e=>setFilterMinistry(e.target.value)} style={{maxWidth:'220px'}}>
            <option value="">All Ministries</option>
            {MINISTRIES.map(m=><option key={m}>{m}</option>)}
          </select>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Ministry Member</button>
      </div>

      <div style={{overflowX:'auto'}}>
        <table>
          <thead>
            <tr><th>Photo</th><th>Name</th><th>Ministry</th><th>Role</th><th>Status</th><th>Contact</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {shown.length === 0
              ? <tr><td colSpan={7} style={{textAlign:'center',padding:'30px',color:'var(--text-light)'}}>No members found.</td></tr>
              : shown.map(m => (
                <tr key={m.id} style={{cursor:'pointer'}} onClick={() => setSelected(m)}>
                  <td>
                    {m.photo
                      ? <img src={m.photo} alt="" className="pd-avatar-sm" />
                      : <div className="pd-avatar-placeholder">{m.firstName[0]}{m.lastName[0]}</div>
                    }
                  </td>
                  <td><strong>{m.firstName} {m.middleName} {m.lastName}</strong></td>
                  <td>{m.ministry}</td>
                  <td>{m.role}</td>
                  <td><span className={`badge badge-${m.status.toLowerCase()}`}>{m.status}</span></td>
                  <td>{m.contact}</td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div style={{display:'flex',gap:'6px'}}>
                      <button className="btn-secondary" style={{padding:'6px 10px',fontSize:'0.8rem'}} onClick={()=>openEdit(m)}>✏️ Edit</button>
                      <button className="btn-danger" style={{padding:'6px 10px',fontSize:'0.8rem'}} onClick={()=>askConfirm('Archive this member?','🗃️ Yes, Archive','var(--warning)',()=>archiveMember(m.id))}>🗃️ Archive</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({length:totalPages},(_,i)=><button key={i} className={page===i+1?'active':''} onClick={()=>setPage(i+1)}>{i+1}</button>)}
        </div>
      )}

      {/* Detail Modal */}
      {selected && !showForm && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal pd-detail-modal" onClick={e=>e.stopPropagation()}>
            <div className="pd-detail-header">
              {selected.photo
                ? <img src={selected.photo} alt="" className="pd-avatar-lg" />
                : <div className="pd-avatar-lg-placeholder">{selected.firstName[0]}{selected.lastName[0]}</div>
              }
              <div>
                <h2>{selected.firstName} {selected.middleName} {selected.lastName}</h2>
                <p style={{color:'var(--text-light)'}}>{selected.ministry} · {selected.role}</p>
                <span className={`badge badge-${selected.status.toLowerCase()}`}>{selected.status}</span>
              </div>
              <button className="close-panel" onClick={()=>setSelected(null)} style={{marginLeft:'auto'}}>✕</button>
            </div>
            <div className="pd-detail-body">
              <div className="pd-detail-grid">
                <div><span>Gender</span><strong>{selected.gender}</strong></div>
                <div><span>Birthday</span><strong>{selected.birthday}</strong></div>
                <div><span>Contact</span><strong>{selected.contact}</strong></div>
                <div><span>Email</span><strong>{selected.email || '—'}</strong></div>
                <div><span>Address</span><strong>{selected.address}</strong></div>
                <div><span>Joined</span><strong>{selected.joined}</strong></div>
              </div>
              <div className="pd-detail-section">
                <span>Sacraments</span>
                <div className="pd-tags">
                  {selected.baptized && <span className="pd-tag">💧 Baptized</span>}
                  {selected.firstCommunion && <span className="pd-tag">🍞 First Communion</span>}
                  {selected.confirmed && <span className="pd-tag">🕊️ Confirmed</span>}
                </div>
              </div>
              {selected.skills?.length > 0 && (
                <div className="pd-detail-section">
                  <span>Skills</span>
                  <div className="pd-tags">{selected.skills.map(s=><span key={s} className="pd-tag">{s}</span>)}</div>
                </div>
              )}
              {selected.availability?.length > 0 && (
                <div className="pd-detail-section">
                  <span>Availability</span>
                  <div className="pd-tags">{selected.availability.map(a=><span key={a} className="pd-tag">📅 {a}</span>)}</div>
                </div>
              )}
            </div>
            <div style={{display:'flex',gap:'10px',padding:'0 0 4px'}}>
              <button className="btn-primary" style={{flex:1}} onClick={()=>{setSelected(null); openEdit(selected);}}>✏️ Edit</button>
              <button className="btn-secondary" onClick={()=>setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="modal-overlay" onClick={()=>setShowForm(false)}>
          <div className="modal pd-form-modal" onClick={e=>e.stopPropagation()}>
            <h2>{editId ? '✏️ Edit Ministry Member' : '➕ Add Ministry Member'}</h2>

            <div className="pd-photo-upload">
              {form.photo
                ? <img src={form.photo} alt="" className="pd-avatar-lg" />
                : <div className="pd-avatar-lg-placeholder">{form.firstName?.[0] || '?'}{form.lastName?.[0] || ''}</div>
              }
              <label className="btn-secondary" style={{cursor:'pointer',padding:'8px 16px',fontSize:'0.85rem'}}>
                📷 Upload Photo
                <input type="file" accept="image/*" style={{display:'none'}} onChange={handlePhoto} />
              </label>
            </div>

            <div className="form-row">
              <div className="form-group"><label>Last Name *</label><input value={form.lastName} onChange={e=>set('lastName',e.target.value)} /></div>
              <div className="form-group"><label>First Name *</label><input value={form.firstName} onChange={e=>set('firstName',e.target.value)} /></div>
              <div className="form-group"><label>Middle Name</label><input value={form.middleName} onChange={e=>set('middleName',e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Gender</label><select value={form.gender} onChange={e=>set('gender',e.target.value)}><option>Male</option><option>Female</option></select></div>
              <div className="form-group"><label>Birthday</label><input type="date" value={form.birthday} onChange={e=>set('birthday',e.target.value)} /></div>
            </div>
            <div className="form-group"><label>Address</label><input value={form.address} onChange={e=>set('address',e.target.value)} /></div>
            <div className="form-row">
              <div className="form-group"><label>Contact</label><input value={form.contact} onChange={e=>set('contact',e.target.value)} /></div>
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} /></div>
            </div>
            <div className="form-group"><label>Ministry</label><select value={form.ministry} onChange={e=>set('ministry',e.target.value)}>{MINISTRIES.map(m=><option key={m}>{m}</option>)}</select></div>
            <div className="form-row">
              <div className="form-group"><label>Role</label><select value={form.role} onChange={e=>set('role',e.target.value)}>{ROLES.map(r=><option key={r}>{r}</option>)}</select></div>
              <div className="form-group"><label>Status</label><select value={form.status} onChange={e=>set('status',e.target.value)}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
            </div>
            <div className="form-group"><label>Date Joined</label><input type="date" value={form.joined} onChange={e=>set('joined',e.target.value)} /></div>
            <div className="form-group">
              <label>Sacraments Received</label>
              <div className="checkbox-group">
                {[['baptized','💧 Baptism'],['firstCommunion','🍞 First Communion'],['confirmed','🕊️ Confirmation']].map(([k,l])=>(
                  <label key={k} className="checkbox-label">
                    <input type="checkbox" checked={form[k]} onChange={e=>set(k,e.target.checked)} style={{width:'auto',marginRight:'6px'}} />{l}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Skills</label>
              <div className="checkbox-group">
                {SKILLS.map(s=><label key={s} className="checkbox-label"><input type="checkbox" checked={form.skills.includes(s)} onChange={()=>set('skills',toggle(form.skills,s))} style={{width:'auto',marginRight:'6px'}} />{s}</label>)}
              </div>
            </div>
            <div className="form-group">
              <label>Availability</label>
              <div className="checkbox-group">
                {AVAILABILITIES.map(a=><label key={a} className="checkbox-label"><input type="checkbox" checked={form.availability.includes(a)} onChange={()=>set('availability',toggle(form.availability,a))} style={{width:'auto',marginRight:'6px'}} />{a}</label>)}
              </div>
            </div>
            <div style={{display:'flex',gap:'12px',marginTop:'12px'}}>
              <button className="btn-primary" style={{flex:1}} onClick={handleSave}>💾 Save Member</button>
              <button className="btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal isOpen={cfm.open} icon="🗃️" title={cfm.msg} confirmLabel={cfm.label} confirmColor={cfm.color} onConfirm={doCfm} onCancel={cancelCfm} />
    </div>
  );
}

// ─── PRIESTS TAB ────────────────────────────────────────────────────────────
function PriestsTab({ priests, addPriest, updatePriest, archivePriest }) {
  const [showForm, setShowForm] = useState(false);

  const [cfm, setCfm] = useState({ open:false, msg:'', label:'', color:'', action:null });
  const askConfirm = (msg, label, color, action) => setCfm({ open:true, msg, label, color, action });
  const doCfm = () => { cfm.action && cfm.action(); setCfm(s=>({...s,open:false})); };
  const cancelCfm = () => setCfm(s=>({...s,open:false}));
  const [editId, setEditId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const defaultForm = {
    title: 'Fr.', lastName:'', firstName:'', middleName:'', suffix:'', birthday:'',
    address:'', contact:'', email:'', specialization:'Parish Priest',
    assignedParish:'Metropolitan Cathedral of the Immaculate Conception, Zamboanga City',
    status:'Active', ordainedDate:'', notes:'', photo:'',
  };
  const [form, setForm] = useState(defaultForm);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const active = priests.filter(p => !p.archived);
  const filtered = search ? active.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())) : active;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const shown = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const openAdd = () => { setForm(defaultForm); setEditId(null); setShowForm(true); };
  const openEdit = (p) => { setForm({...p}); setEditId(p.id); setShowForm(true); };
  const handleSave = () => {
    if (!form.lastName || !form.firstName) { alert('Fill in required fields.'); return; }
    if (editId) updatePriest(editId, form);
    else addPriest(form);
    setShowForm(false);
  };
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('photo', reader.result);
    reader.readAsDataURL(file);
  };
  const getFullName = (p) => `${p.title} ${p.firstName} ${p.middleName ? p.middleName + ' ' : ''}${p.lastName}${p.suffix ? ' ' + p.suffix : ''}`;

  return (
    <div>
      <div className="pd-toolbar">
        <input placeholder="🔍 Search priest..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:'260px'}} />
        <button className="btn-primary" onClick={openAdd}>+ Add Priest</button>
      </div>

      <div style={{overflowX:'auto'}}>
        <table>
          <thead><tr><th>Photo</th><th>Full Name</th><th>Specialization</th><th>Assigned Parish</th><th>Status</th><th>Ordained</th><th>Actions</th></tr></thead>
          <tbody>
            {shown.length === 0
              ? <tr><td colSpan={7} style={{textAlign:'center',padding:'30px',color:'var(--text-light)'}}>No priests found.</td></tr>
              : shown.map(p => (
                <tr key={p.id} style={{cursor:'pointer'}} onClick={()=>setSelected(p)}>
                  <td>
                    {p.photo
                      ? <img src={p.photo} alt="" className="pd-avatar-sm" />
                      : <div className="pd-avatar-placeholder pd-priest-av">{p.title[0]}</div>
                    }
                  </td>
                  <td><strong>{getFullName(p)}</strong></td>
                  <td>{p.specialization}</td>
                  <td style={{maxWidth:'200px',fontSize:'0.85rem'}}>{p.assignedParish}</td>
                  <td><span className={`badge badge-${p.status === 'Active' ? 'active' : 'inactive'}`}>{p.status}</span></td>
                  <td>{p.ordainedDate}</td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div style={{display:'flex',gap:'6px'}}>
                      <button className="btn-secondary" style={{padding:'6px 10px',fontSize:'0.8rem'}} onClick={()=>openEdit(p)}>✏️ Edit</button>
                      <button className="btn-danger" style={{padding:'6px 10px',fontSize:'0.8rem'}} onClick={()=>askConfirm('Archive this priest record?','🗃️ Yes, Archive','var(--warning)',()=>archivePriest(p.id))}>🗃️ Archive</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({length:totalPages},(_,i)=><button key={i} className={page===i+1?'active':''} onClick={()=>setPage(i+1)}>{i+1}</button>)}
        </div>
      )}

      {/* Detail Modal */}
      {selected && !showForm && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal pd-detail-modal" onClick={e=>e.stopPropagation()}>
            <div className="pd-detail-header">
              {selected.photo
                ? <img src={selected.photo} alt="" className="pd-avatar-lg" />
                : <div className="pd-avatar-lg-placeholder pd-priest-av">{selected.title[0]}</div>
              }
              <div>
                <h2>{getFullName(selected)}</h2>
                <p style={{color:'var(--text-light)'}}>{selected.specialization}</p>
                <span className={`badge badge-${selected.status === 'Active' ? 'active' : 'inactive'}`}>{selected.status}</span>
              </div>
              <button className="close-panel" onClick={()=>setSelected(null)} style={{marginLeft:'auto'}}>✕</button>
            </div>
            <div className="pd-detail-body">
              <div className="pd-detail-grid">
                <div><span>Contact</span><strong>{selected.contact}</strong></div>
                <div><span>Email</span><strong>{selected.email || '—'}</strong></div>
                <div><span>Birthday</span><strong>{selected.birthday}</strong></div>
                <div><span>Ordained</span><strong>{selected.ordainedDate}</strong></div>
                <div style={{gridColumn:'1/-1'}}><span>Assigned Parish</span><strong>{selected.assignedParish}</strong></div>
                <div style={{gridColumn:'1/-1'}}><span>Address</span><strong>{selected.address}</strong></div>
              </div>
              {selected.notes && <div className="pd-detail-section"><span>Notes</span><p style={{marginTop:'6px',color:'var(--text-mid)'}}>{selected.notes}</p></div>}
            </div>
            <div style={{display:'flex',gap:'10px',padding:'0 0 4px'}}>
              <button className="btn-primary" style={{flex:1}} onClick={()=>{setSelected(null); openEdit(selected);}}>✏️ Edit</button>
              <button className="btn-secondary" onClick={()=>setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="modal-overlay" onClick={()=>setShowForm(false)}>
          <div className="modal pd-form-modal" onClick={e=>e.stopPropagation()}>
            <h2>{editId ? '✏️ Edit Priest Record' : '➕ Add Priest'}</h2>

            <div className="pd-photo-upload">
              {form.photo
                ? <img src={form.photo} alt="" className="pd-avatar-lg" />
                : <div className="pd-avatar-lg-placeholder pd-priest-av">✝</div>
              }
              <label className="btn-secondary" style={{cursor:'pointer',padding:'8px 16px',fontSize:'0.85rem'}}>
                📷 Upload Photo
                <input type="file" accept="image/*" style={{display:'none'}} onChange={handlePhoto} />
              </label>
            </div>

            <div className="form-row">
              <div className="form-group" style={{maxWidth:'120px'}}><label>Title</label><select value={form.title} onChange={e=>set('title',e.target.value)}>{PRIEST_TITLES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div className="form-group"><label>Last Name *</label><input value={form.lastName} onChange={e=>set('lastName',e.target.value)} /></div>
              <div className="form-group"><label>First Name *</label><input value={form.firstName} onChange={e=>set('firstName',e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Middle Name</label><input value={form.middleName} onChange={e=>set('middleName',e.target.value)} /></div>
              <div className="form-group"><label>Suffix</label><input placeholder="Jr., III..." value={form.suffix} onChange={e=>set('suffix',e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Birthday</label><input type="date" value={form.birthday} onChange={e=>set('birthday',e.target.value)} /></div>
              <div className="form-group"><label>Date Ordained</label><input type="date" value={form.ordainedDate} onChange={e=>set('ordainedDate',e.target.value)} /></div>
            </div>
            <div className="form-group"><label>Specialization</label><input value={form.specialization} onChange={e=>set('specialization',e.target.value)} /></div>
            <div className="form-group"><label>Assigned Parish</label><input value={form.assignedParish} onChange={e=>set('assignedParish',e.target.value)} /></div>
            <div className="form-group"><label>Status</label><select value={form.status} onChange={e=>set('status',e.target.value)}>{PRIEST_STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Address</label><input value={form.address} onChange={e=>set('address',e.target.value)} /></div>
            <div className="form-row">
              <div className="form-group"><label>Contact</label><input value={form.contact} onChange={e=>set('contact',e.target.value)} /></div>
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} /></div>
            </div>
            <div className="form-group"><label>Notes</label><textarea rows={2} value={form.notes} onChange={e=>set('notes',e.target.value)} /></div>
            <div style={{display:'flex',gap:'12px',marginTop:'12px'}}>
              <button className="btn-primary" style={{flex:1}} onClick={handleSave}>💾 Save Priest</button>
              <button className="btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal isOpen={cfm.open} icon="🗃️" title={cfm.msg} confirmLabel={cfm.label} confirmColor={cfm.color} onConfirm={doCfm} onCancel={cancelCfm} />
    </div>
  );
}

// ─── PARISHIONERS TAB ───────────────────────────────────────────────────────
function ParishionersTab({ parishioners, addParishioner, updateParishioner, archiveParishioner }) {
  const [showForm, setShowForm] = useState(false);

  const [cfm, setCfm] = useState({ open:false, msg:'', label:'', color:'', action:null });
  const askConfirm = (msg, label, color, action) => setCfm({ open:true, msg, label, color, action });
  const doCfm = () => { cfm.action && cfm.action(); setCfm(s=>({...s,open:false})); };
  const cancelCfm = () => setCfm(s=>({...s,open:false}));
  const [editId, setEditId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const defaultForm = {
    lastName:'', firstName:'', middleName:'', suffix:'', birthdate:'', birthplace:'', sex:'Male',
    fatherName:'', motherName:'', address:'', city:'Zamboanga City', province:'Zamboanga del Sur',
    contact:'', email:'', photo:'',
  };
  const [form, setForm] = useState(defaultForm);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const active = parishioners.filter(p => !p.archived);
  const filtered = search ? active.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())) : active;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const shown = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const openAdd = () => { setForm(defaultForm); setEditId(null); setShowForm(true); };
  const openEdit = (p) => { setForm({...p}); setEditId(p.id); setShowForm(true); };
  const handleSave = () => {
    if (!form.lastName || !form.firstName || !form.birthdate) { alert('Fill in required fields.'); return; }
    if (editId) updateParishioner(editId, form);
    else addParishioner(form);
    setShowForm(false);
  };
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('photo', reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="pd-toolbar">
        <input placeholder="🔍 Search parishioner..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:'260px'}} />
        <button className="btn-primary" onClick={openAdd}>+ Register Parishioner</button>
      </div>

      <div style={{overflowX:'auto'}}>
        <table>
          <thead><tr><th>Photo</th><th>Full Name</th><th>Sex</th><th>Birthdate</th><th>City</th><th>Contact</th><th>Actions</th></tr></thead>
          <tbody>
            {shown.length === 0
              ? <tr><td colSpan={7} style={{textAlign:'center',padding:'30px',color:'var(--text-light)'}}>No parishioners found.</td></tr>
              : shown.map(p => (
                <tr key={p.id} style={{cursor:'pointer'}} onClick={()=>setSelected(p)}>
                  <td>
                    {p.photo
                      ? <img src={p.photo} alt="" className="pd-avatar-sm" />
                      : <div className="pd-avatar-placeholder">{p.firstName[0]}{p.lastName[0]}</div>
                    }
                  </td>
                  <td><strong>{p.firstName} {p.middleName} {p.lastName}{p.suffix ? ' '+p.suffix : ''}</strong></td>
                  <td>{p.sex}</td>
                  <td>{p.birthdate}</td>
                  <td>{p.city}</td>
                  <td>{p.contact}</td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div style={{display:'flex',gap:'6px'}}>
                      <button className="btn-secondary" style={{padding:'6px 10px',fontSize:'0.8rem'}} onClick={()=>openEdit(p)}>✏️ Edit</button>
                      <button className="btn-danger" style={{padding:'6px 10px',fontSize:'0.8rem'}} onClick={()=>askConfirm('Archive this parishioner?','🗃️ Yes, Archive','var(--warning)',()=>archiveParishioner(p.id))}>🗃️ Archive</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({length:totalPages},(_,i)=><button key={i} className={page===i+1?'active':''} onClick={()=>setPage(i+1)}>{i+1}</button>)}
        </div>
      )}

      {/* Detail Modal */}
      {selected && !showForm && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal pd-detail-modal" onClick={e=>e.stopPropagation()}>
            <div className="pd-detail-header">
              {selected.photo
                ? <img src={selected.photo} alt="" className="pd-avatar-lg" />
                : <div className="pd-avatar-lg-placeholder">{selected.firstName[0]}{selected.lastName[0]}</div>
              }
              <div>
                <h2>{selected.firstName} {selected.middleName} {selected.lastName}{selected.suffix ? ' '+selected.suffix : ''}</h2>
                <p style={{color:'var(--text-light)'}}>{selected.sex} · Born {selected.birthdate}</p>
              </div>
              <button className="close-panel" onClick={()=>setSelected(null)} style={{marginLeft:'auto'}}>✕</button>
            </div>
            <div className="pd-detail-body">
              <div className="pd-detail-grid">
                <div><span>Birthplace</span><strong>{selected.birthplace}</strong></div>
                <div><span>Contact</span><strong>{selected.contact}</strong></div>
                <div><span>Email</span><strong>{selected.email || '—'}</strong></div>
                <div><span>City</span><strong>{selected.city}</strong></div>
                <div><span>Province</span><strong>{selected.province}</strong></div>
                <div style={{gridColumn:'1/-1'}}><span>Address</span><strong>{selected.address}</strong></div>
                <div><span>Father</span><strong>{selected.fatherName || '—'}</strong></div>
                <div><span>Mother</span><strong>{selected.motherName || '—'}</strong></div>
              </div>
            </div>
            <div style={{display:'flex',gap:'10px',padding:'0 0 4px'}}>
              <button className="btn-primary" style={{flex:1}} onClick={()=>{setSelected(null); openEdit(selected);}}>✏️ Edit</button>
              <button className="btn-secondary" onClick={()=>setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="modal-overlay" onClick={()=>setShowForm(false)}>
          <div className="modal pd-form-modal" onClick={e=>e.stopPropagation()}>
            <h2>{editId ? '✏️ Edit Parishioner' : '➕ Register Parishioner'}</h2>

            <div className="pd-photo-upload">
              {form.photo
                ? <img src={form.photo} alt="" className="pd-avatar-lg" />
                : <div className="pd-avatar-lg-placeholder">{form.firstName?.[0] || '?'}{form.lastName?.[0] || ''}</div>
              }
              <label className="btn-secondary" style={{cursor:'pointer',padding:'8px 16px',fontSize:'0.85rem'}}>
                📷 Upload Photo
                <input type="file" accept="image/*" style={{display:'none'}} onChange={handlePhoto} />
              </label>
            </div>

            <h3 className="form-section-title">Personal Information</h3>
            <div className="form-row">
              <div className="form-group"><label>Last Name *</label><input value={form.lastName} onChange={e=>set('lastName',e.target.value)} /></div>
              <div className="form-group"><label>First Name *</label><input value={form.firstName} onChange={e=>set('firstName',e.target.value)} /></div>
              <div className="form-group"><label>Middle Name</label><input value={form.middleName} onChange={e=>set('middleName',e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Suffix</label><input placeholder="Jr., Sr., III" value={form.suffix} onChange={e=>set('suffix',e.target.value)} /></div>
              <div className="form-group"><label>Birthdate *</label><input type="date" value={form.birthdate} onChange={e=>set('birthdate',e.target.value)} /></div>
              <div className="form-group"><label>Birthplace</label><input value={form.birthplace} onChange={e=>set('birthplace',e.target.value)} /></div>
            </div>
            <div className="form-group"><label>Sex</label><select value={form.sex} onChange={e=>set('sex',e.target.value)}><option>Male</option><option>Female</option></select></div>

            <h3 className="form-section-title">Family Information</h3>
            <div className="form-row">
              <div className="form-group"><label>Father's Full Name</label><input value={form.fatherName} onChange={e=>set('fatherName',e.target.value)} /></div>
              <div className="form-group"><label>Mother's Full Name (Maiden)</label><input value={form.motherName} onChange={e=>set('motherName',e.target.value)} /></div>
            </div>

            <h3 className="form-section-title">Contact Information</h3>
            <div className="form-group"><label>Address</label><input value={form.address} onChange={e=>set('address',e.target.value)} /></div>
            <div className="form-row">
              <div className="form-group"><label>City / Municipality</label><input value={form.city} onChange={e=>set('city',e.target.value)} /></div>
              <div className="form-group"><label>Province</label><input value={form.province} onChange={e=>set('province',e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Contact Number</label><input value={form.contact} onChange={e=>set('contact',e.target.value)} /></div>
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} /></div>
            </div>

            <div style={{display:'flex',gap:'12px',marginTop:'12px'}}>
              <button className="btn-primary" style={{flex:1}} onClick={handleSave}>💾 Save Parishioner</button>
              <button className="btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal isOpen={cfm.open} icon="🗃️" title={cfm.msg} confirmLabel={cfm.label} confirmColor={cfm.color} onConfirm={doCfm} onCancel={cancelCfm} />
    </div>
  );
}
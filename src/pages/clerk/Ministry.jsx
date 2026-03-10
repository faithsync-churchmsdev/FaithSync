import { useState } from 'react';
import ConfirmModal from '../../components/ConfirmModal';
import { useApp } from '../../AppContext';
import { MINISTRIES, ROLES, STATUSES, SKILLS, AVAILABILITIES } from '../../data/members';
import './Ministry.css';

const PAGE_SIZE = 8;

const defaultForm = {
  lastName:'', firstName:'', middleName:'', gender:'Male', birthday:'', birthplace:'', address:'', contact:'', email:'',
  ministry: MINISTRIES[0], role: ROLES[0], status: STATUSES[2], skills:[], availability:[], joined: new Date().toISOString().split('T')[0],
  baptized:false, confirmed:false, firstCommunion:false,
};

export default function Ministry() {
  const { members, addMember, updateMember, archiveMember } = useApp();
  const [showForm, setShowForm] = useState(false);

  const [cfm, setCfm] = useState({ open:false, msg:'', label:'', color:'', action:null });
  const askConfirm = (msg, label, color, action) => setCfm({ open:true, msg, label, color, action });
  const doCfm = () => { cfm.action && cfm.action(); setCfm(s=>({...s,open:false})); };
  const cancelCfm = () => setCfm(s=>({...s,open:false}));
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState('');
  const [filterMinistry, setFilterMinistry] = useState('');
  const [page, setPage] = useState(1);
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
  const openEdit = (m) => { setForm({...m}); setEditId(m.id); setShowForm(true); };

  const handleSave = () => {
    if (!form.lastName || !form.firstName) { alert('Fill in required fields.'); return; }
    if (editId) { updateMember(editId, form); }
    else { addMember(form); }
    setShowForm(false);
  };

  return (
    <div className="ministry-page">
      <div className="ministry-header">
        <div>
          <h1>🙏 Ministry Management</h1>
          <p>Manage parish ministry members and volunteers.</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Register Ministry Member</button>
      </div>

      <div className="ministry-filters">
        <input placeholder="🔍 Search member..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:'240px'}} />
        <select value={filterMinistry} onChange={e=>setFilterMinistry(e.target.value)} style={{maxWidth:'240px'}}>
          <option value="">All Ministries</option>
          {MINISTRIES.map(m=><option key={m}>{m}</option>)}
        </select>
      </div>

      <div style={{overflowX:'auto'}}>
        <table>
          <thead>
            <tr><th>Name</th><th>Gender</th><th>Ministry</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {shown.length === 0 ? <tr><td colSpan={7} style={{textAlign:'center',padding:'30px',color:'var(--text-light)'}}>No members found.</td></tr>
            : shown.map(m => (
              <tr key={m.id}>
                <td><strong>{m.firstName} {m.middleName} {m.lastName}</strong></td>
                <td>{m.gender}</td>
                <td>{m.ministry}</td>
                <td>{m.role}</td>
                <td><span className={`badge badge-${m.status.toLowerCase()}`}>{m.status}</span></td>
                <td>{m.joined}</td>
                <td>
                  <div style={{display:'flex',gap:'6px'}}>
                    <button className="btn-secondary" style={{padding:'6px 10px',fontSize:'0.8rem'}} onClick={()=>openEdit(m)}>✏️ Edit</button>
                    <button className="btn-danger" style={{padding:'6px 10px',fontSize:'0.8rem'}} onClick={()=>askConfirm('Archive this member?','🗃️ Yes, Archive','var(--warning)',()=>archiveMember(m.id))}>🗃️</button>
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

      {showForm && (
        <div className="modal-overlay" onClick={()=>setShowForm(false)}>
          <div className="modal ministry-modal" onClick={e=>e.stopPropagation()}>
            <h2>{editId ? '✏️ Edit Member' : '➕ Register Member'}</h2>

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

            <div className="form-group">
              <label>Sacraments Received</label>
              <div className="checkbox-group">
                {[['baptized','Baptism'],['firstCommunion','First Communion'],['confirmed','Confirmation']].map(([k,l])=>(
                  <label key={k} className="checkbox-label">
                    <input type="checkbox" checked={form[k]} onChange={e=>set(k,e.target.checked)} style={{width:'auto',marginRight:'6px'}} />
                    {l}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Skills</label>
              <div className="checkbox-group">
                {SKILLS.map(s=>(
                  <label key={s} className="checkbox-label">
                    <input type="checkbox" checked={form.skills.includes(s)} onChange={()=>set('skills',toggle(form.skills,s))} style={{width:'auto',marginRight:'6px'}} />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Availability</label>
              <div className="checkbox-group">
                {AVAILABILITIES.map(a=>(
                  <label key={a} className="checkbox-label">
                    <input type="checkbox" checked={form.availability.includes(a)} onChange={()=>set('availability',toggle(form.availability,a))} style={{width:'auto',marginRight:'6px'}} />
                    {a}
                  </label>
                ))}
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
import { useState } from 'react';
import { useApp } from '../../AppContext';
import ConfirmModal from '../../components/ConfirmModal';
import { useConfirm } from '../../hooks/useConfirm';
import './RecordsManager.css';

const SUB_PAGES = ['Dashboard','Baptism','First Communion','Confirmation','Marriage','Funeral','Reports'];

const RELIGIONS = ['Catholic', 'Other Christian', 'Non-Christian', 'Unknown'];
const LOCATIONS = ['Main Chapel','Baptistry','Side Chapel','Parish Hall','Main Church','Function Room','Other (please specify)'];
const BURIAL_TYPES = ['Cemetery','Mausoleum','Columbarium','Other'];

// ── Ordinal date ──────────────────────────────────────────────────────────────
const ordinalDate = (str) => {
  if (!str) return 'N/A';
  const d = new Date(str);
  const n = d.getDate();
  const s = ['th','st','nd','rd'], v = n % 100;
  return `${n + (s[(v-20)%10] || s[v] || s[0])} day of ${d.toLocaleDateString('en-US',{month:'long'})}, ${d.getFullYear()}`;
};

// ── Auto register number ───────────────────────────────────────────────────────
const genReg = (prefix, list, dateKey) => {
  const y = new Date().getFullYear();
  const count = list.filter(r => r[dateKey]?.startsWith(String(y))).length;
  return `${prefix}-${y}-${String(count+1).padStart(3,'0')}`;
};

// ── Printable Certificate ─────────────────────────────────────────────────────
function Certificate({ id, title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal cert-modal" onClick={e=>e.stopPropagation()}>
        <div className="cert-top-bar">
          <h3>📜 {title}</h3>
          <div style={{display:'flex',gap:'10px'}}>
            <button className="btn-primary" onClick={()=>window.print()}>🖨️ Print / Save PDF</button>
            <button className="close-panel" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="cert-wrap">
          <div id={id} className="certificate-doc">{children}</div>
        </div>
        <p className="cert-tip">💡 Tip: Click "Print / Save PDF" → choose "Save as PDF" in the print dialog to download.</p>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #${id}, #${id} * { visibility: visible; }
            #${id} { position:absolute; left:0; top:0; width:100%; }
            .cert-top-bar, .cert-tip { display:none !important; }
          }
        `}</style>
      </div>
    </div>
  );
}

// ── View Modal wrapper ────────────────────────────────────────────────────────
function ViewModal({ color, icon, title, subtitle, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal rec-view-modal" onClick={e=>e.stopPropagation()}>
        <div className="rec-view-header" style={{background:color}}>
          <span style={{fontSize:'2.2rem'}}>{icon}</span>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
          <button className="close-panel rec-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="rec-view-body">{children}</div>
      </div>
    </div>
  );
}

// ── Detail item ───────────────────────────────────────────────────────────────
function D({ label, value }) {
  return (
    <div className="rec-detail-item">
      <span className="rec-detail-label">{label}</span>
      <span className="rec-detail-value">{value || '—'}</span>
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SL({ children }) {
  return <div className="form-section-label">{children}</div>;
}

// ── Priest dropdown ───────────────────────────────────────────────────────────
function PriestSelect({ value, onChange, customValue, onCustomChange }) {
  const { priests } = useApp();
  const active = priests.filter(p => !p.archived && p.status === 'Active');
  return (
    <>
      <select value={value} onChange={onChange}>
        <option value="">— None / TBA —</option>
        {active.map(p => <option key={p.id} value={`${p.title} ${p.firstName} ${p.lastName}`}>{p.title} {p.firstName} {p.lastName}</option>)}
        <option value="manual">Other (please specify)</option>
      </select>
      {value === 'manual' && <input style={{marginTop:'8px'}} placeholder="Enter name..." value={customValue} onChange={onCustomChange} />}
    </>
  );
}

// ── Parishioner quick-select from Parish Directory ────────────────────────────
function ParishionerSelect({ label = 'Select Parishioner from Directory', onSelect }) {
  const { parishioners } = useApp();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const active = parishioners.filter(p => !p.archived);
  const filtered = !query ? active : active.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div style={{ marginBottom: '8px', position: 'relative' }}>
      <button type="button" className="btn-secondary" style={{ fontSize: '0.82rem', padding: '6px 12px' }} onClick={() => setOpen(o => !o)}>
        👥 {label}
      </button>
      {open && (
        <div className="parish-select-dropdown">
          <input autoFocus placeholder="Search parishioner..." value={query} onChange={e => setQuery(e.target.value)} style={{ marginBottom: '8px' }} />
          <div className="parish-select-list">
            {filtered.length === 0 && <p style={{ color: 'var(--text-light)', fontSize: '0.82rem', padding: '6px' }}>No parishioners found.</p>}
            {filtered.map(p => (
              <div key={p.id} className="parish-select-item" onClick={() => { onSelect(p); setOpen(false); setQuery(''); }}>
                <strong>{p.firstName} {p.lastName}</strong>
                <span>{p.sex} · {p.birthdate}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


function LocationSelect({ value, onChange, customValue, onCustomChange }) {
  return (
    <>
      <select value={value} onChange={onChange}>
        {LOCATIONS.map(l => <option key={l}>{l}</option>)}
      </select>
      {value === 'Other (please specify)' && <input style={{marginTop:'8px'}} placeholder="Specify location..." value={customValue} onChange={onCustomChange} />}
    </>
  );
}

// ── Search bar ────────────────────────────────────────────────────────────────
function SearchBar({ value, onChange }) {
  return (
    <input className="search-bar" placeholder="🔍 Search records..." value={value} onChange={e => onChange(e.target.value)} />
  );
}

// ── Table action buttons ──────────────────────────────────────────────────────
function RecordActions({ onView, onEdit, onPrint, onArchive }) {
  return (
    <div className="rec-actions" onClick={e=>e.stopPropagation()}>
      <button className="btn-view-sm" onClick={onView} title="View">👁️ View</button>
      <button className="btn-edit-sm" onClick={onEdit} title="Edit">✏️ Edit</button>
      <button className="btn-print-sm" onClick={onPrint} title="Print Certificate">📜 Print</button>
      <button className="btn-archive-sm" onClick={onArchive} title="Archive">🗃️ Archive</button>
    </div>
  );
}

// ── Mass scheduling helper ────────────────────────────────────────────────────
function MassScheduleFields({ scheduleMass, onChange, massDate, massTime, massLocation, customLocation, onCustomLocation }) {
  return (
    <div className="mass-schedule-box">
      <SL>⛪ Schedule Mass for This?</SL>
      <label className="check-label">
        <input type="checkbox" checked={scheduleMass} onChange={e=>onChange('scheduleMass',e.target.checked)} style={{width:'auto'}} />
        Yes, add this to the parish calendar
      </label>
      {scheduleMass && (
        <div className="form-row" style={{marginTop:'10px'}}>
          <div className="form-group"><label>Mass Date</label><input type="date" value={massDate} onChange={e=>onChange('massDate',e.target.value)} /></div>
          <div className="form-group"><label>Time</label><input type="time" value={massTime} onChange={e=>onChange('massTime',e.target.value)} /></div>
          <div className="form-group">
            <label>Location</label>
            <LocationSelect value={massLocation} onChange={e=>onChange('massLocation',e.target.value)} customValue={customLocation} onCustomChange={e=>onChange('customLocation',e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function RecordsManager() {
  const [sub, setSub] = useState('Dashboard');
  const { baptisms, confirmations, firstCommunions, marriages, funerals, parishioners } = useApp();

  const renderSub = () => {
    switch(sub) {
      case 'Dashboard': return <RecordsDashboard setSub={setSub} />;
      case 'Baptism': return <BaptismPage />;
      case 'First Communion': return <FirstCommunionPage />;
      case 'Confirmation': return <ConfirmationPage />;
      case 'Marriage': return <MarriagePage />;
      case 'Funeral': return <FuneralPage />;
      case 'Reports': return <ReportsPage />;
      default: return null;
    }
  };

  return (
    <div className="records-page">
      <div className="records-subnav">
        {SUB_PAGES.map(s => (
          <button key={s} className={`subnav-btn${sub===s?' active':''}`} onClick={()=>setSub(s)}>{s}</button>
        ))}
      </div>
      <div className="records-content">{renderSub()}</div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function RecordsDashboard({ setSub }) {
  const { baptisms, confirmations, firstCommunions, marriages, funerals, parishioners } = useApp();
  const active = (arr) => arr.filter(r=>!r.archived);
  const now = new Date();
  const thisMonth = (arr, key) => arr.filter(r => {
    const d = new Date(r[key]); return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();
  });
  const stats = [
    { label:'Baptisms', value:active(baptisms).length, icon:'💧', sub:'Baptism', color:'#3b9fd1' },
    { label:'1st Communions', value:active(firstCommunions).length, icon:'🍞', sub:'First Communion', color:'#c47d1e' },
    { label:'Confirmations', value:active(confirmations).length, icon:'🕊️', sub:'Confirmation', color:'#7c4dab' },
    { label:'Marriages', value:active(marriages).length, icon:'💍', sub:'Marriage', color:'#c0392b' },
    { label:'Funeral Records', value:active(funerals).length, icon:'🕯️', sub:'Funeral', color:'#555e6e' },
    { label:'Parishioners', value:parishioners.filter(p=>!p.archived).length, icon:'👥', sub:null, color:'#27ae60' },
  ];
  const recentBaptisms = [...active(baptisms)].sort((a,b)=>new Date(b.baptismDate)-new Date(a.baptismDate)).slice(0,3);
  const recentMarriages = [...active(marriages)].sort((a,b)=>new Date(b.weddingDate)-new Date(a.weddingDate)).slice(0,3);
  return (
    <div>
      <h2 style={{marginBottom:'20px'}}>📋 Records Overview</h2>
      <div className="stats-grid">
        {stats.map(s=>(
          <div key={s.label} className={`stat-card${s.sub?' stat-clickable':''}`} style={{borderTop:`4px solid ${s.color}`,cursor:s.sub?'pointer':'default'}} onClick={()=>s.sub&&setSub(s.sub)}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            {s.sub && <div style={{fontSize:'0.75rem',color:'var(--primary)',marginTop:'4px'}}>Click to view →</div>}
          </div>
        ))}
      </div>
      <div className="rec-dash-grid">
        <div className="card">
          <h3 style={{marginBottom:'12px'}}>💧 Recent Baptisms</h3>
          {recentBaptisms.length===0 ? <p className="no-data-sm">No baptisms yet.</p> : (
            <table><thead><tr><th>Child</th><th>Date</th><th>Priest</th></tr></thead>
            <tbody>{recentBaptisms.map(b=><tr key={b.id}><td>{b.childName}</td><td>{b.baptismDate}</td><td>{b.priest||'—'}</td></tr>)}</tbody></table>
          )}
          <button className="btn-secondary" style={{marginTop:'10px',width:'100%'}} onClick={()=>setSub('Baptism')}>View All →</button>
        </div>
        <div className="card">
          <h3 style={{marginBottom:'12px'}}>💍 Recent Marriages</h3>
          {recentMarriages.length===0 ? <p className="no-data-sm">No marriages yet.</p> : (
            <table><thead><tr><th>Groom</th><th>Bride</th><th>Date</th></tr></thead>
            <tbody>{recentMarriages.map(m=><tr key={m.id}><td>{m.groomName}</td><td>{m.brideName}</td><td>{m.weddingDate}</td></tr>)}</tbody></table>
          )}
          <button className="btn-secondary" style={{marginTop:'10px',width:'100%'}} onClick={()=>setSub('Marriage')}>View All →</button>
        </div>
      </div>
      <div className="rec-month-grid">
        <div className="card"><h4>💧 Baptisms This Month</h4><div className="month-count">{thisMonth(baptisms,'baptismDate').length}</div></div>
        <div className="card"><h4>💍 Weddings This Month</h4><div className="month-count">{thisMonth(marriages,'weddingDate').length}</div></div>
        <div className="card"><h4>🕯️ Funerals This Month</h4><div className="month-count">{thisMonth(funerals,'funeralMassDate').length}</div></div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BAPTISM
// ══════════════════════════════════════════════════════════════════════════════
const emptyBaptism = {
  id: null, childName:'', childBirthDate:'', childBirthPlace:'', childGender:'',
  fatherName:'', fatherReligion:'Catholic', motherName:'', motherReligion:'Catholic',
  parentsAddress:'', parentsPhone:'', parentsMarriedInChurch:true,
  godparents:[{name:'',gender:'male',religion:'Catholic'}],
  baptismDate:'', baptismTime:'', location:LOCATIONS[0], customLocation:'',
  priest:'', customPriest:'', includeMass:true,
  birthCertificateSubmitted:false, marriageCertificateSubmitted:false,
  registerNumber:'', certificateIssued:false, status:'application', notes:'',
  scheduleMass:false, massDate:'', massTime:'', massLocation:LOCATIONS[0], customMassLocation:''
};

function BaptismPage() {
  const { baptisms, addBaptism, archiveBaptism } = useApp();
  const { confirmState, confirm, handleConfirm, handleCancel } = useConfirm();
  const { addEvent } = useApp();
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [viewRec, setViewRec] = useState(null);
  const [certRec, setCertRec] = useState(null);
  const [f, setF] = useState(emptyBaptism);
  const set = (k,v) => { setF(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:''})); };

  const records = baptisms.filter(b=>!b.archived && (
    !search || b.childName?.toLowerCase().includes(search.toLowerCase()) ||
    b.fatherName?.toLowerCase().includes(search.toLowerCase()) ||
    b.motherName?.toLowerCase().includes(search.toLowerCase()) ||
    b.registerNumber?.toLowerCase().includes(search.toLowerCase())
  ));

  const openAdd = () => { setF({...emptyBaptism, registerNumber:genReg('B',baptisms.filter(b=>!b.archived),'baptismDate')}); setShow(true); };
  const openEdit = (r) => { setF({...emptyBaptism,...r, customPriest:'', customLocation:'', customMassLocation:''}); setShow(true); };

  const addGP = () => setF(p=>({...p,godparents:[...p.godparents,{name:'',gender:'male',religion:'Catholic'}]}));
  const removeGP = (i) => { if(f.godparents.length>1) setF(p=>({...p,godparents:p.godparents.filter((_,x)=>x!==i)})); };
  const setGP = (i,k,v) => { const g=[...f.godparents]; g[i][k]=v; setF(p=>({...p,godparents:g})); };

  const handleSubmit = () => {
    if(!f.childName||!f.baptismDate){ setErrors({childName:!f.childName?'Required':'',baptismDate:!f.baptismDate?'Required':''}); return; }
    const priest = f.priest==='manual' ? f.customPriest : f.priest;
    const location = f.location==='Other (please specify)' ? f.customLocation : f.location;
    const record = {...f, priest, location, id: f.id||Date.now(), archived:false};
    addBaptism(record);
    if(f.scheduleMass && f.massDate) {
      const massLoc = f.massLocation==='Other (please specify)' ? f.customMassLocation : f.massLocation;
      addEvent({ title:`Baptism Mass: ${f.childName}`, date:f.massDate, time:f.massTime, type:'baptism', location:massLoc, priest, status:'approved', done:false });
    }
    setShow(false);
    alert(f.id ? '✅ Baptism record updated!' : '✅ Baptism record added!');
  };

  const doArchive = async (r) => { const ok = await confirm({ icon:'🗃️', title:`Archive this baptism record?`, message:`"${r.childName}" will be moved to Archives.`, confirmLabel:'🗃️ Yes, Archive', confirmColor:'var(--warning)' }); if(ok) archiveBaptism(r.id); };

  return (
    <div>
      <div className="rec-page-header">
        <h2>💧 Baptism Records</h2>
        <button className="btn-primary" onClick={openAdd}>💧 Record New Baptism</button>
      </div>
      <SearchBar value={search} onChange={setSearch} />
      <div className="card" style={{overflowX:'auto',marginTop:'12px'}}>
        <table>
          <thead><tr><th>Register No.</th><th>Child's Name</th><th>Baptism Date</th><th>Time</th><th>Parents</th><th>Godparents</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {records.length===0
              ? <tr><td colSpan={9} className="empty-td">No baptism records found. Click "Record New Baptism" to add one.</td></tr>
              : records.map(r=>(
                <tr key={r.id} className="clickable-row" onClick={()=>setViewRec(r)}>
                  <td><strong>{r.registerNumber||'Pending'}</strong></td>
                  <td>{r.childName}</td>
                  <td>{r.baptismDate}</td>
                  <td>{r.baptismTime||'—'}</td>
                  <td>{r.fatherName||'—'} & {r.motherName||'—'}</td>
                  <td>{r.godparents?.length||0} godparent{r.godparents?.length!==1?'s':''}</td>
                  <td>{r.location}</td>
                  <td><span className={`badge ${r.certificateIssued?'badge-active':'badge-pending'}`}>{r.certificateIssued?'Cert. Issued':'Pending'}</span></td>
                  <td><RecordActions onView={()=>setViewRec(r)} onEdit={()=>openEdit(r)} onPrint={()=>setCertRec(r)} onArchive={()=>doArchive(r)} /></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* VIEW */}
      {viewRec && (
        <ViewModal color="linear-gradient(135deg,#3b9fd1,#1a6fb5)" icon="💧" title={viewRec.childName} subtitle={`Baptism Record · ${viewRec.registerNumber||'No Register No.'}`} onClose={()=>setViewRec(null)}>
          <div className="rec-detail-grid">
            <D label="Register No." value={viewRec.registerNumber} />
            <D label="Child's Name" value={viewRec.childName} />
            <D label="Birth Date" value={viewRec.childBirthDate} />
            <D label="Birth Place" value={viewRec.childBirthPlace} />
            <D label="Gender" value={viewRec.childGender} />
            <D label="Baptism Date" value={viewRec.baptismDate} />
            <D label="Time" value={viewRec.baptismTime} />
            <D label="Location" value={viewRec.location} />
            <D label="Priest" value={viewRec.priest} />
            <D label="Father" value={`${viewRec.fatherName} (${viewRec.fatherReligion})`} />
            <D label="Mother" value={`${viewRec.motherName} (${viewRec.motherReligion})`} />
            <D label="Parents Address" value={viewRec.parentsAddress} />
            <D label="Parents Phone" value={viewRec.parentsPhone} />
            <D label="Married in Church" value={viewRec.parentsMarriedInChurch?'✅ Yes':'❌ No'} />
            <D label="Godparents" value={viewRec.godparents?.map(g=>`${g.name} (${g.gender==='male'?'Ninong':'Ninang'})`).join(', ')} />
            <D label="Birth Cert." value={viewRec.birthCertificateSubmitted?'✅ Submitted':'❌ Pending'} />
            <D label="Marriage Cert." value={viewRec.marriageCertificateSubmitted?'✅ Submitted':'❌ Pending'} />
            <D label="Certificate" value={viewRec.certificateIssued?'✅ Issued':'Pending'} />
            <D label="Mass Scheduled" value={viewRec.scheduleMass?`✅ ${viewRec.massDate} ${viewRec.massTime}`:'❌ No'} />
            {viewRec.notes && <D label="Notes" value={viewRec.notes} />}
          </div>
          <div style={{display:'flex',gap:'10px',marginTop:'16px',flexWrap:'wrap'}}>
            <button className="btn-primary" onClick={()=>{setViewRec(null);setCertRec(viewRec);}}>📜 View Certificate</button>
            <button className="btn-secondary" onClick={()=>{setViewRec(null);openEdit(viewRec);}}>✏️ Edit</button>
            <button className="btn-archive" onClick={()=>{setViewRec(null);doArchive(viewRec);}}>🗃️ Archive</button>
            <button className="btn-secondary" onClick={()=>setViewRec(null)}>Close</button>
          </div>
        </ViewModal>
      )}

      {/* CERTIFICATE */}
      {certRec && (
        <Certificate id="baptism-cert" title="Certificate of Baptism" onClose={()=>setCertRec(null)}>
          <div className="cert-body">
            <div className="cert-title">CERTIFICATE OF BAPTISM</div>
            <div className="cert-church">Metropolitan Cathedral of the Immaculate Conception<br/>Zamboanga City, Philippines</div>
            <div className="cert-cross">✝</div>
            <p className="cert-intro">This is to certify that:</p>
            <table className="cert-table"><tbody>
              <tr><td className="cl">Name of Child</td><td className="cv">{certRec.childName}</td></tr>
              <tr><td className="cl">Date of Birth</td><td className="cv">{certRec.childBirthDate}</td></tr>
              <tr><td className="cl">Place of Birth</td><td className="cv">{certRec.childBirthPlace||'N/A'}</td></tr>
              <tr><td className="cl">Name of Father</td><td className="cv">{certRec.fatherName||'N/A'}</td></tr>
              <tr><td className="cl">Name of Mother</td><td className="cv">{certRec.motherName||'N/A'}</td></tr>
              <tr><td className="cl">Godparents</td><td className="cv">{certRec.godparents?.map(g=>g.name).filter(Boolean).join(', ')||'N/A'}</td></tr>
            </tbody></table>
            <p className="cert-main">was baptized according to the rites of the Roman Catholic Church<br/>on the <strong>{ordinalDate(certRec.baptismDate)}</strong><br/>at <strong>{certRec.location||'N/A'}</strong>.</p>
            <div className="cert-footer">
              <div className="cert-sig"><div className="cert-sig-line"/><div>Celebrating Priest<br/><strong>{certRec.priest||'To be assigned'}</strong></div></div>
              <div className="cert-reg">Register No.: <strong>{certRec.registerNumber||'Pending'}</strong><br/>Issued: {new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</div>
            </div>
          </div>
        </Certificate>
      )}

      {/* FORM */}
      {show && (
        <div className="modal-overlay" onClick={()=>setShow(false)}>
          <div className="modal rec-form-modal" onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <h2>{f.id?'✏️ Edit Baptism Record':'💧 Record New Baptism'}</h2>
              <button className="close-panel" onClick={()=>setShow(false)}>✕</button>
            </div>

            {!f.id && (
              <div className="register-badge">
                <span>📋 Auto Register Number:</span>
                <strong>{f.registerNumber}</strong>
                <small>This will be assigned to this baptism record.</small>
              </div>
            )}

            <SL>👶 Child's Information</SL>
            <ParishionerSelect label="Auto-fill Child from Parish Directory" onSelect={p => {
              set('childName', `${p.firstName} ${p.lastName}`);
              set('childBirthDate', p.birthdate || '');
              set('childBirthPlace', p.birthplace || '');
              set('childGender', p.sex || '');
              set('fatherName', p.fatherName || '');
              set('motherName', p.motherName || '');
            }} />
            <div className="form-row">
              <div className="form-group"><label>Child's Full Name *</label><input placeholder="e.g., Juan Carlos Dela Cruz" value={f.childName} onChange={e=>set('childName',e.target.value)} /></div>
              <div className="form-group"><label>Gender *</label><select value={f.childGender} onChange={e=>set('childGender',e.target.value)}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Date of Birth *</label><input type="date" value={f.childBirthDate} onChange={e=>set('childBirthDate',e.target.value)} /></div>
              <div className="form-group"><label>Place of Birth</label><input placeholder="e.g., Zamboanga City Medical Center" value={f.childBirthPlace} onChange={e=>set('childBirthPlace',e.target.value)} /></div>
            </div>

            <SL>👨‍👩‍👦 Parents' Information</SL>
            <div className="form-row">
              <div className="form-group"><label>Father's Full Name *</label><input placeholder="e.g., Roberto Santos" value={f.fatherName} onChange={e=>set('fatherName',e.target.value)} /></div>
              <div className="form-group"><label>Father's Religion</label><select value={f.fatherReligion} onChange={e=>set('fatherReligion',e.target.value)}>{RELIGIONS.map(r=><option key={r}>{r}</option>)}</select></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Mother's Full Name *</label><input placeholder="e.g., Maria Santos" value={f.motherName} onChange={e=>set('motherName',e.target.value)} /></div>
              <div className="form-group"><label>Mother's Religion</label><select value={f.motherReligion} onChange={e=>set('motherReligion',e.target.value)}>{RELIGIONS.map(r=><option key={r}>{r}</option>)}</select></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Home Address</label><input value={f.parentsAddress} onChange={e=>set('parentsAddress',e.target.value)} /></div>
              <div className="form-group"><label>Contact Number</label><input value={f.parentsPhone} onChange={e=>set('parentsPhone',e.target.value)} /></div>
            </div>
            <label className="check-label"><input type="checkbox" checked={f.parentsMarriedInChurch} onChange={e=>set('parentsMarriedInChurch',e.target.checked)} style={{width:'auto'}} /> Parents married in the Catholic Church</label>

            <SL>🙏 Godparents (Ninong/Ninang)</SL>
            {f.godparents.map((gp,i)=>(
              <div key={i} className="godparent-row">
                <div className="form-row" style={{flex:1}}>
                  <div className="form-group"><label>Name</label><input placeholder="Godparent's full name" value={gp.name} onChange={e=>setGP(i,'name',e.target.value)} /></div>
                  <div className="form-group"><label>Role</label><select value={gp.gender} onChange={e=>setGP(i,'gender',e.target.value)}><option value="male">Ninong (Godfather)</option><option value="female">Ninang (Godmother)</option></select></div>
                  <div className="form-group"><label>Religion</label><select value={gp.religion} onChange={e=>setGP(i,'religion',e.target.value)}>{RELIGIONS.map(r=><option key={r}>{r}</option>)}</select></div>
                </div>
                {f.godparents.length>1 && <button className="btn-danger" style={{padding:'6px 10px',alignSelf:'flex-end',marginBottom:'12px'}} onClick={()=>removeGP(i)}>✕</button>}
              </div>
            ))}
            <button className="btn-secondary" style={{width:'100%',marginBottom:'12px'}} onClick={addGP}>+ Add Godparent</button>

            <SL>✝️ Baptism Details</SL>
            <div className="form-row">
              <div className="form-group"><label>Baptism Date *</label><input type="date" value={f.baptismDate} onChange={e=>set('baptismDate',e.target.value)} /></div>
              <div className="form-group"><label>Time</label><input type="time" value={f.baptismTime} onChange={e=>set('baptismTime',e.target.value)} /></div>
            </div>
            <div className="form-group"><label>Location</label><LocationSelect value={f.location} onChange={e=>set('location',e.target.value)} customValue={f.customLocation} onCustomChange={e=>set('customLocation',e.target.value)} /></div>
            <div className="form-group"><label>Officiating Priest</label><PriestSelect value={f.priest} onChange={e=>set('priest',e.target.value)} customValue={f.customPriest} onCustomChange={e=>set('customPriest',e.target.value)} /></div>
            <label className="check-label"><input type="checkbox" checked={f.includeMass} onChange={e=>set('includeMass',e.target.checked)} style={{width:'auto'}} /> Include Mass with Baptism</label>

            <SL>📄 Documents Submitted</SL>
            <label className="check-label"><input type="checkbox" checked={f.birthCertificateSubmitted} onChange={e=>set('birthCertificateSubmitted',e.target.checked)} style={{width:'auto'}} /> Birth Certificate Submitted</label>
            <label className="check-label"><input type="checkbox" checked={f.marriageCertificateSubmitted} onChange={e=>set('marriageCertificateSubmitted',e.target.checked)} style={{width:'auto'}} /> Parents' Marriage Certificate Submitted</label>
            <label className="check-label"><input type="checkbox" checked={f.certificateIssued} onChange={e=>set('certificateIssued',e.target.checked)} style={{width:'auto'}} /> Baptism Certificate Issued</label>

            <MassScheduleFields scheduleMass={f.scheduleMass} onChange={set} massDate={f.massDate} massTime={f.massTime} massLocation={f.massLocation} customLocation={f.customMassLocation} onCustomLocation={e=>set('customMassLocation',e.target.value)} />

            <div className="form-group"><label>Register Number</label><input value={f.registerNumber} onChange={e=>set('registerNumber',e.target.value)} placeholder="Auto-generated" /></div>
            <div className="form-group"><label>Notes</label><textarea rows={2} value={f.notes} onChange={e=>set('notes',e.target.value)} /></div>
            <div style={{display:'flex',gap:'12px',marginTop:'12px'}}>
              <button className="btn-primary" style={{flex:1}} onClick={handleSubmit}>💾 Save Record</button>
              <button className="btn-secondary" onClick={()=>setShow(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FIRST COMMUNION
// ══════════════════════════════════════════════════════════════════════════════
const emptyFC = {
  id:null, childName:'', childBirthDate:'', childGender:'',
  baptismDate:'', baptismChurch:LOCATIONS[0],
  fatherName:'', motherName:'', parentsAddress:'', parentsPhone:'',
  catechismClass:'', catechismTeacher:'', classesCompleted:false, retreatAttended:false,
  firstCommunionDate:'', firstCommunionMass:'', celebrantPriest:'', customPriest:'',
  godparents:'', notes:'', registerNumber:'', certificateIssued:false, status:'registered',
  scheduleMass:false, massDate:'', massTime:'', massLocation:LOCATIONS[0], customMassLocation:''
};

function FirstCommunionPage() {
  const { firstCommunions, addFirstCommunion, archiveFirstCommunion, addEvent } = useApp();
  const { confirmState, confirm, handleConfirm, handleCancel } = useConfirm();
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [viewRec, setViewRec] = useState(null);
  const [certRec, setCertRec] = useState(null);
  const [f, setF] = useState(emptyFC);
  const set = (k,v) => { setF(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:''})); };

  const records = firstCommunions.filter(r=>!r.archived && (
    !search || r.childName?.toLowerCase().includes(search.toLowerCase()) ||
    r.fatherName?.toLowerCase().includes(search.toLowerCase()) ||
    r.registerNumber?.toLowerCase().includes(search.toLowerCase())
  ));

  const openAdd = () => { setF({...emptyFC, registerNumber:genReg('FC',firstCommunions.filter(r=>!r.archived),'firstCommunionDate')}); setShow(true); };
  const openEdit = (r) => { setF({...emptyFC,...r, customPriest:'', customMassLocation:''}); setShow(true); };

  const handleSubmit = () => {
    if(!f.childName||!f.firstCommunionDate){ setErrors({childName:!f.childName?'Required':'',firstCommunionDate:!f.firstCommunionDate?'Required':''}); return; }
    const priest = f.celebrantPriest==='manual' ? f.customPriest : f.celebrantPriest;
    const record = {...f, celebrantPriest:priest, id:f.id||Date.now(), archived:false};
    addFirstCommunion(record);
    if(f.scheduleMass && f.massDate) {
      const massLoc = f.massLocation==='Other (please specify)' ? f.customMassLocation : f.massLocation;
      addEvent({ title:`1st Communion Mass: ${f.childName}`, date:f.massDate, time:f.massTime, type:'communion', location:massLoc, priest, status:'approved', done:false });
    }
    setShow(false);
    alert(f.id?'✅ Record updated!':'✅ First Communion registered!');
  };

  const doArchive = async (r) => { const ok = await confirm({ icon:'🗃️', title:`Archive this First Communion record?`, message:`"${r.childName}" will be moved to Archives.`, confirmLabel:'🗃️ Yes, Archive', confirmColor:'var(--warning)' }); if(ok) archiveFirstCommunion(r.id); };

  return (
    <div>
      <div className="rec-page-header">
        <h2>🍞 First Communion Records</h2>
        <button className="btn-primary" onClick={openAdd}>🍞 Register New</button>
      </div>
      <SearchBar value={search} onChange={setSearch} />
      <div className="card" style={{overflowX:'auto',marginTop:'12px'}}>
        <table>
          <thead><tr><th>Register No.</th><th>Child's Name</th><th>Communion Date</th><th>Priest</th><th>Catechism</th><th>Retreat</th><th>Certificate</th><th>Actions</th></tr></thead>
          <tbody>
            {records.length===0
              ? <tr><td colSpan={8} className="empty-td">No First Communion records yet. Click "Register New" to add one.</td></tr>
              : records.map(r=>(
                <tr key={r.id} className="clickable-row" onClick={()=>setViewRec(r)}>
                  <td><strong>{r.registerNumber||'Pending'}</strong></td>
                  <td>{r.childName}</td>
                  <td>{r.firstCommunionDate}</td>
                  <td>{r.celebrantPriest||'—'}</td>
                  <td>{r.classesCompleted?'✅ Done':'❌ Pending'}</td>
                  <td>{r.retreatAttended?'✅ Yes':'❌ No'}</td>
                  <td><span className={`badge ${r.certificateIssued?'badge-active':'badge-pending'}`}>{r.certificateIssued?'Issued':'Pending'}</span></td>
                  <td><RecordActions onView={()=>setViewRec(r)} onEdit={()=>openEdit(r)} onPrint={()=>setCertRec(r)} onArchive={()=>doArchive(r)} /></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {viewRec && (
        <ViewModal color="linear-gradient(135deg,#c47d1e,#e6a23c)" icon="🍞" title={viewRec.childName} subtitle={`1st Communion · ${viewRec.registerNumber||'No Register No.'}`} onClose={()=>setViewRec(null)}>
          <div className="rec-detail-grid">
            <D label="Register No." value={viewRec.registerNumber} />
            <D label="Child's Name" value={viewRec.childName} />
            <D label="Birth Date" value={viewRec.childBirthDate} />
            <D label="Gender" value={viewRec.childGender} />
            <D label="Communion Date" value={viewRec.firstCommunionDate} />
            <D label="Mass" value={viewRec.firstCommunionMass} />
            <D label="Priest" value={viewRec.celebrantPriest} />
            <D label="Baptism Date" value={viewRec.baptismDate} />
            <D label="Baptism Church" value={viewRec.baptismChurch} />
            <D label="Father" value={viewRec.fatherName} />
            <D label="Mother" value={viewRec.motherName} />
            <D label="Contact" value={viewRec.parentsPhone} />
            <D label="Catechism Teacher" value={viewRec.catechismTeacher} />
            <D label="Classes Completed" value={viewRec.classesCompleted?'✅ Yes':'❌ No'} />
            <D label="Retreat Attended" value={viewRec.retreatAttended?'✅ Yes':'❌ No'} />
            <D label="Certificate" value={viewRec.certificateIssued?'✅ Issued':'Pending'} />
            <D label="Mass Scheduled" value={viewRec.scheduleMass?`✅ ${viewRec.massDate}`:'❌ No'} />
          </div>
          <div style={{display:'flex',gap:'10px',marginTop:'16px',flexWrap:'wrap'}}>
            <button className="btn-primary" onClick={()=>{setViewRec(null);setCertRec(viewRec);}}>📜 View Certificate</button>
            <button className="btn-secondary" onClick={()=>{setViewRec(null);openEdit(viewRec);}}>✏️ Edit</button>
            <button className="btn-archive" onClick={()=>{setViewRec(null);doArchive(viewRec);}}>🗃️ Archive</button>
            <button className="btn-secondary" onClick={()=>setViewRec(null)}>Close</button>
          </div>
        </ViewModal>
      )}

      {certRec && (
        <Certificate id="fc-cert" title="Certificate of First Holy Communion" onClose={()=>setCertRec(null)}>
          <div className="cert-body">
            <div className="cert-title">CERTIFICATE OF FIRST HOLY COMMUNION</div>
            <div className="cert-church">Metropolitan Cathedral of the Immaculate Conception<br/>Zamboanga City, Philippines</div>
            <div className="cert-cross">✝</div>
            <p className="cert-intro">This is to certify that:</p>
            <table className="cert-table"><tbody>
              <tr><td className="cl">Name</td><td className="cv">{certRec.childName}</td></tr>
              <tr><td className="cl">Date of Birth</td><td className="cv">{certRec.childBirthDate}</td></tr>
              <tr><td className="cl">Father</td><td className="cv">{certRec.fatherName||'N/A'}</td></tr>
              <tr><td className="cl">Mother</td><td className="cv">{certRec.motherName||'N/A'}</td></tr>
              <tr><td className="cl">Baptism Date</td><td className="cv">{certRec.baptismDate||'N/A'}</td></tr>
              <tr><td className="cl">Baptism Church</td><td className="cv">{certRec.baptismChurch||'N/A'}</td></tr>
            </tbody></table>
            <p className="cert-main">received the Sacrament of First Holy Communion<br/>on the <strong>{ordinalDate(certRec.firstCommunionDate)}</strong><br/>at <strong>{certRec.baptismChurch||'N/A'}</strong>.</p>
            <div className="cert-footer">
              <div className="cert-sig"><div className="cert-sig-line"/><div>Celebrant Priest<br/><strong>{certRec.celebrantPriest||'To be assigned'}</strong></div></div>
              <div className="cert-reg">Register No.: <strong>{certRec.registerNumber||'Pending'}</strong><br/>Issued: {new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</div>
            </div>
          </div>
        </Certificate>
      )}

      {show && (
        <div className="modal-overlay" onClick={()=>setShow(false)}>
          <div className="modal rec-form-modal" onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <h2>{f.id?'✏️ Edit Record':'🍞 Register First Communion'}</h2>
              <button className="close-panel" onClick={()=>setShow(false)}>✕</button>
            </div>
            {!f.id && <div className="register-badge"><span>📋 Auto Register Number:</span><strong>{f.registerNumber}</strong></div>}
            <SL>👶 Child's Information</SL>
            <ParishionerSelect label="Auto-fill Child from Parish Directory" onSelect={p => {
              set('childName', `${p.firstName} ${p.lastName}`);
              set('childBirthDate', p.birthdate || '');
              set('childGender', p.sex || '');
              set('fatherName', p.fatherName || '');
              set('motherName', p.motherName || '');
            }} />
            <div className="form-row">
              <div className="form-group"><label>Child's Full Name *</label><input value={f.childName} onChange={e=>set('childName',e.target.value)} placeholder="e.g., Maria Santos" /></div>
              <div className="form-group"><label>Gender</label><select value={f.childGender} onChange={e=>set('childGender',e.target.value)}><option value="">Select</option><option>Male</option><option>Female</option></select></div>
            </div>
            <div className="form-group"><label>Date of Birth</label><input type="date" value={f.childBirthDate} onChange={e=>set('childBirthDate',e.target.value)} /></div>
            <SL>👨‍👩‍👦 Parents</SL>
            <div className="form-row">
              <div className="form-group"><label>Father's Name</label><input value={f.fatherName} onChange={e=>set('fatherName',e.target.value)} /></div>
              <div className="form-group"><label>Mother's Name</label><input value={f.motherName} onChange={e=>set('motherName',e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Address</label><input value={f.parentsAddress} onChange={e=>set('parentsAddress',e.target.value)} /></div>
              <div className="form-group"><label>Phone</label><input value={f.parentsPhone} onChange={e=>set('parentsPhone',e.target.value)} /></div>
            </div>
            <SL>💧 Baptism Information</SL>
            <div className="form-row">
              <div className="form-group"><label>Baptism Date</label><input type="date" value={f.baptismDate} onChange={e=>set('baptismDate',e.target.value)} /></div>
              <div className="form-group"><label>Baptism Church</label><select value={f.baptismChurch} onChange={e=>set('baptismChurch',e.target.value)}>{LOCATIONS.map(l=><option key={l}>{l}</option>)}</select></div>
            </div>
            <SL>📚 Catechism Preparation</SL>
            <div className="form-row">
              <div className="form-group"><label>Class / Group</label><input value={f.catechismClass} onChange={e=>set('catechismClass',e.target.value)} placeholder="e.g., Group A" /></div>
              <div className="form-group"><label>Teacher</label><input value={f.catechismTeacher} onChange={e=>set('catechismTeacher',e.target.value)} /></div>
            </div>
            <label className="check-label"><input type="checkbox" checked={f.classesCompleted} onChange={e=>set('classesCompleted',e.target.checked)} style={{width:'auto'}} /> All Catechism Classes Completed</label>
            <label className="check-label"><input type="checkbox" checked={f.retreatAttended} onChange={e=>set('retreatAttended',e.target.checked)} style={{width:'auto'}} /> Retreat Attended</label>
            <SL>🍞 First Communion Details</SL>
            <div className="form-row">
              <div className="form-group"><label>Communion Date *</label><input type="date" value={f.firstCommunionDate} onChange={e=>set('firstCommunionDate',e.target.value)} /></div>
              <div className="form-group"><label>Mass Type</label><input placeholder="e.g., Sunday 9AM Mass" value={f.firstCommunionMass} onChange={e=>set('firstCommunionMass',e.target.value)} /></div>
            </div>
            <div className="form-group"><label>Celebrant Priest</label><PriestSelect value={f.celebrantPriest} onChange={e=>set('celebrantPriest',e.target.value)} customValue={f.customPriest} onCustomChange={e=>set('customPriest',e.target.value)} /></div>
            <label className="check-label"><input type="checkbox" checked={f.certificateIssued} onChange={e=>set('certificateIssued',e.target.checked)} style={{width:'auto'}} /> Certificate Issued</label>
            <MassScheduleFields scheduleMass={f.scheduleMass} onChange={set} massDate={f.massDate} massTime={f.massTime} massLocation={f.massLocation} customLocation={f.customMassLocation} onCustomLocation={e=>set('customMassLocation',e.target.value)} />
            <div className="form-group"><label>Register Number</label><input value={f.registerNumber} onChange={e=>set('registerNumber',e.target.value)} /></div>
            <div className="form-group"><label>Notes</label><textarea rows={2} value={f.notes} onChange={e=>set('notes',e.target.value)} /></div>
            <div style={{display:'flex',gap:'12px',marginTop:'12px'}}>
              <button className="btn-primary" style={{flex:1}} onClick={handleSubmit}>💾 Save Record</button>
              <button className="btn-secondary" onClick={()=>setShow(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CONFIRMATION
// ══════════════════════════════════════════════════════════════════════════════
const emptyConf = {
  id:null, candidateName:'', candidateBirthDate:'', candidateGender:'', candidateAge:'',
  baptismDate:'', baptismChurch:LOCATIONS[0], firstCommunionDate:'', firstCommunionChurch:LOCATIONS[0],
  fatherName:'', motherName:'', guardianName:'', parentsAddress:'', parentsPhone:'', parentsEmail:'',
  confirmationName:'', confirmationDate:'', confirmationMass:'',
  celebrantBishop:'', customBishop:'',
  sponsorName:'', sponsorGender:'male', sponsorReligion:'Catholic', sponsorPhone:'',
  catechismClass:'', catechismTeacher:'', classesCompleted:false, retreatAttended:false, serviceHours:'',
  sponsorLetterSubmitted:false, notes:'', registerNumber:'', certificateIssued:false, status:'registered',
  scheduleMass:false, massDate:'', massTime:'', massLocation:LOCATIONS[0], customMassLocation:''
};

function ConfirmationPage() {
  const { confirmations, addConfirmation, archiveConfirmation, addEvent } = useApp();
  const { confirmState, confirm, handleConfirm, handleCancel } = useConfirm();
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [viewRec, setViewRec] = useState(null);
  const [certRec, setCertRec] = useState(null);
  const [f, setF] = useState(emptyConf);
  const set = (k,v) => { setF(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:''})); };

  const records = confirmations.filter(r=>!r.archived && (
    !search || r.candidateName?.toLowerCase().includes(search.toLowerCase()) ||
    r.confirmationName?.toLowerCase().includes(search.toLowerCase()) ||
    r.registerNumber?.toLowerCase().includes(search.toLowerCase())
  ));

  const openAdd = () => { setF({...emptyConf, registerNumber:genReg('CN',confirmations.filter(r=>!r.archived),'confirmationDate')}); setShow(true); };
  const openEdit = (r) => { setF({...emptyConf,...r,customBishop:'',customMassLocation:''}); setShow(true); };

  const handleSubmit = () => {
    if(!f.candidateName||!f.confirmationDate){ setErrors({candidateName:!f.candidateName?'Required':'',confirmationDate:!f.confirmationDate?'Required':''}); return; }
    const bishop = f.celebrantBishop==='manual' ? f.customBishop : f.celebrantBishop;
    const record = {...f, celebrantBishop:bishop, id:f.id||Date.now(), archived:false};
    addConfirmation(record);
    if(f.scheduleMass && f.massDate) {
      const massLoc = f.massLocation==='Other (please specify)' ? f.customMassLocation : f.massLocation;
      addEvent({ title:`Confirmation Mass: ${f.candidateName}`, date:f.massDate, time:f.massTime, type:'confirmation', location:massLoc, priest:bishop, status:'approved', done:false });
    }
    setShow(false);
    alert(f.id?'✅ Record updated!':'✅ Confirmation registered!');
  };

  const doArchive = async (r) => { const ok = await confirm({ icon:'🗃️', title:`Archive this Confirmation record?`, message:`"${r.candidateName}" will be moved to Archives.`, confirmLabel:'🗃️ Yes, Archive', confirmColor:'var(--warning)' }); if(ok) archiveConfirmation(r.id); };

  return (
    <div>
      <div className="rec-page-header">
        <h2>🕊️ Confirmation Records</h2>
        <button className="btn-primary" onClick={openAdd}>🕊️ Register New</button>
      </div>
      <SearchBar value={search} onChange={setSearch} />
      <div className="card" style={{overflowX:'auto',marginTop:'12px'}}>
        <table>
          <thead><tr><th>Register No.</th><th>Candidate</th><th>Confirmation Name</th><th>Date</th><th>Bishop/Priest</th><th>Sponsor</th><th>Certificate</th><th>Actions</th></tr></thead>
          <tbody>
            {records.length===0
              ? <tr><td colSpan={8} className="empty-td">No confirmation records yet. Click "Register New" to add one.</td></tr>
              : records.map(r=>(
                <tr key={r.id} className="clickable-row" onClick={()=>setViewRec(r)}>
                  <td><strong>{r.registerNumber||'Pending'}</strong></td>
                  <td>{r.candidateName}</td>
                  <td>{r.confirmationName||'—'}</td>
                  <td>{r.confirmationDate}</td>
                  <td>{r.celebrantBishop||'—'}</td>
                  <td>{r.sponsorName||'—'}</td>
                  <td><span className={`badge ${r.certificateIssued?'badge-active':'badge-pending'}`}>{r.certificateIssued?'Issued':'Pending'}</span></td>
                  <td><RecordActions onView={()=>setViewRec(r)} onEdit={()=>openEdit(r)} onPrint={()=>setCertRec(r)} onArchive={()=>doArchive(r)} /></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {viewRec && (
        <ViewModal color="linear-gradient(135deg,#7c4dab,#9b59b6)" icon="🕊️" title={viewRec.candidateName} subtitle={`Confirmation Record · ${viewRec.registerNumber||'No Register No.'}`} onClose={()=>setViewRec(null)}>
          <div className="rec-detail-grid">
            <D label="Register No." value={viewRec.registerNumber} />
            <D label="Candidate" value={viewRec.candidateName} />
            <D label="Confirmation Name" value={viewRec.confirmationName} />
            <D label="Date" value={viewRec.confirmationDate} />
            <D label="Bishop/Priest" value={viewRec.celebrantBishop} />
            <D label="Sponsor" value={`${viewRec.sponsorName} (${viewRec.sponsorGender==='male'?'Male':'Female'})`} />
            <D label="Baptism Date" value={viewRec.baptismDate} />
            <D label="1st Communion Date" value={viewRec.firstCommunionDate} />
            <D label="Father" value={viewRec.fatherName} />
            <D label="Mother" value={viewRec.motherName} />
            <D label="Guardian" value={viewRec.guardianName} />
            <D label="Classes Completed" value={viewRec.classesCompleted?'✅ Yes':'❌ No'} />
            <D label="Retreat Attended" value={viewRec.retreatAttended?'✅ Yes':'❌ No'} />
            <D label="Service Hours" value={viewRec.serviceHours} />
            <D label="Sponsor Letter" value={viewRec.sponsorLetterSubmitted?'✅ Submitted':'❌ Pending'} />
            <D label="Certificate" value={viewRec.certificateIssued?'✅ Issued':'Pending'} />
            <D label="Mass Scheduled" value={viewRec.scheduleMass?`✅ ${viewRec.massDate}`:'❌ No'} />
          </div>
          <div style={{display:'flex',gap:'10px',marginTop:'16px',flexWrap:'wrap'}}>
            <button className="btn-primary" onClick={()=>{setViewRec(null);setCertRec(viewRec);}}>📜 View Certificate</button>
            <button className="btn-secondary" onClick={()=>{setViewRec(null);openEdit(viewRec);}}>✏️ Edit</button>
            <button className="btn-archive" onClick={()=>{setViewRec(null);doArchive(viewRec);}}>🗃️ Archive</button>
            <button className="btn-secondary" onClick={()=>setViewRec(null)}>Close</button>
          </div>
        </ViewModal>
      )}

      {certRec && (
        <Certificate id="conf-cert" title="Certificate of Confirmation" onClose={()=>setCertRec(null)}>
          <div className="cert-body">
            <div className="cert-title">CERTIFICATE OF CONFIRMATION</div>
            <div className="cert-church">Metropolitan Cathedral of the Immaculate Conception<br/>Zamboanga City, Philippines</div>
            <div className="cert-cross">✝</div>
            <p className="cert-intro">This is to certify that:</p>
            <table className="cert-table"><tbody>
              <tr><td className="cl">Name</td><td className="cv">{certRec.candidateName}</td></tr>
              <tr><td className="cl">Confirmation Name</td><td className="cv">{certRec.confirmationName||'N/A'}</td></tr>
              <tr><td className="cl">Date of Birth</td><td className="cv">{certRec.candidateBirthDate}</td></tr>
              <tr><td className="cl">Father</td><td className="cv">{certRec.fatherName||'N/A'}</td></tr>
              <tr><td className="cl">Mother</td><td className="cv">{certRec.motherName||'N/A'}</td></tr>
              <tr><td className="cl">Sponsor</td><td className="cv">{certRec.sponsorName||'N/A'}</td></tr>
            </tbody></table>
            <p className="cert-main">received the Sacrament of Confirmation<br/>on the <strong>{ordinalDate(certRec.confirmationDate)}</strong><br/>at the Metropolitan Cathedral of the Immaculate Conception, Zamboanga City.</p>
            <div className="cert-footer">
              <div className="cert-sig"><div className="cert-sig-line"/><div>Celebrant Bishop<br/><strong>{certRec.celebrantBishop||'To be assigned'}</strong></div></div>
              <div className="cert-reg">Register No.: <strong>{certRec.registerNumber||'Pending'}</strong><br/>Issued: {new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</div>
            </div>
          </div>
        </Certificate>
      )}

      {show && (
        <div className="modal-overlay" onClick={()=>setShow(false)}>
          <div className="modal rec-form-modal" onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <h2>{f.id?'✏️ Edit Record':'🕊️ Register Confirmation'}</h2>
              <button className="close-panel" onClick={()=>setShow(false)}>✕</button>
            </div>
            {!f.id && <div className="register-badge"><span>📋 Auto Register Number:</span><strong>{f.registerNumber}</strong></div>}
            <SL>🧑 Candidate Information</SL>
            <ParishionerSelect label="Auto-fill Candidate from Parish Directory" onSelect={p => {
              set('candidateName', `${p.firstName} ${p.lastName}`);
              set('candidateBirthDate', p.birthdate || '');
              set('candidateGender', p.sex || '');
              set('fatherName', p.fatherName || '');
              set('motherName', p.motherName || '');
            }} />
            <div className="form-row">
              <div className="form-group"><label>Full Name *</label><input value={f.candidateName} onChange={e=>set('candidateName',e.target.value)} placeholder="Candidate's full name" /></div>
              <div className="form-group"><label>Confirmation Name</label><input value={f.confirmationName} onChange={e=>set('confirmationName',e.target.value)} placeholder="e.g., Santo Tomas" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Birth Date</label><input type="date" value={f.candidateBirthDate} onChange={e=>set('candidateBirthDate',e.target.value)} /></div>
              <div className="form-group"><label>Gender</label><select value={f.candidateGender} onChange={e=>set('candidateGender',e.target.value)}><option value="">Select</option><option>Male</option><option>Female</option></select></div>
            </div>
            <SL>👨‍👩‍👦 Parents / Guardian</SL>
            <div className="form-row">
              <div className="form-group"><label>Father</label><input value={f.fatherName} onChange={e=>set('fatherName',e.target.value)} /></div>
              <div className="form-group"><label>Mother</label><input value={f.motherName} onChange={e=>set('motherName',e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Guardian (if applicable)</label><input value={f.guardianName} onChange={e=>set('guardianName',e.target.value)} /></div>
              <div className="form-group"><label>Phone</label><input value={f.parentsPhone} onChange={e=>set('parentsPhone',e.target.value)} /></div>
            </div>
            <SL>💧 Sacramental History</SL>
            <div className="form-row">
              <div className="form-group"><label>Baptism Date</label><input type="date" value={f.baptismDate} onChange={e=>set('baptismDate',e.target.value)} /></div>
              <div className="form-group"><label>Baptism Church</label><select value={f.baptismChurch} onChange={e=>set('baptismChurch',e.target.value)}>{LOCATIONS.map(l=><option key={l}>{l}</option>)}</select></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>1st Communion Date</label><input type="date" value={f.firstCommunionDate} onChange={e=>set('firstCommunionDate',e.target.value)} /></div>
              <div className="form-group"><label>1st Communion Church</label><select value={f.firstCommunionChurch} onChange={e=>set('firstCommunionChurch',e.target.value)}>{LOCATIONS.map(l=><option key={l}>{l}</option>)}</select></div>
            </div>
            <SL>🤝 Sponsor (Ninong/Ninang)</SL>
            <div className="form-row">
              <div className="form-group"><label>Sponsor Name</label><input value={f.sponsorName} onChange={e=>set('sponsorName',e.target.value)} /></div>
              <div className="form-group"><label>Role</label><select value={f.sponsorGender} onChange={e=>set('sponsorGender',e.target.value)}><option value="male">Male (Ninong)</option><option value="female">Female (Ninang)</option></select></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Religion</label><select value={f.sponsorReligion} onChange={e=>set('sponsorReligion',e.target.value)}>{RELIGIONS.map(r=><option key={r}>{r}</option>)}</select></div>
              <div className="form-group"><label>Sponsor Phone</label><input value={f.sponsorPhone} onChange={e=>set('sponsorPhone',e.target.value)} /></div>
            </div>
            <label className="check-label"><input type="checkbox" checked={f.sponsorLetterSubmitted} onChange={e=>set('sponsorLetterSubmitted',e.target.checked)} style={{width:'auto'}} /> Sponsor Letter Submitted</label>
            <SL>📚 Catechism Preparation</SL>
            <div className="form-row">
              <div className="form-group"><label>Class / Group</label><input value={f.catechismClass} onChange={e=>set('catechismClass',e.target.value)} /></div>
              <div className="form-group"><label>Teacher</label><input value={f.catechismTeacher} onChange={e=>set('catechismTeacher',e.target.value)} /></div>
            </div>
            <div className="form-group"><label>Service Hours Completed</label><input type="number" value={f.serviceHours} onChange={e=>set('serviceHours',e.target.value)} placeholder="e.g., 20" /></div>
            <label className="check-label"><input type="checkbox" checked={f.classesCompleted} onChange={e=>set('classesCompleted',e.target.checked)} style={{width:'auto'}} /> All Catechism Classes Completed</label>
            <label className="check-label"><input type="checkbox" checked={f.retreatAttended} onChange={e=>set('retreatAttended',e.target.checked)} style={{width:'auto'}} /> Retreat Attended</label>
            <SL>✝️ Confirmation Details</SL>
            <div className="form-row">
              <div className="form-group"><label>Confirmation Date *</label><input type="date" value={f.confirmationDate} onChange={e=>set('confirmationDate',e.target.value)} /></div>
              <div className="form-group"><label>Mass Type</label><input placeholder="e.g., Confirmation Mass" value={f.confirmationMass} onChange={e=>set('confirmationMass',e.target.value)} /></div>
            </div>
            <div className="form-group"><label>Celebrant Bishop / Priest</label><PriestSelect value={f.celebrantBishop} onChange={e=>set('celebrantBishop',e.target.value)} customValue={f.customBishop} onCustomChange={e=>set('customBishop',e.target.value)} /></div>
            <label className="check-label"><input type="checkbox" checked={f.certificateIssued} onChange={e=>set('certificateIssued',e.target.checked)} style={{width:'auto'}} /> Certificate Issued</label>
            <MassScheduleFields scheduleMass={f.scheduleMass} onChange={set} massDate={f.massDate} massTime={f.massTime} massLocation={f.massLocation} customLocation={f.customMassLocation} onCustomLocation={e=>set('customMassLocation',e.target.value)} />
            <div className="form-group"><label>Register Number</label><input value={f.registerNumber} onChange={e=>set('registerNumber',e.target.value)} /></div>
            <div className="form-group"><label>Notes</label><textarea rows={2} value={f.notes} onChange={e=>set('notes',e.target.value)} /></div>
            <div style={{display:'flex',gap:'12px',marginTop:'12px'}}>
              <button className="btn-primary" style={{flex:1}} onClick={handleSubmit}>💾 Save Record</button>
              <button className="btn-secondary" onClick={()=>setShow(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MARRIAGE  — with 3 Sundays (Banns) + Pre-Cana tracking
// ══════════════════════════════════════════════════════════════════════════════
const emptyMarriage = {
  id:null,
  groomName:'', groomBirthDate:'', groomBaptismDate:'', groomBaptismChurch:'',
  groomFatherName:'', groomMotherName:'', groomConfirmed:true,
  brideName:'', brideBirthDate:'', brideBaptismDate:'', brideBaptismChurch:'',
  brideFatherName:'', brideMotherName:'', brideConfirmed:true,
  weddingDate:'', weddingTime:'', weddingLocation:LOCATIONS[0], customLocation:'',
  celebratingPriest:'', customPriest:'', includeMass:true,
  preCanaCompleted:false, preCanaDate:'',
  // 3 Sundays (Marriage Banns)
  banns1Date:'', banns1Done:false,
  banns2Date:'', banns2Done:false,
  banns3Date:'', banns3Done:false,
  bestMan:'', maidOfHonor:'', witnesses:['',''],
  marriageLicenseNumber:'', marriageLicenseDate:'',
  notes:'', registerNumber:'', certificateIssued:false,
  scheduleMass:false, massDate:'', massTime:'', massLocation:LOCATIONS[0], customMassLocation:''
};

function MarriagePage() {
  const { marriages, addMarriage, archiveMarriage, addEvent } = useApp();
  const { confirmState, confirm, handleConfirm, handleCancel } = useConfirm();
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [viewRec, setViewRec] = useState(null);
  const [certRec, setCertRec] = useState(null);
  const [f, setF] = useState(emptyMarriage);
  const set = (k,v) => { setF(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:''})); };
  const setW = (i,v) => { const w=[...f.witnesses]; w[i]=v; setF(p=>({...p,witnesses:w})); };

  const records = marriages.filter(r=>!r.archived && (
    !search || r.groomName?.toLowerCase().includes(search.toLowerCase()) ||
    r.brideName?.toLowerCase().includes(search.toLowerCase()) ||
    r.registerNumber?.toLowerCase().includes(search.toLowerCase())
  ));

  const openAdd = () => { setF({...emptyMarriage, registerNumber:genReg('M',marriages.filter(r=>!r.archived),'weddingDate')}); setShow(true); };
  const openEdit = (r) => { setF({...emptyMarriage,...r,customPriest:'',customLocation:'',customMassLocation:''}); setShow(true); };

  const bannsAllDone = f.banns1Done && f.banns2Done && f.banns3Done;

  const handleSubmit = () => {
    if(!f.groomName||!f.brideName||!f.weddingDate){ setErrors({groomName:!f.groomName?'Required':'',brideName:!f.brideName?'Required':'',weddingDate:!f.weddingDate?'Required':''}); return; }
    const priest = f.celebratingPriest==='manual' ? f.customPriest : f.celebratingPriest;
    const location = f.weddingLocation==='Other (please specify)' ? f.customLocation : f.weddingLocation;
    const record = {...f, celebratingPriest:priest, weddingLocation:location, id:f.id||Date.now(), archived:false};
    addMarriage(record);
    if(f.scheduleMass && f.massDate) {
      const massLoc = f.massLocation==='Other (please specify)' ? f.customMassLocation : f.massLocation;
      addEvent({ title:`Wedding Mass: ${f.groomName} & ${f.brideName}`, date:f.massDate, time:f.massTime, type:'wedding', location:massLoc, priest, status:'approved', done:false });
    }
    setShow(false);
    alert(f.id?'✅ Record updated!':'✅ Marriage recorded!');
  };

  const doArchive = async (r) => { const ok = await confirm({ icon:'🗃️', title:`Archive this marriage record?`, message:`"${r.groomName} & ${r.brideName}" will be moved to Archives.`, confirmLabel:'🗃️ Yes, Archive', confirmColor:'var(--warning)' }); if(ok) archiveMarriage(r.id); };

  return (
    <div>
      <div className="rec-page-header">
        <h2>💍 Marriage Records</h2>
        <button className="btn-primary" onClick={openAdd}>💍 Record New Marriage</button>
      </div>
      <SearchBar value={search} onChange={setSearch} />
      <div className="card" style={{overflowX:'auto',marginTop:'12px'}}>
        <table>
          <thead><tr><th>Register No.</th><th>Groom</th><th>Bride</th><th>Wedding Date</th><th>Priest</th><th>Banns</th><th>Pre-Cana</th><th>Actions</th></tr></thead>
          <tbody>
            {records.length===0
              ? <tr><td colSpan={8} className="empty-td">No marriage records yet. Click "Record New Marriage" to add one.</td></tr>
              : records.map(r=>(
                <tr key={r.id} className="clickable-row" onClick={()=>setViewRec(r)}>
                  <td><strong>{r.registerNumber||'Pending'}</strong></td>
                  <td>{r.groomName}</td>
                  <td>{r.brideName}</td>
                  <td>{r.weddingDate}</td>
                  <td>{r.celebratingPriest||'—'}</td>
                  <td>
                    <span className={`badge ${(r.banns1Done&&r.banns2Done&&r.banns3Done)?'badge-active':'badge-pending'}`}>
                      {[r.banns1Done,r.banns2Done,r.banns3Done].filter(Boolean).length}/3 Done
                    </span>
                  </td>
                  <td><span className={`badge ${r.preCanaCompleted?'badge-active':'badge-pending'}`}>{r.preCanaCompleted?'✅ Done':'Pending'}</span></td>
                  <td><RecordActions onView={()=>setViewRec(r)} onEdit={()=>openEdit(r)} onPrint={()=>setCertRec(r)} onArchive={()=>doArchive(r)} /></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {viewRec && (
        <ViewModal color="linear-gradient(135deg,#c0392b,#e74c3c)" icon="💍" title={`${viewRec.groomName} & ${viewRec.brideName}`} subtitle={`Marriage Record · ${viewRec.registerNumber||'No Register No.'}`} onClose={()=>setViewRec(null)}>
          <div className="rec-detail-grid">
            <D label="Register No." value={viewRec.registerNumber} />
            <D label="Wedding Date" value={viewRec.weddingDate} />
            <D label="Time" value={viewRec.weddingTime} />
            <D label="Location" value={viewRec.weddingLocation} />
            <D label="Priest" value={viewRec.celebratingPriest} />
            <D label="Nuptial Mass" value={viewRec.includeMass?'✅ Yes':'❌ No'} />
          </div>
          <div className="rec-couple-grid">
            <div className="rec-section">
              <h4>🤵 Groom</h4>
              <D label="Name" value={viewRec.groomName} />
              <D label="Birth Date" value={viewRec.groomBirthDate} />
              <D label="Father" value={viewRec.groomFatherName} />
              <D label="Mother" value={viewRec.groomMotherName} />
              <D label="Baptism" value={`${viewRec.groomBaptismDate} @ ${viewRec.groomBaptismChurch}`} />
              <D label="Confirmed" value={viewRec.groomConfirmed?'✅ Yes':'❌ No'} />
            </div>
            <div className="rec-section">
              <h4>👰 Bride</h4>
              <D label="Name" value={viewRec.brideName} />
              <D label="Birth Date" value={viewRec.brideBirthDate} />
              <D label="Father" value={viewRec.brideFatherName} />
              <D label="Mother" value={viewRec.brideMotherName} />
              <D label="Baptism" value={`${viewRec.brideBaptismDate} @ ${viewRec.brideBaptismChurch}`} />
              <D label="Confirmed" value={viewRec.brideConfirmed?'✅ Yes':'❌ No'} />
            </div>
          </div>
          <div className="rec-section">
            <h4>📣 Marriage Banns (3 Sundays)</h4>
            <div className="rec-detail-grid">
              <D label="1st Sunday" value={`${viewRec.banns1Date||'—'} ${viewRec.banns1Done?'✅':'❌'}`} />
              <D label="2nd Sunday" value={`${viewRec.banns2Date||'—'} ${viewRec.banns2Done?'✅':'❌'}`} />
              <D label="3rd Sunday" value={`${viewRec.banns3Date||'—'} ${viewRec.banns3Done?'✅':'❌'}`} />
              <D label="Pre-Cana" value={viewRec.preCanaCompleted?`✅ Completed ${viewRec.preCanaDate}`:'❌ Pending'} />
            </div>
          </div>
          <div className="rec-section">
            <h4>👥 Wedding Party & Documents</h4>
            <div className="rec-detail-grid">
              <D label="Best Man" value={viewRec.bestMan} />
              <D label="Maid of Honor" value={viewRec.maidOfHonor} />
              <D label="Witness 1" value={viewRec.witnesses?.[0]} />
              <D label="Witness 2" value={viewRec.witnesses?.[1]} />
              <D label="License No." value={viewRec.marriageLicenseNumber} />
              <D label="License Date" value={viewRec.marriageLicenseDate} />
              <D label="Certificate" value={viewRec.certificateIssued?'✅ Issued':'Pending'} />
              <D label="Mass Scheduled" value={viewRec.scheduleMass?`✅ ${viewRec.massDate}`:'❌ No'} />
            </div>
          </div>
          <div style={{display:'flex',gap:'10px',marginTop:'16px',flexWrap:'wrap'}}>
            <button className="btn-primary" onClick={()=>{setViewRec(null);setCertRec(viewRec);}}>📜 View Certificate</button>
            <button className="btn-secondary" onClick={()=>{setViewRec(null);openEdit(viewRec);}}>✏️ Edit</button>
            <button className="btn-archive" onClick={()=>{setViewRec(null);doArchive(viewRec);}}>🗃️ Archive</button>
            <button className="btn-secondary" onClick={()=>setViewRec(null)}>Close</button>
          </div>
        </ViewModal>
      )}

      {certRec && (
        <Certificate id="marriage-cert" title="Certificate of Marriage" onClose={()=>setCertRec(null)}>
          <div className="cert-body">
            <div className="cert-title">CERTIFICATE OF MARRIAGE</div>
            <div className="cert-church">Metropolitan Cathedral of the Immaculate Conception<br/>Zamboanga City, Philippines</div>
            <div className="cert-cross">✝</div>
            <p className="cert-intro">This is to certify that the holy covenant of Matrimony was entered into by:</p>
            <table className="cert-table"><tbody>
              <tr><td className="cl">Groom</td><td className="cv">{certRec.groomName}</td></tr>
              <tr><td className="cl">Son of</td><td className="cv">{certRec.groomFatherName||'N/A'} & {certRec.groomMotherName||'N/A'}</td></tr>
              <tr><td className="cl">Bride</td><td className="cv">{certRec.brideName}</td></tr>
              <tr><td className="cl">Daughter of</td><td className="cv">{certRec.brideFatherName||'N/A'} & {certRec.brideMotherName||'N/A'}</td></tr>
              <tr><td className="cl">Official Witnesses</td><td className="cv">{certRec.witnesses?.filter(Boolean).join(' & ')||'N/A'}</td></tr>
              <tr><td className="cl">License No.</td><td className="cv">{certRec.marriageLicenseNumber||'N/A'}</td></tr>
            </tbody></table>
            <p className="cert-main">according to the rites of the Roman Catholic Church<br/>on the <strong>{ordinalDate(certRec.weddingDate)}</strong><br/>at <strong>{certRec.weddingLocation||'N/A'}</strong>.</p>
            <div className="cert-footer">
              <div className="cert-sig"><div className="cert-sig-line"/><div>Celebrating Priest<br/><strong>{certRec.celebratingPriest||'To be assigned'}</strong></div></div>
              <div className="cert-reg">Register No.: <strong>{certRec.registerNumber||'Pending'}</strong><br/>Issued: {new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</div>
            </div>
          </div>
        </Certificate>
      )}

      {show && (
        <div className="modal-overlay" onClick={()=>setShow(false)}>
          <div className="modal rec-form-modal" onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <h2>{f.id?'✏️ Edit Marriage Record':'💍 Record New Marriage'}</h2>
              <button className="close-panel" onClick={()=>setShow(false)}>✕</button>
            </div>
            {!f.id && <div className="register-badge"><span>📋 Auto Register Number:</span><strong>{f.registerNumber}</strong></div>}

            <SL>🤵 Groom's Information</SL>
            <ParishionerSelect label="Auto-fill Groom from Parish Directory" onSelect={p => {
              set('groomName', `${p.firstName} ${p.lastName}`);
              set('groomBirthDate', p.birthdate || '');
              set('groomFatherName', p.fatherName || '');
              set('groomMotherName', p.motherName || '');
            }} />
            <div className="form-row">
              <div className="form-group"><label>Full Name *</label><input placeholder="Groom's full name" value={f.groomName} onChange={e=>set('groomName',e.target.value)} /></div>
              <div className="form-group"><label>Birth Date</label><input type="date" value={f.groomBirthDate} onChange={e=>set('groomBirthDate',e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Father's Name *</label><input value={f.groomFatherName} onChange={e=>set('groomFatherName',e.target.value)} /></div>
              <div className="form-group"><label>Mother's Name *</label><input value={f.groomMotherName} onChange={e=>set('groomMotherName',e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Baptism Date</label><input type="date" value={f.groomBaptismDate} onChange={e=>set('groomBaptismDate',e.target.value)} /></div>
              <div className="form-group"><label>Baptism Church</label><input placeholder="Church where baptized" value={f.groomBaptismChurch} onChange={e=>set('groomBaptismChurch',e.target.value)} /></div>
            </div>
            <label className="check-label"><input type="checkbox" checked={f.groomConfirmed} onChange={e=>set('groomConfirmed',e.target.checked)} style={{width:'auto'}} /> Groom has received Confirmation</label>

            <SL>👰 Bride's Information</SL>
            <ParishionerSelect label="Auto-fill Bride from Parish Directory" onSelect={p => {
              set('brideName', `${p.firstName} ${p.lastName}`);
              set('brideBirthDate', p.birthdate || '');
              set('brideFatherName', p.fatherName || '');
              set('brideMotherName', p.motherName || '');
            }} />
            <div className="form-row">
              <div className="form-group"><label>Full Name *</label><input placeholder="Bride's full name" value={f.brideName} onChange={e=>set('brideName',e.target.value)} /></div>
              <div className="form-group"><label>Birth Date</label><input type="date" value={f.brideBirthDate} onChange={e=>set('brideBirthDate',e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Father's Name *</label><input value={f.brideFatherName} onChange={e=>set('brideFatherName',e.target.value)} /></div>
              <div className="form-group"><label>Mother's Name *</label><input value={f.brideMotherName} onChange={e=>set('brideMotherName',e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Baptism Date</label><input type="date" value={f.brideBaptismDate} onChange={e=>set('brideBaptismDate',e.target.value)} /></div>
              <div className="form-group"><label>Baptism Church</label><input placeholder="Church where baptized" value={f.brideBaptismChurch} onChange={e=>set('brideBaptismChurch',e.target.value)} /></div>
            </div>
            <label className="check-label"><input type="checkbox" checked={f.brideConfirmed} onChange={e=>set('brideConfirmed',e.target.checked)} style={{width:'auto'}} /> Bride has received Confirmation</label>

            <SL>✝️ Sacramental Preparation</SL>
            <div className="banns-box">
              <p className="banns-intro">📣 <strong>Marriage Banns</strong> — Catholic Church requires the announcement of a marriage to the parish on 3 consecutive Sundays before the wedding, to allow anyone to raise valid objections.</p>
              <div className="form-row">
                <div className="form-group"><label>1st Sunday Date</label><input type="date" value={f.banns1Date} onChange={e=>set('banns1Date',e.target.value)} /></div>
                <div className="form-group" style={{justifyContent:'flex-end',alignSelf:'flex-end',paddingBottom:'12px'}}>
                  <label className="check-label"><input type="checkbox" checked={f.banns1Done} onChange={e=>set('banns1Done',e.target.checked)} style={{width:'auto'}} /> Announced ✅</label>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>2nd Sunday Date</label><input type="date" value={f.banns2Date} onChange={e=>set('banns2Date',e.target.value)} /></div>
                <div className="form-group" style={{justifyContent:'flex-end',alignSelf:'flex-end',paddingBottom:'12px'}}>
                  <label className="check-label"><input type="checkbox" checked={f.banns2Done} onChange={e=>set('banns2Done',e.target.checked)} style={{width:'auto'}} /> Announced ✅</label>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>3rd Sunday Date</label><input type="date" value={f.banns3Date} onChange={e=>set('banns3Date',e.target.value)} /></div>
                <div className="form-group" style={{justifyContent:'flex-end',alignSelf:'flex-end',paddingBottom:'12px'}}>
                  <label className="check-label"><input type="checkbox" checked={f.banns3Done} onChange={e=>set('banns3Done',e.target.checked)} style={{width:'auto'}} /> Announced ✅</label>
                </div>
              </div>
              {bannsAllDone && <div className="banns-done">✅ All 3 Sundays announced! The couple may proceed with the wedding.</div>}
            </div>
            <label className="check-label"><input type="checkbox" checked={f.preCanaCompleted} onChange={e=>set('preCanaCompleted',e.target.checked)} style={{width:'auto'}} /> Pre-Cana Marriage Preparation Completed</label>
            {f.preCanaCompleted && <div className="form-group" style={{marginTop:'8px'}}><label>Pre-Cana Completion Date</label><input type="date" value={f.preCanaDate} onChange={e=>set('preCanaDate',e.target.value)} /></div>}

            <SL>💒 Wedding Details</SL>
            <div className="form-row">
              <div className="form-group"><label>Wedding Date *</label><input type="date" value={f.weddingDate} onChange={e=>set('weddingDate',e.target.value)} /></div>
              <div className="form-group"><label>Wedding Time</label><input type="time" value={f.weddingTime} onChange={e=>set('weddingTime',e.target.value)} /></div>
            </div>
            <div className="form-group"><label>Wedding Location *</label><LocationSelect value={f.weddingLocation} onChange={e=>set('weddingLocation',e.target.value)} customValue={f.customLocation} onCustomChange={e=>set('customLocation',e.target.value)} /></div>
            <div className="form-group"><label>Celebrating Priest *</label><PriestSelect value={f.celebratingPriest} onChange={e=>set('celebratingPriest',e.target.value)} customValue={f.customPriest} onCustomChange={e=>set('customPriest',e.target.value)} /></div>
            <label className="check-label"><input type="checkbox" checked={f.includeMass} onChange={e=>set('includeMass',e.target.checked)} style={{width:'auto'}} /> Included Nuptial Mass</label>

            <SL>👥 Witnesses & Wedding Party</SL>
            <div className="form-row">
              <div className="form-group"><label>Best Man</label><input value={f.bestMan} onChange={e=>set('bestMan',e.target.value)} placeholder="Best man's name" /></div>
              <div className="form-group"><label>Maid of Honor</label><input value={f.maidOfHonor} onChange={e=>set('maidOfHonor',e.target.value)} placeholder="Maid of honor's name" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Official Witness 1 *</label><input value={f.witnesses[0]} onChange={e=>setW(0,e.target.value)} placeholder="First witness name" /></div>
              <div className="form-group"><label>Official Witness 2 *</label><input value={f.witnesses[1]} onChange={e=>setW(1,e.target.value)} placeholder="Second witness name" /></div>
            </div>

            <SL>📋 Civil Documents</SL>
            <div className="form-row">
              <div className="form-group"><label>Marriage License Number</label><input value={f.marriageLicenseNumber} onChange={e=>set('marriageLicenseNumber',e.target.value)} placeholder="License number from civil registry" /></div>
              <div className="form-group"><label>License Issue Date</label><input type="date" value={f.marriageLicenseDate} onChange={e=>set('marriageLicenseDate',e.target.value)} /></div>
            </div>
            <label className="check-label"><input type="checkbox" checked={f.certificateIssued} onChange={e=>set('certificateIssued',e.target.checked)} style={{width:'auto'}} /> Marriage Certificate Issued</label>

            <MassScheduleFields scheduleMass={f.scheduleMass} onChange={set} massDate={f.massDate} massTime={f.massTime} massLocation={f.massLocation} customLocation={f.customMassLocation} onCustomLocation={e=>set('customMassLocation',e.target.value)} />

            <div className="form-group"><label>Register Number</label><input value={f.registerNumber} onChange={e=>set('registerNumber',e.target.value)} /></div>
            <div className="form-group"><label>Notes</label><textarea rows={3} value={f.notes} onChange={e=>set('notes',e.target.value)} placeholder="Any additional notes about this marriage..." /></div>
            <div style={{display:'flex',gap:'12px',marginTop:'12px'}}>
              <button className="btn-primary" style={{flex:1}} onClick={handleSubmit}>💾 Save Record</button>
              <button className="btn-secondary" onClick={()=>setShow(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FUNERAL
// ══════════════════════════════════════════════════════════════════════════════
const emptyFuneral = {
  id:null,
  deceasedName:'', deceasedAge:'', deceasedGender:'', dateOfDeath:'', placeOfDeath:'',
  causeOfDeath:'', religion:'Catholic',
  funeralMassDate:'', funeralMassTime:'', funeralLocation:LOCATIONS[0], customLocation:'',
  celebratingPriest:'', customPriest:'',
  burialDate:'', burialLocation:'', burialType:'Cemetery',
  vigil:false, vigilDate:'', vigilTime:'', vigilLocation:'',
  requestedBy:'', relationship:'', contactNumber:'',
  notes:'', registerNumber:'', certificateIssued:false,
  scheduleMass:false, massDate:'', massTime:'', massLocation:LOCATIONS[0], customMassLocation:''
};

function FuneralPage() {
  const { funerals, addFuneral, archiveFuneral, addEvent } = useApp();
  const { confirmState, confirm, handleConfirm, handleCancel } = useConfirm();
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [viewRec, setViewRec] = useState(null);
  const [certRec, setCertRec] = useState(null);
  const [f, setF] = useState(emptyFuneral);
  const set = (k,v) => { setF(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:''})); };

  const records = funerals.filter(r=>!r.archived && (
    !search || r.deceasedName?.toLowerCase().includes(search.toLowerCase()) ||
    r.requestedBy?.toLowerCase().includes(search.toLowerCase()) ||
    r.registerNumber?.toLowerCase().includes(search.toLowerCase())
  ));

  const openAdd = () => { setF({...emptyFuneral, registerNumber:genReg('FR',funerals.filter(r=>!r.archived),'funeralMassDate')}); setShow(true); };
  const openEdit = (r) => { setF({...emptyFuneral,...r,customPriest:'',customLocation:'',customMassLocation:''}); setShow(true); };

  const handleSubmit = () => {
    if(!f.deceasedName||!f.funeralMassDate){ setErrors({deceasedName:!f.deceasedName?'Required':'',funeralMassDate:!f.funeralMassDate?'Required':''}); return; }
    const priest = f.celebratingPriest==='manual' ? f.customPriest : f.celebratingPriest;
    const location = f.funeralLocation==='Other (please specify)' ? f.customLocation : f.funeralLocation;
    const record = {...f, celebratingPriest:priest, funeralLocation:location, id:f.id||Date.now(), archived:false};
    addFuneral(record);
    if(f.scheduleMass && f.massDate) {
      const massLoc = f.massLocation==='Other (please specify)' ? f.customMassLocation : f.massLocation;
      addEvent({ title:`Funeral Mass: ${f.deceasedName}`, date:f.massDate, time:f.massTime, type:'funeral', location:massLoc, priest, status:'approved', done:false });
    }
    setShow(false);
    alert(f.id?'✅ Record updated!':'✅ Funeral record added!');
  };

  const doArchive = async (r) => { const ok = await confirm({ icon:'🗃️', title:`Archive this funeral record?`, message:`"${r.deceasedName}" will be moved to Archives.`, confirmLabel:'🗃️ Yes, Archive', confirmColor:'var(--warning)' }); if(ok) archiveFuneral(r.id); };

  return (
    <div>
      <div className="rec-page-header">
        <h2>🕯️ Funeral Records</h2>
        <button className="btn-primary" onClick={openAdd}>🕯️ Add Funeral Record</button>
      </div>
      <SearchBar value={search} onChange={setSearch} />
      <div className="card" style={{overflowX:'auto',marginTop:'12px'}}>
        <table>
          <thead><tr><th>Register No.</th><th>Deceased</th><th>Date of Death</th><th>Funeral Mass</th><th>Burial Location</th><th>Priest</th><th>Record</th><th>Actions</th></tr></thead>
          <tbody>
            {records.length===0
              ? <tr><td colSpan={8} className="empty-td">No funeral records yet. Click "Add Funeral Record" to add one.</td></tr>
              : records.map(r=>(
                <tr key={r.id} className="clickable-row" onClick={()=>setViewRec(r)}>
                  <td><strong>{r.registerNumber||'Pending'}</strong></td>
                  <td>{r.deceasedName}</td>
                  <td>{r.dateOfDeath||'—'}</td>
                  <td>{r.funeralMassDate}</td>
                  <td>{r.burialLocation||'—'}</td>
                  <td>{r.celebratingPriest||'—'}</td>
                  <td><span className={`badge ${r.certificateIssued?'badge-active':'badge-pending'}`}>{r.certificateIssued?'Issued':'Pending'}</span></td>
                  <td><RecordActions onView={()=>setViewRec(r)} onEdit={()=>openEdit(r)} onPrint={()=>setCertRec(r)} onArchive={()=>doArchive(r)} /></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {viewRec && (
        <ViewModal color="linear-gradient(135deg,#555e6e,#7f8c8d)" icon="🕯️" title={viewRec.deceasedName} subtitle={`Funeral Record · ${viewRec.registerNumber||'No Register No.'}`} onClose={()=>setViewRec(null)}>
          <div className="rec-detail-grid">
            <D label="Register No." value={viewRec.registerNumber} />
            <D label="Deceased" value={viewRec.deceasedName} />
            <D label="Age" value={viewRec.deceasedAge} />
            <D label="Gender" value={viewRec.deceasedGender} />
            <D label="Religion" value={viewRec.religion} />
            <D label="Date of Death" value={viewRec.dateOfDeath} />
            <D label="Place of Death" value={viewRec.placeOfDeath} />
            <D label="Cause of Death" value={viewRec.causeOfDeath} />
            <D label="Funeral Mass Date" value={viewRec.funeralMassDate} />
            <D label="Funeral Time" value={viewRec.funeralMassTime} />
            <D label="Mass Location" value={viewRec.funeralLocation} />
            <D label="Priest" value={viewRec.celebratingPriest} />
            <D label="Vigil" value={viewRec.vigil?`✅ ${viewRec.vigilDate} ${viewRec.vigilTime} @ ${viewRec.vigilLocation}`:'❌ No'} />
            <D label="Burial Date" value={viewRec.burialDate} />
            <D label="Burial Location" value={viewRec.burialLocation} />
            <D label="Burial Type" value={viewRec.burialType} />
            <D label="Requested By" value={`${viewRec.requestedBy} (${viewRec.relationship})`} />
            <D label="Contact" value={viewRec.contactNumber} />
            <D label="Record Issued" value={viewRec.certificateIssued?'✅ Yes':'Pending'} />
            <D label="Mass Scheduled" value={viewRec.scheduleMass?`✅ ${viewRec.massDate}`:'❌ No'} />
          </div>
          <div style={{display:'flex',gap:'10px',marginTop:'16px',flexWrap:'wrap'}}>
            <button className="btn-primary" onClick={()=>{setViewRec(null);setCertRec(viewRec);}}>📜 View Record</button>
            <button className="btn-secondary" onClick={()=>{setViewRec(null);openEdit(viewRec);}}>✏️ Edit</button>
            <button className="btn-archive" onClick={()=>{setViewRec(null);doArchive(viewRec);}}>🗃️ Archive</button>
            <button className="btn-secondary" onClick={()=>setViewRec(null)}>Close</button>
          </div>
        </ViewModal>
      )}

      {certRec && (
        <Certificate id="funeral-cert" title="Funeral / Burial Record" onClose={()=>setCertRec(null)}>
          <div className="cert-body">
            <div className="cert-title">FUNERAL / BURIAL RECORD</div>
            <div className="cert-church">Metropolitan Cathedral of the Immaculate Conception<br/>Zamboanga City, Philippines</div>
            <div className="cert-cross">✝</div>
            <p className="cert-intro">This is to certify that the Funeral Mass was celebrated for:</p>
            <table className="cert-table"><tbody>
              <tr><td className="cl">Deceased Name</td><td className="cv">{certRec.deceasedName}</td></tr>
              <tr><td className="cl">Age</td><td className="cv">{certRec.deceasedAge||'N/A'}</td></tr>
              <tr><td className="cl">Date of Death</td><td className="cv">{certRec.dateOfDeath||'N/A'}</td></tr>
              <tr><td className="cl">Place of Death</td><td className="cv">{certRec.placeOfDeath||'N/A'}</td></tr>
              <tr><td className="cl">Burial Location</td><td className="cv">{certRec.burialLocation||'N/A'}</td></tr>
              <tr><td className="cl">Requested By</td><td className="cv">{certRec.requestedBy||'N/A'} ({certRec.relationship||'Family'})</td></tr>
            </tbody></table>
            <p className="cert-main">The Funeral Mass was celebrated<br/>on the <strong>{ordinalDate(certRec.funeralMassDate)}</strong><br/>at <strong>{certRec.funeralLocation||'N/A'}</strong>.</p>
            <div className="cert-footer">
              <div className="cert-sig"><div className="cert-sig-line"/><div>Celebrating Priest<br/><strong>{certRec.celebratingPriest||'To be assigned'}</strong></div></div>
              <div className="cert-reg">Register No.: <strong>{certRec.registerNumber||'Pending'}</strong><br/>Issued: {new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</div>
            </div>
          </div>
        </Certificate>
      )}

      {show && (
        <div className="modal-overlay" onClick={()=>setShow(false)}>
          <div className="modal rec-form-modal" onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <h2>{f.id?'✏️ Edit Record':'🕯️ Add Funeral Record'}</h2>
              <button className="close-panel" onClick={()=>setShow(false)}>✕</button>
            </div>
            {!f.id && <div className="register-badge"><span>📋 Auto Register Number:</span><strong>{f.registerNumber}</strong></div>}

            <SL>🧑 Deceased Information</SL>
            <ParishionerSelect label="Auto-fill Deceased from Parish Directory" onSelect={p => {
              set('deceasedName', `${p.firstName} ${p.lastName}`);
              set('deceasedAge', p.birthdate ? String(new Date().getFullYear() - new Date(p.birthdate).getFullYear()) : '');
              set('deceasedGender', p.sex || '');
              set('deceasedReligion', 'Catholic');
            }} />
            <div className="form-row">
              <div className="form-group"><label>Full Name *</label><input placeholder="Deceased's full name" value={f.deceasedName} onChange={e=>set('deceasedName',e.target.value)} /></div>
              <div className="form-group"><label>Age</label><input type="number" value={f.deceasedAge} onChange={e=>set('deceasedAge',e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Gender</label><select value={f.deceasedGender} onChange={e=>set('deceasedGender',e.target.value)}><option value="">Select</option><option>Male</option><option>Female</option></select></div>
              <div className="form-group"><label>Religion</label><select value={f.religion} onChange={e=>set('religion',e.target.value)}>{RELIGIONS.map(r=><option key={r}>{r}</option>)}</select></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Date of Death</label><input type="date" value={f.dateOfDeath} onChange={e=>set('dateOfDeath',e.target.value)} /></div>
              <div className="form-group"><label>Place of Death</label><input placeholder="e.g., Zamboanga City Medical Center" value={f.placeOfDeath} onChange={e=>set('placeOfDeath',e.target.value)} /></div>
            </div>
            <div className="form-group"><label>Cause of Death</label><input placeholder="e.g., Natural causes, Illness" value={f.causeOfDeath} onChange={e=>set('causeOfDeath',e.target.value)} /></div>

            <SL>⛪ Funeral Mass</SL>
            <div className="form-row">
              <div className="form-group"><label>Funeral Mass Date *</label><input type="date" value={f.funeralMassDate} onChange={e=>set('funeralMassDate',e.target.value)} /></div>
              <div className="form-group"><label>Time</label><input type="time" value={f.funeralMassTime} onChange={e=>set('funeralMassTime',e.target.value)} /></div>
            </div>
            <div className="form-group"><label>Mass Location</label><LocationSelect value={f.funeralLocation} onChange={e=>set('funeralLocation',e.target.value)} customValue={f.customLocation} onCustomChange={e=>set('customLocation',e.target.value)} /></div>
            <div className="form-group"><label>Celebrating Priest</label><PriestSelect value={f.celebratingPriest} onChange={e=>set('celebratingPriest',e.target.value)} customValue={f.customPriest} onCustomChange={e=>set('customPriest',e.target.value)} /></div>

            <SL>🕯️ Wake / Vigil</SL>
            <label className="check-label"><input type="checkbox" checked={f.vigil} onChange={e=>set('vigil',e.target.checked)} style={{width:'auto'}} /> Vigil / Wake to be held at the church</label>
            {f.vigil && (
              <div className="form-row" style={{marginTop:'8px'}}>
                <div className="form-group"><label>Vigil Date</label><input type="date" value={f.vigilDate} onChange={e=>set('vigilDate',e.target.value)} /></div>
                <div className="form-group"><label>Time</label><input type="time" value={f.vigilTime} onChange={e=>set('vigilTime',e.target.value)} /></div>
                <div className="form-group"><label>Location</label><input value={f.vigilLocation} onChange={e=>set('vigilLocation',e.target.value)} /></div>
              </div>
            )}

            <SL>⚰️ Burial</SL>
            <div className="form-row">
              <div className="form-group"><label>Burial Date</label><input type="date" value={f.burialDate} onChange={e=>set('burialDate',e.target.value)} /></div>
              <div className="form-group"><label>Burial Type</label><select value={f.burialType} onChange={e=>set('burialType',e.target.value)}>{BURIAL_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            </div>
            <div className="form-group"><label>Burial Location / Cemetery</label><input placeholder="e.g., Sta. Cruz Cemetery" value={f.burialLocation} onChange={e=>set('burialLocation',e.target.value)} /></div>

            <SL>👤 Requested By (Family Representative)</SL>
            <div className="form-row">
              <div className="form-group"><label>Name</label><input value={f.requestedBy} onChange={e=>set('requestedBy',e.target.value)} /></div>
              <div className="form-group"><label>Relationship to Deceased</label><input placeholder="e.g., Son, Daughter, Spouse" value={f.relationship} onChange={e=>set('relationship',e.target.value)} /></div>
            </div>
            <div className="form-group"><label>Contact Number</label><input value={f.contactNumber} onChange={e=>set('contactNumber',e.target.value)} /></div>

            <label className="check-label"><input type="checkbox" checked={f.certificateIssued} onChange={e=>set('certificateIssued',e.target.checked)} style={{width:'auto'}} /> Record / Certificate Issued</label>

            <MassScheduleFields scheduleMass={f.scheduleMass} onChange={set} massDate={f.massDate} massTime={f.massTime} massLocation={f.massLocation} customLocation={f.customMassLocation} onCustomLocation={e=>set('customMassLocation',e.target.value)} />

            <div className="form-group"><label>Register Number</label><input value={f.registerNumber} onChange={e=>set('registerNumber',e.target.value)} /></div>
            <div className="form-group"><label>Notes</label><textarea rows={2} value={f.notes} onChange={e=>set('notes',e.target.value)} /></div>
            <div style={{display:'flex',gap:'12px',marginTop:'12px'}}>
              <button className="btn-primary" style={{flex:1}} onClick={handleSubmit}>💾 Save Record</button>
              <button className="btn-secondary" onClick={()=>setShow(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// REPORTS
// ══════════════════════════════════════════════════════════════════════════════
function ReportsPage() {
  const { baptisms, marriages, funerals, confirmations, firstCommunions } = useApp();
  const now = new Date();
  const thisMonth = (arr, key) => arr.filter(r=>{ const d=new Date(r[key]); return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear(); });
  const active = (arr) => arr.filter(r=>!r.archived);

  const monthData = [
    { label:'Baptisms', icon:'💧', count:thisMonth(baptisms,'baptismDate').length },
    { label:'Weddings', icon:'💍', count:thisMonth(marriages,'weddingDate').length },
    { label:'Funerals', icon:'🕯️', count:thisMonth(funerals,'funeralMassDate').length },
    { label:'1st Communions', icon:'🍞', count:thisMonth(firstCommunions,'firstCommunionDate').length },
    { label:'Confirmations', icon:'🕊️', count:thisMonth(confirmations,'confirmationDate').length },
  ];
  const totalData = [
    { label:'Baptisms', icon:'💧', count:active(baptisms).length },
    { label:'1st Communions', icon:'🍞', count:active(firstCommunions).length },
    { label:'Confirmations', icon:'🕊️', count:active(confirmations).length },
    { label:'Marriages', icon:'💍', count:active(marriages).length },
    { label:'Funeral Records', icon:'🕯️', count:active(funerals).length },
  ];

  const handlePrint = () => window.print();

  return (
    <div id="reports-printable">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px',flexWrap:'wrap',gap:'10px'}}>
        <h2 style={{margin:0}}>📊 Sacramental Reports</h2>
        <button className="btn-primary" style={{fontSize:'0.88rem'}} onClick={handlePrint}>🖨️ Print / Export Report</button>
      </div>
      <div className="report-church-name">Metropolitan Cathedral of the Immaculate Conception · Zamboanga City, Philippines</div>
      <div className="report-date-line">Generated: {now.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</div>

      <h3 style={{margin:'20px 0 12px',color:'var(--primary)'}}>📅 {now.toLocaleDateString('en-US',{month:'long',year:'numeric'})} — This Month</h3>
      <div className="reports-grid">
        {monthData.map(d=>(
          <div key={d.label} className="card">
            <h4>{d.icon} {d.label}</h4>
            <div className="report-count">{d.count}</div>
          </div>
        ))}
      </div>

      <h3 style={{margin:'28px 0 12px',color:'var(--primary)'}}>📈 All Time Totals</h3>
      <div className="reports-grid">
        {totalData.map(d=>(
          <div key={d.label} className="card">
            <h4>{d.icon} Total {d.label}</h4>
            <div className="report-count">{d.count}</div>
          </div>
        ))}
      </div>

      <div className="report-summary-table">
        <h3>📋 Summary Table</h3>
        <table>
          <thead><tr><th>Sacrament</th><th>This Month</th><th>All Time</th></tr></thead>
          <tbody>
            {monthData.map((m,i)=>(
              <tr key={m.label}>
                <td>{m.icon} {m.label}</td>
                <td style={{textAlign:'center',fontWeight:'bold'}}>{m.count}</td>
                <td style={{textAlign:'center',fontWeight:'bold',color:'var(--primary)'}}>{totalData[i].count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #reports-printable, #reports-printable * { visibility: visible; }
          #reports-printable { position: absolute; left: 0; top: 0; width: 100%; }
          button { display: none !important; }
          .records-subnav { display: none !important; }
        }
      `}</style>
    </div>
  );
}
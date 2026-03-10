import { useState } from 'react';
import { useApp } from '../../AppContext';
import './Requests.css';

const TABS = ['Event Requests', 'Record Requests', 'Membership Requests', 'Clerk Accounts'];

export default function Requests() {
  const [tab, setTab] = useState('Event Requests');
  const { eventRequests, recordRequests, membershipRequests, updateEventRequest, updateRecordRequest, updateMembershipRequest, priests, baptisms, confirmations, firstCommunions, marriages, funerals, clerkAccounts, activateClerkAccount, deleteClerkAccount } = useApp();

  const pending = (arr) => arr.filter(r => r.status === 'Pending').length;
  const pendingClerks = (clerkAccounts || []).filter(a => !a.active).length;

  const records = { baptisms, confirmations, firstCommunions, marriages, funerals };

  return (
    <div className="requests-page">
      <div className="requests-header">
        <h1>📬 Requests Manager</h1>
        <p>Review and respond to client requests. Approve or decline each one.</p>
      </div>

      <div className="requests-tabs">
        {TABS.map(t => {
          const count = t === 'Event Requests' ? pending(eventRequests)
            : t === 'Record Requests' ? pending(recordRequests)
            : t === 'Membership Requests' ? pending(membershipRequests)
            : pendingClerks;
          return (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t} {count > 0 && <span className="pending-badge">{count}</span>}
            </button>
          );
        })}
      </div>

      {tab === 'Event Requests' && <EventRequestTable requests={eventRequests} onUpdate={updateEventRequest} priests={priests || []} />}
      {tab === 'Record Requests' && <RecordRequestTable requests={recordRequests} onUpdate={updateRecordRequest} records={records} />}
      {tab === 'Membership Requests' && <MembershipRequestTable requests={membershipRequests} onUpdate={updateMembershipRequest} />}
      {tab === 'Clerk Accounts' && <ClerkAccountsTable accounts={clerkAccounts || []} onActivate={activateClerkAccount} onDelete={deleteClerkAccount} />}
    </div>
  );
}

// ── Event Requests ────────────────────────────────────────────────────────────
function EventRequestTable({ requests, onUpdate, priests }) {
  const [assigningId, setAssigningId] = useState(null);
  const [priestInput, setPriestInput] = useState('');
  const [customPriest, setCustomPriest] = useState('');
  const [filter, setFilter] = useState('All');

  const activePriests = priests.filter(p => !p.archived && p.status === 'Active');
  const sorted = [...requests].sort((a, b) => b.id - a.id);
  const filtered = filter === 'All' ? sorted : sorted.filter(r => r.status === filter);

  const handleApprove = (id) => { setAssigningId(id); setPriestInput(''); setCustomPriest(''); };
  const confirmApprove = (id) => {
    const finalPriest = priestInput === 'manual' ? customPriest : priestInput;
    if (!finalPriest) { alert('Please assign a priest before approving.'); return; }
    onUpdate(id, 'Approved', finalPriest);
    setAssigningId(null);
  };

  return (
    <div>
      <StatusFilter filter={filter} onChange={setFilter} />
      {filtered.length === 0 ? <EmptyState icon="📅" msg="No event requests found." /> : filtered.map(r => (
        <div key={r.id} className={`req-card req-${r.status.toLowerCase()}`}>
          <div className="req-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <strong>{r.fullName}</strong>
              <span className={`badge ${r.status === 'Pending' ? 'badge-pending' : r.status === 'Approved' ? 'badge-active' : 'badge-inactive'}`}>{r.status}</span>
              {r.referenceNumber && <span className="ref-badge">Ref: {r.referenceNumber}</span>}
            </div>
            <span className="req-time">{new Date(r.id).toLocaleDateString()}</span>
          </div>
          <div className="req-card-body">
            <ReqDetail label="Event Type" value={r.eventType} />
            <ReqDetail label="Date" value={r.preferredDate} />
            <ReqDetail label="Time" value={r.preferredTime || '—'} />
            <ReqDetail label="Location" value={r.location} />
            <ReqDetail label="Contact" value={r.contact} />
            {r.email && <ReqDetail label="Email" value={r.email} />}
            {r.assignedPriest && <ReqDetail label="Assigned Priest" value={`✝️ ${r.assignedPriest}`} />}
            {r.notes && <div className="req-detail req-full"><span>Notes</span><strong>{r.notes}</strong></div>}
          </div>
          {r.status === 'Pending' && (
            <div className="req-card-actions">
              {assigningId === r.id ? (
                <div className="req-priest-assign">
                  <p style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--accent)' }}>✝️ Assign Officiating Priest</p>
                  <select value={priestInput} onChange={e => setPriestInput(e.target.value)} style={{ marginBottom: '8px' }}>
                    <option value="">-- Select a Priest --</option>
                    {activePriests.map(p => <option key={p.id} value={`${p.title} ${p.firstName} ${p.lastName}`}>{p.title} {p.firstName} {p.lastName}</option>)}
                    <option value="manual">Other / Manual Entry</option>
                  </select>
                  {priestInput === 'manual' && <input placeholder="Enter priest name" value={customPriest} onChange={e => setCustomPriest(e.target.value)} style={{ marginBottom: '8px' }} />}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-success" style={{ flex: 1, padding: '8px' }} onClick={() => confirmApprove(r.id)}>✅ Confirm Approve</button>
                    <button className="btn-secondary" style={{ padding: '8px 14px' }} onClick={() => setAssigningId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-success" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => handleApprove(r.id)}>✅ Approve</button>
                  <button className="btn-danger" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => onUpdate(r.id, 'Declined', '')}>❌ Decline</button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Record Requests ───────────────────────────────────────────────────────────
const RECORD_TYPE_MAP = {
  'Baptismal Certificate': { key: 'baptisms', nameField: 'childName', dateField: 'baptismDate', reg: 'registerNumber' },
  'Confirmation Certificate': { key: 'confirmations', nameField: 'candidateName', dateField: 'confirmationDate', reg: 'registerNumber' },
  'First Communion Certificate': { key: 'firstCommunions', nameField: 'childName', dateField: 'firstCommunionDate', reg: 'registerNumber' },
  'Marriage Certificate': { key: 'marriages', nameField: 'groomName', dateField: 'weddingDate', reg: 'registerNumber' },
  'Death / Funeral Record': { key: 'funerals', nameField: 'deceasedName', dateField: 'funeralMassDate', reg: 'registerNumber' },
};

function RecordRequestTable({ requests, onUpdate, records }) {
  const [viewingRecord, setViewingRecord] = useState(null);
  const [filter, setFilter] = useState('All');
  const sorted = [...requests].sort((a, b) => b.id - a.id);
  const filtered = filter === 'All' ? sorted : sorted.filter(r => r.status === filter);

  const findMatchingRecord = (req) => {
    const map = RECORD_TYPE_MAP[req.recordType];
    if (!map) return null;
    const arr = records[map.key] || [];
    const name = req.fullName?.toLowerCase();
    return arr.find(r =>
      !r.archived && (
        r[map.nameField]?.toLowerCase().includes(name) ||
        (map.key === 'marriages' && r.brideName?.toLowerCase().includes(name))
      )
    ) || null;
  };

  return (
    <div>
      <StatusFilter filter={filter} onChange={setFilter} />
      {filtered.length === 0 ? <EmptyState icon="📄" msg="No record requests found." /> : filtered.map(r => {
        const matched = findMatchingRecord(r);
        return (
          <div key={r.id} className={`req-card req-${r.status.toLowerCase()}`}>
            <div className="req-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <strong>{r.fullName}</strong>
                <span className={`badge ${r.status === 'Pending' ? 'badge-pending' : r.status === 'Approved' ? 'badge-active' : 'badge-inactive'}`}>{r.status}</span>
                {r.referenceNumber && <span className="ref-badge">Ref: {r.referenceNumber}</span>}
              </div>
              <span className="req-time">{new Date(r.id).toLocaleDateString()}</span>
            </div>
            <div className="req-card-body">
              <ReqDetail label="Document Type" value={r.recordType} />
              <ReqDetail label="Full Name" value={r.fullName} />
              <ReqDetail label="Contact" value={r.contact} />
              {r.email && <ReqDetail label="Email" value={r.email} />}
              {r.notes && <div className="req-detail req-full"><span>Notes</span><strong>{r.notes}</strong></div>}
            </div>

            {/* Matching record found in system */}
            {matched && (
              <div className="req-record-found">
                <span>✅ Matching record found in RecordsManager</span>
                <button className="btn-view-link" onClick={() => setViewingRecord({ req: r, rec: matched, map: RECORD_TYPE_MAP[r.recordType] })}>
                  👁️ View Matching Record
                </button>
              </div>
            )}
            {!matched && r.status === 'Pending' && (
              <div className="req-record-missing">
                ⚠️ No matching record found in system for "<em>{r.fullName}</em>" under {r.recordType}
              </div>
            )}

            {r.status === 'Pending' && (
              <div className="req-card-actions">
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-success" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => onUpdate(r.id, 'Approved')}>✅ Approve</button>
                  <button className="btn-danger" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => onUpdate(r.id, 'Declined')}>❌ Decline</button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* View matched record modal */}
      {viewingRecord && (
        <div className="modal-overlay" onClick={() => setViewingRecord(null)}>
          <div className="modal" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📄 Matching Record — {viewingRecord.req.recordType}</h3>
              <button onClick={() => setViewingRecord(null)}>✕</button>
            </div>
            <div style={{ padding: '16px' }}>
              <div className="req-match-info">
                <p><strong>Register No.:</strong> {viewingRecord.rec[viewingRecord.map.reg] || '—'}</p>
                <p><strong>Name:</strong> {viewingRecord.rec[viewingRecord.map.nameField]}</p>
                <p><strong>Date:</strong> {viewingRecord.rec[viewingRecord.map.dateField]}</p>
                {viewingRecord.map.key === 'marriages' && <p><strong>Bride:</strong> {viewingRecord.rec.brideName}</p>}
                <p><strong>Priest:</strong> {viewingRecord.rec.priest || viewingRecord.rec.celebratingPriest || viewingRecord.rec.celebrantPriest || viewingRecord.rec.celebrantBishop || '—'}</p>
                <p><strong>Certificate Issued:</strong> {viewingRecord.rec.certificateIssued ? '✅ Yes' : '❌ Not yet'}</p>
              </div>
              <p className="req-match-note">💡 Go to <strong>Records Manager</strong> to view the full record, edit, or print the certificate.</p>
              <button className="btn-secondary" style={{ width: '100%', marginTop: '10px' }} onClick={() => setViewingRecord(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Membership Requests ───────────────────────────────────────────────────────
function MembershipRequestTable({ requests, onUpdate }) {
  const [filter, setFilter] = useState('All');
  const sorted = [...requests].sort((a, b) => b.id - a.id);
  const filtered = filter === 'All' ? sorted : sorted.filter(r => r.status === filter);

  return (
    <div>
      <StatusFilter filter={filter} onChange={setFilter} />
      {filtered.length === 0 ? <EmptyState icon="🙏" msg="No membership requests found." /> : filtered.map(r => (
        <div key={r.id} className={`req-card req-${r.status.toLowerCase()}`}>
          <div className="req-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {r.photo && <img src={r.photo} alt="" style={{width:'40px',height:'40px',borderRadius:'50%',objectFit:'cover',border:'2px solid var(--primary-light)'}} />}
              <strong>{r.firstName} {r.lastName}</strong>
              <span className={`badge ${r.status === 'Pending' ? 'badge-pending' : r.status === 'Approved' ? 'badge-active' : 'badge-inactive'}`}>{r.status}</span>
              {r.referenceNumber && <span className="ref-badge">Ref: {r.referenceNumber}</span>}
            </div>
            <span className="req-time">{new Date(r.id).toLocaleDateString()}</span>
          </div>
          <div className="req-card-body">
            <ReqDetail label="Full Name" value={`${r.firstName} ${r.middleName ? r.middleName + ' ' : ''}${r.lastName}`} />
            <ReqDetail label="Ministry" value={r.ministry} />
            <ReqDetail label="Birthday" value={r.birthday} />
            <ReqDetail label="Gender" value={r.gender} />
            {r.notes && <div className="req-detail req-full"><span>Notes</span><strong>{r.notes}</strong></div>}
          </div>
          {r.status === 'Pending' && (
            <div className="req-card-actions">
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-success" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => onUpdate(r.id, 'Approved')}>✅ Approve</button>
                <button className="btn-danger" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => onUpdate(r.id, 'Declined')}>❌ Decline</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function ReqDetail({ label, value }) {
  return (
    <div className="req-detail">
      <span>{label}</span>
      <strong>{value || '—'}</strong>
    </div>
  );
}

function StatusFilter({ filter, onChange }) {
  return (
    <div className="req-filter-row">
      {['All', 'Pending', 'Approved', 'Declined'].map(s => (
        <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => onChange(s)}>{s}</button>
      ))}
    </div>
  );
}

function EmptyState({ icon, msg }) {
  return (
    <div className="empty-state">
      <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{icon}</div>
      <p>{msg}</p>
    </div>
  );
}

// ── Clerk Accounts ────────────────────────────────────────────────────────────
function ClerkAccountsTable({ accounts, onActivate, onDelete }) {
  const [filter, setFilter] = useState('All');
  const sorted = [...accounts].sort((a, b) => b.id - a.id);
  const filtered = filter === 'All' ? sorted : filter === 'Pending' ? sorted.filter(a => !a.active) : sorted.filter(a => a.active);

  return (
    <div>
      <div className="req-filter-row">
        {['All', 'Pending', 'Active'].map(s => (
          <button key={s} className={`filter-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>
      {filtered.length === 0 ? <EmptyState icon="👤" msg="No clerk accounts found." /> : filtered.map(a => (
        <div key={a.id} className={`req-card ${a.active ? 'req-approved' : 'req-pending'}`}>
          <div className="req-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <strong>{a.firstName} {a.lastName}</strong>
              <span className={`badge ${a.active ? 'badge-active' : 'badge-pending'}`}>{a.active ? 'Active' : 'Pending Activation'}</span>
            </div>
            <span className="req-time">{new Date(a.id).toLocaleDateString()}</span>
          </div>
          <div className="req-card-body">
            <ReqDetail label="Username" value={a.username} />
            <ReqDetail label="Email" value={a.email} />
            <ReqDetail label="Role" value={a.role} />
            <ReqDetail label="Parish" value={a.parish} />
            <ReqDetail label="Phone" value={a.phone} />
          </div>
          {!a.active && (
            <div className="req-card-actions">
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-success" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => onActivate(a.id)}>✅ Activate Account</button>
                <button className="btn-danger" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => onDelete(a.id)}>❌ Reject</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
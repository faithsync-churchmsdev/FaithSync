import { useState } from 'react';
import { useApp } from '../../AppContext';
import { getEventType } from '../../data/events';
import ConfirmModal from '../../components/ConfirmModal';
import { useConfirm } from '../../hooks/useConfirm';
import './Archives.css';

const TABS = [
  { key: 'Events', icon: '📅' },
  { key: 'Members', icon: '🙏' },
  { key: 'Priests', icon: '✝️' },
  { key: 'Parishioners', icon: '👥' },
  { key: 'Finance', icon: '💰' },
  { key: 'Baptism', icon: '💧' },
  { key: 'First Communion', icon: '🍞' },
  { key: 'Confirmation', icon: '🕊️' },
  { key: 'Marriage', icon: '💍' },
  { key: 'Funeral', icon: '🕯️' },
];

export default function Archives() {
  const [tab, setTab] = useState('Events');
  const [search, setSearch] = useState('');
  const { confirmState, confirm, handleConfirm, handleCancel } = useConfirm();
  const {
    events, restoreEvent, deleteEvent,
    members, restoreMember, deleteMember,
    priests, restorePriest, deletePriest,
    parishioners, restoreParishioner, deleteParishioner,
    transactions, restoreTransaction, deleteTransaction,
    baptisms, restoreBaptism, deleteBaptism,
    firstCommunions, restoreFirstCommunion, deleteFirstCommunion,
    confirmations, restoreConfirmation, deleteConfirmation,
    marriages, restoreMarriage, deleteMarriage,
    funerals, restoreFuneral, deleteFuneral,
  } = useApp();

  const archived = {
    Events: events.filter(e => e.archived),
    Members: members.filter(m => m.archived),
    Priests: (priests || []).filter(p => p.archived),
    Parishioners: parishioners.filter(p => p.archived),
    Finance: transactions.filter(t => t.archived),
    Baptism: baptisms.filter(b => b.archived),
    'First Communion': firstCommunions.filter(f => f.archived),
    Confirmation: confirmations.filter(c => c.archived),
    Marriage: marriages.filter(m => m.archived),
    Funeral: funerals.filter(f => f.archived),
  };

  const doRestore = async (label, fn) => {
    const ok = await confirm({
      icon: '↩️',
      title: `Restore this ${label}?`,
      message: 'This will move it back to the active list.',
      confirmLabel: '↩️ Yes, Restore',
      confirmColor: 'var(--success)',
    });
    if (ok) fn();
  };

  const doDelete = async (label, fn) => {
    const ok = await confirm({
      icon: '🗑️',
      title: `Permanently delete this ${label}?`,
      message: 'This action cannot be undone. The record will be gone forever.',
      confirmLabel: '🗑️ Yes, Delete',
      confirmColor: 'var(--danger)',
    });
    if (ok) fn();
  };

  const Btns = ({ onRestore, onDelete }) => (
    <div style={{ display: 'flex', gap: '6px' }}>
      <button className="btn-success" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={onRestore}>↩️ Restore</button>
      <button className="btn-danger" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={onDelete}>🗑️ Delete</button>
    </div>
  );

  const q = search.toLowerCase();
  const filter = (items, fields) =>
    !q ? items : items.filter(item => fields.some(f => String(item[f] || '').toLowerCase().includes(q)));

  const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <div className="archives-page">
      <div className="archives-header">
        <h1>🗃️ Archives</h1>
        <p>Archived items are safely stored here. <strong>Restore</strong> them back to active lists or <strong>permanently delete</strong> them.</p>
      </div>

      <input className="arc-search" placeholder="🔍 Search archived records..." value={search} onChange={e => setSearch(e.target.value)} />

      <div className="archives-tabs">
        {TABS.map(({ key, icon }) => (
          <button key={key} className={`tab-btn ${tab === key ? 'active' : ''}`} onClick={() => { setTab(key); setSearch(''); }}>
            {icon} {key} {archived[key].length > 0 && <span className="arc-count">{archived[key].length}</span>}
          </button>
        ))}
      </div>

      {tab === 'Events' && <ArcTable items={filter(archived.Events, ['title', 'location'])} empty="No archived events." cols={['', 'Title', 'Date', 'Time', 'Location', 'Archived', 'Actions']}
        renderRow={e => { const t = getEventType(e.type); return (
          <tr key={e.id}><td>{t.icon}</td><td><strong>{e.title}</strong></td><td>{e.date}</td><td>{e.time || '—'}</td><td>{e.location}</td>
          <td className="date-col">{fmtDate(e.archivedAt)}</td>
          <td><Btns onRestore={() => doRestore('event', () => restoreEvent(e.id))} onDelete={() => doDelete('event', () => deleteEvent(e.id))} /></td></tr>
        );}} />}

      {tab === 'Members' && <ArcTable items={filter(archived.Members, ['firstName', 'lastName', 'ministry'])} empty="No archived members." cols={['Name', 'Ministry', 'Role', 'Gender', 'Status', 'Archived', 'Actions']}
        renderRow={m => (
          <tr key={m.id}><td>{m.firstName} {m.lastName}</td><td>{m.ministry}</td><td>{m.role}</td><td>{m.gender}</td>
          <td><span className={`badge badge-${m.status?.toLowerCase()}`}>{m.status}</span></td>
          <td className="date-col">{fmtDate(m.archivedAt)}</td>
          <td><Btns onRestore={() => doRestore('member', () => restoreMember(m.id))} onDelete={() => doDelete('member', () => deleteMember(m.id))} /></td></tr>
        )} />}

      {tab === 'Priests' && <ArcTable items={filter(archived.Priests, ['firstName', 'lastName', 'specialization'])} empty="No archived priests." cols={['Name', 'Title', 'Specialization', 'Archived', 'Actions']}
        renderRow={p => (
          <tr key={p.id}><td>{p.title} {p.firstName} {p.lastName}</td><td>{p.title}</td><td>{p.specialization}</td>
          <td className="date-col">{fmtDate(p.archivedAt)}</td>
          <td><Btns onRestore={() => doRestore('priest', () => restorePriest(p.id))} onDelete={() => doDelete('priest', () => deletePriest(p.id))} /></td></tr>
        )} />}

      {tab === 'Parishioners' && <ArcTable items={filter(archived.Parishioners, ['firstName', 'lastName', 'city'])} empty="No archived parishioners." cols={['Name', 'Sex', 'Birthdate', 'City', 'Contact', 'Archived', 'Actions']}
        renderRow={p => (
          <tr key={p.id}><td>{p.firstName} {p.lastName}</td><td>{p.sex}</td><td>{p.birthdate}</td><td>{p.city}</td><td>{p.contact}</td>
          <td className="date-col">{fmtDate(p.archivedAt)}</td>
          <td><Btns onRestore={() => doRestore('parishioner', () => restoreParishioner(p.id))} onDelete={() => doDelete('parishioner', () => deleteParishioner(p.id))} /></td></tr>
        )} />}

      {tab === 'Finance' && <ArcTable items={filter(archived.Finance, ['category', 'description'])} empty="No archived transactions." cols={['Date', 'Type', 'Category', 'Amount', 'Description', 'Archived', 'Actions']}
        renderRow={t => (
          <tr key={t.id}><td>{t.date}</td>
          <td><span className={`badge ${t.type === 'income' ? 'badge-active' : 'badge-inactive'}`}>{t.type === 'income' ? 'Income' : 'Expense'}</span></td>
          <td>{t.category}</td><td style={{ fontWeight: 'bold', color: t.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>₱{t.amount?.toLocaleString()}</td>
          <td>{t.description}</td><td className="date-col">{fmtDate(t.archivedAt)}</td>
          <td><Btns onRestore={() => doRestore('transaction', () => restoreTransaction(t.id))} onDelete={() => doDelete('transaction', () => deleteTransaction(t.id))} /></td></tr>
        )} />}

      {tab === 'Baptism' && <ArcTable items={filter(archived.Baptism, ['childName', 'fatherName', 'motherName', 'registerNumber'])} empty="No archived baptism records." cols={['Reg. No.', 'Child', 'Baptism Date', 'Parents', 'Priest', 'Archived', 'Actions']}
        renderRow={b => (
          <tr key={b.id}><td><strong>{b.registerNumber || '—'}</strong></td><td>{b.childName}</td><td>{b.baptismDate}</td>
          <td style={{ fontSize: '0.85rem' }}>{b.fatherName} & {b.motherName}</td><td>{b.priest || '—'}</td>
          <td className="date-col">{fmtDate(b.archivedAt)}</td>
          <td><Btns onRestore={() => doRestore('baptism record', () => restoreBaptism(b.id))} onDelete={() => doDelete('baptism record', () => deleteBaptism(b.id))} /></td></tr>
        )} />}

      {tab === 'First Communion' && <ArcTable items={filter(archived['First Communion'], ['childName', 'fatherName', 'registerNumber'])} empty="No archived First Communion records." cols={['Reg. No.', 'Child', 'Communion Date', 'Father', 'Mother', 'Priest', 'Archived', 'Actions']}
        renderRow={fc => (
          <tr key={fc.id}><td><strong>{fc.registerNumber || '—'}</strong></td><td>{fc.childName}</td><td>{fc.firstCommunionDate}</td>
          <td>{fc.fatherName || '—'}</td><td>{fc.motherName || '—'}</td><td>{fc.celebrantPriest || '—'}</td>
          <td className="date-col">{fmtDate(fc.archivedAt)}</td>
          <td><Btns onRestore={() => doRestore('First Communion record', () => restoreFirstCommunion(fc.id))} onDelete={() => doDelete('First Communion record', () => deleteFirstCommunion(fc.id))} /></td></tr>
        )} />}

      {tab === 'Confirmation' && <ArcTable items={filter(archived.Confirmation, ['candidateName', 'confirmationName', 'registerNumber'])} empty="No archived Confirmation records." cols={['Reg. No.', 'Candidate', 'Conf. Name', 'Date', 'Bishop/Priest', 'Archived', 'Actions']}
        renderRow={c => (
          <tr key={c.id}><td><strong>{c.registerNumber || '—'}</strong></td><td>{c.candidateName}</td><td>{c.confirmationName || '—'}</td>
          <td>{c.confirmationDate}</td><td>{c.celebrantBishop || '—'}</td>
          <td className="date-col">{fmtDate(c.archivedAt)}</td>
          <td><Btns onRestore={() => doRestore('Confirmation record', () => restoreConfirmation(c.id))} onDelete={() => doDelete('Confirmation record', () => deleteConfirmation(c.id))} /></td></tr>
        )} />}

      {tab === 'Marriage' && <ArcTable items={filter(archived.Marriage, ['groomName', 'brideName', 'registerNumber'])} empty="No archived marriage records." cols={['Reg. No.', 'Groom', 'Bride', 'Wedding Date', 'Priest', 'Archived', 'Actions']}
        renderRow={m => (
          <tr key={m.id}><td><strong>{m.registerNumber || '—'}</strong></td><td>{m.groomName}</td><td>{m.brideName}</td>
          <td>{m.weddingDate}</td><td>{m.celebratingPriest || '—'}</td>
          <td className="date-col">{fmtDate(m.archivedAt)}</td>
          <td><Btns onRestore={() => doRestore('marriage record', () => restoreMarriage(m.id))} onDelete={() => doDelete('marriage record', () => deleteMarriage(m.id))} /></td></tr>
        )} />}

      {tab === 'Funeral' && <ArcTable items={filter(archived.Funeral, ['deceasedName', 'requestedBy', 'registerNumber'])} empty="No archived funeral records." cols={['Reg. No.', 'Deceased', 'Date of Death', 'Funeral Mass', 'Priest', 'Archived', 'Actions']}
        renderRow={f => (
          <tr key={f.id}><td><strong>{f.registerNumber || '—'}</strong></td><td>{f.deceasedName}</td><td>{f.dateOfDeath || '—'}</td>
          <td>{f.funeralMassDate}</td><td>{f.celebratingPriest || '—'}</td>
          <td className="date-col">{fmtDate(f.archivedAt)}</td>
          <td><Btns onRestore={() => doRestore('funeral record', () => restoreFuneral(f.id))} onDelete={() => doDelete('funeral record', () => deleteFuneral(f.id))} /></td></tr>
        )} />}

      <ConfirmModal {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}

function ArcTable({ items, empty, cols, renderRow }) {
  if (items.length === 0) return (
    <div className="arc-empty">
      <div className="arc-empty-icon">📭</div>
      <p>{empty}</p>
      <small>Items you archive will appear here for safekeeping.</small>
    </div>
  );
  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead><tr>{cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>{items.map(renderRow)}</tbody>
      </table>
    </div>
  );
}
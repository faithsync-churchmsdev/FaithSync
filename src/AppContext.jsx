import { createContext, useContext, useState } from 'react';
import { initialEvents } from './data/events';
import { initialMembers, initialPriests } from './data/members';
import { initialParishioners, initialBaptisms, initialConfirmations, initialFirstCommunions, initialMarriages, initialFunerals } from './data/records';
import { initialTransactions } from './data/finance';

const AppContext = createContext(null);

const mkLog = (action, category, detail) => ({
  id: Date.now() + Math.random(),
  timestamp: new Date().toISOString(),
  action, category, detail,
});

export function AppProvider({ children }) {
  const [isClerk, setIsClerk] = useState(false);
  const [events, setEvents] = useState(initialEvents);
  const [members, setMembers] = useState(initialMembers);
  const [priests, setPriests] = useState(initialPriests);
  const [parishioners, setParishioners] = useState(initialParishioners);
  const [baptisms, setBaptisms] = useState(initialBaptisms);
  const [confirmations, setConfirmations] = useState(initialConfirmations);
  const [firstCommunions, setFirstCommunions] = useState(initialFirstCommunions);
  const [marriages, setMarriages] = useState(initialMarriages);
  const [funerals, setFunerals] = useState(initialFunerals);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [eventRequests, setEventRequests] = useState([]);
  const [recordRequests, setRecordRequests] = useState([]);
  const [membershipRequests, setMembershipRequests] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [clerkAccounts, setClerkAccounts] = useState([]);
  const addClerkAccount = (acc) => setClerkAccounts(prev => [...prev, { ...acc, active: false }]);
  const activateClerkAccount = (id) => { setClerkAccounts(prev => prev.map(a => a.id === id ? { ...a, active: true } : a)); };
  const deleteClerkAccount = (id) => setClerkAccounts(prev => prev.filter(a => a.id !== id));
  const [bulletins, setBulletins] = useState([]);
  const addBulletin = (b) => { setBulletins(prev => [b, ...prev]); addLog('Added', 'Bulletin', `"${b.title}"`); };
  const updateBulletin = (id, data) => { setBulletins(prev => prev.map(x => x.id === id ? { ...x, ...data } : x)); addLog('Edited', 'Bulletin', `"${data.title}"`); };
  const deleteBulletin = (id) => setBulletins(prev => prev.filter(x => x.id !== id));
  const togglePinBulletin = (id) => setBulletins(prev => prev.map(x => x.id === id ? { ...x, pinned: !x.pinned } : x));
  const [massSchedules, setMassSchedules] = useState([]);
  const addMassSchedule = (s) => { setMassSchedules(prev => [...prev, s]); addLog('Added', 'Mass Schedule', `${s.day} ${s.time} — ${s.type}`); };
  const deleteMassSchedule = (id) => setMassSchedules(prev => prev.filter(x => x.id !== id));

  const addLog = (action, category, detail) =>
    setActivityLog(prev => [mkLog(action, category, detail), ...prev].slice(0, 200));

  // ── Events ────────────────────────────────────────────────────────────────
  const addEvent = (ev) => {
    const record = { ...ev, id: Date.now(), status: 'approved', archived: false, done: false };
    setEvents(prev => [...prev, record]);
    addLog('Added', 'Event', `"${ev.title}" scheduled on ${ev.date}`);
  };
  const updateEvent = (id, data) => setEvents(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  const archiveEvent = (id) => {
    const e = events.find(x => x.id === id);
    setEvents(prev => prev.map(x => x.id === id ? { ...x, archived: true, archivedAt: new Date().toISOString() } : x));
    if (e) addLog('Archived', 'Event', `"${e.title}"`);
  };
  const markEventDone = (id) => {
    const e = events.find(x => x.id === id);
    setEvents(prev => prev.map(x => x.id === id ? { ...x, done: true } : x));
    if (e) addLog('Completed', 'Event', `"${e.title}" marked as done`);
  };
  const restoreEvent = (id) => {
    const e = events.find(x => x.id === id);
    setEvents(prev => prev.map(x => x.id === id ? { ...x, archived: false, done: false } : x));
    if (e) addLog('Restored', 'Event', `"${e.title}"`);
  };
  const deleteEvent = (id) => {
    const e = events.find(x => x.id === id);
    setEvents(prev => prev.filter(x => x.id !== id));
    if (e) addLog('Deleted', 'Event', `"${e.title}" permanently deleted`);
  };

  // ── Members ───────────────────────────────────────────────────────────────
  const addMember = (m) => {
    setMembers(prev => [...prev, { ...m, id: Date.now(), archived: false }]);
    addLog('Added', 'Member', `${m.firstName} ${m.lastName} — ${m.ministry}`);
  };
  const updateMember = (id, data) => setMembers(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  const archiveMember = (id) => {
    const m = members.find(x => x.id === id);
    setMembers(prev => prev.map(x => x.id === id ? { ...x, archived: true, archivedAt: new Date().toISOString() } : x));
    if (m) addLog('Archived', 'Member', `${m.firstName} ${m.lastName}`);
  };
  const restoreMember = (id) => {
    const m = members.find(x => x.id === id);
    setMembers(prev => prev.map(x => x.id === id ? { ...x, archived: false } : x));
    if (m) addLog('Restored', 'Member', `${m.firstName} ${m.lastName}`);
  };
  const deleteMember = (id) => {
    const m = members.find(x => x.id === id);
    setMembers(prev => prev.filter(x => x.id !== id));
    if (m) addLog('Deleted', 'Member', `${m.firstName} ${m.lastName} permanently deleted`);
  };

  // ── Priests ───────────────────────────────────────────────────────────────
  const addPriest = (p) => {
    setPriests(prev => [...prev, { ...p, id: Date.now(), archived: false }]);
    addLog('Added', 'Priest', `${p.title} ${p.firstName} ${p.lastName}`);
  };
  const updatePriest = (id, data) => setPriests(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  const archivePriest = (id) => {
    const p = priests.find(x => x.id === id);
    setPriests(prev => prev.map(x => x.id === id ? { ...x, archived: true, archivedAt: new Date().toISOString() } : x));
    if (p) addLog('Archived', 'Priest', `${p.title} ${p.firstName} ${p.lastName}`);
  };
  const restorePriest = (id) => {
    const p = priests.find(x => x.id === id);
    setPriests(prev => prev.map(x => x.id === id ? { ...x, archived: false } : x));
    if (p) addLog('Restored', 'Priest', `${p.title} ${p.firstName} ${p.lastName}`);
  };
  const deletePriest = (id) => {
    const p = priests.find(x => x.id === id);
    setPriests(prev => prev.filter(x => x.id !== id));
    if (p) addLog('Deleted', 'Priest', `${p.title} ${p.firstName} ${p.lastName} permanently deleted`);
  };

  // ── Parishioners ──────────────────────────────────────────────────────────
  const addParishioner = (p) => {
    setParishioners(prev => [...prev, { ...p, id: Date.now(), archived: false }]);
    addLog('Added', 'Parishioner', `${p.firstName} ${p.lastName}`);
  };
  const updateParishioner = (id, data) => setParishioners(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  const archiveParishioner = (id) => {
    const p = parishioners.find(x => x.id === id);
    setParishioners(prev => prev.map(x => x.id === id ? { ...x, archived: true, archivedAt: new Date().toISOString() } : x));
    if (p) addLog('Archived', 'Parishioner', `${p.firstName} ${p.lastName}`);
  };
  const restoreParishioner = (id) => {
    const p = parishioners.find(x => x.id === id);
    setParishioners(prev => prev.map(x => x.id === id ? { ...x, archived: false } : x));
    if (p) addLog('Restored', 'Parishioner', `${p.firstName} ${p.lastName}`);
  };
  const deleteParishioner = (id) => {
    const p = parishioners.find(x => x.id === id);
    setParishioners(prev => prev.filter(x => x.id !== id));
    if (p) addLog('Deleted', 'Parishioner', `${p.firstName} ${p.lastName} permanently deleted`);
  };

  // ── Sacraments ────────────────────────────────────────────────────────────
  const addBaptism = (b) => {
    const exists = baptisms.find(x => x.id === b.id);
    setBaptisms(prev => exists ? prev.map(x => x.id === b.id ? { ...b } : x) : [...prev, { ...b, id: b.id || Date.now(), archived: false }]);
    addLog(exists ? 'Updated' : 'Added', 'Baptism', `${b.childName} — ${b.registerNumber}`);
  };
  const archiveBaptism = (id) => {
    const b = baptisms.find(x => x.id === id);
    setBaptisms(prev => prev.map(x => x.id === id ? { ...x, archived: true, archivedAt: new Date().toISOString() } : x));
    if (b) addLog('Archived', 'Baptism', `${b.childName}`);
  };
  const restoreBaptism = (id) => {
    const b = baptisms.find(x => x.id === id);
    setBaptisms(prev => prev.map(x => x.id === id ? { ...x, archived: false } : x));
    if (b) addLog('Restored', 'Baptism', `${b.childName}`);
  };
  const deleteBaptism = (id) => {
    const b = baptisms.find(x => x.id === id);
    setBaptisms(prev => prev.filter(x => x.id !== id));
    if (b) addLog('Deleted', 'Baptism', `${b.childName} permanently deleted`);
  };

  const addConfirmation = (c) => {
    const exists = confirmations.find(x => x.id === c.id);
    setConfirmations(prev => exists ? prev.map(x => x.id === c.id ? { ...c } : x) : [...prev, { ...c, id: c.id || Date.now(), archived: false }]);
    addLog(exists ? 'Updated' : 'Added', 'Confirmation', `${c.candidateName} — ${c.registerNumber}`);
  };
  const archiveConfirmation = (id) => {
    const c = confirmations.find(x => x.id === id);
    setConfirmations(prev => prev.map(x => x.id === id ? { ...x, archived: true, archivedAt: new Date().toISOString() } : x));
    if (c) addLog('Archived', 'Confirmation', `${c.candidateName}`);
  };
  const restoreConfirmation = (id) => {
    const c = confirmations.find(x => x.id === id);
    setConfirmations(prev => prev.map(x => x.id === id ? { ...x, archived: false } : x));
    if (c) addLog('Restored', 'Confirmation', `${c.candidateName}`);
  };
  const deleteConfirmation = (id) => {
    const c = confirmations.find(x => x.id === id);
    setConfirmations(prev => prev.filter(x => x.id !== id));
    if (c) addLog('Deleted', 'Confirmation', `${c.candidateName} permanently deleted`);
  };

  const addFirstCommunion = (fc) => {
    const exists = firstCommunions.find(x => x.id === fc.id);
    setFirstCommunions(prev => exists ? prev.map(x => x.id === fc.id ? { ...fc } : x) : [...prev, { ...fc, id: fc.id || Date.now(), archived: false }]);
    addLog(exists ? 'Updated' : 'Added', 'First Communion', `${fc.childName} — ${fc.registerNumber}`);
  };
  const archiveFirstCommunion = (id) => {
    const fc = firstCommunions.find(x => x.id === id);
    setFirstCommunions(prev => prev.map(x => x.id === id ? { ...x, archived: true, archivedAt: new Date().toISOString() } : x));
    if (fc) addLog('Archived', 'First Communion', `${fc.childName}`);
  };
  const restoreFirstCommunion = (id) => {
    const fc = firstCommunions.find(x => x.id === id);
    setFirstCommunions(prev => prev.map(x => x.id === id ? { ...x, archived: false } : x));
    if (fc) addLog('Restored', 'First Communion', `${fc.childName}`);
  };
  const deleteFirstCommunion = (id) => {
    const fc = firstCommunions.find(x => x.id === id);
    setFirstCommunions(prev => prev.filter(x => x.id !== id));
    if (fc) addLog('Deleted', 'First Communion', `${fc.childName} permanently deleted`);
  };

  const addMarriage = (m) => {
    const exists = marriages.find(x => x.id === m.id);
    setMarriages(prev => exists ? prev.map(x => x.id === m.id ? { ...m } : x) : [...prev, { ...m, id: m.id || Date.now(), archived: false }]);
    addLog(exists ? 'Updated' : 'Added', 'Marriage', `${m.groomName} & ${m.brideName} — ${m.registerNumber}`);
  };
  const archiveMarriage = (id) => {
    const m = marriages.find(x => x.id === id);
    setMarriages(prev => prev.map(x => x.id === id ? { ...x, archived: true, archivedAt: new Date().toISOString() } : x));
    if (m) addLog('Archived', 'Marriage', `${m.groomName} & ${m.brideName}`);
  };
  const restoreMarriage = (id) => {
    const m = marriages.find(x => x.id === id);
    setMarriages(prev => prev.map(x => x.id === id ? { ...x, archived: false } : x));
    if (m) addLog('Restored', 'Marriage', `${m.groomName} & ${m.brideName}`);
  };
  const deleteMarriage = (id) => {
    const m = marriages.find(x => x.id === id);
    setMarriages(prev => prev.filter(x => x.id !== id));
    if (m) addLog('Deleted', 'Marriage', `${m.groomName} & ${m.brideName} permanently deleted`);
  };

  const addFuneral = (f) => {
    const exists = funerals.find(x => x.id === f.id);
    setFunerals(prev => exists ? prev.map(x => x.id === f.id ? { ...f } : x) : [...prev, { ...f, id: f.id || Date.now(), archived: false }]);
    addLog(exists ? 'Updated' : 'Added', 'Funeral', `${f.deceasedName} — ${f.registerNumber}`);
  };
  const archiveFuneral = (id) => {
    const f = funerals.find(x => x.id === id);
    setFunerals(prev => prev.map(x => x.id === id ? { ...x, archived: true, archivedAt: new Date().toISOString() } : x));
    if (f) addLog('Archived', 'Funeral', `${f.deceasedName}`);
  };
  const restoreFuneral = (id) => {
    const f = funerals.find(x => x.id === id);
    setFunerals(prev => prev.map(x => x.id === id ? { ...x, archived: false } : x));
    if (f) addLog('Restored', 'Funeral', `${f.deceasedName}`);
  };
  const deleteFuneral = (id) => {
    const f = funerals.find(x => x.id === id);
    setFunerals(prev => prev.filter(x => x.id !== id));
    if (f) addLog('Deleted', 'Funeral', `${f.deceasedName} permanently deleted`);
  };

  // ── Finance ───────────────────────────────────────────────────────────────
  const addTransaction = (t) => {
    setTransactions(prev => [...prev, { ...t, id: Date.now(), status: 'Completed', archived: false }]);
    addLog('Added', 'Finance', `${t.type === 'income' ? 'Income' : 'Expense'}: ₱${t.amount} — ${t.category}`);
  };
  const updateTransaction = (id, data) => setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  const archiveTransaction = (id) => {
    const t = transactions.find(x => x.id === id);
    setTransactions(prev => prev.map(x => x.id === id ? { ...x, archived: true, archivedAt: new Date().toISOString() } : x));
    if (t) addLog('Archived', 'Finance', `₱${t.amount} — ${t.category}`);
  };
  const restoreTransaction = (id) => {
    const t = transactions.find(x => x.id === id);
    setTransactions(prev => prev.map(x => x.id === id ? { ...x, archived: false } : x));
    if (t) addLog('Restored', 'Finance', `₱${t.amount} — ${t.category}`);
  };
  const deleteTransaction = (id) => {
    const t = transactions.find(x => x.id === id);
    setTransactions(prev => prev.filter(x => x.id !== id));
    if (t) addLog('Deleted', 'Finance', `₱${t.amount} — ${t.category} permanently deleted`);
  };

  // ── Requests ──────────────────────────────────────────────────────────────
  const addEventRequest = (r) => {
    const ref = `EV-${Date.now().toString().slice(-6)}`;
    setEventRequests(prev => [...prev, { ...r, id: Date.now(), status: 'Pending', referenceNumber: ref }]);
    addLog('Received', 'Event Request', `"${r.title || r.eventType}" by ${r.fullName || 'Client'} — Ref: ${ref}`);
  };
  const updateEventRequest = (id, status, priest) => {
    const r = eventRequests.find(x => x.id === id);
    setEventRequests(prev => prev.map(x => x.id === id ? { ...x, status, assignedPriest: priest || x.assignedPriest } : x));
    if (r) addLog(status, 'Event Request', `"${r.title || r.eventType}" — ${status}`);
    if (status === 'Approved' && r) {
      setEvents(prev => [...prev, {
        id: Date.now(), title: r.title || r.eventType, date: r.preferredDate || r.date,
        time: r.preferredTime || r.time, type: r.eventType || 'other',
        location: r.location, priest: priest || r.priest,
        status: 'approved', archived: false, done: false
      }]);
    }
  };

  const addRecordRequest = (r) => {
    const ref = `RR-${Date.now().toString().slice(-6)}`;
    setRecordRequests(prev => [...prev, { ...r, id: Date.now(), status: 'Pending', referenceNumber: ref }]);
    addLog('Received', 'Record Request', `${r.recordType} for ${r.fullName} — Ref: ${ref}`);
  };
  const updateRecordRequest = (id, status) => {
    const r = recordRequests.find(x => x.id === id);
    setRecordRequests(prev => prev.map(x => x.id === id ? { ...x, status } : x));
    if (r) addLog(status, 'Record Request', `${r.recordType} for ${r.fullName}`);
  };

  const addMembershipRequest = (r) => {
    const ref = `MR-${Date.now().toString().slice(-6)}`;
    setMembershipRequests(prev => [...prev, { ...r, id: Date.now(), status: 'Pending', referenceNumber: ref }]);
    addLog('Received', 'Membership Request', `${r.firstName} ${r.lastName} applied for ${r.ministry} — Ref: ${ref}`);
  };
  const updateMembershipRequest = (id, status) => {
    const r = membershipRequests.find(x => x.id === id);
    setMembershipRequests(prev => prev.map(x => x.id === id ? { ...x, status } : x));
    if (r) {
      addLog(status, 'Membership Request', `${r.firstName} ${r.lastName} — ${r.ministry}`);
      if (status === 'Approved') {
        addMember({
          firstName: r.firstName, middleName: r.middleName || '', lastName: r.lastName,
          gender: r.gender || '', birthday: r.birthday || '', address: r.address || '',
          contact: r.contact || '', email: r.email || '', ministry: r.ministry || '',
          role: 'Member', status: 'Active', joined: new Date().toISOString().slice(0,10),
          skills: [], availability: [], baptized: false, confirmed: false, firstCommunion: false,
          photo: r.photo || '', notes: r.notes || '', archived: false,
        });
      }
    }
  };

  return (
    <AppContext.Provider value={{
      isClerk, setIsClerk,
      events, addEvent, updateEvent, archiveEvent, markEventDone, restoreEvent, deleteEvent,
      members, addMember, updateMember, archiveMember, restoreMember, deleteMember,
      priests, addPriest, updatePriest, archivePriest, restorePriest, deletePriest,
      parishioners, addParishioner, updateParishioner, archiveParishioner, restoreParishioner, deleteParishioner,
      baptisms, addBaptism, archiveBaptism, restoreBaptism, deleteBaptism,
      confirmations, addConfirmation, archiveConfirmation, restoreConfirmation, deleteConfirmation,
      firstCommunions, addFirstCommunion, archiveFirstCommunion, restoreFirstCommunion, deleteFirstCommunion,
      marriages, addMarriage, archiveMarriage, restoreMarriage, deleteMarriage,
      funerals, addFuneral, archiveFuneral, restoreFuneral, deleteFuneral,
      transactions, addTransaction, updateTransaction, archiveTransaction, restoreTransaction, deleteTransaction,
      eventRequests, addEventRequest, updateEventRequest,
      recordRequests, addRecordRequest, updateRecordRequest,
      membershipRequests, addMembershipRequest, updateMembershipRequest,
      activityLog,
      clerkAccounts, addClerkAccount, activateClerkAccount, deleteClerkAccount,
      bulletins, addBulletin, updateBulletin, deleteBulletin, togglePinBulletin,
      massSchedules, addMassSchedule, deleteMassSchedule,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
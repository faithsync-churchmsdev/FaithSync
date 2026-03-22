import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { sendRequestNotification } from './lib/email';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [role, setRole] = useState(null);
  const [currentChurch, setCurrentChurch] = useState(null);
  const [currentClerk, setCurrentClerk] = useState(null);
  const [selectedChurch, setSelectedChurch] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  // Separate client-side state so it never overwrites clerk data
  const [clientEvents, setClientEvents] = useState([]);
  const [clientBulletins, setClientBulletins] = useState([]);
  const [clientMassSchedules, setClientMassSchedules] = useState([]);
  const [clientMembers, setClientMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [priests, setPriests] = useState([]);
  const [parishioners, setParishioners] = useState([]);
  const [baptisms, setBaptisms] = useState([]);
  const [confirmations, setConfirmations] = useState([]);
  const [firstCommunions, setFirstCommunions] = useState([]);
  const [marriages, setMarriages] = useState([]);
  const [funerals, setFunerals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [eventRequests, setEventRequests] = useState([]);
  const [recordRequests, setRecordRequests] = useState([]);
  const [membershipRequests, setMembershipRequests] = useState([]);
  const [bulletins, setBulletins] = useState([]);
  const [massSchedules, setMassSchedules] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [clerkAccounts, setClerkAccounts] = useState([]);
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Restore session ───────────────────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const email = session.user.email;
        const superAdminEmail = import.meta.env.VITE_SUPER_ADMIN_EMAIL;
        if (email === superAdminEmail) {
          setRole('superadmin');
        } else {
          const { data: clerk } = await supabase
            .from('clerk_accounts')
            .select('*, churches(*)')
            .eq('email', email)
            .single();
          if (clerk && clerk.active) {
            setRole('clerk');
            setCurrentClerk(clerk);
            setCurrentChurch(clerk.churches);
          }
        }
      }
      setAuthLoading(false);
    };
    restoreSession();
  }, []);

  useEffect(() => {
    if (role === 'clerk' && currentChurch) loadAllData(currentChurch.id);
    if (role === 'superadmin') loadChurches();
  }, [role, currentChurch]);

  useEffect(() => {
    if (selectedChurch) loadClientData(selectedChurch.id);
  }, [selectedChurch]);

  const loadAllData = async (cid) => {
    setLoading(true);
    await Promise.all([
      loadEvents(cid), loadMembers(cid), loadPriests(cid),
      loadParishioners(cid), loadBaptisms(cid), loadConfirmations(cid),
      loadFirstCommunions(cid), loadMarriages(cid), loadFunerals(cid),
      loadTransactions(cid), loadEventRequests(cid), loadRecordRequests(cid),
      loadMembershipRequests(cid), loadBulletins(cid), loadMassSchedules(cid),
      loadActivityLog(cid), loadClerkAccounts(cid),
    ]);
    setLoading(false);
  };

  const loadClientData = async (cid) => {
    // Load into SEPARATE client state — never touches clerk's data
    const [evData, blData, msData, mbData] = await Promise.all([
      supabase.from('events').select('*').eq('church_id', cid).eq('status', 'approved').eq('archived', false).eq('done', false).order('date'),
      supabase.from('bulletins').select('*').eq('church_id', cid).order('created_at', { ascending: false }),
      supabase.from('mass_schedules').select('*').eq('church_id', cid),
      supabase.from('members').select('*').eq('church_id', cid).eq('archived', false),
    ]);
    if (evData.data) setClientEvents(evData.data.map(r => ({
      id: r.id, title: r.title, date: r.date, time: r.time,
      type: r.type, location: r.location, priest: r.priest,
      status: r.status, done: r.done, archived: r.archived,
    })));
    if (blData.data) setClientBulletins(blData.data.map(r => ({
      id: r.id, title: r.title, category: r.category,
      content: r.content, author: r.author, pinned: r.pinned, createdAt: r.created_at,
    })));
    if (msData.data) setClientMassSchedules(msData.data.map(r => ({
      id: r.id, day: r.day, time: r.time, type: r.type,
      priest: r.priest, location: r.location, language: r.language, notes: r.notes,
    })));
    if (mbData.data) setClientMembers(mbData.data.map(r => ({
      id: r.id, lastName: r.last_name, firstName: r.first_name, middleName: r.middle_name,
      gender: r.gender, birthday: r.birthday, ministry: r.ministry,
      role: r.role, status: r.status, photo: r.photo,
      skills: r.skills || [], availability: r.availability || [],
      joined: r.joined, archived: r.archived,
    })));
  };

  const loadChurches = async () => {
    const { data } = await supabase.from('churches').select('*').order('created_at', { ascending: false });
    if (data) setChurches(data);
  };

  // ── Loaders ───────────────────────────────────────────────────────────────
  const loadEvents = async (cid) => {
    const { data } = await supabase.from('events').select('*').eq('church_id', cid).order('date', { ascending: false });
    if (data) setEvents(data.map(r => ({
      id: r.id, churchId: r.church_id, title: r.title, date: r.date, time: r.time,
      type: r.type, location: r.location, priest: r.priest, language: r.language,
      notes: r.notes, status: r.status, done: r.done, archived: r.archived, archivedAt: r.archived_at,
    })));
  };

  const loadMembers = async (cid) => {
    const { data } = await supabase.from('members').select('*').eq('church_id', cid);
    if (data) setMembers(data.map(r => ({
      id: r.id, churchId: r.church_id,
      lastName: r.last_name, firstName: r.first_name, middleName: r.middle_name,
      gender: r.gender, birthday: r.birthday, address: r.address,
      contact: r.contact, email: r.email, ministry: r.ministry,
      role: r.role, status: r.status,
      skills: r.skills || [], availability: r.availability || [],
      joined: r.joined, baptized: r.baptized, confirmed: r.confirmed,
      firstCommunion: r.first_communion, photo: r.photo,
      archived: r.archived, archivedAt: r.archived_at,
    })));
  };

  const loadPriests = async (cid) => {
    const { data } = await supabase.from('priests').select('*').eq('church_id', cid);
    if (data) setPriests(data.map(r => ({
      id: r.id, churchId: r.church_id,
      title: r.title, lastName: r.last_name, firstName: r.first_name,
      middleName: r.middle_name, suffix: r.suffix, birthday: r.birthday,
      address: r.address, contact: r.contact, email: r.email,
      specialization: r.specialization, assignedParish: r.assigned_parish,
      status: r.status, ordainedDate: r.ordained_date, notes: r.notes,
      archived: r.archived, archivedAt: r.archived_at,
    })));
  };

  const loadParishioners = async (cid) => {
    const { data } = await supabase.from('parishioners').select('*').eq('church_id', cid);
    if (data) setParishioners(data.map(r => ({
      id: r.id, churchId: r.church_id,
      lastName: r.last_name, firstName: r.first_name, middleName: r.middle_name,
      suffix: r.suffix, birthdate: r.birthdate, birthplace: r.birthplace,
      sex: r.sex, fatherName: r.father_name, motherName: r.mother_name,
      address: r.address, city: r.city, province: r.province,
      contact: r.contact, email: r.email,
      archived: r.archived, archivedAt: r.archived_at,
    })));
  };

  const loadBaptisms = async (cid) => {
    const { data } = await supabase.from('baptisms').select('*').eq('church_id', cid);
    if (data) setBaptisms(data.map(r => ({
      id: r.id, churchId: r.church_id, registerNumber: r.register_number,
      childName: r.child_name, childBirthDate: r.child_birth_date,
      childBirthPlace: r.child_birth_place, childGender: r.child_gender,
      fatherName: r.father_name, fatherReligion: r.father_religion,
      motherName: r.mother_name, motherReligion: r.mother_religion,
      parentsAddress: r.parents_address, parentsPhone: r.parents_phone,
      parentsMarriedInChurch: r.parents_married_in_church,
      godparents: r.godparents || [],
      baptismDate: r.baptism_date, baptismTime: r.baptism_time,
      location: r.location, priest: r.priest,
      birthCertificateSubmitted: r.birth_certificate_submitted,
      marriageCertificateSubmitted: r.marriage_certificate_submitted,
      birthCertFile: r.birth_cert_file, marriageCertFile: r.marriage_cert_file,
      certificateIssued: r.certificate_issued,
      scheduleMass: r.schedule_mass, massDate: r.mass_date,
      massTime: r.mass_time, massLocation: r.mass_location,
      notes: r.notes, status: r.status,
      archived: r.archived, archivedAt: r.archived_at,
    })));
  };

  const loadConfirmations = async (cid) => {
    const { data } = await supabase.from('confirmations').select('*').eq('church_id', cid);
    if (data) setConfirmations(data.map(r => ({
      id: r.id, churchId: r.church_id, registerNumber: r.register_number,
      candidateName: r.candidate_name, candidateBirthDate: r.candidate_birth_date,
      candidateGender: r.candidate_gender, candidateAge: r.candidate_age,
      baptismDate: r.baptism_date, baptismChurch: r.baptism_church,
      firstCommunionDate: r.first_communion_date, firstCommunionChurch: r.first_communion_church,
      fatherName: r.father_name, motherName: r.mother_name, guardianName: r.guardian_name,
      parentsAddress: r.parents_address, parentsPhone: r.parents_phone, parentsEmail: r.parents_email,
      confirmationName: r.confirmation_name, confirmationDate: r.confirmation_date,
      confirmationMass: r.confirmation_mass, celebrantBishop: r.celebrant_bishop,
      sponsorName: r.sponsor_name, sponsorGender: r.sponsor_gender,
      sponsorReligion: r.sponsor_religion, sponsorPhone: r.sponsor_phone,
      catechismClass: r.catechism_class, catechismTeacher: r.catechism_teacher,
      classesCompleted: r.classes_completed, retreatAttended: r.retreat_attended,
      serviceHours: r.service_hours,
      sponsorLetterSubmitted: r.sponsor_letter_submitted, sponsorLetterFile: r.sponsor_letter_file,
      baptismCertFile: r.baptism_cert_file,
      certificateIssued: r.certificate_issued,
      scheduleMass: r.schedule_mass, massDate: r.mass_date,
      massTime: r.mass_time, massLocation: r.mass_location,
      notes: r.notes, status: r.status,
      archived: r.archived, archivedAt: r.archived_at,
    })));
  };

  const loadFirstCommunions = async (cid) => {
    const { data } = await supabase.from('first_communions').select('*').eq('church_id', cid);
    if (data) setFirstCommunions(data.map(r => ({
      id: r.id, churchId: r.church_id, registerNumber: r.register_number,
      childName: r.child_name, childBirthDate: r.child_birth_date, childGender: r.child_gender,
      baptismDate: r.baptism_date, baptismChurch: r.baptism_church,
      fatherName: r.father_name, motherName: r.mother_name,
      parentsAddress: r.parents_address, parentsPhone: r.parents_phone,
      catechismClass: r.catechism_class, catechismTeacher: r.catechism_teacher,
      classesCompleted: r.classes_completed, retreatAttended: r.retreat_attended,
      firstCommunionDate: r.first_communion_date, firstCommunionMass: r.first_communion_mass,
      celebrantPriest: r.celebrant_priest, godparents: r.godparents,
      baptismCertFile: r.baptism_cert_file,
      certificateIssued: r.certificate_issued,
      scheduleMass: r.schedule_mass, massDate: r.mass_date,
      massTime: r.mass_time, massLocation: r.mass_location,
      notes: r.notes, status: r.status,
      archived: r.archived, archivedAt: r.archived_at,
    })));
  };

  const loadMarriages = async (cid) => {
    const { data } = await supabase.from('marriages').select('*').eq('church_id', cid);
    if (data) setMarriages(data.map(r => ({
      id: r.id, churchId: r.church_id, registerNumber: r.register_number,
      groomName: r.groom_name, groomBirthDate: r.groom_birth_date,
      groomBaptismDate: r.groom_baptism_date, groomBaptismChurch: r.groom_baptism_church,
      groomFatherName: r.groom_father_name, groomMotherName: r.groom_mother_name,
      groomConfirmed: r.groom_confirmed,
      groomBaptismCertFile: r.groom_baptism_cert_file,
      groomConfirmationCertFile: r.groom_confirmation_cert_file,
      brideName: r.bride_name, brideBirthDate: r.bride_birth_date,
      brideBaptismDate: r.bride_baptism_date, brideBaptismChurch: r.bride_baptism_church,
      brideFatherName: r.bride_father_name, brideMotherName: r.bride_mother_name,
      brideConfirmed: r.bride_confirmed,
      brideBaptismCertFile: r.bride_baptism_cert_file,
      brideConfirmationCertFile: r.bride_confirmation_cert_file,
      marriageLicenseFile: r.marriage_license_file,
      weddingDate: r.wedding_date, weddingTime: r.wedding_time,
      weddingLocation: r.wedding_location, celebratingPriest: r.celebrating_priest,
      includeMass: r.include_mass,
      preCanaCompleted: r.pre_cana_completed, preCanaDate: r.pre_cana_date,
      banns1Date: r.banns1_date, banns1Done: r.banns1_done,
      banns2Date: r.banns2_date, banns2Done: r.banns2_done,
      banns3Date: r.banns3_date, banns3Done: r.banns3_done,
      bestMan: r.best_man, maidOfHonor: r.maid_of_honor,
      witnesses: r.witnesses || [],
      marriageLicenseNumber: r.marriage_license_number,
      marriageLicenseDate: r.marriage_license_date,
      certificateIssued: r.certificate_issued,
      scheduleMass: r.schedule_mass, massDate: r.mass_date,
      massTime: r.mass_time, massLocation: r.mass_location,
      notes: r.notes,
      archived: r.archived, archivedAt: r.archived_at,
    })));
  };

  const loadFunerals = async (cid) => {
    const { data } = await supabase.from('funerals').select('*').eq('church_id', cid);
    if (data) setFunerals(data.map(r => ({
      id: r.id, churchId: r.church_id, registerNumber: r.register_number,
      deceasedName: r.deceased_name, deceasedAge: r.deceased_age,
      deceasedGender: r.deceased_gender, dateOfDeath: r.date_of_death,
      placeOfDeath: r.place_of_death, causeOfDeath: r.cause_of_death,
      religion: r.religion,
      funeralMassDate: r.funeral_mass_date, funeralMassTime: r.funeral_mass_time,
      funeralLocation: r.funeral_location, celebratingPriest: r.celebrating_priest,
      burialDate: r.burial_date, burialLocation: r.burial_location, burialType: r.burial_type,
      vigil: r.vigil, vigilDate: r.vigil_date, vigilTime: r.vigil_time, vigilLocation: r.vigil_location,
      requestedBy: r.requested_by, relationship: r.relationship, contactNumber: r.contact_number,
      deathCertFile: r.death_cert_file,
      certificateIssued: r.certificate_issued,
      scheduleMass: r.schedule_mass, massDate: r.mass_date,
      massTime: r.mass_time, massLocation: r.mass_location,
      notes: r.notes,
      archived: r.archived, archivedAt: r.archived_at,
    })));
  };

  const loadTransactions = async (cid) => {
    const { data } = await supabase.from('transactions').select('*').eq('church_id', cid);
    if (data) setTransactions(data.map(r => ({
      id: r.id, churchId: r.church_id, type: r.type,
      category: r.category, customCategory: r.custom_category,
      amount: r.amount, date: r.date, method: r.method,
      payer: r.payer, description: r.description,
      status: r.status, archived: r.archived, archivedAt: r.archived_at,
    })));
  };

  const loadEventRequests = async (cid) => {
    const { data } = await supabase.from('event_requests').select('*').eq('church_id', cid).order('created_at', { ascending: false });
    if (data) setEventRequests(data.map(r => ({
      id: r.id, churchId: r.church_id, referenceNumber: r.reference_number,
      fullName: r.full_name, contact: r.contact, email: r.email,
      eventType: r.event_type, preferredDate: r.preferred_date, preferredTime: r.preferred_time,
      location: r.location, notes: r.notes, status: r.status, assignedPriest: r.assigned_priest,
    })));
  };

  const loadRecordRequests = async (cid) => {
    const { data } = await supabase.from('record_requests').select('*').eq('church_id', cid).order('created_at', { ascending: false });
    if (data) setRecordRequests(data.map(r => ({
      id: r.id, churchId: r.church_id, referenceNumber: r.reference_number,
      fullName: r.full_name, contact: r.contact, email: r.email,
      recordType: r.record_type, notes: r.notes, status: r.status,
    })));
  };

  const loadMembershipRequests = async (cid) => {
    const { data } = await supabase.from('membership_requests').select('*').eq('church_id', cid).order('created_at', { ascending: false });
    if (data) setMembershipRequests(data.map(r => ({
      id: r.id, churchId: r.church_id, referenceNumber: r.reference_number,
      firstName: r.first_name, middleName: r.middle_name, lastName: r.last_name,
      gender: r.gender, birthday: r.birthday,
      contact: r.contact, email: r.email, address: r.address,
      ministry: r.ministry, notes: r.notes, photo: r.photo, status: r.status,
    })));
  };

  const loadBulletins = async (cid) => {
    const { data } = await supabase.from('bulletins').select('*').eq('church_id', cid).order('created_at', { ascending: false });
    if (data) setBulletins(data.map(r => ({
      id: r.id, churchId: r.church_id, title: r.title,
      category: r.category, content: r.content, author: r.author,
      pinned: r.pinned, createdAt: r.created_at,
    })));
  };

  const loadMassSchedules = async (cid) => {
    const { data } = await supabase.from('mass_schedules').select('*').eq('church_id', cid);
    if (data) setMassSchedules(data.map(r => ({
      id: r.id, churchId: r.church_id,
      day: r.day, time: r.time, type: r.type,
      priest: r.priest, location: r.location,
      language: r.language, notes: r.notes,
    })));
  };

  const loadActivityLog = async (cid) => {
    const { data } = await supabase.from('activity_log').select('*').eq('church_id', cid).order('created_at', { ascending: false }).limit(200);
    if (data) setActivityLog(data.map(r => ({
      id: r.id, action: r.action, category: r.category,
      detail: r.detail, timestamp: r.created_at,
    })));
  };

  const loadClerkAccounts = async (cid) => {
    const { data } = await supabase.from('clerk_accounts').select('*').eq('church_id', cid);
    if (data) setClerkAccounts(data.map(r => ({
      id: r.id, churchId: r.church_id, authUserId: r.auth_user_id,
      firstName: r.first_name, lastName: r.last_name,
      username: r.username, email: r.email,
      role: r.role, parish: r.parish, phone: r.phone, active: r.active,
    })));
  };

  // ── Activity Log ──────────────────────────────────────────────────────────
  const addLog = async (action, category, detail) => {
    if (!currentChurch) return;
    const { data } = await supabase.from('activity_log')
      .insert({ church_id: currentChurch.id, action, category, detail })
      .select().single();
    if (data) setActivityLog(prev => [{
      id: data.id, action: data.action, category: data.category,
      detail: data.detail, timestamp: data.created_at,
    }, ...prev].slice(0, 200));
  };

  const genRef = (prefix) => `${prefix}-${Date.now().toString().slice(-6)}`;

  // ── EVENTS ────────────────────────────────────────────────────────────────
  const addEvent = async (ev) => {
    const { data, error } = await supabase.from('events').insert({
      church_id: currentChurch.id,
      title: ev.title, date: ev.date, time: ev.time,
      type: ev.type, location: ev.location, priest: ev.priest,
      language: ev.language, notes: ev.notes,
      status: ev.status || 'approved', archived: false, done: false,
    }).select().single();
    if (error) { console.error('addEvent error:', error); return; }
    if (data) {
      setEvents(prev => [...prev, {
        id: data.id, churchId: data.church_id, title: data.title,
        date: data.date, time: data.time, type: data.type,
        location: data.location, priest: data.priest,
        status: data.status, done: data.done, archived: data.archived,
      }]);
      addLog('Added', 'Event', `"${ev.title}" on ${ev.date}`);
    }
  };

  const updateEvent = async (id, ev) => {
    await supabase.from('events').update({
      title: ev.title, date: ev.date, time: ev.time,
      type: ev.type, location: ev.location, priest: ev.priest,
      language: ev.language, notes: ev.notes,
    }).eq('id', id);
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...ev } : e));
  };

  const archiveEvent = async (id) => {
    const e = events.find(x => x.id === id);
    await supabase.from('events').update({ archived: true, archived_at: new Date().toISOString() }).eq('id', id);
    setEvents(prev => prev.map(x => x.id === id ? { ...x, archived: true } : x));
    if (e) addLog('Archived', 'Event', `"${e.title}"`);
  };

  const markEventDone = async (id) => {
    await supabase.from('events').update({ done: true }).eq('id', id);
    setEvents(prev => prev.map(x => x.id === id ? { ...x, done: true } : x));
  };

  const restoreEvent = async (id) => {
    await supabase.from('events').update({ archived: false, done: false }).eq('id', id);
    setEvents(prev => prev.map(x => x.id === id ? { ...x, archived: false, done: false } : x));
  };

  const deleteEvent = async (id) => {
    await supabase.from('events').delete().eq('id', id);
    setEvents(prev => prev.filter(x => x.id !== id));
  };

  // ── MEMBERS ───────────────────────────────────────────────────────────────
  const addMember = async (m) => {
    const { data, error } = await supabase.from('members').insert({
      church_id: currentChurch.id,
      last_name: m.lastName, first_name: m.firstName, middle_name: m.middleName,
      gender: m.gender, birthday: m.birthday, address: m.address,
      contact: m.contact, email: m.email, ministry: m.ministry,
      role: m.role, status: m.status,
      skills: m.skills || [], availability: m.availability || [],
      joined: m.joined, baptized: m.baptized, confirmed: m.confirmed,
      first_communion: m.firstCommunion, photo: m.photo || '',
      archived: false,
    }).select().single();
    if (error) { console.error('addMember error:', error); return; }
    if (data) {
      setMembers(prev => [...prev, {
        id: data.id, churchId: data.church_id,
        lastName: data.last_name, firstName: data.first_name, middleName: data.middle_name,
        gender: data.gender, birthday: data.birthday, address: data.address,
        contact: data.contact, email: data.email, ministry: data.ministry,
        role: data.role, status: data.status,
        skills: data.skills || [], availability: data.availability || [],
        joined: data.joined, baptized: data.baptized, confirmed: data.confirmed,
        firstCommunion: data.first_communion, photo: data.photo,
        archived: false,
      }]);
      addLog('Added', 'Member', `${m.firstName} ${m.lastName}`);
    }
  };

  const updateMember = async (id, m) => {
    await supabase.from('members').update({
      last_name: m.lastName, first_name: m.firstName, middle_name: m.middleName,
      gender: m.gender, birthday: m.birthday, address: m.address,
      contact: m.contact, email: m.email, ministry: m.ministry,
      role: m.role, status: m.status,
      skills: m.skills || [], availability: m.availability || [],
      joined: m.joined, baptized: m.baptized, confirmed: m.confirmed,
      first_communion: m.firstCommunion, photo: m.photo || '',
    }).eq('id', id);
    setMembers(prev => prev.map(x => x.id === id ? { ...x, ...m } : x));
  };

  const archiveMember = async (id) => {
    const m = members.find(x => x.id === id);
    await supabase.from('members').update({ archived: true, archived_at: new Date().toISOString() }).eq('id', id);
    setMembers(prev => prev.map(x => x.id === id ? { ...x, archived: true } : x));
    if (m) addLog('Archived', 'Member', `${m.firstName} ${m.lastName}`);
  };

  const restoreMember = async (id) => {
    await supabase.from('members').update({ archived: false }).eq('id', id);
    setMembers(prev => prev.map(x => x.id === id ? { ...x, archived: false } : x));
  };

  const deleteMember = async (id) => {
    await supabase.from('members').delete().eq('id', id);
    setMembers(prev => prev.filter(x => x.id !== id));
  };

  // ── PRIESTS ───────────────────────────────────────────────────────────────
  const addPriest = async (p) => {
    const { data, error } = await supabase.from('priests').insert({
      church_id: currentChurch.id,
      title: p.title, last_name: p.lastName, first_name: p.firstName,
      middle_name: p.middleName, suffix: p.suffix, birthday: p.birthday,
      address: p.address, contact: p.contact, email: p.email,
      specialization: p.specialization, assigned_parish: p.assignedParish,
      status: p.status, ordained_date: p.ordainedDate, notes: p.notes,
      archived: false,
    }).select().single();
    if (error) { console.error('addPriest error:', error); return; }
    if (data) {
      setPriests(prev => [...prev, {
        id: data.id, churchId: data.church_id,
        title: data.title, lastName: data.last_name, firstName: data.first_name,
        middleName: data.middle_name, suffix: data.suffix, birthday: data.birthday,
        address: data.address, contact: data.contact, email: data.email,
        specialization: data.specialization, assignedParish: data.assigned_parish,
        status: data.status, ordainedDate: data.ordained_date, notes: data.notes,
        archived: false,
      }]);
      addLog('Added', 'Priest', `${p.title} ${p.firstName} ${p.lastName}`);
    }
  };

  const updatePriest = async (id, p) => {
    await supabase.from('priests').update({
      title: p.title, last_name: p.lastName, first_name: p.firstName,
      middle_name: p.middleName, suffix: p.suffix, birthday: p.birthday,
      address: p.address, contact: p.contact, email: p.email,
      specialization: p.specialization, assigned_parish: p.assignedParish,
      status: p.status, ordained_date: p.ordainedDate, notes: p.notes,
    }).eq('id', id);
    setPriests(prev => prev.map(x => x.id === id ? { ...x, ...p } : x));
  };

  const archivePriest = async (id) => {
    const p = priests.find(x => x.id === id);
    await supabase.from('priests').update({ archived: true, archived_at: new Date().toISOString() }).eq('id', id);
    setPriests(prev => prev.map(x => x.id === id ? { ...x, archived: true } : x));
    if (p) addLog('Archived', 'Priest', `${p.title} ${p.firstName} ${p.lastName}`);
  };

  const restorePriest = async (id) => {
    await supabase.from('priests').update({ archived: false }).eq('id', id);
    setPriests(prev => prev.map(x => x.id === id ? { ...x, archived: false } : x));
  };

  const deletePriest = async (id) => {
    await supabase.from('priests').delete().eq('id', id);
    setPriests(prev => prev.filter(x => x.id !== id));
  };

  // ── PARISHIONERS ──────────────────────────────────────────────────────────
  const addParishioner = async (p) => {
    const { data, error } = await supabase.from('parishioners').insert({
      church_id: currentChurch.id,
      last_name: p.lastName, first_name: p.firstName, middle_name: p.middleName,
      suffix: p.suffix, birthdate: p.birthdate, birthplace: p.birthplace,
      sex: p.sex, father_name: p.fatherName, mother_name: p.motherName,
      address: p.address, city: p.city, province: p.province,
      contact: p.contact, email: p.email, archived: false,
    }).select().single();
    if (error) { console.error('addParishioner error:', error); return; }
    if (data) {
      setParishioners(prev => [...prev, {
        id: data.id, churchId: data.church_id,
        lastName: data.last_name, firstName: data.first_name, middleName: data.middle_name,
        suffix: data.suffix, birthdate: data.birthdate, birthplace: data.birthplace,
        sex: data.sex, fatherName: data.father_name, motherName: data.mother_name,
        address: data.address, city: data.city, province: data.province,
        contact: data.contact, email: data.email, archived: false,
      }]);
      addLog('Added', 'Parishioner', `${p.firstName} ${p.lastName}`);
    }
  };

  const updateParishioner = async (id, p) => {
    await supabase.from('parishioners').update({
      last_name: p.lastName, first_name: p.firstName, middle_name: p.middleName,
      suffix: p.suffix, birthdate: p.birthdate, birthplace: p.birthplace,
      sex: p.sex, father_name: p.fatherName, mother_name: p.motherName,
      address: p.address, city: p.city, province: p.province,
      contact: p.contact, email: p.email,
    }).eq('id', id);
    setParishioners(prev => prev.map(x => x.id === id ? { ...x, ...p } : x));
  };

  const archiveParishioner = async (id) => {
    const p = parishioners.find(x => x.id === id);
    await supabase.from('parishioners').update({ archived: true, archived_at: new Date().toISOString() }).eq('id', id);
    setParishioners(prev => prev.map(x => x.id === id ? { ...x, archived: true } : x));
    if (p) addLog('Archived', 'Parishioner', `${p.firstName} ${p.lastName}`);
  };

  const restoreParishioner = async (id) => {
    await supabase.from('parishioners').update({ archived: false }).eq('id', id);
    setParishioners(prev => prev.map(x => x.id === id ? { ...x, archived: false } : x));
  };

  const deleteParishioner = async (id) => {
    await supabase.from('parishioners').delete().eq('id', id);
    setParishioners(prev => prev.filter(x => x.id !== id));
  };

  // ── BAPTISMS ──────────────────────────────────────────────────────────────
  const addBaptism = async (b) => {
    const isUpdate = b.id && baptisms.find(x => x.id === b.id);
    const payload = {
      church_id: currentChurch.id,
      register_number: b.registerNumber,
      child_name: b.childName, child_birth_date: b.childBirthDate,
      child_birth_place: b.childBirthPlace, child_gender: b.childGender,
      father_name: b.fatherName, father_religion: b.fatherReligion,
      mother_name: b.motherName, mother_religion: b.motherReligion,
      parents_address: b.parentsAddress, parents_phone: b.parentsPhone,
      parents_married_in_church: b.parentsMarriedInChurch,
      godparents: b.godparents || [],
      baptism_date: b.baptismDate, baptism_time: b.baptismTime,
      location: b.location, priest: b.priest,
      birth_certificate_submitted: b.birthCertificateSubmitted,
      marriage_certificate_submitted: b.marriageCertificateSubmitted,
      birth_cert_file: b.birthCertFile || null,
      marriage_cert_file: b.marriageCertFile || null,
      certificate_issued: b.certificateIssued,
      schedule_mass: b.scheduleMass, mass_date: b.massDate,
      mass_time: b.massTime, mass_location: b.massLocation,
      notes: b.notes, status: b.status || 'application', archived: false,
    };
    if (isUpdate) {
      await supabase.from('baptisms').update(payload).eq('id', b.id);
      setBaptisms(prev => prev.map(x => x.id === b.id ? { ...x, ...b } : x));
      addLog('Updated', 'Baptism', `${b.childName}`);
    } else {
      const { data, error } = await supabase.from('baptisms').insert(payload).select().single();
      if (error) { console.error('addBaptism error:', error); return; }
      if (data) { setBaptisms(prev => [...prev, { ...b, id: data.id }]); addLog('Added', 'Baptism', `${b.childName}`); }
    }
  };

  const archiveBaptism = async (id) => {
    await supabase.from('baptisms').update({ archived: true, archived_at: new Date().toISOString() }).eq('id', id);
    setBaptisms(prev => prev.map(x => x.id === id ? { ...x, archived: true } : x));
  };

  const restoreBaptism = async (id) => {
    await supabase.from('baptisms').update({ archived: false }).eq('id', id);
    setBaptisms(prev => prev.map(x => x.id === id ? { ...x, archived: false } : x));
  };

  const deleteBaptism = async (id) => {
    await supabase.from('baptisms').delete().eq('id', id);
    setBaptisms(prev => prev.filter(x => x.id !== id));
  };

  // ── FIRST COMMUNIONS ──────────────────────────────────────────────────────
  const addFirstCommunion = async (fc) => {
    const isUpdate = fc.id && firstCommunions.find(x => x.id === fc.id);
    const payload = {
      church_id: currentChurch.id,
      register_number: fc.registerNumber,
      child_name: fc.childName, child_birth_date: fc.childBirthDate, child_gender: fc.childGender,
      baptism_date: fc.baptismDate, baptism_church: fc.baptismChurch,
      father_name: fc.fatherName, mother_name: fc.motherName,
      parents_address: fc.parentsAddress, parents_phone: fc.parentsPhone,
      catechism_class: fc.catechismClass, catechism_teacher: fc.catechismTeacher,
      classes_completed: fc.classesCompleted, retreat_attended: fc.retreatAttended,
      first_communion_date: fc.firstCommunionDate, first_communion_mass: fc.firstCommunionMass,
      celebrant_priest: fc.celebrantPriest, godparents: fc.godparents,
      baptism_cert_file: fc.baptismCertFile || null,
      certificate_issued: fc.certificateIssued,
      schedule_mass: fc.scheduleMass, mass_date: fc.massDate,
      mass_time: fc.massTime, mass_location: fc.massLocation,
      notes: fc.notes, status: fc.status || 'registered', archived: false,
    };
    if (isUpdate) {
      await supabase.from('first_communions').update(payload).eq('id', fc.id);
      setFirstCommunions(prev => prev.map(x => x.id === fc.id ? { ...x, ...fc } : x));
    } else {
      const { data, error } = await supabase.from('first_communions').insert(payload).select().single();
      if (error) { console.error('addFirstCommunion error:', error); return; }
      if (data) setFirstCommunions(prev => [...prev, { ...fc, id: data.id }]);
    }
    addLog(isUpdate ? 'Updated' : 'Added', 'First Communion', `${fc.childName}`);
  };

  const archiveFirstCommunion = async (id) => {
    await supabase.from('first_communions').update({ archived: true, archived_at: new Date().toISOString() }).eq('id', id);
    setFirstCommunions(prev => prev.map(x => x.id === id ? { ...x, archived: true } : x));
  };

  const restoreFirstCommunion = async (id) => {
    await supabase.from('first_communions').update({ archived: false }).eq('id', id);
    setFirstCommunions(prev => prev.map(x => x.id === id ? { ...x, archived: false } : x));
  };

  const deleteFirstCommunion = async (id) => {
    await supabase.from('first_communions').delete().eq('id', id);
    setFirstCommunions(prev => prev.filter(x => x.id !== id));
  };

  // ── CONFIRMATIONS ─────────────────────────────────────────────────────────
  const addConfirmation = async (c) => {
    const isUpdate = c.id && confirmations.find(x => x.id === c.id);
    const payload = {
      church_id: currentChurch.id,
      register_number: c.registerNumber,
      candidate_name: c.candidateName, candidate_birth_date: c.candidateBirthDate,
      candidate_gender: c.candidateGender, candidate_age: c.candidateAge,
      baptism_date: c.baptismDate, baptism_church: c.baptismChurch,
      first_communion_date: c.firstCommunionDate, first_communion_church: c.firstCommunionChurch,
      father_name: c.fatherName, mother_name: c.motherName, guardian_name: c.guardianName,
      parents_address: c.parentsAddress, parents_phone: c.parentsPhone,
      confirmation_name: c.confirmationName, confirmation_date: c.confirmationDate,
      confirmation_mass: c.confirmationMass, celebrant_bishop: c.celebrantBishop,
      sponsor_name: c.sponsorName, sponsor_gender: c.sponsorGender,
      sponsor_religion: c.sponsorReligion, sponsor_phone: c.sponsorPhone,
      catechism_class: c.catechismClass, catechism_teacher: c.catechismTeacher,
      classes_completed: c.classesCompleted, retreat_attended: c.retreatAttended,
      service_hours: c.serviceHours,
      sponsor_letter_submitted: c.sponsorLetterSubmitted,
      sponsor_letter_file: c.sponsorLetterFile || null,
      baptism_cert_file: c.baptismCertFile || null,
      certificate_issued: c.certificateIssued,
      schedule_mass: c.scheduleMass, mass_date: c.massDate,
      mass_time: c.massTime, mass_location: c.massLocation,
      notes: c.notes, status: c.status || 'registered', archived: false,
    };
    if (isUpdate) {
      await supabase.from('confirmations').update(payload).eq('id', c.id);
      setConfirmations(prev => prev.map(x => x.id === c.id ? { ...x, ...c } : x));
    } else {
      const { data, error } = await supabase.from('confirmations').insert(payload).select().single();
      if (error) { console.error('addConfirmation error:', error); return; }
      if (data) setConfirmations(prev => [...prev, { ...c, id: data.id }]);
    }
    addLog(isUpdate ? 'Updated' : 'Added', 'Confirmation', `${c.candidateName}`);
  };

  const archiveConfirmation = async (id) => {
    await supabase.from('confirmations').update({ archived: true, archived_at: new Date().toISOString() }).eq('id', id);
    setConfirmations(prev => prev.map(x => x.id === id ? { ...x, archived: true } : x));
  };

  const restoreConfirmation = async (id) => {
    await supabase.from('confirmations').update({ archived: false }).eq('id', id);
    setConfirmations(prev => prev.map(x => x.id === id ? { ...x, archived: false } : x));
  };

  const deleteConfirmation = async (id) => {
    await supabase.from('confirmations').delete().eq('id', id);
    setConfirmations(prev => prev.filter(x => x.id !== id));
  };

  // ── MARRIAGES ─────────────────────────────────────────────────────────────
  const addMarriage = async (m) => {
    const isUpdate = m.id && marriages.find(x => x.id === m.id);
    const payload = {
      church_id: currentChurch.id,
      register_number: m.registerNumber,
      groom_name: m.groomName, groom_birth_date: m.groomBirthDate,
      groom_baptism_date: m.groomBaptismDate, groom_baptism_church: m.groomBaptismChurch,
      groom_father_name: m.groomFatherName, groom_mother_name: m.groomMotherName,
      groom_confirmed: m.groomConfirmed,
      groom_baptism_cert_file: m.groomBaptismCertFile || null,
      groom_confirmation_cert_file: m.groomConfirmationCertFile || null,
      bride_name: m.brideName, bride_birth_date: m.brideBirthDate,
      bride_baptism_date: m.brideBaptismDate, bride_baptism_church: m.brideBaptismChurch,
      bride_father_name: m.brideFatherName, bride_mother_name: m.brideMotherName,
      bride_confirmed: m.brideConfirmed,
      bride_baptism_cert_file: m.brideBaptismCertFile || null,
      bride_confirmation_cert_file: m.brideConfirmationCertFile || null,
      marriage_license_file: m.marriageLicenseFile || null,
      wedding_date: m.weddingDate, wedding_time: m.weddingTime,
      wedding_location: m.weddingLocation, celebrating_priest: m.celebratingPriest,
      include_mass: m.includeMass,
      pre_cana_completed: m.preCanaCompleted, pre_cana_date: m.preCanaDate,
      banns1_date: m.banns1Date, banns1_done: m.banns1Done,
      banns2_date: m.banns2Date, banns2_done: m.banns2Done,
      banns3_date: m.banns3Date, banns3_done: m.banns3Done,
      best_man: m.bestMan, maid_of_honor: m.maidOfHonor,
      witnesses: m.witnesses || [],
      marriage_license_number: m.marriageLicenseNumber,
      marriage_license_date: m.marriageLicenseDate,
      certificate_issued: m.certificateIssued,
      schedule_mass: m.scheduleMass, mass_date: m.massDate,
      mass_time: m.massTime, mass_location: m.massLocation,
      notes: m.notes, archived: false,
    };
    if (isUpdate) {
      await supabase.from('marriages').update(payload).eq('id', m.id);
      setMarriages(prev => prev.map(x => x.id === m.id ? { ...x, ...m } : x));
    } else {
      const { data, error } = await supabase.from('marriages').insert(payload).select().single();
      if (error) { console.error('addMarriage error:', error); return; }
      if (data) setMarriages(prev => [...prev, { ...m, id: data.id }]);
    }
    addLog(isUpdate ? 'Updated' : 'Added', 'Marriage', `${m.groomName} & ${m.brideName}`);
  };

  const archiveMarriage = async (id) => {
    await supabase.from('marriages').update({ archived: true, archived_at: new Date().toISOString() }).eq('id', id);
    setMarriages(prev => prev.map(x => x.id === id ? { ...x, archived: true } : x));
  };

  const restoreMarriage = async (id) => {
    await supabase.from('marriages').update({ archived: false }).eq('id', id);
    setMarriages(prev => prev.map(x => x.id === id ? { ...x, archived: false } : x));
  };

  const deleteMarriage = async (id) => {
    await supabase.from('marriages').delete().eq('id', id);
    setMarriages(prev => prev.filter(x => x.id !== id));
  };

  // ── FUNERALS ──────────────────────────────────────────────────────────────
  const addFuneral = async (f) => {
    const isUpdate = f.id && funerals.find(x => x.id === f.id);
    const payload = {
      church_id: currentChurch.id,
      register_number: f.registerNumber,
      deceased_name: f.deceasedName, deceased_age: f.deceasedAge,
      deceased_gender: f.deceasedGender, date_of_death: f.dateOfDeath,
      place_of_death: f.placeOfDeath, cause_of_death: f.causeOfDeath,
      religion: f.religion,
      funeral_mass_date: f.funeralMassDate, funeral_mass_time: f.funeralMassTime,
      funeral_location: f.funeralLocation, celebrating_priest: f.celebratingPriest,
      burial_date: f.burialDate, burial_location: f.burialLocation, burial_type: f.burialType,
      vigil: f.vigil, vigil_date: f.vigilDate, vigil_time: f.vigilTime, vigil_location: f.vigilLocation,
      requested_by: f.requestedBy, relationship: f.relationship, contact_number: f.contactNumber,
      death_cert_file: f.deathCertFile || null,
      certificate_issued: f.certificateIssued,
      schedule_mass: f.scheduleMass, mass_date: f.massDate,
      mass_time: f.massTime, mass_location: f.massLocation,
      notes: f.notes, archived: false,
    };
    if (isUpdate) {
      await supabase.from('funerals').update(payload).eq('id', f.id);
      setFunerals(prev => prev.map(x => x.id === f.id ? { ...x, ...f } : x));
    } else {
      const { data, error } = await supabase.from('funerals').insert(payload).select().single();
      if (error) { console.error('addFuneral error:', error); return; }
      if (data) setFunerals(prev => [...prev, { ...f, id: data.id }]);
    }
    addLog(isUpdate ? 'Updated' : 'Added', 'Funeral', `${f.deceasedName}`);
  };

  const archiveFuneral = async (id) => {
    await supabase.from('funerals').update({ archived: true, archived_at: new Date().toISOString() }).eq('id', id);
    setFunerals(prev => prev.map(x => x.id === id ? { ...x, archived: true } : x));
  };

  const restoreFuneral = async (id) => {
    await supabase.from('funerals').update({ archived: false }).eq('id', id);
    setFunerals(prev => prev.map(x => x.id === id ? { ...x, archived: false } : x));
  };

  const deleteFuneral = async (id) => {
    await supabase.from('funerals').delete().eq('id', id);
    setFunerals(prev => prev.filter(x => x.id !== id));
  };

  // ── FINANCE ───────────────────────────────────────────────────────────────
  const addTransaction = async (t) => {
    const { data, error } = await supabase.from('transactions').insert({
      church_id: currentChurch.id,
      type: t.type, category: t.category, custom_category: t.customCategory,
      amount: Number(t.amount), date: t.date, method: t.method,
      payer: t.payer, description: t.description,
      status: 'Completed', archived: false,
    }).select().single();
    if (error) { console.error('addTransaction error:', error); return; }
    if (data) {
      setTransactions(prev => [...prev, {
        id: data.id, type: data.type, category: data.category,
        amount: data.amount, date: data.date, method: data.method,
        payer: data.payer, description: data.description,
        status: data.status, archived: false,
      }]);
      addLog('Added', 'Finance', `${t.type === 'income' ? 'Income' : 'Expense'}: ₱${t.amount} — ${t.category}`);
    }
  };

  const archiveTransaction = async (id) => {
    await supabase.from('transactions').update({ archived: true, archived_at: new Date().toISOString() }).eq('id', id);
    setTransactions(prev => prev.map(x => x.id === id ? { ...x, archived: true } : x));
  };

  const restoreTransaction = async (id) => {
    await supabase.from('transactions').update({ archived: false }).eq('id', id);
    setTransactions(prev => prev.map(x => x.id === id ? { ...x, archived: false } : x));
  };

  const deleteTransaction = async (id) => {
    await supabase.from('transactions').delete().eq('id', id);
    setTransactions(prev => prev.filter(x => x.id !== id));
  };

  // ── REQUESTS ──────────────────────────────────────────────────────────────
  const addEventRequest = async (r) => {
    const ref = genRef('EV');
    const churchId = selectedChurch?.id || currentChurch?.id;
    const { data, error } = await supabase.from('event_requests').insert({
      church_id: churchId, reference_number: ref,
      full_name: r.fullName, contact: r.contact, email: r.email,
      event_type: r.eventType, preferred_date: r.preferredDate,
      preferred_time: r.preferredTime, location: r.location,
      notes: r.notes, status: 'Pending',
    }).select().single();
    if (error) { console.error('addEventRequest error:', error); return ref; }
    if (data) setEventRequests(prev => [{ ...r, id: data.id, referenceNumber: ref, status: 'Pending' }, ...prev]);
    return ref;
  };

  const updateEventRequest = async (id, status, priest) => {
    const r = eventRequests.find(x => x.id === id);
    await supabase.from('event_requests').update({ status, assigned_priest: priest || null }).eq('id', id);
    setEventRequests(prev => prev.map(x => x.id === id ? { ...x, status, assignedPriest: priest } : x));
    if (status === 'Approved' && r) {
      addEvent({
        title: r.title || r.eventType, date: r.preferredDate,
        time: r.preferredTime, type: 'other',
        location: r.location, priest, status: 'approved', done: false,
      });
    }
    // Send email notification
    if (r?.email) {
      await sendRequestNotification({
        requesterEmail: r.email,
        requesterName: r.fullName,
        requestType: `Event Request (${r.eventType})`,
        referenceNumber: r.referenceNumber,
        status,
        churchName: currentChurch?.church_name,
        churchEmail: currentChurch?.email,
      });
    }
    addLog(status, 'Event Request', `"${r?.eventType}" — ${status}`);
  };

  const addRecordRequest = async (r) => {
    const ref = genRef('RR');
    const churchId = selectedChurch?.id || currentChurch?.id;
    const { data, error } = await supabase.from('record_requests').insert({
      church_id: churchId, reference_number: ref,
      full_name: r.fullName, contact: r.contact, email: r.email,
      record_type: r.recordType, notes: r.notes, status: 'Pending',
    }).select().single();
    if (error) { console.error('addRecordRequest error:', error); return ref; }
    if (data) setRecordRequests(prev => [{ ...r, id: data.id, referenceNumber: ref, status: 'Pending' }, ...prev]);
    return ref;
  };

  const updateRecordRequest = async (id, status) => {
    const r = recordRequests.find(x => x.id === id);
    await supabase.from('record_requests').update({ status }).eq('id', id);
    setRecordRequests(prev => prev.map(x => x.id === id ? { ...x, status } : x));
    // Send email notification
    if (r?.email) {
      await sendRequestNotification({
        requesterEmail: r.email,
        requesterName: r.fullName,
        requestType: `Record Request (${r.recordType})`,
        referenceNumber: r.referenceNumber,
        status,
        churchName: currentChurch?.church_name,
        churchEmail: currentChurch?.email,
      });
    }
    addLog(status, 'Record Request', `${r?.recordType} for ${r?.fullName}`);
  };

  const addMembershipRequest = async (r) => {
    const ref = genRef('MR');
    const churchId = selectedChurch?.id || currentChurch?.id;
    const { data, error } = await supabase.from('membership_requests').insert({
      church_id: churchId, reference_number: ref,
      first_name: r.firstName, middle_name: r.middleName, last_name: r.lastName,
      gender: r.gender, birthday: r.birthday,
      contact: r.contact, email: r.email, address: r.address,
      ministry: r.ministry, notes: r.notes, photo: r.photo || '',
      status: 'Pending',
    }).select().single();
    if (error) { console.error('addMembershipRequest error:', error); return ref; }
    if (data) setMembershipRequests(prev => [{ ...r, id: data.id, referenceNumber: ref, status: 'Pending' }, ...prev]);
    return ref;
  };

  const updateMembershipRequest = async (id, status) => {
    const r = membershipRequests.find(x => x.id === id);
    await supabase.from('membership_requests').update({ status }).eq('id', id);
    setMembershipRequests(prev => prev.map(x => x.id === id ? { ...x, status } : x));
    if (status === 'Approved' && r) {
      addMember({
        firstName: r.firstName, middleName: r.middleName || '',
        lastName: r.lastName, gender: r.gender || '',
        birthday: r.birthday || '', address: r.address || '',
        contact: r.contact || '', email: r.email || '',
        ministry: r.ministry || '', role: 'Member', status: 'Active',
        joined: new Date().toISOString().slice(0, 10),
        skills: [], availability: [], photo: r.photo || '', archived: false,
      });
    }
    // Send email notification
    if (r?.email) {
      await sendRequestNotification({
        requesterEmail: r.email,
        requesterName: `${r.firstName} ${r.lastName}`,
        requestType: `Ministry Membership Request (${r.ministry})`,
        referenceNumber: r.referenceNumber,
        status,
        churchName: currentChurch?.church_name,
        churchEmail: currentChurch?.email,
      });
    }
    addLog(status, 'Membership Request', `${r?.firstName} ${r?.lastName}`);
  };

  // ── BULLETINS ─────────────────────────────────────────────────────────────
  const addBulletin = async (b) => {
    const { data, error } = await supabase.from('bulletins').insert({
      church_id: currentChurch.id,
      title: b.title, category: b.category, content: b.content,
      author: b.author, pinned: b.pinned || false,
    }).select().single();
    if (error) { console.error('addBulletin error:', error); return; }
    if (data) {
      setBulletins(prev => [{
        id: data.id, title: data.title, category: data.category,
        content: data.content, author: data.author,
        pinned: data.pinned, createdAt: data.created_at,
      }, ...prev]);
      addLog('Added', 'Bulletin', `"${b.title}"`);
    }
  };

  const updateBulletin = async (id, b) => {
    await supabase.from('bulletins').update({
      title: b.title, category: b.category, content: b.content,
      author: b.author, pinned: b.pinned,
    }).eq('id', id);
    setBulletins(prev => prev.map(x => x.id === id ? { ...x, ...b } : x));
  };

  const deleteBulletin = async (id) => {
    await supabase.from('bulletins').delete().eq('id', id);
    setBulletins(prev => prev.filter(x => x.id !== id));
  };

  const togglePinBulletin = async (id) => {
    const b = bulletins.find(x => x.id === id);
    const newPinned = !b?.pinned;
    await supabase.from('bulletins').update({ pinned: newPinned }).eq('id', id);
    setBulletins(prev => prev.map(x => x.id === id ? { ...x, pinned: newPinned } : x));
  };

  // ── MASS SCHEDULES ────────────────────────────────────────────────────────
  const addMassSchedule = async (s) => {
    const { data, error } = await supabase.from('mass_schedules').insert({
      church_id: currentChurch.id,
      day: s.day, time: s.time, type: s.type,
      priest: s.priest, location: s.location,
      language: s.language, notes: s.notes,
    }).select().single();
    if (error) { console.error('addMassSchedule error:', error); return; }
    if (data) {
      setMassSchedules(prev => [...prev, {
        id: data.id, churchId: data.church_id,
        day: data.day, time: data.time, type: data.type,
        priest: data.priest, location: data.location,
        language: data.language, notes: data.notes,
      }]);
      addLog('Added', 'Mass Schedule', `${s.day} ${s.time} — ${s.type}`);
    }
  };

  const deleteMassSchedule = async (id) => {
    await supabase.from('mass_schedules').delete().eq('id', id);
    setMassSchedules(prev => prev.filter(x => x.id !== id));
  };

  // ── CLERK ACCOUNTS ────────────────────────────────────────────────────────
  const activateClerkAccount = async (id) => {
    await supabase.from('clerk_accounts').update({ active: true }).eq('id', id);
    setClerkAccounts(prev => prev.map(a => a.id === id ? { ...a, active: true } : a));
  };

  const deleteClerkAccount = async (id) => {
    await supabase.from('clerk_accounts').delete().eq('id', id);
    setClerkAccounts(prev => prev.filter(a => a.id !== id));
  };

  // ── SUPER ADMIN ───────────────────────────────────────────────────────────
  const updateChurchStatus = async (id, status) => {
    await supabase.from('churches').update({ status }).eq('id', id);
    setChurches(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    if (status === 'active') {
      await supabase.from('clerk_accounts').update({ active: true }).eq('church_id', id);
    }
  };

  // ── LOAD ACTIVE CHURCHES FOR CLIENT ──────────────────────────────────────
  const loadActiveChurches = async () => {
    const { data } = await supabase.from('churches').select('*').eq('status', 'active').order('church_name');
    return data || [];
  };

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    setRole(null); setCurrentChurch(null); setCurrentClerk(null);
    setEvents([]); setMembers([]); setPriests([]); setParishioners([]);
    setBaptisms([]); setConfirmations([]); setFirstCommunions([]);
    setMarriages([]); setFunerals([]); setTransactions([]);
    setEventRequests([]); setRecordRequests([]); setMembershipRequests([]);
    setBulletins([]); setMassSchedules([]); setActivityLog([]);
  };

  return (
    <AppContext.Provider value={{
      role, setRole, currentChurch, setCurrentChurch,
      currentClerk, setCurrentClerk,
      selectedChurch, setSelectedChurch,
      authLoading, loading, logout,
      churches, loadChurches, loadActiveChurches, updateChurchStatus,
      // Client-specific state (separate from clerk state)
      clientEvents, clientBulletins, clientMassSchedules, clientMembers,
      events, addEvent, updateEvent, archiveEvent, markEventDone, restoreEvent, deleteEvent,
      members, addMember, updateMember, archiveMember, restoreMember, deleteMember,
      priests, addPriest, updatePriest, archivePriest, restorePriest, deletePriest,
      parishioners, addParishioner, updateParishioner, archiveParishioner, restoreParishioner, deleteParishioner,
      baptisms, addBaptism, archiveBaptism, restoreBaptism, deleteBaptism,
      confirmations, addConfirmation, archiveConfirmation, restoreConfirmation, deleteConfirmation,
      firstCommunions, addFirstCommunion, archiveFirstCommunion, restoreFirstCommunion, deleteFirstCommunion,
      marriages, addMarriage, archiveMarriage, restoreMarriage, deleteMarriage,
      funerals, addFuneral, archiveFuneral, restoreFuneral, deleteFuneral,
      transactions, addTransaction, archiveTransaction, restoreTransaction, deleteTransaction,
      eventRequests, addEventRequest, updateEventRequest,
      recordRequests, addRecordRequest, updateRecordRequest,
      membershipRequests, addMembershipRequest, updateMembershipRequest,
      activityLog,
      bulletins, addBulletin, updateBulletin, deleteBulletin, togglePinBulletin,
      massSchedules, addMassSchedule, deleteMassSchedule,
      clerkAccounts, activateClerkAccount, deleteClerkAccount,
      isClerk: role === 'clerk',
      setIsClerk: (v) => { if (!v) logout(); },
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
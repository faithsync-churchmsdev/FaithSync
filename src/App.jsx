import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './AppContext';

// Client
import ClientNav from './components/ClientNav';
import Home from './pages/client/Home';
import RequestEvent from './pages/client/RequestEvent';
import RequestRecords from './pages/client/RequestRecords';
import RequestMembership from './pages/client/RequestMembership';
import Donate from './pages/client/Donate';
import About from './pages/client/About';

// Clerk
import ClerkLogin from './pages/clerk/ClerkLogin';
import ClerkSidebar from './components/ClerkSidebar';
import Dashboard from './pages/clerk/Dashboard';
import ScheduleEvent from './pages/clerk/ScheduleEvent';
import RecordsManager from './pages/clerk/RecordsManager';
import Ministry from './pages/clerk/Ministry';
import ParishDirectory from './pages/clerk/ParishDirectory';
import Finance from './pages/clerk/Finance';
import Archives from './pages/clerk/Archives';
import Requests from './pages/clerk/Requests';
import BulletinBoard from './pages/clerk/BulletinBoard';
import MassSchedule from './pages/clerk/MassSchedule';

// Super Admin
import SuperAdminPanel from './pages/superadmin/SuperAdminPanel';
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin';

// Church Registration
import ChurchRegister from './pages/ChurchRegister';

import devPhoto from './assets/kimfaithsync.jpg';
import './App.css';

function AppContent() {
  const {
    role, setRole, setCurrentChurch, setCurrentClerk,
    authLoading, logout, selectedChurch, setSelectedChurch,
    loadActiveChurches, events, markEventDone,
  } = useApp();

  const [clientPage, setClientPage] = useState('Home');
  const [clerkPage, setClerkPage] = useState('Dashboard');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showSuperLogin, setShowSuperLogin] = useState(false);

  // Auto-mark past events as done
  useEffect(() => {
    if (role === 'clerk') {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      events.forEach(e => {
        if (!e.archived && !e.done) {
          const d = new Date(e.date); d.setHours(0, 0, 0, 0);
          if (d < today) markEventDone(e.id);
        }
      });
    }
  }, [events]);

  // Loading screen while restoring session
  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '2.5rem' }}>✝</div>
        <p style={{ color: 'var(--text-mid)', fontFamily: 'var(--font-heading)' }}>Loading FaithSync...</p>
      </div>
    );
  }

  // ── SUPER ADMIN LOGIN ─────────────────────────────────────────────────────
  if (showSuperLogin && role !== 'superadmin') {
    return (
      <SuperAdminLogin
        onSuccess={() => { setShowSuperLogin(false); }}
        onBack={() => setShowSuperLogin(false)}
      />
    );
  }

  // ── SUPER ADMIN PANEL ─────────────────────────────────────────────────────
  if (role === 'superadmin') {
    return <SuperAdminPanel onLogout={logout} />;
  }

  // ── CLERK LOGIN ───────────────────────────────────────────────────────────
  if (showLogin && role !== 'clerk') {
    return (
      <ClerkLogin
        onBack={() => setShowLogin(false)}
        onRegister={() => { setShowLogin(false); setShowRegister(true); }}
      />
    );
  }

  // ── CHURCH REGISTRATION ───────────────────────────────────────────────────
  if (showRegister) {
    return (
      <ChurchRegister
        onBack={() => setShowRegister(false)}
        onSuccess={() => { setShowRegister(false); setShowLogin(true); }}
      />
    );
  }

  // ── CLERK PANEL ───────────────────────────────────────────────────────────
  if (role === 'clerk') {
    return (
      <div className="clerk-layout">
        <ClerkSidebar
          page={clerkPage}
          setPage={setClerkPage}
          onLogout={logout}
        />
        <main className="clerk-main">
          {clerkPage === 'Dashboard' && <Dashboard setPage={setClerkPage} />}
          {clerkPage === 'Schedule Event' && <ScheduleEvent />}
          {clerkPage === 'Records Manager' && <RecordsManager />}
          {clerkPage === 'Parish Directory' && <ParishDirectory />}
          {clerkPage === 'Finance Management' && <Finance />}
          {clerkPage === 'Archives' && <Archives />}
          {clerkPage === 'Requests' && <Requests />}
          {clerkPage === 'Bulletin Board' && <BulletinBoard />}
          {clerkPage === 'Mass Schedule' && <MassSchedule />}
          {clerkPage === 'About' && <AboutClerk />}
        </main>
      </div>
    );
  }

  // ── CLIENT VIEW ───────────────────────────────────────────────────────────
  const renderClientPage = () => {
    switch (clientPage) {
      case 'Home': return <Home setPage={setClientPage} />;
      case 'Request Event/Mass': return <RequestEvent />;
      case 'Request Records': return <RequestRecords />;
      case 'Request Membership': return <RequestMembership />;
      case 'Donate': return <Donate />;
      case 'About': return <About />;
      default: return <Home setPage={setClientPage} />;
    }
  };

  return (
    <div className="client-layout">
      {/* Church selector banner */}
      <ChurchBanner
        selectedChurch={selectedChurch}
        setSelectedChurch={setSelectedChurch}
        loadActiveChurches={loadActiveChurches}
      />
      <ClientNav
        page={clientPage}
        setPage={setClientPage}
        onClerkLogin={() => setShowLogin(true)}
      />
      <main className="client-main">
        {renderClientPage()}
      </main>
      <footer className="client-footer">
        <span>✝ FaithSync — Catholic Church Management System</span>
        <span>Kim Philippe A. Nochefranca · WMSU Capstone 2024</span>
        <button
          onClick={() => setShowSuperLogin(true)}
          style={{ background: 'none', border: 'none', color: 'transparent', fontSize: '0.5rem', cursor: 'default', padding: 0 }}
          title=""
        >
          .
        </button>
      </footer>
    </div>
  );
}

// ── CHURCH BANNER ─────────────────────────────────────────────────────────────
function ChurchBanner({ selectedChurch, setSelectedChurch, loadActiveChurches }) {
  const [churches, setChurches] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChurches = async () => {
      setLoading(true);
      const data = await loadActiveChurches();
      setChurches(data);
      // Auto-select if only one church
      if (data.length === 1 && !selectedChurch) {
        setSelectedChurch(data[0]);
      }
      setLoading(false);
    };
    fetchChurches();
  }, []);

  if (!selectedChurch && churches.length === 0) {
    return (
      <div className="church-banner church-banner-empty">
        <span className="church-banner-cross">✝</span>
        <span>{loading ? 'Loading churches...' : 'No registered churches yet.'}</span>
      </div>
    );
  }

  return (
    <div className="church-banner">
      <span className="church-banner-cross">✝</span>
      {selectedChurch ? (
        <>
          <span className="church-banner-label">You are viewing:</span>
          <strong className="church-banner-name">{selectedChurch.church_name}</strong>
          <span className="church-banner-location">📍 {selectedChurch.address}</span>
          <button
            className="church-banner-change"
            onClick={() => setShowDropdown(d => !d)}
          >
            Change Church ▾
          </button>
        </>
      ) : (
        <>
          <span className="church-banner-label">Select a church to get started:</span>
          <button
            className="church-banner-change"
            onClick={() => setShowDropdown(d => !d)}
          >
            Choose Church ▾
          </button>
        </>
      )}

      {showDropdown && (
        <div className="church-dropdown">
          {churches.length === 0 ? (
            <div className="church-dropdown-empty">No active churches found.</div>
          ) : (
            churches.map(c => (
              <div
                key={c.id}
                className={`church-dropdown-item ${selectedChurch?.id === c.id ? 'selected' : ''}`}
                onClick={() => { setSelectedChurch(c); setShowDropdown(false); }}
              >
                <strong>{c.church_name}</strong>
                <span>📍 {c.address}</span>
                {c.diocese && <span>⛪ {c.diocese}</span>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── ABOUT CLERK PAGE ──────────────────────────────────────────────────────────
function AboutClerk() {
  return (
    <div className="about-clerk-page">
      <div className="ac-hero">
        <div className="ac-cross">✝</div>
        <h1>FaithSync</h1>
        <p>Catholic Church Management System</p>
        <p style={{ opacity: 0.75, fontSize: '0.9rem', marginTop: '4px' }}>Zamboanga City, Philippines</p>
      </div>
      <div className="ac-container">
        <div className="ac-dev-card">
          <div className="ac-dev-photo-wrap">
            <img src={devPhoto} alt="Kim Philippe A. Nochefranca" className="ac-dev-photo" />
          </div>
          <div className="ac-dev-info">
            <div className="ac-dev-role">👨‍💻 System Developer</div>
            <h2>Kim Philippe A. Nochefranca</h2>
            <p>23 years old · Graduating Student</p>
            <p><strong>Western Mindanao State University</strong></p>
            <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginTop: '2px' }}>Zamboanga City, Philippines</p>
            <div className="ac-badges">
              <span className="ac-badge">🎓 Capstone Project 2024</span>
              <span className="ac-badge">⚛️ React JS Developer</span>
              <span className="ac-badge">🌿 Supabase</span>
            </div>
          </div>
        </div>
        <div className="ac-grid">
          <div className="card ac-card">
            <h3>📖 About the System</h3>
            <p>FaithSync is a comprehensive Catholic Church Management System designed to digitize and streamline all parish operations — from scheduling masses and managing sacramental records to tracking ministry members and parish finances.</p>
            <p style={{ marginTop: '10px' }}>Built for the parishes of <strong>Zamboanga City</strong>, specifically the Metropolitan Cathedral of the Immaculate Conception and the Archdiocesan Shrine of Our Lady of the Pillar (Fort Pilar).</p>
          </div>
          <div className="card ac-card">
            <h3>⚙️ Tech Stack</h3>
            <div className="ac-tech-grid">
              <div className="ac-tech"><span>⚛️</span><strong>React JS</strong><small>Frontend</small></div>
              <div className="ac-tech"><span>⚡</span><strong>Vite</strong><small>Build Tool</small></div>
              <div className="ac-tech"><span>🌿</span><strong>Supabase</strong><small>Database</small></div>
              <div className="ac-tech"><span>🚀</span><strong>Netlify</strong><small>Deployment</small></div>
            </div>
          </div>
        </div>
        <div className="ac-footer-note">
          <span>✝</span>
          <p>FaithSync — Serving the Catholic Community of Zamboanga City · WMSU Capstone 2024</p>
        </div>
      </div>
      <style>{`
        .about-clerk-page { min-height: 100vh; background: var(--primary-bg); }
        .ac-hero { background: linear-gradient(135deg, var(--accent), var(--primary)); padding: 52px 32px; text-align: center; color: white; }
        .ac-cross { font-size: 2.5rem; margin-bottom: 8px; opacity: 0.8; }
        .ac-hero h1 { font-size: 2.5rem; font-family: var(--font-heading); margin-bottom: 8px; }
        .ac-hero p { font-size: 1.05rem; opacity: 0.88; }
        .ac-container { max-width: 1000px; margin: 0 auto; padding: 36px 32px 60px; }
        .ac-dev-card { display: flex; align-items: center; gap: 32px; background: white; border-radius: var(--radius-lg); padding: 32px; box-shadow: var(--shadow-md); border: 1px solid var(--border); border-top: 5px solid var(--primary); margin-bottom: 28px; }
        .ac-dev-photo-wrap { flex-shrink: 0; }
        .ac-dev-photo { width: 140px; height: 140px; border-radius: 50%; object-fit: cover; object-position: center top; border: 4px solid var(--primary-light); box-shadow: 0 6px 20px rgba(26,111,181,0.25); }
        .ac-dev-role { font-size: 0.78rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .ac-dev-info h2 { font-size: 1.6rem; color: var(--accent); margin-bottom: 6px; }
        .ac-dev-info p { color: var(--text-mid); font-size: 0.93rem; margin-bottom: 3px; }
        .ac-badges { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
        .ac-badge { background: var(--primary-pale); color: var(--primary); padding: 5px 12px; border-radius: 50px; font-size: 0.8rem; font-weight: 700; border: 1px solid var(--border); }
        .ac-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        .ac-card h3 { font-size: 1.1rem; margin-bottom: 14px; color: var(--accent); }
        .ac-card p { color: var(--text-mid); font-size: 0.93rem; line-height: 1.7; }
        .ac-tech-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .ac-tech { display: flex; flex-direction: column; align-items: center; background: var(--primary-bg); padding: 14px; border-radius: var(--radius); text-align: center; gap: 3px; }
        .ac-tech span { font-size: 1.6rem; }
        .ac-tech strong { color: var(--accent); font-size: 0.9rem; }
        .ac-tech small { color: var(--text-light); font-size: 0.78rem; }
        .ac-footer-note { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 20px; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border); text-align: center; }
        .ac-footer-note span { font-size: 1.5rem; }
        .ac-footer-note p { color: var(--text-light); font-size: 0.88rem; }
        @media (max-width: 700px) { .ac-dev-card { flex-direction: column; text-align: center; } .ac-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
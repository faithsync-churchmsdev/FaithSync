import { useState } from 'react';
import { useApp } from '../AppContext';
import './ClerkSidebar.css';

const NAV_ITEMS = [
  { id: 'Dashboard', icon: '🏠', label: 'Dashboard' },
  { id: 'Schedule Event', icon: '📅', label: 'Schedule Event' },
  { id: 'Mass Schedule', icon: '🕯️', label: 'Mass Schedule' },
  { id: 'Records Manager', icon: '📂', label: 'Records Manager' },
  { id: 'Parish Directory', icon: '⛪', label: 'Parish Directory' },
  { id: 'Finance Management', icon: '💰', label: 'Finance Management' },
  { id: 'Bulletin Board', icon: '📌', label: 'Bulletin Board' },
  { id: 'Requests', icon: '📬', label: 'Requests' },
  { id: 'Archives', icon: '🗃️', label: 'Archives' },
  { id: 'About', icon: 'ℹ️', label: 'About' },
];

export default function ClerkSidebar({ page, setPage, onLogout }) {
  const { eventRequests, recordRequests, membershipRequests, clerkAccounts, currentChurch } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pendingCount = [
    ...(eventRequests || []).filter(r => r.status === 'Pending'),
    ...(recordRequests || []).filter(r => r.status === 'Pending'),
    ...(membershipRequests || []).filter(r => r.status === 'Pending'),
    ...(clerkAccounts || []).filter(a => !a.active),
  ].length;

  const handleNav = (id) => {
    setPage(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="clerk-mobile-bar">
        <button className="clerk-hamburger" onClick={() => setMobileOpen(o => !o)}>
          {mobileOpen ? '✕' : '☰'}
        </button>
        <div className="clerk-mobile-brand">
          <span>✝</span> FaithSync
          {pendingCount > 0 && <span className="mobile-pending-dot">{pendingCount}</span>}
        </div>
        <button className="clerk-mobile-logout" onClick={onLogout}>🚪</button>
      </div>

      {/* Overlay for mobile */}
      {mobileOpen && <div className="clerk-sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={`clerk-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-cross">✝</span>
          <div>
            <div className="sidebar-title">FaithSync</div>
            <div className="sidebar-role">Clerk Portal</div>
          </div>
        </div>

        {/* Church name display */}
        {currentChurch && (
          <div style={{
            padding: '8px 16px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.15)',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: '1.4',
          }}>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px', opacity: 0.6 }}>Current Church</div>
            <div style={{ fontWeight: '700', color: 'white', fontSize: '0.8rem' }}>⛪ {currentChurch.church_name}</div>
          </div>
        )}

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`sidebar-link ${page === item.id ? 'active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === 'Requests' && pendingCount > 0 && (
                <span className="sidebar-badge">{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={onLogout}>
          🚪 Logout
        </button>
      </aside>
    </>
  );
}
import { useApp } from '../AppContext';
import './ClerkSidebar.css';

const NAV_ITEMS = [
  { id: 'Dashboard', icon: '🏠', label: 'Dashboard' },
  { id: 'Schedule Event', icon: '📅', label: 'Schedule Event' },
  { id: 'Records Manager', icon: '📂', label: 'Records Manager' },
  { id: 'Parish Directory', icon: '⛪', label: 'Parish Directory' },
  { id: 'Finance Management', icon: '💰', label: 'Finance Management' },
  { id: 'Bulletin Board', icon: '📌', label: 'Bulletin Board' },
  { id: 'Archives', icon: '🗃️', label: 'Archives' },
  { id: 'Requests', icon: '📬', label: 'Requests' },
  { id: 'About', icon: 'ℹ️', label: 'About' },
];

export default function ClerkSidebar({ page, setPage, onLogout }) {
  const { eventRequests, recordRequests, membershipRequests } = useApp();
  const pendingCount = [
    ...(eventRequests || []).filter(r => r.status === 'Pending'),
    ...(recordRequests || []).filter(r => r.status === 'Pending'),
    ...(membershipRequests || []).filter(r => r.status === 'Pending'),
  ].length;

  return (
    <aside className="clerk-sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-cross">✝</span>
        <div>
          <div className="sidebar-title">FaithSync</div>
          <div className="sidebar-role">Clerk Portal</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`sidebar-link ${page === item.id ? 'active' : ''}`}
            onClick={() => setPage(item.id)}
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
  );
}
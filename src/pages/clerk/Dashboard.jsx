import { useApp } from '../../AppContext';
import Calendar from '../../components/Calendar';
import Legend from '../../components/Legend';
import UpcomingEvents from '../../components/UpcomingEvents';
import './Dashboard.css';

const ACTION_COLORS = {
  Added: '#27ae60', Updated: '#2980b9', Archived: '#95a5a6',
  Restored: '#8e44ad', Deleted: '#e74c3c', Approved: '#27ae60',
  Declined: '#e74c3c', Received: '#e67e22', Completed: '#1abc9c',
};

const ACTION_ICONS = {
  Added: '➕', Updated: '✏️', Archived: '🗃️', Restored: '↩️',
  Deleted: '🗑️', Approved: '✅', Declined: '❌', Received: '📬', Completed: '✔️',
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Dashboard({ setPage }) {
  const {
    events, members, priests, parishioners, transactions,
    eventRequests, recordRequests, membershipRequests,
    baptisms, confirmations, firstCommunions, marriages, funerals,
    activityLog,
  } = useApp();

  const active = (arr) => arr.filter(x => !x.archived);
  const pending = (arr) => arr.filter(r => r.status === 'Pending').length;

  const activeEvents = active(events);
  const activeMembers = active(members).filter(m => m.status === 'Active');
  const activePriests = active(priests || []).filter(p => p.status === 'Active').length;
  const allPending = pending(eventRequests) + pending(recordRequests) + pending(membershipRequests);
  const totalIncome = active(transactions).filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
  const totalExpense = active(transactions).filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);

  // Upcoming events this week
  const today = new Date();
  const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
  const upcomingThisWeek = activeEvents.filter(e => {
    const d = new Date(e.date);
    return d >= today && d <= nextWeek && !e.done;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const stats = [
    { label: 'Total Events', value: activeEvents.length, icon: '📅', color: '#1a6fb5', page: 'Schedule Event' },
    { label: 'Ministry Members', value: activeMembers.length, icon: '🙏', color: '#2e8b57', page: 'Parish Directory' },
    { label: 'Active Priests', value: activePriests, icon: '✝️', color: '#9b59b6', page: 'Parish Directory' },
    { label: 'Pending Requests', value: allPending, icon: '📬', color: '#e67e22', page: 'Requests', badge: allPending > 0 },
    { label: 'Total Income', value: `₱${totalIncome.toLocaleString()}`, icon: '💰', color: '#27ae60', page: 'Finance Management' },
    { label: 'Net Balance', value: `₱${(totalIncome - totalExpense).toLocaleString()}`, icon: '📊', color: totalIncome >= totalExpense ? '#27ae60' : '#c0392b', page: 'Finance Management' },
  ];

  const sacStats = [
    { label: 'Baptisms', value: active(baptisms).length, icon: '💧', page: 'Records Manager' },
    { label: '1st Communions', value: active(firstCommunions).length, icon: '🍞', page: 'Records Manager' },
    { label: 'Confirmations', value: active(confirmations).length, icon: '🕊️', page: 'Records Manager' },
    { label: 'Marriages', value: active(marriages).length, icon: '💍', page: 'Records Manager' },
    { label: 'Funerals', value: active(funerals).length, icon: '🕯️', page: 'Records Manager' },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>📋 Dashboard</h1>
        <p>Welcome back, Clerk. Here's your parish at a glance.</p>
      </div>

      {/* Main stats */}
      <div className="stats-grid">
        {stats.map(s => (
          <div
            key={s.label}
            className="stat-card stat-clickable"
            style={{ borderTop: `4px solid ${s.color}`, cursor: 'pointer', position: 'relative' }}
            onClick={() => setPage && setPage(s.page)}
          >
            {s.badge && <div className="stat-notify-dot" />}
            <div className="stat-icon" style={{ color: s.color }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div style={{ fontSize: '0.72rem', color: s.color, marginTop: '4px' }}>View →</div>
          </div>
        ))}
      </div>

      {/* Sacramental records quick view */}
      <div className="dash-section-title">⛪ Sacramental Records</div>
      <div className="sac-stats-grid">
        {sacStats.map(s => (
          <div key={s.label} className="sac-stat-card" onClick={() => setPage && setPage(s.page)}>
            <span className="sac-icon">{s.icon}</span>
            <span className="sac-value">{s.value}</span>
            <span className="sac-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Two-column: upcoming + activity log */}
      <div className="dash-two-col">

        {/* Upcoming this week */}
        <div className="card">
          <h3 className="dash-card-title">📅 Upcoming This Week</h3>
          {upcomingThisWeek.length === 0 ? (
            <div className="dash-empty">
              <span>🗓️</span>
              <p>No events in the next 7 days.</p>
            </div>
          ) : (
            <div className="upcoming-list">
              {upcomingThisWeek.slice(0, 6).map(e => (
                <div key={e.id} className="upcoming-item">
                  <div className="upcoming-date">
                    <div className="upcoming-day">{new Date(e.date).getDate()}</div>
                    <div className="upcoming-month">{new Date(e.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                  </div>
                  <div className="upcoming-info">
                    <strong>{e.title}</strong>
                    <span>{e.time || 'All day'} · {e.location}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button className="btn-secondary dash-view-btn" onClick={() => setPage && setPage('Schedule Event')}>View All Events →</button>
        </div>

        {/* Activity Log */}
        <div className="card">
          <h3 className="dash-card-title">🕒 Activity Log</h3>
          {activityLog.length === 0 ? (
            <div className="dash-empty">
              <span>📝</span>
              <p>No activity yet. Actions you take will appear here.</p>
            </div>
          ) : (
            <div className="activity-log">
              {activityLog.slice(0, 12).map(entry => (
                <div key={entry.id} className="log-entry">
                  <div className="log-icon" style={{ background: (ACTION_COLORS[entry.action] || '#aaa') + '22', color: ACTION_COLORS[entry.action] || '#aaa' }}>
                    {ACTION_ICONS[entry.action] || '•'}
                  </div>
                  <div className="log-body">
                    <div className="log-main">
                      <span className="log-action" style={{ color: ACTION_COLORS[entry.action] || '#555' }}>{entry.action}</span>
                      <span className="log-category"> · {entry.category}</span>
                    </div>
                    <div className="log-detail">{entry.detail}</div>
                  </div>
                  <div className="log-time">{timeAgo(entry.timestamp)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Requests summary */}
      {allPending > 0 && (
        <div className="dash-alert" onClick={() => setPage && setPage('Requests')}>
          <span>📬</span>
          <div>
            <strong>You have {allPending} pending request{allPending !== 1 ? 's' : ''} awaiting your review.</strong>
            <p>Click here to go to the Requests Manager.</p>
          </div>
          <span className="dash-alert-arrow">→</span>
        </div>
      )}

      {/* Calendar */}
      <div style={{ marginTop: '32px' }}>
        <Legend />
        <h2 className="section-title" style={{ marginBottom: '8px' }}>Parish Calendar</h2>
        <p className="section-sub">Click a day to view or manage events.</p>
        <Calendar isClerk={true} />
        <UpcomingEvents isClerk={true} />
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useApp } from '../../AppContext';
import { approveChurch, rejectChurch, suspendChurch } from '../../lib/auth';
import { sendChurchApprovalEmail } from '../../lib/email';
import './SuperAdminPanel.css';

const TABS = ['All Churches', 'Pending', 'Active', 'Suspended'];

export default function SuperAdminPanel({ onLogout }) {
  const { churches, loadChurches, updateChurchStatus } = useApp();
  const [tab, setTab] = useState('All Churches');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [viewChurch, setViewChurch] = useState(null);

  useEffect(() => { loadChurches(); }, []);

  const filtered = churches.filter(c => {
    const matchTab = tab === 'All Churches' || c.status === tab.toLowerCase();
    const matchSearch = !search ||
      c.church_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.registrant_name?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts = {
    'All Churches': churches.length,
    'Pending': churches.filter(c => c.status === 'pending').length,
    'Active': churches.filter(c => c.status === 'active').length,
    'Suspended': churches.filter(c => c.status === 'suspended').length,
  };

  const handleApprove = async (church) => {
    setActionLoading(church.id + '_approve');
    await updateChurchStatus(church.id, 'active');
    // Send approval email to registrant
    await sendChurchApprovalEmail({
      registrantEmail: church.email,
      registrantName: church.registrant_name,
      churchName: church.church_name,
    });
    setActionLoading(null);
    if (viewChurch?.id === church.id) setViewChurch({ ...viewChurch, status: 'active' });
  };

  const handleReject = async (church) => {
    if (!window.confirm(`Reject "${church.church_name}"? This will mark them as suspended.`)) return;
    setActionLoading(church.id + '_reject');
    await updateChurchStatus(church.id, 'suspended');
    setActionLoading(null);
    if (viewChurch?.id === church.id) setViewChurch({ ...viewChurch, status: 'suspended' });
  };

  const handleSuspend = async (church) => {
    if (!window.confirm(`Suspend "${church.church_name}"? Their clerk will not be able to log in.`)) return;
    setActionLoading(church.id + '_suspend');
    await updateChurchStatus(church.id, 'suspended');
    setActionLoading(null);
    if (viewChurch?.id === church.id) setViewChurch({ ...viewChurch, status: 'suspended' });
  };

  const handleReactivate = async (church) => {
    setActionLoading(church.id + '_reactivate');
    await updateChurchStatus(church.id, 'active');
    setActionLoading(null);
    if (viewChurch?.id === church.id) setViewChurch({ ...viewChurch, status: 'active' });
  };

  const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  const StatusBadge = ({ status }) => (
    <span className={`sa-badge sa-badge-${status}`}>
      {status === 'pending' ? '⏳ Pending' : status === 'active' ? '✅ Active' : '🚫 Suspended'}
    </span>
  );

  return (
    <div className="sa-layout">
      {/* Sidebar */}
      <div className="sa-sidebar">
        <div className="sa-sidebar-top">
          <div className="sa-logo">
            <span>✝</span>
            <div>
              <strong>FaithSync</strong>
              <small>Super Admin</small>
            </div>
          </div>
          <div className="sa-admin-badge">🔐 churchms.dev@gmail.com</div>
        </div>

        <nav className="sa-nav">
          {TABS.map(t => (
            <button
              key={t}
              className={`sa-nav-btn ${tab === t ? 'active' : ''}`}
              onClick={() => { setTab(t); setSearch(''); }}
            >
              <span className="sa-nav-label">{t}</span>
              {counts[t] > 0 && (
                <span className={`sa-nav-count ${t === 'Pending' && counts[t] > 0 ? 'urgent' : ''}`}>
                  {counts[t]}
                </span>
              )}
            </button>
          ))}
        </nav>

        <button className="sa-logout" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>

      {/* Main */}
      <div className="sa-main">
        <div className="sa-header">
          <div>
            <h1>⛪ {tab}</h1>
            <p>{filtered.length} church{filtered.length !== 1 ? 'es' : ''} {tab !== 'All Churches' ? `— ${tab.toLowerCase()}` : 'registered'}</p>
          </div>
          <input
            className="sa-search"
            placeholder="🔍 Search churches..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Stats row */}
        <div className="sa-stats">
          <div className="sa-stat"><div className="sa-stat-val">{counts['All Churches']}</div><div className="sa-stat-label">Total Churches</div></div>
          <div className="sa-stat sa-stat-pending"><div className="sa-stat-val">{counts['Pending']}</div><div className="sa-stat-label">Pending Approval</div></div>
          <div className="sa-stat sa-stat-active"><div className="sa-stat-val">{counts['Active']}</div><div className="sa-stat-label">Active Churches</div></div>
          <div className="sa-stat sa-stat-suspended"><div className="sa-stat-val">{counts['Suspended']}</div><div className="sa-stat-label">Suspended</div></div>
        </div>

        {/* Pending alert */}
        {counts['Pending'] > 0 && tab !== 'Pending' && (
          <div className="sa-alert" onClick={() => setTab('Pending')}>
            ⏳ <strong>{counts['Pending']} church{counts['Pending'] !== 1 ? 'es are' : ' is'} waiting for approval.</strong> Click to review →
          </div>
        )}

        {/* Church cards */}
        {filtered.length === 0 ? (
          <div className="sa-empty">
            <span>⛪</span>
            <p>No churches found{search ? ` for "${search}"` : ''}.</p>
          </div>
        ) : (
          <div className="sa-cards">
            {filtered.map(c => (
              <div key={c.id} className={`sa-card sa-card-${c.status}`}>
                <div className="sa-card-header">
                  <div className="sa-card-title">
                    <strong>{c.church_name}</strong>
                    <StatusBadge status={c.status} />
                  </div>
                  <span className="sa-card-date">Registered: {fmtDate(c.created_at)}</span>
                </div>

                <div className="sa-card-body">
                  <div className="sa-card-row"><span>📍 Location</span><strong>{c.address}</strong></div>
                  {c.diocese && <div className="sa-card-row"><span>⛪ Diocese</span><strong>{c.diocese}</strong></div>}
                  <div className="sa-card-row"><span>📧 Email</span><strong>{c.email}</strong></div>
                  <div className="sa-card-row"><span>📱 Contact</span><strong>{c.contact_number}</strong></div>
                  <div className="sa-card-row"><span>👤 Registered by</span><strong>{c.registrant_name} ({c.registrant_gender || 'N/A'})</strong></div>
                  {c.church_head_name && <div className="sa-card-row"><span>✝ Church Head</span><strong>{c.church_head_title ? `${c.church_head_title} ` : ''}{c.church_head_name}</strong></div>}
                </div>

                <div className="sa-card-actions">
                  <button className="sa-btn-view" onClick={() => setViewChurch(c)}>👁️ View Details</button>
                  {c.status === 'pending' && (
                    <>
                      <button
                        className="sa-btn-approve"
                        onClick={() => handleApprove(c)}
                        disabled={actionLoading === c.id + '_approve'}
                      >
                        {actionLoading === c.id + '_approve' ? '⏳...' : '✅ Approve'}
                      </button>
                      <button
                        className="sa-btn-reject"
                        onClick={() => handleReject(c)}
                        disabled={actionLoading === c.id + '_reject'}
                      >
                        {actionLoading === c.id + '_reject' ? '⏳...' : '❌ Reject'}
                      </button>
                    </>
                  )}
                  {c.status === 'active' && (
                    <button
                      className="sa-btn-suspend"
                      onClick={() => handleSuspend(c)}
                      disabled={actionLoading === c.id + '_suspend'}
                    >
                      {actionLoading === c.id + '_suspend' ? '⏳...' : '🚫 Suspend'}
                    </button>
                  )}
                  {c.status === 'suspended' && (
                    <button
                      className="sa-btn-approve"
                      onClick={() => handleReactivate(c)}
                      disabled={actionLoading === c.id + '_reactivate'}
                    >
                      {actionLoading === c.id + '_reactivate' ? '⏳...' : '↩️ Reactivate'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Church Modal */}
      {viewChurch && (
        <div className="modal-overlay" onClick={() => setViewChurch(null)}>
          <div className="modal sa-view-modal" onClick={e => e.stopPropagation()}>
            <div className="sa-modal-header">
              <div>
                <h2>⛪ {viewChurch.church_name}</h2>
                <StatusBadge status={viewChurch.status} />
              </div>
              <button className="close-panel" onClick={() => setViewChurch(null)}>✕</button>
            </div>
            <div className="sa-modal-body">
              <div className="sa-section-label">Church Information</div>
              <div className="rec-detail-grid">
                <div className="rec-detail-item"><span className="rec-detail-label">Church Name</span><span className="rec-detail-value">{viewChurch.church_name}</span></div>
                <div className="rec-detail-item"><span className="rec-detail-label">Address</span><span className="rec-detail-value">{viewChurch.address}</span></div>
                <div className="rec-detail-item"><span className="rec-detail-label">Diocese</span><span className="rec-detail-value">{viewChurch.diocese || '—'}</span></div>
                <div className="rec-detail-item"><span className="rec-detail-label">Contact Number</span><span className="rec-detail-value">{viewChurch.contact_number}</span></div>
                <div className="rec-detail-item"><span className="rec-detail-label">Email</span><span className="rec-detail-value">{viewChurch.email}</span></div>
                <div className="rec-detail-item"><span className="rec-detail-label">Church Head</span><span className="rec-detail-value">{viewChurch.church_head_title ? `${viewChurch.church_head_title} ` : ''}{viewChurch.church_head_name || '—'}</span></div>
              </div>

              <div className="sa-section-label" style={{ marginTop: '16px' }}>Registrant Information</div>
              <div className="rec-detail-grid">
                <div className="rec-detail-item"><span className="rec-detail-label">Registered By</span><span className="rec-detail-value">{viewChurch.registrant_name}</span></div>
                <div className="rec-detail-item"><span className="rec-detail-label">Gender</span><span className="rec-detail-value">{viewChurch.registrant_gender || '—'}</span></div>
                <div className="rec-detail-item"><span className="rec-detail-label">Date Registered</span><span className="rec-detail-value">{fmtDate(viewChurch.created_at)}</span></div>
                <div className="rec-detail-item"><span className="rec-detail-label">Status</span><span className="rec-detail-value">{viewChurch.status}</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', padding: '16px', flexWrap: 'wrap' }}>
              {viewChurch.status === 'pending' && (
                <>
                  <button className="btn-primary" onClick={() => handleApprove(viewChurch)}>✅ Approve Church</button>
                  <button className="btn-danger" onClick={() => handleReject(viewChurch)}>❌ Reject</button>
                </>
              )}
              {viewChurch.status === 'active' && (
                <button className="btn-danger" onClick={() => handleSuspend(viewChurch)}>🚫 Suspend Church</button>
              )}
              {viewChurch.status === 'suspended' && (
                <button className="btn-primary" onClick={() => handleReactivate(viewChurch)}>↩️ Reactivate Church</button>
              )}
              <button className="btn-secondary" onClick={() => setViewChurch(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
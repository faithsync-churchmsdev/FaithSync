import { useState } from 'react';
import { useApp } from '../../AppContext';
import { getEventType } from '../../data/events';
import Calendar from '../../components/Calendar';
import Legend from '../../components/Legend';
import UpcomingEvents from '../../components/UpcomingEvents';
import EventModal from '../../components/EventModal';
import './Home.css';

function getThisWeekRange() {
  const now = new Date();
  const start = new Date(now); start.setHours(0,0,0,0);
  const end = new Date(start); end.setDate(start.getDate() + 7);
  return { start, end };
}
function dateToObj(str) {
  const [y,m,d] = str.split('-').map(Number);
  return new Date(y, m-1, d);
}
const CAT_COLORS = {
  'General Announcement':'#1a6fb5','Prayer Intention':'#9b59b6','Upcoming Feast':'#c0392b',
  'Community News':'#27ae60','Urgent Notice':'#e74c3c','Youth Ministry':'#e67e22','Other':'#7f8c8d',
};
const CAT_ICONS = {
  'General Announcement':'📢','Prayer Intention':'🙏','Upcoming Feast':'✝️',
  'Community News':'📰','Urgent Notice':'🚨','Youth Ministry':'👧','Other':'📌',
};

export default function Home({ setPage }) {
  const { events, bulletins } = useApp();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedBulletin, setSelectedBulletin] = useState(null);

  const today = new Date(); today.setHours(0,0,0,0);
  const { end: weekEnd } = getThisWeekRange();

  const activeEvents = events.filter(e => !e.archived && !e.done);
  const sorted = [...activeEvents].sort((a,b) => dateToObj(a.date) - dateToObj(b.date));
  const thisWeek = sorted.filter(e => dateToObj(e.date) >= today && dateToObj(e.date) < weekEnd);

  const activeBulletins = (bulletins || [])
    .filter(b => !b.archived)
    .sort((a,b) => { if(a.pinned && !b.pinned) return -1; if(!a.pinned && b.pinned) return 1; return b.id - a.id; });

  const hasBulletins = activeBulletins.length > 0;
  const goToRequest = () => { if (setPage) setPage('Request Event/Mass'); };
  const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="home-page">
      {/* Hero */}
      <div className="home-hero">
        <div className="home-hero-content">
          <div className="home-hero-cross">✝</div>
          <h1>Welcome to FaithSync</h1>
          <p>Your digital companion for Catholic Church life — events, records, and community, all in one place.</p>
        </div>
      </div>

      <div className="home-container">

        {/* TOP ROW: Bulletin (left) + This Week (right), or This Week full-width if no bulletins */}
        <section className="home-section home-top-row" data-has-bulletin={hasBulletins ? 'true' : 'false'}>
          {hasBulletins && (
            <div className="home-top-left">
              <h2 className="section-title">📌 Parish Bulletin Board</h2>
              <p className="section-sub">Latest announcements from the parish. Click to read more.</p>
              <div className="home-bulletin-list">
                {activeBulletins.slice(0, 4).map(b => (
                  <div key={b.id} className="home-bulletin-card" onClick={() => setSelectedBulletin(b)}
                    style={{ borderLeft: `4px solid ${CAT_COLORS[b.category] || '#1a6fb5'}` }}>
                    {b.pinned && <span className="home-pinned-tag">📌 Pinned</span>}
                    <div className="home-bulletin-cat">
                      {CAT_ICONS[b.category] || '📌'} {b.category}
                    </div>
                    <div className="home-bulletin-title">{b.title}</div>
                    <div className="home-bulletin-preview">{b.content.length > 100 ? b.content.slice(0,100)+'...' : b.content}</div>
                    <div className="home-bulletin-meta">✍️ {b.author || 'Parish Clerk'} · {fmtDate(b.createdAt)}</div>
                    <span className="home-bulletin-read-more">Read more →</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={hasBulletins ? 'home-top-right' : 'home-top-full'}>
            <h2 className="section-title">📅 Upcoming Events This Week</h2>
            <p className="section-sub">Events happening in the next 7 days.</p>
            {thisWeek.length === 0 ? (
              <div className="home-empty-week">
                <span>🕊️</span>
                <p>No events scheduled this week.</p>
                <button className="btn-primary" onClick={goToRequest}>📨 Request an Event / Mass</button>
              </div>
            ) : (
              <div className="home-week-list">
                {thisWeek.slice(0,5).map(ev => {
                  const type = getEventType(ev.type);
                  return (
                    <div key={ev.id} className="home-week-card" style={{borderLeft:`5px solid ${type.color}`}} onClick={()=>setSelectedEvent(ev)}>
                      <div className="hwc-icon" style={{background:type.color}}>{type.icon}</div>
                      <div className="hwc-info">
                        <div className="hwc-title">{ev.title}</div>
                        <div className="hwc-meta">📅 {ev.date} &nbsp;·&nbsp; 🕐 {ev.time} &nbsp;·&nbsp; 📍 {ev.location}</div>
                      </div>
                      <span className="hwc-arrow">›</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Calendar */}
        <section className="home-section">
          <h2 className="section-title">Parish Calendar</h2>
          <p className="section-sub">Click any day to see events. Up to 3 events per day.</p>
          <div className="home-cal-row">
            <div className="home-cal-main">
              <Calendar isClerk={false} onRequestEvent={goToRequest} />
            </div>
            <div className="home-cal-legend">
              <Legend />
            </div>
          </div>
        </section>

        {/* All Upcoming Events */}
        <UpcomingEvents isClerk={false} />
      </div>

      {/* Event detail modal */}
      {selectedEvent && (
        <EventModal event={selectedEvent} isClerk={false} onClose={()=>setSelectedEvent(null)} />
      )}

      {/* Bulletin detail modal */}
      {selectedBulletin && (
        <div className="modal-overlay" onClick={() => setSelectedBulletin(null)}>
          <div className="modal bulletin-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="bulletin-detail-header" style={{ borderBottom: `4px solid ${CAT_COLORS[selectedBulletin.category] || '#1a6fb5'}` }}>
              <div className="bulletin-detail-cat">
                {CAT_ICONS[selectedBulletin.category] || '📌'} {selectedBulletin.category}
                {selectedBulletin.pinned && <span className="home-pinned-tag" style={{marginLeft:'8px'}}>📌 Pinned</span>}
              </div>
              <h2 className="bulletin-detail-title">{selectedBulletin.title}</h2>
              <p className="bulletin-detail-meta">✍️ {selectedBulletin.author || 'Parish Clerk'} · {fmtDate(selectedBulletin.createdAt)}</p>
              <button className="close-panel" onClick={() => setSelectedBulletin(null)}>✕</button>
            </div>
            <div className="bulletin-detail-body">
              <p>{selectedBulletin.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
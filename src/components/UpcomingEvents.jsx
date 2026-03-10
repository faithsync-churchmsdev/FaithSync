import { useState } from 'react';
import { useApp } from '../AppContext';
import { getEventType } from '../data/events';
import EventModal from './EventModal';
import './UpcomingEvents.css';

function getThisWeekRange() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0,0,0,0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

function dateToObj(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const PAGE_SIZE = 5;

export default function UpcomingEvents({ isClerk = false }) {
  const { events } = useApp();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [allPage, setAllPage] = useState(1);

  const today = new Date();
  today.setHours(0,0,0,0);
  const { end: weekEnd } = getThisWeekRange();

  const activeEvents = events.filter(e => !e.archived);
  const sorted = [...activeEvents].sort((a, b) => dateToObj(a.date) - dateToObj(b.date));

  const upcoming = sorted.filter(e => dateToObj(e.date) >= today);
  const thisWeek = upcoming.filter(e => dateToObj(e.date) < weekEnd);
  const allUpcoming = upcoming;

  const paginate = (arr, page) => arr.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = (arr) => Math.max(1, Math.ceil(arr.length / PAGE_SIZE));

  const renderCard = (ev) => {
    const type = getEventType(ev.type);
    return (
      <div key={ev.id} className="upcoming-card" style={{ borderLeft: `5px solid ${type.color}` }} onClick={() => setSelectedEvent(ev)}>
        <div className="uc-icon" style={{ background: type.color }}>{type.icon}</div>
        <div className="uc-info">
          <div className="uc-title">{ev.title}</div>
          <div className="uc-meta">📅 {ev.date} &nbsp;·&nbsp; 🕐 {ev.time}</div>
          <div className="uc-meta">📍 {ev.location}</div>
        </div>
        <span className="uc-arrow">›</span>
      </div>
    );
  };

  const Paginator = ({ arr, page, setPage }) => (
    totalPages(arr) > 1 ? (
      <div className="pagination">
        {Array.from({ length: totalPages(arr) }, (_, i) => (
          <button key={i} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
        ))}
      </div>
    ) : null
  );

  return (
    <div className="upcoming-events-wrapper">
      {/* All Upcoming */}
      <section className="upcoming-section">
        <div className="upcoming-section-header">
          <h3>🗓️ All Upcoming Events</h3>
        </div>
        {allUpcoming.length === 0 ? (
          <div className="empty-state"><p>No upcoming events found.</p></div>
        ) : (
          <>
            <div className="upcoming-list">{paginate(allUpcoming, allPage).map(renderCard)}</div>
            <Paginator arr={allUpcoming} page={allPage} setPage={setAllPage} />
          </>
        )}
      </section>

      {selectedEvent && (
        <EventModal event={selectedEvent} isClerk={isClerk} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
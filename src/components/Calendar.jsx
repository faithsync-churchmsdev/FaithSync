import { useState } from 'react';
import { useApp } from '../AppContext';
import { getEventType } from '../data/events';
import EventModal from './EventModal';
import './Calendar.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function Calendar({ isClerk = false, onRequestEvent }) {
  const { events, clientEvents, role, selectedChurch } = useApp();
  const today = new Date();
  today.setHours(0,0,0,0);

  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [pastDayClicked, setPastDayClicked] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Clerk sees all their church events
  // Client sees only approved events from selected church (separate clientEvents state)
  const allEvents = isClerk
    ? (events || [])
    : (clientEvents || []);

  // If client hasn't selected a church yet, show empty
  const showEmpty = !isClerk && !selectedChurch;

  const getDateStr = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getEventsForDate = (day) => {
    const dateStr = getDateStr(day);
    return allEvents.filter(e => e.date === dateStr).slice(0, 3);
  };

  const isPast = (day) => {
    const cellDate = new Date(year, month, day);
    cellDate.setHours(0,0,0,0);
    return cellDate < today;
  };

  const isToday = (day) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday = () => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));

  const handleDayClick = (day) => {
    if (showEmpty) return;
    const cellDate = new Date(year, month, day); cellDate.setHours(0,0,0,0);
    const todayDate = new Date(); todayDate.setHours(0,0,0,0);
    setPastDayClicked(cellDate < todayDate);
    setSelectedDay(day);
    setSelectedEvent(null);
  };

  const selectedDayEvents = selectedDay ? getEventsForDate(selectedDay) : [];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="calendar-wrapper">
      <div className="calendar-card">
        {/* Header */}
        <div className="calendar-header">
          <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
          <div className="cal-title-group">
            <h2 className="cal-month">{MONTHS[month]} {year}</h2>
            <button className="cal-today-btn" onClick={goToday}>Today</button>
          </div>
          <button className="cal-nav-btn" onClick={nextMonth}>›</button>
        </div>

        {/* No church selected notice for client */}
        {showEmpty && (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-light)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⛪</div>
            <p>Please select a church from the banner above to see events.</p>
          </div>
        )}

        {/* Day headers */}
        {!showEmpty && (
          <>
            <div className="calendar-grid">
              {DAYS.map(d => (
                <div key={d} className="cal-day-header">{d}</div>
              ))}

              {cells.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} className="cal-cell empty" />;

                const dayEvents = getEventsForDate(day);
                const past = isPast(day);
                const todayCell = isToday(day);
                const hasEvents = dayEvents.length > 0;
                const allDone = hasEvents && dayEvents.every(e => e.archived || e.done);

                return (
                  <div
                    key={day}
                    className={[
                      'cal-cell',
                      todayCell ? 'today' : '',
                      past && !todayCell ? 'past' : '',
                      selectedDay === day ? 'selected' : '',
                      hasEvents ? 'has-events' : '',
                      allDone ? 'all-done' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => handleDayClick(day)}
                  >
                    <span className="cal-day-num">{day}</span>
                    <div className="cal-event-dots">
                      {dayEvents.map(ev => {
                        const type = getEventType(ev.type);
                        const isDone = ev.archived || ev.done;
                        return (
                          <span
                            key={ev.id}
                            className={`cal-event-dot ${isDone ? 'dot-done' : ''}`}
                            title={ev.title}
                            style={{ background: isDone ? '#aaa' : type.color }}
                          >
                            <span className="dot-icon">{type.icon}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend row */}
            <div className="cal-footer">
              <span className="cal-legend-item"><span className="cal-legend-dot today-dot" />Today</span>
              <span className="cal-legend-item"><span className="cal-legend-dot past-dot" />Past</span>
              <span className="cal-legend-item"><span className="cal-legend-dot event-dot" />Has Events</span>
              {isClerk && <span className="cal-legend-item"><span className="cal-legend-dot done-dot" />Done</span>}
            </div>
          </>
        )}
      </div>

      {/* Day Detail Panel */}
      {selectedDay && !showEmpty && (
        <div className="day-detail-panel">
          <div className="day-detail-header">
            <h3>{MONTHS[month]} {selectedDay}, {year}</h3>
            <button className="close-panel" onClick={() => { setSelectedDay(null); setPastDayClicked(false); }}>✕</button>
          </div>

          {pastDayClicked && (
            <div className="past-day-notice">
              <span>🗓️</span>
              <div>
                <strong>This day has already passed.</strong>
                <p>Events from past days are shown for reference only.</p>
              </div>
            </div>
          )}

          {selectedDayEvents.length === 0 ? (
            <div className="day-empty-state">
              <div className="day-empty-icon">{pastDayClicked ? '📋' : '📭'}</div>
              <p>{pastDayClicked ? 'No events were recorded on this day.' : 'No events on this day.'}</p>
              {!isClerk && !pastDayClicked && selectedChurch && (
                <button className="btn-primary" style={{ width: '100%', marginTop: '12px' }} onClick={() => {
                  setSelectedDay(null);
                  if (onRequestEvent) onRequestEvent();
                }}>
                  📅 Request an Event / Mass
                </button>
              )}
            </div>
          ) : (
            <div className="day-events-list">
              {selectedDayEvents.map(ev => {
                const type = getEventType(ev.type);
                const isDone = ev.archived || ev.done;
                return (
                  <div
                    key={ev.id}
                    className={`day-event-card ${isDone ? 'event-done' : ''}`}
                    style={{ borderLeft: `5px solid ${isDone ? '#aaa' : type.color}` }}
                    onClick={() => setSelectedEvent(ev)}
                  >
                    <div className="day-event-icon" style={{ background: isDone ? '#eee' : type.color + '22' }}>
                      {type.icon}
                    </div>
                    <div className="day-event-info">
                      <div className="day-event-title">
                        {ev.title}
                        {isDone && <span className="done-badge">✓ Done</span>}
                      </div>
                      <div className="day-event-meta">🕐 {ev.time || 'All day'} · 📍 {ev.location}</div>
                    </div>
                    <span className="day-event-arrow">›</span>
                  </div>
                );
              })}
              {selectedDayEvents.length < 3 && !isClerk && !pastDayClicked && (
                <button className="btn-secondary" style={{ width: '100%', marginTop: '8px' }} onClick={() => {
                  setSelectedDay(null);
                  if (onRequestEvent) onRequestEvent();
                }}>
                  + Request Another Event
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isClerk={isClerk}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
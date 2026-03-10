import { EVENT_TYPES } from '../data/events';
import './Legend.css';

export default function Legend() {
  return (
    <div className="legend-card">
      <h3 className="legend-title">🗺️ Event Legend</h3>
      <div className="legend-grid">
        {EVENT_TYPES.map(type => (
          <div key={type.id} className="legend-item">
            <span className="legend-icon" style={{ background: type.color }}>{type.icon}</span>
            <span className="legend-label">{type.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
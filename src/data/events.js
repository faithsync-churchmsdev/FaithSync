export const EVENT_TYPES = [
  { id: 'sunday_mass', label: 'Sunday Mass', icon: '⛪', color: '#1a6fb5' },
  { id: 'weekday_mass', label: 'Weekday Mass', icon: '🕯️', color: '#3b9fd1' },
  { id: 'baptism', label: 'Baptism', icon: '💧', color: '#2e8b57' },
  { id: 'wedding', label: 'Wedding Mass', icon: '💍', color: '#c0392b' },
  { id: 'funeral', label: 'Funeral Mass', icon: '🕊️', color: '#6a8aa0' },
  { id: 'choir', label: 'Choir Practice', icon: '🎵', color: '#9b59b6' },
  { id: 'renovation', label: 'Renovation', icon: '🔧', color: '#e67e22' },
  { id: 'novena', label: 'Novena', icon: '📿', color: '#d4ac0d' },
  { id: 'fiesta', label: 'Fiesta Mass', icon: '🎊', color: '#e74c3c' },
  { id: 'communion', label: 'First Communion', icon: '🍞', color: '#c47d1e' },
  { id: 'confirmation', label: 'Confirmation', icon: '🕊️', color: '#7c4dab' },
  { id: 'meeting', label: 'Meeting', icon: '👥', color: '#27ae60' },
  { id: 'catechism', label: 'Catechism', icon: '📖', color: '#16a085' },
  { id: 'other', label: 'Other', icon: '📌', color: '#7f8c8d' },
  { id: 'others', label: 'Others', icon: '📌', color: '#7f8c8d' },
];

export const getEventType = (id) =>
  EVENT_TYPES.find(e => e.id === id) || { id: 'other', label: 'Other', icon: '📌', color: '#7f8c8d' };

// No initial events — each church starts fresh from Supabase
export const initialEvents = [];

export const MASS_CATEGORIES = [
  {
    category: 'Regular / Scheduled Masses',
    types: ['Sunday Mass', 'Weekday / Daily Mass', 'Saturday Vigil Mass', "Children's Mass", 'School Mass', 'Community / Barangay Mass'],
  },
  {
    category: 'Devotional / Votive Masses',
    types: ['First Friday Mass', 'First Saturday Mass', 'Simbang Gabi / Misa de Aguinaldo', 'Rorate Mass', 'Mass for the Holy Spirit', 'Thanksgiving Mass', 'Healing Mass', 'Mass for Peace', 'Mass for the Dead'],
  },
  {
    category: 'Sacramental Masses',
    types: ['Baptism Mass', 'Confirmation Mass', 'Nuptial Mass (Wedding Mass)', 'Ordination Mass', 'First Communion Mass'],
  },
  {
    category: 'Funeral / Memorial Masses',
    types: ['Funeral Mass', 'Requiem Mass', 'Burial Mass', 'Death Anniversary Mass', "All Souls' Day Mass"],
  },
  {
    category: 'Feast Day / Liturgical Calendar Masses',
    types: ['Christmas Eve Mass', 'Christmas Day Mass', 'Easter Vigil Mass', 'Easter Sunday Mass', 'Palm Sunday Mass', 'Ash Wednesday Mass', 'Holy Thursday Mass', 'Pentecost Mass', 'Feast Day Mass (for saints)'],
  },
  {
    category: 'Marian and Filipino Devotional',
    types: ['Flores de Mayo Mass', 'Santacruzan Mass', 'Novena Mass', 'Fiesta Mass', 'Procession Mass'],
  },
  {
    category: 'Liturgical Style',
    types: ['Low Mass', 'High Mass', 'Solemn Mass', 'Pontifical Mass', 'Concelebrated Mass'],
  },
  {
    category: 'Others',
    types: ['Choir Practice', 'Church Renovation', 'Bible Study', 'Youth Meeting', 'Community Outreach', 'Manual Addition'],
  },
];

// Removed hardcoded church locations — clerks now type their own location
// "Other (please specify)" is kept for custom entries
export const BASE_LOCATIONS = ['Main Chapel', 'Side Chapel', 'Parish Hall', 'Baptistry', 'Function Room', 'Church Grounds', 'Other (please specify)'];

export const getEventType2 = (category) => {
  const map = {
    'Regular / Scheduled Masses': 'sunday_mass',
    'Devotional / Votive Masses': 'novena',
    'Sacramental Masses': 'baptism',
    'Funeral / Memorial Masses': 'funeral',
    'Feast Day / Liturgical Calendar Masses': 'fiesta',
    'Marian and Filipino Devotional': 'novena',
    'Liturgical Style': 'sunday_mass',
    'Others': 'other',
  };
  return map[category] || 'other';
};
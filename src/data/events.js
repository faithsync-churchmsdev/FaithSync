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
  { id: 'others', label: 'Others', icon: '📌', color: '#7f8c8d' },
];

export const getEventType = (id) => EVENT_TYPES.find(e => e.id === id) || EVENT_TYPES[EVENT_TYPES.length - 1];

const today = new Date();
const y = today.getFullYear();
const m = today.getMonth();

export const initialEvents = [
  {
    id: 1,
    date: `${y}-${String(m + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
    type: 'sunday_mass',
    title: 'Sunday Mass',
    time: '8:00 AM',
    location: 'Metropolitan Cathedral of the Immaculate Conception',
    priest: 'Fr. Santos',
    notes: 'Regular Sunday Mass for all parishioners.',
    status: 'approved',
  },
  {
    id: 2,
    date: `${y}-${String(m + 1).padStart(2, '0')}-${String(today.getDate() + 1).padStart(2, '0')}`,
    type: 'choir',
    title: 'Choir Practice',
    time: '4:00 PM',
    location: 'Metropolitan Cathedral of the Immaculate Conception',
    priest: '',
    notes: 'Weekly choir practice for Sunday Mass.',
    status: 'approved',
  },
  {
    id: 3,
    date: `${y}-${String(m + 1).padStart(2, '0')}-${String(today.getDate() + 2).padStart(2, '0')}`,
    type: 'baptism',
    title: 'Baptism Ceremony',
    time: '10:00 AM',
    location: 'Archdiocesan Shrine of Our Lady of the Pillar (Fort Pilar), Zamboanga City',
    priest: 'Fr. Reyes',
    notes: 'Baptism of 3 infants.',
    status: 'approved',
  },
  {
    id: 4,
    date: `${y}-${String(m + 1).padStart(2, '0')}-${String(today.getDate() + 4).padStart(2, '0')}`,
    type: 'wedding',
    title: 'Nuptial Mass',
    time: '2:00 PM',
    location: 'Metropolitan Cathedral of the Immaculate Conception',
    priest: 'Fr. Santos',
    notes: 'Wedding of Juan Dela Cruz and Maria Santos.',
    status: 'approved',
  },
  {
    id: 5,
    date: `${y}-${String(m + 1).padStart(2, '0')}-${String(today.getDate() + 5).padStart(2, '0')}`,
    type: 'novena',
    title: 'Novena Mass',
    time: '6:00 PM',
    location: 'Metropolitan Cathedral of the Immaculate Conception',
    priest: 'Fr. Reyes',
    notes: '9-day devotion in preparation for the parish feast.',
    status: 'approved',
  },
];

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

export const BASE_LOCATIONS = ['Metropolitan Cathedral of the Immaculate Conception, Zamboanga City', 'Archdiocesan Shrine of Our Lady of the Pillar (Fort Pilar), Zamboanga City'];
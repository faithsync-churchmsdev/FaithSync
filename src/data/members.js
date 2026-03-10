export const MINISTRIES = [
  'Choir / Music Ministry',
  'Lector',
  'Altar Server',
  'Usher',
  'Eucharistic Minister',
  'Catechism Volunteer',
  'Events Volunteer',
  'Youth Ministry',
  'Basic Ecclesial Community',
];

export const ROLES = ['Member', 'Leader', 'Coordinator', 'Volunteer'];
export const STATUSES = ['Active', 'Training', 'Pending', 'Inactive'];
export const SKILLS = ['Singing', 'Reading', 'Teaching', 'Organizing', 'Music', 'Art', 'Cooking', 'Carpentry'];
export const AVAILABILITIES = ['Sunday', 'Saturday', 'Weekdays', 'Anytime'];

export const PRIEST_TITLES = ['Fr.', 'Rev. Fr.', 'Msgr.', 'Bishop', 'Archbishop', 'Deacon'];
export const PRIEST_STATUSES = ['Active', 'Inactive', 'Retired', 'On Leave'];

export const initialMembers = [
  { id: 1, lastName: 'Dela Cruz', firstName: 'Juan', middleName: 'Santos', gender: 'Male', birthday: '1995-03-10', address: 'Zamboanga City', contact: '09171234567', email: 'juan@email.com', ministry: 'Choir / Music Ministry', role: 'Member', status: 'Active', joined: '2026-03-10', skills: ['Singing'], availability: ['Sunday'], baptized: true, confirmed: true, firstCommunion: true, archived: false },
  { id: 2, lastName: 'Santos', firstName: 'Maria', middleName: 'Cruz', gender: 'Female', birthday: '1998-01-15', address: 'Zamboanga City', contact: '09281234567', email: 'maria@email.com', ministry: 'Lector', role: 'Reader', status: 'Active', joined: '2026-01-15', skills: ['Reading'], availability: ['Sunday', 'Saturday'], baptized: true, confirmed: true, firstCommunion: true, archived: false },
  { id: 3, lastName: 'Reyes', firstName: 'Pedro', middleName: 'Bautista', gender: 'Male', birthday: '2005-02-05', address: 'Zamboanga City', contact: '09391234567', email: '', ministry: 'Altar Server', role: 'Member', status: 'Training', joined: '2026-02-05', skills: ['Organizing'], availability: ['Sunday'], baptized: true, confirmed: false, firstCommunion: true, archived: false },
  { id: 4, lastName: 'Cruz', firstName: 'Ana', middleName: 'Lopez', gender: 'Female', birthday: '1990-12-03', address: 'Zamboanga City', contact: '09451234567', email: 'ana@email.com', ministry: 'Usher', role: 'Volunteer', status: 'Inactive', joined: '2025-12-03', skills: ['Organizing'], availability: ['Sunday'], baptized: true, confirmed: true, firstCommunion: true, archived: false },
];

export const initialPriests = [
  { id: 1, title: 'Fr.', lastName: 'Santos', firstName: 'Jose', middleName: 'Maria', suffix: '', birthday: '1970-05-15', address: 'Metropolitan Cathedral, Zamboanga City', contact: '09171110001', email: 'fr.santos@archzamboanga.org', specialization: 'Parish Priest', assignedParish: 'Metropolitan Cathedral of the Immaculate Conception', status: 'Active', ordainedDate: '1998-06-01', notes: '', archived: false },
  { id: 2, title: 'Fr.', lastName: 'Reyes', firstName: 'Antonio', middleName: 'Cruz', suffix: '', birthday: '1975-09-20', address: 'Fort Pilar, Zamboanga City', contact: '09181110002', email: 'fr.reyes@archzamboanga.org', specialization: 'Associate Priest', assignedParish: 'Archdiocesan Shrine of Our Lady of the Pillar (Fort Pilar)', status: 'Active', ordainedDate: '2003-06-15', notes: '', archived: false },
];
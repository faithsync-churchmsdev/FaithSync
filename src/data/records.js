export const initialParishioners = [
  { id: 1, lastName: 'Dela Cruz', firstName: 'Juan', middleName: 'Santos', suffix: '', birthdate: '1995-03-10', birthplace: 'Zamboanga City', sex: 'Male', fatherName: 'Roberto Dela Cruz', motherName: 'Lorna Santos', address: 'Zamboanga City', city: 'Zamboanga City', province: 'Zamboanga del Sur', contact: '09171234567', email: 'juan@email.com', archived: false },
  { id: 2, lastName: 'Santos', firstName: 'Maria', middleName: 'Cruz', suffix: '', birthdate: '1998-01-15', birthplace: 'Zamboanga City', sex: 'Female', fatherName: 'Carlos Santos', motherName: 'Felisa Cruz', address: 'Zamboanga City', city: 'Zamboanga City', province: 'Zamboanga del Sur', contact: '09281234567', email: 'maria@email.com', archived: false },
  { id: 3, lastName: 'Reyes', firstName: 'Pedro', middleName: 'Bautista', suffix: '', birthdate: '2005-02-05', birthplace: 'Zamboanga City', sex: 'Male', fatherName: 'Jose Reyes', motherName: 'Carmen Bautista', address: 'Zamboanga City', city: 'Zamboanga City', province: 'Zamboanga del Sur', contact: '09391234567', email: '', archived: false },
];

export const initialBaptisms = [
  { id: 1, parishionerId: 1, dateOfBirth: '1995-03-10', placeOfBirth: 'Zamboanga City', fatherName: 'Roberto Dela Cruz', motherName: 'Lorna Santos', godfather: 'Carlos Reyes', godmother: 'Ana Santos', baptismDate: '1995-04-02', church: 'Metropolitan Cathedral of the Immaculate Conception, Zamboanga City', priest: 'Fr. Santos', archived: false },
  { id: 2, parishionerId: 2, dateOfBirth: '1998-01-15', placeOfBirth: 'Zamboanga City', fatherName: 'Carlos Santos', motherName: 'Felisa Cruz', godfather: 'Pedro Cruz', godmother: 'Rosa Reyes', baptismDate: '1998-02-20', church: 'Archdiocesan Shrine of Our Lady of the Pillar (Fort Pilar), Zamboanga City', priest: 'Fr. Reyes', archived: false },
];

export const initialConfirmations = [
  { id: 1, parishionerId: 1, baptismVerified: true, firstCommunionVerified: true, confirmationName: 'Miguel', sponsor: 'Carlos Reyes', confirmationDate: '2010-06-15', bishop: 'Bishop Dela Rosa', parish: 'Metropolitan Cathedral of the Immaculate Conception', archived: false },
];

export const initialFirstCommunions = [
  { id: 1, parishionerId: 1, baptismVerified: true, catechismCompleted: true, communionDate: '2005-05-10', church: 'Metropolitan Cathedral of the Immaculate Conception', priest: 'Fr. Santos', archived: false },
];

export const initialMarriages = [
  { id: 1, brideId: 2, groomId: 1, baptismCert: true, confirmationCert: true, marriageLicense: true, weddingDate: '2025-12-20', parish: 'Metropolitan Cathedral of the Immaculate Conception', priest: 'Fr. Santos', witness1: 'Carlos Reyes', witness2: 'Ana Santos', archived: false },
];

export const initialFunerals = [
  { id: 1, parishionerId: 3, dateOfDeath: '2025-01-10', funeralDate: '2025-01-13', priest: 'Fr. Santos', burialLocation: 'Zamboanga City Cemetery', archived: false },
];

export const RECORD_TYPES = ['Baptismal Certificate', 'Confirmation Certificate', 'Marriage Certificate', 'Funeral Record', 'First Communion Certificate', 'Other'];
export const INCOME_CATEGORIES = ['Donation', 'Mass Offering', 'Tithes', 'Fundraising Event', 'Special Collection', 'Grant / Sponsorship', 'Candle Offering', 'Building Fund', 'Memorial Donation'];
export const EXPENSE_CATEGORIES = ['Utilities', 'Building Maintenance', 'Church Repair', 'Office Supplies', 'Staff Salary / Allowance', 'Event Expenses', 'Ministry Expenses', 'Charity Outreach', 'Sound System Maintenance'];
export const PAYMENT_METHODS = ['Cash', 'GCash', 'Bank Transfer', 'Check'];

const today = new Date();
const y = today.getFullYear();
const m = String(today.getMonth() + 1).padStart(2, '0');

export const initialTransactions = [
  { id: 1, type: 'income', category: 'Mass Offering', amount: 3000, date: `${y}-${m}-10`, method: 'Cash', payer: 'Anonymous', description: 'Sunday Mass Offering', status: 'Completed', archived: false },
  { id: 2, type: 'expense', category: 'Utilities', amount: 2500, date: `${y}-${m}-09`, method: 'Bank Transfer', payer: 'Cotabato Electric Cooperative', description: 'Electric Bill', status: 'Completed', archived: false },
  { id: 3, type: 'income', category: 'Fundraising Event', amount: 10000, date: `${y}-${m}-08`, method: 'GCash', payer: 'Parish Community', description: 'Fiesta Fundraising', status: 'Completed', archived: false },
  { id: 4, type: 'expense', category: 'Building Maintenance', amount: 5000, date: `${y}-${m}-07`, method: 'Cash', payer: 'Juan Construction', description: 'Roof Repair', status: 'Completed', archived: false },
  { id: 5, type: 'income', category: 'Donation', amount: 5000, date: `${y}-${m}-06`, method: 'GCash', payer: 'Maria Santos', description: 'Personal Donation', status: 'Completed', archived: false },
  { id: 6, type: 'expense', category: 'Utilities', amount: 800, date: `${y}-${m}-05`, method: 'Cash', payer: 'ZAMCELCO', description: 'Water Bill', status: 'Completed', archived: false },
];
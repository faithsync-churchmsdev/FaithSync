import { useState } from 'react';
import ConfirmModal from '../../components/ConfirmModal';
import { useApp } from '../../AppContext';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../data/finance';
import './Finance.css';

const TABS = ['Dashboard', 'Income', 'Expenses', 'Transactions', 'Archives'];
const PAGE_SIZE = 8;
const ALL_INCOME_CATS = [...INCOME_CATEGORIES, 'Other (please specify)'];
const ALL_EXPENSE_CATS = [...EXPENSE_CATEGORIES, 'Other (please specify)'];

export default function Finance() {
  const [tab, setTab] = useState('Dashboard');
  const { transactions, addTransaction, archiveTransaction, restoreTransaction, deleteTransaction } = useApp();

  const active = transactions.filter(t => !t.archived);
  const archived = transactions.filter(t => t.archived);
  const income = active.filter(t => t.type === 'income');
  const expense = active.filter(t => t.type === 'expense');
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const totalExpense = expense.reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="finance-page">
      <div className="finance-header">
        <h1>💰 Finance Management</h1>
        <p>Track parish income, expenses, and financial records.</p>
      </div>
      <div className="finance-tabs">
        {TABS.map(t => <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      {tab === 'Dashboard' && <FinanceDashboard income={totalIncome} expense={totalExpense} balance={balance} transactions={active} />}
      {tab === 'Income' && <IncomeManager income={income} onAdd={(f) => addTransaction({ ...f, type: 'income' })} onArchive={archiveTransaction} />}
      {tab === 'Expenses' && <ExpenseManager expense={expense} onAdd={(f) => addTransaction({ ...f, type: 'expense' })} onArchive={archiveTransaction} />}
      {tab === 'Transactions' && <TransactionHistory transactions={active} onArchive={archiveTransaction} />}
      {tab === 'Archives' && <FinanceArchives transactions={archived} onRestore={restoreTransaction} onDelete={deleteTransaction} />}
    </div>
  );
}

function FinanceDashboard({ income, expense, balance, transactions }) {
  const recent = [...transactions].sort((a,b) => new Date(b.date)-new Date(a.date)).slice(0,5);
  return (
    <div>
      <div className="finance-stats">
        <div className="finance-stat income-stat">
          <div className="fs-icon">💰</div>
          <div className="fs-value">₱{income.toLocaleString()}</div>
          <div className="fs-label">Total Income</div>
        </div>
        <div className="finance-stat expense-stat">
          <div className="fs-icon">📉</div>
          <div className="fs-value">₱{expense.toLocaleString()}</div>
          <div className="fs-label">Total Expenses</div>
        </div>
        <div className="finance-stat balance-stat">
          <div className="fs-icon">⚖️</div>
          <div className="fs-value" style={{color: balance >= 0 ? 'var(--success)' : 'var(--danger)'}}>₱{Math.abs(balance).toLocaleString()}</div>
          <div className="fs-label">{balance >= 0 ? 'Surplus' : 'Deficit'}</div>
        </div>
      </div>
      <h3 style={{margin:'24px 0 12px'}}>Recent Transactions</h3>
      <div style={{overflowX:'auto'}}>
        <table>
          <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Description</th></tr></thead>
          <tbody>
            {recent.map(t => <tr key={t.id}>
              <td>{t.date}</td>
              <td><span className={`badge ${t.type==='income'?'badge-active':'badge-inactive'}`}>{t.type==='income'?'Income':'Expense'}</span></td>
              <td>{t.category}</td>
              <td style={{color:t.type==='income'?'var(--success)':'var(--danger)',fontWeight:'bold'}}>₱{t.amount.toLocaleString()}</td>
              <td>{t.description}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IncomeManager({ income, onAdd, onArchive }) {
  const [show, setShow] = useState(false);

  const [cfm, setCfm] = useState({ open:false, msg:'', label:'', color:'', action:null });
  const askConfirm = (msg, label, color, action) => setCfm({ open:true, msg, label, color, action });
  const doCfm = () => { cfm.action && cfm.action(); setCfm(s=>({...s,open:false})); };
  const cancelCfm = () => setCfm(s=>({...s,open:false}));
  const emptyF = { category: INCOME_CATEGORIES[0], customCategory:'', amount:'', date:'', method:'Cash', payer:'', description:'' };
  const [f, setF] = useState(emptyF);
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const save = () => {
    if(!f.amount||!f.date){alert('Fill required fields.');return;}
    const finalCategory = f.category === 'Other (please specify)' ? (f.customCategory || 'Other') : f.category;
    onAdd({...f, category: finalCategory, amount:Number(f.amount)});
    setShow(false); setF(emptyF);
  };
  const sorted = [...income].sort((a,b)=>new Date(b.date)-new Date(a.date));
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
        <h2>💰 Income Records</h2>
        <button className="btn-primary" onClick={()=>setShow(true)}>+ Add Income</button>
      </div>
      <div style={{overflowX:'auto'}}>
        <table><thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Method</th><th>From</th><th>Description</th><th>Action</th></tr></thead>
        <tbody>{sorted.length===0
          ? <tr><td colSpan={7} style={{textAlign:'center',padding:'24px',color:'var(--text-light)'}}>No income records.</td></tr>
          : sorted.map(t=><tr key={t.id}>
              <td>{t.date}</td><td>{t.category}</td>
              <td style={{color:'var(--success)',fontWeight:'bold'}}>₱{t.amount.toLocaleString()}</td>
              <td>{t.method}</td><td>{t.payer}</td><td>{t.description}</td>
              <td><button className="btn-danger" style={{padding:'6px 10px',fontSize:'0.8rem'}} onClick={()=>askConfirm('Archive this transaction?','🗃️ Yes, Archive','var(--warning)',()=>onArchive(t.id))}>🗃️ Archive</button></td>
            </tr>)}
        </tbody></table>
      </div>
      {show && <div className="modal-overlay" onClick={()=>setShow(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h2>💰 Add Income</h2>
        <div className="form-group"><label>Category</label>
          <select value={f.category} onChange={e=>set('category',e.target.value)}>
            {ALL_INCOME_CATS.map(c=><option key={c}>{c}</option>)}
          </select>
          {f.category==='Other (please specify)' && <input style={{marginTop:'8px'}} placeholder="Please specify category..." value={f.customCategory} onChange={e=>set('customCategory',e.target.value)} />}
        </div>
        <div className="form-row">
          <div className="form-group"><label>Amount (₱) *</label><input type="number" value={f.amount} onChange={e=>set('amount',e.target.value)}/></div>
          <div className="form-group"><label>Date *</label><input type="date" value={f.date} onChange={e=>set('date',e.target.value)}/></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Payment Method</label><select value={f.method} onChange={e=>set('method',e.target.value)}>{PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}</select></div>
          <div className="form-group"><label>Donor / Payer Name</label><input placeholder="optional" value={f.payer} onChange={e=>set('payer',e.target.value)}/></div>
        </div>
        <div className="form-group"><label>Description / Notes</label><textarea rows={2} value={f.description} onChange={e=>set('description',e.target.value)}/></div>
        <div style={{display:'flex',gap:'12px',marginTop:'8px'}}>
          <button className="btn-primary" style={{flex:1}} onClick={save}>💾 Save Income</button>
          <button className="btn-secondary" onClick={()=>setShow(false)}>Cancel</button>
        </div>
      </div></div>}
      <ConfirmModal isOpen={cfm.open} icon="🗃️" title={cfm.msg} confirmLabel={cfm.label} confirmColor={cfm.color} onConfirm={doCfm} onCancel={cancelCfm} />
    </div>
  );
}

function ExpenseManager({ expense, onAdd, onArchive }) {
  const [show, setShow] = useState(false);

  const [cfm, setCfm] = useState({ open:false, msg:'', label:'', color:'', action:null });
  const askConfirm = (msg, label, color, action) => setCfm({ open:true, msg, label, color, action });
  const doCfm = () => { cfm.action && cfm.action(); setCfm(s=>({...s,open:false})); };
  const cancelCfm = () => setCfm(s=>({...s,open:false}));
  const emptyF = { category: EXPENSE_CATEGORIES[0], customCategory:'', amount:'', date:'', method:'Cash', payer:'', refNumber:'', description:'' };
  const [f, setF] = useState(emptyF);
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const save = () => {
    if(!f.amount||!f.date){alert('Fill required fields.');return;}
    const finalCategory = f.category === 'Other (please specify)' ? (f.customCategory || 'Other') : f.category;
    onAdd({...f, category: finalCategory, amount:Number(f.amount)});
    setShow(false); setF(emptyF);
  };
  const sorted = [...expense].sort((a,b)=>new Date(b.date)-new Date(a.date));
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
        <h2>📉 Expense Records</h2>
        <button className="btn-primary" onClick={()=>setShow(true)}>+ Add Expense</button>
      </div>
      <div style={{overflowX:'auto'}}>
        <table><thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Method</th><th>Paid To</th><th>Description</th><th>Action</th></tr></thead>
        <tbody>{sorted.length===0
          ? <tr><td colSpan={7} style={{textAlign:'center',padding:'24px',color:'var(--text-light)'}}>No expense records.</td></tr>
          : sorted.map(t=><tr key={t.id}>
              <td>{t.date}</td><td>{t.category}</td>
              <td style={{color:'var(--danger)',fontWeight:'bold'}}>₱{t.amount.toLocaleString()}</td>
              <td>{t.method}</td><td>{t.payer}</td><td>{t.description}</td>
              <td><button className="btn-danger" style={{padding:'6px 10px',fontSize:'0.8rem'}} onClick={()=>askConfirm('Archive this transaction?','🗃️ Yes, Archive','var(--warning)',()=>onArchive(t.id))}>🗃️ Archive</button></td>
            </tr>)}
        </tbody></table>
      </div>
      {show && <div className="modal-overlay" onClick={()=>setShow(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h2>📉 Add Expense</h2>
        <div className="form-group"><label>Category</label>
          <select value={f.category} onChange={e=>set('category',e.target.value)}>
            {ALL_EXPENSE_CATS.map(c=><option key={c}>{c}</option>)}
          </select>
          {f.category==='Other (please specify)' && <input style={{marginTop:'8px'}} placeholder="Please specify category..." value={f.customCategory} onChange={e=>set('customCategory',e.target.value)} />}
        </div>
        <div className="form-row">
          <div className="form-group"><label>Amount (₱) *</label><input type="number" value={f.amount} onChange={e=>set('amount',e.target.value)}/></div>
          <div className="form-group"><label>Date *</label><input type="date" value={f.date} onChange={e=>set('date',e.target.value)}/></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Payment Method</label><select value={f.method} onChange={e=>set('method',e.target.value)}>{PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}</select></div>
          <div className="form-group"><label>Paid To</label><input value={f.payer} onChange={e=>set('payer',e.target.value)}/></div>
        </div>
        <div className="form-group"><label>Reference Number</label><input placeholder="optional" value={f.refNumber} onChange={e=>set('refNumber',e.target.value)}/></div>
        <div className="form-group"><label>Description / Notes</label><textarea rows={2} value={f.description} onChange={e=>set('description',e.target.value)}/></div>
        <div style={{display:'flex',gap:'12px',marginTop:'8px'}}>
          <button className="btn-primary" style={{flex:1}} onClick={save}>💾 Save Expense</button>
          <button className="btn-secondary" onClick={()=>setShow(false)}>Cancel</button>
        </div>
      </div></div>}
      <ConfirmModal isOpen={cfm.open} icon="🗃️" title={cfm.msg} confirmLabel={cfm.label} confirmColor={cfm.color} onConfirm={doCfm} onCancel={cancelCfm} />
    </div>
  );
}

function TransactionHistory({ transactions, onArchive, onDelete }) {
  const [cfm, setCfm] = useState({ open:false, msg:'', label:'', color:'', action:null });
  const askConfirm = (msg, label, color, action) => setCfm({ open:true, msg, label, color, action });
  const doCfm = () => { cfm.action && cfm.action(); setCfm(s=>({...s,open:false})); };
  const cancelCfm = () => setCfm(s=>({...s,open:false}));
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const filtered = filterType ? transactions.filter(t=>t.type===filterType) : transactions;
  const sorted = [...filtered].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const totalPages = Math.max(1, Math.ceil(sorted.length/PAGE_SIZE));
  const shown = sorted.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',flexWrap:'wrap',gap:'12px'}}>
        <h2>📋 Transaction History</h2>
        <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{maxWidth:'200px'}}>
          <option value="">All Transactions</option>
          <option value="income">Income Only</option>
          <option value="expense">Expenses Only</option>
        </select>
      </div>
      <div style={{overflowX:'auto'}}>
        <table><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Method</th><th>Description</th><th>Action</th></tr></thead>
        <tbody>{shown.length===0
          ? <tr><td colSpan={7} style={{textAlign:'center',padding:'24px',color:'var(--text-light)'}}>No transactions.</td></tr>
          : shown.map(t=><tr key={t.id}>
              <td>{t.date}</td>
              <td><span className={`badge ${t.type==='income'?'badge-active':'badge-inactive'}`}>{t.type==='income'?'Income':'Expense'}</span></td>
              <td>{t.category}</td>
              <td style={{color:t.type==='income'?'var(--success)':'var(--danger)',fontWeight:'bold'}}>₱{t.amount.toLocaleString()}</td>
              <td>{t.method}</td><td>{t.description}</td>
              <td><button className="btn-danger" style={{padding:'6px 10px',fontSize:'0.8rem'}} onClick={()=>askConfirm('Archive this record?','🗃️ Yes, Archive','var(--warning)',()=>onArchive(t.id))}>🗃️ Archive</button></td>
            </tr>)}
        </tbody></table>
      </div>
      {totalPages>1 && <div className="pagination">{Array.from({length:totalPages},(_,i)=><button key={i} className={page===i+1?'active':''} onClick={()=>setPage(i+1)}>{i+1}</button>)}</div>}
      <ConfirmModal isOpen={cfm.open} icon="🗃️" title={cfm.msg} confirmLabel={cfm.label} confirmColor={cfm.color} onConfirm={doCfm} onCancel={cancelCfm} />
    </div>
  );
}

function FinanceArchives({ transactions, onRestore, onDelete }) {
  const sorted = [...transactions].sort((a,b)=>new Date(b.date)-new Date(a.date));
  return (
    <div>
      <div style={{marginBottom:'16px'}}>
        <h2>🗃️ Finance Archives</h2>
        <p style={{color:'var(--text-light)',fontSize:'0.9rem',marginTop:'4px'}}>Archived records are kept here. You can restore or permanently delete them.</p>
      </div>
      {sorted.length === 0
        ? <div className="empty-state"><p>No archived transactions.</p></div>
        : <div style={{overflowX:'auto'}}>
            <table>
              <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Description</th><th>Actions</th></tr></thead>
              <tbody>{sorted.map(t=><tr key={t.id}>
                <td>{t.date}</td>
                <td><span className={`badge ${t.type==='income'?'badge-active':'badge-inactive'}`}>{t.type==='income'?'Income':'Expense'}</span></td>
                <td>{t.category}</td>
                <td style={{fontWeight:'bold',color:t.type==='income'?'var(--success)':'var(--danger)'}}>₱{t.amount.toLocaleString()}</td>
                <td>{t.description}</td>
                <td>
                  <div style={{display:'flex',gap:'6px'}}>
                    <button className="btn-success" style={{padding:'5px 10px',fontSize:'0.8rem'}} onClick={()=>onRestore(t.id)}>↩️ Restore</button>
                    <button className="btn-danger" style={{padding:'5px 10px',fontSize:'0.8rem'}} onClick={()=>askConfirm('Permanently delete this record?','🗑️ Yes, Delete','var(--danger)',()=>onDelete(t.id))}>🗑️ Delete</button>
                  </div>
                </td>
              </tr>)}</tbody>
            </table>
          </div>
      }
    </div>
  );
}
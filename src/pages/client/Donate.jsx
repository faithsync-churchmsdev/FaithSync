import './Donate.css';

export default function Donate() {
  return (
    <div className="donate-page">
      <div className="donate-header">
        <h1>💝 Support Our Parish</h1>
        <p>Your generous donations help maintain the church, support ministries, and serve the community.</p>
      </div>

      <div className="donate-grid">
        <div className="donate-card card">
          <div className="donate-icon">📱</div>
          <h2>GCash</h2>
          <div className="gcash-box">
            <div className="gcash-qr">
              <div className="qr-placeholder">
                <span>QR Code</span>
                <small>GCash QR</small>
              </div>
            </div>
            <div className="gcash-details">
              <p><strong>Account Name:</strong> Parish of Our Lady</p>
              <p><strong>GCash Number:</strong> 0917-XXX-XXXX</p>
            </div>
          </div>
        </div>

        <div className="donate-card card">
          <div className="donate-icon">🏦</div>
          <h2>Bank Transfer</h2>
          <div className="bank-details">
            <div className="bank-row"><span>Bank</span><strong>Land Bank of the Philippines</strong></div>
            <div className="bank-row"><span>Account Name</span><strong>Parish of Our Lady</strong></div>
            <div className="bank-row"><span>Account Number</span><strong>XXXX-XXXX-XXXX</strong></div>
            <div className="bank-row"><span>Branch</span><strong>Zamboanga City</strong></div>
          </div>
        </div>

        <div className="donate-card card">
          <div className="donate-icon">🙏</div>
          <h2>In-Person</h2>
          <p style={{color:'var(--text-mid)',lineHeight:'1.7'}}>You may personally donate at the parish office during office hours:</p>
          <div className="hours-box">
            <p>Monday – Friday</p>
            <strong>8:00 AM – 5:00 PM</strong>
            <p style={{marginTop:'12px'}}>Saturday</p>
            <strong>8:00 AM – 12:00 PM</strong>
          </div>
        </div>

        <div className="donate-card donate-note card">
          <div className="donate-icon">📋</div>
          <h2>How Your Donation Helps</h2>
          <ul className="donate-list">
            <li>⛪ Church maintenance and repairs</li>
            <li>🕯️ Liturgical supplies and decorations</li>
            <li>🎵 Ministry programs and activities</li>
            <li>📚 Catechism and youth formation</li>
            <li>🤝 Community outreach and charity</li>
            <li>💡 Utilities and operational costs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
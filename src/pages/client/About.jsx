import devPhoto from '../../assets/kimfaithsync.jpg';
import './About.css';

export default function About() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="about-cross">✝</div>
        <h1>About FaithSync</h1>
        <p>A digital church management system built to serve the Catholic community of Zamboanga City.</p>
      </div>

      <div className="about-container">

        {/* Developer Card — prominent at top */}
        <div className="about-dev-card">
          <div className="about-dev-photo-wrap">
            <img src={devPhoto} alt="Kim Philippe A. Nochefranca" className="about-dev-photo" />
          </div>
          <div className="about-dev-info">
            <div className="about-dev-tag">👨‍💻 Developer</div>
            <h2>Kim Philippe A. Nochefranca</h2>
            <p>23 years old · Graduating Student</p>
            <p><strong>Western Mindanao State University</strong></p>
            <p style={{color:'var(--text-light)',marginTop:'4px',fontSize:'0.9rem'}}>Zamboanga City, Philippines</p>
            <div style={{display:'flex',gap:'8px',marginTop:'12px',flexWrap:'wrap'}}>
              <span className="about-badge">🎓 Capstone Project 2024</span>
              <span className="about-badge">💻 React JS Developer</span>
            </div>
          </div>
        </div>

        <div className="about-grid">
          <div className="card about-card">
            <h2>📖 About the Project</h2>
            <p>FaithSync is a comprehensive Catholic Church Management System designed to digitize and streamline parish operations — from event scheduling and sacramental records to ministry management and parish finances.</p>
            <p style={{marginTop:'12px'}}>The system serves two types of users: <strong>parishioners (clients)</strong> who can view events, request services, and engage with the parish; and <strong>clerks</strong> who manage the backend operations of the church.</p>
            <p style={{marginTop:'12px'}}>Built for the parishes of <strong>Zamboanga City</strong>, particularly the Metropolitan Cathedral of the Immaculate Conception and the Archdiocesan Shrine of Our Lady of the Pillar (Fort Pilar).</p>
          </div>

          <div className="card about-card">
            <h2>⚙️ Built With</h2>
            <div className="tech-grid">
              <div className="tech-item"><span>⚛️</span><strong>React JS</strong><small>Frontend Framework</small></div>
              <div className="tech-item"><span>⚡</span><strong>Vite</strong><small>Build Tool</small></div>
              <div className="tech-item"><span>🌿</span><strong>Supabase</strong><small>Database & Auth</small></div>
              <div className="tech-item"><span>🚀</span><strong>Netlify</strong><small>Deployment</small></div>
            </div>
          </div>

          <div className="card about-card">
            <h2>✨ Key Features</h2>
            <ul className="feature-list">
              <li>📅 Interactive Parish Calendar with event legends</li>
              <li>📝 Event & Mass Request System</li>
              <li>📄 Record & Certificate Request</li>
              <li>⛪ Parish Directory (Ministry, Priests, Parishioners)</li>
              <li>📂 Sacramental Records (Baptism, Confirmation, etc.)</li>
              <li>💰 Parish Finance Management</li>
              <li>🗃️ Archive System with Restore & Delete</li>
              <li>📬 Request Management for Clerks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
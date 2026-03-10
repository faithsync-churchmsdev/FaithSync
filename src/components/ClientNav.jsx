import './ClientNav.css';

const LINKS = ['Home', 'Request Event/Mass', 'Request Records', 'Request Membership', 'Donate', 'About'];

export default function ClientNav({ page, setPage, onClerkLogin }) {
  return (
    <nav className="client-nav">
      <div className="client-nav-brand">
        <span className="nav-cross">✝</span>
        <span className="nav-title">FaithSync</span>
      </div>
      <div className="client-nav-links">
        {LINKS.map(link => (
          <button
            key={link}
            className={`nav-link ${page === link ? 'active' : ''}`}
            onClick={() => setPage(link)}
          >
            {link}
          </button>
        ))}
      </div>
      <button className="btn-clerk-login" onClick={onClerkLogin}>
        🔐 Clerk Login
      </button>
    </nav>
  );
}
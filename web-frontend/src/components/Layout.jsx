import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const USER_NAV = [
  { to: '/home', label: 'Home' },
  { to: '/practice', label: 'Practice' },
  { to: '/interview', label: 'AI Interview' },
  { to: '/result', label: 'Results' },
  { to: '/daily-challenge', label: 'Daily Challenge' }
];

const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/admin/insights', label: 'Insights', icon: '📈' },
  { to: '/admin/users', label: 'Users', icon: '👤' },
  { to: '/admin/questions', label: 'Questions', icon: '📝' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️' }
];

export function Brand({ to = '/home' }) {
  return (
    <Link to={to} className="brand">
      <span style={{ fontSize: 22 }}>🧠</span>
      <span>SmartPrep</span>
    </Link>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Brand />
        <nav>
          {USER_NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="right">
          <span className="muted" style={{ fontSize: 13 }}>
            Hi, {(user?.name || 'User').split(' ')[0]}
          </span>
          <button className="avatar-btn" onClick={() => nav('/profile')} title="Profile">
            👤
          </button>
          <button
            className="btn sm secondary"
            onClick={() => {
              logout();
              nav('/login');
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export function AppLayout({ children, narrow }) {
  return (
    <>
      <Navbar />
      <div className="page">
        <div className={'container' + (narrow ? ' narrow' : '')}>{children}</div>
      </div>
    </>
  );
}

export function AuthLayout({ heroTitle, heroSubtitle, children }) {
  return (
    <div className="auth-shell">
      <div className="auth-hero">
        <div className="brand" style={{ marginBottom: 32 }}>
          <span style={{ fontSize: 22 }}>🧠</span>
          <span>SmartPrep</span>
        </div>
        <h1>
          {heroTitle || (
            <>
              AI Interview Coach for <span>tech job seekers</span>.
            </>
          )}
        </h1>
        <p>
          {heroSubtitle ||
            'Practice with adaptive AI interviews, get real-time feedback on your technical answers, voice, and body language — and turn nervous answers into confident conversations.'}
        </p>
        <div className="row mt-xl" style={{ maxWidth: 460 }}>
          <div className="card alt tight">
            <div style={{ fontWeight: 800, color: 'var(--primary)' }}>700+</div>
            <div className="muted" style={{ fontSize: 12 }}>AI Questions</div>
          </div>
          <div className="card alt tight">
            <div style={{ fontWeight: 800, color: 'var(--primary)' }}>7</div>
            <div className="muted" style={{ fontSize: 12 }}>Tech Domains</div>
          </div>
          <div className="card alt tight">
            <div style={{ fontWeight: 800, color: 'var(--primary)' }}>Adaptive</div>
            <div className="muted" style={{ fontSize: 12 }}>Difficulty</div>
          </div>
        </div>
      </div>
      <div className="auth-card-wrap">
        <div className="auth-card">{children}</div>
      </div>
    </div>
  );
}

export function AdminLayout({ children }) {
  const { logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <Brand to="/admin" />
        {ADMIN_NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <span className="icon">{n.icon}</span>
            <span>{n.label}</span>
          </NavLink>
        ))}
        <div className="spacer" />
        <button
          className="btn sm secondary"
          onClick={() => {
            logout();
            nav('/login');
          }}
        >
          ↪ Logout
        </button>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}

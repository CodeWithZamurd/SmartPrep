import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Brand from '../components/Brand.jsx';
import { PhoneLayout } from '../components/Layout.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../api.js';

const TABS = [
  { key: 'progress', label: 'Your Progress', icon: '📊' },
  { key: 'interviews', label: 'AI Interviews', icon: '🤖' },
  { key: 'premium', label: 'Premium', icon: '⭐' }
];

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState('progress');
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    api.get('/profile/stats').then((r) => setStats(r.data.stats)).catch(() => {});
    api.get('/sessions').then((r) => setSessions(r.data.sessions || [])).catch(() => {});
  }, []);

  async function upgrade() {
    try {
      const { data } = await api.post('/profile/upgrade');
      setUser({ ...user, ...data.user });
      alert('Welcome to Premium!');
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    }
  }

  function handleLogout() {
    logout();
    nav('/login');
  }

  return (
    <PhoneLayout>
      <div className="between">
        <Brand />
        <div style={{ display: 'flex', gap: 16, fontSize: 18 }}>
          <span style={{ cursor: 'pointer' }} onClick={() => nav('/settings')}>⚙️</span>
          <span style={{ cursor: 'pointer' }} onClick={() => window.location.reload()}>↻</span>
          <span style={{ cursor: 'pointer' }} onClick={handleLogout}>↪</span>
        </div>
      </div>
      <h1 className="title">My Profile</h1>

      <div style={{ background: 'var(--primary)', borderRadius: 16, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: 28, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>
          👤
        </div>
        <div style={{ fontSize: 20, fontWeight: 900 }}>{user?.name || 'User'}</div>
      </div>

      <div className="tab-row" style={{ justifyContent: 'space-around' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: 'none',
              border: 'none',
              color: tab === t.key ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: tab === t.key ? 700 : 400,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: 11
            }}
          >
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'progress' && (
        <div className="card center">
          <div style={{ fontSize: 48 }}>📊</div>
          {stats?.totalSessions ? (
            <>
              <h3>{stats.totalSessions} interviews completed</h3>
              <p className="subtitle">Average accuracy: {stats.accuracy}%</p>
            </>
          ) : (
            <>
              <h3>No Progress Data Available</h3>
              <p className="subtitle">Start practicing your interviews to see your detailed progress here!</p>
            </>
          )}
        </div>
      )}

      {tab === 'interviews' && (
        <div className="card">
          {sessions.length === 0 ? (
            <div className="center">
              <div style={{ fontSize: 48 }}>🤖</div>
              <h3>No Mock Interviews Yet</h3>
              <p className="subtitle">Start your first AI-powered interview to practice and improve your skills!</p>
              <button className="btn mt-md" onClick={() => nav('/interview')}>
                ▶ Start your first Interview
              </button>
            </div>
          ) : (
            sessions.map((s) => (
              <div
                key={s._id}
                onClick={() => nav(`/feedback/${s._id}`)}
                style={{ padding: '10px 0', borderBottom: '1px solid var(--divider)', cursor: 'pointer' }}
              >
                <div style={{ fontWeight: 700 }}>
                  {(s.domain && s.domain.name) || s.domainSlug} · {s.difficulty}
                </div>
                <div className="muted" style={{ fontSize: 12 }}>
                  Score {s.overallScore ?? '—'}% · {new Date(s.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'premium' && (
        <div className="card center">
          <div style={{ fontSize: 48 }}>⭐</div>
          <span style={{ background: 'var(--orange)', color: '#fff', padding: '4px 12px', borderRadius: 12, fontWeight: 900 }}>
            🔥 75% OFF
          </span>
          <h3>Upgrade to Premium</h3>
          <h2 style={{ color: 'var(--primary)' }}>Rs.600</h2>
          <p className="subtitle">Unlock all features and remove ads</p>
          <p className="subtitle">📈 Unlimited AI Mock Interviews</p>
          <p className="subtitle">📚 All Practice Questions Unlocked</p>
          <p className="subtitle">🚫 Ad-free experience</p>
          {user?.isPremium ? (
            <p style={{ color: 'var(--green)' }}>You are Premium ⭐</p>
          ) : (
            <button className="btn mt-md" style={{ background: 'var(--star)', color: '#1a1a1a' }} onClick={upgrade}>
              ⭐ Upgrade Now
            </button>
          )}
        </div>
      )}
    </PhoneLayout>
  );
}

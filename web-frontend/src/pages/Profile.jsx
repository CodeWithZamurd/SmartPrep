import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../api.js';

const TABS = [
  { key: 'progress', label: '📊 Your Progress' },
  { key: 'interviews', label: '🤖 AI Interviews' },
  { key: 'premium', label: '⭐ Premium' }
];

export default function Profile() {
  const { user, setUser } = useAuth();
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

  return (
    <AppLayout>
      <div className="grid-2" style={{ gridTemplateColumns: '300px 1fr', alignItems: 'start' }}>
        <aside className="card">
          <div className="center">
            <div
              style={{
                width: 96, height: 96, borderRadius: '50%',
                background: 'var(--primary)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto', fontSize: 40, fontWeight: 900
              }}
            >
              {(user?.name || '?').slice(0, 1).toUpperCase()}
            </div>
            <h2 className="mt-md">{user?.name}</h2>
            <p className="muted" style={{ fontSize: 13 }}>{user?.email}</p>
            <span className={'badge mt-sm ' + (user?.isPremium ? 'blue' : 'yellow')}>
              {user?.isPremium ? '⭐ Premium' : 'Free plan'}
            </span>
          </div>

          <div className="divider" />

          <button className="btn block secondary" onClick={() => nav('/settings')}>⚙️ Settings</button>
          <button className="btn block ghost mt-sm" onClick={() => nav('/evaluation-rules')}>
            How is scoring calculated?
          </button>
        </aside>

        <section>
          <div className="tabs">
            {TABS.map((t) => (
              <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'progress' && (
            <>
              <div className="grid-3">
                <div className="metric">
                  <div className="icon">❓</div>
                  <div className="value">{stats?.totalQuestions || 0}</div>
                  <div className="label">Questions answered</div>
                </div>
                <div className="metric">
                  <div className="icon">🎓</div>
                  <div className="value">{stats?.totalSessions || 0}</div>
                  <div className="label">Sessions</div>
                </div>
                <div className="metric">
                  <div className="icon">📈</div>
                  <div className="value">{stats?.accuracy || 0}%</div>
                  <div className="label">Accuracy</div>
                </div>
              </div>
              {!stats?.totalSessions && (
                <div className="card mt-lg center">
                  <p className="subtitle">
                    Start practicing your interviews to see detailed progress here.
                  </p>
                  <button className="btn mt-md" onClick={() => nav('/interview')}>
                    Start your first interview
                  </button>
                </div>
              )}
            </>
          )}

          {tab === 'interviews' && (
            <div className="table-wrap">
              {sessions.length === 0 ? (
                <div className="center" style={{ padding: 40 }}>
                  <div style={{ fontSize: 56 }}>🤖</div>
                  <h3 className="mt-md">No mock interviews yet</h3>
                  <p className="subtitle mt-sm">Start your first AI-powered interview to practice and improve.</p>
                  <button className="btn mt-md" onClick={() => nav('/interview')}>
                    ▶ Start your first interview
                  </button>
                </div>
              ) : (
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Domain</th>
                      <th>Difficulty</th>
                      <th>Score</th>
                      <th>Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s._id}>
                        <td><strong>{(s.domain && s.domain.name) || s.domainSlug}</strong></td>
                        <td className="muted">{s.difficulty}</td>
                        <td>{s.overallScore != null ? `${s.overallScore}%` : '—'}</td>
                        <td className="muted">{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn sm secondary" onClick={() => nav(`/feedback/${s._id}`)}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'premium' && (
            <div className="card">
              <div className="grid-2" style={{ alignItems: 'center' }}>
                <div>
                  <span className="badge" style={{ background: 'var(--orange)', color: '#fff' }}>🔥 75% OFF</span>
                  <h2 className="mt-md">Upgrade to Premium</h2>
                  <h1 style={{ color: 'var(--primary)', fontSize: 40 }}>Rs. 600</h1>
                  <p className="subtitle">Unlock all features and remove ads</p>
                  <ul style={{ paddingLeft: 18, lineHeight: 1.8 }}>
                    <li>📈 Unlimited AI mock interviews</li>
                    <li>📚 All practice questions unlocked</li>
                    <li>🚫 Ad-free experience</li>
                    <li>🎯 Advanced analytics dashboard</li>
                  </ul>
                  {user?.isPremium ? (
                    <p style={{ color: 'var(--green)', fontWeight: 700 }}>You are Premium ⭐</p>
                  ) : (
                    <button className="btn lg mt-md" style={{ background: 'var(--star)', color: '#1a1a1a' }} onClick={upgrade}>
                      ⭐ Upgrade now
                    </button>
                  )}
                </div>
                <div className="center" style={{ fontSize: 160 }}>⭐</div>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}

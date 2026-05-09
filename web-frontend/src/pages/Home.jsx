import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../api.js';

export default function Home() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [stats, setStats] = useState({ totalQuestions: 0, totalSessions: 0, accuracy: 0 });
  const [challenge, setChallenge] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    api.get('/profile/stats').then((r) => setStats(r.data.stats)).catch(() => {});
    api.get('/challenge').then((r) => setChallenge(r.data)).catch(() => {});
    api.get('/sessions').then((r) => setSessions(r.data.sessions || [])).catch(() => {});
  }, []);

  const firstName = (user?.name || 'there').split(' ')[0];

  return (
    <AppLayout>
      <section className="hero">
        <div className="between" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28 }}>Welcome back, {firstName} 👋</h1>
            <p style={{ marginTop: 6, color: '#E0E8FF' }}>Are you ready to ace your AI interview?</p>
          </div>
          <button className="btn lg secondary" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }} onClick={() => nav('/interview')}>
            🎤 Start a mock interview
          </button>
        </div>
      </section>

      <div className="grid-4 mt-lg">
        <div className="metric">
          <div className="icon">❓</div>
          <div className="value">{stats.totalQuestions}</div>
          <div className="label">Questions answered</div>
        </div>
        <div className="metric">
          <div className="icon">🎓</div>
          <div className="value">{stats.totalSessions}</div>
          <div className="label">Interviews completed</div>
        </div>
        <div className="metric">
          <div className="icon">📈</div>
          <div className="value">{stats.accuracy}%</div>
          <div className="label">Average accuracy</div>
        </div>
        <div className="metric" style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }}>
          <div className="icon">⭐</div>
          <div className="value">{user?.isPremium ? 'Premium' : 'Free'}</div>
          <div className="label" style={{ color: '#E0E8FF' }}>Plan</div>
        </div>
      </div>

      <div className="grid-2 mt-lg" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="card">
          <div className="between">
            <h2>Daily AI Challenge</h2>
            <button className="btn sm" onClick={() => nav('/daily-challenge')}>View challenge</button>
          </div>
          <p className="subtitle mt-md" style={{ minHeight: 60 }}>
            {challenge?.question || "Loading today's challenge…"}
          </p>
        </div>

        <div className="card">
          <h2>Quick actions</h2>
          <div className="flex-col gap-sm mt-md">
            <button className="btn block" onClick={() => nav('/interview')}>🎤 New AI Interview</button>
            <button className="btn block secondary" onClick={() => nav('/practice')}>❓ Practice questions</button>
            <button className="btn block secondary" onClick={() => nav('/result')}>📋 View results</button>
            <button className="btn block ghost" onClick={() => nav('/evaluation-rules')}>How is scoring calculated?</button>
          </div>
        </div>
      </div>

      <div className="section mt-xl">
        <h2 className="section-title">Recent interviews</h2>
        {sessions.length === 0 ? (
          <div className="card center">
            <p className="subtitle">No interviews yet — start your first one above.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sessions.slice(0, 6).map((s) => (
                  <tr key={s._id}>
                    <td><strong>{(s.domain && s.domain.name) || s.domainSlug}</strong></td>
                    <td className="muted">{s.difficulty}</td>
                    <td>
                      <span className={'badge ' + (s.status === 'completed' ? 'green' : 'yellow')}>
                        {s.status}
                      </span>
                    </td>
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
          </div>
        )}
      </div>
    </AppLayout>
  );
}

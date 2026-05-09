import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Brand from '../components/Brand.jsx';
import { PhoneLayout } from '../components/Layout.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../api.js';

export default function Home() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [stats, setStats] = useState({ totalQuestions: 0, totalSessions: 0, accuracy: 0 });
  const [challenge, setChallenge] = useState(null);

  useEffect(() => {
    api.get('/profile/stats').then((r) => setStats(r.data.stats)).catch(() => {});
    api.get('/challenge').then((r) => setChallenge(r.data)).catch(() => {});
  }, []);

  const firstName = (user?.name || 'there').split(' ')[0];

  return (
    <PhoneLayout>
      <div className="between">
        <Brand />
        <button
          onClick={() => nav('/profile')}
          style={{ width: 36, height: 36, borderRadius: 18, background: 'var(--card)', color: '#fff', border: 'none' }}
        >
          👤
        </button>
      </div>

      <div className="center" style={{ fontSize: 56 }}>🧠</div>

      <div className="card card-alt" style={{ background: '#284FB1' }}>
        <h3 style={{ margin: 0 }}>Welcome back, {firstName}! 👋</h3>
        <p style={{ margin: '4px 0 0', color: '#E0E8FF' }}>Are you ready to ace your AI interview?</p>
      </div>

      <div className="card card-alt">
        <h4 style={{ margin: 0 }}>Daily AI Challenge</h4>
        <p className="subtitle" style={{ marginTop: 6 }}>{challenge?.question || 'Loading today\'s challenge…'}</p>
        <button className="btn mt-md" onClick={() => nav('/daily-challenge')}>
          View Challenge
        </button>
      </div>

      <h3 style={{ margin: '16px 0 8px' }}>Progress History</h3>
      <div className="row">
        <div className="metric">
          <div style={{ fontSize: 22 }}>❓</div>
          <div className="value">{stats.totalQuestions}</div>
          <div className="label">Questions</div>
        </div>
        <div className="metric">
          <div style={{ fontSize: 22 }}>🎓</div>
          <div className="value">{stats.totalSessions}</div>
          <div className="label">Sessions</div>
        </div>
        <div className="metric" style={{ background: 'var(--primary)' }}>
          <div style={{ fontSize: 22 }}>📈</div>
          <div className="value">{stats.accuracy}%</div>
          <div className="label" style={{ color: '#fff' }}>Accuracy</div>
        </div>
      </div>
    </PhoneLayout>
  );
}

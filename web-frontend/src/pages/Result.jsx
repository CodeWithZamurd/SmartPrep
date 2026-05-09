import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Brand from '../components/Brand.jsx';
import { PhoneLayout } from '../components/Layout.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import { api } from '../api.js';

export default function Result() {
  const nav = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [overall, setOverall] = useState(0);

  useEffect(() => {
    api.get('/sessions').then((r) => setSessions(r.data.sessions || []));
    api.get('/profile/stats').then((r) => setOverall(r.data.stats.accuracy || 0));
  }, []);

  return (
    <PhoneLayout>
      <Brand />
      <h1 className="title">Result</h1>
      <h3>Performance Overview</h3>
      <div className="center" style={{ margin: '16px 0' }}>
        <ProgressRing value={overall} label="Overall Performance" />
      </div>
      <h3>Interview History</h3>
      {sessions.length === 0 && <p className="muted center">No interviews yet — start one!</p>}
      {sessions
        .filter((s) => s.status === 'completed')
        .map((s) => (
          <div key={s._id} className="card card-alt between">
            <div>
              <div style={{ fontWeight: 700 }}>
                {(s.domain && s.domain.name) || s.domainSlug} - {new Date(s.createdAt).toLocaleDateString()}
              </div>
              <span className="score-pill">{s.overallScore || s.overallTechnical || 0}%</span>
            </div>
            <span className="link" onClick={() => nav(`/feedback/${s._id}`)}>View Details</span>
          </div>
        ))}
    </PhoneLayout>
  );
}

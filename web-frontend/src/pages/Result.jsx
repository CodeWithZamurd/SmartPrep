import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import { api } from '../api.js';

export default function Result() {
  const nav = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [overall, setOverall] = useState(0);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    api.get('/sessions').then((r) => setSessions(r.data.sessions || []));
    api.get('/profile/stats').then((r) => setOverall(r.data.stats.accuracy || 0));
  }, []);

  const completed = sessions.filter((s) => s.status === 'completed');

  async function downloadReport(sessionId) {
    setDownloadingId(sessionId);
    try {
      const res = await api.get(`/reports/session/${sessionId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const cd = res.headers?.['content-disposition'] || '';
      const match = cd.match(/filename="?([^"]+)"?/i);
      const filename = match?.[1] || `SmartPrep-Report-${sessionId}.pdf`;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      alert(e?.response?.data?.error || 'Could not download the report.');
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <AppLayout>
      <h1>Results</h1>
      <p className="subtitle mt-sm">A historical view of every completed interview.</p>

      <div className="grid-2 mt-lg" style={{ gridTemplateColumns: '320px 1fr', alignItems: 'start' }}>
        <div className="card center">
          <h3>Performance Overview</h3>
          <div className="mt-lg" style={{ display: 'flex', justifyContent: 'center' }}>
            <ProgressRing value={overall} label="Overall Performance" size={200} />
          </div>
          <p className="muted mt-md" style={{ fontSize: 13 }}>
            Across {completed.length} completed interview{completed.length === 1 ? '' : 's'}.
          </p>
        </div>

        <div>
          <h3>Interview history</h3>
          {completed.length === 0 ? (
            <div className="card center mt-md">
              <p className="subtitle">No completed interviews yet.</p>
              <button className="btn mt-md" onClick={() => nav('/interview')}>
                Start your first interview
              </button>
            </div>
          ) : (
            <div className="table-wrap mt-md">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th>Date</th>
                    <th>Score</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {completed.map((s) => (
                    <tr key={s._id}>
                      <td><strong>{(s.domain && s.domain.name) || s.domainSlug}</strong></td>
                      <td className="muted">{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td><span className="score-pill">{s.overallScore || s.overallTechnical || 0}%</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button className="btn sm secondary" onClick={() => nav(`/feedback/${s._id}`)}>
                            View details
                          </button>
                          <button
                            className="btn sm outline"
                            onClick={() => downloadReport(s._id)}
                            disabled={downloadingId === s._id}
                          >
                            {downloadingId === s._id ? 'Preparing…' : '📄 PDF'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

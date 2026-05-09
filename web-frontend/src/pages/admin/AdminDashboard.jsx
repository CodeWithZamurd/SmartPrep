import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/Layout.jsx';
import { api } from '../../api.js';

function Metric({ icon, value, label, sub, subColor = 'var(--green)' }) {
  return (
    <div className="metric">
      <div className="icon">{icon}</div>
      <div className="value">{value}</div>
      <div className="label">{label}</div>
      {sub && <div className="delta" style={{ color: subColor }}>{sub}</div>}
    </div>
  );
}

function Bars({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const palette = ['#FFC940', '#3FA9FF', '#4ADE80', '#FF7A45', '#A78BFA', '#22D3EE', '#FF5C5C'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', height: 220, gap: 12, padding: '8px 0' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>{d.value}</div>
          <div
            style={{
              height: `${(d.value / max) * 100}%`,
              background: palette[i % palette.length],
              borderRadius: 6,
              minHeight: 6
            }}
          />
          <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const nav = useNavigate();
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    api.get('/admin/insights').then((r) => setInsights(r.data.insights)).catch(() => {});
  }, []);

  const i = insights || {
    activeUsers: 0, avgScore: 0, completed: 0, completionRate: 0,
    newThisMonthPct: 0, weekly: [],
    skillAverages: { technical: 0, soft: 0, bodyLanguage: 0 }
  };

  return (
    <AdminLayout>
      <h1>Global Insights</h1>
      <p className="subtitle mt-sm">Platform-wide performance and activity at a glance.</p>

      <div className="grid-4 mt-lg">
        <Metric icon="👥" value={i.activeUsers} label="Active Users" sub={`+${i.newThisMonthPct || 0}% this month`} />
        <Metric icon="📊" value={`${i.avgScore}%`} label="Average Score" sub="across all sessions" />
        <Metric icon="🏆" value={i.completed} label="Completed Interviews" />
        <Metric icon="📈" value={`${i.completionRate}%`} label="Completion Rate" sub="vs target" />
      </div>

      <div className="grid-2 mt-xl" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="card">
          <div className="between">
            <h2>Growth Trends — last 7 days</h2>
            <button className="btn sm secondary" onClick={() => nav('/admin/insights')}>
              See skill breakdown →
            </button>
          </div>
          <div className="mt-md">
            {i.weekly.length === 0 ? (
              <p className="muted center" style={{ padding: 40 }}>No data yet</p>
            ) : (
              <Bars data={i.weekly} />
            )}
          </div>
        </div>

        <div className="card">
          <h2>Skill averages</h2>
          {[
            { label: 'Technical', value: i.skillAverages.technical },
            { label: 'Soft skills', value: i.skillAverages.soft },
            { label: 'Body language', value: i.skillAverages.bodyLanguage }
          ].map((s) => (
            <div key={s.label} className="mt-md">
              <div className="between">
                <span style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</span>
                <span style={{ color: 'var(--green)', fontWeight: 700 }}>{s.value}%</span>
              </div>
              <div className="progress-track mt-sm">
                <div className="progress-fill" style={{ width: `${s.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-3 mt-xl">
        <button className="card" style={{ textAlign: 'left', cursor: 'pointer', color: '#fff' }} onClick={() => nav('/admin/users')}>
          <h3>👤 Users</h3>
          <p className="subtitle mt-sm">Search, monitor activity, change status, delete accounts.</p>
        </button>
        <button className="card" style={{ textAlign: 'left', cursor: 'pointer', color: '#fff' }} onClick={() => nav('/admin/questions')}>
          <h3>📝 Questions</h3>
          <p className="subtitle mt-sm">Curate the question bank — add, edit, delete questions.</p>
        </button>
        <button className="card" style={{ textAlign: 'left', cursor: 'pointer', color: '#fff' }} onClick={() => nav('/admin/settings')}>
          <h3>⚙️ Settings</h3>
          <p className="subtitle mt-sm">Tune the AI behaviour, security, and backups.</p>
        </button>
      </div>
    </AdminLayout>
  );
}

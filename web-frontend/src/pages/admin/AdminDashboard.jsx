import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Brand from '../../components/Brand.jsx';
import { AdminLayout } from '../../components/Layout.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { api } from '../../api.js';

function Metric({ icon, value, label, sub, subColor = 'var(--green)' }) {
  return (
    <div className="card card-alt center">
      <div style={{ fontSize: 24 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 900 }}>{value}</div>
      <div className="muted" style={{ fontSize: 12 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: subColor, fontWeight: 700, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Bars({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const palette = ['#FFC940', '#3FA9FF', '#4ADE80', '#FF7A45', '#A78BFA', '#22D3EE', '#FF5C5C'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', height: 180, gap: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div
            style={{
              height: `${(d.value / max) * 100}%`,
              background: palette[i % palette.length],
              borderRadius: 4,
              minHeight: 4
            }}
          />
          <div className="muted" style={{ fontSize: 10, marginTop: 4 }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { logout } = useAuth();
  const nav = useNavigate();
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    api.get('/admin/insights').then((r) => setInsights(r.data.insights)).catch(() => {});
  }, []);

  const i = insights || { activeUsers: 0, avgScore: 0, completed: 0, completionRate: 0, newThisMonthPct: 0, weekly: [] };

  function handleLogout() {
    logout();
    nav('/login');
  }

  return (
    <AdminLayout>
      <div className="between">
        <Brand />
        <span className="link" onClick={handleLogout}>Logout ↪</span>
      </div>
      <h1 className="title">Global Insights</h1>

      <div className="row" style={{ flexWrap: 'wrap' }}>
        <Metric icon="👥" value={i.activeUsers} label="Active Users" sub={`+${i.newThisMonthPct || 0}% this month`} />
        <Metric icon="📊" value={`${i.avgScore}%`} label="Avg Score" sub="vs last week" />
        <Metric icon="🏆" value={i.completed} label="Completed Total Interviews" />
        <Metric icon="📈" value={`${i.completionRate}%`} label="Completion Rate" sub="improvement" />
      </div>

      <h2 className="link" style={{ marginTop: 16 }} onClick={() => nav('/admin/insights')}>
        Growth Trends ›
      </h2>
      <div className="card card-alt">
        {i.weekly.length === 0 ? (
          <p className="muted center">No data yet</p>
        ) : (
          <Bars data={i.weekly} />
        )}
      </div>
    </AdminLayout>
  );
}

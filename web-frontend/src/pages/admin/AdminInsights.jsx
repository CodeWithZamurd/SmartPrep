import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/Layout.jsx';
import { api } from '../../api.js';

function LineChart({ data }) {
  if (data.length === 0) return null;
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 800, h = 200, pad = 30;
  const xs = (i) => pad + (i * (w - 2 * pad)) / Math.max(1, data.length - 1);
  const ys = (v) => h - pad - (v / max) * (h - 2 * pad);
  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xs(i)} ${ys(d.value)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h + 24}`} style={{ width: '100%' }}>
      {[0, 0.25, 0.5, 0.75, 1].map((p) => (
        <line key={p} x1={pad} x2={w - pad} y1={ys(p * max)} y2={ys(p * max)} stroke="var(--divider)" strokeDasharray="3,4" />
      ))}
      <path d={path} stroke="var(--primary)" strokeWidth="3" fill="none" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={xs(i)} cy={ys(d.value)} r="5" fill="var(--primary)" />
          <text x={xs(i)} y={ys(d.value) - 12} textAnchor="middle" fontSize="11" fill="var(--text-secondary)">
            {d.value}
          </text>
          <text x={xs(i)} y={h + 18} textAnchor="middle" fontSize="11" fill="var(--text-secondary)">
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function AdminInsights() {
  const [insights, setInsights] = useState(null);
  useEffect(() => {
    api.get('/admin/insights').then((r) => setInsights(r.data.insights)).catch(() => {});
  }, []);

  const skills = insights?.skillAverages || { technical: 0, soft: 0, bodyLanguage: 0 };
  const weekly = insights?.weekly || [];

  return (
    <AdminLayout>
      <h1>Skill & Trend Analytics</h1>
      <p className="subtitle mt-sm">Performance breakdown by category and time.</p>

      <div className="card mt-lg">
        <h2>Global Skill Averages</h2>
        <p className="subtitle mt-sm">Performance by category across every completed interview.</p>
        {[
          { label: 'Technical Skills', value: skills.technical, color: 'var(--green)' },
          { label: 'Soft Skills', value: skills.soft, color: 'var(--primary)' },
          { label: 'Body Language', value: skills.bodyLanguage, color: 'var(--orange)' }
        ].map((s) => (
          <div key={s.label} className="mt-md">
            <div className="between">
              <strong>{s.label}</strong>
              <span style={{ color: s.color, fontWeight: 700 }}>{s.value}%</span>
            </div>
            <div className="progress-track mt-sm" style={{ height: 14 }}>
              <div className="progress-fill" style={{ width: `${s.value}%`, background: s.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-lg">
        <h2>Weekly Performance</h2>
        <p className="subtitle mt-sm">Average score across completed sessions for each of the last 7 days.</p>
        {weekly.length === 0 ? (
          <p className="muted center" style={{ padding: 40 }}>No data yet</p>
        ) : (
          <LineChart data={weekly} />
        )}
      </div>
    </AdminLayout>
  );
}

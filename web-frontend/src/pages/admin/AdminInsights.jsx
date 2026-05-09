import { useEffect, useState } from 'react';
import Brand from '../../components/Brand.jsx';
import { AdminLayout } from '../../components/Layout.jsx';
import { api } from '../../api.js';

function ProgressBar({ pct }) {
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

function LineChart({ data }) {
  if (data.length === 0) return null;
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 600, h = 140, pad = 20;
  const xs = (i) => pad + (i * (w - 2 * pad)) / Math.max(1, data.length - 1);
  const ys = (v) => h - pad - (v / max) * (h - 2 * pad);
  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xs(i)} ${ys(d.value)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h + 20}`} style={{ width: '100%' }}>
      <path d={path} stroke="var(--primary)" strokeWidth="3" fill="none" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={xs(i)} cy={ys(d.value)} r="4" fill="var(--primary)" />
          <text x={xs(i)} y={h + 15} textAnchor="middle" fontSize="10" fill="var(--text-secondary)">
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
      <Brand />
      <h1 className="title">Global Skill Averages</h1>
      <p className="subtitle">Performance By Category</p>

      <div className="card card-alt">
        <div className="between">
          <span style={{ fontWeight: 700 }}>Technical Skills</span>
          <span style={{ color: 'var(--green)', fontWeight: 900 }}>{skills.technical}%</span>
        </div>
        <ProgressBar pct={skills.technical} />

        <div className="between mt-md">
          <span style={{ fontWeight: 700 }}>Soft Skills</span>
          <span style={{ color: 'var(--green)', fontWeight: 900 }}>{skills.soft}%</span>
        </div>
        <ProgressBar pct={skills.soft} />

        <div className="between mt-md">
          <span style={{ fontWeight: 700 }}>Body Language</span>
          <span style={{ color: 'var(--green)', fontWeight: 900 }}>{skills.bodyLanguage}%</span>
        </div>
        <ProgressBar pct={skills.bodyLanguage} />
      </div>

      <h2 className="mt-lg">Weekly Performance</h2>
      <div className="card card-alt">
        {weekly.length === 0 ? <p className="muted center">No data yet</p> : <LineChart data={weekly} />}
      </div>
    </AdminLayout>
  );
}

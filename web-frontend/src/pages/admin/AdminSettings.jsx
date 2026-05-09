import { useEffect, useState } from 'react';
import Brand from '../../components/Brand.jsx';
import { AdminLayout } from '../../components/Layout.jsx';
import Slider from '../../components/Slider.jsx';
import { api } from '../../api.js';

function timeAgo(d) {
  if (!d) return 'never';
  const ms = Date.now() - new Date(d).getTime();
  const h = Math.floor(ms / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h} hours ago`;
  return `${Math.floor(h / 24)} days ago`;
}

function Toggle({ value, onChange }) {
  return (
    <label style={{ position: 'relative', width: 50, height: 28, display: 'inline-block' }}>
      <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} style={{ display: 'none' }} />
      <span style={{ position: 'absolute', inset: 0, background: value ? 'var(--danger)' : 'var(--card)', borderRadius: 999 }} />
      <span style={{ position: 'absolute', left: value ? 24 : 2, top: 2, width: 24, height: 24, borderRadius: 12, background: '#fff' }} />
    </label>
  );
}

export default function AdminSettings() {
  const [tab, setTab] = useState('ai');
  const [data, setData] = useState(null);

  async function load() {
    try {
      const { data } = await api.get('/admin/system');
      setData(data);
    } catch (e) {}
  }
  useEffect(() => { load(); }, []);

  async function update(patch) {
    try {
      await api.patch('/admin/system', patch);
      load();
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    }
  }

  async function backup() {
    try {
      await api.post('/admin/backup');
      alert('Backup complete.');
      load();
    } catch (e) {}
  }

  const ai = data?.ai || { feedbackStrictness: 70, technicalQuestionsLimit: 15, sessionTimeoutMinutes: 30 };
  const perf = data?.performance || { uptimePct: 0, latencyMs: 0, dbSizeGB: 0, apiCallsToday: 0 };
  const sec = data?.security || { lastBackupAt: null, twoFactorEnabled: false };

  return (
    <AdminLayout>
      <Brand />
      <h1 className="title">System Settings</h1>
      <p className="subtitle">Configure Platform behavior</p>

      <div className="tab-row">
        <button className={'chip' + (tab === 'ai' ? ' active' : '')} onClick={() => setTab('ai')}>🤖 AI Settings</button>
        <button className={'chip' + (tab === 'system' ? ' active' : '')} onClick={() => setTab('system')}>⚙️ System</button>
      </div>

      {tab === 'ai' && (
        <>
          <div className="card card-alt">
            <div className="between">
              <span style={{ fontWeight: 900 }}>AI Feedback Strictness</span>
              <span style={{ color: 'var(--primary)', fontWeight: 900 }}>{ai.feedbackStrictness}%</span>
            </div>
            <p className="muted" style={{ fontSize: 12 }}>How critical should AI be?</p>
            <Slider
              value={ai.feedbackStrictness}
              min={0}
              max={100}
              onChange={(v) => update({ feedbackStrictness: v })}
              suffix="%"
            />
            <div className="between">
              <span className="muted" style={{ fontSize: 11 }}>Lineant</span>
              <span style={{ color: 'var(--orange)', fontSize: 11 }}>Strict</span>
            </div>
          </div>

          <div className="card card-alt">
            <div className="between">
              <span style={{ fontWeight: 900 }}>Technical Questions Limit</span>
              <span style={{ color: 'var(--primary)', fontWeight: 900 }}>{ai.technicalQuestionsLimit}</span>
            </div>
            <p className="muted" style={{ fontSize: 12 }}>Max Questions per interview</p>
            <Slider value={ai.technicalQuestionsLimit} min={0} max={30} onChange={(v) => update({ technicalQuestionsLimit: v })} />
          </div>

          <div className="card card-alt">
            <div className="between">
              <span style={{ fontWeight: 900 }}>Session Timeout</span>
              <span style={{ color: 'var(--primary)', fontWeight: 900 }}>{ai.sessionTimeoutMinutes}</span>
            </div>
            <p className="muted" style={{ fontSize: 12 }}>Minutes before auto-logout</p>
            <Slider value={ai.sessionTimeoutMinutes} min={5} max={60} onChange={(v) => update({ sessionTimeoutMinutes: v })} suffix=" min" />
          </div>
        </>
      )}

      {tab === 'system' && (
        <>
          <h3>📊 Performance Metrics</h3>
          <div className="row">
            <div className="metric"><div style={{ color: 'var(--green)', fontSize: 22, fontWeight: 900 }}>{perf.uptimePct}%</div><div className="label">Uptime</div></div>
            <div className="metric"><div style={{ color: 'var(--primary)', fontSize: 22, fontWeight: 900 }}>{perf.latencyMs} ms</div><div className="label">Latency</div></div>
          </div>
          <div className="row">
            <div className="metric"><div style={{ color: 'var(--green)', fontSize: 22, fontWeight: 900 }}>{perf.dbSizeGB} GB</div><div className="label">DB Size</div></div>
            <div className="metric"><div style={{ color: 'var(--danger)', fontSize: 22, fontWeight: 900 }}>{perf.apiCallsToday >= 1000 ? `${Math.round(perf.apiCallsToday / 1000)}K` : perf.apiCallsToday}</div><div className="label">API Calls/Day</div></div>
          </div>

          <h3 className="mt-md">✅ Security & Backup</h3>
          <div className="card card-alt">
            <div className="between">
              <span style={{ fontWeight: 900 }}>Last Backup</span>
              <span className="muted">{timeAgo(sec.lastBackupAt)}</span>
            </div>
            <button className="btn outline mt-md" onClick={backup}>Run Manual Backup</button>
          </div>
          <div className="card card-alt between">
            <span style={{ fontWeight: 900 }}>Two Factor Authentication</span>
            <Toggle value={sec.twoFactorEnabled} onChange={(v) => update({ twoFactorEnabled: v })} />
          </div>
        </>
      )}
    </AdminLayout>
  );
}

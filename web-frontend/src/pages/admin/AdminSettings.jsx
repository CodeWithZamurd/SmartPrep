import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/Layout.jsx';
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
    <label className="toggle">
      <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
      <span className="slider" />
      <span className="knob" />
    </label>
  );
}

function SliderRow({ title, desc, value, min = 0, max = 100, suffix = '', onChange }) {
  return (
    <div className="card">
      <div className="between">
        <div>
          <h3>{title}</h3>
          <p className="subtitle mt-sm">{desc}</p>
        </div>
        <span style={{ color: 'var(--primary)', fontWeight: 900, fontSize: 26 }}>
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-md"
      />
      <div className="between">
        <span className="muted" style={{ fontSize: 12 }}>{min}{suffix}</span>
        <span className="muted" style={{ fontSize: 12 }}>{max}{suffix}</span>
      </div>
    </div>
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
      <h1>System Settings</h1>
      <p className="subtitle mt-sm">Configure platform behavior, AI tuning, and security.</p>

      <div className="tabs mt-lg">
        <button className={tab === 'ai' ? 'active' : ''} onClick={() => setTab('ai')}>🤖 AI Settings</button>
        <button className={tab === 'system' ? 'active' : ''} onClick={() => setTab('system')}>⚙️ System & Security</button>
      </div>

      {tab === 'ai' && (
        <div className="grid-3">
          <SliderRow
            title="Feedback Strictness"
            desc="How critical should the AI evaluator be?"
            value={ai.feedbackStrictness}
            min={0}
            max={100}
            suffix="%"
            onChange={(v) => update({ feedbackStrictness: v })}
          />
          <SliderRow
            title="Technical Questions Limit"
            desc="Maximum questions per interview."
            value={ai.technicalQuestionsLimit}
            min={1}
            max={30}
            onChange={(v) => update({ technicalQuestionsLimit: v })}
          />
          <SliderRow
            title="Session Timeout"
            desc="Minutes before auto-logout."
            value={ai.sessionTimeoutMinutes}
            min={5}
            max={60}
            suffix=" min"
            onChange={(v) => update({ sessionTimeoutMinutes: v })}
          />
        </div>
      )}

      {tab === 'system' && (
        <>
          <h2 className="section-title mt-md">📊 Performance metrics</h2>
          <div className="grid-4">
            <div className="metric"><div className="value" style={{ color: 'var(--green)' }}>{perf.uptimePct}%</div><div className="label">Uptime</div></div>
            <div className="metric"><div className="value" style={{ color: 'var(--primary)' }}>{perf.latencyMs} ms</div><div className="label">Latency</div></div>
            <div className="metric"><div className="value" style={{ color: 'var(--green)' }}>{perf.dbSizeGB} GB</div><div className="label">DB Size</div></div>
            <div className="metric"><div className="value" style={{ color: 'var(--orange)' }}>
              {perf.apiCallsToday >= 1000 ? `${Math.round(perf.apiCallsToday / 1000)}K` : perf.apiCallsToday}
            </div><div className="label">API Calls / day</div></div>
          </div>

          <h2 className="section-title mt-xl">✅ Security & backup</h2>
          <div className="grid-2">
            <div className="card">
              <div className="between">
                <h3>Last backup</h3>
                <span className="muted">{timeAgo(sec.lastBackupAt)}</span>
              </div>
              <p className="subtitle mt-sm">Run a manual backup of the database snapshot.</p>
              <button className="btn outline mt-md" onClick={backup}>Run manual backup</button>
            </div>
            <div className="card between">
              <div>
                <h3>Two-factor authentication</h3>
                <p className="subtitle mt-sm">Require 2FA for admin accounts.</p>
              </div>
              <Toggle value={sec.twoFactorEnabled} onChange={(v) => update({ twoFactorEnabled: v })} />
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

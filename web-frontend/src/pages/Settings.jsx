import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneLayout } from '../components/Layout.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../api.js';

function Toggle({ value, onChange }) {
  return (
    <label style={{ position: 'relative', width: 50, height: 28, display: 'inline-block' }}>
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        style={{ display: 'none' }}
      />
      <span
        style={{
          position: 'absolute',
          inset: 0,
          background: value ? 'var(--danger)' : 'var(--card)',
          borderRadius: 999,
          transition: '0.2s'
        }}
      />
      <span
        style={{
          position: 'absolute',
          left: value ? 24 : 2,
          top: 2,
          width: 24,
          height: 24,
          borderRadius: 12,
          background: '#fff',
          transition: '0.2s'
        }}
      />
    </label>
  );
}

export default function Settings() {
  const { user, setUser } = useAuth();
  const nav = useNavigate();
  const init = user?.settings || {};
  const [darkMode, setDark] = useState(init.darkMode ?? true);
  const [learning, setLearning] = useState(init.learningMode ?? false);
  const [notif, setNotif] = useState(init.notificationsEnabled ?? true);

  async function update(patch) {
    try {
      const { data } = await api.patch('/profile/settings', patch);
      setUser({ ...user, settings: data.settings });
    } catch (e) {}
  }

  function shareApp() {
    if (navigator.share) {
      navigator.share({ title: 'SmartPrep', text: 'Try SmartPrep — AI Interview Coach!' });
    } else {
      navigator.clipboard.writeText(window.location.origin);
      alert('Link copied!');
    }
  }

  return (
    <PhoneLayout>
      <div className="between">
        <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 28 }}>‹</button>
        <h1 style={{ flex: 1, marginLeft: 8 }}>Settings</h1>
      </div>

      <div className="between" style={{ padding: '12px 0', borderBottom: '1px solid var(--divider)' }}>
        <span style={{ marginRight: 12 }}>🎓</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>Learning Mode</div>
          <div className="muted" style={{ fontSize: 12 }}>Customize your learning experience</div>
        </div>
        <Toggle value={learning} onChange={(v) => { setLearning(v); update({ learningMode: v }); }} />
      </div>
      <div className="between" style={{ padding: '12px 0', borderBottom: '1px solid var(--divider)' }}>
        <span style={{ marginRight: 12 }}>🌙</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>Dark Mode</div>
          <div className="muted" style={{ fontSize: 12 }}>Switch between light and dark themes</div>
        </div>
        <Toggle value={darkMode} onChange={(v) => { setDark(v); update({ darkMode: v }); }} />
      </div>

      <h3 style={{ marginTop: 16 }}>🔔 Notification Settings</h3>
      <p className="muted">Manage your notification settings</p>
      <div className="between" style={{ padding: '12px 0', borderBottom: '1px solid var(--divider)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>Enable Notifications</div>
          <div className="muted" style={{ fontSize: 12 }}>Receive study reminders and daily challenges</div>
        </div>
        <Toggle value={notif} onChange={(v) => { setNotif(v); update({ notificationsEnabled: v }); }} />
      </div>

      <h3 style={{ marginTop: 16 }}>🔗 Share App</h3>
      <p className="muted">Help others prepare for tech interviews by sharing this app</p>
      <button className="btn mt-lg" onClick={shareApp}>🔗 Share App</button>
    </PhoneLayout>
  );
}

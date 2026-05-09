import { useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../api.js';

function Toggle({ value, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
      <span className="slider" />
      <span className="knob" />
    </label>
  );
}

function Row({ icon, title, desc, value, onChange }) {
  return (
    <div className="between" style={{ padding: '16px 0', borderBottom: '1px solid var(--divider)' }}>
      <div className="flex items-center gap-md">
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div>
          <div style={{ fontWeight: 700 }}>{title}</div>
          {desc && <div className="muted" style={{ fontSize: 13 }}>{desc}</div>}
        </div>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

export default function Settings() {
  const { user, setUser } = useAuth();
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
      navigator.share({ title: 'SmartPrep', text: 'Try SmartPrep — AI Interview Coach!', url: window.location.origin });
    } else {
      navigator.clipboard.writeText(window.location.origin);
      alert('Link copied to clipboard!');
    }
  }

  return (
    <AppLayout narrow>
      <h1>Settings</h1>
      <p className="subtitle mt-sm">Manage how SmartPrep works for you.</p>

      <div className="card mt-lg">
        <h3>Preferences</h3>
        <Row
          icon="🎓"
          title="Learning mode"
          desc="Show explanations after each question."
          value={learning}
          onChange={(v) => { setLearning(v); update({ learningMode: v }); }}
        />
        <Row
          icon="🌙"
          title="Dark mode"
          desc="Switch between light and dark themes."
          value={darkMode}
          onChange={(v) => { setDark(v); update({ darkMode: v }); }}
        />
      </div>

      <div className="card mt-lg">
        <h3>🔔 Notifications</h3>
        <p className="subtitle mt-sm">Manage your notification settings.</p>
        <Row
          icon=""
          title="Enable notifications"
          desc="Receive study reminders and daily challenges."
          value={notif}
          onChange={(v) => { setNotif(v); update({ notificationsEnabled: v }); }}
        />
      </div>

      <div className="card mt-lg">
        <h3>🔗 Share SmartPrep</h3>
        <p className="subtitle mt-sm">Help others prepare for tech interviews by sharing this app.</p>
        <button className="btn mt-md" onClick={shareApp}>🔗 Share app</button>
      </div>
    </AppLayout>
  );
}

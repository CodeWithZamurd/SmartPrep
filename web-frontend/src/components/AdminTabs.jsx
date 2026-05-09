import { useLocation, useNavigate } from 'react-router-dom';

const TABS = [
  { key: '/admin', label: 'Dashboard', icon: '🏠' },
  { key: '/admin/users', label: 'Users', icon: '👤' },
  { key: '/admin/questions', label: 'Questions', icon: '📝' },
  { key: '/admin/settings', label: 'Settings', icon: '⚙️' }
];

export default function AdminTabs() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  return (
    <div className="tab-bar admin">
      {TABS.map((t) => {
        const active = pathname === t.key || (t.key !== '/admin' && pathname.startsWith(t.key));
        return (
          <button
            key={t.key}
            className={'tab' + (active ? ' active' : '')}
            onClick={() => nav(t.key)}
          >
            <span className="icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

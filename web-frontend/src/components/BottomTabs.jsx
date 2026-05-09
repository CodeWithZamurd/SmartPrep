import { useLocation, useNavigate } from 'react-router-dom';

const TABS = [
  { key: '/home', label: 'Home', icon: '🏠' },
  { key: '/practice', label: 'Practice', icon: '❓' },
  { key: '/interview', label: 'AI Interview', icon: '🎤' },
  { key: '/result', label: 'Result', icon: '📋' }
];

export default function BottomTabs() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  return (
    <div className="tab-bar">
      {TABS.map((t) => {
        const active = pathname.startsWith(t.key);
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

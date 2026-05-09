import BottomTabs from './BottomTabs.jsx';
import AdminTabs from './AdminTabs.jsx';

export function PhoneLayout({ children, hideTabs }) {
  return (
    <div className="app-shell">
      <div className="phone">
        {children}
        {!hideTabs && <BottomTabs />}
      </div>
    </div>
  );
}

export function AdminLayout({ children, hideTabs }) {
  return (
    <div className="app-shell">
      <div className="admin-shell">
        {children}
        {!hideTabs && <AdminTabs />}
      </div>
    </div>
  );
}

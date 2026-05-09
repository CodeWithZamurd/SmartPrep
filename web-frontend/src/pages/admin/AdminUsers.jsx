import { useEffect, useState } from 'react';
import Brand from '../../components/Brand.jsx';
import { AdminLayout } from '../../components/Layout.jsx';
import { api } from '../../api.js';

function timeAgo(d) {
  if (!d) return '';
  const ms = Date.now() - new Date(d).getTime();
  const h = Math.floor(ms / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h} hours ago`;
  return `${Math.floor(h / 24)} days ago`;
}

const STATUS_COLOR = { active: 'var(--green)', needs_help: 'var(--yellow)', inactive: 'var(--red)' };

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({ active: 0, needs_help: 0, inactive: 0 });

  async function load() {
    try {
      const { data } = await api.get('/admin/users', { params: { search } });
      setUsers(data.users);
      setCounts(data.counts);
    } catch (e) {}
  }
  useEffect(() => { load(); }, []);

  async function changeStatus(u) {
    const next = u.status === 'active' ? 'needs_help' : u.status === 'needs_help' ? 'inactive' : 'active';
    if (!confirm(`Set ${u.name} to ${next}?`)) return;
    await api.patch(`/admin/users/${u.id}`, { status: next }).catch(() => {});
    load();
  }

  async function del(u) {
    if (!confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    await api.delete(`/admin/users/${u.id}`).catch(() => {});
    load();
  }

  return (
    <AdminLayout>
      <Brand />
      <h1 className="title">User Management</h1>
      <p className="subtitle">Monitor student performance</p>

      <div className="search-box">
        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <span style={{ cursor: 'pointer' }} onClick={load}>🔍</span>
      </div>

      <div className="row">
        <div className="metric"><div style={{ color: 'var(--green)', fontSize: 24, fontWeight: 900 }}>{counts.active}</div><div className="label">Active</div></div>
        <div className="metric"><div style={{ color: 'var(--yellow)', fontSize: 24, fontWeight: 900 }}>{counts.needs_help}</div><div className="label">Needs Help</div></div>
        <div className="metric"><div style={{ color: 'var(--red)', fontSize: 24, fontWeight: 900 }}>{counts.inactive}</div><div className="label">Inactive</div></div>
      </div>

      {users.map((u) => (
        <div key={u.id} className="card card-alt" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
            {(u.name || '?').slice(0, 1).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900 }}>{u.name}</div>
            <div className="muted" style={{ fontSize: 12 }}>{u.email}</div>
            <div className="muted" style={{ fontSize: 11 }}>{timeAgo(u.lastActiveAt)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div onClick={() => changeStatus(u)} style={{ color: STATUS_COLOR[u.status] || 'var(--text-secondary)', fontWeight: 900, fontSize: 12, cursor: 'pointer' }}>
              {u.status === 'needs_help' ? 'Needs Help' : u.status[0].toUpperCase() + u.status.slice(1)}
            </div>
            <div style={{ color: u.averageScore >= 75 ? 'var(--green)' : 'var(--yellow)', fontSize: 12, marginTop: 4 }}>
              📈 {u.averageScore}%
            </div>
            <span className="link" style={{ color: 'var(--danger)', fontSize: 11, cursor: 'pointer' }} onClick={() => del(u)}>Delete</span>
          </div>
        </div>
      ))}
    </AdminLayout>
  );
}

import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/Layout.jsx';
import { api } from '../../api.js';

function timeAgo(d) {
  if (!d) return '—';
  const ms = Date.now() - new Date(d).getTime();
  const h = Math.floor(ms / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const STATUS_BADGE = { active: 'green', needs_help: 'yellow', inactive: 'red' };

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({ active: 0, needs_help: 0, inactive: 0 });

  async function load() {
    try {
      const params = {};
      if (search) params.search = search;
      if (filter) params.status = filter;
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.users);
      setCounts(data.counts);
    } catch (e) {}
  }
  useEffect(() => { load(); }, [filter]);

  async function changeStatus(u, next) {
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
      <h1>User Management</h1>
      <p className="subtitle mt-sm">Monitor activity, change account status, and manage permissions.</p>

      <div className="grid-3 mt-lg">
        <div className="metric"><div className="value" style={{ color: 'var(--green)' }}>{counts.active}</div><div className="label">Active</div></div>
        <div className="metric"><div className="value" style={{ color: 'var(--yellow)' }}>{counts.needs_help}</div><div className="label">Needs help</div></div>
        <div className="metric"><div className="value" style={{ color: 'var(--red)' }}>{counts.inactive}</div><div className="label">Inactive</div></div>
      </div>

      <div className="card mt-lg">
        <div className="between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="search-box" style={{ flex: 1, minWidth: 240 }}>
            <input
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
            <span style={{ cursor: 'pointer' }} onClick={load}>🔍</span>
          </div>
          <div className="flex gap-sm">
            <button className={'chip' + (!filter ? ' active' : '')} onClick={() => setFilter('')}>All</button>
            <button className={'chip' + (filter === 'active' ? ' active' : '')} onClick={() => setFilter('active')}>Active</button>
            <button className={'chip' + (filter === 'needs_help' ? ' active' : '')} onClick={() => setFilter('needs_help')}>Needs help</button>
            <button className={'chip' + (filter === 'inactive' ? ' active' : '')} onClick={() => setFilter('inactive')}>Inactive</button>
          </div>
        </div>
      </div>

      <div className="table-wrap mt-md">
        <table className="tbl">
          <thead>
            <tr>
              <th>User</th>
              <th>Status</th>
              <th>Avg Score</th>
              <th>Sessions</th>
              <th>Last active</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={7} className="muted center" style={{ padding: 40 }}>No users found.</td></tr>
            )}
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-md">
                    <div
                      style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--primary)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: 14
                      }}
                    >
                      {(u.name || '?').slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{u.name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={'badge ' + (STATUS_BADGE[u.status] || 'blue')}>
                    {u.status === 'needs_help' ? 'Needs help' : u.status[0].toUpperCase() + u.status.slice(1)}
                  </span>
                </td>
                <td><strong>{u.averageScore}%</strong></td>
                <td>{u.sessions}</td>
                <td className="muted">{timeAgo(u.lastActiveAt)}</td>
                <td className="muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={{ textAlign: 'right' }}>
                  <select
                    className="select"
                    style={{ padding: '6px 28px 6px 10px', fontSize: 12, width: 'auto', display: 'inline-block', marginRight: 6 }}
                    value={u.status}
                    onChange={(e) => changeStatus(u, e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="needs_help">Needs help</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button className="btn sm danger" onClick={() => del(u)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/Layout.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(email.trim(), password);
      if (u.role !== 'admin') {
        setError('This account is not an admin.');
        logout();
        return;
      }
      nav('/admin');
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      heroTitle={
        <>
          Admin <span>console</span>
        </>
      }
      heroSubtitle="Manage users, curate the question bank, and tune the SmartPrep AI behaviour."
    >
      <h2>Sign in as Admin</h2>
      <p className="subtitle mt-sm">
        <Link to="/login" className="link-muted">← Not an admin? Standard login</Link>
      </p>
      {error && (
        <div className="card alt mt-md" style={{ borderColor: 'var(--danger)' }}>
          <p style={{ color: 'var(--danger)' }}>{error}</p>
        </div>
      )}
      <form onSubmit={submit}>
        <label className="label">Email</label>
        <input
          className="input"
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="label">Password</label>
        <div className="password-wrap">
          <input
            className="input"
            type={showPwd ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="button" className="toggle" onClick={() => setShowPwd((s) => !s)}>
            {showPwd ? '🙈' : '👁'}
          </button>
        </div>
        <button className="btn block lg mt-lg" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
}

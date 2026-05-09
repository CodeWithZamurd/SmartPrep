import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Brand from '../components/Brand.jsx';
import { PhoneLayout } from '../components/Layout.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

export default function AdminLogin() {
  const { login } = useAuth();
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
    <PhoneLayout hideTabs>
      <Brand />
      <h1 style={{ color: 'var(--primary)', fontSize: 40, margin: '12px 0' }}>
        Sign in as
        <br />
        Admin
      </h1>
      <p className="subtitle center">
        <Link to="/login" className="link-muted">Login here</Link>
      </p>
      <form onSubmit={submit}>
        <label className="label">EMAIL*</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label className="label">PASSWORD*</label>
        <div style={{ position: 'relative' }}>
          <input
            className="input"
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 'none', color: 'var(--text-secondary)' }}
          >
            {showPwd ? '🙈' : '👁'}
          </button>
        </div>
        <div style={{ textAlign: 'right', marginTop: 6, fontSize: 12 }}>
          <span className="muted">Forgot Password? </span>
          <span className="link">Click here</span>
        </div>
        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
        <button className="btn mt-lg" disabled={loading}>
          {loading ? 'Signing in…' : 'Login'}
        </button>
      </form>
    </PhoneLayout>
  );
}

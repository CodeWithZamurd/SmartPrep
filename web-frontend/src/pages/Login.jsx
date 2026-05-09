import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Brand from '../components/Brand.jsx';
import { PhoneLayout } from '../components/Layout.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Login() {
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
      nav(u.role === 'admin' ? '/admin' : '/home');
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PhoneLayout hideTabs>
      <Brand />
      <h1 style={{ color: 'var(--primary)', fontSize: 44, margin: '12px 0 4px' }}>
        Welcome
        <br />
        Back!
      </h1>
      <p className="subtitle center mt-md">Login to continue your journey!</p>
      <form onSubmit={submit}>
        <label className="label">EMAIL*</label>
        <input
          className="input"
          type="email"
          placeholder="abc@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="label">PASSWORD*</label>
        <div style={{ position: 'relative' }}>
          <input
            className="input"
            type={showPwd ? 'text' : 'password'}
            placeholder="••••••••"
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
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
      <p className="center mt-xl">
        <span className="muted">Don't have an account? </span>
        <Link to="/signup" className="link">SignUp</Link>
      </p>
      <p className="center mt-md">
        <Link to="/admin-login" className="link">Sign in as Admin</Link>
      </p>
    </PhoneLayout>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/Layout.jsx';
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
    <AuthLayout
      heroTitle={
        <>
          Welcome <span>back!</span>
        </>
      }
      heroSubtitle="Pick up right where you left off and keep climbing the leaderboard."
    >
      <h2>Sign in to your account</h2>
      <p className="subtitle mt-sm">Login to continue your journey.</p>
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
          placeholder="you@example.com"
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
        <div style={{ textAlign: 'right', marginTop: 8 }}>
          <Link to="/forgot-password" className="link" style={{ fontSize: 13 }}>Forgot password?</Link>
        </div>
        <button className="btn block lg mt-lg" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <div className="divider" />
      <p className="center" style={{ fontSize: 14 }}>
        <span className="muted">Don't have an account? </span>
        <Link to="/signup" className="link">Create one</Link>
      </p>
      <p className="center mt-sm" style={{ fontSize: 14 }}>
        <Link to="/admin-login" className="link-muted">Sign in as admin →</Link>
      </p>
    </AuthLayout>
  );
}

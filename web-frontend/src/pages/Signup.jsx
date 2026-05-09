import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/Layout.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
      nav('/home');
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
          Join <span>SmartPrep</span>
        </>
      }
      heroSubtitle="Create your account in seconds and start practicing real interview questions today."
    >
      <h2>Create your account</h2>
      <p className="subtitle mt-sm">It only takes a minute.</p>
      {error && (
        <div className="card alt mt-md" style={{ borderColor: 'var(--danger)' }}>
          <p style={{ color: 'var(--danger)' }}>{error}</p>
        </div>
      )}
      <form onSubmit={submit}>
        <label className="label">Full name</label>
        <input className="input" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required />
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
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="button" className="toggle" onClick={() => setShowPwd((s) => !s)}>
            {showPwd ? '🙈' : '👁'}
          </button>
        </div>
        <p className="muted" style={{ fontSize: 11, marginTop: 6 }}>
          Use at least 6 characters and include a special character.
        </p>
        <button className="btn block lg mt-lg" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
      <div className="divider" />
      <p className="center" style={{ fontSize: 14 }}>
        <span className="muted">Already have an account? </span>
        <Link to="/login" className="link">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

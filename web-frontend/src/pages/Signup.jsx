import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Brand from '../components/Brand.jsx';
import { PhoneLayout } from '../components/Layout.jsx';
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
    <PhoneLayout hideTabs>
      <Brand />
      <h1 className="title center">Join SmartPrep</h1>
      <p className="subtitle center">Create your account to begin</p>
      <form onSubmit={submit}>
        <label className="label">NAME*</label>
        <input className="input" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
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
        <p className="muted" style={{ fontSize: 11, marginTop: 6 }}>
          Must have atleast 6 characters
          <br />
          Must include special characters (!@#, etc)
        </p>
        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
        <button className="btn mt-lg" disabled={loading}>
          {loading ? 'Creating…' : 'SIGN UP HERE'}
        </button>
      </form>
      <p className="center muted mt-md">OR</p>
      <p className="center">
        <span className="muted">Already have an account? </span>
        <Link to="/login" className="link">Login</Link>
      </p>
    </PhoneLayout>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/Layout.jsx';
import { api } from '../api.js';

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/password/forgot', { email: email.trim() });
      setInfo(data?.message || 'If an account exists for that email, a code has been sent.');
      setTimeout(() => nav('/reset-password', { state: { email: email.trim() } }), 700);
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
          Forgot your <span>password?</span>
        </>
      }
      heroSubtitle="No problem — we'll email you a one-time code to set a new one."
    >
      <h2>Reset your password</h2>
      <p className="subtitle mt-sm">Enter the email you signed up with.</p>

      {error && (
        <div className="card alt mt-md" style={{ borderColor: 'var(--danger)' }}>
          <p style={{ color: 'var(--danger)' }}>{error}</p>
        </div>
      )}
      {info && (
        <div className="card alt mt-md" style={{ borderColor: 'var(--green)' }}>
          <p style={{ color: 'var(--green)' }}>{info}</p>
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
        <button className="btn block lg mt-lg" disabled={loading}>
          {loading ? 'Sending…' : 'Send reset code'}
        </button>
      </form>

      <div className="divider" />
      <p className="center" style={{ fontSize: 14 }}>
        <Link to="/login" className="link">← Back to sign in</Link>
      </p>
      <p className="center mt-sm" style={{ fontSize: 14 }}>
        <span className="muted">Already have a code? </span>
        <Link to="/reset-password" className="link">Enter it here</Link>
      </p>
    </AuthLayout>
  );
}

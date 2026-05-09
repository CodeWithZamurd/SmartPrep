import { Link, useNavigate } from 'react-router-dom';

export default function Splash() {
  const nav = useNavigate();
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background:
          'radial-gradient(ellipse at 30% 20%, rgba(63,169,255,0.18), transparent 60%),' +
          'radial-gradient(ellipse at 70% 80%, rgba(63,169,255,0.12), transparent 60%),' +
          'var(--bg)'
      }}
    >
      <header className="navbar" style={{ background: 'transparent', borderBottom: 'none' }}>
        <div className="navbar-inner">
          <Link to="/" className="brand">
            <span style={{ fontSize: 22 }}>🧠</span>
            <span>SmartPrep</span>
          </Link>
          <div style={{ flex: 1 }} />
          <div className="right">
            <Link to="/login" className="link-muted">Sign in</Link>
            <Link to="/signup" className="btn sm">Get started</Link>
          </div>
        </div>
      </header>

      <section style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'grid', gap: 48, gridTemplateColumns: '1fr', padding: '64px 32px' }}>
          <div className="grid-2" style={{ alignItems: 'center', gap: 64 }}>
            <div>
              <h1 style={{ fontSize: 56, lineHeight: 1.05 }}>
                <span style={{ color: 'var(--primary)' }}>SmartPrep</span>
                <br />
                AI Interview Coach
              </h1>
              <p className="subtitle mt-md" style={{ fontSize: 18, maxWidth: 520 }}>
                Turn nervous answers into confident conversations. Adaptive AI interviews with real-time
                feedback on your technical accuracy, voice, and body language.
              </p>
              <div className="btn-row mt-xl">
                <button className="btn lg" onClick={() => nav('/signup')}>Get started</button>
                <button className="btn lg secondary" onClick={() => nav('/login')}>I already have an account</button>
              </div>
            </div>
            <div className="center" style={{ fontSize: 200, lineHeight: 1 }}>🤖</div>
          </div>

          <div className="grid-3 mt-xl">
            <div className="card">
              <div style={{ fontSize: 28 }}>❓</div>
              <h3>700+ AI Questions</h3>
              <p className="subtitle mt-sm">Curated, adaptive questions across seven tech domains.</p>
            </div>
            <div className="card">
              <div style={{ fontSize: 28 }}>🎤</div>
              <h3>AI Mock Interviews</h3>
              <p className="subtitle mt-sm">Type or speak your answers, get instant evaluation and follow-up.</p>
            </div>
            <div className="card">
              <div style={{ fontSize: 28 }}>📈</div>
              <h3>Personalized Feedback</h3>
              <p className="subtitle mt-sm">Detailed scoring on technical depth, voice clarity, and body language.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

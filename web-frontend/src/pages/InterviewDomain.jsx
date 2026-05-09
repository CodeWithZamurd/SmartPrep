import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout.jsx';
import { api } from '../api.js';

const ICONS = {
  frontend: '💻',
  'data-science': '📊',
  devops: '⚙️',
  'cyber-security': '🛡',
  ai: '🧠',
  qa: '✅',
  web: '🌐'
};

export default function InterviewDomain() {
  const nav = useNavigate();
  const [domains, setDomains] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/domains').then((r) => setDomains(r.data.domains || []));
  }, []);

  return (
    <AppLayout>
      <div className="hero">
        <div className="between" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28 }}>🎤 AI Interview Simulator</h1>
            <p style={{ marginTop: 6, color: '#E0E8FF' }}>
              Practice with real interview questions and get instant AI-powered feedback.
            </p>
          </div>
        </div>
      </div>

      <h2 className="section-title mt-xl">Choose your tech domain</h2>
      <div className="grid-3">
        {domains.map((d) => (
          <button
            key={d._id}
            onClick={() => setSelected(d)}
            className="card"
            style={{
              textAlign: 'left',
              cursor: 'pointer',
              borderColor: selected?._id === d._id ? 'var(--primary)' : 'var(--divider)',
              background: selected?._id === d._id ? 'var(--card-alt)' : 'var(--card)',
              color: '#fff'
            }}
          >
            <div style={{ fontSize: 32 }}>{ICONS[d.slug] || '🧩'}</div>
            <h3 className="mt-sm">{d.name}</h3>
            <p className="subtitle mt-sm" style={{ fontSize: 13 }}>{d.description || ''}</p>
          </button>
        ))}
      </div>

      <div className="mt-xl center">
        <button
          className="btn lg"
          disabled={!selected}
          onClick={() => nav('/interview/setup', { state: { domain: selected } })}
        >
          Continue with {selected ? selected.name : 'a domain'} →
        </button>
      </div>
    </AppLayout>
  );
}

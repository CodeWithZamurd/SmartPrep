import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Brand from '../components/Brand.jsx';
import { PhoneLayout } from '../components/Layout.jsx';
import { api } from '../api.js';

export default function InterviewDomain() {
  const nav = useNavigate();
  const [domains, setDomains] = useState([]);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api.get('/domains').then((r) => setDomains(r.data.domains || []));
  }, []);

  return (
    <PhoneLayout>
      <Brand />
      <h1 className="title">AI Interview</h1>

      <div className="card" style={{ background: 'var(--primary)' }}>
        <h3 style={{ margin: 0 }}>🎤 AI Interview Simulator</h3>
        <p style={{ margin: '4px 0 0', color: '#fff' }}>
          Practice with real interview questions and get instant AI-powered feedback
        </p>
      </div>

      <label className="label">Select Tech Domain</label>
      <div
        onClick={() => setOpen(!open)}
        className="card"
        style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', margin: '6px 0' }}
      >
        <span style={{ color: selected ? '#fff' : 'var(--text-muted)' }}>
          {selected ? selected.name : 'Choose a domain...'}
        </span>
        <span>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className="card">
          {domains.map((d) => (
            <div
              key={d._id}
              onClick={() => { setSelected(d); setOpen(false); }}
              style={{ padding: '10px 0', cursor: 'pointer', borderBottom: '1px solid var(--divider)' }}
            >
              {d.name}
            </div>
          ))}
        </div>
      )}

      <button
        className="btn mt-lg"
        disabled={!selected}
        onClick={() => nav('/interview/setup', { state: { domain: selected } })}
      >
        Setup Preferences
      </button>
    </PhoneLayout>
  );
}

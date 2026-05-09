import { useEffect, useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { api } from '../api.js';

export default function DailyChallenge() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get('/challenge').then((r) => setData(r.data)).catch(() => {});
  }, []);
  return (
    <AppLayout narrow>
      <h1>Daily AI Challenge</h1>
      <p className="subtitle mt-sm">A fresh, real-world question every day. Try to answer before reading on.</p>

      <div className="card mt-lg">
        <h3 style={{ color: 'var(--primary)' }}>Question</h3>
        <p className="subtitle mt-sm">{data?.question || 'Loading…'}</p>
      </div>
      <div className="card mt-md">
        <h3 style={{ color: 'var(--primary)' }}>Model answer</h3>
        <p className="subtitle mt-sm">{data?.answer || ''}</p>
      </div>
      <div className="card mt-md">
        <h3 style={{ color: 'var(--primary)' }}>Detailed explanation</h3>
        <p className="subtitle mt-sm" style={{ whiteSpace: 'pre-wrap' }}>{data?.explanation || ''}</p>
      </div>
    </AppLayout>
  );
}

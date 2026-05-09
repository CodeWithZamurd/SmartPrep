import { useEffect, useState } from 'react';
import Brand from '../components/Brand.jsx';
import { PhoneLayout } from '../components/Layout.jsx';
import { api } from '../api.js';

export default function DailyChallenge() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get('/challenge').then((r) => setData(r.data)).catch(() => {});
  }, []);
  return (
    <PhoneLayout>
      <Brand />
      <h1 className="title center">Daily AI Challenge</h1>

      <div className="card card-alt">
        <h4 style={{ color: 'var(--primary)', margin: 0 }}>Question</h4>
        <p className="subtitle">{data?.question || 'Loading…'}</p>
      </div>
      <div className="card card-alt">
        <h4 style={{ color: 'var(--primary)', margin: 0 }}>Answer</h4>
        <p className="subtitle">{data?.answer || ''}</p>
      </div>
      <div className="card card-alt">
        <h4 style={{ color: 'var(--primary)', margin: 0 }}>Detailed Explanation</h4>
        <p className="subtitle" style={{ whiteSpace: 'pre-wrap' }}>{data?.explanation || ''}</p>
      </div>
    </PhoneLayout>
  );
}

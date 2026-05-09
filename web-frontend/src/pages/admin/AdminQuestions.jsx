import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Brand from '../../components/Brand.jsx';
import { AdminLayout } from '../../components/Layout.jsx';
import { api } from '../../api.js';

const DIFF_COLOR = { easy: 'var(--green)', medium: 'var(--yellow)', hard: 'var(--red)' };

export default function AdminQuestions() {
  const nav = useNavigate();
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('');
  const [domains, setDomains] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState({ total: 0, easy: 0, medium: 0, hard: 0 });

  useEffect(() => {
    api.get('/domains').then((r) => setDomains(r.data.domains || []));
  }, []);

  async function load() {
    const params = {};
    if (domain) params.domain = domain;
    if (search) params.search = search;
    try {
      const [q, s] = await Promise.all([
        api.get('/questions', { params }),
        api.get('/admin/questions/stats')
      ]);
      setQuestions(q.data.questions || []);
      setStats(s.data);
    } catch (e) {}
  }
  useEffect(() => { load(); }, [domain]);

  async function del(q) {
    if (!confirm('Delete this question?')) return;
    await api.delete(`/questions/${q._id}`).catch(() => {});
    load();
  }

  return (
    <AdminLayout>
      <div className="between">
        <div>
          <Brand />
          <h1 className="title" style={{ margin: 0 }}>Question Bank</h1>
          <p className="subtitle">Manage interview questions</p>
        </div>
        <button
          onClick={() => nav('/admin/questions/new')}
          style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--primary)', color: '#fff', fontSize: 24, fontWeight: 900, border: 'none' }}
        >
          +
        </button>
      </div>

      <div className="search-box">
        <input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <span style={{ cursor: 'pointer' }} onClick={load}>🔍</span>
      </div>

      <div className="tab-row">
        <button className={'chip' + (!domain ? ' active' : '')} onClick={() => setDomain('')}>All domains</button>
        {domains.map((d) => (
          <button key={d._id} className={'chip' + (domain === d.slug ? ' active' : '')} onClick={() => setDomain(d.slug)}>
            {d.name}
          </button>
        ))}
      </div>

      <div className="row">
        <div className="metric"><div className="value">{stats.total}+</div><div className="label">Total</div></div>
        <div className="metric"><div className="value">{stats.easy}</div><div className="label">Easy</div></div>
        <div className="metric"><div className="value">{stats.total >= 200 ? '200+' : stats.total}</div><div className="label">Technical</div></div>
      </div>

      {questions.map((q) => (
        <div key={q._id} className="card card-alt">
          <p style={{ margin: 0 }}>{q.questionText}</p>
          <div className="between mt-md">
            <span style={{ color: 'var(--primary)', fontSize: 12 }}>{q.category || (q.domain && q.domain.name) || ''}</span>
            <span style={{ color: DIFF_COLOR[q.difficultyLevel] || 'var(--primary)', fontSize: 12, fontWeight: 700 }}>
              {q.difficultyLevel}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <span className="link" onClick={() => nav('/admin/questions/edit', { state: { question: q } })}>📝 Edit</span>
            <span className="link" style={{ color: 'var(--danger)' }} onClick={() => del(q)}>🗑 Delete</span>
          </div>
        </div>
      ))}
    </AdminLayout>
  );
}

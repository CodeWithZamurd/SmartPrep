import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/Layout.jsx';
import { api } from '../../api.js';

const DIFF_BADGE = { easy: 'green', medium: 'yellow', hard: 'red' };

export default function AdminQuestions() {
  const nav = useNavigate();
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('');
  const [diff, setDiff] = useState('');
  const [domains, setDomains] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState({ total: 0, easy: 0, medium: 0, hard: 0 });

  useEffect(() => {
    api.get('/domains').then((r) => setDomains(r.data.domains || []));
  }, []);

  async function load() {
    const params = {};
    if (domain) params.domain = domain;
    if (diff) params.difficulty = diff;
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
  useEffect(() => { load(); }, [domain, diff]);

  async function del(q) {
    if (!confirm('Delete this question?')) return;
    await api.delete(`/questions/${q._id}`).catch(() => {});
    load();
  }

  return (
    <AdminLayout>
      <div className="between">
        <div>
          <h1>Question Bank</h1>
          <p className="subtitle mt-sm">Add, edit, and curate every question across all domains.</p>
        </div>
        <button className="btn" onClick={() => nav('/admin/questions/new')}>+ Add question</button>
      </div>

      <div className="grid-4 mt-lg">
        <div className="metric"><div className="value">{stats.total}</div><div className="label">Total</div></div>
        <div className="metric"><div className="value" style={{ color: 'var(--green)' }}>{stats.easy}</div><div className="label">Easy</div></div>
        <div className="metric"><div className="value" style={{ color: 'var(--yellow)' }}>{stats.medium}</div><div className="label">Medium</div></div>
        <div className="metric"><div className="value" style={{ color: 'var(--red)' }}>{stats.hard}</div><div className="label">Hard</div></div>
      </div>

      <div className="card mt-lg">
        <div className="between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="search-box" style={{ flex: 1, minWidth: 240 }}>
            <input
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
            <span style={{ cursor: 'pointer' }} onClick={load}>🔍</span>
          </div>
        </div>
        <div className="flex gap-sm mt-md" style={{ flexWrap: 'wrap' }}>
          <button className={'chip' + (!domain ? ' active' : '')} onClick={() => setDomain('')}>All domains</button>
          {domains.map((d) => (
            <button key={d._id} className={'chip' + (domain === d.slug ? ' active' : '')} onClick={() => setDomain(d.slug)}>
              {d.name}
            </button>
          ))}
        </div>
        <div className="flex gap-sm mt-sm" style={{ flexWrap: 'wrap' }}>
          <button className={'chip' + (!diff ? ' active' : '')} onClick={() => setDiff('')}>All difficulties</button>
          {['easy', 'medium', 'hard'].map((d) => (
            <button key={d} className={'chip' + (diff === d ? ' active' : '')} onClick={() => setDiff(d)}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap mt-md">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Question</th>
              <th>Domain</th>
              <th>Difficulty</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {questions.length === 0 && (
              <tr><td colSpan={5} className="muted center" style={{ padding: 40 }}>No questions found.</td></tr>
            )}
            {questions.map((q) => (
              <tr key={q._id}>
                <td>{q.questionText}</td>
                <td className="muted">{q.domain?.name || '—'}</td>
                <td>
                  <span className={'badge ' + (DIFF_BADGE[q.difficultyLevel] || 'blue')}>
                    {q.difficultyLevel}
                  </span>
                </td>
                <td>
                  <span className={'badge ' + (q.status === 'approved' ? 'green' : q.status === 'rejected' ? 'red' : 'yellow')}>
                    {q.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button className="btn sm secondary" onClick={() => nav('/admin/questions/edit', { state: { question: q } })}>
                    Edit
                  </button>
                  <button className="btn sm danger" style={{ marginLeft: 6 }} onClick={() => del(q)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

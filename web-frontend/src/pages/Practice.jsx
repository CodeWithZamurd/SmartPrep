import { useEffect, useState } from 'react';
import Brand from '../components/Brand.jsx';
import { PhoneLayout } from '../components/Layout.jsx';
import { api } from '../api.js';

const DIFFS = [
  { key: 'all', label: 'All' },
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' }
];

export default function Practice() {
  const [tab, setTab] = useState('all');
  const [domains, setDomains] = useState([]);
  const [domain, setDomain] = useState('');
  const [diff, setDiff] = useState('all');
  const [search, setSearch] = useState('');
  const [questions, setQuestions] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkIds, setBookmarkIds] = useState(new Set());
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/domains').then((r) => setDomains(r.data.domains || []));
  }, []);

  async function load() {
    const params = {};
    if (domain) params.domain = domain;
    if (diff !== 'all') params.difficulty = diff;
    if (search) params.search = search;
    try {
      const [q, b] = await Promise.all([
        api.get('/questions', { params }),
        api.get('/questions/bookmarked')
      ]);
      setQuestions(q.data.questions || []);
      setBookmarks(b.data.questions || []);
      setBookmarkIds(new Set((b.data.questions || []).map((x) => x._id)));
    } catch (e) {}
  }
  useEffect(() => { load(); }, [domain, diff]);

  async function toggleBookmark(id) {
    const { data } = await api.post(`/questions/${id}/bookmark`);
    setBookmarkIds((s) => {
      const n = new Set(s);
      data.bookmarked ? n.add(id) : n.delete(id);
      return n;
    });
    load();
  }

  const list = tab === 'all' ? questions : bookmarks;

  return (
    <PhoneLayout>
      <Brand />
      <h1 className="title">Practice Questions</h1>

      <div className="search-box">
        <input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <span style={{ cursor: 'pointer' }} onClick={load}>🔍</span>
      </div>

      <div className="tab-row" style={{ justifyContent: 'space-around' }}>
        <button
          onClick={() => setTab('all')}
          style={{ background: 'none', border: 'none', color: tab === 'all' ? 'var(--star)' : 'var(--text-secondary)', fontWeight: tab === 'all' ? 900 : 400 }}
        >
          ❓ All Questions
        </button>
        <button
          onClick={() => setTab('bookmarked')}
          style={{ background: 'none', border: 'none', color: tab === 'bookmarked' ? 'var(--star)' : 'var(--text-secondary)', fontWeight: tab === 'bookmarked' ? 900 : 400 }}
        >
          🔖 Bookmarked
        </button>
      </div>

      {tab === 'all' && (
        <div className="card">
          <h4 style={{ margin: 0 }}>Filters</h4>
          <p className="muted" style={{ fontSize: 12 }}>Category</p>
          <div className="tab-row">
            <button className={'chip' + (!domain ? ' active' : '')} onClick={() => setDomain('')}>All</button>
            {domains.map((d) => (
              <button
                key={d._id}
                className={'chip' + (domain === d.slug ? ' active' : '')}
                onClick={() => setDomain(d.slug)}
              >
                {d.name}
              </button>
            ))}
          </div>
          <p className="muted" style={{ fontSize: 12 }}>Difficulty</p>
          <div className="tab-row">
            {DIFFS.map((d) => (
              <button
                key={d.key}
                className={'chip' + (diff === d.key ? ' active' : '')}
                onClick={() => setDiff(d.key)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-md">{tab === 'all' ? `${list.length} Questions found` : list.length === 0 ? '' : `${list.length} bookmarked`}</p>
      {tab === 'bookmarked' && list.length === 0 && (
        <div className="card center">
          <div style={{ fontSize: 32 }}>🔖</div>
          <h4>No bookmarked questions</h4>
          <p className="muted">Bookmark questions you want to review later</p>
          <button className="btn" onClick={load}>↻ Refresh</button>
        </div>
      )}

      {list.map((q) => (
        <div key={q._id} className="card" style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === q._id ? null : q._id)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ flex: 1 }}>{q.questionText}</span>
            <span
              style={{ color: bookmarkIds.has(q._id) ? 'var(--star)' : 'var(--text-muted)', cursor: 'pointer' }}
              onClick={(e) => { e.stopPropagation(); toggleBookmark(q._id); }}
            >
              🔖
            </span>
            <span className="muted">{expanded === q._id ? '▲' : '▼'}</span>
          </div>
          {expanded === q._id && (
            <div className="mt-md">
              <h4 style={{ color: 'var(--primary)', margin: 0 }}>Answer</h4>
              <p className="subtitle">{q.answerText || 'No answer provided.'}</p>
              {q.explanation && (
                <>
                  <h4 style={{ color: 'var(--primary)', margin: 0 }}>Explanation</h4>
                  <p className="subtitle">{q.explanation}</p>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </PhoneLayout>
  );
}

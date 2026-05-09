import { useEffect, useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { api } from '../api.js';

const DIFFS = [
  { key: 'all', label: 'All' },
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' }
];

const DIFF_COLOR = { easy: 'green', medium: 'yellow', hard: 'red' };

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
    <AppLayout>
      <div className="between">
        <div>
          <h1>Practice Questions</h1>
          <p className="subtitle mt-sm">Search, filter, and bookmark questions across every tech domain.</p>
        </div>
      </div>

      <div className="grid-2 mt-lg" style={{ gridTemplateColumns: '280px 1fr', alignItems: 'start' }}>
        <aside className="card">
          <h3>Filters</h3>
          <label className="label">Search</label>
          <div className="search-box">
            <input
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
            <span style={{ cursor: 'pointer' }} onClick={load}>🔍</span>
          </div>

          <label className="label">Domain</label>
          <div className="flex-col gap-sm">
            <button className={'chip' + (!domain ? ' active' : '')} onClick={() => setDomain('')}>All domains</button>
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

          <label className="label">Difficulty</label>
          <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
            {DIFFS.map((d) => (
              <button key={d.key} className={'chip' + (diff === d.key ? ' active' : '')} onClick={() => setDiff(d.key)}>
                {d.label}
              </button>
            ))}
          </div>
        </aside>

        <section>
          <div className="tabs">
            <button className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>
              ❓ All Questions
            </button>
            <button className={tab === 'bookmarked' ? 'active' : ''} onClick={() => setTab('bookmarked')}>
              🔖 Bookmarked
            </button>
          </div>

          <p className="muted mt-sm">
            {tab === 'all' ? `${list.length} questions found` : `${list.length} bookmarked`}
          </p>

          {tab === 'bookmarked' && list.length === 0 && (
            <div className="card center mt-md">
              <div style={{ fontSize: 36 }}>🔖</div>
              <h3 className="mt-md">No bookmarked questions yet</h3>
              <p className="subtitle mt-sm">Bookmark questions you want to review later.</p>
            </div>
          )}

          <div className="flex-col gap-md mt-md">
            {list.map((q) => (
              <div key={q._id} className="card">
                <div className="between" style={{ alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, paddingRight: 16 }}>
                    <p style={{ fontWeight: 600 }}>{q.questionText}</p>
                    <div className="flex gap-sm mt-sm">
                      {q.domain?.name && <span className="badge blue">{q.domain.name}</span>}
                      {q.difficultyLevel && (
                        <span className={'badge ' + DIFF_COLOR[q.difficultyLevel]}>
                          {q.difficultyLevel}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-sm">
                    <button
                      className="btn sm secondary"
                      style={{ color: bookmarkIds.has(q._id) ? 'var(--star)' : undefined }}
                      onClick={() => toggleBookmark(q._id)}
                    >
                      🔖 {bookmarkIds.has(q._id) ? 'Saved' : 'Save'}
                    </button>
                    <button
                      className="btn sm secondary"
                      onClick={() => setExpanded(expanded === q._id ? null : q._id)}
                    >
                      {expanded === q._id ? 'Hide' : 'Show'} answer
                    </button>
                  </div>
                </div>
                {expanded === q._id && (
                  <div className="mt-md">
                    <div className="divider" />
                    <h4 style={{ color: 'var(--primary)' }}>Answer</h4>
                    <p className="subtitle mt-sm">{q.answerText || 'No answer provided.'}</p>
                    {q.explanation && (
                      <>
                        <h4 style={{ color: 'var(--primary)' }} className="mt-md">Explanation</h4>
                        <p className="subtitle mt-sm">{q.explanation}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

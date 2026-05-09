import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/Layout.jsx';
import { api } from '../../api.js';

export default function AdminAddQuestion() {
  const nav = useNavigate();
  const { state } = useLocation();
  const editing = state?.question;
  const [questionText, setQuestionText] = useState(editing?.questionText || '');
  const [answerText, setAnswerText] = useState(editing?.answerText || '');
  const [explanation, setExplanation] = useState(editing?.explanation || '');
  const [domains, setDomains] = useState([]);
  const [domainId, setDomainId] = useState(editing?.domain?._id || editing?.domain || '');
  const [diff, setDiff] = useState(editing?.difficultyLevel || 'easy');
  const [status, setStatus] = useState(editing?.status || 'approved');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/domains').then((r) => {
      setDomains(r.data.domains || []);
      if (!domainId && r.data.domains?.[0]) setDomainId(r.data.domains[0]._id);
    });
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (!questionText || !domainId) return alert('Question text and domain are required.');
    setLoading(true);
    try {
      const payload = { questionText, answerText, explanation, domain: domainId, difficultyLevel: diff, status };
      if (editing) {
        await api.patch(`/questions/${editing._id}`, payload);
      } else {
        await api.post('/questions', payload);
      }
      nav('/admin/questions');
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <p className="link-muted" onClick={() => nav('/admin/questions')}>← Back to question bank</p>
      <h1 className="mt-sm">{editing ? 'Edit Question' : 'Add New Question'}</h1>
      <p className="subtitle mt-sm">Fill in the question details below.</p>

      <form onSubmit={submit} className="mt-lg">
        <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>
          <div className="card">
            <h3>Content</h3>
            <label className="label">Question text *</label>
            <textarea
              className="textarea"
              placeholder="Enter your question here..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
            />

            <label className="label">Model answer (optional)</label>
            <textarea className="textarea" value={answerText} onChange={(e) => setAnswerText(e.target.value)} />

            <label className="label">Detailed explanation (optional)</label>
            <textarea className="textarea" value={explanation} onChange={(e) => setExplanation(e.target.value)} />
          </div>

          <div className="card">
            <h3>Metadata</h3>
            <label className="label">Domain *</label>
            <select className="select" value={domainId} onChange={(e) => setDomainId(e.target.value)}>
              {domains.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>

            <label className="label">Difficulty</label>
            <div className="flex gap-sm">
              {['easy', 'medium', 'hard'].map((d) => (
                <button type="button" key={d} className={'chip' + (diff === d ? ' active' : '')} onClick={() => setDiff(d)}>
                  {d}
                </button>
              ))}
            </div>

            <label className="label">Status</label>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="approved">Approved</option>
              <option value="pending">Pending review</option>
              <option value="rejected">Rejected</option>
            </select>

            <div className="divider" />
            <button type="submit" className="btn block" disabled={loading}>
              {loading ? 'Saving…' : editing ? 'Save changes' : 'Add question'}
            </button>
            <button type="button" className="btn block secondary mt-sm" onClick={() => nav('/admin/questions')}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}

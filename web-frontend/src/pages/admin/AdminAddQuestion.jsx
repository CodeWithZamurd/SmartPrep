import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Brand from '../../components/Brand.jsx';
import { AdminLayout } from '../../components/Layout.jsx';
import { api } from '../../api.js';

const DIFFS = ['easy', 'medium', 'hard'];

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
      const payload = { questionText, answerText, explanation, domain: domainId, difficultyLevel: diff };
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
    <AdminLayout hideTabs>
      <Brand />
      <h1 className="title">{editing ? 'Edit Question' : 'Add New Question'}</h1>
      <p className="subtitle">Fill in the question details</p>

      <form onSubmit={submit}>
        <label className="label">Question Text</label>
        <textarea
          className="textarea"
          placeholder="Enter your question here..."
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          required
        />

        <label className="label">Answer (optional)</label>
        <textarea className="textarea" value={answerText} onChange={(e) => setAnswerText(e.target.value)} />

        <label className="label">Explanation (optional)</label>
        <textarea className="textarea" value={explanation} onChange={(e) => setExplanation(e.target.value)} />

        <label className="label center" style={{ textAlign: 'center' }}>Domain</label>
        <select className="select" value={domainId} onChange={(e) => setDomainId(e.target.value)}>
          {domains.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>

        <label className="label center" style={{ textAlign: 'center' }}>Type</label>
        <select className="select" value={diff} onChange={(e) => setDiff(e.target.value)}>
          {DIFFS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <div className="btn-row mt-xl">
          <button type="button" className="btn" onClick={() => nav(-1)}>Cancel</button>
          <button type="submit" className="btn secondary" disabled={loading}>
            {loading ? 'Saving…' : editing ? 'Save' : 'Add Question'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

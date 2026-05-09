import { useNavigate } from 'react-router-dom';
import Brand from '../components/Brand.jsx';
import { PhoneLayout } from '../components/Layout.jsx';

function Section({ title, items }) {
  return (
    <div className="mt-md">
      <h3 style={{ color: 'var(--primary)', margin: 0 }}>{title}</h3>
      <ul style={{ paddingLeft: 18, color: 'var(--text-secondary)' }}>
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

export default function EvaluationRules() {
  const nav = useNavigate();
  return (
    <PhoneLayout hideTabs>
      <Brand />
      <h1 className="title center">Evaluation Rules</h1>
      <h4>Score Distribution</h4>
      <p style={{ color: 'var(--green)' }}>Technical Skills: 60%</p>
      <p style={{ color: 'var(--yellow)' }}>Voice Analysis: 20%</p>
      <p style={{ color: 'var(--orange)' }}>Body Language Analysis: 20%</p>
      <p className="muted" style={{ fontStyle: 'italic', fontSize: 12 }}>
        If video is off, body language score is automatically added to technical and voice analysis.
      </p>
      <Section title="Technical Evaluation" items={['Answers checked for correctness and logic', 'Harder questions carry higher marks', 'Score adjusts based on question difficulty']} />
      <Section title="Adaptive Questions" items={['Good performance → harder questions', 'Weak performance → easier questions', 'Difficulty changes in real time']} />
      <Section title="Voice Analysis" items={['Confidence', 'Clarity', 'Filler words', 'Pacing']} />
      <Section title="Body Language Analysis" items={['Eye contact', 'Posture', 'Facial sentiments', 'Fidgeting Detection']} />
      <p style={{ textAlign: 'right' }} className="link" onClick={() => nav('/home')}>Next ›</p>
    </PhoneLayout>
  );
}

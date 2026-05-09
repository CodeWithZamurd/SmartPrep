import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout.jsx';

function Section({ icon, title, items, color }) {
  return (
    <div className="card">
      <h3 style={{ color }}>{icon} {title}</h3>
      <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
        {items.map((i) => <li key={i}>{i}</li>)}
      </ul>
    </div>
  );
}

export default function EvaluationRules() {
  const nav = useNavigate();
  return (
    <AppLayout narrow>
      <h1>Evaluation Rules</h1>
      <p className="subtitle mt-sm">How SmartPrep grades your performance.</p>

      <div className="card mt-lg">
        <h3>Score distribution</h3>
        <div className="grid-3 mt-md">
          <div className="metric"><div className="value" style={{ color: 'var(--green)' }}>60%</div><div className="label">Technical Skills</div></div>
          <div className="metric"><div className="value" style={{ color: 'var(--yellow)' }}>20%</div><div className="label">Voice Analysis</div></div>
          <div className="metric"><div className="value" style={{ color: 'var(--orange)' }}>20%</div><div className="label">Body Language</div></div>
        </div>
        <p className="muted mt-md" style={{ fontStyle: 'italic', fontSize: 13 }}>
          If video is off, body language score is automatically redistributed across technical and voice analysis.
        </p>
      </div>

      <div className="grid-2 mt-lg">
        <Section
          icon="📈"
          title="Technical Evaluation"
          color="var(--green)"
          items={['Answers checked for correctness and logic', 'Harder questions carry higher marks', 'Score adjusts based on question difficulty']}
        />
        <Section
          icon="🔁"
          title="Adaptive Questions"
          color="var(--primary)"
          items={['Good performance → harder questions', 'Weak performance → easier questions', 'Difficulty changes in real time']}
        />
        <Section
          icon="🎤"
          title="Voice Analysis"
          color="var(--yellow)"
          items={['Confidence', 'Clarity', 'Filler words', 'Pacing']}
        />
        <Section
          icon="🧍"
          title="Body Language Analysis"
          color="var(--orange)"
          items={['Eye contact', 'Posture', 'Facial sentiments', 'Fidgeting detection']}
        />
      </div>

      <div className="center mt-xl">
        <button className="btn lg" onClick={() => nav('/home')}>Got it →</button>
      </div>
    </AppLayout>
  );
}

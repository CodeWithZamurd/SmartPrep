import { useNavigate } from 'react-router-dom';
import { PhoneLayout } from '../components/Layout.jsx';

export default function Splash() {
  const nav = useNavigate();
  return (
    <PhoneLayout hideTabs>
      <div style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 16 }}>
        <div style={{ fontSize: 80 }}>🤖💬🧑‍💼</div>
        <h1 style={{ fontSize: 36, margin: 0 }}>SmartPrep</h1>
        <h2 style={{ fontSize: 26, margin: 0 }}>AI Interview Coach</h2>
        <p className="subtitle">Turn nervous answers into confident conversations.</p>
        <button className="btn" style={{ width: 200 }} onClick={() => nav('/login')}>
          GET STARTED
        </button>
      </div>
    </PhoneLayout>
  );
}

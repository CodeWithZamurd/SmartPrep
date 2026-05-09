export default function Slider({ value, min = 0, max = 100, onChange, suffix = '' }) {
  return (
    <div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--primary)' }}
      />
      <div className="between" style={{ marginTop: 4 }}>
        <span className="muted" style={{ fontSize: 11 }}>
          {min}
          {suffix}
        </span>
        <span className="muted" style={{ fontSize: 11 }}>
          {max}
          {suffix}
        </span>
      </div>
    </div>
  );
}

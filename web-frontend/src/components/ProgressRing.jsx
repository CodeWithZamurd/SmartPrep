export default function ProgressRing({ value = 0, label, size = 160, color = 'var(--green)' }) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const dash = (v / 100) * c;
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--divider)" strokeWidth="12" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="ring-center">
        <div className="v">{v}%</div>
        {label && <div className="l">{label}</div>}
      </div>
    </div>
  );
}

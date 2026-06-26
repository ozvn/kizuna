export type StatRingVariant = 'hunger' | 'clean' | 'kinship' | 'energy';

interface StatRingWidgetProps {
  label: string;
  icon: string;
  value: number;
  max?: number;
  variant: StatRingVariant;
}

const RING_SIZE = 54;
const STROKE = 5;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const FILL: Record<StatRingVariant, string> = {
  hunger: '#f5a080',
  clean: '#95d4ac',
  kinship: '#f0a8c0',
  energy: '#88c0e8',
};

export default function StatRingWidget({
  label,
  icon,
  value,
  max = 100,
  variant,
}: StatRingWidgetProps) {
  const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const dash = (pct / 100) * CIRCUMFERENCE;
  const center = RING_SIZE / 2;

  return (
    <article
      className={`stat-widget stat-widget-${variant}`}
      aria-label={`${label}: ${pct} percent`}
    >
      <div className="stat-widget-ring-wrap">
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          className="stat-ring-svg pixelated"
          aria-hidden
        >
          <circle
            cx={center}
            cy={center}
            r={RADIUS}
            fill="none"
            stroke="var(--color-parchment-dark)"
            strokeWidth={STROKE}
          />
          <circle
            cx={center}
            cy={center}
            r={RADIUS}
            fill="none"
            stroke={FILL[variant]}
            strokeWidth={STROKE}
            strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
            strokeLinecap="butt"
            transform={`rotate(-90 ${center} ${center})`}
          />
        </svg>
        <span className="stat-widget-icon" aria-hidden>
          {icon}
        </span>
      </div>
      <div className="stat-widget-meta">
        <span className="stat-widget-label">{label}</span>
        <span className="stat-widget-value tabular-nums">{pct}%</span>
      </div>
    </article>
  );
}

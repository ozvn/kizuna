type StatFillVariant = 'hunger' | 'clean' | 'kinship' | 'energy' | 'xp';

interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  icon: string;
  variant: StatFillVariant;
  valueLabel?: string;
  hint?: string;
}

export default function ProgressBar({
  label,
  value,
  max = 100,
  icon,
  variant,
  valueLabel,
  hint,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const displayValue = valueLabel ?? String(Math.round(value));

  return (
    <div className="flex items-center gap-2">
      <span className="text-base leading-none shrink-0 w-5 text-center" aria-hidden>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1 gap-1">
          <span className="game-label text-ink text-stroke-soft">{label}</span>
          <span className="game-caption text-ink-muted tabular-nums shrink-0">
            {displayValue}
          </span>
        </div>
        <div className="stat-track">
          <div
            className={`stat-fill-pixel stat-fill-${variant}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {hint && (
          <p className="game-caption text-ink-muted mt-1">{hint}</p>
        )}
      </div>
    </div>
  );
}

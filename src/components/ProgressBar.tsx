type StatFillVariant = 'hunger' | 'clean' | 'kinship' | 'energy' | 'xp';

interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  icon: string;
  variant: StatFillVariant;
  /** Örn: "72/200" — verilmezse sadece value gösterilir */
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
    <div className="flex items-center gap-1.5">
      <span className="text-sm leading-none shrink-0 w-4 text-center" aria-hidden>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5 gap-1">
          <span className="text-[10px] font-bold text-ink text-stroke-soft">{label}</span>
          <span className="text-[9px] text-ink-muted tabular-nums font-bold shrink-0">
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
          <p className="text-[8px] text-ink-muted font-semibold mt-0.5 leading-tight">{hint}</p>
        )}
      </div>
    </div>
  );
}

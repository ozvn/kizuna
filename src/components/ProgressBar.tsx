type StatFillVariant = 'hunger' | 'clean' | 'kinship' | 'energy';

interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  icon: string;
  variant: StatFillVariant;
}

export default function ProgressBar({ label, value, max = 100, icon, variant }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm leading-none shrink-0 w-4 text-center" aria-hidden>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <span className="text-[10px] font-bold text-ink text-stroke-soft">{label}</span>
          <span className="text-[9px] text-ink-muted tabular-nums font-bold">{Math.round(value)}</span>
        </div>
        <div className="stat-track">
          <div
            className={`stat-fill-pixel stat-fill-${variant}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

import { Loader2 } from 'lucide-react';

interface CareActionButtonProps {
  label: string;
  emoji: string;
  accentClass: string;
  disabled?: boolean;
  locked?: boolean;
  loading?: boolean;
  countdownLabel?: string | null;
  countdownText?: string | null;
  hintText?: string | null;
  confirmMode?: boolean;
  onClick: () => void;
}

export default function CareActionButton({
  label,
  emoji,
  accentClass,
  disabled,
  locked,
  loading,
  countdownLabel,
  countdownText,
  hintText,
  confirmMode,
  onClick,
}: CareActionButtonProps) {
  const isLocked = locked || (disabled && !loading && !confirmMode);
  const showCountdown = isLocked && !!countdownText;
  const showHint = isLocked && !!hintText && !showCountdown;
  const lockIcon = showCountdown ? '⏳' : showHint ? '🔒' : isLocked ? '🔒' : null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        'care-btn w-full min-w-0',
        isLocked ? 'care-btn-locked' : 'care-btn-active',
        !isLocked ? accentClass : '',
        confirmMode ? 'care-btn-confirm' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-busy={loading}
      aria-disabled={isLocked}
      aria-live={showCountdown ? 'polite' : undefined}
    >
      {lockIcon && (
        <span className="care-btn-lock-icon" aria-hidden>
          {lockIcon}
        </span>
      )}

      <span className={`care-btn-body ${isLocked ? 'care-btn-body-dimmed' : ''}`}>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-ink/70" />
        ) : (
          <span className="care-btn-emoji">{emoji}</span>
        )}
        <span className="text-[9px] font-bold leading-tight text-stroke-soft">
          {confirmMode ? 'Onayla' : label}
        </span>
      </span>

      {showCountdown && (
        <span className="care-btn-countdown">
          <span className="care-btn-countdown-label">{countdownLabel}</span>
          <span className="care-btn-countdown-time text-stroke-soft">{countdownText}</span>
        </span>
      )}

      {showHint && <span className="care-btn-hint text-stroke-soft">{hintText}</span>}
    </button>
  );
}

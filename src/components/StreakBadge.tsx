import { getNextStreakMilestone, getStreakMultiplier } from '../lib/ritualConfig';

interface StreakBadgeProps {
  streak: number;
  dailyXpEarned: number;
  dailyXpCap: number;
}

export default function StreakBadge({ streak, dailyXpEarned, dailyXpCap }: StreakBadgeProps) {
  const multiplier = getStreakMultiplier(streak);
  const next = getNextStreakMilestone(streak);
  const dailyPct = dailyXpCap > 0 ? Math.min(100, (dailyXpEarned / dailyXpCap) * 100) : 0;
  const daysToNext = next ? next.days - streak : 0;

  return (
    <div className="streak-panel" aria-label={`Care streak: ${streak} days`}>
      <div className="streak-panel-inner">
        <div className="streak-hero">
          <div className="streak-hero-left">
            <span className="streak-flame" aria-hidden>
              🔥
            </span>
            <div className="streak-hero-text">
              <span className="streak-count font-pixel">{streak}</span>
              <span className="streak-label">day streak</span>
            </div>
          </div>

          <div className="streak-multiplier-wrap">
            <span className="streak-multiplier-label">Bonus</span>
            <span className="streak-multiplier font-pixel">×{multiplier}</span>
          </div>
        </div>

        <div className="streak-daily">
          <div className="streak-daily-header">
            <span className="streak-daily-title">Daily XP</span>
            <span className="streak-daily-value tabular-nums">
              {dailyXpEarned}/{dailyXpCap}
            </span>
          </div>
          <div className="stat-track streak-daily-track">
            <div className="stat-fill-pixel stat-fill-xp" style={{ width: `${dailyPct}%` }} />
          </div>
        </div>

        {next ? (
          <p className="streak-milestone">
            <span className="streak-milestone-icon" aria-hidden>
              ✦
            </span>
            {daysToNext}d until{' '}
            <strong className="text-coral-dark">×{next.multiplier}</strong>
            <span className="streak-milestone-name"> · {next.label}</span>
          </p>
        ) : (
          <p className="streak-milestone streak-milestone-max">
            <span aria-hidden>👑</span> Max streak bonus active!
          </p>
        )}
      </div>
    </div>
  );
}

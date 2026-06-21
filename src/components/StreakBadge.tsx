import { getNextStreakMilestone, getStreakMultiplier } from '../lib/ritualConfig';

interface StreakBadgeProps {
  streak: number;
  dailyXpEarned: number;
  dailyXpCap: number;
}

export default function StreakBadge({ streak, dailyXpEarned, dailyXpCap }: StreakBadgeProps) {
  const multiplier = getStreakMultiplier(streak);
  const next = getNextStreakMilestone(streak);

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-bold">
      <span className="game-tag bg-peach text-ink inline-flex items-center gap-0.5">
        🔥 {streak}g
        {multiplier > 1 && <span className="text-coral-dark">×{multiplier}</span>}
      </span>
      <span className="text-ink-muted text-stroke-soft">
        XP {dailyXpEarned}/{dailyXpCap}
      </span>
      {next && (
        <span className="text-ink-muted text-[8px]">
          · {next.days - streak}g → ×{next.multiplier}
        </span>
      )}
    </div>
  );
}

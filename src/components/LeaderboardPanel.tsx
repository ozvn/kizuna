import { Loader2, Trophy } from 'lucide-react';
import GamePanel from './GamePanel';
import type { LeaderboardEntry } from '../types';

interface LeaderboardPanelProps {
  entries: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

function rankMedal(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

export default function LeaderboardPanel({
  entries,
  loading,
  error,
  onRefresh,
}: LeaderboardPanelProps) {
  return (
    <GamePanel className="w-full">
      <div className="space-y-2">
        <div className="flex items-center justify-between pb-1 border-b-2 border-frame-light border-dashed">
          <span className="flex items-center gap-1 text-[10px] font-bold text-ink text-stroke-soft">
            <Trophy className="w-3.5 h-3.5 text-gold" />
            Leaderboard
          </span>
          <button
            type="button"
            onClick={onRefresh}
            className="text-[8px] font-bold text-ink-muted hover:text-ink underline"
          >
            Refresh
          </button>
        </div>

        <p className="text-[8px] text-ink-muted font-semibold leading-snug">
          Ranked by level, XP, streak &amp; spirit. Both partners must be matched.
        </p>

        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-ink-muted" />
          </div>
        )}

        {error && <p className="game-alert game-alert-error text-[9px]">{error}</p>}

        {!loading && !error && entries.length === 0 && (
          <p className="text-[9px] text-ink-muted font-semibold py-2 text-center">
            No ranked pets yet.
          </p>
        )}

        {!loading && entries.length > 0 && (
          <ul className="space-y-1 max-h-64 overflow-y-auto game-log-scroll">
            {entries.map((entry) => (
              <li
                key={entry.pet_id}
                className={`game-list-row flex items-center gap-2 ${
                  entry.is_mine ? 'ring-2 ring-gold/60' : ''
                }`}
              >
                <span className="text-sm shrink-0 w-8 text-center font-pixel text-[9px]">
                  {rankMedal(entry.rank)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-ink truncate text-stroke-soft">
                    {entry.pet_name}
                    {entry.is_mine && (
                      <span className="text-gold text-[8px] ml-1">(you)</span>
                    )}
                  </p>
                  <p className="text-[8px] text-ink-muted font-semibold">
                    Lv.{entry.level} · {entry.xp} XP · 🔥{entry.care_streak} · ✦
                    {entry.spirit_points}
                  </p>
                </div>
                <span className="text-[9px] font-bold text-coral-dark tabular-nums shrink-0">
                  {entry.score}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </GamePanel>
  );
}

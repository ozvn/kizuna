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
      <div className="space-y-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b-2 border-frame-light border-dashed">
          <span className="flex items-center gap-1.5 game-heading text-ink text-stroke-soft">
            <Trophy className="w-4 h-4 text-gold" />
            Leaderboard
          </span>
          <button
            type="button"
            onClick={onRefresh}
            className="game-caption text-ink-muted hover:text-ink underline"
          >
            Refresh
          </button>
        </div>

        <p className="game-caption text-ink-muted leading-snug">
          Ranked by level, XP, streak &amp; spirit. Both partners must be matched.
        </p>

        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-ink-muted" />
          </div>
        )}

        {error && <p className="game-alert game-alert-error">{error}</p>}

        {!loading && !error && entries.length === 0 && (
          <p className="game-body text-ink-muted py-2 text-center">
            No ranked pets yet.
          </p>
        )}

        {!loading && entries.length > 0 && (
          <ul className="space-y-1.5 max-h-72 overflow-y-auto game-log-scroll">
            {entries.map((entry) => (
              <li
                key={entry.pet_id}
                className={`game-list-row flex items-center gap-2.5 ${
                  entry.is_mine ? 'ring-2 ring-gold/60' : ''
                }`}
              >
                <span className="text-base shrink-0 w-9 text-center game-subtitle-pixel">
                  {rankMedal(entry.rank)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="game-heading text-ink truncate text-stroke-soft">
                    {entry.pet_name}
                    {entry.is_mine && (
                      <span className="text-gold game-caption ml-1">(you)</span>
                    )}
                  </p>
                  <p className="game-caption text-ink-muted">
                    Lv.{entry.level} · {entry.xp} XP · 🔥{entry.care_streak} · ✦
                    {entry.spirit_points}
                  </p>
                </div>
                <span className="game-body text-coral-dark tabular-nums shrink-0">
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

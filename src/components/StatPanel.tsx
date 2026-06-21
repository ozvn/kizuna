import { Sparkles, Zap } from 'lucide-react';
import ProgressBar from './ProgressBar';
import GamePanel from './GamePanel';
import { statConfig } from '../lib/theme';
import StreakBadge from './StreakBadge';
import type { Pet } from '../types';

interface StatPanelProps {
  pet: Pet;
  brs: number;
  rarityLabel: string;
  careStreak?: number;
  dailyXpEarned?: number;
  dailyXpCap?: number;
}

export default function StatPanel({
  pet,
  brs,
  rarityLabel,
  careStreak = 0,
  dailyXpEarned = 0,
  dailyXpCap = 8,
}: StatPanelProps) {
  return (
    <GamePanel className="w-full">
      <div className="space-y-2">
        <div className="flex justify-between items-center pb-1 border-b-2 border-frame-light border-dashed">
          <span className="flex items-center gap-1 text-[10px] font-bold text-ink text-stroke-title font-pixel">
            <Sparkles className="w-3 h-3 text-gold" />
            BRS {brs}
          </span>
          <span className="game-tag text-ink">{rarityLabel}</span>
        </div>

        <StreakBadge streak={careStreak} dailyXpEarned={dailyXpEarned} dailyXpCap={dailyXpCap} />

        <ProgressBar
          label={statConfig.hunger.label}
          value={pet.hunger}
          icon={statConfig.hunger.icon}
          variant="hunger"
        />
        <ProgressBar
          label={statConfig.cleanliness.label}
          value={pet.cleanliness}
          icon={statConfig.cleanliness.icon}
          variant="clean"
        />
        <ProgressBar
          label={statConfig.kinship.label}
          value={pet.kinship}
          icon={statConfig.kinship.icon}
          variant="kinship"
        />
        <ProgressBar
          label={statConfig.energy.label}
          value={pet.energy}
          icon={statConfig.energy.icon}
          variant="energy"
        />

        <div className="flex justify-between text-[9px] font-bold text-ink-muted pt-0.5 text-stroke-soft">
          <span className="flex items-center gap-0.5">
            <Zap className="w-3 h-3 text-sky" />
            XP {pet.xp}/{pet.level * 50}
          </span>
          <span>Ruh ✦ {pet.spirit_points}</span>
        </div>
      </div>
    </GamePanel>
  );
}

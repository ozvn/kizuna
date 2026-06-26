import { Sparkles } from 'lucide-react';
import ProgressBar from './ProgressBar';
import GamePanel from './GamePanel';
import { statConfig } from '../lib/theme';
import { ENERGY_MAX, ENERGY_REGEN_PER_HOUR, ENERGY_PLAY_MIN } from '../lib/ritualConfig';
import { xpForLevel } from '../lib/gameUtils';
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
  const xpNeeded = xpForLevel(pet.level);
  const energyHint =
    pet.energy < ENERGY_PLAY_MIN
      ? `Low energy — +${ENERGY_REGEN_PER_HOUR}/hr rest, feed +15`
      : pet.energy < 40
        ? `+${ENERGY_REGEN_PER_HOUR} energy per hour while resting`
        : undefined;

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

        <StreakBadge
          streak={careStreak}
          dailyXpEarned={dailyXpEarned}
          dailyXpCap={dailyXpCap}
        />
        <ProgressBar
          label={`Level ${pet.level}`}
          value={pet.xp}
          max={xpNeeded}
          icon="⭐"
          variant="xp"
          valueLabel={`${pet.xp}/${xpNeeded} XP`}
        />

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
          max={ENERGY_MAX}
          icon={statConfig.energy.icon}
          variant="energy"
          valueLabel={`${Math.round(pet.energy)}/${ENERGY_MAX}`}
          hint={energyHint}
        />

        <div className="flex justify-end text-[9px] font-bold text-ink-muted pt-0.5 text-stroke-soft">
          <span>Spirit ✦ {pet.spirit_points}</span>
        </div>
      </div>
    </GamePanel>
  );
}

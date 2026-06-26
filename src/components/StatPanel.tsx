import ProgressBar from './ProgressBar';
import StatRingWidget from './StatRingWidget';
import GamePanel from './GamePanel';
import { statConfig } from '../lib/theme';
import { ENERGY_MAX, ENERGY_REGEN_PER_HOUR, ENERGY_PLAY_MIN } from '../lib/ritualConfig';
import { xpForLevel } from '../lib/gameUtils';
import StreakBadge from './StreakBadge';
import type { Pet } from '../types';

interface StatPanelProps {
  pet: Pet;
  careStreak?: number;
  dailyXpEarned?: number;
  dailyXpCap?: number;
}

export default function StatPanel({
  pet,
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
    <GamePanel className="w-full game-panel-rail">
      <div className="space-y-3">
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
          valueLabel={`${pet.xp}/${xpNeeded}`}
        />

        <div className="grid grid-cols-2 gap-3">
          <StatRingWidget
            label={statConfig.hunger.label}
            icon={statConfig.hunger.icon}
            value={pet.hunger}
            variant="hunger"
          />
          <StatRingWidget
            label={statConfig.cleanliness.label}
            icon={statConfig.cleanliness.icon}
            value={pet.cleanliness}
            variant="clean"
          />
          <StatRingWidget
            label={statConfig.kinship.label}
            icon={statConfig.kinship.icon}
            value={pet.kinship}
            variant="kinship"
          />
          <StatRingWidget
            label={statConfig.energy.label}
            icon={statConfig.energy.icon}
            value={pet.energy}
            max={ENERGY_MAX}
            variant="energy"
          />
        </div>

        {energyHint && (
          <p className="game-caption text-ink-muted text-center px-1">{energyHint}</p>
        )}
      </div>
    </GamePanel>
  );
}

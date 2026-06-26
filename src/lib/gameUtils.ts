/** Aavegotchi-style bell curve trait generation (1-99, centered at 50) */
export function generateBellCurveTrait(): number {
  const samples = 6;
  let sum = 0;
  for (let i = 0; i < samples; i++) {
    sum += Math.random();
  }
  const normalized = sum / samples;
  return Math.max(1, Math.min(99, Math.round(normalized * 98 + 1)));
}

/** Rarity contribution for a single trait (Aavegotchi BRS formula) */
export function traitRarityScore(value: number): number {
  if (value < 50) {
    return 100 - value;
  }
  return value - 49;
}

export function calculateBRS(traits: number[]): number {
  return traits.reduce((sum, t) => sum + traitRarityScore(t), 0);
}

export function getRarityLabel(brs: number): string {
  if (brs >= 450) return 'Mythic Rare';
  if (brs >= 400) return 'Ultra Rare';
  if (brs >= 350) return 'Rare';
  if (brs >= 300) return 'Above Average';
  if (brs >= 250) return 'Average';
  return 'Common';
}

export function xpForLevel(level: number): number {
  return level * 50;
}

export function checkLevelUp(currentLevel: number, currentXp: number): {
  newLevel: number;
  newXp: number;
  spiritPointsGained: number;
} {
  let level = currentLevel;
  let xp = currentXp;
  let spiritPointsGained = 0;
  const prevLevel = level;

  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level += 1;
  }

  const levelsGained = level - prevLevel;
  if (levelsGained > 0) {
    const prevSpiritThreshold = Math.floor(prevLevel / 3);
    const newSpiritThreshold = Math.floor(level / 3);
    spiritPointsGained = newSpiritThreshold - prevSpiritThreshold;
  }

  return { newLevel: level, newXp: xp, spiritPointsGained };
}

export function getEvolutionStage(level: number): number {
  if (level >= 15) return 3;
  if (level >= 5) return 2;
  return 1;
}

export function getTimeOfDayBackground(): {
  period: 'morning' | 'afternoon' | 'night';
  className: string;
} {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) {
    return { period: 'morning', className: 'bg-scene-morning' };
  }
  if (hour >= 12 && hour < 20) {
    return { period: 'afternoon', className: 'bg-scene-afternoon' };
  }
  return { period: 'night', className: 'bg-scene-night' };
}

export function randomPetName(): string {
  const prefixes = ['Mochi', 'Poko', 'Kira', 'Neko', 'Puru', 'Mimi'];
  const suffixes = ['chan', 'ko', 'pi', 'zu', ''];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${prefix}${suffix}`;
}

export const ACTION_LABELS: Record<string, string> = {
  feed: 'fed',
  pet: 'petted',
  clean: 'cleaned',
  play: 'played together',
};

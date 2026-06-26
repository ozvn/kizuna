import type { CareAction } from '../types';

/** Besle / Temizle: günde en fazla 2 (12 saat) */
export const COOLDOWN_HOURS: Record<CareAction, number> = {
  feed: 12,
  clean: 12,
  pet: 24,
  play: 24,
};

export const DAILY_XP_CAP = 8;

export const ENERGY_MAX = 100;
export const ENERGY_REGEN_PER_HOUR = 5;
export const ENERGY_PLAY_COST = 20;
export const ENERGY_PLAY_MIN = 12;

export const NEGLECT_HOURS = 36;
export const HUNGRY_HOURS = 10;

export const STREAK_MILESTONES = [
  { days: 3, multiplier: 1.5, label: '3 Gün Serisi', bonusXp: 3 },
  { days: 7, multiplier: 2, label: '7 Gün Serisi', bonusXp: 8 },
  { days: 15, multiplier: 3, label: '15 Gün Serisi', bonusXp: 15 },
] as const;

export const ACTION_COOLDOWN_LABEL: Record<CareAction, string> = {
  feed: 'Sonraki Besleme',
  clean: 'Sonraki Temizlik',
  pet: 'Sonraki Sevme',
  play: 'Sonraki Oyun',
};

export function getStreakMultiplier(streak: number): number {
  if (streak >= 15) return 3;
  if (streak >= 7) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

export function getNextStreakMilestone(streak: number): (typeof STREAK_MILESTONES)[number] | null {
  return STREAK_MILESTONES.find((m) => streak < m.days) ?? null;
}

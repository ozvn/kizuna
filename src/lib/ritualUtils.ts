import type { CareAction } from '../types';
import { COOLDOWN_HOURS } from './ritualConfig';

export function getActionLastAt(
  action: CareAction,
  state: {
    last_feed_at: string | null;
    last_clean_at: string | null;
    last_pet_at: string | null;
    last_play_at: string | null;
  },
): string | null {
  switch (action) {
    case 'feed':
      return state.last_feed_at;
    case 'clean':
      return state.last_clean_at;
    case 'pet':
      return state.last_pet_at;
    case 'play':
      return state.last_play_at;
  }
}

/** Cooldown bitiş zamanı (ms). lastAt null ise hemen kullanılabilir. */
export function getCooldownEndsAt(lastAt: string | null, action: CareAction): number | null {
  if (!lastAt) return null;
  return new Date(lastAt).getTime() + COOLDOWN_HOURS[action] * 3_600_000;
}

export function getCooldownRemainingMs(
  lastAt: string | null,
  action: CareAction,
  now = Date.now(),
): number {
  const endsAt = getCooldownEndsAt(lastAt, action);
  if (endsAt === null) return 0;
  return Math.max(0, endsAt - now);
}

export function isActionOnCooldown(
  lastAt: string | null,
  action: CareAction,
  now = Date.now(),
): boolean {
  return getCooldownRemainingMs(lastAt, action, now) > 0;
}

export function formatCountdown(totalMs: number): string {
  if (totalMs <= 0) return 'Hazır';

  const totalSec = Math.ceil(totalMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  if (hours > 0) {
    return `${hours}s ${String(minutes).padStart(2, '0')}dk`;
  }
  if (minutes > 0) {
    return `${minutes}dk ${String(seconds).padStart(2, '0')}sn`;
  }
  return `${seconds}sn`;
}

export function hoursSince(iso: string | null, now = Date.now()): number {
  if (!iso) return Infinity;
  return (now - new Date(iso).getTime()) / 3_600_000;
}

export function parseCooldownError(message: string): number | null {
  if (!message.startsWith('COOLDOWN:')) return null;
  const sec = parseInt(message.split(':')[1] ?? '', 10);
  return Number.isFinite(sec) ? sec * 1000 : null;
}

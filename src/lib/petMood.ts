import { HUNGRY_HOURS, NEGLECT_HOURS } from './ritualConfig';
import { hoursSince } from './ritualUtils';
import type { Pet, PetMood } from '../types';

export function resolvePetMood(
  pet: Pet,
  override: PetMood | null,
  lastFeedAt: string | null,
  lastCareAt: string | null,
  now = Date.now(),
): PetMood {
  if (override === 'happy') return 'happy';

  const sinceFeed = hoursSince(lastFeedAt, now);
  const sinceCare = hoursSince(lastCareAt ?? pet.last_care_at ?? null, now);

  if (sinceFeed >= HUNGRY_HOURS || pet.hunger < 35) return 'hungry';
  if (sinceCare >= NEGLECT_HOURS * 0.75 || pet.energy < 25) return 'lonely';
  if (pet.energy < 35 || sinceFeed >= HUNGRY_HOURS * 0.7) return 'yawning';
  if (pet.energy < 20) return 'sleepy';

  return 'idle';
}

export function pickContextPhrase(mood: PetMood): string {
  const pick = <T extends readonly string[]>(arr: T) =>
    arr[Math.floor(Math.random() * arr.length)];

  switch (mood) {
    case 'hungry':
      return pick([
        'grrr... mimi aç...',
        'onigiri...?',
        'tummy rumble~',
      ] as const);
    case 'sleepy':
    case 'yawning':
      return pick([
        'yawn~ zZz',
        'sleepy mimi...',
        'zzz... uffu',
      ] as const);
    case 'lonely':
      return pick([
        'where are you...?',
        'miss you~',
        'alone... mimi',
      ] as const);
    case 'happy':
      return pick([
        'poko pipo!!',
        'love you~',
        'best day ever!',
      ] as const);
    default:
      return pick([
        'uww',
        'uffu puffu',
        'mimi~',
        'graff',
        'poko pipo',
      ] as const);
  }
}

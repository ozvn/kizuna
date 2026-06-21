import { useMemo } from 'react';
import type { CareAction, PetRitualState } from '../types';
import { ACTION_COOLDOWN_LABEL } from '../lib/ritualConfig';
import {
  formatCountdown,
  getActionLastAt,
  getCooldownRemainingMs,
} from '../lib/ritualUtils';
import { useNow } from './useCountdown';

export interface ActionAvailability {
  action: CareAction;
  available: boolean;
  locked: boolean;
  confirmMode?: boolean;
  countdownMs: number;
  countdownLabel: string;
  /** Geri sayım metni — cooldown aktifken dolu */
  countdownText: string | null;
  hintText: string | null;
}

export function useActionCooldowns(
  ritualState: PetRitualState | null,
  optimisticUntil: Partial<Record<CareAction, number>> = {},
): Record<CareAction, ActionAvailability> {
  const now = useNow();

  return useMemo(() => {
    const empty = (action: CareAction): ActionAvailability => ({
      action,
      available: false,
      locked: true,
      countdownMs: 0,
      countdownLabel: ACTION_COOLDOWN_LABEL[action],
      countdownText: null,
      hintText: 'Yükleniyor…',
    });

    if (!ritualState) {
      return {
        feed: empty('feed'),
        clean: empty('clean'),
        pet: empty('pet'),
        play: empty('play'),
      };
    }

    const build = (action: CareAction): ActionAvailability => {
      const lastAt = getActionLastAt(action, ritualState);
      let remaining = getCooldownRemainingMs(lastAt, action, now);

      const optimisticEnd = optimisticUntil[action];
      if (optimisticEnd && optimisticEnd > now) {
        remaining = Math.max(remaining, optimisticEnd - now);
      }

      const onCooldown = remaining > 0;

      if (action === 'play') {
        const pending = ritualState.pending_joint_play;
        if (pending) {
          if (pending.can_confirm) {
            return {
              action,
              available: true,
              locked: false,
              confirmMode: true,
              countdownMs: 0,
              countdownLabel: ACTION_COOLDOWN_LABEL.play,
              countdownText: null,
              hintText: null,
            };
          }
          if (pending.is_initiator) {
            return {
              action,
              available: false,
              locked: true,
              countdownMs: 0,
              countdownLabel: 'Partner Onayı',
              countdownText: null,
              hintText: 'Partner onayını bekliyor…',
            };
          }
        }
      }

      if (onCooldown) {
        return {
          action,
          available: false,
          locked: true,
          countdownMs: remaining,
          countdownLabel: ACTION_COOLDOWN_LABEL[action],
          countdownText: formatCountdown(remaining),
          hintText: null,
        };
      }

      return {
        action,
        available: true,
        locked: false,
        countdownMs: 0,
        countdownLabel: ACTION_COOLDOWN_LABEL[action],
        countdownText: null,
        hintText: null,
      };
    };

    return {
      feed: build('feed'),
      clean: build('clean'),
      pet: build('pet'),
      play: build('play'),
    };
  }, [ritualState, now, optimisticUntil]);
}

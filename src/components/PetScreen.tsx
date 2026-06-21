import { useState, useCallback, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useRealtimePet } from '../hooks/useRealtimePet';
import { useCareLogs } from '../hooks/useCareLogs';
import { usePetRitualState } from '../hooks/usePetRitualState';
import { useActionCooldowns } from '../hooks/useActionCooldowns';
import { useSoundMuted } from '../hooks/useSoundMuted';
import { getTimeOfDayBackground, calculateBRS, getRarityLabel } from '../lib/gameUtils';
import { pickContextPhrase, resolvePetMood } from '../lib/petMood';
import { hoursSince } from '../lib/ritualUtils';
import { soundEngine } from '../lib/soundEngine';
import { formatSupabaseError } from '../lib/supabaseErrors';
import { careActions } from '../lib/theme';
import { COOLDOWN_HOURS } from '../lib/ritualConfig';
import type { CareAction, PetMood } from '../types';
import MochiCharacter from './MochiCharacter';
import StatPanel from './StatPanel';
import CareActionButton from './CareActionButton';
import CareLogPanel from './CareLogPanel';
import SpeechBubble from './SpeechBubble';
import SoundToggleButton from './SoundToggleButton';

export default function PetScreen() {
  const { profile, partner, signOut } = useAuth();
  const { pet, loading, refresh: refreshPet } = useRealtimePet(profile?.pet_id);
  const { state: ritualState, refresh: refreshRitual } = usePetRitualState(profile?.pet_id);
  const careLogs = useCareLogs(profile?.pet_id);

  const [actionLoading, setActionLoading] = useState<CareAction | null>(null);
  const [moodOverride, setMoodOverride] = useState<PetMood | null>(null);
  const [speechText, setSpeechText] = useState('');
  const [speechKey, setSpeechKey] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [optimisticUntil, setOptimisticUntil] = useState<Partial<Record<CareAction, number>>>({});

  const cooldowns = useActionCooldowns(ritualState, optimisticUntil);
  const { muted, toggle: toggleSound } = useSoundMuted();

  const bg = getTimeOfDayBackground();

  const lastFeedAt = ritualState?.last_feed_at ?? pet?.last_feed_at ?? null;
  const lastCareAt = ritualState?.last_care_at ?? pet?.last_care_at ?? null;
  const hoursSinceFeed = hoursSince(lastFeedAt);

  const ambientMood = pet
    ? resolvePetMood(pet, moodOverride, lastFeedAt, lastCareAt)
    : 'idle';

  useEffect(() => {
    if (!pet || moodOverride === 'happy') return;
    if (speechText) return;

    const phrase = pickContextPhrase(ambientMood);
    setSpeechText(phrase);
    setSpeechKey((k) => k + 1);
  }, [ambientMood, pet?.id, moodOverride, speechText]);

  const triggerSpeech = useCallback(
    (mood: PetMood = 'happy') => {
      setSpeechText(pickContextPhrase(mood));
      setSpeechKey((k) => k + 1);
    },
    [],
  );

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshPet(), refreshRitual()]);
  }, [refreshPet, refreshRitual]);

  const handleAction = async (action: CareAction) => {
    if (!pet || !profile || actionLoading) return;

    const availability = cooldowns[action];
    if (!availability.available && !availability.confirmMode) return;

    await soundEngine.ensureAudio();
    setActionLoading(action);
    setActionError(null);
    setMoodOverride('happy');

    let error;

    if (action === 'play') {
      const pending = ritualState?.pending_joint_play;
      if (pending?.can_confirm) {
        ({ error } = await supabase.rpc('confirm_joint_play', { p_ritual_id: pending.id }));
      } else {
        ({ error } = await supabase.rpc('initiate_joint_play', { p_pet_id: pet.id }));
      }
    } else {
      const rpcMap = {
        feed: 'perform_ritual_feed',
        clean: 'perform_ritual_clean',
        pet: 'perform_ritual_pet',
      } as const;
      ({ error } = await supabase.rpc(rpcMap[action], { p_pet_id: pet.id }));
    }

    if (error) {
      console.error(error);
      setActionError(formatSupabaseError(error.message));
      setOptimisticUntil((prev) => {
        const next = { ...prev };
        delete next[action];
        return next;
      });
    } else {
      const startsCooldown =
        action !== 'play' ||
        (action === 'play' && ritualState?.pending_joint_play?.can_confirm);

      if (startsCooldown) {
        setOptimisticUntil((prev) => ({
          ...prev,
          [action]: Date.now() + COOLDOWN_HOURS[action] * 3_600_000,
        }));
      }

      soundEngine.playActionSound(action);
      triggerSpeech('happy');
      await refreshAll();
      setOptimisticUntil({});
    }

    setTimeout(() => setMoodOverride(null), 1200);
    setActionLoading(null);
  };

  if (loading || !pet) {
    return (
      <div className="game-device-canvas safe-area">
        <div className="game-console min-h-[18rem] flex items-center justify-center">
          <div className="text-center space-y-3 px-4">
            <div className="game-loader mx-auto" />
            <p className="text-[10px] font-bold text-ink-muted text-stroke-soft">Yükleniyor…</p>
          </div>
        </div>
      </div>
    );
  }

  const brs = calculateBRS([
    pet.aggressiveness,
    pet.energy,
    pet.spookiness,
    pet.brain_size,
    pet.eye_shape,
    pet.eye_color,
  ]);

  return (
    <div className="game-device-canvas safe-area">
      <div className={`game-console ${bg.className}`}>
        <header className="game-header-bar">
          <div>
            <h1 className="font-pixel text-[9px] text-ink text-stroke-title leading-snug">Kizuna</h1>
            <p className="text-[9px] font-bold text-ink-muted mt-0.5 text-stroke-soft">
              {pet.name} · Lv.{pet.level} · {partner?.username ?? 'Arkadaşın'}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <SoundToggleButton muted={muted} onToggle={toggleSound} />
            <button
              onClick={signOut}
              className="pixel-btn p-1.5 bg-parchment-light text-ink-muted hover:text-ink"
              aria-label="Çıkış"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        <div className="game-console-body">
          <section className="mochi-playground" aria-label="Mochi alanı">
            <div className="mochi-playground-stage">
              {speechText && (
                <SpeechBubble
                  key={speechKey}
                  text={speechText}
                  petEnergy={pet.energy}
                  petKinship={pet.kinship}
                  hoursSinceFeed={hoursSinceFeed}
                  onComplete={() => setSpeechText('')}
                />
              )}
              <MochiCharacter
                level={pet.level}
                mood={ambientMood}
                eyeShape={pet.eye_shape}
                eyeColor={pet.eye_color}
                spookiness={pet.spookiness}
                isNight={bg.period === 'night'}
              />
              <div className="mochi-podium" aria-hidden>
                <div className="mochi-podium-grass" />
                <div className="mochi-podium-base" />
              </div>
            </div>
          </section>

          <div className="game-stack">
            <StatPanel
              pet={pet}
              brs={brs}
              rarityLabel={getRarityLabel(brs)}
              careStreak={ritualState?.care_streak ?? 0}
              dailyXpEarned={ritualState?.daily_xp_earned ?? 0}
              dailyXpCap={ritualState?.daily_xp_cap ?? 8}
            />

            {actionError && (
              <p className="game-alert game-alert-error text-center">{actionError}</p>
            )}

            <div className="grid grid-cols-4 gap-2 w-full">
              {careActions.map(({ action, label, emoji, accentClass }) => {
                const avail = cooldowns[action];
                return (
                  <CareActionButton
                    key={action}
                    label={label}
                    emoji={emoji}
                    accentClass={accentClass}
                    loading={actionLoading === action}
                    locked={avail.locked}
                    disabled={!avail.available || actionLoading !== null}
                    confirmMode={avail.confirmMode}
                    countdownLabel={avail.countdownLabel}
                    countdownText={avail.countdownText}
                    hintText={avail.hintText}
                    onClick={() => handleAction(action)}
                  />
                );
              })}
            </div>

            <CareLogPanel logs={careLogs} />
          </div>
        </div>
      </div>
    </div>
  );
}

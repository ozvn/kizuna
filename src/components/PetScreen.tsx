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
import type { CareAction, PetMood, PetScreenTab } from '../types';
import MochiCharacter from './MochiCharacter';
import PetHudBar from './PetHudBar';
import StatPanel from './StatPanel';
import CareActionButton from './CareActionButton';
import CareLogPanel from './CareLogPanel';
import SpeechBubble from './SpeechBubble';
import SoundToggleButton from './SoundToggleButton';
import PetScreenNav from './PetScreenNav';
import LeaderboardPanel from './LeaderboardPanel';
import FriendsPanel from './FriendsPanel';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { usePetSocial } from '../hooks/usePetSocial';
import { usePetRenameState } from '../hooks/usePetRenameState';

export default function PetScreen() {
  const { profile, partner, signOut } = useAuth();
  const { pet, loading, refresh: refreshPet } = useRealtimePet(profile?.pet_id);
  const { state: ritualState, refresh: refreshRitual } = usePetRitualState(profile?.pet_id);
  const careLogs = useCareLogs(profile?.pet_id);
  const leaderboard = useLeaderboard();
  const social = usePetSocial(profile?.pet_id);
  const renameState = usePetRenameState(profile?.pet_id);
  const [screenTab, setScreenTab] = useState<PetScreenTab>('home');

  const [actionLoading, setActionLoading] = useState<CareAction | null>(null);
  const [moodOverride, setMoodOverride] = useState<PetMood | null>(null);
  const [speechText, setSpeechText] = useState('');
  const [speechKey, setSpeechKey] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [optimisticUntil, setOptimisticUntil] = useState<Partial<Record<CareAction, number>>>({});

  const cooldowns = useActionCooldowns(ritualState, optimisticUntil, pet?.energy);
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

  // Pasif enerji yenilenmesi için periyodik senkron
  useEffect(() => {
    if (!pet?.id) return;

    const tick = () => {
      void refreshAll();
    };

    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, [pet?.id, refreshAll]);

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
      setActionError(formatSupabaseError(error));
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
            <p className="game-body text-ink-muted text-stroke-soft">Loading…</p>
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
          <div className="min-w-0">
            <h1 className="game-title-pixel text-ink text-stroke-title">Kizuna</h1>
            <p className="game-caption text-ink-muted mt-1 text-stroke-soft truncate">
              {partner?.username ?? 'Partner'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <SoundToggleButton muted={muted} onToggle={toggleSound} />
            <button
              onClick={signOut}
              className="pixel-btn p-2 bg-parchment-light text-ink-muted hover:text-ink"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <PetHudBar
          petId={pet.id}
          level={pet.level}
          petName={pet.name}
          brs={brs}
          rarityLabel={getRarityLabel(brs)}
          spiritPoints={pet.spirit_points}
          pendingRename={renameState.state?.pending_request ?? null}
          onPetRenamed={() => void refreshPet()}
          onRenameStateChange={renameState.refresh}
        />

        <div className="game-console-body">
          <PetScreenNav active={screenTab} onChange={setScreenTab} />

          {screenTab === 'home' && (
            <>
              <section className="mochi-playground" aria-label="Pet playground">
                <div className="mochi-playground-stage">
                  <div className="mochi-speech-slot">
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
                  </div>
                  <div className="mochi-character-slot">
                    <MochiCharacter
                      level={pet.level}
                      mood={ambientMood}
                      eyeShape={pet.eye_shape}
                      eyeColor={pet.eye_color}
                      spookiness={pet.spookiness}
                      isNight={bg.period === 'night'}
                    />
                  </div>
                  <div className="mochi-podium" aria-hidden>
                    <div className="mochi-podium-grass" />
                    <div className="mochi-podium-base" />
                  </div>
                </div>
              </section>

              <div className="game-content-rail">
                <StatPanel
                  pet={pet}
                  careStreak={ritualState?.care_streak ?? 0}
                  dailyXpEarned={ritualState?.daily_xp_earned ?? 0}
                  dailyXpCap={ritualState?.daily_xp_cap ?? 8}
                />

                {actionError && (
                  <p className="game-alert game-alert-error text-center">{actionError}</p>
                )}

                <div className="game-action-grid">
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
            </>
          )}

          {screenTab === 'leaderboard' && (
            <LeaderboardPanel
              entries={leaderboard.data?.entries ?? []}
              loading={leaderboard.loading}
              error={leaderboard.error}
              onRefresh={leaderboard.refresh}
            />
          )}

          {screenTab === 'friends' && (
            <FriendsPanel
              social={social.state}
              loading={social.loading}
              error={social.error}
              partnerUsername={partner?.username}
              onRefresh={social.refresh}
              onPetUpdated={refreshAll}
            />
          )}
        </div>
      </div>
    </div>
  );
}

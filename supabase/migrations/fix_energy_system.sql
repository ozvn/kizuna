-- Enerji yenilenmesi, ritüel etkileri ve oyun maliyeti
-- Supabase SQL Editor'de bir kez çalıştırın.

ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS last_energy_tick TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

UPDATE public.pets
SET last_energy_tick = COALESCE(last_energy_tick, created_at, now())
WHERE last_energy_tick IS NULL;

-- Saatlik pasif enerji (+5/saat, max 100)
CREATE OR REPLACE FUNCTION public.apply_pet_energy_tick(p_pet_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p public.pets;
  hours_elapsed numeric;
  regen integer;
BEGIN
  SELECT * INTO p FROM public.pets WHERE id = p_pet_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  hours_elapsed :=
    EXTRACT(EPOCH FROM (now() - COALESCE(p.last_energy_tick, p.created_at))) / 3600.0;

  IF hours_elapsed < 1 THEN
    RETURN;
  END IF;

  regen := FLOOR(hours_elapsed)::integer * 5;

  UPDATE public.pets SET
    energy = LEAST(100, energy + regen),
    last_energy_tick = now()
  WHERE id = p_pet_id;
END;
$$;

-- Besle: +15 enerji
CREATE OR REPLACE FUNCTION public.perform_ritual_feed(p_pet_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  p public.pets;
  xp_awarded INTEGER;
BEGIN
  PERFORM public._assert_pet_owner(p_pet_id);
  PERFORM public.apply_pet_neglect_if_needed(p_pet_id);
  PERFORM public.apply_pet_energy_tick(p_pet_id);

  SELECT * INTO p FROM public.pets WHERE id = p_pet_id FOR UPDATE;
  PERFORM public._assert_cooldown(p.last_feed_at, 12, 'Besle');

  PERFORM public._update_care_streak(p_pet_id);

  UPDATE public.pets SET
    hunger = LEAST(100, hunger + 25),
    kinship = LEAST(100, kinship + 4),
    energy = LEAST(100, energy + 15),
    last_feed_at = now(),
    last_care_at = now(),
    last_energy_tick = now()
  WHERE id = p_pet_id;

  xp_awarded := public._award_ritual_xp(p_pet_id, 3);

  INSERT INTO public.care_logs (pet_id, user_id, action_type, stat_gained)
  VALUES (p_pet_id, uid, 'feed', '+25 Açlık · +15 Enerji · +' || xp_awarded || ' XP');

  RETURN public.sync_pet_ritual_state(p_pet_id);
END;
$$;

-- Temizle: +10 enerji
CREATE OR REPLACE FUNCTION public.perform_ritual_clean(p_pet_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  p public.pets;
  xp_awarded INTEGER;
BEGIN
  PERFORM public._assert_pet_owner(p_pet_id);
  PERFORM public.apply_pet_neglect_if_needed(p_pet_id);
  PERFORM public.apply_pet_energy_tick(p_pet_id);

  SELECT * INTO p FROM public.pets WHERE id = p_pet_id FOR UPDATE;
  PERFORM public._assert_cooldown(p.last_clean_at, 12, 'Temizle');

  PERFORM public._update_care_streak(p_pet_id);

  UPDATE public.pets SET
    cleanliness = LEAST(100, cleanliness + 30),
    kinship = LEAST(100, kinship + 3),
    energy = LEAST(100, energy + 10),
    last_clean_at = now(),
    last_care_at = now(),
    last_energy_tick = now()
  WHERE id = p_pet_id;

  xp_awarded := public._award_ritual_xp(p_pet_id, 3);

  INSERT INTO public.care_logs (pet_id, user_id, action_type, stat_gained)
  VALUES (p_pet_id, uid, 'clean', '+30 Temizlik · +10 Enerji · +' || xp_awarded || ' XP');

  RETURN public.sync_pet_ritual_state(p_pet_id);
END;
$$;

-- Sev: +8 enerji
CREATE OR REPLACE FUNCTION public.perform_ritual_pet(p_pet_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  p public.pets;
  xp_awarded INTEGER;
BEGIN
  PERFORM public._assert_pet_owner(p_pet_id);
  PERFORM public.apply_pet_neglect_if_needed(p_pet_id);
  PERFORM public.apply_pet_energy_tick(p_pet_id);

  SELECT * INTO p FROM public.pets WHERE id = p_pet_id FOR UPDATE;
  PERFORM public._assert_cooldown(p.last_pet_at, 24, 'Sev');

  PERFORM public._update_care_streak(p_pet_id);

  UPDATE public.pets SET
    kinship = LEAST(100, kinship + 10),
    energy = LEAST(100, energy + 8),
    last_pet_at = now(),
    last_care_at = now(),
    last_energy_tick = now()
  WHERE id = p_pet_id;

  xp_awarded := public._award_ritual_xp(p_pet_id, 2);

  INSERT INTO public.care_logs (pet_id, user_id, action_type, stat_gained)
  VALUES (p_pet_id, uid, 'pet', '+10 Yakınlık · +8 Enerji · +' || xp_awarded || ' XP');

  RETURN public.sync_pet_ritual_state(p_pet_id);
END;
$$;

-- Birlikte oyna başlat: minimum enerji kontrolü
CREATE OR REPLACE FUNCTION public.initiate_joint_play(p_pet_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  p public.pets;
  existing RECORD;
BEGIN
  PERFORM public._assert_pet_owner(p_pet_id);
  PERFORM public.apply_pet_neglect_if_needed(p_pet_id);
  PERFORM public.apply_pet_energy_tick(p_pet_id);

  SELECT * INTO p FROM public.pets WHERE id = p_pet_id FOR UPDATE;
  PERFORM public._assert_cooldown(p.last_play_at, 24, 'Birlikte Oyna');

  IF p.energy < 12 THEN
    RAISE EXCEPTION 'Enerji yetersiz. Besle veya dinlenerek enerji topla.';
  END IF;

  SELECT * INTO existing
  FROM public.joint_rituals
  WHERE pet_id = p_pet_id AND status = 'pending' AND expires_at > now()
  LIMIT 1;

  IF FOUND THEN
    IF existing.initiator_id = uid THEN
      RETURN public.sync_pet_ritual_state(p_pet_id);
    END IF;
    RAISE EXCEPTION 'Partner zaten bir oyun ritüeli başlattı — onaylamayı bekle';
  END IF;

  INSERT INTO public.joint_rituals (pet_id, initiator_id, action_type, status)
  VALUES (p_pet_id, uid, 'play', 'pending');

  RETURN public.sync_pet_ritual_state(p_pet_id);
END;
$$;

-- Birlikte oyna onayla: -20 enerji
CREATE OR REPLACE FUNCTION public.confirm_joint_play(p_ritual_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  r public.joint_rituals;
  xp_awarded INTEGER;
  streak_mult numeric;
  pet_energy INTEGER;
BEGIN
  SELECT * INTO r FROM public.joint_rituals
  WHERE id = p_ritual_id AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bekleyen ritüel bulunamadı';
  END IF;

  PERFORM public._assert_pet_owner(r.pet_id);
  PERFORM public.apply_pet_energy_tick(r.pet_id);

  SELECT energy INTO pet_energy FROM public.pets WHERE id = r.pet_id;
  IF pet_energy < 12 THEN
    RAISE EXCEPTION 'Enerji yetersiz. Besle veya dinlenerek enerji topla.';
  END IF;

  IF r.initiator_id = uid THEN
    RAISE EXCEPTION 'Kendi başlattığın ritüeli sen onaylayamazsın';
  END IF;

  IF r.expires_at < now() THEN
    UPDATE public.joint_rituals SET status = 'expired' WHERE id = p_ritual_id;
    RAISE EXCEPTION 'Ritüel süresi doldu';
  END IF;

  PERFORM public._update_care_streak(r.pet_id);

  UPDATE public.pets SET
    energy = GREATEST(0, energy - 20),
    brain_size = LEAST(99, brain_size + 1),
    kinship = LEAST(100, kinship + 15),
    last_play_at = now(),
    last_care_at = now(),
    last_energy_tick = now()
  WHERE id = r.pet_id;

  xp_awarded := public._award_ritual_xp(r.pet_id, 5);
  streak_mult := public._streak_multiplier((SELECT care_streak FROM pets WHERE id = r.pet_id));

  UPDATE public.joint_rituals SET status = 'completed', completed_at = now()
  WHERE id = p_ritual_id;

  INSERT INTO public.care_logs (pet_id, user_id, action_type, stat_gained)
  VALUES (r.pet_id, uid, 'play', 'Birlikte oynadınız! -20 Enerji · +' || xp_awarded || ' XP (Seri x' || streak_mult || ')');

  RETURN public.sync_pet_ritual_state(r.pet_id);
END;
$$;

-- Senkron: enerji tick + ihmal
CREATE OR REPLACE FUNCTION public.sync_pet_ritual_state(p_pet_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p public.pets;
  pending_ritual RECORD;
BEGIN
  PERFORM public._assert_pet_owner(p_pet_id);
  PERFORM public.apply_pet_neglect_if_needed(p_pet_id);
  PERFORM public.apply_pet_energy_tick(p_pet_id);

  SELECT * INTO p FROM public.pets WHERE id = p_pet_id;
  p := public._reset_daily_xp_if_needed(p);

  UPDATE public.joint_rituals SET status = 'expired'
  WHERE pet_id = p_pet_id AND status = 'pending' AND expires_at < now();

  SELECT jr.*, pr.username AS initiator_username
  INTO pending_ritual
  FROM public.joint_rituals jr
  JOIN public.profiles pr ON pr.id = jr.initiator_id
  WHERE jr.pet_id = p_pet_id AND jr.status = 'pending'
  ORDER BY jr.created_at DESC
  LIMIT 1;

  RETURN jsonb_build_object(
    'last_feed_at', p.last_feed_at,
    'last_clean_at', p.last_clean_at,
    'last_pet_at', p.last_pet_at,
    'last_play_at', p.last_play_at,
    'last_care_at', p.last_care_at,
    'care_streak', p.care_streak,
    'daily_xp_earned', p.daily_xp_earned,
    'daily_xp_cap', 8,
    'energy', p.energy,
    'energy_regen_per_hour', 5,
    'pending_joint_play', CASE WHEN pending_ritual.id IS NOT NULL THEN jsonb_build_object(
      'id', pending_ritual.id,
      'initiator_id', pending_ritual.initiator_id,
      'initiator_username', pending_ritual.initiator_username,
      'created_at', pending_ritual.created_at,
      'expires_at', pending_ritual.expires_at,
      'is_initiator', pending_ritual.initiator_id = auth.uid(),
      'can_confirm', pending_ritual.initiator_id <> auth.uid()
    ) ELSE NULL END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_pet_energy_tick(UUID) TO authenticated;

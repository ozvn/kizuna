-- Makro Ritüel Oyun Döngüsü
-- Supabase SQL Editor'de çalıştırın.

-- ─── Pet ritüel durumu ───
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS last_feed_at TIMESTAMPTZ;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS last_clean_at TIMESTAMPTZ;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS last_pet_at TIMESTAMPTZ;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS last_play_at TIMESTAMPTZ;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS last_care_at TIMESTAMPTZ;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS care_streak INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS streak_last_date DATE;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS daily_xp_earned INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS daily_xp_date DATE;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS neglect_decay_at TIMESTAMPTZ;

-- ─── Ortak ritüel (Birlikte Oyna) ───
CREATE TABLE IF NOT EXISTS public.joint_rituals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  action_type VARCHAR(30) NOT NULL DEFAULT 'play',
  initiator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '24 hours'),
  CONSTRAINT joint_rituals_status_check CHECK (status IN ('pending', 'completed', 'cancelled', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_joint_rituals_pet_status ON public.joint_rituals(pet_id, status);

ALTER TABLE public.joint_rituals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pet sahipleri ortak ritüelleri görebilir" ON public.joint_rituals;
CREATE POLICY "Pet sahipleri ortak ritüelleri görebilir" ON public.joint_rituals
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.pet_id = joint_rituals.pet_id
    )
  );

-- Realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.joint_rituals;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Sabitler ───
-- Besle/Temizle: 12 saat | Sev/Birlikte Oyna: 24 saat
-- Günlük temel XP tavanı: 8 | İhmal eşiği: 36 saat

CREATE OR REPLACE FUNCTION public._assert_pet_owner(p_pet_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND pet_id = p_pet_id
  ) THEN
    RAISE EXCEPTION 'Bu pete erişim yetkiniz yok';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public._reset_daily_xp_if_needed(p_pet public.pets)
RETURNS public.pets
LANGUAGE plpgsql
AS $$
DECLARE
  today date := (timezone('utc', now()))::date;
BEGIN
  IF p_pet.daily_xp_date IS DISTINCT FROM today THEN
    UPDATE public.pets SET daily_xp_earned = 0, daily_xp_date = today
    WHERE id = p_pet.id
    RETURNING * INTO p_pet;
  END IF;
  RETURN p_pet;
END;
$$;

CREATE OR REPLACE FUNCTION public._streak_multiplier(p_streak INTEGER)
RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_streak >= 15 THEN 3.0
    WHEN p_streak >= 7 THEN 2.0
    WHEN p_streak >= 3 THEN 1.5
    ELSE 1.0
  END;
$$;

CREATE OR REPLACE FUNCTION public._streak_bonus_xp(p_streak INTEGER)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_streak >= 15 THEN 15
    WHEN p_streak >= 7 THEN 8
    WHEN p_streak >= 3 THEN 3
    ELSE 0
  END;
$$;

CREATE OR REPLACE FUNCTION public._streak_bonus_spirit(p_streak INTEGER)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_streak >= 15 THEN 2
    WHEN p_streak >= 7 THEN 1
    ELSE 0
  END;
$$;

CREATE OR REPLACE FUNCTION public._apply_xp_and_level(
  p_pet_id UUID,
  p_xp_gain INTEGER,
  p_spirit_bonus INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_xp INTEGER;
  new_level INTEGER;
  new_spirit INTEGER;
  xp_needed INTEGER;
BEGIN
  UPDATE public.pets SET xp = xp + p_xp_gain
  WHERE id = p_pet_id
  RETURNING xp, level, spirit_points INTO new_xp, new_level, new_spirit;

  new_spirit := new_spirit + p_spirit_bonus;
  xp_needed := new_level * 50;

  WHILE new_xp >= xp_needed LOOP
    new_xp := new_xp - xp_needed;
    new_level := new_level + 1;
    IF new_level % 3 = 0 THEN
      new_spirit := new_spirit + 1;
    END IF;
    xp_needed := new_level * 50;
  END LOOP;

  UPDATE public.pets SET
    xp = new_xp,
    level = new_level,
    spirit_points = new_spirit,
    evolution_stage = CASE
      WHEN new_level >= 15 THEN 3
      WHEN new_level >= 5 THEN 2
      ELSE 1
    END
  WHERE id = p_pet_id;
END;
$$;

CREATE OR REPLACE FUNCTION public._update_care_streak(p_pet_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p public.pets;
  today date := (timezone('utc', now()))::date;
  new_streak INTEGER;
BEGIN
  SELECT * INTO p FROM public.pets WHERE id = p_pet_id FOR UPDATE;

  IF p.streak_last_date IS NULL THEN
    new_streak := 1;
  ELSIF p.streak_last_date = today THEN
    new_streak := p.care_streak;
  ELSIF p.streak_last_date = today - 1 THEN
    new_streak := p.care_streak + 1;
  ELSE
    new_streak := 1;
  END IF;

  UPDATE public.pets SET care_streak = new_streak, streak_last_date = today
  WHERE id = p_pet_id;

  RETURN new_streak;
END;
$$;

CREATE OR REPLACE FUNCTION public._award_ritual_xp(
  p_pet_id UUID,
  p_base_xp INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p public.pets;
  streak INTEGER;
  multiplier NUMERIC;
  bonus_xp INTEGER;
  capped_base INTEGER;
  total_xp INTEGER;
  spirit_bonus INTEGER;
  daily_cap CONSTANT INTEGER := 8;
BEGIN
  SELECT * INTO p FROM public.pets WHERE id = p_pet_id FOR UPDATE;
  p := public._reset_daily_xp_if_needed(p);

  capped_base := LEAST(p_base_xp, GREATEST(0, daily_cap - p.daily_xp_earned));
  streak := p.care_streak;
  multiplier := public._streak_multiplier(streak);
  bonus_xp := public._streak_bonus_xp(streak);
  spirit_bonus := public._streak_bonus_spirit(streak);

  total_xp := FLOOR((capped_base * multiplier)::numeric)::integer + bonus_xp;

  UPDATE public.pets SET daily_xp_earned = daily_xp_earned + capped_base
  WHERE id = p_pet_id;

  PERFORM public._apply_xp_and_level(p_pet_id, total_xp, spirit_bonus);

  RETURN total_xp;
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_pet_neglect_if_needed(p_pet_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p public.pets;
  reference_ts TIMESTAMPTZ;
BEGIN
  PERFORM public._assert_pet_owner(p_pet_id);

  SELECT * INTO p FROM public.pets WHERE id = p_pet_id FOR UPDATE;
  reference_ts := COALESCE(p.last_care_at, p.created_at);

  IF now() - reference_ts < interval '36 hours' THEN
    RETURN FALSE;
  END IF;

  IF p.neglect_decay_at IS NOT NULL AND p.neglect_decay_at >= reference_ts THEN
    RETURN FALSE;
  END IF;

  UPDATE public.pets SET
    hunger = GREATEST(8, hunger - 35),
    cleanliness = GREATEST(8, cleanliness - 35),
    kinship = GREATEST(10, kinship - 15),
    energy = GREATEST(8, energy - 25),
    care_streak = 0,
    streak_last_date = NULL,
    neglect_decay_at = now()
  WHERE id = p_pet_id;

  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public._assert_cooldown(
  p_last_at TIMESTAMPTZ,
  p_hours INTEGER,
  p_action_label TEXT
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_last_at IS NOT NULL AND now() < p_last_at + (p_hours || ' hours')::interval THEN
    RAISE EXCEPTION 'COOLDOWN:%', EXTRACT(EPOCH FROM (p_last_at + (p_hours || ' hours')::interval - now()))::bigint;
  END IF;
END;
$$;

-- Senkronize: ihmal + durum JSON
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

-- Besle (12s)
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

  SELECT * INTO p FROM public.pets WHERE id = p_pet_id FOR UPDATE;
  PERFORM public._assert_cooldown(p.last_feed_at, 12, 'Besle');

  PERFORM public._update_care_streak(p_pet_id);

  UPDATE public.pets SET
    hunger = LEAST(100, hunger + 25),
    kinship = LEAST(100, kinship + 4),
    last_feed_at = now(),
    last_care_at = now()
  WHERE id = p_pet_id;

  xp_awarded := public._award_ritual_xp(p_pet_id, 3);

  INSERT INTO public.care_logs (pet_id, user_id, action_type, stat_gained)
  VALUES (p_pet_id, uid, 'feed', '+25 Açlık · +' || xp_awarded || ' XP (Seri x' || public._streak_multiplier((SELECT care_streak FROM pets WHERE id = p_pet_id)) || ')');

  RETURN public.sync_pet_ritual_state(p_pet_id);
END;
$$;

-- Temizle (12s)
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

  SELECT * INTO p FROM public.pets WHERE id = p_pet_id FOR UPDATE;
  PERFORM public._assert_cooldown(p.last_clean_at, 12, 'Temizle');

  PERFORM public._update_care_streak(p_pet_id);

  UPDATE public.pets SET
    cleanliness = LEAST(100, cleanliness + 30),
    kinship = LEAST(100, kinship + 3),
    last_clean_at = now(),
    last_care_at = now()
  WHERE id = p_pet_id;

  xp_awarded := public._award_ritual_xp(p_pet_id, 3);

  INSERT INTO public.care_logs (pet_id, user_id, action_type, stat_gained)
  VALUES (p_pet_id, uid, 'clean', '+30 Temizlik · +' || xp_awarded || ' XP');

  RETURN public.sync_pet_ritual_state(p_pet_id);
END;
$$;

-- Sev (24s)
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

  SELECT * INTO p FROM public.pets WHERE id = p_pet_id FOR UPDATE;
  PERFORM public._assert_cooldown(p.last_pet_at, 24, 'Sev');

  PERFORM public._update_care_streak(p_pet_id);

  UPDATE public.pets SET
    kinship = LEAST(100, kinship + 10),
    last_pet_at = now(),
    last_care_at = now()
  WHERE id = p_pet_id;

  xp_awarded := public._award_ritual_xp(p_pet_id, 2);

  INSERT INTO public.care_logs (pet_id, user_id, action_type, stat_gained)
  VALUES (p_pet_id, uid, 'pet', '+10 Yakınlık · +' || xp_awarded || ' XP');

  RETURN public.sync_pet_ritual_state(p_pet_id);
END;
$$;

-- Birlikte Oyna başlat (24s, ortak onay)
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

  SELECT * INTO p FROM public.pets WHERE id = p_pet_id FOR UPDATE;
  PERFORM public._assert_cooldown(p.last_play_at, 24, 'Birlikte Oyna');

  SELECT * INTO existing FROM public.joint_rituals
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

  INSERT INTO public.care_logs (pet_id, user_id, action_type, stat_gained)
  VALUES (p_pet_id, uid, 'play', 'Birlikte oyun ritüeli başlatıldı — partner onayı bekleniyor');

  RETURN public.sync_pet_ritual_state(p_pet_id);
END;
$$;

-- Birlikte Oyna onayla
CREATE OR REPLACE FUNCTION public.confirm_joint_play(p_ritual_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  r RECORD;
  xp_awarded INTEGER;
  streak_mult NUMERIC;
BEGIN
  SELECT jr.* INTO r
  FROM public.joint_rituals jr
  WHERE jr.id = p_ritual_id AND jr.status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bekleyen ritüel bulunamadı';
  END IF;

  PERFORM public._assert_pet_owner(r.pet_id);

  IF r.initiator_id = uid THEN
    RAISE EXCEPTION 'Kendi başlattığın ritüeli sen onaylayamazsın';
  END IF;

  IF r.expires_at < now() THEN
    UPDATE public.joint_rituals SET status = 'expired' WHERE id = p_ritual_id;
    RAISE EXCEPTION 'Ritüel süresi doldu';
  END IF;

  PERFORM public._update_care_streak(r.pet_id);

  UPDATE public.pets SET
    energy = GREATEST(0, energy - 8),
    brain_size = LEAST(99, brain_size + 1),
    kinship = LEAST(100, kinship + 15),
    last_play_at = now(),
    last_care_at = now()
  WHERE id = r.pet_id;

  xp_awarded := public._award_ritual_xp(r.pet_id, 5);
  streak_mult := public._streak_multiplier((SELECT care_streak FROM pets WHERE id = r.pet_id));

  UPDATE public.joint_rituals SET status = 'completed', completed_at = now()
  WHERE id = p_ritual_id;

  INSERT INTO public.care_logs (pet_id, user_id, action_type, stat_gained)
  VALUES (r.pet_id, uid, 'play', 'Birlikte oynadınız! +' || xp_awarded || ' XP (Seri x' || streak_mult || ')');

  RETURN public.sync_pet_ritual_state(r.pet_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_pet_ritual_state(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.perform_ritual_feed(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.perform_ritual_clean(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.perform_ritual_pet(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.initiate_joint_play(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_joint_play(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_pet_neglect_if_needed(UUID) TO authenticated;

-- Eski atomik fonksiyonları yeni sisteme yönlendir (geriye uyumluluk)
CREATE OR REPLACE FUNCTION public.feed_pet_atomic(target_pet_id UUID, acting_user_id UUID)
RETURNS void AS $$ BEGIN PERFORM public.perform_ritual_feed(target_pet_id); END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.clean_pet_atomic(target_pet_id UUID, acting_user_id UUID)
RETURNS void AS $$ BEGIN PERFORM public.perform_ritual_clean(target_pet_id); END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.pet_pet_atomic(target_pet_id UUID, acting_user_id UUID)
RETURNS void AS $$ BEGIN PERFORM public.perform_ritual_pet(target_pet_id); END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.play_pet_atomic(target_pet_id UUID, acting_user_id UUID)
RETURNS void AS $$ BEGIN PERFORM public.initiate_joint_play(target_pet_id); END; $$ LANGUAGE plpgsql SECURITY DEFINER;

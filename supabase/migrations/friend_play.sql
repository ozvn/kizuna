-- Friend play: all 4 owners (both couples) must approve. Rewards energy + XP on completion.
-- Run once in Supabase SQL Editor.

ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS last_friend_play_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.friend_play_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_a_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  pet_b_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  initiated_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'declined', 'expired', 'cancelled')),
  approvals UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '24 hours'),
  completed_at TIMESTAMPTZ,
  CONSTRAINT friend_play_no_self CHECK (pet_a_id <> pet_b_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_friend_play_pending_pair
  ON public.friend_play_sessions (LEAST(pet_a_id, pet_b_id), GREATEST(pet_a_id, pet_b_id))
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_friend_play_pets
  ON public.friend_play_sessions(pet_a_id, pet_b_id, status);

ALTER TABLE public.friend_play_sessions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public._pets_are_friends(a UUID, b UUID)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pet_friendships f
    WHERE f.pet_low_id = LEAST(a, b) AND f.pet_high_id = GREATEST(a, b)
  );
$$;

CREATE OR REPLACE FUNCTION public._friend_play_owner_ids(p_pet_a UUID, p_pet_b UUID)
RETURNS UUID[]
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(array_agg(DISTINCT pr.id ORDER BY pr.id), '{}')
  FROM public.profiles pr
  WHERE pr.pet_id IN (p_pet_a, p_pet_b);
$$;

CREATE OR REPLACE FUNCTION public._user_in_friend_play_session(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.friend_play_sessions s
    JOIN public.profiles pr ON pr.id = auth.uid()
    WHERE s.id = p_session_id
      AND pr.pet_id IN (s.pet_a_id, s.pet_b_id)
  );
$$;

CREATE OR REPLACE FUNCTION public._complete_friend_play_session(p_session_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s public.friend_play_sessions;
  pet_id UUID;
  xp_a INTEGER;
  xp_b INTEGER;
  streak_mult NUMERIC;
BEGIN
  SELECT * INTO s FROM public.friend_play_sessions WHERE id = p_session_id FOR UPDATE;

  FOREACH pet_id IN ARRAY ARRAY[s.pet_a_id, s.pet_b_id]
  LOOP
    PERFORM public.apply_pet_neglect_if_needed(pet_id);
    PERFORM public.apply_pet_energy_tick(pet_id);
    PERFORM public._update_care_streak(pet_id);

    UPDATE public.pets SET
      energy = LEAST(100, energy + 25),
      kinship = LEAST(100, kinship + 10),
      last_friend_play_at = now(),
      last_care_at = now(),
      last_energy_tick = now()
    WHERE id = pet_id;
  END LOOP;

  xp_a := public._award_ritual_xp(s.pet_a_id, 8);
  xp_b := public._award_ritual_xp(s.pet_b_id, 8);
  streak_mult := public._streak_multiplier(
    (SELECT care_streak FROM public.pets WHERE id = s.pet_a_id)
  );

  UPDATE public.friend_play_sessions
  SET status = 'completed', completed_at = now()
  WHERE id = p_session_id;

  INSERT INTO public.care_logs (pet_id, user_id, action_type, stat_gained)
  VALUES
    (s.pet_a_id, s.initiated_by, 'friend_play',
     'Played with a friend! +25 Energy · +' || xp_a || ' XP (Streak x' || streak_mult || ')'),
    (s.pet_b_id, s.initiated_by, 'friend_play',
     'Played with a friend! +25 Energy · +' || xp_b || ' XP');
END;
$$;

-- Extend social state with pending friend play
CREATE OR REPLACE FUNCTION public.get_pet_social_state(p_pet_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  owners UUID[];
  friends JSONB;
  outgoing JSONB;
  incoming JSONB;
  pending_play JSONB;
  fp RECORD;
  friend_pet_id UUID;
  friend_pet_name TEXT;
  required_owners UUID[];
  approval_count INT;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  IF NOT public._user_owns_pet(p_pet_id) THEN
    RAISE EXCEPTION 'You do not have access to this pet';
  END IF;

  owners := public._pet_owner_ids(p_pet_id);

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'pet_id', fp.id,
    'pet_name', fp.name,
    'level', fp.level,
    'care_streak', COALESCE(fp.care_streak, 0),
    'score', public._pet_leaderboard_score(fp)
  ) ORDER BY public._pet_leaderboard_score(fp) DESC), '[]'::jsonb)
  INTO friends
  FROM public.pet_friendships f
  JOIN public.pets fp ON fp.id = CASE
    WHEN f.pet_low_id = p_pet_id THEN f.pet_high_id
    ELSE f.pet_low_id
  END
  WHERE f.pet_low_id = p_pet_id OR f.pet_high_id = p_pet_id;

  SELECT jsonb_build_object(
    'id', r.id,
    'target_pet_id', tp.id,
    'target_pet_name', tp.name,
    'status', r.status,
    'sender_approvals', r.sender_approvals,
    'receiver_approvals', r.receiver_approvals,
    'owners', owners,
    'my_approved', uid = ANY(r.sender_approvals),
    'needs_my_sender_approval', r.status = 'awaiting_sender' AND NOT (uid = ANY(r.sender_approvals)),
    'expires_at', r.expires_at
  )
  INTO outgoing
  FROM public.pet_friend_requests r
  JOIN public.pets tp ON tp.id = r.target_pet_id
  WHERE r.requester_pet_id = p_pet_id
    AND r.status IN ('awaiting_sender', 'awaiting_receiver')
  ORDER BY r.created_at DESC
  LIMIT 1;

  SELECT jsonb_build_object(
    'id', r.id,
    'requester_pet_id', rp.id,
    'requester_pet_name', rp.name,
    'status', r.status,
    'sender_approvals', r.sender_approvals,
    'receiver_approvals', r.receiver_approvals,
    'owners', public._pet_owner_ids(r.target_pet_id),
    'my_approved', uid = ANY(r.receiver_approvals),
    'needs_my_receiver_approval', r.status = 'awaiting_receiver' AND NOT (uid = ANY(r.receiver_approvals)),
    'expires_at', r.expires_at
  )
  INTO incoming
  FROM public.pet_friend_requests r
  JOIN public.pets rp ON rp.id = r.requester_pet_id
  WHERE r.target_pet_id = p_pet_id
    AND r.status IN ('awaiting_sender', 'awaiting_receiver')
  ORDER BY r.created_at DESC
  LIMIT 1;

  UPDATE public.friend_play_sessions SET status = 'expired'
  WHERE status = 'pending' AND expires_at < now()
    AND (pet_a_id = p_pet_id OR pet_b_id = p_pet_id);

  SELECT s.*, pa.name AS pet_a_name, pb.name AS pet_b_name
  INTO fp
  FROM public.friend_play_sessions s
  JOIN public.pets pa ON pa.id = s.pet_a_id
  JOIN public.pets pb ON pb.id = s.pet_b_id
  WHERE s.status = 'pending' AND s.expires_at > now()
    AND (s.pet_a_id = p_pet_id OR s.pet_b_id = p_pet_id)
  ORDER BY s.created_at DESC
  LIMIT 1;

  IF fp.id IS NOT NULL THEN
    friend_pet_id := CASE WHEN fp.pet_a_id = p_pet_id THEN fp.pet_b_id ELSE fp.pet_a_id END;
    friend_pet_name := CASE WHEN fp.pet_a_id = p_pet_id THEN fp.pet_b_name ELSE fp.pet_a_name END;
    required_owners := public._friend_play_owner_ids(fp.pet_a_id, fp.pet_b_id);
    approval_count := (
      SELECT COUNT(*)::int FROM unnest(required_owners) o WHERE o = ANY(fp.approvals)
    );

    pending_play := jsonb_build_object(
      'id', fp.id,
      'pet_a_id', fp.pet_a_id,
      'pet_b_id', fp.pet_b_id,
      'pet_a_name', fp.pet_a_name,
      'pet_b_name', fp.pet_b_name,
      'friend_pet_id', friend_pet_id,
      'friend_pet_name', friend_pet_name,
      'initiated_by', fp.initiated_by,
      'approvals', fp.approvals,
      'approval_count', approval_count,
      'required_approvals', GREATEST(COALESCE(array_length(required_owners, 1), 0), 4),
      'needs_my_approval', NOT (uid = ANY(fp.approvals)),
      'i_initiated', fp.initiated_by = uid,
      'expires_at', fp.expires_at
    );
  END IF;

  RETURN jsonb_build_object(
    'friends', friends,
    'outgoing_request', outgoing,
    'incoming_request', incoming,
    'pending_friend_play', pending_play,
    'owner_ids', owners
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.initiate_friend_play(p_friend_pet_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  my_pet_id UUID;
  p public.pets;
  friend_pet public.pets;
  new_id UUID;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  SELECT pet_id INTO my_pet_id FROM public.profiles WHERE id = uid;
  IF my_pet_id IS NULL THEN
    RAISE EXCEPTION 'You do not have a pet yet';
  END IF;

  IF p_friend_pet_id = my_pet_id THEN
    RAISE EXCEPTION 'You cannot play with your own pet';
  END IF;

  IF NOT public._pets_are_friends(my_pet_id, p_friend_pet_id) THEN
    RAISE EXCEPTION 'You are not friends with this pet';
  END IF;

  IF COALESCE(array_length(public._friend_play_owner_ids(my_pet_id, p_friend_pet_id), 1), 0) < 4 THEN
    RAISE EXCEPTION 'Both pets need matched couples to play together';
  END IF;

  SELECT * INTO friend_pet FROM public.pets WHERE id = p_friend_pet_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pet not found';
  END IF;

  PERFORM public.apply_pet_neglect_if_needed(my_pet_id);
  PERFORM public.apply_pet_energy_tick(my_pet_id);

  SELECT * INTO p FROM public.pets WHERE id = my_pet_id FOR UPDATE;
  IF p.last_friend_play_at IS NOT NULL AND p.last_friend_play_at > now() - interval '24 hours' THEN
    RAISE EXCEPTION 'Friend play is on cooldown. Try again later.';
  END IF;

  SELECT * INTO p FROM public.pets WHERE id = p_friend_pet_id FOR UPDATE;
  IF p.last_friend_play_at IS NOT NULL AND p.last_friend_play_at > now() - interval '24 hours' THEN
    RAISE EXCEPTION 'This friend pet is on play cooldown';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.friend_play_sessions
    WHERE status = 'pending'
      AND expires_at > now()
      AND (
        (pet_a_id = my_pet_id AND pet_b_id = p_friend_pet_id)
        OR (pet_a_id = p_friend_pet_id AND pet_b_id = my_pet_id)
      )
  ) THEN
    RAISE EXCEPTION 'A friend play session is already pending';
  END IF;

  INSERT INTO public.friend_play_sessions (pet_a_id, pet_b_id, initiated_by, approvals)
  VALUES (my_pet_id, p_friend_pet_id, uid, ARRAY[uid])
  RETURNING id INTO new_id;

  RETURN public.get_pet_social_state(my_pet_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_friend_play(p_session_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  s public.friend_play_sessions;
  my_pet_id UUID;
  required_owners UUID[];
  approval_count INT;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  SELECT pet_id INTO my_pet_id FROM public.profiles WHERE id = uid;

  SELECT * INTO s FROM public.friend_play_sessions WHERE id = p_session_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend play session not found';
  END IF;

  IF s.status <> 'pending' THEN
    RAISE EXCEPTION 'This friend play session is no longer pending';
  END IF;

  IF s.expires_at < now() THEN
    UPDATE public.friend_play_sessions SET status = 'expired' WHERE id = p_session_id;
    RAISE EXCEPTION 'Friend play session expired';
  END IF;

  IF NOT public._user_in_friend_play_session(p_session_id) THEN
    RAISE EXCEPTION 'You do not have access to this session';
  END IF;

  IF uid = ANY(s.approvals) THEN
    RAISE EXCEPTION 'You already approved this session';
  END IF;

  UPDATE public.friend_play_sessions
  SET approvals = array_append(approvals, uid)
  WHERE id = p_session_id
  RETURNING * INTO s;

  required_owners := public._friend_play_owner_ids(s.pet_a_id, s.pet_b_id);
  approval_count := (
    SELECT COUNT(*)::int FROM unnest(required_owners) o WHERE o = ANY(s.approvals)
  );

  IF approval_count >= GREATEST(COALESCE(array_length(required_owners, 1), 0), 4)
     OR approval_count >= 4 THEN
    PERFORM public._complete_friend_play_session(p_session_id);
  END IF;

  RETURN public.get_pet_social_state(my_pet_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.decline_friend_play(p_session_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  my_pet_id UUID;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  IF NOT public._user_in_friend_play_session(p_session_id) THEN
    RAISE EXCEPTION 'You do not have access to this session';
  END IF;

  UPDATE public.friend_play_sessions SET status = 'declined'
  WHERE id = p_session_id AND status = 'pending';

  SELECT pet_id INTO my_pet_id FROM public.profiles WHERE id = uid;
  RETURN public.get_pet_social_state(my_pet_id);
END;
$$;

DROP POLICY IF EXISTS "Friend play participants can view sessions" ON public.friend_play_sessions;
CREATE POLICY "Friend play participants can view sessions" ON public.friend_play_sessions
  FOR SELECT TO authenticated USING (
    public._user_owns_pet(pet_a_id) OR public._user_owns_pet(pet_b_id)
  );

REVOKE ALL ON FUNCTION public.initiate_friend_play(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirm_friend_play(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.decline_friend_play(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.initiate_friend_play(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_friend_play(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decline_friend_play(UUID) TO authenticated;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_play_sessions;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

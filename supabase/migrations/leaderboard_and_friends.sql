-- Leaderboard + dual-partner pet friendship system
-- Run once in Supabase SQL Editor.

-- ─── Friendships (active) ───
CREATE TABLE IF NOT EXISTS public.pet_friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_low_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  pet_high_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT pet_friendships_order CHECK (pet_low_id < pet_high_id),
  UNIQUE (pet_low_id, pet_high_id)
);

CREATE INDEX IF NOT EXISTS idx_pet_friendships_low ON public.pet_friendships(pet_low_id);
CREATE INDEX IF NOT EXISTS idx_pet_friendships_high ON public.pet_friendships(pet_high_id);

-- ─── Friend requests (dual approval on both couples) ───
CREATE TABLE IF NOT EXISTS public.pet_friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  target_pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  initiated_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'awaiting_sender'
    CHECK (status IN ('awaiting_sender', 'awaiting_receiver', 'accepted', 'declined', 'cancelled', 'expired')),
  sender_approvals UUID[] NOT NULL DEFAULT '{}',
  receiver_approvals UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '7 days'),
  CONSTRAINT pet_friend_no_self CHECK (requester_pet_id <> target_pet_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pet_friend_requests_pending_pair
  ON public.pet_friend_requests (requester_pet_id, target_pet_id)
  WHERE status IN ('awaiting_sender', 'awaiting_receiver');

CREATE INDEX IF NOT EXISTS idx_pet_friend_requests_target
  ON public.pet_friend_requests(target_pet_id, status);

ALTER TABLE public.pet_friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_friend_requests ENABLE ROW LEVEL SECURITY;

-- ─── Helpers ───
CREATE OR REPLACE FUNCTION public._user_pet_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT pet_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public._pet_owner_ids(p_pet_id UUID)
RETURNS UUID[]
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(array_agg(id ORDER BY id), '{}')
  FROM public.profiles
  WHERE pet_id = p_pet_id;
$$;

CREATE OR REPLACE FUNCTION public._user_owns_pet(p_pet_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND pet_id = p_pet_id
  );
$$;

CREATE OR REPLACE FUNCTION public._friendship_pair_ids(a UUID, b UUID)
RETURNS TABLE(pet_low_id UUID, pet_high_id UUID)
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT LEAST(a, b), GREATEST(a, b);
$$;

CREATE OR REPLACE FUNCTION public._pet_leaderboard_score(p public.pets)
RETURNS BIGINT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (p.level::bigint * 1000)
       + p.xp::bigint
       + COALESCE(p.care_streak, 0)::bigint * 25
       + COALESCE(p.spirit_points, 0)::bigint * 10;
$$;

-- ─── Leaderboard ───
CREATE OR REPLACE FUNCTION public.get_pet_leaderboard(p_limit INTEGER DEFAULT 25)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  my_pet_id UUID;
  result JSONB;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  SELECT pet_id INTO my_pet_id FROM public.profiles WHERE id = uid;

  SELECT COALESCE(jsonb_agg(row_data ORDER BY rank), '[]'::jsonb)
  INTO result
  FROM (
    SELECT
      ROW_NUMBER() OVER (ORDER BY public._pet_leaderboard_score(p) DESC, p.created_at ASC) AS rank,
      jsonb_build_object(
        'rank', ROW_NUMBER() OVER (ORDER BY public._pet_leaderboard_score(p) DESC, p.created_at ASC),
        'pet_id', p.id,
        'pet_name', p.name,
        'level', p.level,
        'xp', p.xp,
        'care_streak', COALESCE(p.care_streak, 0),
        'spirit_points', COALESCE(p.spirit_points, 0),
        'score', public._pet_leaderboard_score(p),
        'is_mine', p.id = my_pet_id
      ) AS row_data
    FROM public.pets p
    WHERE EXISTS (
      SELECT 1 FROM public.profiles pr
      WHERE pr.pet_id = p.id AND pr.partner_id IS NOT NULL
    )
    ORDER BY public._pet_leaderboard_score(p) DESC, p.created_at ASC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 25), 50))
  ) ranked;

  RETURN jsonb_build_object('entries', result, 'my_pet_id', my_pet_id);
END;
$$;

-- ─── Social state for current pet ───
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
    'partner_approved', owners[2] IS NOT NULL AND owners[2] = ANY(r.sender_approvals)
      OR owners[1] IS NOT NULL AND owners[1] = ANY(r.sender_approvals) AND owners[1] <> uid,
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

  RETURN jsonb_build_object(
    'friends', friends,
    'outgoing_request', outgoing,
    'incoming_request', incoming,
    'owner_ids', owners
  );
END;
$$;

-- ─── Initiate friend request (initiator auto-approves send side) ───
CREATE OR REPLACE FUNCTION public.initiate_pet_friend_request(p_target_pet_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  my_pet_id UUID;
  target_pet_id UUID;
  clean_name TEXT;
  new_id UUID;
  owners UUID[];
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  SELECT pet_id INTO my_pet_id FROM public.profiles WHERE id = uid;
  IF my_pet_id IS NULL THEN
    RAISE EXCEPTION 'You do not have a pet yet';
  END IF;

  clean_name := trim(p_target_pet_name);
  IF length(clean_name) < 2 THEN
    RAISE EXCEPTION 'Pet name must be at least 2 characters';
  END IF;

  SELECT id INTO target_pet_id
  FROM public.pets
  WHERE lower(name) = lower(clean_name)
  LIMIT 1;

  IF target_pet_id IS NULL THEN
    RAISE EXCEPTION 'Pet not found';
  END IF;

  IF target_pet_id = my_pet_id THEN
    RAISE EXCEPTION 'You cannot friend your own pet';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.pet_friendships f
    WHERE (f.pet_low_id = my_pet_id AND f.pet_high_id = target_pet_id)
       OR (f.pet_low_id = target_pet_id AND f.pet_high_id = my_pet_id)
  ) THEN
    RAISE EXCEPTION 'Already friends with this pet';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.pet_friend_requests
    WHERE requester_pet_id = my_pet_id
      AND target_pet_id = target_pet_id
      AND status IN ('awaiting_sender', 'awaiting_receiver')
  ) THEN
    RAISE EXCEPTION 'A friend request is already pending';
  END IF;

  owners := public._pet_owner_ids(my_pet_id);

  INSERT INTO public.pet_friend_requests (
    requester_pet_id, target_pet_id, initiated_by, status, sender_approvals
  )
  VALUES (my_pet_id, target_pet_id, uid, 'awaiting_sender', ARRAY[uid])
  RETURNING id INTO new_id;

  RETURN public.get_pet_social_state(my_pet_id);
END;
$$;

-- ─── Sender couple: partner confirms sending ───
CREATE OR REPLACE FUNCTION public.confirm_friend_request_sender(p_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  r public.pet_friend_requests;
  owners UUID[];
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  SELECT * INTO r FROM public.pet_friend_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend request not found';
  END IF;

  IF r.status <> 'awaiting_sender' THEN
    RAISE EXCEPTION 'This request is not awaiting sender approval';
  END IF;

  IF r.expires_at < now() THEN
    UPDATE public.pet_friend_requests SET status = 'expired' WHERE id = p_request_id;
    RAISE EXCEPTION 'Friend request expired';
  END IF;

  IF NOT public._user_owns_pet(r.requester_pet_id) THEN
    RAISE EXCEPTION 'You do not have access to this pet';
  END IF;

  owners := public._pet_owner_ids(r.requester_pet_id);

  IF uid = ANY(r.sender_approvals) THEN
    RAISE EXCEPTION 'You already approved this request';
  END IF;

  UPDATE public.pet_friend_requests SET
    sender_approvals = array_append(sender_approvals, uid)
  WHERE id = p_request_id
  RETURNING * INTO r;

  owners := public._pet_owner_ids(r.requester_pet_id);

  IF (SELECT COUNT(*)::int FROM unnest(owners) o WHERE o = ANY(r.sender_approvals)) >= 2 THEN
    UPDATE public.pet_friend_requests SET status = 'awaiting_receiver' WHERE id = p_request_id;
  END IF;

  RETURN public.get_pet_social_state(r.requester_pet_id);
END;
$$;

-- ─── Receiver couple: each partner confirms accepting ───
CREATE OR REPLACE FUNCTION public.confirm_friend_request_receiver(p_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  r public.pet_friend_requests;
  owners UUID[];
  low_id UUID;
  high_id UUID;
  approval_count INT;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  SELECT * INTO r FROM public.pet_friend_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend request not found';
  END IF;

  IF r.status <> 'awaiting_receiver' THEN
    RAISE EXCEPTION 'This request is not awaiting receiver approval';
  END IF;

  IF r.expires_at < now() THEN
    UPDATE public.pet_friend_requests SET status = 'expired' WHERE id = p_request_id;
    RAISE EXCEPTION 'Friend request expired';
  END IF;

  IF NOT public._user_owns_pet(r.target_pet_id) THEN
    RAISE EXCEPTION 'You do not have access to this pet';
  END IF;

  owners := public._pet_owner_ids(r.target_pet_id);

  IF uid = ANY(r.receiver_approvals) THEN
    RAISE EXCEPTION 'You already approved this request';
  END IF;

  UPDATE public.pet_friend_requests SET
    receiver_approvals = array_append(receiver_approvals, uid)
  WHERE id = p_request_id
  RETURNING * INTO r;

  SELECT COUNT(*)::int INTO approval_count
  FROM unnest(owners) o
  WHERE o = ANY(r.receiver_approvals);

  IF approval_count >= GREATEST(array_length(owners, 1), 2) OR approval_count >= 2 THEN
    SELECT pet_low_id, pet_high_id INTO low_id, high_id
    FROM public._friendship_pair_ids(r.requester_pet_id, r.target_pet_id);

    INSERT INTO public.pet_friendships (pet_low_id, pet_high_id)
    VALUES (low_id, high_id)
    ON CONFLICT DO NOTHING;

    UPDATE public.pet_friend_requests SET status = 'accepted' WHERE id = p_request_id;
  END IF;

  RETURN public.get_pet_social_state(r.target_pet_id);
END;
$$;

-- ─── Decline / cancel ───
CREATE OR REPLACE FUNCTION public.decline_pet_friend_request(p_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  r public.pet_friend_requests;
  my_pet_id UUID;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  SELECT * INTO r FROM public.pet_friend_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend request not found';
  END IF;

  IF NOT (
    public._user_owns_pet(r.requester_pet_id) OR public._user_owns_pet(r.target_pet_id)
  ) THEN
    RAISE EXCEPTION 'You do not have access to this request';
  END IF;

  UPDATE public.pet_friend_requests SET status = 'declined' WHERE id = p_request_id;

  SELECT pet_id INTO my_pet_id FROM public.profiles WHERE id = uid;
  RETURN public.get_pet_social_state(my_pet_id);
END;
$$;

-- RLS
DROP POLICY IF EXISTS "Pet owners see friendships" ON public.pet_friendships;
CREATE POLICY "Pet owners see friendships" ON public.pet_friendships
  FOR SELECT TO authenticated USING (
    public._user_owns_pet(pet_low_id) OR public._user_owns_pet(pet_high_id)
  );

DROP POLICY IF EXISTS "Pet owners see friend requests" ON public.pet_friend_requests;
CREATE POLICY "Pet owners see friend requests" ON public.pet_friend_requests
  FOR SELECT TO authenticated USING (
    public._user_owns_pet(requester_pet_id) OR public._user_owns_pet(target_pet_id)
  );

REVOKE ALL ON FUNCTION public.get_pet_leaderboard(INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_pet_social_state(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.initiate_pet_friend_request(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirm_friend_request_sender(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirm_friend_request_receiver(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.decline_pet_friend_request(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_pet_leaderboard(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pet_social_state(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.initiate_pet_friend_request(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_friend_request_sender(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_friend_request_receiver(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decline_pet_friend_request(UUID) TO authenticated;

-- Realtime (optional)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.pet_friend_requests;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

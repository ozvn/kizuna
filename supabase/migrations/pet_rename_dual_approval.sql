-- Pet rename requires both owners to approve (dual approval).
-- Run once in Supabase SQL Editor (after unique_pet_names.sql).

CREATE TABLE IF NOT EXISTS public.pet_rename_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  proposed_name TEXT NOT NULL,
  initiated_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'expired')),
  approvals UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '7 days'),
  CONSTRAINT pet_rename_name_length CHECK (char_length(trim(proposed_name)) BETWEEN 2 AND 50)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pet_rename_pending_pet
  ON public.pet_rename_requests(pet_id)
  WHERE status = 'pending';

ALTER TABLE public.pet_rename_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pet owners see rename requests" ON public.pet_rename_requests;
CREATE POLICY "Pet owners see rename requests" ON public.pet_rename_requests
  FOR SELECT TO authenticated USING (public._user_owns_pet(pet_id));

CREATE OR REPLACE FUNCTION public._apply_pet_rename(p_pet_id UUID, p_new_name TEXT)
RETURNS public.pets
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated public.pets;
BEGIN
  UPDATE public.pets SET name = p_new_name WHERE id = p_pet_id RETURNING * INTO updated;
  RETURN updated;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_pet_rename_state(p_pet_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  owners UUID[];
  pending JSONB;
  r public.pet_rename_requests;
  approval_count INT;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  IF NOT public._user_owns_pet(p_pet_id) THEN
    RAISE EXCEPTION 'You do not have access to this pet';
  END IF;

  owners := public._pet_owner_ids(p_pet_id);

  UPDATE public.pet_rename_requests SET status = 'expired'
  WHERE pet_id = p_pet_id AND status = 'pending' AND expires_at < now();

  SELECT * INTO r
  FROM public.pet_rename_requests
  WHERE pet_id = p_pet_id AND status = 'pending' AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  IF r.id IS NOT NULL THEN
    approval_count := (
      SELECT COUNT(*)::int FROM unnest(owners) o WHERE o = ANY(r.approvals)
    );

    pending := jsonb_build_object(
      'id', r.id,
      'proposed_name', r.proposed_name,
      'initiated_by', r.initiated_by,
      'approvals', r.approvals,
      'approval_count', approval_count,
      'required_approvals', GREATEST(COALESCE(array_length(owners, 1), 0), 2),
      'needs_my_approval', NOT (uid = ANY(r.approvals)),
      'i_initiated', r.initiated_by = uid,
      'expires_at', r.expires_at
    );
  END IF;

  RETURN jsonb_build_object('pending_request', pending);
END;
$$;

CREATE OR REPLACE FUNCTION public.initiate_pet_rename(p_new_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  my_pet_id UUID;
  clean_name TEXT;
  existing public.pet_rename_requests;
  current_name TEXT;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  SELECT pet_id INTO my_pet_id FROM public.profiles WHERE id = uid;
  IF my_pet_id IS NULL THEN
    RAISE EXCEPTION 'You do not have a pet yet';
  END IF;

  IF NOT public._user_owns_pet(my_pet_id) THEN
    RAISE EXCEPTION 'You do not have access to this pet';
  END IF;

  clean_name := trim(p_new_name);
  IF length(clean_name) < 2 OR length(clean_name) > 50 THEN
    RAISE EXCEPTION 'Pet name must be 2–50 characters';
  END IF;

  SELECT name INTO current_name FROM public.pets WHERE id = my_pet_id;
  IF lower(trim(current_name)) = lower(clean_name) THEN
    RAISE EXCEPTION 'That is already your pet name';
  END IF;

  IF NOT public.is_pet_name_available(clean_name, my_pet_id) THEN
    RAISE EXCEPTION 'Pet name already taken';
  END IF;

  SELECT * INTO existing
  FROM public.pet_rename_requests
  WHERE pet_id = my_pet_id AND status = 'pending' AND expires_at > now()
  FOR UPDATE;

  IF FOUND THEN
    IF existing.initiated_by <> uid THEN
      RAISE EXCEPTION 'A rename request is already pending';
    END IF;

    UPDATE public.pet_rename_requests SET
      proposed_name = clean_name,
      approvals = ARRAY[uid],
      created_at = now(),
      expires_at = timezone('utc'::text, now()) + interval '7 days'
    WHERE id = existing.id;
  ELSE
    INSERT INTO public.pet_rename_requests (pet_id, proposed_name, initiated_by, approvals)
    VALUES (my_pet_id, clean_name, uid, ARRAY[uid]);
  END IF;

  RETURN public.get_pet_rename_state(my_pet_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_pet_rename(p_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  r public.pet_rename_requests;
  owners UUID[];
  approval_count INT;
  updated public.pets;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  SELECT * INTO r FROM public.pet_rename_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Rename request not found';
  END IF;

  IF r.status <> 'pending' THEN
    RAISE EXCEPTION 'This rename request is no longer pending';
  END IF;

  IF r.expires_at < now() THEN
    UPDATE public.pet_rename_requests SET status = 'expired' WHERE id = p_request_id;
    RAISE EXCEPTION 'Rename request expired';
  END IF;

  IF NOT public._user_owns_pet(r.pet_id) THEN
    RAISE EXCEPTION 'You do not have access to this pet';
  END IF;

  IF uid = ANY(r.approvals) THEN
    RAISE EXCEPTION 'You already approved this rename';
  END IF;

  IF NOT public.is_pet_name_available(r.proposed_name, r.pet_id) THEN
    RAISE EXCEPTION 'Pet name already taken';
  END IF;

  UPDATE public.pet_rename_requests
  SET approvals = array_append(approvals, uid)
  WHERE id = p_request_id
  RETURNING * INTO r;

  owners := public._pet_owner_ids(r.pet_id);
  approval_count := (
    SELECT COUNT(*)::int FROM unnest(owners) o WHERE o = ANY(r.approvals)
  );

  IF approval_count >= GREATEST(COALESCE(array_length(owners, 1), 0), 2) OR approval_count >= 2 THEN
    updated := public._apply_pet_rename(r.pet_id, trim(r.proposed_name));
    UPDATE public.pet_rename_requests SET status = 'accepted' WHERE id = p_request_id;

    RETURN jsonb_build_object(
      'pending_request', NULL,
      'pet_id', updated.id,
      'name', updated.name
    );
  END IF;

  RETURN public.get_pet_rename_state(r.pet_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.decline_pet_rename(p_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  r public.pet_rename_requests;
  my_pet_id UUID;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  SELECT * INTO r FROM public.pet_rename_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Rename request not found';
  END IF;

  IF NOT public._user_owns_pet(r.pet_id) THEN
    RAISE EXCEPTION 'You do not have access to this pet';
  END IF;

  UPDATE public.pet_rename_requests SET status = 'declined' WHERE id = p_request_id;

  SELECT pet_id INTO my_pet_id FROM public.profiles WHERE id = uid;
  RETURN public.get_pet_rename_state(my_pet_id);
END;
$$;

-- Backward compat: rename_pet now starts dual-approval flow
CREATE OR REPLACE FUNCTION public.rename_pet(p_new_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.initiate_pet_rename(p_new_name);
END;
$$;

REVOKE ALL ON FUNCTION public.get_pet_rename_state(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.initiate_pet_rename(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirm_pet_rename(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.decline_pet_rename(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_pet_rename_state(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.initiate_pet_rename(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_pet_rename(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decline_pet_rename(UUID) TO authenticated;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.pet_rename_requests;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

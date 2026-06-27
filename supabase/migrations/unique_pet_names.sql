-- Unique pet names (case-insensitive, like usernames) + rename support
-- Run once in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION public.is_pet_name_available(
  p_name TEXT,
  p_exclude_pet_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.pets
    WHERE lower(trim(name)) = lower(trim(p_name))
      AND (p_exclude_pet_id IS NULL OR id <> p_exclude_pet_id)
  );
$$;

-- Resolve duplicate names before unique index
DO $$
DECLARE
  r RECORD;
  new_name TEXT;
BEGIN
  FOR r IN
    SELECT id, name,
      ROW_NUMBER() OVER (PARTITION BY lower(trim(name)) ORDER BY created_at, id) AS rn
    FROM public.pets
  LOOP
    IF r.rn > 1 THEN
      new_name := left(trim(r.name), 42) || substr(replace(r.id::text, '-', ''), 1, 6);
      UPDATE public.pets SET name = new_name WHERE id = r.id;
    END IF;
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_pets_name_unique
  ON public.pets (lower(trim(name)));

CREATE OR REPLACE FUNCTION public.send_match_request(
  p_receiver_username TEXT,
  p_proposed_pet_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  clean_receiver TEXT;
  clean_name TEXT;
  new_id UUID;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  clean_receiver := lower(trim(p_receiver_username));
  clean_name := trim(p_proposed_pet_name);

  IF clean_receiver = '' THEN
    RAISE EXCEPTION 'Receiver username is required';
  END IF;

  IF length(clean_name) < 2 OR length(clean_name) > 50 THEN
    RAISE EXCEPTION 'Pet name must be 2–50 characters';
  END IF;

  IF NOT public.is_pet_name_available(clean_name, NULL) THEN
    RAISE EXCEPTION 'Pet name already taken';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.profiles WHERE id = uid AND lower(username) = clean_receiver
  ) THEN
    RAISE EXCEPTION 'You can''t send a request to yourself';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE lower(username) = clean_receiver
  ) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.profiles WHERE id = uid AND partner_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'You already have a partner';
  END IF;

  INSERT INTO public.match_requests (sender_id, receiver_username, proposed_pet_name, status)
  SELECT uid, p.username, clean_name, 'pending'
  FROM public.profiles p
  WHERE lower(p.username) = clean_receiver
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_match_request(request_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  req public.match_requests;
  new_pet_id UUID;
  sender_profile public.profiles;
  receiver_profile public.profiles;
  pet_name TEXT;
  trait_agg INTEGER;
  trait_nrg INTEGER;
  trait_spk INTEGER;
  trait_brn INTEGER;
  trait_eys INTEGER;
  trait_eyc INTEGER;
BEGIN
  SELECT * INTO req FROM public.match_requests WHERE id = request_id AND status = 'pending' FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already handled';
  END IF;

  SELECT * INTO receiver_profile FROM public.profiles WHERE id = auth.uid();
  IF receiver_profile.username != req.receiver_username THEN
    RAISE EXCEPTION 'You can''t accept this request';
  END IF;

  SELECT * INTO sender_profile FROM public.profiles WHERE id = req.sender_id;
  IF sender_profile.partner_id IS NOT NULL OR receiver_profile.partner_id IS NOT NULL THEN
    RAISE EXCEPTION 'One or both users are already matched';
  END IF;

  pet_name := trim(COALESCE(req.proposed_pet_name, ''));
  IF length(pet_name) < 2 THEN
    RAISE EXCEPTION 'Pet name must be 2–50 characters';
  END IF;

  IF NOT public.is_pet_name_available(pet_name, NULL) THEN
    RAISE EXCEPTION 'Pet name already taken';
  END IF;

  trait_agg := GREATEST(1, LEAST(99, (random() * 98 + 1)::INTEGER));
  trait_nrg := GREATEST(1, LEAST(99, (random() * 98 + 1)::INTEGER));
  trait_spk := GREATEST(1, LEAST(99, (random() * 98 + 1)::INTEGER));
  trait_brn := GREATEST(1, LEAST(99, (random() * 98 + 1)::INTEGER));
  trait_eys := GREATEST(1, LEAST(99, (random() * 98 + 1)::INTEGER));
  trait_eyc := GREATEST(1, LEAST(99, (random() * 98 + 1)::INTEGER));

  INSERT INTO public.pets (name, aggressiveness, energy, spookiness, brain_size, eye_shape, eye_color)
  VALUES (pet_name, trait_agg, trait_nrg, trait_spk, trait_brn, trait_eys, trait_eyc)
  RETURNING id INTO new_pet_id;

  UPDATE public.profiles SET partner_id = req.sender_id, pet_id = new_pet_id WHERE id = auth.uid();
  UPDATE public.profiles SET partner_id = auth.uid(), pet_id = new_pet_id WHERE id = req.sender_id;
  UPDATE public.match_requests SET status = 'accepted' WHERE id = request_id;

  RETURN new_pet_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rename_pet(p_new_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  my_pet_id UUID;
  clean_name TEXT;
  updated public.pets;
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

  IF NOT public.is_pet_name_available(clean_name, my_pet_id) THEN
    RAISE EXCEPTION 'Pet name already taken';
  END IF;

  UPDATE public.pets SET name = clean_name WHERE id = my_pet_id RETURNING * INTO updated;

  RETURN jsonb_build_object(
    'pet_id', updated.id,
    'name', updated.name
  );
END;
$$;

REVOKE ALL ON FUNCTION public.is_pet_name_available(TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rename_pet(TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_pet_name_available(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rename_pet(TEXT) TO authenticated;

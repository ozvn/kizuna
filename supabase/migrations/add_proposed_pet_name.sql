-- Ortak pet ismi ile eşleşme isteği
-- Supabase SQL Editor'de çalıştırın.

ALTER TABLE public.match_requests
  ADD COLUMN IF NOT EXISTS proposed_pet_name VARCHAR(50) NOT NULL DEFAULT 'Mochi';

ALTER TABLE public.match_requests
  DROP CONSTRAINT IF EXISTS match_requests_pet_name_length;

ALTER TABLE public.match_requests
  ADD CONSTRAINT match_requests_pet_name_length
  CHECK (char_length(trim(proposed_pet_name)) BETWEEN 2 AND 50);

CREATE OR REPLACE FUNCTION public.send_match_request(
  p_receiver_username text,
  p_proposed_pet_name text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  clean_receiver text;
  clean_name text;
  new_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Oturum açık değil';
  END IF;

  clean_receiver := lower(trim(p_receiver_username));
  clean_name := trim(p_proposed_pet_name);

  IF clean_receiver = '' THEN
    RAISE EXCEPTION 'Alıcı kullanıcı adı gerekli';
  END IF;

  IF length(clean_name) < 2 OR length(clean_name) > 50 THEN
    RAISE EXCEPTION 'Pet adı 2-50 karakter olmalı';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.profiles WHERE id = uid AND lower(username) = clean_receiver
  ) THEN
    RAISE EXCEPTION 'Kendinize istek gönderemezsiniz';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE lower(username) = clean_receiver
  ) THEN
    RAISE EXCEPTION 'Kullanıcı bulunamadı';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.profiles WHERE id = uid AND partner_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Zaten bir partneriniz var';
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
RETURNS UUID AS $$
DECLARE
  req RECORD;
  new_pet_id UUID;
  sender_profile RECORD;
  receiver_profile RECORD;
  pet_name text;
  trait_agg INTEGER;
  trait_nrg INTEGER;
  trait_spk INTEGER;
  trait_brn INTEGER;
  trait_eys INTEGER;
  trait_eyc INTEGER;
BEGIN
  SELECT * INTO req FROM public.match_requests WHERE id = request_id AND status = 'pending' FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'İstek bulunamadı veya zaten işlendi';
  END IF;

  SELECT * INTO receiver_profile FROM public.profiles WHERE id = auth.uid();
  IF receiver_profile.username != req.receiver_username THEN
    RAISE EXCEPTION 'Bu isteği kabul etme yetkiniz yok';
  END IF;

  SELECT * INTO sender_profile FROM public.profiles WHERE id = req.sender_id;
  IF sender_profile.partner_id IS NOT NULL OR receiver_profile.partner_id IS NOT NULL THEN
    RAISE EXCEPTION 'Bir veya her iki kullanıcı zaten eşleşmiş';
  END IF;

  pet_name := trim(COALESCE(req.proposed_pet_name, 'Mochi'));
  IF length(pet_name) < 2 THEN
    pet_name := 'Mochi';
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION public.send_match_request(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_match_request(text, text) TO authenticated;

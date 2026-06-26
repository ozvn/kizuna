-- KIZUNA POSTGRESQL VERİTABANI ŞEMASI
-- Supabase SQL Editor'de çalıştırın

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Ortak Petler Tablosu
CREATE TABLE IF NOT EXISTS public.pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    kinship NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    energy INTEGER NOT NULL DEFAULT 100,
    aggressiveness INTEGER NOT NULL DEFAULT 50,
    brain_size INTEGER NOT NULL DEFAULT 50,
    spookiness INTEGER NOT NULL DEFAULT 50,
    eye_shape INTEGER NOT NULL DEFAULT 50,
    eye_color INTEGER NOT NULL DEFAULT 50,
    hunger INTEGER NOT NULL DEFAULT 100,
    cleanliness INTEGER NOT NULL DEFAULT 100,
    evolution_stage INTEGER NOT NULL DEFAULT 1,
    spirit_points INTEGER NOT NULL DEFAULT 0,
    last_feed_at TIMESTAMPTZ,
    last_clean_at TIMESTAMPTZ,
    last_pet_at TIMESTAMPTZ,
    last_play_at TIMESTAMPTZ,
    last_care_at TIMESTAMPTZ,
    care_streak INTEGER NOT NULL DEFAULT 0,
    streak_last_date DATE,
    daily_xp_earned INTEGER NOT NULL DEFAULT 0,
    daily_xp_date DATE,
    neglect_decay_at TIMESTAMPTZ,
    last_energy_tick TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Kullanıcı Profilleri Tablosu
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(30) UNIQUE NOT NULL,
    partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Eşleşme İstekleri Tablosu
CREATE TABLE IF NOT EXISTS public.match_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_username VARCHAR(30) NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,
    proposed_pet_name VARCHAR(50) NOT NULL DEFAULT 'Mochi',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_pending_match UNIQUE (sender_id, receiver_username),
    CONSTRAINT match_requests_pet_name_length CHECK (char_length(trim(proposed_pet_name)) BETWEEN 2 AND 50)
);

-- 4. Bakım Günlükleri Tablosu
CREATE TABLE IF NOT EXISTS public.care_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_type VARCHAR(30) NOT NULL,
    stat_gained VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Ortak Ritüeller (Birlikte Oyna)
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

CREATE INDEX IF NOT EXISTS idx_profiles_pet_id ON public.profiles(pet_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_status ON public.match_requests(status);
CREATE INDEX IF NOT EXISTS idx_care_logs_pet_id ON public.care_logs(pet_id);

-- Yeni kullanıcı kaydında profil oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  uname text;
  result public.profiles;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Oturum açık değil';
  END IF;

  SELECT * INTO result FROM public.profiles WHERE id = uid;
  IF FOUND THEN
    RETURN result;
  END IF;

  SELECT COALESCE(
    NULLIF(trim(raw_user_meta_data->>'username'), ''),
    'user_' || substr(uid::text, 1, 8)
  )
  INTO uname
  FROM auth.users
  WHERE id = uid;

  BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (uid, uname)
    RETURNING * INTO result;
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO public.profiles (id, username)
    VALUES (uid, 'user_' || replace(uid::text, '-', ''))
    RETURNING * INTO result;
  END;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_user_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile() TO authenticated;

-- Auth yardımcıları (RLS döngüsünü önler)
CREATE OR REPLACE FUNCTION public.get_auth_username()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT username FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_auth_partner_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT partner_id FROM public.profiles WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.get_auth_username() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_auth_partner_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_auth_username() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_partner_id() TO authenticated;

-- RLS Etkinleştirme
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.joint_rituals ENABLE ROW LEVEL SECURITY;

-- Profiles politikaları
DROP POLICY IF EXISTS "Kullanıcılar kendi profillerini görebilir" ON public.profiles;
DROP POLICY IF EXISTS "Kullanıcılar partner profilini görebilir" ON public.profiles;
DROP POLICY IF EXISTS "Kullanıcı adı araması" ON public.profiles;
DROP POLICY IF EXISTS "Kullanıcılar kendi profilini güncelleyebilir" ON public.profiles;
DROP POLICY IF EXISTS "Kullanıcı kendi profilini oluşturabilir" ON public.profiles;

CREATE POLICY "Kullanıcılar kendi profillerini görebilir" ON public.profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Kullanıcılar partner profilini görebilir" ON public.profiles
    FOR SELECT TO authenticated USING (id = public.get_auth_partner_id());

CREATE POLICY "Kullanıcı adı araması" ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Kullanıcılar kendi profilini güncelleyebilir" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Kullanıcı kendi profilini oluşturabilir" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Pets politikaları
DROP POLICY IF EXISTS "Sadece pet sahipleri pet detayını okuyabilir" ON public.pets;
DROP POLICY IF EXISTS "Sadece pet sahipleri peti güncelleyebilir" ON public.pets;

CREATE POLICY "Sadece pet sahipleri pet detayını okuyabilir" ON public.pets
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.pet_id = pets.id
        )
    );

CREATE POLICY "Sadece pet sahipleri peti güncelleyebilir" ON public.pets
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.pet_id = pets.id
        )
    );

-- Match requests politikaları
CREATE POLICY "Kullanıcılar kendi isteklerini görebilir" ON public.match_requests
    FOR SELECT TO authenticated USING (
        sender_id = auth.uid() OR
        receiver_username = public.get_auth_username()
    );

CREATE POLICY "Kullanıcılar istek gönderebilir" ON public.match_requests
    FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Alıcı isteği güncelleyebilir" ON public.match_requests
    FOR UPDATE TO authenticated USING (
        receiver_username = public.get_auth_username()
    );

CREATE POLICY "Gönderen isteği güncelleyebilir" ON public.match_requests
    FOR UPDATE TO authenticated USING (sender_id = auth.uid());

-- Care logs politikaları
CREATE POLICY "Sadece pet sahipleri bakım günlüklerini okuyabilir" ON public.care_logs
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.pet_id = care_logs.pet_id
        )
    );

CREATE POLICY "Sadece pet sahipleri yeni günlük ekleyebilir" ON public.care_logs
    FOR INSERT TO authenticated WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.pet_id = care_logs.pet_id
        )
    );

-- Makro ritüel RPC'leri (perform_ritual_*, sync_pet_ritual_state, joint play vb.)
-- Kurulum: supabase/migrations/macro_ritual_loop.sql dosyasını SQL Editor'de çalıştırın.

DROP POLICY IF EXISTS "Pet sahipleri ortak ritüelleri görebilir" ON public.joint_rituals;
CREATE POLICY "Pet sahipleri ortak ritüelleri görebilir" ON public.joint_rituals
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.pet_id = joint_rituals.pet_id
    )
  );

-- Eşleşme isteği gönder (pet adı ile)
DROP FUNCTION IF EXISTS public.send_match_request(text);
DROP FUNCTION IF EXISTS public.send_match_request(text, text);

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

REVOKE ALL ON FUNCTION public.send_match_request(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_match_request(text, text) TO authenticated;

-- Eşleşme kabul atomik işlemi
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

-- Kullanıcı adı veya e-posta ile giriş
CREATE OR REPLACE FUNCTION public.get_email_for_login(identifier text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  resolved_email text;
  clean_id text;
  user_id uuid;
BEGIN
  clean_id := lower(trim(identifier));
  IF clean_id = '' THEN
    RETURN NULL;
  END IF;
  IF clean_id LIKE '%@%' THEN
    RETURN clean_id;
  END IF;

  SELECT p.id INTO user_id
  FROM public.profiles p
  WHERE lower(p.username) = clean_id
  LIMIT 1;

  IF user_id IS NULL THEN
    SELECT u.id INTO user_id
    FROM auth.users u
    WHERE lower(trim(u.raw_user_meta_data->>'username')) = clean_id
    LIMIT 1;
  END IF;

  IF user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT u.email INTO resolved_email
  FROM auth.users u
  WHERE u.id = user_id
  LIMIT 1;

  RETURN resolved_email;
END;
$$;

REVOKE ALL ON FUNCTION public.get_email_for_login(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_email_for_login(text) TO anon, authenticated;

-- Realtime için publication (zaten ekliyse atla)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.pets;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.care_logs;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.match_requests;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.joint_rituals;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

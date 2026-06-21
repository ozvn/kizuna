-- Eksik profil satırlarını düzelt (406 hatası)
-- Supabase SQL Editor'de çalıştırın.

-- Mevcut auth kullanıcıları için profil oluştur
INSERT INTO public.profiles (id, username)
SELECT
  u.id,
  COALESCE(
    NULLIF(trim(u.raw_user_meta_data->>'username'), ''),
    'user_' || substr(u.id::text, 1, 8)
  )
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

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

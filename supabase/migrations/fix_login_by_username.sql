-- Kullanıcı adı ile giriş düzeltmesi
-- Supabase SQL Editor'de bir kez çalıştırın.

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

  -- 1) profiles.username
  SELECT p.id INTO user_id
  FROM public.profiles p
  WHERE lower(p.username) = clean_id
  LIMIT 1;

  -- 2) Kayıt metadata fallback (profil eksik / eski hesaplar)
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

-- Profil username'i metadata ile uyumsuz eski hesapları düzelt
UPDATE public.profiles p
SET username = lower(trim(u.raw_user_meta_data->>'username'))
FROM auth.users u
WHERE u.id = p.id
  AND u.raw_user_meta_data->>'username' IS NOT NULL
  AND trim(u.raw_user_meta_data->>'username') <> ''
  AND p.username LIKE 'user\_%'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p2
    WHERE p2.username = lower(trim(u.raw_user_meta_data->>'username'))
      AND p2.id <> p.id
  );

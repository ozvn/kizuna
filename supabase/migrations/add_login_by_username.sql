-- Kullanıcı adı veya e-posta ile giriş (anon erişimli RPC)
-- Supabase SQL Editor'de bir kez çalıştırın.

CREATE OR REPLACE FUNCTION public.get_email_for_login(identifier text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved_email text;
  clean_id text;
BEGIN
  clean_id := lower(trim(identifier));
  IF clean_id = '' THEN
    RETURN NULL;
  END IF;

  IF clean_id LIKE '%@%' THEN
    RETURN clean_id;
  END IF;

  SELECT u.email INTO resolved_email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE lower(p.username) = clean_id
  LIMIT 1;

  RETURN resolved_email;
END;
$$;

REVOKE ALL ON FUNCTION public.get_email_for_login(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_email_for_login(text) TO anon, authenticated;

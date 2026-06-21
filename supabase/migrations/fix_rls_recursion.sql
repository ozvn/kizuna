-- RLS sonsuz döngü düzeltmesi (500 hatası)
-- Supabase SQL Editor'de çalıştırın.

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

DROP POLICY IF EXISTS "Kullanıcılar partner profilini görebilir" ON public.profiles;
CREATE POLICY "Kullanıcılar partner profilini görebilir" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = public.get_auth_partner_id());

DROP POLICY IF EXISTS "Kullanıcılar kendi isteklerini görebilir" ON public.match_requests;
CREATE POLICY "Kullanıcılar kendi isteklerini görebilir" ON public.match_requests
  FOR SELECT TO authenticated
  USING (
    sender_id = auth.uid()
    OR receiver_username = public.get_auth_username()
  );

DROP POLICY IF EXISTS "Alıcı isteği güncelleyebilir" ON public.match_requests;
CREATE POLICY "Alıcı isteği güncelleyebilir" ON public.match_requests
  FOR UPDATE TO authenticated
  USING (receiver_username = public.get_auth_username());

DROP POLICY IF EXISTS "Gönderen isteği güncelleyebilir" ON public.match_requests;
CREATE POLICY "Gönderen isteği güncelleyebilir" ON public.match_requests
  FOR UPDATE TO authenticated
  USING (sender_id = auth.uid());

DROP POLICY IF EXISTS "Kullanıcı adı araması" ON public.profiles;
CREATE POLICY "Kullanıcı adı araması" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

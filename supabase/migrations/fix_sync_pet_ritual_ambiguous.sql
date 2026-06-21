-- sync_pet_ritual_state partner_id belirsizliği düzeltmesi
-- Supabase SQL Editor'de çalıştırın.

CREATE OR REPLACE FUNCTION public.sync_pet_ritual_state(p_pet_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p public.pets;
  pending_ritual RECORD;
BEGIN
  PERFORM public._assert_pet_owner(p_pet_id);
  PERFORM public.apply_pet_neglect_if_needed(p_pet_id);

  SELECT * INTO p FROM public.pets WHERE id = p_pet_id;
  p := public._reset_daily_xp_if_needed(p);

  UPDATE public.joint_rituals SET status = 'expired'
  WHERE pet_id = p_pet_id AND status = 'pending' AND expires_at < now();

  SELECT jr.*, pr.username AS initiator_username
  INTO pending_ritual
  FROM public.joint_rituals jr
  JOIN public.profiles pr ON pr.id = jr.initiator_id
  WHERE jr.pet_id = p_pet_id AND jr.status = 'pending'
  ORDER BY jr.created_at DESC
  LIMIT 1;

  RETURN jsonb_build_object(
    'last_feed_at', p.last_feed_at,
    'last_clean_at', p.last_clean_at,
    'last_pet_at', p.last_pet_at,
    'last_play_at', p.last_play_at,
    'last_care_at', p.last_care_at,
    'care_streak', p.care_streak,
    'daily_xp_earned', p.daily_xp_earned,
    'daily_xp_cap', 8,
    'pending_joint_play', CASE WHEN pending_ritual.id IS NOT NULL THEN jsonb_build_object(
      'id', pending_ritual.id,
      'initiator_id', pending_ritual.initiator_id,
      'initiator_username', pending_ritual.initiator_username,
      'created_at', pending_ritual.created_at,
      'expires_at', pending_ritual.expires_at,
      'is_initiator', pending_ritual.initiator_id = auth.uid(),
      'can_confirm', pending_ritual.initiator_id <> auth.uid()
    ) ELSE NULL END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_pet_ritual_state(UUID) TO authenticated;

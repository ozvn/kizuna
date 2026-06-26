-- Hotfix: get_pet_social_state crashed with "record fp is not assigned yet"
-- when no pending friend play session exists (PL/pgSQL RECORD + alias clash).
-- Run once in Supabase SQL Editor.

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
  pending_play JSONB;
  play_session RECORD;
  friend_pet_id UUID;
  friend_pet_name TEXT;
  required_owners UUID[];
  approval_count INT;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  IF NOT public._user_owns_pet(p_pet_id) THEN
    RAISE EXCEPTION 'You do not have access to this pet';
  END IF;

  owners := public._pet_owner_ids(p_pet_id);

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'pet_id', friend_pet.id,
    'pet_name', friend_pet.name,
    'level', friend_pet.level,
    'care_streak', COALESCE(friend_pet.care_streak, 0),
    'score', public._pet_leaderboard_score(friend_pet)
  ) ORDER BY public._pet_leaderboard_score(friend_pet) DESC), '[]'::jsonb)
  INTO friends
  FROM public.pet_friendships f
  JOIN public.pets friend_pet ON friend_pet.id = CASE
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

  IF to_regclass('public.friend_play_sessions') IS NOT NULL THEN
    UPDATE public.friend_play_sessions SET status = 'expired'
    WHERE status = 'pending' AND expires_at < now()
      AND (pet_a_id = p_pet_id OR pet_b_id = p_pet_id);

    SELECT s.*, pa.name AS pet_a_name, pb.name AS pet_b_name
    INTO play_session
    FROM public.friend_play_sessions s
    JOIN public.pets pa ON pa.id = s.pet_a_id
    JOIN public.pets pb ON pb.id = s.pet_b_id
    WHERE s.status = 'pending' AND s.expires_at > now()
      AND (s.pet_a_id = p_pet_id OR s.pet_b_id = p_pet_id)
    ORDER BY s.created_at DESC
    LIMIT 1;

    IF FOUND THEN
      friend_pet_id := CASE
        WHEN play_session.pet_a_id = p_pet_id THEN play_session.pet_b_id
        ELSE play_session.pet_a_id
      END;
      friend_pet_name := CASE
        WHEN play_session.pet_a_id = p_pet_id THEN play_session.pet_b_name
        ELSE play_session.pet_a_name
      END;
      required_owners := public._friend_play_owner_ids(play_session.pet_a_id, play_session.pet_b_id);
      approval_count := (
        SELECT COUNT(*)::int FROM unnest(required_owners) o WHERE o = ANY(play_session.approvals)
      );

      pending_play := jsonb_build_object(
        'id', play_session.id,
        'pet_a_id', play_session.pet_a_id,
        'pet_b_id', play_session.pet_b_id,
        'pet_a_name', play_session.pet_a_name,
        'pet_b_name', play_session.pet_b_name,
        'friend_pet_id', friend_pet_id,
        'friend_pet_name', friend_pet_name,
        'initiated_by', play_session.initiated_by,
        'approvals', play_session.approvals,
        'approval_count', approval_count,
        'required_approvals', GREATEST(COALESCE(array_length(required_owners, 1), 0), 4),
        'needs_my_approval', NOT (uid = ANY(play_session.approvals)),
        'i_initiated', play_session.initiated_by = uid,
        'expires_at', play_session.expires_at
      );
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'friends', friends,
    'outgoing_request', outgoing,
    'incoming_request', incoming,
    'pending_friend_play', pending_play,
    'owner_ids', owners
  );
END;
$$;

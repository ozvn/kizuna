import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatSupabaseError } from '../lib/supabaseErrors';
import type { PetSocialState } from '../types';

export function usePetSocial(petId: string | null | undefined) {
  const [state, setState] = useState<PetSocialState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!petId) {
      setState(null);
      setLoading(false);
      return;
    }

    const { data, error: rpcError } = await supabase.rpc('get_pet_social_state', {
      p_pet_id: petId,
    });

    if (rpcError) {
      console.error('social state:', rpcError);
      setError(formatSupabaseError(rpcError));
    } else {
      setState(data as PetSocialState);
      setError(null);
    }
    setLoading(false);
  }, [petId]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!petId) return;

    const channel = supabase
      .channel(`social-${petId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pet_friend_requests' },
        () => refresh(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pet_friendships' },
        () => refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [petId, refresh]);

  return { state, loading, error, refresh };
}

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatSupabaseError } from '../lib/supabaseErrors';
import type { PetRitualState } from '../types';

export function usePetRitualState(petId: string | null | undefined) {
  const [state, setState] = useState<PetRitualState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(async () => {
    if (!petId) {
      setState(null);
      setLoading(false);
      return;
    }

    const { data, error: rpcError } = await supabase.rpc('sync_pet_ritual_state', {
      p_pet_id: petId,
    });

    if (rpcError) {
      console.error('ritual sync:', rpcError);
      setError(formatSupabaseError(rpcError));
    } else {
      setState(data as PetRitualState);
      setError(null);
    }
    setLoading(false);
  }, [petId]);

  useEffect(() => {
    setLoading(true);
    sync();
  }, [sync]);

  useEffect(() => {
    if (!petId) return;

    const channel = supabase
      .channel(`ritual-${petId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pets', filter: `id=eq.${petId}` },
        () => sync(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'joint_rituals', filter: `pet_id=eq.${petId}` },
        () => sync(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [petId, sync]);

  return { state, loading, error, refresh: sync };
}

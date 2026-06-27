import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatSupabaseError } from '../lib/supabaseErrors';
import type { PetRenameState } from '../types';

export function usePetRenameState(petId: string | null | undefined) {
  const [state, setState] = useState<PetRenameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!petId) {
      setState(null);
      setLoading(false);
      return;
    }

    const { data, error: rpcError } = await supabase.rpc('get_pet_rename_state', {
      p_pet_id: petId,
    });

    if (rpcError) {
      console.error('rename state:', rpcError);
      setError(formatSupabaseError(rpcError));
    } else {
      setState(data as PetRenameState);
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
      .channel(`rename-${petId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pet_rename_requests' },
        () => refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [petId, refresh]);

  return { state, loading, error, refresh };
}

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Pet } from '../types';

export function useRealtimePet(petId: string | null | undefined) {
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPet = useCallback(async () => {
    if (!petId) {
      setPet(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .maybeSingle();

    if (!error && data) {
      setPet(data as Pet);
    }
    setLoading(false);
  }, [petId]);

  useEffect(() => {
    fetchPet();
  }, [fetchPet]);

  useEffect(() => {
    if (!petId) return;

    const channel = supabase
      .channel(`realtime-pet-${petId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pets',
          filter: `id=eq.${petId}`,
        },
        (payload) => {
          setPet((currentPet) => {
            if (!currentPet) return payload.new as Pet;
            return { ...currentPet, ...(payload.new as Pet) };
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [petId]);

  return { pet, loading, refresh: fetchPet };
}

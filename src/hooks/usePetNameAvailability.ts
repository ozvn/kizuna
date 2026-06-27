import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function usePetNameAvailability(
  name: string,
  options?: { excludePetId?: string | null; enabled?: boolean },
) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const enabled = options?.enabled ?? true;
  const excludePetId = options?.excludePetId ?? null;

  const check = useCallback(async (candidate: string) => {
    const trimmed = candidate.trim();
    if (trimmed.length < 2) {
      setAvailable(null);
      setChecking(false);
      return;
    }

    setChecking(true);
    const { data, error } = await supabase.rpc('is_pet_name_available', {
      p_name: trimmed,
      p_exclude_pet_id: excludePetId,
    });

    if (error) {
      console.error('pet name check:', error);
      setAvailable(null);
    } else {
      setAvailable(data === true);
    }
    setChecking(false);
  }, [excludePetId]);

  useEffect(() => {
    if (!enabled) {
      setAvailable(null);
      return;
    }

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setAvailable(null);
      return;
    }

    const timer = setTimeout(() => {
      void check(trimmed);
    }, 350);

    return () => clearTimeout(timer);
  }, [name, enabled, check]);

  return { available, checking, recheck: () => check(name) };
}

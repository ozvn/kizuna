import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatSupabaseError } from '../lib/supabaseErrors';
import type { LeaderboardResult } from '../types';

export function useLeaderboard(limit = 25) {
  const [data, setData] = useState<LeaderboardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data: result, error: rpcError } = await supabase.rpc('get_pet_leaderboard', {
      p_limit: limit,
    });

    if (rpcError) {
      console.error('leaderboard:', rpcError);
      setError(formatSupabaseError(rpcError));
      setData(null);
    } else {
      const payload = result as { entries: LeaderboardResult['entries']; my_pet_id: string | null };
      setData({
        entries: (payload.entries ?? []) as LeaderboardResult['entries'],
        my_pet_id: payload.my_pet_id ?? null,
      });
      setError(null);
    }
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

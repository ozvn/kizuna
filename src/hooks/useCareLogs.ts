import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { CareLog } from '../types';

export function useCareLogs(petId: string | null | undefined) {
  const [logs, setLogs] = useState<CareLog[]>([]);

  useEffect(() => {
    if (!petId) {
      setLogs([]);
      return;
    }

    const fetchLogs = async () => {
      const { data: logsData } = await supabase
        .from('care_logs')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!logsData) return;

      const userIds = [...new Set(logsData.map((l) => l.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

      setLogs(
        logsData.map((log) => ({
          ...log,
          profile: profileMap.get(log.user_id),
        })) as CareLog[],
      );
    };

    fetchLogs();

    const channel = supabase
      .channel(`care-logs-${petId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'care_logs',
          filter: `pet_id=eq.${petId}`,
        },
        async () => {
          await fetchLogs();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [petId]);

  return logs;
}

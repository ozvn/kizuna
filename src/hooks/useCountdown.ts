import { useEffect, useState } from 'react';

/** Saniyede bir güncellenen global saat — geri sayım hook'ları için hafif tetikleyici */
export function useNow(tickMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), tickMs);
    return () => window.clearInterval(id);
  }, [tickMs]);

  return now;
}

import { ScrollText } from 'lucide-react';
import { ACTION_LABELS } from '../lib/gameUtils';
import GamePanel from './GamePanel';
import type { CareLog } from '../types';

interface CareLogPanelProps {
  logs: CareLog[];
}

export default function CareLogPanel({ logs }: CareLogPanelProps) {
  return (
    <GamePanel className="w-full">
      <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b-2 border-frame-light border-dashed">
        <ScrollText className="w-3.5 h-3.5 text-ink-muted" />
        <h3 className="text-[10px] font-bold text-ink text-stroke-soft">Bakım Geçmişi</h3>
      </div>

      {logs.length === 0 ? (
        <p className="text-[9px] text-ink-muted font-semibold py-0.5">
          Henüz bakım kaydı yok — Mochi seni bekliyor!
        </p>
      ) : (
        <ul className="game-log-scroll space-y-1">
          {logs.map((log) => (
            <li key={log.id} className="text-[9px] leading-snug text-ink font-semibold text-stroke-soft">
              <span className="text-rose-dark">
                {(log as CareLog & { profile?: { username: string } }).profile?.username ??
                  'Arkadaşın'}
              </span>{' '}
              → {ACTION_LABELS[log.action_type] ?? log.action_type}{' '}
              <span className="text-ink-muted">({log.stat_gained})</span>
            </li>
          ))}
        </ul>
      )}
    </GamePanel>
  );
}

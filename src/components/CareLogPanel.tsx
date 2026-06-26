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
      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b-2 border-frame-light border-dashed">
        <ScrollText className="w-4 h-4 text-ink-muted" />
        <h3 className="game-heading text-ink text-stroke-soft">Care Log</h3>
      </div>

      {logs.length === 0 ? (
        <p className="game-body text-ink-muted py-1">
          No care records yet — your pet is waiting!
        </p>
      ) : (
        <ul className="game-log-scroll space-y-1.5">
          {logs.map((log) => (
            <li key={log.id} className="game-caption leading-snug text-ink text-stroke-soft">
              <span className="text-rose-dark font-bold">
                {(log as CareLog & { profile?: { username: string } }).profile?.username ??
                  'Partner'}
              </span>{' '}
              {ACTION_LABELS[log.action_type] ?? log.action_type}{' '}
              <span className="text-ink-muted">({log.stat_gained})</span>
            </li>
          ))}
        </ul>
      )}
    </GamePanel>
  );
}

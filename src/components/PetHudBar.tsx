import { Sparkles } from 'lucide-react';
import PetRenameControl from './PetRenameControl';
import type { PendingPetRename } from '../types';

interface PetHudBarProps {
  petId: string;
  level: number;
  petName: string;
  brs: number;
  rarityLabel: string;
  spiritPoints: number;
  pendingRename: PendingPetRename | null;
  onPetRenamed: (newName: string) => void;
  onRenameStateChange: () => void;
}

export default function PetHudBar({
  petId,
  level,
  petName,
  brs,
  rarityLabel,
  spiritPoints,
  pendingRename,
  onPetRenamed,
  onRenameStateChange,
}: PetHudBarProps) {
  return (
    <div className="game-hud-bar" role="group" aria-label="Pet status HUD">
      <div className="game-hud-cluster game-hud-cluster-pet">
        <div className="game-hud-chip">
          <span className="game-hud-chip-label">LV</span>
          <span className="game-hud-chip-value font-pixel">{level}</span>
        </div>
        <PetRenameControl
          petId={petId}
          petName={petName}
          pendingRequest={pendingRename}
          onRenamed={onPetRenamed}
          onStateChange={onRenameStateChange}
        />
      </div>

      <div className="game-hud-divider" aria-hidden />

      <div className="game-hud-cluster game-hud-cluster-brs">
        <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" aria-hidden />
        <div className="game-hud-chip">
          <span className="game-hud-chip-label">BRS</span>
          <span className="game-hud-chip-value font-pixel">{brs}</span>
        </div>
        <span className="game-tag text-ink shrink-0">{rarityLabel}</span>
      </div>

      <div className="game-hud-spirit game-caption text-ink-muted tabular-nums shrink-0">
        ✦ {spiritPoints}
      </div>
    </div>
  );
}

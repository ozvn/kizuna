import { Sparkles } from 'lucide-react';

interface PetHudBarProps {
  level: number;
  petName: string;
  brs: number;
  rarityLabel: string;
  spiritPoints: number;
}

export default function PetHudBar({
  level,
  petName,
  brs,
  rarityLabel,
  spiritPoints,
}: PetHudBarProps) {
  return (
    <div className="game-hud-bar" role="group" aria-label="Pet status HUD">
      <div className="game-hud-cluster">
        <div className="game-hud-chip">
          <span className="game-hud-chip-label">LV</span>
          <span className="game-hud-chip-value font-pixel">{level}</span>
        </div>
        <span className="game-hud-name game-caption text-ink-muted truncate">{petName}</span>
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

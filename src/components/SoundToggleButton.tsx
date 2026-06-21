import { Volume2, VolumeX } from 'lucide-react';

interface SoundToggleButtonProps {
  muted: boolean;
  onToggle: () => void;
}

export default function SoundToggleButton({ muted, onToggle }: SoundToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="pixel-btn p-1.5 bg-parchment text-ink-muted hover:text-ink"
      aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}
      aria-pressed={muted}
      title={muted ? 'Sesi aç' : 'Sesi kapat'}
    >
      {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
    </button>
  );
}

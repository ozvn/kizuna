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
      aria-label={muted ? 'Unmute' : 'Mute'}
      aria-pressed={muted}
      title={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
    </button>
  );
}

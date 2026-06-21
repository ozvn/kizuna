import { useCallback, useSyncExternalStore } from 'react';
import { readSoundMuted, writeSoundMuted } from '../lib/soundPrefs';
import { soundEngine } from '../lib/soundEngine';

let muted = readSoundMuted();
soundEngine.setMuted(muted);

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return muted;
}

function setMuted(next: boolean) {
  if (muted === next) return;
  muted = next;
  writeSoundMuted(next);
  soundEngine.setMuted(next);
  emitChange();
}

export function useSoundMuted() {
  const isMuted = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const toggle = useCallback(() => setMuted(!isMuted), [isMuted]);

  return { muted: isMuted, toggle, setMuted };
}

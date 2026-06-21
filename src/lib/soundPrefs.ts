const STORAGE_KEY = 'kizuna-sound-muted';

export function readSoundMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function writeSoundMuted(muted: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, muted ? 'true' : 'false');
  } catch {
    // private mode / quota
  }
}

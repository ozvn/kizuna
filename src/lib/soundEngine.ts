/** Konuşma: harf başına bekleme süresi (sn) — yüksek = daha yavaş */
const SPEECH_BASE_SPEED = 0.2;

/** Aksiyon melodileri arası boşluk (ms) */
const ACTION_NOTE_GAP_MS = 220;

export class SoundEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private initialized = false;
  private muted = false;
  private readonly masterVolume = 0.1;

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyMasterVolume();
  }

  private applyMasterVolume(): void {
    if (!this.audioCtx || !this.masterGain) return;
    this.masterGain.gain.setValueAtTime(
      this.muted ? 0 : this.masterVolume,
      this.audioCtx.currentTime,
    );
  }

  async ensureAudio(): Promise<void> {
    if (this.muted) return;
    this.init();
    if (this.audioCtx?.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  private init(): void {
    if (this.initialized) return;
    this.initialized = true;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.audioCtx = new AudioCtx();
    this.masterGain = this.audioCtx.createGain();
    this.applyMasterVolume();
    this.masterGain.connect(this.audioCtx.destination);
  }

  /** frequency × pitchShift ile square veya triangle dalga sentezler */
  public playTone(
    frequency: number,
    duration: number,
    pitchShift = 1,
    wave: 'square' | 'triangle' = 'triangle',
  ): void {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx || !this.masterGain) return;

    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    const attack = 0.02;
    const release = Math.max(attack + 0.04, duration * 0.35);

    osc.type = wave;
    osc.frequency.setValueAtTime(frequency * pitchShift, this.audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.7, this.audioCtx.currentTime + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration + release);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioCtx.currentTime + duration + release + 0.05);

    setTimeout(() => {
      osc.disconnect();
      gainNode.disconnect();
    }, (duration + release + 0.15) * 1000);
  }

  /** Metni harf harf Animalese sentezi — speed (sn), basePitch (çarpan) */
  public async playAnimalese(text: string, speed: number, basePitch: number): Promise<void> {
    if (this.muted) return;
    await this.ensureAudio();

    const noteDuration = speed * 1.4;

    for (let i = 0; i < text.length; i++) {
      const char = text[i].toLowerCase();
      if (char === ' ') {
        await new Promise((r) => setTimeout(r, speed * 1000 * 2));
        continue;
      }

      let baseFreq = 330;
      if ('aeiou'.includes(char)) {
        baseFreq = 392 + (char.charCodeAt(0) % 4) * 18;
      } else if ('bcdfghjklmnpqrstvwxyz'.includes(char)) {
        baseFreq = 196 + (char.charCodeAt(0) % 5) * 12;
      }

      const randomShift = 0.98 + Math.random() * 0.04;
      const finalFreq = baseFreq * randomShift;

      this.playTone(finalFreq, noteDuration, basePitch * 0.95, 'triangle');
      await new Promise((r) => setTimeout(r, speed * 1000 * 1.15));
    }
  }

  /** Enerji ve sevgi seviyesinden speed/basePitch türetir */
  public async playAnimaleseForPet(
    text: string,
    petEnergy: number,
    petKinship: number,
  ): Promise<void> {
    const { speed, basePitch } = this.computeSpeechTiming(petEnergy, petKinship);
    return this.playAnimalese(text, speed, basePitch);
  }

  /** Enerji, sevgi ve son besleme süresinden konuşma hızı/tınısı türetir */
  public computeSpeechTiming(
    petEnergy: number,
    petKinship: number,
    hoursSinceFeed = 0,
  ): {
    speed: number;
    basePitch: number;
    charDelayMs: number;
  } {
    let speed = SPEECH_BASE_SPEED * (1 + Math.max(0, 50 - petEnergy) / 200);
    let basePitch =
      0.92 + (petEnergy - 50) / 400 + (petKinship - 50) / 500;

    if (hoursSinceFeed >= 10) {
      speed *= 1.25;
      basePitch *= 0.9;
    } else if (hoursSinceFeed >= 6) {
      speed *= 1.1;
      basePitch *= 0.95;
    }

    return { speed, basePitch, charDelayMs: speed * 1000 * 1.15 };
  }

  public playCoinSound(): void {
    this.init();
    this.playTone(440, 0.18, 1, 'triangle');
    setTimeout(() => this.playTone(523.25, 0.28, 1, 'triangle'), 180);
  }

  public playActionSound(action: 'feed' | 'pet' | 'clean' | 'play'): void {
    if (this.muted) return;
    this.init();

    const tones: Record<string, [number, number][]> = {
      feed: [
        [349.23, 0.22],
        [440, 0.28],
      ],
      pet: [
        [392, 0.24],
        [493.88, 0.32],
      ],
      clean: [
        [329.63, 0.2],
        [415.3, 0.24],
        [523.25, 0.3],
      ],
      play: [
        [440, 0.18],
        [554.37, 0.22],
        [659.25, 0.28],
      ],
    };

    const sequence = tones[action] ?? tones.pet;
    sequence.forEach(([freq, dur], idx) => {
      setTimeout(
        () => this.playTone(freq, dur, 1, 'triangle'),
        idx * ACTION_NOTE_GAP_MS,
      );
    });
  }
}

export const soundEngine = new SoundEngine();

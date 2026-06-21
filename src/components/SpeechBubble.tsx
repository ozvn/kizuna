import { useEffect, useState } from 'react';
import { soundEngine } from '../lib/soundEngine';

interface SpeechBubbleProps {
  text: string;
  petEnergy: number;
  petKinship?: number;
  hoursSinceFeed?: number;
  onComplete?: () => void;
}

export default function SpeechBubble({
  text,
  petEnergy,
  petKinship = 50,
  hoursSinceFeed = 0,
  onComplete,
}: SpeechBubbleProps) {
  const [displayed, setDisplayed] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!text) return;

    let cancelled = false;
    setDisplayed('');
    setIsSpeaking(true);

    const { speed, basePitch, charDelayMs } = soundEngine.computeSpeechTiming(
      petEnergy,
      petKinship,
      hoursSinceFeed,
    );

    const runTypewriter = async () => {
      for (let i = 0; i < text.length; i++) {
        if (cancelled) return;
        setDisplayed(text.slice(0, i + 1));
        const char = text[i];
        const delay = char === ' ' ? charDelayMs * 1.5 : charDelayMs;
        await new Promise((r) => setTimeout(r, delay));
      }
    };

    const run = async () => {
      await soundEngine.ensureAudio();
      await Promise.all([
        runTypewriter(),
        soundEngine.playAnimalese(text, speed, basePitch),
      ]);

      if (!cancelled) {
        setIsSpeaking(false);
        onComplete?.();
      }
    };

    run();

    return () => {
      cancelled = true;
      setIsSpeaking(false);
    };
  }, [text, petEnergy, petKinship, hoursSinceFeed, onComplete]);

  if (!text) return null;

  return (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 min-w-[88px] max-w-[140px]">
      <div className="speech-bubble text-center">
        <p className="text-[10px] leading-snug text-ink font-bold text-stroke-soft">
          {displayed}
          {isSpeaking && <span className="animate-pulse">|</span>}
        </p>
      </div>
      <div className="speech-bubble-tail" aria-hidden />
    </div>
  );
}

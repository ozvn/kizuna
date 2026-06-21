import { useMemo } from 'react';
import {
  buildMochiPixelGrid,
  getEvolutionTier,
  getTierDisplay,
  MOCHI_GRID_SIZE,
  type MochiEyeStyle,
} from '../lib/mochiPixelArt';
import { colors } from '../lib/theme';

interface MochiCharacterProps {
  level: number;
  mood: 'happy' | 'idle' | 'hungry' | 'sleepy' | 'lonely' | 'yawning';
  eyeShape: number;
  eyeColor: number;
  spookiness: number;
  isNight: boolean;
}

function resolveEyeStyle(eyeShape: number): MochiEyeStyle {
  if (eyeShape < 30) return 'sleepy';
  if (eyeShape > 70) return 'wide';
  return 'normal';
}

function resolveAnimClass(mood: MochiCharacterProps['mood']): string {
  switch (mood) {
    case 'happy':
      return 'animate-mochi-happy';
    case 'yawning':
      return 'animate-yawn';
    case 'hungry':
    case 'sleepy':
    case 'lonely':
    case 'idle':
    default:
      return 'animate-mochi-idle';
  }
}

function Sparkles() {
  const spots = [
    { top: '8%', left: '-6%', delay: '0s' },
    { top: '20%', right: '-8%', delay: '0.6s' },
    { bottom: '30%', left: '-10%', delay: '1.2s' },
    { bottom: '15%', right: '-6%', delay: '0.3s' },
  ];

  return (
    <>
      {spots.map((s, i) => (
        <span
          key={i}
          className="absolute w-1.5 h-1.5 bg-gold animate-sparkle pixelated pointer-events-none"
          style={{
            top: s.top,
            left: s.left,
            right: s.right,
            bottom: s.bottom,
            animationDelay: s.delay,
          }}
          aria-hidden
        />
      ))}
    </>
  );
}

export default function MochiCharacter({
  level,
  mood,
  eyeShape,
  eyeColor,
  spookiness,
  isNight,
}: MochiCharacterProps) {
  const tier = getEvolutionTier(level);
  const { cellPx, containerClass } = getTierDisplay(tier);
  const animClass = resolveAnimClass(mood);

  const eyeFill =
    eyeColor > 60 ? colors.sky : eyeColor < 30 ? colors.mint : colors.lavender;
  const eyeStyle = resolveEyeStyle(eyeShape);

  const pixelGrid = useMemo(
    () =>
      buildMochiPixelGrid({
        level,
        eyeStyle,
        eyeFill,
        mood,
        isNight,
        spookiness,
      }),
    [level, eyeStyle, eyeFill, mood, isNight, spookiness],
  );

  const gridSizePx = MOCHI_GRID_SIZE * cellPx;

  return (
    <div className={`relative inline-flex flex-col items-center ${animClass}`}>
      <div
        className={`relative pixelated ${containerClass}`}
        style={{ width: gridSizePx, height: gridSizePx }}
        aria-label={`Mochi — Seviye ${level}`}
      >
        {tier === 'ancient' && <Sparkles />}

        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${MOCHI_GRID_SIZE}, ${cellPx}px)`,
            gridTemplateRows: `repeat(${MOCHI_GRID_SIZE}, ${cellPx}px)`,
            width: gridSizePx,
            height: gridSizePx,
          }}
        >
          {pixelGrid.flatMap((row, y) =>
            row.map((color, x) => (
              <div
                key={`${x}-${y}`}
                className={color === colors.peachDark ? 'animate-gill' : undefined}
                style={{
                  width: cellPx,
                  height: cellPx,
                  backgroundColor: color ?? 'transparent',
                }}
              />
            )),
          )}
        </div>
      </div>

      {mood === 'hungry' && (
        <span className="absolute -right-3 top-1 text-sm animate-mochi-bob" aria-hidden>
          🍙
        </span>
      )}
      {mood === 'sleepy' && (
        <span className="absolute -right-2 -top-1 text-xs font-pixel opacity-70 animate-mochi-bob" aria-hidden>
          zZ
        </span>
      )}
      {mood === 'yawning' && (
        <span className="absolute -right-3 top-0 text-sm animate-mochi-bob" aria-hidden>
          😴
        </span>
      )}
      {mood === 'lonely' && (
        <span className="absolute -left-3 top-2 text-sm opacity-80" aria-hidden>
          💭
        </span>
      )}
    </div>
  );
}

/** Cozy Pastel Pixel Art palette */
export const colors = {
  ink: '#4A4560',
  inkMuted: '#7A758C',
  cream: '#FFF8F0',
  creamDark: '#FAF0E4',
  sage: '#B8CDB8',
  sageDark: '#9BB89B',
  peach: '#FFD4C4',
  peachDark: '#F5BFB0',
  lavender: '#D4C4E8',
  lavenderDark: '#C4B0DC',
  rose: '#FFC8DD',
  roseDark: '#F0A8C0',
  mint: '#B5E4C4',
  mintDark: '#95D4AC',
  sky: '#A8D4F0',
  skyDark: '#88C0E8',
  coral: '#FFB899',
  coralDark: '#F5A080',
  gold: '#F0D890',
} as const;

export const statConfig = {
  hunger: {
    label: 'Hunger',
    icon: '🍙',
    from: colors.coral,
    to: colors.peach,
  },
  cleanliness: {
    label: 'Clean',
    icon: '✨',
    from: colors.mint,
    to: colors.sage,
  },
  kinship: {
    label: 'Bond',
    icon: '💕',
    from: colors.rose,
    to: colors.lavender,
  },
  energy: {
    label: 'Energy',
    icon: '⚡',
    from: colors.sky,
    to: colors.lavender,
  },
} as const;

export const careActions = [
  {
    action: 'feed' as const,
    label: 'Feed',
    emoji: '🍡',
    accentClass: 'care-btn-feed',
  },
  {
    action: 'pet' as const,
    label: 'Pet',
    emoji: '💗',
    accentClass: 'care-btn-pet',
  },
  {
    action: 'clean' as const,
    label: 'Clean',
    emoji: '🫧',
    accentClass: 'care-btn-clean',
  },
  {
    action: 'play' as const,
    label: 'Play',
    emoji: '🎮',
    accentClass: 'care-btn-play',
  },
] as const;

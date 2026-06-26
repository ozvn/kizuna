import { Home, Trophy, Users } from 'lucide-react';
import type { PetScreenTab } from '../types';

interface PetScreenNavProps {
  active: PetScreenTab;
  onChange: (tab: PetScreenTab) => void;
}

const tabs: { id: PetScreenTab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'leaderboard', label: 'Ranks', icon: Trophy },
  { id: 'friends', label: 'Friends', icon: Users },
];

export default function PetScreenNav({ active, onChange }: PetScreenNavProps) {
  return (
    <nav className="flex gap-1.5 w-full" aria-label="Pet screen navigation">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={[
              'game-nav-tab pixel-btn',
              isActive ? 'bg-lavender text-ink' : 'bg-parchment-light text-ink-muted',
            ].join(' ')}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

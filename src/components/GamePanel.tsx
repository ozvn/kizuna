import type { ReactNode } from 'react';

interface GamePanelProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}

/** Çift çerçeveli indie oyun paneli */
export default function GamePanel({ children, className = '', innerClassName = '' }: GamePanelProps) {
  return (
    <div className={`game-panel ${className}`}>
      <div className={`game-panel-inner ${innerClassName}`}>{children}</div>
    </div>
  );
}

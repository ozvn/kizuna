import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import Matchmaking from './components/Matchmaking';
import PetScreen from './components/PetScreen';
import SetupRequired from './components/SetupRequired';
import { isSupabaseConfigured } from './lib/supabase';

function AppContent() {
  const { user, profile, profileError, loading, refreshProfile } = useAuth();

  if (loading) {
    return (
      <div className="game-device-canvas safe-area">
        <div className="text-center space-y-3">
          <div className="game-loader mx-auto" />
          <p className="text-[10px] font-bold text-ink-muted text-stroke-soft">Loading Kizuna…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (!profile) {
    return (
      <div className="game-device-canvas safe-area">
        <div className="game-console max-w-sm w-full">
          <div className="pixel-card-inner p-5 text-center space-y-3">
            <p className="text-[10px] font-bold text-coral-dark">{profileError ?? 'Profile failed to load'}</p>
            <button
              type="button"
              onClick={() => refreshProfile()}
              className="pixel-btn px-4 py-2 text-[10px] font-bold bg-peach text-ink"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile.partner_id || !profile.pet_id) {
    return <Matchmaking />;
  }

  return <PetScreen />;
}

export default function App() {
  if (!isSupabaseConfigured) {
    return <SetupRequired />;
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

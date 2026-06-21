import { Database, Settings } from 'lucide-react';
import { getSupabaseConfigHint } from '../lib/supabase';

export default function SetupRequired() {
  const hint = getSupabaseConfigHint();

  return (
    <div className="game-device-canvas safe-area">
      <div className="game-console w-full max-w-md">
        <div className="pixel-card-inner p-5 space-y-3">
          <div className="flex items-center justify-center gap-2 pb-2 border-b-2 border-frame-light border-dashed">
            <Settings className="w-4 h-4 text-lavender-dark" />
            <h1 className="font-pixel text-[8px] text-ink text-stroke-title">Supabase Kurulumu</h1>
          </div>

          <p className="text-[10px] leading-relaxed text-ink-muted font-semibold">
            Uygulama başlatılamadı çünkü{' '}
            <code className="text-[9px] bg-parchment-dark px-1 border border-frame-light">.env</code>{' '}
            dosyasında geçerli Supabase bilgileri yok. Şu anki URL:{' '}
            <span className="text-coral-dark font-bold">{hint.url}</span>
          </p>

          <div className="game-panel">
            <div className="game-panel-inner space-y-2 text-[10px] leading-relaxed font-semibold">
              <p className="flex items-center gap-1 font-bold text-ink">
                <Database className="w-3 h-3" /> Adımlar:
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-1 text-ink-muted">
                <li>
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-dark underline"
                  >
                    supabase.com
                  </a>{' '}
                  üzerinde proje oluştur
                </li>
                <li>
                  SQL Editor&apos;de <code>supabase/schema.sql</code> dosyasını çalıştır
                </li>
                <li>Project Settings → API&apos;den URL ve anon key&apos;i kopyala</li>
                <li>
                  Proje kökündeki <code>.env</code> dosyasını düzenle:
                </li>
              </ol>
              <pre className="mt-1 p-2 bg-ink text-mint text-[9px] overflow-x-auto whitespace-pre-wrap border-2 border-frame">
{`VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...`}
              </pre>
              <p>
                Dev sunucusunu yeniden başlat: <code>npm run dev</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Database, Settings } from 'lucide-react';
import { getSupabaseConfigHint } from '../lib/supabase';

export default function SetupRequired() {
  const hint = getSupabaseConfigHint();

  return (
    <div className="game-device-canvas safe-area">
      <div className="game-console w-full max-w-md">
        <div className="pixel-card-inner p-6 space-y-4">
          <div className="flex items-center justify-center gap-2 pb-2 border-b-2 border-frame-light border-dashed">
            <Settings className="w-5 h-5 text-lavender-dark" />
            <h1 className="game-title-pixel text-ink text-stroke-title">Supabase Setup</h1>
          </div>

          <p className="game-body leading-relaxed text-ink-muted">
            The app could not start because{' '}
            <code className="game-caption bg-parchment-dark px-1.5 py-0.5 border border-frame-light">
              .env
            </code>{' '}
            is missing valid Supabase credentials. Current URL:{' '}
            <span className="text-coral-dark font-bold">{hint.url}</span>
          </p>

          <div className="game-panel">
            <div className="game-panel-inner space-y-2.5 game-body leading-relaxed">
              <p className="flex items-center gap-1.5 font-bold text-ink">
                <Database className="w-4 h-4" /> Steps:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 ml-1 text-ink-muted">
                <li>
                  Create a project at{' '}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-dark underline"
                  >
                    supabase.com
                  </a>
                </li>
                <li>
                  Run <code>supabase/schema.sql</code> in the SQL Editor
                </li>
                <li>Copy the URL and anon key from Project Settings → API</li>
                <li>
                  Edit the <code>.env</code> file in the project root:
                </li>
              </ol>
              <pre className="mt-1 p-3 bg-ink text-mint game-caption overflow-x-auto whitespace-pre-wrap border-2 border-frame">
{`VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...`}
              </pre>
              <p>
                Restart the dev server: <code>npm run dev</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

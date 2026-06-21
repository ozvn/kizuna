import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const PLACEHOLDER_VALUES = new Set([
  '',
  'your_supabase_project_url',
  'your_supabase_anon_key',
  'placeholder',
]);

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function readSupabaseConfig() {
  const url =
    (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
    (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined)?.trim() ||
    '';

  const anonKey =
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
    (import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim() ||
    (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
    '';

  const valid =
    !PLACEHOLDER_VALUES.has(url) &&
    !PLACEHOLDER_VALUES.has(anonKey) &&
    isValidHttpUrl(url) &&
    anonKey.length > 20;

  return { url, anonKey, valid };
}

const config = readSupabaseConfig();

export const isSupabaseConfigured = config.valid;

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!config.valid) {
    throw new Error(
      'Supabase yapılandırılmamış. .env dosyasına geçerli VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY ekleyin.',
    );
  }
  if (!client) {
    client = createClient(config.url, config.anonKey, {
      auth: {
        detectSessionInUrl: true,
        flowType: 'pkce',
        persistSession: true,
      },
    });
  }
  return client;
}

/** Yalnızca isSupabaseConfigured === true iken kullanın */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return Reflect.get(getClient(), prop);
  },
});

export function getSupabaseConfigHint(): { url: string; hasKey: boolean } {
  return {
    url: config.url || '(boş)',
    hasKey: Boolean(config.anonKey && !PLACEHOLDER_VALUES.has(config.anonKey)),
  };
}

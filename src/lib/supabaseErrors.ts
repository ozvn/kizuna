/** Supabase / PostgREST error input */
export type SupabaseErrorInput =
  | string
  | {
      message?: string;
      code?: string;
      details?: string | null;
      hint?: string | null;
    };

/** Turkish RPC messages still on the server → English UI */
const TR_TO_EN: Record<string, string> = {
  'Oturum açık değil': 'Not signed in',
  'Alıcı kullanıcı adı gerekli': 'Receiver username is required',
  'Pet adı 2-50 karakter olmalı': 'Pet name must be 2–50 characters',
  'Kendinize istek gönderemezsiniz': "You can't send a request to yourself",
  'Kullanıcı bulunamadı': 'User not found',
  'Zaten bir partneriniz var': 'You already have a partner',
  'İstek bulunamadı veya zaten işlendi': 'Request not found or already handled',
  'Bu isteği kabul etme yetkiniz yok': "You can't accept this request",
  'Bir veya her iki kullanıcı zaten eşleşmiş': 'One or both users are already matched',
  'Bu pete erişim yetkiniz yok': "You don't have access to this pet",
  'Partner zaten bir oyun ritüeli başlattı — onaylamayı bekle':
    'Your partner already started play — wait for confirmation',
  'Bekleyen ritüel bulunamadı': 'No pending ritual found',
  'Kendi başlattığın ritüeli sen onaylayamazsın': "You can't confirm a ritual you started",
  'Ritüel süresi doldu': 'Ritual expired',
  'Enerji yetersiz. Besle veya dinlenerek enerji topla.':
    'Not enough energy. Feed or rest to recover.',
};

const KNOWN_USER_MESSAGES = new Set([
  'Not signed in',
  'Receiver username is required',
  'Pet name must be 2–50 characters',
  "You can't send a request to yourself",
  'User not found',
  'You already have a partner',
  'Request not found or already handled',
  "You can't accept this request",
  'One or both users are already matched',
  "You don't have access to this pet",
  'Your partner already started play — wait for confirmation',
  'No pending ritual found',
  "You can't confirm a ritual you started",
  'Ritual expired',
  'Not enough energy. Feed or rest to recover.',
  'This username is already taken.',
  'Invalid username or password',
  'You already sent a request to this user',
  'Username must be at least 3 characters',
  'This username is already taken',
  'Enter your email address for the verification email.',
  'Pet not found',
  'You cannot friend your own pet',
  'Already friends with this pet',
  'A friend request is already pending',
  'Pet name must be at least 2 characters',
  'You do not have a pet yet',
  'You cannot play with your own pet',
  'You are not friends with this pet',
  'Friend play is on cooldown. Try again later.',
  'This friend pet is on play cooldown',
  'A friend play session is already pending',
  'Friend play session not found',
  'This friend play session is no longer pending',
  'Friend play session expired',
  'You do not have access to this session',
  'You already approved this session',
  'Both pets need matched couples to play together',
  'Friend request not found',
  'This request is not awaiting sender approval',
  'This request is not awaiting receiver approval',
  'Friend request expired',
  'You already approved this request',
  'You do not have access to this request',
  'You do not have access to this pet',
  ...Object.values(TR_TO_EN),
]);

function parseError(error: SupabaseErrorInput) {
  if (typeof error === 'string') {
    return { message: error, code: undefined as string | undefined, details: '', hint: '' };
  }
  return {
    message: error.message?.trim() || 'An unknown error occurred',
    code: error.code,
    details: error.details ?? '',
    hint: error.hint ?? '',
  };
}

function translateMessage(message: string): string {
  return TR_TO_EN[message] ?? message;
}

function formatCooldown(message: string): string | null {
  if (!message.startsWith('COOLDOWN:')) return null;
  const sec = parseInt(message.split(':')[1] ?? '0', 10);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `Ritual not ready yet. Wait ${h}h ${m}m.`;
  if (m > 0) return `Ritual not ready yet. Wait ${m} minutes.`;
  return 'Ritual not ready yet. Wait a little longer.';
}

function formatMissingFunction(fullText: string): string {
  if (fullText.includes('get_email_for_login')) {
    return 'Username login is unavailable. Please sign in with email.';
  }
  if (fullText.includes('send_match_request')) {
    return 'Matchmaking needs an update. Admin: run add_proposed_pet_name.sql.';
  }
  if (
    fullText.includes('sync_pet_ritual_state') ||
    fullText.includes('perform_ritual') ||
    fullText.includes('initiate_joint_play') ||
    fullText.includes('confirm_joint_play')
  ) {
    return 'Ritual system is not active. Admin: run macro_ritual_loop.sql.';
  }
  if (fullText.includes('ensure_user_profile')) {
    return 'Profile system is not active. Admin: run fix_missing_profiles.sql.';
  }
  if (
    fullText.includes('get_pet_leaderboard') ||
    fullText.includes('get_pet_social_state') ||
    fullText.includes('initiate_pet_friend_request')
  ) {
    return 'Leaderboard & friends need an update. Admin: run leaderboard_and_friends.sql.';
  }
  if (
    fullText.includes('initiate_friend_play') ||
    fullText.includes('confirm_friend_play') ||
    fullText.includes('decline_friend_play')
  ) {
    return 'Friend play needs an update. Admin: run friend_play.sql.';
  }
  return 'Server configuration is incomplete. Please try again later.';
}

function isTechnicalMessage(text: string): boolean {
  return /could not find|schema cache|relation "|pgrst|postgres|violates|duplicate key|jwt|invalid api key|network|fetch failed/i.test(
    text,
  );
}

/** Maps Supabase / PostgREST errors to user-friendly English messages */
export function formatSupabaseError(error: SupabaseErrorInput): string {
  const { message: rawMessage, code, details, hint } = parseError(error);
  const message = translateMessage(rawMessage);
  const fullText = `${rawMessage} ${details} ${hint}`.toLowerCase();

  if (KNOWN_USER_MESSAGES.has(message)) {
    return message;
  }

  const cooldown = formatCooldown(rawMessage);
  if (cooldown) return cooldown;

  if (code === '23505') {
    if (fullText.includes('username') || fullText.includes('profiles_username')) {
      return 'This username is already taken.';
    }
    if (fullText.includes('match_requests') || fullText.includes('unique_pending')) {
      return 'You already sent a request to this user';
    }
    return 'This action was already completed.';
  }

  if (
    code === 'PGRST202' ||
    code === '42883' ||
    rawMessage.toLowerCase().includes('could not find the function')
  ) {
    return formatMissingFunction(fullText);
  }

  if (
    rawMessage.toLowerCase().includes('could not find the table') ||
    fullText.includes('relation "public.profiles" does not exist') ||
    fullText.includes('relation "public.match_requests" does not exist') ||
    fullText.includes('relation "public.pets" does not exist')
  ) {
    return 'Database tables are not set up. Admin: run supabase/schema.sql.';
  }

  if (fullText.includes('infinite recursion')) {
    return 'Database security error. Admin: run fix_rls_recursion.sql.';
  }

  const lower = rawMessage.toLowerCase();

  if (lower.includes('email not confirmed') || lower.includes('email confirmation')) {
    return 'Email not verified yet. Check your inbox or request a new link.';
  }

  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'Invalid username or password';
  }

  if (lower.includes('user not found') || lower.includes('kullanıcı bulunamadı')) {
    return 'User not found';
  }

  if (lower.includes('email rate limit') || lower.includes('too many requests')) {
    return 'Too many attempts. Wait a moment and try again.';
  }

  if (lower.includes('jwt') || lower.includes('invalid api key')) {
    return 'Connection misconfigured. Contact the site admin.';
  }

  if (lower.includes('row-level security') || code === '42501') {
    return "You don't have permission. Sign out and sign in again.";
  }

  if (!isTechnicalMessage(rawMessage)) {
    return message;
  }

  return 'Something went wrong. Please try again.';
}

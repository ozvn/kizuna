/** Supabase / PostgREST hata girdisi */
export type SupabaseErrorInput =
  | string
  | {
      message?: string;
      code?: string;
      details?: string | null;
      hint?: string | null;
    };

/** RPC ve uygulama katmanından gelen, doğrudan gösterilebilir mesajlar */
const KNOWN_USER_MESSAGES = new Set([
  'Oturum açık değil',
  'Alıcı kullanıcı adı gerekli',
  'Pet adı 2-50 karakter olmalı',
  'Kendinize istek gönderemezsiniz',
  'Kullanıcı bulunamadı',
  'Zaten bir partneriniz var',
  'İstek bulunamadı veya zaten işlendi',
  'Bu isteği kabul etme yetkiniz yok',
  'Bir veya her iki kullanıcı zaten eşleşmiş',
  'Bu pete erişim yetkiniz yok',
  'Partner zaten bir oyun ritüeli başlattı — onaylamayı bekle',
  'Bekleyen ritüel bulunamadı',
  'Kendi başlattığın ritüeli sen onaylayamazsın',
  'Ritüel süresi doldu',
  'Enerji yetersiz. Besle veya dinlenerek enerji topla.',
  'Bu kullanıcı adı zaten alınmış.',
  'Kullanıcı adı veya şifre hatalı',
  'Bu kullanıcıya zaten istek gönderdiniz',
  'Kullanıcı adı en az 3 karakter olmalı',
  'Bu kullanıcı adı zaten alınmış',
  'Doğrulama maili için e-posta adresini gir.',
]);

function parseError(error: SupabaseErrorInput) {
  if (typeof error === 'string') {
    return { message: error, code: undefined as string | undefined, details: '', hint: '' };
  }
  return {
    message: error.message?.trim() || 'Bilinmeyen bir hata oluştu',
    code: error.code,
    details: error.details ?? '',
    hint: error.hint ?? '',
  };
}

function formatCooldown(message: string): string | null {
  if (!message.startsWith('COOLDOWN:')) return null;
  const sec = parseInt(message.split(':')[1] ?? '0', 10);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `Ritüel henüz hazır değil. ${h} saat ${m} dakika beklemen gerekiyor.`;
  if (m > 0) return `Ritüel henüz hazır değil. ${m} dakika beklemen gerekiyor.`;
  return 'Ritüel henüz hazır değil. Biraz daha bekle.';
}

function formatMissingFunction(fullText: string): string {
  if (fullText.includes('get_email_for_login')) {
    return 'Kullanıcı adı ile giriş şu an kullanılamıyor. Lütfen e-posta ile giriş yapın.';
  }
  if (fullText.includes('send_match_request')) {
    return 'Eşleşme sistemi güncellenmeli. Yönetici: add_proposed_pet_name.sql migration\'ını çalıştırın.';
  }
  if (
    fullText.includes('sync_pet_ritual_state') ||
    fullText.includes('perform_ritual') ||
    fullText.includes('initiate_joint_play') ||
    fullText.includes('confirm_joint_play')
  ) {
    return 'Ritüel sistemi henüz aktif değil. Yönetici: macro_ritual_loop.sql migration\'ını çalıştırın.';
  }
  if (fullText.includes('ensure_user_profile')) {
    return 'Profil sistemi henüz aktif değil. Yönetici: fix_missing_profiles.sql migration\'ını çalıştırın.';
  }
  return 'Sunucu yapılandırması eksik. Lütfen daha sonra tekrar deneyin.';
}

function isTechnicalMessage(text: string): boolean {
  return /could not find|schema cache|relation "|pgrst|postgres|violates|duplicate key|jwt|invalid api key|network|fetch failed/i.test(
    text,
  );
}

/** Supabase / PostgREST hatalarını kullanıcı dostu mesaja çevirir */
export function formatSupabaseError(error: SupabaseErrorInput): string {
  const { message, code, details, hint } = parseError(error);
  const fullText = `${message} ${details} ${hint}`.toLowerCase();

  if (KNOWN_USER_MESSAGES.has(message)) {
    return message;
  }

  const cooldown = formatCooldown(message);
  if (cooldown) return cooldown;

  if (code === '23505') {
    if (fullText.includes('username') || fullText.includes('profiles_username')) {
      return 'Bu kullanıcı adı zaten alınmış.';
    }
    if (fullText.includes('match_requests') || fullText.includes('unique_pending')) {
      return 'Bu kullanıcıya zaten istek gönderdiniz';
    }
    return 'Bu işlem zaten yapılmış.';
  }

  if (
    code === 'PGRST202' ||
    code === '42883' ||
    message.toLowerCase().includes('could not find the function')
  ) {
    return formatMissingFunction(fullText);
  }

  if (
    message.toLowerCase().includes('could not find the table') ||
    fullText.includes('relation "public.profiles" does not exist') ||
    fullText.includes('relation "public.match_requests" does not exist') ||
    fullText.includes('relation "public.pets" does not exist')
  ) {
    return 'Veritabanı tabloları henüz kurulmamış. Yönetici: supabase/schema.sql dosyasını çalıştırsın.';
  }

  if (fullText.includes('infinite recursion')) {
    return 'Veritabanı güvenlik ayarı hatası. Yönetici: fix_rls_recursion.sql dosyasını çalıştırsın.';
  }

  const lower = message.toLowerCase();

  if (lower.includes('email not confirmed') || lower.includes('email confirmation')) {
    return 'E-posta henüz doğrulanmamış. Gelen kutunu kontrol et veya yeni doğrulama linki iste.';
  }

  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'Kullanıcı adı veya şifre hatalı';
  }

  if (lower.includes('user not found') || lower.includes('kullanıcı bulunamadı')) {
    return 'Kullanıcı bulunamadı';
  }

  if (lower.includes('email rate limit') || lower.includes('too many requests')) {
    return 'Çok fazla deneme. Biraz bekleyip tekrar deneyin.';
  }

  if (lower.includes('jwt') || lower.includes('invalid api key')) {
    return 'Bağlantı yapılandırması hatalı. Site yöneticisine haber verin.';
  }

  if (lower.includes('row-level security') || code === '42501') {
    return 'Bu işlem için yetkiniz yok. Oturumu kapatıp tekrar giriş yapmayı deneyin.';
  }

  if (!isTechnicalMessage(message)) {
    return message;
  }

  return 'Bir hata oluştu. Lütfen tekrar deneyin.';
}

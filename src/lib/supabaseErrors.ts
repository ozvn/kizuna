/** Supabase / PostgREST hatalarını kullanıcı dostu mesaja çevirir */
export function formatSupabaseError(message: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("could not find the table") ||
    lower.includes('relation "public.profiles" does not exist') ||
    lower.includes('schema cache')
  ) {
    return 'Veritabanı tabloları henüz kurulmamış. Supabase Dashboard → SQL Editor → supabase/schema.sql dosyasını çalıştırın.';
  }

  if (lower.includes('get_email_for_login') || lower.includes('could not find the function')) {
    return 'Kullanıcı adı ile giriş henüz kurulmamış. Supabase SQL Editor\'de supabase/migrations/fix_login_by_username.sql dosyasını çalıştırın.';
  }

  if (lower.includes('duplicate key') && lower.includes('username')) {
    return 'Bu kullanıcı adı zaten alınmış.';
  }

  if (lower.includes('email not confirmed') || lower.includes('email confirmation')) {
    return 'E-posta henüz doğrulanmamış. Gelen kutunu kontrol et veya yeni doğrulama linki iste.';
  }

  if (lower.includes('infinite recursion')) {
    return 'Veritabanı güvenlik ayarı hatası. supabase/migrations/fix_rls_recursion.sql dosyasını SQL Editor\'de çalıştırın.';
  }

  if (message.startsWith('COOLDOWN:')) {
    const sec = parseInt(message.split(':')[1] ?? '0', 10);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h > 0) return `Ritüel henüz hazır değil. ${h} saat ${m} dakika beklemen gerekiyor.`;
    if (m > 0) return `Ritüel henüz hazır değil. ${m} dakika beklemen gerekiyor.`;
    return 'Ritüel henüz hazır değil. Biraz daha bekle.';
  }

  if (lower.includes('sync_pet_ritual_state') || lower.includes('perform_ritual')) {
    return 'Ritüel sistemi henüz kurulmamış. supabase/migrations/macro_ritual_loop.sql dosyasını SQL Editor\'de çalıştırın.';
  }

  if (lower.includes('proposed_pet_name') || lower.includes('send_match_request')) {
    return 'Pet ismi özelliği henüz kurulmamış. supabase/migrations/add_proposed_pet_name.sql dosyasını SQL Editor\'de çalıştırın.';
  }

  if (lower.includes('pet adı 2-50')) {
    return 'Pet adı 2-50 karakter arasında olmalı.';
  }

  if (lower.includes('email rate limit')) {
    return 'Çok fazla deneme. Biraz bekleyip tekrar deneyin.';
  }

  return message;
}

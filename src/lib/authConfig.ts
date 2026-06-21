/** E-posta doğrulama zorunlu mu? Supabase'te kapalıyken false (varsayılan). */
export const EMAIL_CONFIRMATION_ENABLED =
  import.meta.env.VITE_REQUIRE_EMAIL_CONFIRMATION === 'true';

/** URL hash içindeki Supabase auth hatalarını okur ve adres çubuğunu temizler */
export function consumeAuthCallbackMessage(): string | null {
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  const search = window.location.search.startsWith('?')
    ? window.location.search.slice(1)
    : window.location.search;

  const params = new URLSearchParams(hash || search);
  const errorCode = params.get('error_code');
  const errorDescription = params.get('error_description');
  const error = params.get('error');

  if (!error && !errorCode && !errorDescription) {
    return null;
  }

  window.history.replaceState(null, '', window.location.pathname);

  if (errorCode === 'otp_expired' || errorDescription?.toLowerCase().includes('expired')) {
    return 'Doğrulama linkinin süresi dolmuş veya zaten kullanılmış. Giriş ekranından yeni link isteyebilirsin.';
  }

  if (errorDescription) {
    return decodeURIComponent(errorDescription.replace(/\+/g, ' '));
  }

  if (error === 'access_denied') {
    return 'E-posta doğrulaması tamamlanamadı. Yeni bir doğrulama linki iste.';
  }

  return error ?? 'Giriş işlemi tamamlanamadı.';
}

export function getAuthRedirectUrl(): string {
  return `${window.location.origin}/`;
}

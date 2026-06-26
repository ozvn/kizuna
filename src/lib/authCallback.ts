/** Reads Supabase auth errors from the URL hash and clears the address bar */
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
    return 'This verification link expired or was already used. Request a new one from the sign-in screen.';
  }

  if (errorDescription) {
    return decodeURIComponent(errorDescription.replace(/\+/g, ' '));
  }

  if (error === 'access_denied') {
    return 'Email verification could not be completed. Request a new verification link.';
  }

  return error ?? 'Sign-in could not be completed.';
}

export function getAuthRedirectUrl(): string {
  return `${window.location.origin}/`;
}

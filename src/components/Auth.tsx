import { useState, FormEvent, useEffect } from 'react';
import { Heart, LogIn, UserPlus, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { consumeAuthCallbackMessage } from '../lib/authCallback';
import { EMAIL_CONFIRMATION_ENABLED } from '../lib/authConfig';

export default function Auth() {
  const { signIn, signUp, resendConfirmation } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    if (!EMAIL_CONFIRMATION_ENABLED) return;

    const callbackError = consumeAuthCallbackMessage();
    if (callbackError) {
      setError(callbackError);
      setShowResend(true);
      setMode('login');
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setShowResend(false);
    setLoading(true);

    if (mode === 'register') {
      const { error: err, needsConfirmation } = await signUp(email, password, username);
      if (err) {
        setError(err);
      } else if (needsConfirmation && EMAIL_CONFIRMATION_ENABLED) {
        setSuccess('Kayıt başarılı! E-postandaki linke tıkla, ardından giriş yap.');
        setShowResend(true);
        setLoginIdentifier(email);
        setMode('login');
      } else {
        setSuccess('Kayıt başarılı! Şimdi giriş yapabilirsin.');
        setLoginIdentifier(username || email);
        setMode('login');
      }
    } else {
      const { error: err } = await signIn(loginIdentifier, password);
      if (err) {
        setError(err);
        if (
          EMAIL_CONFIRMATION_ENABLED &&
          (err.includes('doğrulanmamış') || err.includes('confirm'))
        ) {
          setShowResend(true);
        }
      }
    }

    setLoading(false);
  };

  const handleResend = async () => {
    const targetEmail = loginIdentifier.includes('@') ? loginIdentifier : email;
    if (!targetEmail || !targetEmail.includes('@')) {
      setError('Doğrulama maili için e-posta adresini gir.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error: err } = await resendConfirmation(targetEmail);
    if (err) setError(err);
    else setSuccess('Yeni doğrulama e-postası gönderildi.');
    setLoading(false);
  };

  return (
    <div className="game-device-canvas safe-area">
      <div className="game-console w-full max-w-sm">
        <div className="pixel-card-inner p-5 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 text-rose-dark" fill="#F0A8C0" />
            <h1 className="font-pixel text-[9px] text-ink text-stroke-title">Kizuna</h1>
          </div>

          <p className="text-[10px] text-center text-ink-muted font-bold leading-relaxed text-stroke-soft">
            Ortak sanal pet deneyimi
            <br />
            Petinizi birlikte büyütün
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="text-[10px] font-bold block mb-1 text-ink">Kullanıcı Adı</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={30}
                  autoComplete="username"
                  className="game-input"
                />
              </div>
            )}

            {mode === 'login' ? (
              <div>
                <label className="text-[10px] font-bold block mb-1 text-ink">
                  E-posta veya Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  className="game-input"
                />
              </div>
            ) : (
              <div>
                <label className="text-[10px] font-bold block mb-1 text-ink">E-posta</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="game-input"
                />
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold block mb-1 text-ink">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="game-input"
              />
            </div>

            {error && <p className="game-alert game-alert-error">{error}</p>}

            {success && <p className="game-alert game-alert-success leading-relaxed">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="pixel-btn w-full py-2.5 text-[10px] font-bold bg-lavender text-ink flex items-center justify-center gap-1.5"
            >
              {mode === 'login' ? (
                <>
                  <LogIn className="w-3.5 h-3.5" /> Giriş Yap
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" /> Kayıt Ol
                </>
              )}
            </button>
          </form>

          {EMAIL_CONFIRMATION_ENABLED && showResend && mode === 'login' && (
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="pixel-btn w-full py-2 text-[9px] font-bold bg-sky text-ink flex items-center justify-center gap-1.5"
            >
              <Mail className="w-3 h-3" />
              Doğrulama e-postasını tekrar gönder
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError(null);
              setSuccess(null);
              setShowResend(false);
            }}
            className="w-full text-[9px] font-bold text-ink-muted hover:text-ink underline underline-offset-2"
          >
            {mode === 'login' ? 'Hesabın yok mu? Kayıt ol' : 'Zaten hesabın var mı? Giriş yap'}
          </button>

          <p className="text-[8px] text-center text-ink-muted font-semibold pt-1 border-t-2 border-frame-light border-dashed">
            Bu oyun Kumsal için yapılmıştır
          </p>
        </div>
      </div>
    </div>
  );
}

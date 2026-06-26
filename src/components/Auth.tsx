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
        setSuccess('Account created! Check your email, then sign in.');
        setShowResend(true);
        setLoginIdentifier(email);
        setMode('login');
      } else {
        setSuccess('Account created! You can sign in now.');
        setLoginIdentifier(username || email);
        setMode('login');
      }
    } else {
      const { error: err } = await signIn(loginIdentifier, password);
      if (err) {
        setError(err);
        if (
          EMAIL_CONFIRMATION_ENABLED &&
          (err.toLowerCase().includes('verified') || err.includes('confirm'))
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
      setError('Enter your email address for the verification email.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error: err } = await resendConfirmation(targetEmail);
    if (err) setError(err);
    else setSuccess('A new verification email was sent.');
    setLoading(false);
  };

  return (
    <div className="game-device-canvas safe-area">
      <div className="game-console w-full max-w-sm">
        <div className="pixel-card-inner p-6 space-y-5">
          <div className="flex items-center justify-center gap-2.5">
            <Heart className="w-6 h-6 text-rose-dark" fill="#F0A8C0" />
            <h1 className="game-title-pixel text-ink text-stroke-title">Kizuna</h1>
          </div>

          <p className="game-body text-center text-ink-muted leading-relaxed text-stroke-soft">
            A shared virtual pet experience
            <br />
            Raise your pet together
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="game-label block mb-1.5 text-ink">Username</label>
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
                <label className="game-label block mb-1.5 text-ink">
                  Email or Username
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
                <label className="game-label block mb-1.5 text-ink">Email</label>
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
              <label className="game-label block mb-1.5 text-ink">Password</label>
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
              className="pixel-btn w-full py-3 bg-lavender text-ink flex items-center justify-center gap-2"
            >
              {mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Sign Up
                </>
              )}
            </button>
          </form>

          {EMAIL_CONFIRMATION_ENABLED && showResend && mode === 'login' && (
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="pixel-btn w-full py-2.5 bg-sky text-ink flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Resend verification email
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
            className="w-full game-caption text-ink-muted hover:text-ink underline underline-offset-2"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>

          <p className="game-caption text-center text-ink-muted pt-2 border-t-2 border-frame-light border-dashed">
            Made with love for Kumsal
          </p>
        </div>
      </div>
    </div>
  );
}

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';
import { formatSupabaseError } from '../lib/supabaseErrors';
import { getAuthRedirectUrl } from '../lib/authCallback';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  partner: Profile | null;
  profileError: string | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    username: string,
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signIn: (identifier: string, password: string) => Promise<{ error: string | null }>;
  resendConfirmation: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    setProfileError(null);

    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('profile fetch:', error);
      setProfileError(formatSupabaseError(error.message));
      setProfile(null);
      setPartner(null);
      return;
    }

    if (!data) {
      const { data: ensured, error: ensureError } = await supabase.rpc('ensure_user_profile');

      if (ensureError || !ensured) {
        console.error('ensure profile:', ensureError);
        setProfileError(
          ensureError
            ? formatSupabaseError(ensureError.message)
            : 'Profil oluşturulamadı. Supabase\'de fix_missing_profiles.sql dosyasını çalıştırın.',
        );
        setProfile(null);
        setPartner(null);
        return;
      }

      data = ensured as Profile;
    }

    setProfile(data as Profile);

    if (data.partner_id) {
      const { data: partnerData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.partner_id)
        .maybeSingle();
      setPartner((partnerData as Profile) ?? null);
    } else {
      setPartner(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id);
      } else {
        setProfile(null);
        setPartner(null);
        setProfileError(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`profile-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile.id}`,
        },
        () => {
          fetchProfile(profile.id);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, fetchProfile]);

  const signUp = async (email: string, password: string, username: string) => {
    const trimmed = username.trim().toLowerCase();
    if (trimmed.length < 3) {
      return { error: 'Kullanıcı adı en az 3 karakter olmalı', needsConfirmation: false };
    }

    const { data: existing, error: lookupError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', trimmed)
      .maybeSingle();

    if (lookupError) {
      return { error: formatSupabaseError(lookupError.message), needsConfirmation: false };
    }

    if (existing) {
      return { error: 'Bu kullanıcı adı zaten alınmış', needsConfirmation: false };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: trimmed },
        emailRedirectTo: getAuthRedirectUrl(),
      },
    });

    if (error) return { error: formatSupabaseError(error.message), needsConfirmation: false };

    const needsConfirmation = data.user !== null && data.session === null;
    return { error: null, needsConfirmation };
  };

  const signIn = async (identifier: string, password: string) => {
    const trimmed = identifier.trim();
    const normalized = trimmed.includes('@') ? trimmed : trimmed.toLowerCase();
    let email = normalized;

    if (!normalized.includes('@')) {
      const { data, error: lookupError } = await supabase.rpc('get_email_for_login', {
        identifier: normalized,
      });

      if (lookupError) {
        console.error('get_email_for_login:', lookupError);
        return { error: formatSupabaseError(lookupError.message) };
      }

      if (!data) {
        return { error: 'Kullanıcı adı veya şifre hatalı' };
      }

      email = data as string;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
        return { error: 'Kullanıcı adı veya şifre hatalı' };
      }
      return { error: formatSupabaseError(error.message) };
    }

    return { error: null };
  };

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: getAuthRedirectUrl() },
    });
    return { error: error ? formatSupabaseError(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setPartner(null);
    setProfileError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        partner,
        profileError,
        loading,
        signUp,
        signIn,
        resendConfirmation,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import { useState, useEffect, useCallback } from 'react';
import {
  initAuth,
  onAuthChange,
  signInWithOAuth,
  signInWithEmail,
  signUp,
  signOut as doSignOut,
  getUser,
  isAuthenticated as checkAuth,
} from '../utils/auth';
import type { User, OAuthProvider } from '../utils/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initAuth()
      .then(() => {
        setUser(getUser());
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    const unsub = onAuthChange((u) => setUser(u));
    return unsub;
  }, []);

  const loginWithOAuth = useCallback(async (provider: OAuthProvider) => {
    setError(null);
    setLoading(true);
    try {
      await signInWithOAuth(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OAuth sign-in failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      setError(null);
      setLoading(true);
      try {
        await signInWithEmail(email, password);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sign-in failed');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const register = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      await signUp(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-up failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setError(null);
    try {
      await doSignOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-out failed');
    }
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: checkAuth(),
    loginWithOAuth,
    loginWithEmail,
    register,
    signOut: signOutUser,
  };
}

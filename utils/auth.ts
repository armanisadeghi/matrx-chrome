// ============================================
// Matrx Auth — Supabase + chrome.identity OAuth
// ============================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { OAuthProvider, User, Session } from './types';

const SUPABASE_URL = 'https://txzxabzwovsujtloxrus.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4pvkRT-9-_dB0PWqF1sp1w_W9leRIoW';

// Chrome storage adapter for Supabase auth persistence
class ChromeStorageAdapter {
  async getItem(key: string): Promise<string | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] ?? null);
      });
    });
  }

  async setItem(key: string, value: string): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
  }

  async removeItem(key: string): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove([key], resolve);
    });
  }
}

let supabaseClient: SupabaseClient | null = null;
let currentUser: User | null = null;
let currentSession: Session | null = null;
let initialized = false;

const listeners = new Set<(user: User | null) => void>();

export function onAuthChange(cb: (user: User | null) => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notifyListeners() {
  listeners.forEach((cb) => cb(currentUser));
}

export async function initAuth(): Promise<void> {
  if (initialized) return;

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      storage: new ChromeStorageAdapter(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (session) {
    currentSession = session as unknown as Session;
    currentUser = session.user as unknown as User;
  }

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    currentSession = session as unknown as Session | null;
    currentUser = session?.user as unknown as User | null;
    notifyListeners();
  });

  initialized = true;
}

export async function signInWithOAuth(provider: OAuthProvider) {
  if (!supabaseClient) throw new Error('Auth not initialized');

  const redirectUrl = chrome.identity.getRedirectURL();

  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error('No OAuth URL returned');

  const resultUrl = await new Promise<string>((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: data.url, interactive: true },
      (callbackUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (!callbackUrl) {
          reject(new Error('No callback URL received'));
        } else {
          resolve(callbackUrl);
        }
      },
    );
  });

  const hashParams = new URLSearchParams(resultUrl.split('#')[1]);
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');

  if (!accessToken || !refreshToken) {
    throw new Error('No tokens in callback URL');
  }

  const { data: sessionData, error: sessionError } =
    await supabaseClient.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

  if (sessionError) throw sessionError;

  currentSession = sessionData.session as unknown as Session;
  currentUser = sessionData.user as unknown as User;
  notifyListeners();

  return { session: currentSession, user: currentUser };
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabaseClient) throw new Error('Auth not initialized');
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  currentSession = data.session as unknown as Session;
  currentUser = data.user as unknown as User;
  notifyListeners();
  return data;
}

export async function signUp(email: string, password: string) {
  if (!supabaseClient) throw new Error('Auth not initialized');
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabaseClient) throw new Error('Auth not initialized');
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
  currentUser = null;
  currentSession = null;
  notifyListeners();
}

export async function getAccessToken(): Promise<string | null> {
  if (!supabaseClient || !currentSession) return null;
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  currentSession = session as unknown as Session;
  return session?.access_token ?? null;
}

export function getUser(): User | null {
  return currentUser;
}

export function isAuthenticated(): boolean {
  return !!currentUser && !!currentSession;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
    apikey: SUPABASE_KEY,
  };
}

export function getSupabaseClient(): SupabaseClient | null {
  return supabaseClient;
}

export { SUPABASE_URL, SUPABASE_KEY };

import { useState } from 'react';
import { Mail, Lock, Github } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { StatusMessage } from '../ui/StatusMessage';

export function LoginForm() {
  const { loginWithOAuth, loginWithEmail, register, loading, error } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signin') {
      await loginWithEmail(email, password);
    } else {
      await register(email, password);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {error && <StatusMessage type="error">{error}</StatusMessage>}

      {/* OAuth Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => loginWithOAuth('google')}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-2 py-2
            bg-[var(--m-bg-card)] border border-[var(--m-border)]
            rounded-[var(--m-radius-md)] font-medium
            hover:bg-[var(--m-bg-hover)] hover:border-[var(--m-border-strong)]
            transition-all cursor-pointer disabled:opacity-50"
          style={{ fontSize: '12px' }}
        >
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>

        <button
          onClick={() => loginWithOAuth('github')}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-2 py-2
            bg-[var(--m-bg-card)] border border-[var(--m-border)]
            rounded-[var(--m-radius-md)] font-medium
            hover:bg-[var(--m-bg-hover)] hover:border-[var(--m-border-strong)]
            transition-all cursor-pointer disabled:opacity-50"
          style={{ fontSize: '12px' }}
        >
          <Github className="w-3.5 h-3.5 shrink-0" />
          GitHub
        </button>

        <button
          onClick={() => loginWithOAuth('apple')}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-2 py-2
            bg-[var(--m-bg-card)] border border-[var(--m-border)]
            rounded-[var(--m-radius-md)] font-medium
            hover:bg-[var(--m-bg-hover)] hover:border-[var(--m-border-strong)]
            transition-all cursor-pointer disabled:opacity-50"
          style={{ fontSize: '12px' }}
        >
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          Apple
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center">
        <div className="flex-1 border-t border-[var(--m-border)]" />
        <span className="px-3 text-[color:var(--m-text-tertiary)]" style={{ fontSize: '11px' }}>
          Or continue with email
        </span>
        <div className="flex-1 border-t border-[var(--m-border)]" />
      </div>

      {/* Email Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button variant="primary" block loading={loading} type="submit">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </Button>
      </form>

      <button
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        className="text-[var(--m-brand)] hover:underline cursor-pointer text-center"
        style={{ fontSize: '11px' }}
      >
        {mode === 'signin'
          ? "Don't have an account? Sign up"
          : 'Already have an account? Sign in'}
      </button>
    </div>
  );
}

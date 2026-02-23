import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system');

  useEffect(() => {
    chrome.storage.sync.get(['theme'], (result) => {
      const t = (result.theme as Theme) || 'system';
      setThemeState(t);
      applyTheme(t);
    });
  }, []);

  // Listen for system color scheme changes so 'system' mode reacts instantly
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    chrome.storage.sync.set({ theme: t });
    applyTheme(t);
  }, []);

  return { theme, setTheme };
}

function applyTheme(theme: Theme) {
  const prefersDark =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : theme === 'dark';

  document.documentElement.classList.toggle('dark', prefersDark);
  document.documentElement.setAttribute(
    'data-theme',
    prefersDark ? 'dark' : 'light',
  );
}

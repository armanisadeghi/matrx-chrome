import { useState, useEffect } from 'react';
import { Moon, Sun, Monitor, Folder, Loader2, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { LoginForm } from '../auth/LoginForm';
import { Button, Badge } from '../ui';
import { fetchUserProjects } from '../../utils/supabase-queries';
import { getLocal, setLocal } from '../../utils/storage';

const STORAGE_KEY_PROJECT = 'matrx_default_project_id';

export function SettingsPanel() {
  const { user, isAuthenticated, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [defaultProjectId, setDefaultProjectId] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingProjects(true);
    Promise.all([
      fetchUserProjects(),
      getLocal<string>(STORAGE_KEY_PROJECT),
    ]).then(([userProjects, savedId]) => {
      setProjects(userProjects);
      if (savedId && userProjects.some((p) => p.id === savedId)) {
        setDefaultProjectId(savedId);
      } else if (userProjects.length === 1) {
        setDefaultProjectId(userProjects[0].id);
      }
    }).finally(() => setLoadingProjects(false));
  }, [isAuthenticated]);

  const handleProjectChange = async (projectId: string) => {
    setDefaultProjectId(projectId);
    if (projectId) {
      await setLocal(STORAGE_KEY_PROJECT, projectId);
    }
  };

  const themeOptions: { value: 'light' | 'dark' | 'system'; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Account */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-3.5 h-3.5 text-[var(--m-brand)]" />
          <span className="text-sm font-semibold text-[color:var(--m-text-primary)]">Account</span>
          {isAuthenticated && <Badge variant="success">Connected</Badge>}
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-3 px-3 py-2.5 bg-[var(--m-bg-inset)] rounded-[var(--m-radius-md)]">
            <div className="w-8 h-8 rounded-full bg-[var(--m-brand-subtle)] flex items-center justify-center shrink-0">
              <span className="text-[var(--m-brand)] font-semibold text-sm">
                {user?.email?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[color:var(--m-text-primary)] truncate">
                {user?.email}
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={signOut} title="Sign out">
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </Button>
          </div>
        ) : (
          <LoginForm />
        )}
      </section>

      {/* Appearance */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Moon className="w-3.5 h-3.5 text-[var(--m-brand)]" />
          <span className="text-sm font-semibold text-[color:var(--m-text-primary)]">Appearance</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-[var(--m-radius-md)] border cursor-pointer transition-all ${
                theme === value
                  ? 'border-[var(--m-brand)] bg-[var(--m-brand-subtle)] text-[var(--m-brand)]'
                  : 'border-[var(--m-border)] text-[color:var(--m-text-tertiary)] hover:border-[var(--m-border-strong)] hover:text-[color:var(--m-text-secondary)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium" style={{ fontSize: '11px' }}>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Default Project */}
      {isAuthenticated && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Folder className="w-3.5 h-3.5 text-[var(--m-brand)]" />
            <span className="text-sm font-semibold text-[color:var(--m-text-primary)]">Default Project</span>
          </div>
          {loadingProjects ? (
            <div className="flex items-center gap-2 text-[color:var(--m-text-tertiary)] text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <p className="text-xs text-[color:var(--m-text-tertiary)]">
              No projects found. Create one in the Matrx web app.
            </p>
          ) : (
            <select
              value={defaultProjectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-[var(--m-bg-inset)] text-[color:var(--m-text-primary)] border border-[var(--m-border)] rounded-[var(--m-radius-md)] focus:outline-none focus:border-[var(--m-brand)] focus:ring-2 focus:ring-[var(--m-brand-ring)]"
            >
              <option value="">Select a default project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          <p className="text-xs text-[color:var(--m-text-tertiary)] mt-1.5">
            Used as the default in Research and Quick Scrape panels
          </p>
        </section>
      )}

      {/* Version */}
      <p className="text-center text-[color:var(--m-text-tertiary)] text-xs mt-2">
        Matrx Extension v2.0.0
      </p>
    </div>
  );
}

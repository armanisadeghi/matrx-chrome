import { useState, useEffect } from 'react';
import { Moon, Sun, Monitor, Shield, Folder, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import {
  Card,
  CardHeader,
  CardBody,
  Badge,
} from '../../components/ui';
import { LoginForm } from '../../components/auth/LoginForm';
import { AuthStatus } from '../../components/auth/AuthStatus';
import { fetchUserProjects } from '../../utils/supabase-queries';
import { getLocal, setLocal } from '../../utils/storage';

const STORAGE_KEY_PROJECT = 'matrx_default_project_id';

export function OptionsPage() {
  const { user, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();

  // Project selection
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [defaultProjectId, setDefaultProjectId] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Load projects + saved default project when authenticated
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
    <div className="min-h-screen bg-[var(--m-bg-page)] flex justify-center py-8 px-6">
      <div className="w-full max-w-xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-[var(--m-radius-lg)] bg-[var(--m-brand)] flex items-center justify-center">
            <span className="text-white text-lg font-bold">M</span>
          </div>
          <div>
            <h1 className="text-[var(--m-text-xl)] font-bold text-[var(--m-text-primary)]">
              Matrx Settings
            </h1>
            <p className="text-[var(--m-text-sm)] text-[var(--m-text-secondary)]">
              Configure your extension preferences
            </p>
          </div>
        </div>

        {/* Authentication */}
        <Card elevated>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--m-brand)]" />
              <h2 className="text-[var(--m-text-md)] font-semibold">Authentication</h2>
            </div>
            {isAuthenticated && <Badge variant="success">Connected</Badge>}
          </CardHeader>
          <CardBody>
            {isAuthenticated ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 bg-[var(--m-bg-inset)] rounded-[var(--m-radius-md)]">
                  <div className="w-10 h-10 rounded-full bg-[var(--m-brand-subtle)] flex items-center justify-center">
                    <span className="text-[var(--m-brand)] font-semibold text-[var(--m-text-lg)]">
                      {user?.email?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-[var(--m-text-md)] font-medium text-[var(--m-text-primary)]">
                      {user?.email}
                    </p>
                    <p className="text-[var(--m-text-xs)] text-[var(--m-text-tertiary)]">
                      ID: {user?.id?.substring(0, 8)}...
                    </p>
                  </div>
                </div>
                <AuthStatus />
              </div>
            ) : (
              <LoginForm />
            )}
          </CardBody>
        </Card>

        {/* Appearance */}
        <Card elevated>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-[var(--m-brand)]" />
              <h2 className="text-[var(--m-text-md)] font-semibold">Appearance</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-[var(--m-radius-md)] border cursor-pointer transition-all ${
                    theme === value
                      ? 'border-[var(--m-brand)] bg-[var(--m-brand-subtle)] text-[var(--m-brand)]'
                      : 'border-[var(--m-border)] text-[var(--m-text-tertiary)] hover:border-[var(--m-border-strong)] hover:text-[var(--m-text-secondary)]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[var(--m-text-sm)] font-medium">{label}</span>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Default Project — only visible when signed in */}
        {isAuthenticated && (
          <Card elevated>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-[var(--m-brand)]" />
                <h2 className="text-[var(--m-text-md)] font-semibold">Default Project</h2>
              </div>
              {defaultProjectId && <Badge variant="info">Set</Badge>}
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-2">
                <label className="text-[var(--m-text-sm)] font-medium text-[var(--m-text-primary)]">
                  Project
                </label>
                {loadingProjects ? (
                  <div className="flex items-center gap-2 text-[var(--m-text-sm)] text-[var(--m-text-tertiary)]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading projects...
                  </div>
                ) : projects.length === 0 ? (
                  <p className="text-[var(--m-text-sm)] text-[var(--m-text-tertiary)]">
                    No projects found. Create one in the Matrx web app.
                  </p>
                ) : (
                  <select
                    value={defaultProjectId}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    className="w-full px-3 py-2 text-[var(--m-text-sm)] bg-[var(--m-bg-input)] text-[var(--m-text-primary)] border border-[var(--m-border)] rounded-[var(--m-radius-md)] focus:outline-none focus:ring-1 focus:ring-[var(--m-brand)]"
                  >
                    <option value="">Select a default project...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                )}
                <p className="text-[var(--m-text-xs)] text-[var(--m-text-tertiary)]">
                  Used as the default in Research and Quick Scrape panels
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Version */}
        <p className="text-center text-[var(--m-text-xs)] text-[var(--m-text-tertiary)] mt-2">
          Matrx Extension v2.0.0
        </p>
      </div>
    </div>
  );
}

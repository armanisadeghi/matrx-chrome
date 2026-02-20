import { useState, useEffect } from 'react';
import { Save, Moon, Sun, Monitor, Database, Globe, Shield, Folder, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Input,
  Badge,
} from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { LoginForm } from '../../components/auth/LoginForm';
import { AuthStatus } from '../../components/auth/AuthStatus';
import { fetchUserProjects } from '../../utils/supabase-queries';
import { healthCheck, setApiBaseUrl as setGlobalApiBaseUrl } from '../../utils/api-client';
import { getLocal, setLocal } from '../../utils/storage';

const STORAGE_KEY_PROJECT = 'matrx_default_project_id';

export function OptionsPage() {
  const { user, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [tableName, setTableName] = useState('html_extractions');
  const [saving, setSaving] = useState(false);

  // Project selection
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [defaultProjectId, setDefaultProjectId] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(false);

  // API connection test
  const [testingApi, setTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    chrome.storage.sync.get(['apiBaseUrl', 'supabaseTableName'], (result) => {
      setApiBaseUrl(result.apiBaseUrl || '');
      setTableName(result.supabaseTableName || 'html_extractions');
    });
  }, []);

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

  const testApiConnection = async () => {
    setTestingApi(true);
    setApiTestResult(null);
    // Temporarily set the global URL to test against the current input value
    if (apiBaseUrl) setGlobalApiBaseUrl(apiBaseUrl);
    try {
      const res = await healthCheck();
      if (res.success) {
        setApiTestResult({ ok: true, message: `Connected — ${(res.data as { service?: string })?.service || 'API'} is healthy` });
      } else {
        setApiTestResult({ ok: false, message: res.error || 'Connection failed' });
      }
    } catch {
      setApiTestResult({ ok: false, message: 'Network error — cannot reach API' });
    }
    setTestingApi(false);
  };

  const handleProjectChange = async (projectId: string) => {
    setDefaultProjectId(projectId);
    if (projectId) {
      await setLocal(STORAGE_KEY_PROJECT, projectId);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await new Promise<void>((resolve) => {
        chrome.storage.sync.set(
          { apiBaseUrl, supabaseTableName: tableName },
          resolve,
        );
      });
      toast('Settings saved', 'success');
    } catch {
      toast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const themeOptions: { value: 'light' | 'dark' | 'system'; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className="min-h-screen bg-[var(--m-bg-page)] flex justify-center py-8 px-4">
      <div className="w-full max-w-[520px] flex flex-col gap-4">
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

        {/* Theme */}
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

        {/* API Configuration */}
        <Card elevated>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[var(--m-brand)]" />
              <h2 className="text-[var(--m-text-md)] font-semibold">API Configuration</h2>
            </div>
          </CardHeader>
          <CardBody className="flex flex-col gap-3">
            <Input
              id="apiBaseUrl"
              label="API Base URL"
              placeholder="https://api.aimatrx.com"
              hint="FastAPI backend URL for AI processing and data endpoints"
              value={apiBaseUrl}
              onChange={(e) => {
                setApiBaseUrl(e.target.value);
                setApiTestResult(null);
              }}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={testApiConnection}
                disabled={testingApi || !apiBaseUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[var(--m-text-sm)] font-medium rounded-[var(--m-radius-md)] border border-[var(--m-border)] hover:bg-[var(--m-bg-hover)] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testingApi ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wifi className="w-3.5 h-3.5" />
                )}
                Test Connection
              </button>
              {apiTestResult && (
                <span className={`text-[var(--m-text-xs)] flex items-center gap-1 ${
                  apiTestResult.ok ? 'text-[var(--m-success)]' : 'text-[var(--m-error)]'
                }`}>
                  {apiTestResult.ok ? (
                    <Wifi className="w-3 h-3" />
                  ) : (
                    <WifiOff className="w-3 h-3" />
                  )}
                  {apiTestResult.message}
                </span>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Default Project */}
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

        {/* Database */}
        <Card elevated>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[var(--m-brand)]" />
              <h2 className="text-[var(--m-text-md)] font-semibold">Database</h2>
            </div>
          </CardHeader>
          <CardBody>
            <Input
              id="tableName"
              label="Supabase Table Name"
              placeholder="html_extractions"
              hint="The database table for storing extractions"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
            />
          </CardBody>
        </Card>

        {/* Save */}
        <Button variant="primary" size="lg" block loading={saving} onClick={saveSettings}>
          <Save className="w-4 h-4" />
          Save Settings
        </Button>

        {/* Version */}
        <p className="text-center text-[var(--m-text-xs)] text-[var(--m-text-tertiary)]">
          Matrx Extension v2.0.0
        </p>
      </div>
    </div>
  );
}

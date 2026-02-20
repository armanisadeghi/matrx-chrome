import { useState, useEffect } from 'react';
import { Save, Moon, Sun, Monitor, Database, Globe, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Badge,
  StatusMessage,
} from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { LoginForm } from '../../components/auth/LoginForm';
import { AuthStatus } from '../../components/auth/AuthStatus';

export function OptionsPage() {
  const { user, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [tableName, setTableName] = useState('html_extractions');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get(['apiBaseUrl', 'supabaseTableName'], (result) => {
      setApiBaseUrl(result.apiBaseUrl || '');
      setTableName(result.supabaseTableName || 'html_extractions');
    });
  }, []);

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
              onChange={(e) => setApiBaseUrl(e.target.value)}
            />
          </CardBody>
        </Card>

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

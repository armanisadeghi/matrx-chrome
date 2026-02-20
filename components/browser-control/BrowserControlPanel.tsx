import { useState, useCallback } from 'react';
import {
  Globe,
  MousePointer,
  Type,
  ArrowDown,
  Camera,
  Play,
  Plus,
  Trash2,
  GripVertical,
  Settings,
} from 'lucide-react';
import { useCurrentTab } from '../../hooks/useCurrentTab';
import { Button, Card, CardBody, Input, Badge, StatusMessage, EmptyState } from '../ui';
import type { BrowserAction, BrowserActionResult } from '../../utils/types';

const actionIcons: Record<BrowserAction['type'], typeof Globe> = {
  navigate: Globe,
  click: MousePointer,
  type: Type,
  scroll: ArrowDown,
  screenshot: Camera,
  extract: Settings,
  wait: Play,
};

const actionLabels: Record<BrowserAction['type'], string> = {
  navigate: 'Navigate',
  click: 'Click',
  type: 'Type',
  scroll: 'Scroll',
  screenshot: 'Screenshot',
  extract: 'Extract',
  wait: 'Wait',
};

export function BrowserControlPanel() {
  const tab = useCurrentTab();
  const [actions, setActions] = useState<BrowserAction[]>([]);
  const [results, setResults] = useState<BrowserActionResult[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick actions
  const [quickSelector, setQuickSelector] = useState('');
  const [quickValue, setQuickValue] = useState('');

  const addAction = (type: BrowserAction['type']) => {
    const action: BrowserAction = { type };
    if (type === 'click' || type === 'type' || type === 'scroll') {
      action.selector = quickSelector;
    }
    if (type === 'type') {
      action.value = quickValue;
    }
    if (type === 'navigate') {
      action.url = quickValue;
    }
    if (type === 'wait') {
      action.delay = 1000;
    }
    setActions((prev) => [...prev, action]);
  };

  const removeAction = (index: number) => {
    setActions((prev) => prev.filter((_, i) => i !== index));
  };

  const executeActions = useCallback(async () => {
    if (!tab?.id || actions.length === 0) return;
    setRunning(true);
    setError(null);
    setResults([]);

    const allResults: BrowserActionResult[] = [];

    for (const action of actions) {
      try {
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: 'executeAction',
          browserAction: action,
        });

        allResults.push({
          success: response.success,
          action,
          result: response.result,
          error: response.error,
        });

        if (!response.success) {
          setError(`Action "${actionLabels[action.type]}" failed: ${response.error}`);
          break;
        }
      } catch (err) {
        allResults.push({
          success: false,
          action,
          error: err instanceof Error ? err.message : 'Execution failed',
        });
        setError(`Action "${actionLabels[action.type]}" failed`);
        break;
      }
    }

    setResults(allResults);
    setRunning(false);
  }, [tab, actions]);

  const executeSingle = useCallback(
    async (action: BrowserAction) => {
      if (!tab?.id) return;
      setRunning(true);
      try {
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: 'executeAction',
          browserAction: action,
        });
        setResults([
          {
            success: response.success,
            action,
            result: response.result,
            error: response.error,
          },
        ]);
      } catch (err) {
        setResults([
          {
            success: false,
            action,
            error: err instanceof Error ? err.message : 'Failed',
          },
        ]);
      } finally {
        setRunning(false);
      }
    },
    [tab],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Quick Actions */}
      <Card>
        <CardBody className="!p-3 flex flex-col gap-2">
          <span className="text-sm font-medium text-[color:var(--m-text-secondary)]">
            Quick Actions
          </span>
          <Input
            placeholder="CSS Selector (e.g., #submit-btn, .nav a)"
            value={quickSelector}
            onChange={(e) => setQuickSelector(e.target.value)}
          />
          <Input
            placeholder="Value / URL"
            value={quickValue}
            onChange={(e) => setQuickValue(e.target.value)}
          />
          <div className="grid grid-cols-4 gap-1.5">
            {(
              ['navigate', 'click', 'type', 'scroll', 'screenshot', 'extract', 'wait'] as BrowserAction['type'][]
            ).map((type) => {
              const Icon = actionIcons[type];
              return (
                <button
                  key={type}
                  onClick={() => addAction(type)}
                  className="flex flex-col items-center gap-0.5 p-2
                    rounded-[var(--m-radius-md)] border border-[var(--m-border)]
                    text-[color:var(--m-text-tertiary)] hover:text-[var(--m-brand)]
                    hover:border-[var(--m-brand)] hover:bg-[var(--m-brand-subtle)]
                    transition-all cursor-pointer text-[10px]"
                >
                  <Icon className="w-4 h-4" />
                  {actionLabels[type]}
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Action Queue */}
      {actions.length > 0 && (
        <Card>
          <CardBody className="!p-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[color:var(--m-text-secondary)]">
                Action Queue ({actions.length})
              </span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setActions([])}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={executeActions}
                  loading={running}
                >
                  <Play className="w-3.5 h-3.5" />
                  Run All
                </Button>
              </div>
            </div>

            {actions.map((action, i) => {
              const Icon = actionIcons[action.type];
              const result = results[i];
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-[var(--m-radius-sm)] bg-[var(--m-bg-inset)]"
                >
                  <GripVertical className="w-3 h-3 text-[color:var(--m-text-tertiary)]" />
                  <Icon className="w-3.5 h-3.5 text-[color:var(--m-text-secondary)]" />
                  <span className="text-sm flex-1 truncate">
                    {actionLabels[action.type]}
                    {action.selector && (
                      <span className="text-[color:var(--m-text-tertiary)] ml-1">
                        {action.selector}
                      </span>
                    )}
                    {action.value && (
                      <span className="text-[var(--m-brand)] ml-1">
                        "{action.value}"
                      </span>
                    )}
                    {action.url && (
                      <span className="text-[var(--m-brand)] ml-1">
                        {action.url}
                      </span>
                    )}
                  </span>
                  {result && (
                    <Badge variant={result.success ? 'success' : 'error'}>
                      {result.success ? 'OK' : 'Fail'}
                    </Badge>
                  )}
                  <button
                    onClick={() => executeSingle(action)}
                    className="text-[color:var(--m-text-tertiary)] hover:text-[var(--m-brand)] cursor-pointer"
                    title="Run this action"
                  >
                    <Play className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeAction(i)}
                    className="text-[color:var(--m-text-tertiary)] hover:text-[var(--m-error)] cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </CardBody>
        </Card>
      )}

      {error && <StatusMessage type="error">{error}</StatusMessage>}

      {actions.length === 0 && (
        <EmptyState
          icon={<Globe className="w-8 h-8" />}
          title="Browser Automation"
          description="Build action sequences to automate browser tasks. Add actions above to get started."
        />
      )}
    </div>
  );
}

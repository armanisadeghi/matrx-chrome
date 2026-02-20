import { useState, useEffect } from 'react';
import {
  Wrench,
  ChevronRight,
  ArrowLeft,
  Play,
  Loader2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { listTools, getToolDetail, createToolTestSession, executeToolTest } from '../../utils/api-client';
import { useAuth } from '../../hooks/useAuth';
import { Button, Badge, EmptyState } from '../ui';
import type { ToolDefinition, SseEvent } from '../../utils/types';

type View = 'list' | 'detail';

export function ToolBrowserPanel() {
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<View>('list');
  const [tools, setTools] = useState<ToolDefinition[]>([]);
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  // Execution state
  const [args, setArgs] = useState<Record<string, string>>({});
  const [executing, setExecuting] = useState(false);
  const [output, setOutput] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isAuthenticated) loadTools();
  }, [isAuthenticated]);

  const loadTools = async (category?: string) => {
    setLoading(true);
    const res = await listTools(category || undefined);
    if (res.success && res.data) {
      const toolList = (res.data as { tools: ToolDefinition[] }).tools || [];
      setTools(toolList);
      // Extract unique categories
      const cats = [...new Set(toolList.map((t) => t.category).filter(Boolean))] as string[];
      if (cats.length > 0 && categories.length === 0) setCategories(cats);
    }
    setLoading(false);
  };

  const openTool = async (tool: ToolDefinition) => {
    setSelectedTool(tool);
    setView('detail');
    setArgs({});
    setOutput('');
    // Get detailed info
    const res = await getToolDetail(tool.name);
    if (res.success && res.data) {
      setSelectedTool((res.data as { tool: ToolDefinition }).tool || tool);
    }
  };

  const handleExecute = async () => {
    if (!selectedTool) return;
    setExecuting(true);
    setOutput('');

    // Ensure we have a session
    let sid = sessionId;
    if (!sid) {
      const sessionRes = await createToolTestSession();
      if (sessionRes.success && sessionRes.data) {
        sid = (sessionRes.data as { conversation_id: string }).conversation_id;
        setSessionId(sid);
      }
    }
    if (!sid) {
      setOutput('Error: Could not create test session');
      setExecuting(false);
      return;
    }

    // Parse args — try JSON parse for object/array values
    const parsedArgs: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(args)) {
      if (!value.trim()) continue;
      try {
        parsedArgs[key] = JSON.parse(value);
      } catch {
        parsedArgs[key] = value;
      }
    }

    let result = '';
    await executeToolTest(
      selectedTool.name,
      parsedArgs,
      sid,
      (event: SseEvent) => {
        if (event.type === 'completion' || event.type === 'data') {
          const content = (event.data.content as string) || (event.data.text as string) || '';
          if (content) {
            result += content;
            setOutput(result);
          }
        } else if (event.type === 'status') {
          const msg = (event.data.message as string) || '';
          if (msg) {
            result += `[${msg}]\n`;
            setOutput(result);
          }
        } else if (event.type === 'error') {
          result += `Error: ${(event.data.message as string) || 'Unknown error'}\n`;
          setOutput(result);
        }
      },
    );

    setExecuting(false);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={<Wrench className="w-10 h-10" />}
        title="Sign in Required"
        description="Sign in to browse and test backend tools."
      />
    );
  }

  // Tool detail view
  if (view === 'detail' && selectedTool) {
    const params = selectedTool.parameters as Record<string, { type?: string; description?: string; default?: unknown }>;
    const paramKeys = Object.keys(params || {}).filter((k) => k !== 'type' && k !== 'properties' && k !== 'required');

    // If parameters has a 'properties' sub-object (JSON Schema), use that
    const properties = (params.properties || params) as Record<string, { type?: string; description?: string; default?: unknown }>;
    const propKeys = Object.keys(properties).filter((k) => k !== 'type' && k !== 'required');

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--m-border)]">
          <Button size="sm" variant="ghost" icon onClick={() => setView('list')}>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>
          <span className="text-[var(--m-text-sm)] font-medium text-[var(--m-text-primary)] truncate">
            {selectedTool.name}
          </span>
          {selectedTool.category && <Badge>{selectedTool.category}</Badge>}
        </div>

        <div className="flex-1 overflow-auto p-3">
          <div className="flex flex-col gap-3">
            <p className="text-[var(--m-text-xs)] text-[var(--m-text-secondary)]">
              {selectedTool.description}
            </p>

            {/* Parameters */}
            {propKeys.length > 0 && (
              <div>
                <span className="text-[var(--m-text-xs)] font-medium text-[var(--m-text-primary)] block mb-2">
                  Parameters
                </span>
                <div className="flex flex-col gap-2">
                  {propKeys.map((key) => {
                    const param = properties[key];
                    return (
                      <div key={key}>
                        <label className="block text-[var(--m-text-xs)] text-[var(--m-text-secondary)] mb-0.5">
                          {key}
                          {param?.type && (
                            <span className="text-[var(--m-text-tertiary)]"> ({param.type})</span>
                          )}
                        </label>
                        <input
                          type="text"
                          value={args[key] || ''}
                          onChange={(e) => setArgs((prev) => ({ ...prev, [key]: e.target.value }))}
                          placeholder={param?.description || `Enter ${key}...`}
                          className="w-full px-2.5 py-1.5 text-[var(--m-text-xs)] bg-[var(--m-bg-inset)] border border-[var(--m-border)] rounded-[var(--m-radius-sm)] text-[var(--m-text-primary)] placeholder:text-[var(--m-text-tertiary)] focus:outline-none focus:border-[var(--m-brand)]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={handleExecute}
              disabled={executing}
              loading={executing}
            >
              <Play className="w-3.5 h-3.5" />
              Execute
            </Button>

            {/* Output */}
            {output && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[var(--m-text-xs)] font-medium text-[var(--m-text-primary)]">
                    Output
                  </span>
                  <button onClick={copyOutput} className="p-1 hover:bg-[var(--m-bg-hover)] rounded cursor-pointer transition-colors">
                    {copied ? <Check className="w-3 h-3 text-[var(--m-success)]" /> : <Copy className="w-3 h-3 text-[var(--m-text-tertiary)]" />}
                  </button>
                </div>
                <pre className="p-2.5 text-[var(--m-text-xs)] bg-[var(--m-bg-inset)] rounded-[var(--m-radius-md)] overflow-auto max-h-[300px] whitespace-pre-wrap break-words border border-[var(--m-border)]">
                  {output}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Tool list view
  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex items-center justify-between">
        <span className="text-[var(--m-text-sm)] font-medium text-[var(--m-text-primary)]">
          Tools ({tools.length})
        </span>
        <div className="flex items-center gap-2">
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                loadTools(e.target.value);
              }}
              className="px-2 py-1 text-[var(--m-text-xs)] bg-[var(--m-bg-inset)] border border-[var(--m-border)] rounded-[var(--m-radius-sm)] text-[var(--m-text-primary)] focus:outline-none focus:border-[var(--m-brand)]"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--m-brand)]" />
        </div>
      )}

      {!loading && tools.length === 0 && (
        <EmptyState
          icon={<Wrench className="w-8 h-8" />}
          title="No Tools"
          description="No tools available from the backend."
        />
      )}

      {tools.map((tool) => (
        <button
          key={tool.name}
          onClick={() => openTool(tool)}
          className="flex items-center gap-3 p-3 bg-[var(--m-bg-card)] rounded-[var(--m-radius-lg)] border border-[var(--m-border)] hover:bg-[var(--m-bg-hover)] transition-colors text-left cursor-pointer w-full"
        >
          <Wrench className="w-4 h-4 text-[var(--m-brand)] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[var(--m-text-sm)] font-medium text-[var(--m-text-primary)] truncate">
              {tool.name}
            </p>
            <p className="text-[var(--m-text-xs)] text-[var(--m-text-tertiary)] truncate">
              {tool.description}
            </p>
          </div>
          {tool.category && <Badge>{tool.category}</Badge>}
          <ChevronRight className="w-4 h-4 text-[var(--m-text-tertiary)] shrink-0" />
        </button>
      ))}
    </div>
  );
}

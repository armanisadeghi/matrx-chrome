import { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import {
  Send,
  Bot,
  User,
  Trash2,
  StopCircle,
  Sparkles,
  History,
  Plus,
} from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { unifiedChat, executeAgent } from '../../utils/api-client';
import { useAuth } from '../../hooks/useAuth';
import { useCurrentTab } from '../../hooks/useCurrentTab';
import {
  fetchConversationMessages,
  dbMessagesToChatMessages,
} from '../../utils/supabase-queries';
import { getLocal, setLocal, removeLocal } from '../../utils/storage';
import { Button, EmptyState } from '../ui';
import { AgentSelector } from './AgentSelector';
import { ConversationSidebar } from './ConversationSidebar';
import type {
  ChatMessage,
  StreamChunk,
  SseEvent,
  AiModel,
  AgentPrompt,
  DbConversation,
} from '../../utils/types';
import { BUILTIN_PROMPT_IDS } from '../../utils/types';

const STORAGE_KEY_CONVERSATION = 'matrx_active_conversation';
const STORAGE_KEY_AGENT = 'matrx_selected_agent';
const STORAGE_KEY_MODEL = 'matrx_selected_model';

export function ChatPanel() {
  const { isAuthenticated, user } = useAuth();
  const tab = useCurrentTab();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentPrompt | null>(null);
  const [selectedModel, setSelectedModel] = useState<AiModel | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Restore persisted state on mount
  useEffect(() => {
    (async () => {
      const savedConvId = await getLocal<string>(STORAGE_KEY_CONVERSATION);
      const savedAgent = await getLocal<AgentPrompt>(STORAGE_KEY_AGENT);
      const savedModel = await getLocal<AiModel>(STORAGE_KEY_MODEL);

      if (savedAgent) setSelectedAgent(savedAgent);
      if (savedModel) setSelectedModel(savedModel);

      if (savedConvId) {
        setConversationId(savedConvId);
        const dbMessages = await fetchConversationMessages(savedConvId);
        if (dbMessages.length > 0) {
          setMessages(dbMessagesToChatMessages(dbMessages));
        }
      }
    })();
  }, []);

  // Persist selections
  useEffect(() => {
    setLocal(STORAGE_KEY_AGENT, selectedAgent);
  }, [selectedAgent]);

  useEffect(() => {
    setLocal(STORAGE_KEY_MODEL, selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    if (conversationId) {
      setLocal(STORAGE_KEY_CONVERSATION, conversationId);
    }
  }, [conversationId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const resolvePromptId = (): string | null => {
    if (!selectedAgent) return null;
    // Built-in agents use hardcoded prompt IDs
    if (BUILTIN_PROMPT_IDS[selectedAgent.id]) {
      return BUILTIN_PROMPT_IDS[selectedAgent.id];
    }
    // User agents use their actual DB id
    return selectedAgent.id;
  };

  const resolveModelId = (): string => {
    if (selectedModel) return selectedModel.id;
    // Default model when no agent and no model explicitly selected
    return 'claude-sonnet-4-20250514';
  };

  const buildSystemInstruction = (): string | undefined => {
    if (!tab?.url) return undefined;
    return `You are a helpful AI assistant integrated into the Matrx Chrome extension. The user is currently viewing: ${tab.url} (${tab.title || 'Untitled'}). Help them with questions about the page or any general queries.`;
  };

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(36),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(36),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setStreaming(true);
    setStatusMessage(null);

    const controller = new AbortController();
    abortRef.current = controller;

    const isNewConversation = !conversationId;
    const promptId = resolvePromptId();
    const useAgentMode = !!promptId;

    try {
      if (useAgentMode) {
        // Agent execution mode — POST /ai/agent/execute
        await executeAgent(
          {
            prompt_id: promptId,
            conversation_id: conversationId || undefined,
            is_new_conversation: isNewConversation,
            user_input: text,
            is_builtin: !!BUILTIN_PROMPT_IDS[selectedAgent!.id],
            stream: true,
          },
          (event: SseEvent) => {
            if (event.type === 'status') {
              setStatusMessage(
                (event.data.system_message as string) ||
                  (event.data.status as string) ||
                  null,
              );
            } else if (event.type === 'data') {
              const content =
                (event.data.content as string) ||
                (event.data.text as string) ||
                (event.data.delta as string) ||
                '';
              if (content) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last.role === 'assistant') {
                    last.content += content;
                  }
                  return updated;
                });
              }
            } else if (event.type === 'completion') {
              // Extract conversation_id from completion event
              const newConvId = event.data.conversation_id as string | undefined;
              if (newConvId && !conversationId) {
                setConversationId(newConvId);
              }
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last.role === 'assistant') {
                  // If the completion event has the full output, use it
                  if (event.data.output && !last.content) {
                    last.content = event.data.output as string;
                  }
                  last.isStreaming = false;
                }
                return updated;
              });
              setStatusMessage(null);
            } else if (event.type === 'error') {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last.role === 'assistant') {
                  last.content = `Error: ${(event.data.message as string) || 'Unknown error'}`;
                  last.isStreaming = false;
                }
                return updated;
              });
              setStatusMessage(null);
            } else if (event.type === 'end') {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last.role === 'assistant') {
                  last.isStreaming = false;
                }
                return updated;
              });
              setStatusMessage(null);
            }
          },
          controller.signal,
        );
      } else {
        // Direct model mode — POST /ai/chat/unified
        await unifiedChat(
          {
            ai_model_id: resolveModelId(),
            messages: [
              ...messages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              { role: 'user', content: text },
            ],
            system_instruction: buildSystemInstruction(),
            stream: true,
            conversation_id: conversationId || undefined,
            is_new_conversation: isNewConversation,
          },
          (chunk: StreamChunk) => {
            if (chunk.type === 'text') {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last.role === 'assistant') {
                  last.content += chunk.content;
                }
                return updated;
              });
            } else if (chunk.type === 'done') {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last.role === 'assistant') {
                  last.isStreaming = false;
                }
                return updated;
              });
            } else if (chunk.type === 'error') {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last.role === 'assistant') {
                  last.content = `Error: ${chunk.content}`;
                  last.isStreaming = false;
                }
                return updated;
              });
            }
          },
          controller.signal,
        );
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'assistant') {
            last.content =
              last.content ||
              'Failed to get response. Check your API configuration in Settings.';
            last.isStreaming = false;
          }
          return updated;
        });
      }
      setStatusMessage(null);
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [input, streaming, messages, tab, conversationId, selectedAgent, selectedModel]);

  const stopStreaming = () => {
    abortRef.current?.abort();
    setStreaming(false);
    setStatusMessage(null);
  };

  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    removeLocal(STORAGE_KEY_CONVERSATION);
    setShowSidebar(false);
  };

  const loadConversation = async (conv: DbConversation) => {
    setConversationId(conv.id);
    setShowSidebar(false);
    const dbMessages = await fetchConversationMessages(conv.id);
    setMessages(dbMessagesToChatMessages(dbMessages));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMarkdown = (content: string) => {
    const html = marked.parse(content, { async: false }) as string;
    return DOMPurify.sanitize(html);
  };

  // Sidebar overlay
  if (showSidebar) {
    return (
      <div className="flex h-full">
        <div className="w-full">
          <ConversationSidebar
            activeConversationId={conversationId}
            onSelectConversation={loadConversation}
            onNewConversation={startNewConversation}
            onClose={() => setShowSidebar(false)}
          />
        </div>
      </div>
    );
  }

  // Empty state — no messages
  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Top bar with agent selector and history */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--m-border)]">
          <AgentSelector
            selectedAgent={selectedAgent}
            selectedModel={selectedModel}
            onAgentChange={setSelectedAgent}
            onModelChange={setSelectedModel}
          />
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-1.5 rounded-[var(--m-radius-sm)] hover:bg-[var(--m-bg-hover)] cursor-pointer transition-colors"
              title="Conversation history"
            >
              <History className="w-3.5 h-3.5 text-[color:var(--m-text-tertiary)]" />
            </button>
          </div>
        </div>

        <EmptyState
          icon={<Sparkles className="w-10 h-10" />}
          title="AI Chat"
          description="Ask questions about the current page, get summaries, or interact with AI directly."
          action={
            <div className="flex flex-col gap-2 w-full max-w-[250px]">
              {[
                'Summarize this page',
                'Extract key facts',
                'What is this page about?',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInput(prompt);
                    setTimeout(() => inputRef.current?.focus(), 0);
                  }}
                  className="text-left px-3 py-2 rounded-[var(--m-radius-md)] border border-[var(--m-border)] text-sm text-[color:var(--m-text-secondary)] hover:bg-[var(--m-bg-hover)] hover:border-[var(--m-border-strong)] transition-all cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          }
        />
        <div className="mt-auto p-3 border-t border-[var(--m-border)]">
          <ChatInput
            ref={inputRef}
            value={input}
            onChange={setInput}
            onSend={sendMessage}
            onKeyDown={handleKeyDown}
            streaming={streaming}
          />
        </div>
      </div>
    );
  }

  // Active conversation
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--m-border)]">
        <AgentSelector
          selectedAgent={selectedAgent}
          selectedModel={selectedModel}
          onAgentChange={setSelectedAgent}
          onModelChange={setSelectedModel}
        />
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSidebar(true)}
            className="p-1.5 rounded-[var(--m-radius-sm)] hover:bg-[var(--m-bg-hover)] cursor-pointer transition-colors"
            title="Conversation history"
          >
            <History className="w-3.5 h-3.5 text-[color:var(--m-text-tertiary)]" />
          </button>
          <button
            onClick={startNewConversation}
            className="p-1.5 rounded-[var(--m-radius-sm)] hover:bg-[var(--m-bg-hover)] cursor-pointer transition-colors"
            title="New conversation"
          >
            <Plus className="w-3.5 h-3.5 text-[color:var(--m-text-tertiary)]" />
          </button>
          <Button size="sm" variant="ghost" icon onClick={startNewConversation}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Status message from agent */}
      {statusMessage && (
        <div className="px-3 py-1.5 bg-[var(--m-info-subtle)] border-b border-[var(--m-border)]">
          <p className="text-xs text-[var(--m-info-text)] truncate">
            {statusMessage}
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-auto p-3 flex flex-col gap-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-[var(--m-brand-subtle)] flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-[var(--m-brand)]" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-[var(--m-radius-lg)] px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-[var(--m-brand)] text-white'
                  : 'bg-[var(--m-bg-inset)] text-[color:var(--m-text-primary)]'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div
                  className="prose prose-sm max-w-none [&_pre]:bg-[var(--m-bg-active)] [&_pre]:p-2 [&_pre]:rounded-[var(--m-radius-sm)] [&_pre]:text-xs [&_code]:text-xs [&_p]:my-1"
                  dangerouslySetInnerHTML={{
                    __html:
                      renderMarkdown(msg.content) ||
                      (msg.isStreaming
                        ? '<span class="animate-pulse">...</span>'
                        : ''),
                  }}
                />
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
              {msg.isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-current animate-pulse ml-0.5" />
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-[var(--m-bg-inset)] flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-[color:var(--m-text-secondary)]" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[var(--m-border)]">
        {streaming && (
          <div className="flex justify-center mb-2">
            <Button size="sm" variant="secondary" onClick={stopStreaming}>
              <StopCircle className="w-3.5 h-3.5" />
              Stop
            </Button>
          </div>
        )}
        <ChatInput
          ref={inputRef}
          value={input}
          onChange={setInput}
          onSend={sendMessage}
          onKeyDown={handleKeyDown}
          streaming={streaming}
        />
      </div>
    </div>
  );
}

// --- Chat Input Component ---

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  streaming: boolean;
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ value, onChange, onSend, onKeyDown, streaming }, ref) => {
    return (
      <div className="flex items-end gap-2">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about this page..."
          rows={1}
          className="flex-1 px-3 py-2 text-sm
            bg-[var(--m-bg-card)] border border-[var(--m-border)]
            rounded-[var(--m-radius-lg)] text-[color:var(--m-text-primary)]
            placeholder:text-[color:var(--m-text-tertiary)]
            focus:outline-none focus:border-[var(--m-brand)] focus:ring-2 focus:ring-[var(--m-brand-ring)]
            resize-none max-h-[120px] min-h-[36px]"
          style={{ height: 'auto' }}
          onInput={(e) => {
            const t = e.target as HTMLTextAreaElement;
            t.style.height = 'auto';
            t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
          }}
        />
        <Button
          variant="primary"
          size="md"
          icon
          onClick={onSend}
          disabled={!value.trim() || streaming}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    );
  },
);

ChatInput.displayName = 'ChatInput';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Trash2, StopCircle, Sparkles } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { apiStream } from '../../utils/api-client';
import { useAuth } from '../../hooks/useAuth';
import { useCurrentTab } from '../../hooks/useCurrentTab';
import { Button, EmptyState } from '../ui';
import type { ChatMessage } from '../../utils/types';

export function ChatPanel() {
  const { isAuthenticated } = useAuth();
  const tab = useCurrentTab();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await apiStream(
        '/api/chat',
        {
          message: text,
          context: {
            url: tab?.url,
            title: tab?.title,
            domain: tab?.domain,
          },
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
        (chunk) => {
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
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'assistant') {
            last.content = last.content || 'Failed to get response. Check your API configuration in Settings.';
            last.isStreaming = false;
          }
          return updated;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [input, streaming, messages, tab]);

  const stopStreaming = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  const clearChat = () => {
    setMessages([]);
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

  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
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
                  className="text-left px-3 py-2 rounded-[var(--m-radius-md)] border border-[var(--m-border)] text-[var(--m-text-sm)] text-[var(--m-text-secondary)] hover:bg-[var(--m-bg-hover)] hover:border-[var(--m-border-strong)] transition-all cursor-pointer"
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--m-border)]">
        <span className="text-[var(--m-text-sm)] font-medium text-[var(--m-text-secondary)]">
          {messages.filter((m) => m.role === 'user').length} messages
        </span>
        <Button size="sm" variant="ghost" icon onClick={clearChat}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

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
              className={`max-w-[85%] rounded-[var(--m-radius-lg)] px-3 py-2 text-[var(--m-text-sm)] ${
                msg.role === 'user'
                  ? 'bg-[var(--m-brand)] text-white'
                  : 'bg-[var(--m-bg-inset)] text-[var(--m-text-primary)]'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div
                  className="prose prose-sm max-w-none [&_pre]:bg-[var(--m-bg-active)] [&_pre]:p-2 [&_pre]:rounded-[var(--m-radius-sm)] [&_pre]:text-[var(--m-text-xs)] [&_code]:text-[var(--m-text-xs)] [&_p]:my-1"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(msg.content) || (msg.isStreaming ? '<span class="animate-pulse">...</span>' : ''),
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
                <User className="w-3.5 h-3.5 text-[var(--m-text-secondary)]" />
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

// Separate input component
import { forwardRef } from 'react';

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
          className="flex-1 px-3 py-2 text-[var(--m-text-sm)]
            bg-[var(--m-bg-card)] border border-[var(--m-border)]
            rounded-[var(--m-radius-lg)] text-[var(--m-text-primary)]
            placeholder:text-[var(--m-text-tertiary)]
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

import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Clock, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { fetchConversationHistory } from '../../utils/supabase-queries';
import type { DbConversation } from '../../utils/types';

interface ConversationSidebarProps {
  activeConversationId: string | null;
  onSelectConversation: (conversation: DbConversation) => void;
  onNewConversation: () => void;
  onClose: () => void;
}

export function ConversationSidebar({
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onClose,
}: ConversationSidebarProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<DbConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      fetchConversationHistory(50)
        .then(setConversations)
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-[var(--m-bg-card)] border-r border-[var(--m-border)]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--m-border)]">
        <span className="text-[var(--m-text-sm)] font-medium text-[var(--m-text-primary)]">
          History
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onNewConversation}
            className="p-1 rounded-[var(--m-radius-sm)] hover:bg-[var(--m-bg-hover)] cursor-pointer transition-colors"
            title="New conversation"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--m-brand)]" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-[var(--m-radius-sm)] hover:bg-[var(--m-bg-hover)] cursor-pointer transition-colors"
            title="Close sidebar"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-[var(--m-text-tertiary)]" />
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-[var(--m-brand)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-3">
            <MessageSquare className="w-8 h-8 text-[var(--m-text-tertiary)] mb-2" />
            <p className="text-[var(--m-text-xs)] text-[var(--m-text-tertiary)] text-center">
              No conversations yet
            </p>
          </div>
        ) : (
          <div className="p-1.5 flex flex-col gap-0.5">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`w-full text-left px-2.5 py-2 rounded-[var(--m-radius-sm)] cursor-pointer transition-colors ${
                  activeConversationId === conv.id
                    ? 'bg-[var(--m-brand-subtle)]'
                    : 'hover:bg-[var(--m-bg-hover)]'
                }`}
              >
                <p className="text-[var(--m-text-xs)] font-medium text-[var(--m-text-primary)] truncate">
                  {conv.title || 'Untitled conversation'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-[var(--m-text-tertiary)] flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {formatTime(conv.updated_at)}
                  </span>
                  <span className="text-[10px] text-[var(--m-text-tertiary)]">
                    {conv.message_count} msgs
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

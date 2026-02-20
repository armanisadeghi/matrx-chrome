// ============================================
// Direct Supabase queries for Chrome extension
// Uses the user's JWT for RLS-protected reads
// ============================================

import { getSupabaseClient } from './auth';
import type { AiModel, AgentPrompt, DbConversation, DbMessage } from './types';

// --- AI Models ---

export async function fetchActiveModels(): Promise<AiModel[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from('ai_model')
    .select('id, name, common_name, model_class, provider, context_window, max_tokens, capabilities, is_deprecated, is_primary, is_premium')
    .or('is_deprecated.eq.false,is_deprecated.is.null')
    .order('provider')
    .order('common_name');

  if (error || !data) return [];
  return data as AiModel[];
}

export async function fetchPrimaryModels(): Promise<AiModel[]> {
  const models = await fetchActiveModels();
  return models.filter((m) => m.is_primary && !m.is_premium);
}

// --- User Agents (prompts) ---

export async function fetchUserAgents(userId: string): Promise<AgentPrompt[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from('prompts')
    .select('id, name, description, variable_defaults, tools, user_id, settings')
    .eq('user_id', userId)
    .order('name');

  if (error || !data) return [];
  return data as AgentPrompt[];
}

// --- Conversations ---

export async function fetchConversationHistory(limit = 30): Promise<DbConversation[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from('cx_conversation')
    .select('id, user_id, title, status, ai_model_id, message_count, created_at, updated_at, deleted_at, metadata')
    .is('deleted_at', null)
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as DbConversation[];
}

export async function fetchConversationMessages(conversationId: string): Promise<DbMessage[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from('cx_message')
    .select('id, conversation_id, role, position, status, content, created_at, metadata')
    .eq('conversation_id', conversationId)
    .is('deleted_at', null)
    .order('position', { ascending: true });

  if (error || !data) return [];
  return data as DbMessage[];
}

// Convert DB messages to ChatMessage format for the UI
export function dbMessagesToChatMessages(dbMessages: DbMessage[]): { role: 'user' | 'assistant' | 'system'; content: string; id: string; timestamp: number }[] {
  return dbMessages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => {
      // content is JSONB array — extract text from content items
      let text = '';
      if (Array.isArray(m.content)) {
        for (const item of m.content) {
          const block = item as Record<string, unknown>;
          if (block.type === 'input_text' || block.type === 'text') {
            text += (block.text as string) || '';
          } else if (typeof block === 'string') {
            text += block;
          }
        }
      }
      if (!text && typeof m.content === 'string') {
        text = m.content;
      }

      return {
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: text,
        timestamp: new Date(m.created_at).getTime(),
      };
    });
}

// --- Projects (for research) ---

export async function fetchUserProjects(): Promise<{ id: string; name: string }[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from('projects')
    .select('id, name')
    .order('name');

  if (error || !data) return [];
  return data as { id: string; name: string }[];
}

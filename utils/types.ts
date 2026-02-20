// ============================================
// Matrx Chrome Extension — Shared Types
// ============================================

// --- Auth ---
export interface User {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: User;
}

export type OAuthProvider = 'google' | 'github' | 'apple';

// --- Extraction ---
export interface ExtractionResult {
  success: boolean;
  html?: string;
  size?: number;
  title?: string;
  error?: string;
  savedToDatabase?: boolean;
  warning?: string;
}

export interface ExtractionData {
  url: string;
  title: string;
  html_content: string;
  meta_description: string;
  meta_keywords: string;
  content_length: number;
  extracted_at: string;
  user_agent: string;
  user_id: string | null;
}

export type ExtractionMethod = 'full' | 'smart' | 'custom-smart' | 'custom-range';

export interface CustomRangeResult {
  success: boolean;
  content?: string;
  size?: number;
  startPosition?: number;
  endPosition?: number;
  error?: string;
}

export interface MarkerTestResult {
  success: boolean;
  count?: number;
  positions?: number[];
  marker?: string;
  type?: 'start' | 'end';
  error?: string;
}

// --- Page Analysis ---
export interface HeaderInfo {
  tag: string;
  text: string;
  level: number;
}

export interface LinkInfo {
  href: string;
  text: string;
  isExternal: boolean;
  isValid: boolean;
}

export interface ImageInfo {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  naturalWidth?: number;
  naturalHeight?: number;
}

export interface PageAnalysis {
  headers: HeaderInfo[];
  links: LinkInfo[];
  images: ImageInfo[];
  textContent: string;
  wordCount: number;
  title: string;
  url: string;
  domain: string;
}

// --- API Client ---
export interface ApiConfig {
  baseUrl: string;
  accessToken?: string;
}

export interface StreamChunk {
  type: 'text' | 'error' | 'done';
  content: string;
}

export interface SseEvent {
  type: 'status' | 'data' | 'completion' | 'error' | 'end';
  data: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// --- AI Models ---
export interface AiModel {
  id: string;
  name: string;
  common_name: string;
  model_class: string;
  provider: string;
  context_window?: number;
  max_tokens?: number;
  capabilities?: Record<string, unknown>;
  is_deprecated: boolean;
  is_primary: boolean;
  is_premium: boolean;
}

// --- Agents (prompts table) ---
export interface AgentPrompt {
  id: string;
  name: string;
  description?: string;
  variable_defaults?: PromptVariable[];
  tools?: unknown[];
  user_id?: string;
  settings?: Record<string, unknown>;
}

export interface PromptVariable {
  name: string;
  label?: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  options?: string[];
}

// Built-in default agents (matching web chat)
export const DEFAULT_AGENTS: AgentPrompt[] = [
  {
    id: 'general-chat',
    name: 'General Chat',
    description: 'General-purpose AI assistant',
  },
  {
    id: 'deep-research',
    name: 'Deep Research',
    description: 'In-depth research on any topic',
  },
];

// The actual prompt IDs for built-in agents
export const BUILTIN_PROMPT_IDS: Record<string, string> = {
  'general-chat': '35d8f884-5178-4c3e-858d-c5b7adfa186a',
  'deep-research': 'f76a6b8f-b720-4730-87de-606e0bfa0e0c',
};

// --- Chat ---
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface ChatConversation {
  id: string;
  title: string;
  agentId?: string;
  modelId?: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// --- DB Conversation (cx_conversation) ---
export interface DbConversation {
  id: string;
  user_id: string;
  title?: string;
  status: string;
  ai_model_id?: string;
  message_count: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  metadata: Record<string, unknown>;
}

export interface DbMessage {
  id: string;
  conversation_id: string;
  role: string;
  position: number;
  status: string;
  content: unknown[];
  created_at: string;
  metadata: Record<string, unknown>;
}

// --- AI: Unified Chat Request ---
export interface UnifiedChatRequest {
  ai_model_id: string;
  messages: { role: string; content: string }[];
  system_instruction?: string;
  max_iterations?: number;
  max_output_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  tools?: string[];
  tool_choice?: unknown;
  parallel_tool_calls?: boolean;
  stream?: boolean;
  debug?: boolean;
  conversation_id?: string;
  is_new_conversation?: boolean;
  store?: boolean;
  metadata?: Record<string, unknown>;
}

// --- AI: Agent Execute Request ---
export interface AgentExecuteRequest {
  prompt_id: string;
  conversation_id?: string;
  is_new_conversation?: boolean;
  user_input?: string | { role: string; content: string }[];
  variables?: Record<string, unknown>;
  config_overrides?: Record<string, unknown>;
  is_builtin?: boolean;
  stream?: boolean;
  debug?: boolean;
}

// --- Scraper ---
export interface ScrapeOptions {
  get_organized_data?: boolean;
  get_structured_data?: boolean;
  get_overview?: boolean;
  get_text_data?: boolean;
  get_main_image?: boolean;
  get_links?: boolean;
  get_content_filter_removal_details?: boolean;
  include_highlighting_markers?: boolean;
  include_media?: boolean;
  include_media_links?: boolean;
  include_media_description?: boolean;
  include_anchors?: boolean;
  anchor_size?: number;
}

export interface QuickScrapeRequest extends ScrapeOptions {
  urls: string[];
  use_cache?: boolean;
  stream?: boolean;
}

export interface SearchKeywordsRequest {
  keywords: string[];
  country_code?: string;
  total_results_per_keyword?: number;
  search_type?: string;
}

export interface SearchAndScrapeRequest extends ScrapeOptions {
  keywords: string[];
  country_code?: string;
  total_results_per_keyword?: number;
  search_type?: string;
}

// --- Research: Topic ---
export interface ResearchTopic {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  autonomy_level: 'semi' | 'full' | 'manual';
  default_search_provider: string;
  default_search_params: Record<string, unknown>;
  good_scrape_threshold: number;
  scrapes_per_keyword: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  template_id?: string;
  agent_config: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// --- Research: Keyword ---
export interface ResearchKeyword {
  id: string;
  topic_id: string;
  keyword: string;
  search_provider: string;
  search_params: Record<string, unknown>;
  last_searched_at?: string;
  is_stale: boolean;
  result_count: number;
  created_at: string;
}

// --- Research: Source ---
export type ScrapeStatus = 'pending' | 'scraped' | 'failed' | 'skipped';
export type SourceOrigin = 'search' | 'manual' | 'link_discovery' | 'extension';

export interface ResearchSource {
  id: string;
  topic_id: string;
  url: string;
  title?: string;
  description?: string;
  hostname?: string;
  source_type: string;
  origin: SourceOrigin;
  rank?: number;
  page_age?: string;
  thumbnail_url?: string;
  extra_snippets: unknown[];
  raw_search_result: Record<string, unknown>;
  is_included: boolean;
  is_stale: boolean;
  scrape_status: ScrapeStatus;
  discovered_at: string;
  last_seen_at: string;
}

// --- Research: Content ---
export interface ResearchContent {
  id: string;
  source_id: string;
  topic_id: string;
  content?: string;
  content_hash?: string;
  char_count: number;
  content_type: string;
  is_good_scrape: boolean;
  quality_override?: string;
  capture_method: string;
  failure_reason?: string;
  published_at?: string;
  modified_at?: string;
  is_current: boolean;
  version: number;
  linked_extraction_id?: string;
  linked_transcript_id?: string;
  extracted_links: unknown[];
  extracted_images: unknown[];
  scraped_at: string;
}

// --- Research: Analysis ---
export interface ResearchAnalysis {
  id: string;
  content_id: string;
  source_id: string;
  topic_id: string;
  agent_type: string;
  agent_id?: string;
  model_id?: string;
  instructions?: string;
  result?: string;
  result_structured?: Record<string, unknown>;
  token_usage: Record<string, unknown>;
  status: 'success' | 'failed' | 'pending';
  error?: string;
  created_at: string;
}

// --- Research: Synthesis ---
export interface ResearchSynthesis {
  id: string;
  topic_id: string;
  keyword_id?: string;
  tag_id?: string;
  scope: 'project' | 'keyword';
  agent_type: string;
  agent_id?: string;
  model_id?: string;
  instructions?: string;
  result?: string;
  result_structured?: Record<string, unknown>;
  input_source_ids: string[];
  input_analysis_ids: string[];
  token_usage: Record<string, unknown>;
  is_current: boolean;
  version: number;
  iteration_mode: string;
  previous_synthesis_id?: string;
  status: 'success' | 'failed' | 'pending';
  error?: string;
  created_at: string;
}

// --- Research: Document ---
export interface ResearchDocument {
  id: string;
  topic_id: string;
  title?: string;
  content?: string;
  content_structured?: Record<string, unknown>;
  source_consolidation_ids: string[];
  agent_type?: string;
  agent_id?: string;
  model_id?: string;
  token_usage: Record<string, unknown>;
  version: number;
  status: 'success' | 'failed' | 'pending';
  error?: string;
  is_current: boolean;
  created_at: string;
}

// --- Research: Tag ---
export interface ResearchTag {
  id: string;
  topic_id: string;
  name: string;
  description?: string;
  sort_order: number;
  created_at: string;
}

// --- Research: Source Tag ---
export interface ResearchSourceTag {
  id: string;
  source_id: string;
  tag_id: string;
  is_primary_source: boolean;
  confidence?: number;
  assigned_by: string;
  created_at: string;
}

// --- Research: Media ---
export interface ResearchMedia {
  id: string;
  source_id: string;
  topic_id: string;
  media_type: string;
  url: string;
  alt_text?: string;
  caption?: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  is_relevant: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

// --- Research: Template ---
export interface ResearchTemplate {
  id: string;
  name: string;
  description?: string;
  is_system: boolean;
  created_by?: string;
  keyword_templates: unknown[];
  default_tags: unknown[];
  default_search_params: Record<string, unknown>;
  agent_config: Record<string, unknown>;
  autonomy_level: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// --- Research: Extension Integration ---
export interface ScrapeQueueItem {
  id: string;
  source_id: string;
  topic_id: string;
  url: string;
  title?: string;
  status: string;
}

// --- Tools ---
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
  category?: string;
  tags?: string[];
  icon?: string;
  version?: string;
  tool_type?: string;
  timeout_seconds?: number;
}

// --- Browser Control ---
export interface BrowserAction {
  type: 'navigate' | 'click' | 'type' | 'scroll' | 'screenshot' | 'extract' | 'wait';
  selector?: string;
  value?: string;
  url?: string;
  delay?: number;
}

export interface BrowserActionResult {
  success: boolean;
  action: BrowserAction;
  result?: unknown;
  error?: string;
  screenshot?: string;
}

export interface AutomationScript {
  id: string;
  name: string;
  actions: BrowserAction[];
  createdAt: number;
}

// --- Chrome Message Passing ---
export type MessageAction =
  | 'ping'
  | 'extractHTML'
  | 'copyFullHTML'
  | 'copySmartHTML'
  | 'copyCustomSmartHTML'
  | 'extractCustomRange'
  | 'testHtmlMarker'
  | 'getConfig'
  | 'tabUpdated'
  | 'getPageAnalysis'
  | 'executeAction'
  | 'copyToClipboard';

export interface ExtensionMessage {
  action: MessageAction;
  [key: string]: unknown;
}

export interface TabUpdateMessage extends ExtensionMessage {
  action: 'tabUpdated';
  tabId: number;
  url: string;
  status?: string;
  urlChanged?: boolean;
}

// --- Settings ---
export interface ExtensionSettings {
  apiBaseUrl: string;
  supabaseTableName: string;
  theme: 'light' | 'dark' | 'system';
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  apiBaseUrl: '',
  supabaseTableName: 'html_extractions',
  theme: 'dark',
};

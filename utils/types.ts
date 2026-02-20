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

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

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
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
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

# Remaining Tasks — Matrx Chrome Extension

## Completed in This Pass

### 1. API Client (`utils/api-client.ts`)
- Added `apiPatch`, `apiDelete` HTTP methods
- Added `apiStreamEvents` for rich SSE event parsing (status, data, completion, error, end)
- Added typed functions for **every** backend endpoint:
  - Health: `healthCheck`, `healthCheckDetailed`
  - AI: `unifiedChat`, `executeAgent`, `warmAgent`, `cancelRequest`
  - Scraper: `quickScrape`, `searchKeywords`, `searchAndScrape`, `scraperMicCheck`
  - Tools: `listTools`, `getToolDetail`, `createToolTestSession`, `executeToolTest`
  - Research: Full coverage (templates, topics, keywords, sources, content, analysis, synthesis, documents, tags, links, media)
  - Extension integration: `getExtensionScrapeQueue`, `submitExtensionContent`

### 2. Types (`utils/types.ts`)
- Added all research/scraper types matching backend models and DB schema
- `SseEvent`, `UnifiedChatRequest`, `AgentExecuteRequest`, `QuickScrapeRequest`, `SearchKeywordsRequest`, `SearchAndScrapeRequest`
- Research: `ResearchTopic`, `ResearchKeyword`, `ResearchSource`, `ResearchContent`, `ResearchAnalysis`, `ResearchSynthesis`, `ResearchDocument`, `ResearchTag`, `ResearchSourceTag`, `ResearchMedia`, `ResearchTemplate`, `ScrapeQueueItem`
- Tools: `ToolDefinition`, `ScrapeOptions`

### 3. ChatPanel Fix
- Changed from incorrect `/api/chat` to proper `/ai/chat/unified` endpoint
- Uses `unifiedChat()` function with proper `UnifiedChatRequest` shape
- Includes page context as system instruction

### 4. New Components
- `QuickScrapePanel` — Scrape current page or batch URLs via `/scraper/quick-scrape`
- `ScrapeQueuePanel` — View pending items from research system, submit content from current page
- `ResearchPanel` — Browse topics, view keywords/sources, trigger search/scrape/pipeline

### 5. SidePanel Updates
- Added Scrape, Queue, and Research tabs
- Reordered tabs for better workflow (Chat → Scrape → Queue → Research → Extract → ...)

### 6. Documentation
- `API_ENDPOINTS.md` — Complete endpoint reference with paths, methods, request/response shapes
- Database schema for all 13 `rs_*` tables

---

## Remaining Tasks

### HIGH PRIORITY

#### 1. Chat Model Selector
The ChatPanel hardcodes `ai_model_id: 'claude-sonnet-4-20250514'`. Needs a dropdown to select from available models.
- **Files:** `components/chat/ChatPanel.tsx`
- **Endpoint:** None needed (model ID passed in request)

ARNAN Feedback: We have a table for ai_models in the databae and it has models listed. Additionally, users have preferences where they select their preferred models. The combination of these can easily allow us to provide the user with a list of models they prefer and be sure to filter out:
- Deprecated, inactive, (premium), etc... Otherwise, we can get the models that way.

- But it's not just about selecting a model. Our system is all about having custom agents so then you need to review (public)/p/caht to understand how our agents work and we just need to create a similar agent selection system.
--> ai-matrx-admin/app/(public)/p/chat Locally: /Users/armanisadeghi/Code/ai-matrx-admin/app/(public)/p/chat


#### 2. Extension Content Submission Workflow
The ScrapeQueuePanel submits content but needs a flow where:
1. User navigates to a queued URL
2. Extension detects match and prompts "Submit this page?"
3. Auto-extract Smart HTML and submit via `submitExtensionContent`
- **Files:** `entrypoints/background/index.ts`, `components/scraper/ScrapeQueuePanel.tsx`
- **Endpoints:** `GET /research/extension/scrape-queue`, `POST /research/topics/{id}/sources/{id}/extension-content`

#### 3. Conversation Persistence
Chat conversations are lost on panel close. Need to:
- Store `conversation_id` returned from backend
- Save conversations to `chrome.storage.local`
- Load conversation history on panel open
- **Files:** `components/chat/ChatPanel.tsx`, `utils/storage.ts`

#### 4. Quick Scrape → Research Integration
After scraping a page, offer to:
- Add it as a source to an existing research topic
- Create a new research topic from scraped content
- **Files:** `components/scraper/QuickScrapePanel.tsx`
- **Endpoints:** `POST /research/topics/{id}/sources/{id}/content` (paste content)

#### 5. SSE Stream Event Handling Refinement
The `apiStreamEvents` parser and the backend's SSE format need alignment testing. The backend `StreamEmitter` sends events like:
```
data: {"type": "status", "status": "searching", "system_message": "..."}
data: {"type": "completion", "output": "...", "total_usage": {...}}
data: {"type": "end"}
```
The ChatPanel's `apiStream` flattens everything to `StreamChunk`. Consider migrating ChatPanel to use `apiStreamEvents` + `unifiedChat` properly for richer status updates.
- **Files:** `components/chat/ChatPanel.tsx`, `utils/api-client.ts`

### MEDIUM PRIORITY

#### 6. Project ID Discovery
The ResearchPanel currently requires manual project ID input. Should auto-discover from:
- User's Supabase profile/metadata
- A stored default project ID in settings
- **Files:** `components/research/ResearchPanel.tsx`, `entrypoints/options/OptionsPage.tsx`

#### 7. Research Topic Creation from Extension
Add ability to create new research topics directly from the extension:
- Topic name + description form
- Use `suggestResearchSetup` for AI-suggested keywords
- **Files:** New component `components/research/CreateTopicForm.tsx`
- **Endpoints:** `POST /research/projects/{id}/topics`, `POST /research/suggest`

#### 8. Source Detail View
Clicking a source in ResearchPanel should show:
- Content versions
- Analysis results
- Tags
- Actions (rescrape, analyze, exclude)
- **Files:** New component `components/research/SourceDetail.tsx`
- **Endpoints:** `GET /research/topics/{id}/sources/{id}/content`, `POST /research/topics/{id}/sources/{id}/analyze`

#### 9. Keyword Management
Add/remove keywords from ResearchPanel:
- Input field to add new keywords
- Delete button per keyword
- **Files:** `components/research/ResearchPanel.tsx`
- **Endpoints:** `POST /research/topics/{id}/keywords`, `DELETE /research/topics/{id}/keywords/{id}`

#### 10. Tool Browser
Add a tab to browse and test available backend tools:
- List tools by category
- Execute tools with argument forms
- View results
- **Files:** New component `components/tools/ToolBrowser.tsx`
- **Endpoints:** `GET /tools/test/list`, `POST /tools/test/execute`

### LOW PRIORITY

#### 11. SEO Tab Implementation
Currently shows "Coming soon". Could use page analysis + AI to generate SEO recommendations.
- **Files:** `entrypoints/sidepanel/SidePanel.tsx`
- **Endpoints:** Could use `/ai/chat/unified` with page content for analysis

#### 12. Agent Execution Tab
Direct agent execution interface (beyond chat):
- Select from available agents
- Pass variables and config overrides
- View structured results
- **Files:** New component
- **Endpoints:** `POST /ai/agent/execute`, `POST /ai/agent/warm`

#### 13. PDF Upload from Extension
Allow uploading PDFs found on pages for text extraction:
- **Endpoints:** `POST /utilities/pdf/extract-text` (multipart form)

#### 14. Tag Management UI
Full tag management for research sources:
- Create/edit/delete tags
- Assign tags to sources
- AI-suggest tags
- **Endpoints:** Full `/research/topics/{id}/tags/*` suite

#### 15. Document Export
View and export synthesized research documents:
- **Endpoints:** `GET /research/topics/{id}/document`, `GET /research/topics/{id}/document/export`

#### 16. Cost Tracking
Display cost breakdowns for research topics:
- **Endpoints:** `GET /research/topics/{id}/costs`

---

## Backend Endpoints NOT Used by Extension (May Not Need)

These endpoints exist in the backend but may not be relevant for the Chrome extension context:

| Endpoint | Reason |
|----------|--------|
| `POST /scraper/search-and-scrape-limited` | Similar to search-and-scrape, limited use case |
| `POST /scraper/mic-check` | Internal testing only |
| `POST /ai/agent/warm` | Optimization; not critical for extension |
| `POST /tools/test/session` | Tool testing workflow |
| `GET /health/*` | Internal monitoring |
| `POST /research/topics/{id}/sources/upload` | Returns 501 (not implemented) |
| `GET /research/templates/{id}` | Template management more useful in main web app |

---

## Architecture Notes

### API Base URL
The extension currently requires manual API URL configuration in Options. Consider:
- Default to production URL
- Auto-detect from Supabase project URL
- Environment toggle (dev/staging/prod)

### Error States
Many new components need better error states:
- Network offline handling
- Auth token expired → redirect to login
- API errors → user-friendly messages

### Background Sync
Consider using the Background Service Worker to:
- Periodically check the scrape queue
- Show badge count of pending items
- Auto-submit content when navigating to queued URLs

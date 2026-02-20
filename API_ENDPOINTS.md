# API Endpoints & Database Schema — Matrx Chrome Extension

## Base URL Configuration
- Stored in `chrome.storage.sync['apiBaseUrl']`
- Configured in Options page
- All paths below are relative to this base URL

## Authentication Levels
| Level | Header Required | Description |
|-------|----------------|-------------|
| Public | None | Health checks |
| Guest | Fingerprint or Bearer token | AI chat, agent execution |
| Authenticated | `Authorization: Bearer {jwt}` | Scraper, research, tools |
| Admin | Bearer + is_admin | Test endpoints |

---

## 1. Health — `GET /health`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health/` | Basic health check |
| GET | `/health/detailed` | Detailed health check with component status |

---

## 2. AI — `/ai` (Guest or above)

### Agent Execution
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/ai/agent/warm` | Pre-load/cache an agent | Public |
| POST | `/ai/agent/execute` | Execute agent (SSE streaming) | Guest+ |
| POST | `/ai/chat/unified` | Multi-provider AI chat (SSE streaming) | Guest+ |
| POST | `/ai/cancel/{request_id}` | Cancel ongoing request | Guest+ |

### `POST /ai/agent/execute`
```json
{
  "prompt_id": "string (required)",
  "conversation_id": "string (optional, auto-generated if new)",
  "is_new_conversation": true,
  "user_input": "string or [{role, content}]",
  "variables": {},
  "config_overrides": {},
  "is_builtin": false,
  "stream": true,
  "debug": true
}
```

### `POST /ai/chat/unified`
```json
{
  "ai_model_id": "string (required — e.g. 'gpt-4', 'claude-3-opus')",
  "messages": [{"role": "user", "content": "..."}],
  "system_instruction": "string (optional)",
  "max_iterations": 20,
  "max_output_tokens": null,
  "temperature": null,
  "tools": ["tool_name_1", "tool_name_2"],
  "tool_choice": null,
  "parallel_tool_calls": true,
  "stream": true,
  "conversation_id": "string (optional)",
  "is_new_conversation": true,
  "store": true
}
```
**Response (SSE):** Status updates, completion with `iterations`, `total_usage`, `timing_stats`, `tool_call_stats`, `finish_reason`.

---

## 3. Utilities — `/utilities` (Guest or above)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/utilities/pdf/extract-text` | Extract text from PDF/image (multipart form) |

---

## 4. Scraper — `/scraper` (Authenticated)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/scraper/quick-scrape` | Scrape multiple URLs (SSE) |
| POST | `/scraper/search` | Search keywords (SSE) |
| POST | `/scraper/search-and-scrape` | Search + scrape results (SSE) |
| POST | `/scraper/search-and-scrape-limited` | Single keyword with page limit (SSE) |
| POST | `/scraper/mic-check` | Test scraper service |

### `POST /scraper/quick-scrape`
```json
{
  "urls": ["https://..."],
  "use_cache": true,
  "stream": true,
  "get_organized_data": false,
  "get_structured_data": false,
  "get_overview": false,
  "get_text_data": true,
  "get_main_image": false,
  "get_links": false,
  "get_content_filter_removal_details": false,
  "include_highlighting_markers": true,
  "include_media": true,
  "include_media_links": true,
  "include_media_description": true,
  "include_anchors": true,
  "anchor_size": 100
}
```

### `POST /scraper/search`
```json
{
  "keywords": ["keyword1", "keyword2"],
  "country_code": "us",
  "total_results_per_keyword": 10,
  "search_type": "web"
}
```

### `POST /scraper/search-and-scrape`
```json
{
  "keywords": ["keyword1"],
  "country_code": "us",
  "total_results_per_keyword": 10,
  "search_type": "web",
  "...scrape_options"
}
```

---

## 5. Tools — `/tools` (Authenticated)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/tools/test/list?category=...` | List all available tools |
| GET | `/tools/test/{tool_name}` | Get tool specifications |
| POST | `/tools/test/session` | Create test session |
| POST | `/tools/test/execute` | Execute tool with arguments (SSE) |

### `POST /tools/test/execute`
```json
{
  "tool_name": "string",
  "arguments": {},
  "conversation_id": "string"
}
```

---

## 6. Research — `/research` (Authenticated)

### Templates
| Method | Path | Description |
|--------|------|-------------|
| GET | `/research/templates/list` | List all research templates |
| POST | `/research/templates` | Create new template |
| GET | `/research/templates/{template_id}` | Get specific template |

### Extension Integration
| Method | Path | Description |
|--------|------|-------------|
| GET | `/research/extension/scrape-queue` | Get pending scrape items for Chrome extension |
| POST | `/research/topics/{topic_id}/sources/{source_id}/extension-content` | Submit content from Chrome extension |

### Research Setup
| Method | Path | Description |
|--------|------|-------------|
| POST | `/research/suggest` | AI-suggested research setup |

**Body:** `{ "topic_name": "...", "topic_description": "..." }`

### Topic Management
| Method | Path | Description |
|--------|------|-------------|
| POST | `/research/projects/{project_id}/topics` | Create topic |
| GET | `/research/projects/{project_id}/topics` | List topics in project |
| GET | `/research/topics/{topic_id}` | Get topic details |
| PATCH | `/research/topics/{topic_id}` | Update topic |

### Keywords
| Method | Path | Description |
|--------|------|-------------|
| POST | `/research/topics/{topic_id}/keywords` | Add keywords |
| GET | `/research/topics/{topic_id}/keywords` | List keywords |
| DELETE | `/research/topics/{topic_id}/keywords/{keyword_id}` | Delete keyword |

### Search & Scrape (SSE streaming)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/research/topics/{topic_id}/search` | Execute keyword search |
| POST | `/research/topics/{topic_id}/scrape` | Execute scraping |
| POST | `/research/topics/{topic_id}/sources/{source_id}/rescrape` | Re-scrape single source |
| POST | `/research/topics/{topic_id}/run` | Full pipeline (search → scrape → analyze → synthesize) |

### Sources
| Method | Path | Description |
|--------|------|-------------|
| GET | `/research/topics/{topic_id}/sources?keyword_id=&scrape_status=&source_type=&hostname=&is_included=&origin=&limit=&offset=` | List sources (filterable) |
| PATCH | `/research/topics/{topic_id}/sources/{source_id}` | Update source |
| PATCH | `/research/topics/{topic_id}/sources/bulk` | Bulk update sources |

**Bulk actions:** `"include"`, `"exclude"`, `"mark_stale"`, `"mark_complete"`

### Content
| Method | Path | Description |
|--------|------|-------------|
| GET | `/research/topics/{topic_id}/sources/{source_id}/content` | Get content versions |
| PATCH | `/research/topics/{topic_id}/content/{content_id}` | Edit content |
| POST | `/research/topics/{topic_id}/sources/{source_id}/content` | Paste content manually |

### Analysis
| Method | Path | Description |
|--------|------|-------------|
| POST | `/research/topics/{topic_id}/sources/{source_id}/analyze` | Analyze single source |
| POST | `/research/topics/{topic_id}/analyses/{analysis_id}/retry` | Retry failed analysis |
| POST | `/research/topics/{topic_id}/retry-failed` | Retry all failed |
| POST | `/research/topics/{topic_id}/analyze-all` | Bulk analyze (SSE) |

### Synthesis & Documents
| Method | Path | Description |
|--------|------|-------------|
| POST | `/research/topics/{topic_id}/synthesize` | Generate synthesis (SSE) |
| GET | `/research/topics/{topic_id}/synthesis?scope=&keyword_id=` | Get synthesis results |
| POST | `/research/topics/{topic_id}/document` | Generate document |
| GET | `/research/topics/{topic_id}/document` | Get latest document |
| GET | `/research/topics/{topic_id}/document/versions` | Get all document versions |
| GET | `/research/topics/{topic_id}/document/export?format=json` | Export document |
| GET | `/research/topics/{topic_id}/costs` | Get cost breakdown |

### Tags
| Method | Path | Description |
|--------|------|-------------|
| GET | `/research/topics/{topic_id}/tags` | List tags |
| POST | `/research/topics/{topic_id}/tags` | Create tag |
| PATCH | `/research/topics/{topic_id}/tags/{tag_id}` | Update tag |
| DELETE | `/research/topics/{topic_id}/tags/{tag_id}` | Delete tag |
| POST | `/research/topics/{topic_id}/sources/{source_id}/tags` | Assign tags to source |
| POST | `/research/topics/{topic_id}/tags/{tag_id}/consolidate` | Consolidate tag |
| POST | `/research/topics/{topic_id}/sources/{source_id}/suggest-tags` | AI-suggest tags |

### Links & Media
| Method | Path | Description |
|--------|------|-------------|
| GET | `/research/topics/{topic_id}/links` | Get extracted links |
| POST | `/research/topics/{topic_id}/links/add-to-scope` | Add URLs as sources |
| GET | `/research/topics/{topic_id}/media?media_type=&is_relevant=` | List media |
| PATCH | `/research/topics/{topic_id}/media/{media_id}` | Update media |
| POST | `/research/topics/{topic_id}/sources/{source_id}/transcribe` | Trigger transcription |

---

## Database Schema — `rs_*` Tables (Supabase: `txzxabzwovsujtloxrus`)

### `rs_topic`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| project_id | uuid | NO | |
| name | text | NO | 'Untitled Research' |
| description | text | YES | |
| autonomy_level | text | NO | 'semi' |
| default_search_provider | text | NO | 'brave' |
| default_search_params | jsonb | NO | {} |
| good_scrape_threshold | integer | NO | 1000 |
| scrapes_per_keyword | integer | NO | 5 |
| status | text | NO | 'draft' |
| template_id | uuid | YES | |
| agent_config | jsonb | NO | {} |
| metadata | jsonb | NO | {} |
| created_by | uuid | YES | |
| created_at | timestamptz | YES | now() |
| updated_at | timestamptz | YES | now() |

### `rs_keyword`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| topic_id | uuid | NO | |
| keyword | text | NO | |
| search_provider | text | NO | 'brave' |
| search_params | jsonb | NO | {} |
| last_searched_at | timestamptz | YES | |
| is_stale | boolean | YES | false |
| result_count | integer | YES | 0 |
| raw_api_response | jsonb | YES | |
| created_at | timestamptz | YES | now() |

### `rs_source`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| topic_id | uuid | NO | |
| url | text | NO | |
| title | text | YES | |
| description | text | YES | |
| hostname | text | YES | |
| source_type | text | NO | 'web' |
| origin | text | NO | 'search' |
| rank | integer | YES | |
| page_age | text | YES | |
| thumbnail_url | text | YES | |
| extra_snippets | jsonb | YES | [] |
| raw_search_result | jsonb | YES | {} |
| is_included | boolean | YES | true |
| is_stale | boolean | YES | false |
| scrape_status | text | NO | 'pending' |
| discovered_at | timestamptz | YES | now() |
| last_seen_at | timestamptz | YES | now() |

### `rs_keyword_source`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| keyword_id | uuid | NO | |
| source_id | uuid | NO | |
| rank_for_keyword | integer | YES | |
| created_at | timestamptz | YES | now() |

### `rs_content`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| source_id | uuid | NO | |
| topic_id | uuid | NO | |
| content | text | YES | |
| content_hash | text | YES | |
| char_count | integer | YES | 0 |
| content_type | text | YES | 'text/html' |
| is_good_scrape | boolean | YES | false |
| quality_override | text | YES | |
| capture_method | text | YES | 'auto' |
| failure_reason | text | YES | |
| published_at | timestamptz | YES | |
| modified_at | timestamptz | YES | |
| is_current | boolean | YES | true |
| version | integer | YES | 1 |
| linked_extraction_id | uuid | YES | |
| linked_transcript_id | uuid | YES | |
| extracted_links | jsonb | YES | [] |
| extracted_images | jsonb | YES | [] |
| scraped_at | timestamptz | YES | now() |

### `rs_analysis`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| content_id | uuid | NO | |
| source_id | uuid | NO | |
| topic_id | uuid | NO | |
| agent_type | text | NO | |
| agent_id | text | YES | |
| model_id | text | YES | |
| instructions | text | YES | |
| result | text | YES | |
| result_structured | jsonb | YES | |
| token_usage | jsonb | YES | {} |
| status | text | NO | 'success' |
| error | text | YES | |
| created_at | timestamptz | YES | now() |

### `rs_synthesis`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| topic_id | uuid | NO | |
| keyword_id | uuid | YES | |
| tag_id | uuid | YES | |
| scope | text | NO | |
| agent_type | text | NO | |
| agent_id | text | YES | |
| model_id | text | YES | |
| instructions | text | YES | |
| result | text | YES | |
| result_structured | jsonb | YES | |
| input_source_ids | jsonb | YES | [] |
| input_analysis_ids | jsonb | YES | [] |
| token_usage | jsonb | YES | {} |
| is_current | boolean | YES | true |
| version | integer | YES | 1 |
| iteration_mode | text | YES | 'initial' |
| previous_synthesis_id | uuid | YES | |
| status | text | NO | 'success' |
| error | text | YES | |
| created_at | timestamptz | YES | now() |

### `rs_document`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| topic_id | uuid | NO | |
| title | text | YES | |
| content | text | YES | |
| content_structured | jsonb | YES | |
| source_consolidation_ids | jsonb | YES | [] |
| agent_type | text | YES | |
| agent_id | text | YES | |
| model_id | text | YES | |
| token_usage | jsonb | YES | {} |
| version | integer | YES | 1 |
| status | text | NO | 'success' |
| error | text | YES | |
| is_current | boolean | NO | true |
| created_at | timestamptz | YES | now() |

### `rs_tag`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| topic_id | uuid | NO | |
| name | text | NO | |
| description | text | YES | |
| sort_order | integer | YES | 0 |
| created_at | timestamptz | YES | now() |

### `rs_source_tag`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| source_id | uuid | NO | |
| tag_id | uuid | NO | |
| is_primary_source | boolean | YES | false |
| confidence | double precision | YES | |
| assigned_by | text | YES | 'user' |
| created_at | timestamptz | YES | now() |

### `rs_media`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| source_id | uuid | NO | |
| topic_id | uuid | NO | |
| media_type | text | NO | |
| url | text | NO | |
| alt_text | text | YES | |
| caption | text | YES | |
| thumbnail_url | text | YES | |
| width | integer | YES | |
| height | integer | YES | |
| is_relevant | boolean | YES | true |
| metadata | jsonb | YES | {} |
| created_at | timestamptz | YES | now() |

### `rs_template`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| name | text | NO | |
| description | text | YES | |
| is_system | boolean | NO | false |
| created_by | uuid | YES | |
| keyword_templates | jsonb | YES | [] |
| default_tags | jsonb | YES | [] |
| default_search_params | jsonb | YES | {} |
| agent_config | jsonb | YES | {} |
| autonomy_level | text | NO | 'semi' |
| metadata | jsonb | YES | {} |
| created_at | timestamptz | NO | now() |

### `rs_source_keywords` (View/Materialized — joins source + keyword data)
Same columns as `rs_source` plus `keyword_id` and `rank_for_keyword`.

---

## Chrome Extension ↔ Backend Mapping

### Currently Connected
| Plugin Feature | Current Endpoint | Status |
|---------------|-----------------|--------|
| AI Chat | `POST /api/chat` | **WRONG PATH** — should be `/ai/chat/unified` |

### Needs Connection
| Plugin Feature | Backend Endpoint | Priority |
|---------------|-----------------|----------|
| AI Chat (fix) | `POST /ai/chat/unified` | **HIGH** |
| Quick Scrape (current page) | `POST /scraper/quick-scrape` | **HIGH** |
| Extension Scrape Queue | `GET /research/extension/scrape-queue` | **HIGH** |
| Submit Extension Content | `POST /research/topics/{id}/sources/{id}/extension-content` | **HIGH** |
| Search Keywords | `POST /scraper/search` | MEDIUM |
| Research Topics | `GET /research/projects/{id}/topics` | MEDIUM |
| Research Sources | `GET /research/topics/{id}/sources` | MEDIUM |
| Tool Discovery | `GET /tools/test/list` | LOW |
| Health Check | `GET /health/` | LOW |

### Missing Chrome Plugin Features (need new components)
| Feature | Description | Backend Endpoints |
|---------|-------------|-------------------|
| Research Dashboard | View/manage research topics | `/research/projects/*/topics`, `/research/topics/*` |
| Source Manager | View scraped sources, content | `/research/topics/*/sources`, `/research/topics/*/sources/*/content` |
| Scrape Queue | Show pending scrapes from extension | `/research/extension/scrape-queue` |
| Quick Scrape Tab | Scrape current page directly | `/scraper/quick-scrape` |
| Content Submission | Send extracted HTML to research backend | `/research/topics/*/sources/*/extension-content` |

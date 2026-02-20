# Matrx Chrome Extension

Chrome extension for the [AI Matrx](https://aimatrx.com) platform. Extracts, analyzes, and processes web content with AI-powered tools.

**Current version:** 2.0.0

---

## Features

- **Content extraction** — full HTML, smart-filtered HTML, and custom range extraction from any page
- **AI chat** — unified chat with agent/model selection and conversation persistence
- **Research management** — browse topics, manage keywords, view sources, trigger search/scrape pipelines
- **Quick scrape** — scrape current page or batch URLs with real-time SSE progress
- **Scrape queue** — view pending items from research system, auto-detect queued URLs, submit content
- **SEO analyzer** — analyze page title, meta, headings, images, links, and content
- **Tool browser** — browse and test available backend tools by category
- **Page analysis** — header structure, link analysis, image analysis, text extraction
- **Supabase storage** — extracted data saved per-user with Row Level Security
- **OAuth authentication** — Google, GitHub, and Apple sign-in via `chrome.identity.launchWebAuthFlow`
- **Theme support** — light, dark, and system preference with CSS custom properties

## Tech Stack

- **Framework:** [WXT](https://wxt.dev/) 0.20.17 (Vite 7.3 + Manifest V3)
- **UI:** React 19.2 + TypeScript 5.9
- **Styling:** Tailwind CSS 4.1 with custom design tokens (`--m-*` prefix)
- **Auth:** Supabase OAuth via `chrome.identity.launchWebAuthFlow`
- **API:** FastAPI backend with REST + SSE streaming
- **Icons:** Lucide React

## Installation

### Development

1. Clone and install:
   ```bash
   git clone <repo-url>
   cd matrx-chrome
   pnpm install
   ```

2. Build:
   ```bash
   pnpm build
   ```

3. Load in Chrome:
   - Go to `chrome://extensions/`
   - Enable **Developer mode** (top-right toggle)
   - Click **Load unpacked** and select the `.output/chrome-mv3` directory
   - The extension installs and opens the settings page

4. Sign in:
   - Open the extension Settings page
   - Authenticate with Google, GitHub, Apple, or email/password

### Dev mode (hot reload)

```bash
pnpm dev
```

Load `.output/chrome-mv3-dev` in Chrome for auto-reloading during development.

## Architecture

### Extension Contexts

| Context | Entry Point | Purpose |
|---------|-------------|---------|
| Background | `entrypoints/background/` | Service worker — message hub, scrape queue polling, auth init |
| Side Panel | `entrypoints/sidepanel/` | Primary UI — chat, scrape, research, tools, SEO, extract |
| Options | `entrypoints/options/` | Settings — auth, theme, default project |
| Popup | `entrypoints/popup/` | Quick actions on icon click |
| Content Script | `entrypoints/content/` | Page analysis, HTML extraction, browser automation |

### Authentication

OAuth uses `chrome.identity.launchWebAuthFlow` which opens providers in a Chrome-managed popup and returns tokens. Sessions persist in `chrome.storage.local` via a `ChromeStorageAdapter`. Supabase credentials are hardcoded — this extension is built specifically for the AI Matrx project.

### File Structure

```
matrx-chrome/
├── entrypoints/
│   ├── background/index.ts    # Service worker
│   ├── sidepanel/             # Side panel (React app)
│   ├── options/               # Options page (React app)
│   ├── popup/                 # Popup (React app)
│   └── content/index.ts       # Content script
├── components/
│   ├── auth/                  # LoginForm, AuthStatus
│   ├── chat/                  # ChatPanel, AgentSelector, ConversationSidebar
│   ├── scraper/               # QuickScrapePanel, ScrapeQueuePanel
│   ├── research/              # ResearchPanel, SourceDetailView
│   ├── seo/                   # SeoPanel
│   ├── tools/                 # ToolBrowserPanel
│   └── ui/                    # Design system components (Button, Card, Input, etc.)
├── hooks/                     # useAuth, useTheme, useCurrentTab
├── utils/
│   ├── auth.ts                # Supabase + chrome.identity OAuth
│   ├── api-client.ts          # REST + SSE streaming client
│   ├── types.ts               # All TypeScript types
│   ├── storage.ts             # chrome.storage helpers
│   └── supabase-queries.ts    # Direct Supabase queries
├── assets/                    # Icons, styles
├── wxt.config.ts              # WXT + manifest config
└── tailwind.config.ts         # Tailwind config
```

## Documentation

- **[DESIGN.md](DESIGN.md)** — Technical architecture, communication patterns, data flow
- **[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)** — CSS tokens, component classes, migration guide
- **[API_ENDPOINTS.md](API_ENDPOINTS.md)** — Backend endpoint reference and database schema
- **[AGENT_TASKS.md](AGENT_TASKS.md)** — Current task backlog

## Security

- **Publishable key only** — uses Supabase publishable key, safe for client-side
- **RLS enforced** — database tables have Row Level Security
- **No secrets in storage** — `chrome.storage.sync` only holds user preferences
- **OAuth via Chrome identity** — tokens handled by Chrome's built-in identity API

## License

Proprietary — AI Matrx. All rights reserved.

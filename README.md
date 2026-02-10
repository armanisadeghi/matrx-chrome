# Matrx Chrome Extension

Chrome extension for the [AI Matrx](https://aimatrx.com) platform. Extracts, analyzes, and processes web content with AI-powered tools.

**Current version:** 1.1.0

---

## Features

- **Content extraction** -- full HTML, smart-filtered HTML, and custom range extraction from any page
- **AI processing** -- Gemini API integration for intelligent content extraction and summarization
- **Page analysis** -- header structure, link analysis, image analysis, SEO, text extraction
- **Supabase storage** -- extracted data saved per-user with Row Level Security
- **OAuth authentication** -- Google, GitHub, and Apple sign-in via `chrome.identity.launchWebAuthFlow`
- **Side panel UI** -- full-featured analysis interface that opens alongside any page
- **Real-time backend** -- optional Socket.IO connection for live processing
- **Markdown viewer** -- formatted and raw markdown views of AI-generated content

## Installation

### Development

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd matrx-chrome
   ```

2. Load in Chrome:
   - Go to `chrome://extensions/`
   - Enable **Developer mode** (top-right toggle)
   - Click **Load unpacked** and select this directory
   - The extension installs and opens the settings page

3. Sign in:
   - Click **Sign In** on the auth bar (top of side panel or popup) or open **Settings**
   - Authenticate with Google, GitHub, or email/password

No build step. No dependencies to install. The extension is plain JavaScript.

## Architecture

### Authentication

OAuth is handled via `chrome.identity.launchWebAuthFlow`, which opens the provider in a Chrome-managed popup and returns tokens to the extension. Sessions persist in `chrome.storage.local` via a custom `ChromeStorageAdapter`.

The Supabase project URL and publishable API key are hardcoded in `lib/auth.js` -- this extension is built specifically for the AI Matrx Supabase project.

### Data flow

```
User signs in via OAuth or email
  -> Session stored in chrome.storage.local
  -> Supabase client initialized with publishable key + user JWT
  -> Extractions saved to html_extractions table (RLS enforces user_id)
```

### User-configurable settings (`chrome.storage.sync`)

| Setting | Purpose | Default |
|---------|---------|---------|
| `supabaseTableName` | Target table for extractions | `html_extractions` |
| `socketServerUrl` | Backend API / Socket.IO server URL | _(empty)_ |
| `geminiApiKey` | Google Gemini API key for AI extraction | _(empty)_ |

### File structure

```
matrx-chrome/
├── manifest.json              # Extension config (permissions, version)
├── background/
│   └── background.js          # Service worker, install handler, message routing
├── content/
│   └── content.js             # Content script injected into pages
├── lib/
│   ├── auth.js                # SupabaseAuth class (OAuth, email, session mgmt)
│   ├── supabase.js            # Supabase JS client (bundled)
│   ├── gemini-client.js       # Google Gemini API client
│   └── markdown-utils.js      # Markdown rendering utilities
├── options/
│   ├── options.html           # Settings + auth page
│   ├── options.js             # Settings logic, OAuth handlers
│   └── options.css            # Settings styles
├── popup/
│   ├── popup.html             # Popup UI (click extension icon)
│   ├── popup.js               # Popup logic
│   ├── popup.css              # Popup styles
│   └── template-loader.js     # Shared template loader
├── sidepanel/
│   ├── sidepanel.html         # Side panel UI (primary interface)
│   ├── sidepanel.js           # Side panel logic
│   └── sidepanel.css          # Side panel styles
├── socket/
│   ├── socket-client.js       # Socket.IO client wrapper
│   └── socket.io.min.js       # Socket.IO library (bundled)
├── components/                # Shared UI components
├── templates/                 # Shared HTML templates
└── icons/                     # Extension icons (16, 32, 48, 128)
```

## Versioning

This project uses **x.y.zz** versioning:

| Segment | Meaning | Example |
|---------|---------|---------|
| **x** (major) | Breaking changes, major rewrites | `1.0.0` -> `2.0.0` |
| **y** (minor) | New features, non-breaking changes | `1.0.0` -> `1.1.0` |
| **zz** (patch) | Bug fixes, small tweaks | `1.1.0` -> `1.1.01` |

Chrome's manifest `version` field strips leading zeros, so `1.1.01` becomes `1.1.1` in the manifest. Use the full format in commit messages, changelogs, and documentation.

**When bumping versions:**

1. Update `version` in `manifest.json`
2. Note the version in your commit message: `v1.1.01: fix auth token refresh`

## Development

### Debugging

- **Side panel / popup**: Right-click the extension UI -> Inspect
- **Background service worker**: `chrome://extensions/` -> click "service worker" under Matrx
- **Content script**: Open DevTools on any page, check the Console tab

### Making changes

1. Edit files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Matrx extension card
4. Test changes (side panel, popup, or options page)

Content script changes require a page reload. Background script changes require the extension refresh.

### Contributing

1. Create a feature branch from `main`
2. Follow the existing code style (vanilla JS, no build tools)
3. Test on multiple sites before submitting
4. Use the versioning convention above in commit messages
5. Submit a pull request with a clear description of changes

## Security

- **Publishable key only** -- the extension uses a Supabase publishable key (`sb_publishable_...`), safe for client-side use
- **RLS enforced** -- `html_extractions` has Row Level Security; users can only access their own data
- **No secrets in storage** -- `chrome.storage.sync` only holds user preferences, never credentials
- **OAuth via Chrome identity** -- tokens are handled by Chrome's built-in identity API, never exposed to page content

## License

Proprietary -- AI Matrx. All rights reserved.

## Chrome Extension Stack

**Framework:** Vite 6 + React 19.2 + TypeScript 5.9

**Extension Framework:** WXT — sits on top of Vite, gives you file-based entry points, HMR in dev, auto-manifest generation, and TypeScript support out of the box. Closest thing to a Next.js DX for extensions.

**Styling:** Tailwind CSS 4.1 — same as your web stack. Be aware that content scripts inject into third-party pages, so use `@layer` scoping and a custom prefix (e.g., `matrx-`) to avoid CSS collisions with host page styles.

**Package Manager:** pnpm 10.28

---

## Architecture

### Extension Contexts

Chrome extensions are not a single app — they're multiple isolated environments communicating via message passing:

- **Popup** — React app rendered when the icon is clicked. Destroyed on close; don't rely on in-memory state persisting.
- **Side Panel** — React app rendered in Chrome's side panel. Persistent across tabs, better for complex UI.
- **Background Service Worker** — No DOM, no React. Handles long-running logic, API calls, auth token refresh, and message routing between contexts. MV3 only — no persistent background pages.
- **Content Scripts** — Injected into host pages. Can read/modify DOM. Isolated JS context; communicates with background via `chrome.runtime.sendMessage`.
- **Options Page** — Full React app for settings/config.

### Communication Pattern

All cross-context communication goes through the Background Service Worker as the hub. Content scripts and popup/side panel send messages to background; background makes API calls and routes responses back. Never make sensitive API calls directly from content scripts.

---

## Auth

**Supabase via AI Matrx OAuth** — Extensions can't use the standard browser OAuth redirect flow cleanly. Use `chrome.identity.launchWebAuthFlow` to handle the OAuth redirect, capture the token, and store it in `chrome.storage.local`. The Background Service Worker handles token refresh silently. Pass the Supabase JWT with every API request as a Bearer token — same as your web clients.

---

## Data & API

**AI Matrx Next.js API Routes** — Primary backend. All business logic lives here, same as your web/mobile clients. Extension calls these endpoints with the Supabase JWT.

**Python Microservices** — Called indirectly through your Next.js API routes, same pattern as everywhere else. Extensions never call Python services directly.

**Supabase Direct Access** — Use `supabase-js 2.93` for Realtime subscriptions (presence, live data) and storage. Keep all writes and sensitive reads going through Next.js API routes; use direct Supabase access only where Realtime or storage transforms are genuinely needed.

---

## Storage

`chrome.storage.local` for persisted extension state (tokens, user prefs, cached data). `chrome.storage.session` for tab-scoped ephemeral state. Do not use `localStorage` — it doesn't work in service workers and is not shared across extension contexts.

---

## Manifest V3 Constraints

- Background is a Service Worker — no persistent state in memory, no DOM
- `webRequest` blocking is restricted — use `declarativeNetRequest` for request modification
- CSP blocks `eval` and inline scripts — ensure no libraries you use depend on these
- Host permissions must be declared explicitly in the manifest; WXT handles manifest generation but your team needs to declare these intentionally

---

## Type Safety

TypeScript strict mode throughout. Supabase-generated types as source of truth, same as your web stack. Define typed message schemas for all `chrome.runtime.sendMessage` calls — untyped message passing is where bugs hide in extensions.

---

## Dev & Build

- WXT handles HMR, auto-reload of extension during development, and produces a production zip ready for Chrome Web Store submission
- Separate Vite entry points per context (popup, side panel, background, content scripts) — WXT manages this automatically
- Test with Vitest; for content script and DOM interaction testing use Playwright with a real Chromium instance
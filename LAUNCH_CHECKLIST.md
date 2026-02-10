# Matrx Chrome Extension -- Launch Checklist

## Done

- [x] Auth rewrite: `chrome.identity.launchWebAuthFlow` with Supabase OAuth (Google, GitHub, Apple)
- [x] Migrated to Supabase publishable key (`sb_publishable_...`), legacy JWT anon key removed
- [x] Removed unnecessary permissions from `manifest.json`
- [x] Removed Supabase URL/key from user-configurable settings
- [x] Cleaned up options page (auth + Gemini + Socket + table name only)
- [x] Replaced hardcoded Gitpod dev URLs with configurable backend URL
- [x] Socket.IO client skips connection when no server URL configured
- [x] RLS enabled on `html_extractions` with INSERT/SELECT/DELETE policies
- [x] Foreign key added: `user_id` references `auth.users(id)` with cascade delete
- [x] Unauthenticated saves blocked with clear error message
- [x] Redirect URL added to Supabase: `https://ccmjgggbdngllppncmidllcjablcdepl.chromiumapp.org/`
- [x] Security advisories resolved
- [x] Auth status bar added to sidepanel and popup (shows signed-in state, sign-in button)
- [x] Version bumped to 1.1.0
- [x] README rewritten with current architecture, versioning convention, and contributor guidelines
- [x] Options page redesigned to match aimatrx.com login (dark theme, centered card, blue glow shadow)
- [x] Apple OAuth sign-in button added (Google + Apple + GitHub, 3-column grid)
- [x] Auth session persistence fixed: options, popup, and sidepanel all use shared `window.supabaseAuth` instance
- [x] Supabase lib loads before auth module in all contexts (fixes initialization race)
- [x] Sidepanel listens for `chrome.storage.onChanged` to detect sign-in from options page while open
- [x] Version bumped to 1.1.1

## Pending

- [ ] **Test the full auth flow end-to-end**: Load extension, sign in via Google/GitHub/Apple, verify auth bar updates in popup and sidepanel, verify session persists across Chrome restarts, extract a page and confirm it saves to `html_extractions` with correct `user_id`

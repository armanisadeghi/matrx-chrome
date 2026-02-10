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

## Pending

- [ ] **Test the full auth flow end-to-end**: Load extension, sign in via Google/GitHub, verify session persists across page reloads and Chrome restarts, extract a page and confirm it saves to `html_extractions` with correct `user_id`

# Agent Tasks

The following are tasks that need to be done, then checked off and eventually removed from this list so we always have a nice, clean, concise list of upcoming tasks.

## Completed

[x] - Default theme to 'system' (useTheme.ts, background/index.ts)
[x] - Hardcode API base URL — removed user-facing config, set default to https://api.aimatrx.com
[x] - Remove Database/table config from Options — not consumer-facing
[x] - Fix Options page layout — removed developer cards, widened max-width
[x] - OAuth callback URL — code is correct (uses chrome.identity.getRedirectURL), issue is Supabase dashboard config. Added to Arman tasks.
[x] - Clean up .md files — REMAINING_TASKS.md and CHROME_AUTH_SETUP.md are obsolete (fully implemented). README.md rewritten for current stack. DESIGN.md, DESIGN_SYSTEM.md, API_ENDPOINTS.md kept as-is.

## Pending

[ ] - Delete obsolete files: REMAINING_TASKS.md, .arman/CHROME_AUTH_SETUP.md (these have been fully implemented and are now just clutter)
[ ] - SSE stream event handling refinement — test alignment between apiStreamEvents parser and backend StreamEmitter format
[ ] - Agent execution tab — direct agent execution UI beyond chat (select agents, pass variables, view structured results)
[ ] - PDF upload from extension — allow uploading PDFs found on pages for text extraction via /utilities/pdf/extract-text
[ ] - Error handling improvements — network offline, auth token expired redirect, user-friendly API error messages
[ ] -
[ ] -
[ ] -

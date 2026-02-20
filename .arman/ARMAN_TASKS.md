# Arman Tasks

The following are tasks that Arman must do. As you add tasks, if tasks are done, move them to the bottom, make them more concise and get them out of the way so we're left with only the real pending tasks.

[ ] - Configure Supabase OAuth redirect URL in the dashboard:
      1. Go to Supabase Dashboard > Authentication > URL Configuration
      2. Under Redirect URLs, add: https://<EXTENSION-ID>.chromiumapp.org/
         (Get your extension ID from chrome://extensions/ with Developer Mode on)
      3. For dev, you can also add the wildcard: https://*.chromiumapp.org/
      4. Ensure Google, GitHub, and Apple providers are enabled under Authentication > Providers
      Note: The extension code is correct — it uses chrome.identity.getRedirectURL() which returns the chromiumapp.org URL. The "user did not approve access" error happens because Supabase doesn't have this URL allowlisted, so the OAuth flow breaks.

[ ] - Confirm the production API base URL is https://api.aimatrx.com — this is now hardcoded in the extension. If it's different, update DEFAULT_API_BASE_URL in utils/api-client.ts.

[ ] - Delete these obsolete .md files (agent doesn't have delete permission):
      - REMAINING_TASKS.md (all tasks completed or migrated to AGENT_TASKS.md)
      - .arman/CHROME_AUTH_SETUP.md (auth rewrite fully implemented in utils/auth.ts)

[x] - Check supabase oauth to confirm path
[x] - Test the login system

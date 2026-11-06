---
name: preview
description: Show the website on this computer in the browser, including unpublished changes. Use when Adina wants to see, look at, or try the site locally ("show me", "can I see it", "open the site").
---

# Preview the site locally

1. Start the preview server in the background (it's fine if it's already running; the script detects that and
   just opens the browser):
   ```
   npm run preview
   ```
   Run it with `run_in_background` so the conversation can continue.
2. Tell her: the site is open in her browser at http://localhost:4000. It only works on this computer while
   we're working. After each change, she should **refresh the page** to see it.
3. Mention which page(s) to look at for the change you just made, with direct links, e.g.
   http://localhost:4000/listen.

If the server fails to start, check `node_modules` exists (otherwise run `npm run setup` first).

---
name: publish
description: Make the current changes live on adinaforsberg.com. Use when Adina says to publish, go live, put it on the real site, or similar. Always asks for her confirmation first.
---

# Publish to the live site

1. Check the state: `git status`, `git branch --show-current`. You must be on an `idea/…` branch with
   everything committed (commit finished work first). If you're on `main` with nothing to publish, say so.
2. Summarise what will change on the live site, in plain language, from `git log main..HEAD` and
   `git diff main...HEAD --stat`. If anything in the diff is outside `public/`, mention it in plain terms.
3. Run `npm run screenshot` for the affected pages and check them once more at phone and desktop size.
4. **Ask her explicitly**: "Ready to make this live on adinaforsberg.com?" Only continue on a clear yes.
5. Publish:
   ```
   git fetch origin
   git switch main
   git pull --ff-only
   git merge --no-ff idea/<name> -m "Publish: <plain summary>"
   git push origin main
   ```
   - If the merge has conflicts: `git merge --abort`, `git switch idea/<name>`, and tell her someone else
     (probably John) changed the site in the meantime and he should help combine the changes. Don't resolve
     conflicts in content she hasn't seen.
   - If the push is rejected or asks for a login, stop and tell her to ask John. Don't force anything.
6. Clean up: `git branch -d idea/<name>`. Leave `main` checked out.
7. Tell her it'll be live at https://adinaforsberg.com in 1–2 minutes (a hard refresh may be needed), and that
   it can be undone.

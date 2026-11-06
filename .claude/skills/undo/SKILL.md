---
name: undo
description: Undo changes: the last edit, an unpublished idea, or something already published on the live site. Use when Adina says undo, go back, revert, "I liked it better before", or "put it back how it was".
---

# Undo

First work out **what** she wants undone, using `git status`, `git branch --show-current` and
`git log --oneline -15`. Describe the candidates in plain language ("the bigger headings from a few minutes ago",
"everything we did on the Listen page today", "what was published on Tuesday") and confirm if there's any doubt.

Never use `git reset --hard`, `git clean`, `git push --force` or anything that deletes history. Undo by adding new
commits, so every step can itself be undone.

## Not committed yet
Throw away the edits to specific files with `git restore <files>`. Only if she's sure: these changes can't be
recovered afterwards.

## Committed on an `idea/…` branch (not live)
`git revert --no-edit <commit>…` (newest first). Then take screenshots and show her the result.

To drop a whole idea she doesn't want, commit nothing more and switch back to `main`. The branch can stay (it's
harmless) or be deleted with `git branch -D` once she confirms she won't want it.

## Already live (on `main`)
1. Find the publish commit(s): `git log --oneline --first-parent main`.
2. Make a branch for the undo: `git switch main && git pull --ff-only && git switch -c idea/undo-<what>`.
3. Revert: for a "Publish: …" merge commit use `git revert --no-edit -m 1 <merge-commit>`; for a normal commit
   `git revert --no-edit <commit>`.
4. Screenshot and show her, then go through the `publish` skill (which asks for confirmation) to make it live.

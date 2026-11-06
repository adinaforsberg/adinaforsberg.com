# adinaforsberg.com

Website of composer Adina Manghi Forsberg. Plain HTML/CSS, hosted on GitHub Pages.

Every push to `main` publishes the `public/` folder (see `.github/workflows/deploy.yml`).

```
public/
  index.html, about.html, listen.html, arrangements.html, complete-works.html, contact.html
  404.html                 shown for missing pages
  css/style.css            all styling
  images/  fonts/  audio/  images (WebP), web fonts, mp3s
  home/…, new-page/        forward old Squarespace URLs to the new pages
```

## Editing

- **Text:** edit the `.html` file in `public/` (on github.com you can click the pencil icon), commit, done.
  The site updates within a minute or two.
- **Add a recording:** put the mp3 in `public/audio/` and add a player where you want it:
  ```html
  <div class="player">
    <p class="player-title">Title (2024)</p>
    <p class="player-author">Performers</p>
    <audio controls preload="metadata" src="audio/file-name.mp3"></audio>
  </div>
  ```
- **Add an image:** put it in `public/images/` and use `<img src="images/name.webp" alt="description">`.

Links between pages are relative (`about`, `images/x.webp`, not `/about`) so the site also works at
the temporary `https://adinaforsberg.github.io/adinaforsberg.com/` address. Keep it that way.
The exception is `404.html`, which uses `/…` links.

Avoid replacing large mp3s often: old versions stay in the git history forever and grow the repo.

## Preview locally

```sh
npm run setup      # once: installs Playwright (screenshots) and sharp (image conversion)
npm run preview    # serves public/ like GitHub Pages at http://localhost:4000 and opens the browser
```

Other helpers:
- `npm run screenshot -- [--label before] [pages…]`: phone + desktop PNGs in `.screenshots/`
- `npm run add-image -- <photo> [name]`: resize and convert to WebP in `public/images/`

## Working with Claude

`CLAUDE.md` tells Claude Code how to work on the site with Adina: one local `idea/…` branch per idea, check every
change with screenshots, explain things in plain language. Project skills in `.claude/skills/`:
`preview` (local server), `publish` (merge to `main` after she confirms),
`undo` (reverts, never rewrites history).

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
npx serve public
```
then open http://localhost:3000.

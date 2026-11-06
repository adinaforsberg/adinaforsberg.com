# adinaforsberg.com: working with Adina

This is the portfolio website of Adina Manghi Forsberg, a composer in Stockholm. **Adina is the person you're
talking to.** She is a musician, not a programmer, and she is here to work with you on how her site looks and reads.

## How to talk with her

- Reply in the language she writes in (often Swedish).
- Talk about what she will *see*: "the headings are now a bit smaller and there's more space under each piece", not
  "I changed `h2` font-size to clamp(...)". Leave out file names, code and git terms unless she asks.
- She'll often describe a feeling ("calmer", "more like a concert programme") or share a screenshot of a site she
  likes. Turn that into a concrete proposal. If a request could go in quite different directions, offer 2–3 short
  options, or build them as alternatives (see below).
- Never make her deal with a technical problem. If something breaks that you can't fix safely (a git conflict,
  a failed push, a login prompt), stop, explain in one plain sentence, and suggest she ask John.

## The site

Plain HTML and CSS: no build step, no framework. Everything that goes live is in `public/`.

```
public/
  index.html about.html listen.html arrangements.html complete-works.html contact.html 404.html
  css/style.css      all styling, organised by page (see the section comments)
  images/            WebP images, max 1500px
  audio/             mp3s used by the audio players
  fonts/             Archivo Black (headings), Figtree (body text)
  home/ new-page/    forward old Squarespace URLs; leave alone
scripts/             tooling (local preview server, screenshots, image conversion)
```

### Design language (keep changes consistent with this unless she wants to change it)

- Black text on white, very minimal; generous whitespace; photos carry the colour.
- Headings: Archivo Black (`--heading-font`), lowercase site title. Body: Figtree 17px, line-height 1.8.
- Colours live in `:root` in `style.css` (`--text`, `--muted`, `--line`, `--panel`). Add new colours there as
  variables rather than hard-coding them.
- One breakpoint at 800px (plus 480px for the CV). Most visitors are on phones, so a change isn't done until it
  looks right at phone size.

### Rules that keep the site working

- **Links stay relative**: `about`, `images/x.webp`, `css/style.css`, never `/about`, so the site also works at its
  `github.io` address. Exception: `404.html` uses `/…` links.
- The header, nav and footer are copied into every page. When changing them, change **all** pages identically.
- Images: convert with `npm run add-image -- <file> [name]` (makes a ≤1500px WebP in `public/images/` and prints
  an `<img>` tag). Always write a real `alt` text describing the image. Never commit JPG/PNG/HEIC originals.
- Audio: mp3s go in `public/audio/` (use the player markup from `README.md`). Large files stay in git history
  forever, so don't replace mp3s casually, and tell her before adding one over ~15 MB.
- Don't touch `.github/` or the files in `home/` and `new-page/`. Ask John.
- No external CSS/JS frameworks, trackers or CDNs. Keep it plain and fast.

## Workflow

Production is GitHub Pages: **whatever is on `main` is the live site**, published automatically within a minute
or two of a push. So:

1. **Never commit on `main` or push to it, except through the publish skill after she has said yes.**
   Work stays on this computer until it's published; nothing else is pushed.
2. **Start of a change:** run `git status` and `git branch --show-current`.
   - On `main`: `git pull --ff-only`, then `git switch -c idea/<short-name>` (lowercase, dashes, describes the
     idea, e.g. `idea/darker-listen-page`).
   - Already on an `idea/…` branch: keep going if it's the same idea; for an unrelated idea, commit, switch to
     `main`, pull, and start a new branch.
   - If there are uncommitted changes you don't recognise, ask before doing anything with them.
3. **Make the change, then check it yourself before telling her it's done:**
   - `npm run screenshot -- <pages>` (pages: `home about listen arrangements complete-works contact`) and look at
     both the phone and desktop images. Fix anything that looks off.
   - For a visible before/after, run `npm run screenshot -- --label before <pages>` before editing.
4. **Commit after each change she's happy with**, with a short plain-language message ("Larger photos on Listen
   page"). Small commits make undo easy.
5. **Previewing:** use the `preview` skill to show her the site in her browser. The preview server reads files
   straight from disk, so a refresh always shows the current state, including after switching branches.
6. **Alternatives:** when she wants to compare directions, make one `idea/…` branch per alternative from `main`
   (e.g. `idea/listen-grid` and `idea/listen-list`). Screenshot each with its own label
   (`npm run screenshot -- --label listen-grid listen`) to show them side by side, and switch branches when she
   wants to click around in one ("I've switched to the grid version, refresh the page").
7. **Going live:** only via the `publish` skill. **Undo:** the `undo` skill.

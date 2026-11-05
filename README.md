# adinaforsberg.com — Cloudflare version

> **This is the `cloudflare` branch.** The live site is on `main`, hosted on GitHub Pages.
> This branch is the same site set up for Cloudflare Workers, kept ready in case the site moves.
> It has been tested locally (`npm run dev`) but **not yet deployed to a real Cloudflare account**.

Website of composer Adina Manghi Forsberg. Plain HTML/CSS. Costs $0 to host on Cloudflare's free plan.

## How it differs from `main`

| | `main` (GitHub Pages) | `cloudflare` (this branch) |
|---|---|---|
| mp3s | `public/audio/`, served with the site | `audio/`, uploaded separately to Cloudflare R2 storage |
| Old Squarespace URLs | forwarding pages in `public/home/`, `public/new-page/` | real redirects in `public/_redirects` |
| Deploy | push to `main` | `npm run deploy` (or automatically on push, see below) |

The mp3s live in R2 because Cloudflare's static file hosting doesn't support the partial downloads
browsers need to skip around in a recording. A small Worker (`src/worker.js`) serves `/audio/*` from R2
with that support; everything else is plain static files. The HTML, CSS, images and fonts are identical
to `main`.

```
public/                  the website: deployed as static files
  _redirects             old Squarespace URLs -> new URLs
  _headers               cache headers
audio/                   the mp3s; NOT deployed with the site, uploaded to R2
src/worker.js            serves /audio/* from R2
wrangler.jsonc           Cloudflare config (Worker name, R2 bucket name)
scripts/upload-audio.sh  uploads audio/ to R2
```

## Working locally (no Cloudflare account needed)

Needs Node.js 20+. Runs Cloudflare's own runtime and a local stand-in for R2 on your machine.

```sh
npm install
npm run upload-audio:local   # once, and again after adding/replacing mp3s
npm run dev                  # http://localhost:8787
```

Edits to files in `public/` show up on refresh. Local R2 data lives in `.wrangler/` (not committed).

## First deploy

These steps need Adina's Cloudflare account.

1. **Create a Cloudflare account** at https://dash.cloudflare.com/sign-up (free).
2. **Enable R2:** in the dashboard go to **Storage & databases → R2 → Overview** and complete the checkout.
   Expect to be asked for a payment method; the site stays within the free tier
   (10 GB storage, ~130 MB used here), so nothing is charged.
3. **Log in from the terminal** (opens a browser):
   ```sh
   npx wrangler login
   ```
4. **Create the bucket and upload the mp3s:**
   ```sh
   npx wrangler r2 bucket create adina-audio
   npm run upload-audio
   ```
5. **Deploy:**
   ```sh
   npm run deploy
   ```
   The first time, Wrangler may ask you to pick a `workers.dev` subdomain. It prints the URL,
   e.g. `https://adinaforsberg.<subdomain>.workers.dev`. Test there before touching the domain.

## Deploy automatically on push (optional)

In the dashboard: **Workers & Pages → adinaforsberg → Settings → Builds → Connect** and pick this repo.

- **Git branch:** `cloudflare` (or `main`, if this branch has been merged into it)
- **Build command:** leave empty
- **Deploy command:** `npx wrangler deploy` (the default)
- Turn **off** builds for non-production branches, otherwise pushes to `main` (which has no
  `wrangler.jsonc`) will trigger failing preview builds.

The Worker name in the dashboard must match `"name"` in `wrangler.jsonc` (`adinaforsberg`).

Automatic deploys only cover `public/` and the Worker. **New or replaced mp3s still have to be
uploaded with `npm run upload-audio`.**

## Editing

- **Text:** edit the `.html` files in `public/`, then deploy.
- **Add a recording:** put the mp3 in `audio/`, upload it, and add a player to the page:
  ```sh
  npx wrangler r2 object put adina-audio/file-name.mp3 --file audio/file-name.mp3 --content-type audio/mpeg --remote
  ```
  ```html
  <div class="player">
    <p class="player-title">Title (2024)</p>
    <p class="player-author">Performers</p>
    <audio controls preload="metadata" src="audio/file-name.mp3"></audio>
  </div>
  ```
- **Add an image:** put it in `public/images/` and use `<img src="images/name.webp" alt="description">`.

Keep links between pages relative (`about`, `images/x.webp`) like on `main`, so the two branches stay
interchangeable. The exception is `404.html`, which uses `/…` links.

## Going live on Cloudflare (later)

1. Move the domain's DNS to Cloudflare, either by transferring the domain to Cloudflare Registrar or by
   adding the site to Cloudflare and switching nameservers at the current registrar.
2. **Workers & Pages → adinaforsberg → Settings → Domains & Routes → Add → Custom domain:**
   `www.adinaforsberg.com` (the current canonical address).
3. Make `adinaforsberg.com` (without `www`) redirect to `www`: in the domain's dashboard,
   **Rules → Redirect Rules**, using the "Redirect from root to www" template.
4. Remove the GitHub Pages custom domain from the repo settings on GitHub.

## Remove everything

```sh
npx wrangler delete
npx wrangler r2 object delete adina-audio/<file>.mp3 --remote   # for each file, then:
npx wrangler r2 bucket delete adina-audio
```

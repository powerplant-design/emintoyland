# Em in Toyland

Emma Hewitt-Johnson — Sexologist, Certified Holistic Sex Educator, writer, podcaster, video host & sex toy expert.

## Architecture

```
Kirby CMS (headless)  ──KQL API──>  Eleventy (SSG)  ──deploy──>  Netlify
     ↑ content editing                                    CDN
     (Kirby Panel)
```

- **Kirby CMS** — flat-file headless CMS, runs on PHP 8.2+
- **Eleventy** — static site generator, fetches content at build time via KQL API
- **Netlify** — hosting and CDN

## Development

### Prerequisites
- Node.js 22 (`nvm use`)
- PHP 8.2+

### Start Kirby (CMS backend)
```bash
cd kirby
php -S localhost:8000 kirby/router.php
```
Panel: http://localhost:8000/panel

### Start Eleventy (frontend dev server)
```bash
npm run dev
```
Site: http://localhost:8080

### Build for production
```bash
npm run build
```
Output: `_site/`

## Image Management

All images are managed in Kirby via the Panel:
1. Upload images in the Media tab of any page
2. Select images in page fields (logo, hero image, work thumbnails)
3. Eleventy downloads and optimizes images at build time (avif, webp, png at multiple widths)

## Deployment

### Architecture (production)

```
content.emintoyland.com              emintoyland.com
     ↓                                       ↓
┌─ MyHost NZ (Kirby/PHP) ──┐    ┌── Netlify (static) ─────┐
│  Panel at /dev            │    │  Generated HTML/JS/CSS  │
│  Media uploads            │    │  AVIF/WebP images /img/ │
│  Content as flat files    │    │  Global CDN             │
│  Daily backups (14 days)  │    │                        │
└──────┬────────────────────┘    └──────────┬──────────────┘
       │ KQL API (build time)               │
       └───────────────┬────────────────────┘
                       ↓
              Netlify build hook
              (triggered on Panel save)
```

### DNS Setup

| Record | Target |
|---|---|
| `content.emintoyland.com` | A record → MyHost IP address |
| `emintoyland.com` | CNAME → Netlify (already configured) |

### Migration Checklist

1. **Sign up for MyHost NZ** — Small plan ($8.95/mo) is sufficient
2. **Verify PHP 8.2+** support in cPanel (required for Kirby 5)
3. **Upload Kirby code** to MyHost via FTP/SFTP:
   - `kirby/` — the CMS engine
   - `kirby/site/` — templates, plugins, config, blueprints, assets
   - Exclude `kirby/content/` (starts empty on fresh install; Panel creates it)
4. **Point DNS** — `content.emintoyland.com` → MyHost
5. **Install Kirby on MyHost**:
   - Run Kirby's web installer
   - Create admin account
   - Upload site images via Panel
6. **Update Netlify env vars**:
   - `KIRBY_API_URL` → `https://content.emintoyland.com`
   - `KIRBY_API_TOKEN` → (set in Kirby config, currently disabled)
7. **Update Kirby config** (`kirby/site/config/config.php`):
   - Set `baseUrl: https://content.emintoyland.com`
   - Enable KQL auth (`kql.auth: true`)
   - Set up deploy hook URL to trigger Netlify builds
8. **Re-deploy Eleventy** — trigger a Netlify build to verify KQL API works
9. **Switch main domain** — `emintoyland.com` already points to Netlify

### Deploying Code Changes (post-migration)

Since MyHost shared hosting doesn't include SSH, use **FTP/SFTP** (Transmit, Cyberduck, or cPanel File Manager) to upload changed files:

```bash
# Files to deploy when Kirby code changes:
kirby/site/plugins/     # Custom plugins
kirby/site/templates/   # Nunjucks templates (if using Kirby for rendering)
kirby/site/config/      # Config changes
kirby/site/blueprints/  # Panel blueprints
kirby/assets/           # Panel CSS, JS
```

Kirby code changes infrequently after setup, so FTP is manageable.

### Content Backups

- **MyHost automatic**: Daily backups stored 14 days (included in plan)
- **Manual download**: Periodically SFTP `kirby/content/` to your local machine
- **Netlify**: The built site on Netlify is static HTML — even if Kirby goes down, the frontend stays live

### Licenses

- **Kirby**: 1 license needed for `content.emintoyland.com` (the CMS domain)
- **`emintoyland.com`**: Static HTML on Netlify — no Kirby license required
- **Panel access**: `https://content.emintoyland.com/dev`

### Build Trigger

Set up a deploy hook in Netlify (`Site settings → Build & deploy → Deploy hooks`) and configure Kirby to POST to it on content changes. The hook URL is stored in Kirby config or a Panel plugin.

## Content Structure

| Page | Kirby Path | Template |
|------|-----------|----------|
| Home | `content/home/` | `pages.njk` (uri == "home") |
| About | `content/about/` | `pages.njk` (generic) |
| Work | `content/work/` | `pages.njk` (uri == "work") |
| Work Item | `content/work/[slug]/` | `pages.njk` (parentSlug == "work") |
| Blog | `content/blog/` | `pages.njk` (generic) |
| Contact | `content/contact/` | `pages.njk` (generic) |
| Privacy | `content/privacy-policy/` | `pages.njk` (generic) |

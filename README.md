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

1. Deploy Kirby to a PHP host (e.g. MyHost NZ) at `cms.emintoyland.com`
2. Deploy Eleventy to Netlify
3. Set `KIRBY_API_URL` env var in Netlify
4. Set up a Deploy Trigger in Kirby to rebuild on content changes

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

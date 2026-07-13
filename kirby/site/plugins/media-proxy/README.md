# Media Proxy Plugin

## Why

Kirby's built-in `Media::link()` generates hashed URLs (e.g. `/media/site/abc123/filename.jpg`) that resolve to the correct file when served through Kirby's full PHP stack. However, in this project Kirby is used as a **headless CMS + API** — the Eleventy static site build fetches content via KQL. The built-in `/media/` URLs consistently return 404s in this setup.

## What

This plugin registers a simple route at `/media-proxy/{filename}` that:

1. Looks up the file by UUID (if the path starts with `file-`)
2. Falls back to filename lookup on `site()->files()`
3. Falls back to searching all pages' files
4. Returns the file directly via `Response::file()`

## How

The route is registered via `App::plugin()` in `kirby/site/plugins/media-proxy/index.php`. The proxy URLs are built in `src/_data/kirby.js` by the `proxyUrl()` helper, and `rewriteMediaUrlsInHtml()` replaces embedded media URLs in rich text (blog body, etc.) before the static build.

## Media URL flow

1. Content editor uploads a file in Kirby Panel
2. `proxyUrl(filename)` in `kirby.js` builds `/media-proxy/{filename}`
3. During Eleventy build, KQL returns file references; `rewriteMediaUrlsInHtml()` rewrites any `/media/` URLs to `/media-proxy/`
4. On the live site, the URL resolves via Kirby's PHP router

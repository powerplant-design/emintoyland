# Netlify Persistent Cache for eleventy-img

## Problem

The `eleventyImageTransformPlugin` colocates remote images **per-page** — the same logo
is written to a different output directory for each page that uses it
(e.g. `_site/<hash>.webp`, `_site/about/<hash>.webp`, `_site/work/<hash>.webp`).

Different paths = different in-memory cache keys = zero cache hits = each image
sharp-processed N× (once per page).

On Netlify, `_site/` is ephemeral per build, so no disk cache carries over either.

## Fix 1 — Global output directory

**File:** `eleventy.config.js`

Add `urlPath: "/img/"` to the transform plugin options. This makes
`getOutputLocations()` return `{}`, causing all images to write to a single
global `_site/img/` directory regardless of which page references them.

- Same output path per image → same in-memory cache key → dedup within a build
- Same output path → disk cache hits across pages within a build
- `_site/img/` is a single directory suitable for Netlify persistent caching

```diff
 eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
   formats: ["avif", "webp", "png"],
   widths: [320, 640, 960, 1280, 1600, "auto"],
+  urlPath: "/img/",
   htmlOptions: {
     imgAttributes: {
       loading: "lazy",
       decoding: "async",
     },
   },
+  cacheOptions: {
+    duration: "30d",  // keep remote fetch cache valid 30 days
+  },
 });
```

## Fix 2 — Netlify persistent cache script

Netlify provides `/opt/build/cache/` which persists across builds. We can store
the generated `_site/img/` directory there and restore it before each build.

**New file:** `scripts/netlify-build.js`

```javascript
// Restores cached images from Netlify persistent storage, runs Eleventy,
// then saves back for the next build.

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const CACHE_DIR = "/opt/build/cache";
const IMG_CACHE = path.join(CACHE_DIR, "eleventy-img");
const FETCH_CACHE = path.join(CACHE_DIR, "eleventy-fetch");
const OUTPUT_IMG = "_site/img";
const FETCH_DIR = ".cache";

function restore(src, dest) {
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log(`[cache] restored ${src} → ${dest}`);
  }
}

function save(src, dest) {
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log(`[cache] saved ${src} → ${dest}`);
  }
}

// 1. Pre-populate output + fetch cache from persistent storage
restore(IMG_CACHE, OUTPUT_IMG);
restore(FETCH_CACHE, FETCH_DIR);

// 2. Run Eleventy build
execSync("npx eleventy", { stdio: "inherit" });

// 3. Save back for next build
save(OUTPUT_IMG, IMG_CACHE);
save(FETCH_DIR, FETCH_CACHE);
```

**Updated file:** `package.json` (add script)

```json
"build:netlify": "node scripts/netlify-build.js"
```

**Updated file:** `netlify.toml`

```toml
[build]
  publish = "_site"
  command = "npm run build:netlify"
```

## How it works

| Build # | State | Behaviour |
|---------|-------|-----------|
| 1 | Cold cache | Fetch all images via ngrok, sharp-process each once, save to cache |
| 2+ | Warm cache — no changes | Restore cached `_site/img/` → disk cache hits → zero sharp work. Only HTML written. |
| N+1 | Image changed in Kirby | New content hash → new filename → old cache file ignored → fresh fetch + sharp for that image only. Unchanged images still skip. |

## Image content safety

eleventy-img uses a content-based hash in output filenames
(`<hash>-<width>.<format>`). If an image changes in Kirby, the hash changes,
producing a different filename. The old cached file is simply ignored and the
new one is generated. No stale-image risk.

## Estimated effect

- **Current:** ~90s build, each image processed 8×+
- **Fix 1 alone:** ~15s build, each image processed once
- **Fix 1 + 2 (warm cache):** ~3-5s build, no sharp processing, just page HTML

# Launch Plan: Em in Toyland

## Current State

- [x] Kirby 5.4.2 CMS — locally running, content populated, blueprints configured
- [x] Eleventy 3.0 SSG — builds 14 static pages with responsive images
- [x] CUBE CSS ported — settings, compositions, utilities, blocks, transitions
- [x] Swup page transitions — initialized
- [x] Image pipeline — Kirby media → Eleventy download → responsive avif/webp/png
- [x] SEO — per-page meta titles, meta descriptions, Google Analytics
- [x] API user created — `hotline@powerplant.design` for authenticated build
- [ ] Footer component — not yet built in Eleventy
- [ ] Contact form — Netlify Forms not wired up yet (currently plain HTML)
- [ ] Locomotive Scroll — not implemented
- [ ] Instagram feed — collection defined in Kirby, no content yet, no frontend
- [ ] Blog — schema defined, no content, no listing/detail templates
- [ ] Newsletter signup — Kit/ConvertKit embed not added

---

## Phase 1: Deploy Kirby to MyHost NZ

### 1.1 — Sign up for hosting
- Plan: **Web Hosting Small** — $8.95/mo + GST ($10.30/mo)
- Code `50OFF` for 50% off first month
- Requirements: PHP 8.2+, cPanel, FTP, AutoSSL, daily backups

### 1.2 — Upload Kirby files
- Upload everything in `/kirby/` via cPanel File Manager or FTP
- The `site/accounts/`, `site/cache/`, `site/sessions/` directories should be writable
- `media/` directory should be writable for thumbs

### 1.3 — Create a dedicated subdomain
- Point `cms.emintoyland.com` at MyHost (DNS A record or cPanel subdomain)
- Enable AutoSSL in cPanel for HTTPS

### 1.4 — Production Kirby config
Create or update `kirby/site/config/config.php`:

```php
return [
    'api' => [
        'basicAuth' => true
    ],
    'kql' => [
        'auth' => true
    ]
];
```

### 1.5 — Create production API user
- Log into the Kirby Panel at `https://cms.emintoyland.com/panel`
- Create a user: `api-user` / `hotline@powerplant.design`
- Give it a **read-only role** (create a custom role if needed)
- Store the password securely for Netlify env vars

### 1.6 — Veriry KQL API
```bash
curl -X POST https://cms.emintoyland.com/api/query \
  -u "hotline@powerplant.design:YOUR_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{"query":"site","select":{"title":true}}'
```

Expected: `{"code":200,"result":{"title":"Em in Toyland"},"status":"ok"}`

### 1.7 — Kirby Panel access control
- The admin Panel is publicly accessible at `https://cms.emintoyland.com/panel`
- The login page IS the protection — Kirby requires authentication
- Optionally, add a `.htaccess` password on `/panel/` for defence in depth
- Keep Kirby updated — security patches are released monthly

---

## Phase 2: Deploy Eleventy to Netlify

### 2.1 — Push to GitHub
- Commit all files (excluding `_site/`, `.cache/`, `node_modules/`)
- Push to `main` branch
```
git push origin main
```

### 2.2 — Connect Netlify
- Sign up at [netlify.com](https://netlify.com) (free tier)
- Connect to the GitHub repo
- Build settings are already in `netlify.toml`:
  - Build command: `npx eleventy`
  - Publish directory: `_site`
  - Node version: 22

### 2.3 — Set environment variables in Netlify
```
KIRBY_API_URL = https://cms.emintoyland.com
KIRBY_USER    = hotline@powerplant.design
KIRBY_PASS    = [password from Phase 1.5]
```

### 2.4 — Trigger first build
- Netlify auto-deploys on push to `main`
- First build will fetch all content from Kirby's KQL API
- All images will be downloaded and optimized
- Build time: ~10 seconds (14 pages, ~85 responsive images)

### 2.5 — Set up Netlify Deploy Trigger in Kirby
- In Netlify: Site settings → Build & deploy → Create a Build Hook
- In Kirby Panel: install [kirby-deploy-trigger](https://github.com/johannschopplich/kirby-deploy-trigger) plugin
- Configure the hook so content changes trigger a Netlify rebuild
- Rebuild takes ~30–60 seconds for the full site

---

## Phase 3: DNS & Domain

### 3.1 — Point `emintoyland.com` at Netlify
- In Netlify: Domain settings → Add custom domain → `emintoyland.com`
- At your registrar: update DNS to point at Netlify's nameservers or add ALIAS/CNAME
- Netlify handles SSL automatically via Let's Encrypt

### 3.2 — Point `www.emintoyland.com` at Netlify
- Add `www.emintoyland.com` as a domain alias in Netlify
- Set up redirect: `www.emintoyland.com` → `emintoyland.com`

### 3.3 — Verify subdomain for Kirby
- `cms.emintoyland.com` should remain pointed at MyHost NZ
- This subdomain is NOT public-facing — only used by the Eleventy build and the admin Panel

### 3.4 — DNS Summary
```
emintoyland.com       → Netlify (public site)
www.emintoyland.com   → Netlify (redirect to apex)
cms.emintoyland.com   → MyHost NZ (Kirby CMS, not public)
```

---

## Phase 4: Pre-launch Checklist

### Content
- [ ] All pages (Home, About, Work, Contact, Privacy)
- [ ] All 7 work items have images uploaded via Kirby Panel
- [ ] Site logo uploaded via Kirby Panel
- [ ] Meta descriptions set on every page
- [ ] OG image set on key pages (if applicable)

### Features
- [ ] Navigation works on all pages
- [ ] Work filter tabs function correctly (All, Podcasts, Video, Writing, Featured In)
- [ ] Swup page transitions work between routes
- [ ] Contact form submits (wired to Netlify Forms or Formspree)
- [ ] Google Analytics fires (ID: `G-R7738E5V4S`)
- [ ] Google Fonts load (Poppins 300–900)

### Responsive
- [ ] Mobile nav (hamburger menu) works
- [ ] Work grid (3-col → 2-col → 1-col)
- [ ] Hero section scales down
- [ ] Images are responsive (picture element with srcset)
- [ ] No horizontal scroll on mobile

### Performance
- [ ] Lighthouse audit: target 90+ on all metrics
- [ ] Images in avif/webp/png with lazy loading
- [ ] CSS is minified (Eleventy handles this)
- [ ] JS bundled via esbuild
- [ ] Test on slow 3G in DevTools

### SEO
- [ ] `<title>` tags are correct per page
- [ ] `<meta name="description">` populated
- [ ] `sitemap.xml` generated (add to Eleventy, or use Netlify plugin)
- [ ] `robots.txt` exists
- [ ] Open Graph tags render correctly (Facebook/Twitter card validator)
- [ ] All internal links use relative paths, no hardcoded domains

### Security
- [ ] Kirby `config.php` has `kql.auth: true` in production
- [ ] Kirby is running latest version (run `composer update` on MyHost monthly)
- [ ] CSS/JS integrity not critical (static site, no user input)
- [ ] Netlify security headers set (X-Frame-Options, CSP) — add to `netlify.toml`

---

## Phase 5: Launch Day

### 5.1 — DNS switchover
- Update DNS records at registrar to point to Netlify
- DNS propagation: 2–48 hours (usually 15–30 mins for most ISPs)
- Both old and new sites may be visible during propagation — no downtime expected

### 5.2 — Verify after propagation
- `https://emintoyland.com` loads the new site
- `https://cms.emintoyland.com/panel` loads the Kirby admin
- SSL certificate is active on both domains
- All pages, images, links work

### 5.3 — Redirects
- If the old site was at different URLs, set up 301 redirects in `netlify.toml`:
```toml
[[redirects]]
  from = "/old-page"
  to = "/new-page"
  status = 301
```

### 5.4 — Content freeze
- Once live, any Kirby content changes require a Netlify rebuild
- The Deploy Trigger plugin handles this automatically
- Emma edits content → clicks "Deploy" → Netlify rebuilds → ~60 seconds later, live

---

## Phase 6: Post-launch

### Monitoring
- [ ] Google Search Console — verify ownership, submit sitemap
- [ ] Google Analytics — verify sessions counting
- [ ] Netlify deploy logs — monitor for build failures
- [ ] Kirby security updates — subscribe to [Kirby releases](https://github.com/getkirby/kirby/releases)

### Backups
- Kirby content is flat-file — backs up with the repo
- Netlify deploys are immutable — each deploy is a rollback point
- Consider a regular Kirby content dump to the repo as a backup

### Maintenance rhythm
- **Monthly**: Check for Kirby security updates, apply via `composer update`
- **As needed**: Content changes via Kirby Panel → Deploy Trigger → Netlify rebuild
- **Quarterly**: Review analytics, Lighthouse scores, fix any regressions

---

## Cost Summary

| Item | Cost | Frequency |
|---|---|---|
| Kirby 5 license | €99 (~NZ$178) | One-time |
| MyHost NZ (Web Hosting Small) | $10.30/mo | Monthly |
| Netlify | Free | — |
| Domain (emintoyland.com) | ~$30/yr | Yearly |
| **First year total** | **~NZ$330** | |
| **Per year after** | **~NZ$150** | |

# Em in Toyland — Webflow to Kirby CMS + Eleventy Migration Plan

**Site:** https://www.emintoyland.com
**Owner:** Emma Hewitt-Johnson, Sexologist
**Current Platform:** Webflow (template: "Starfire" by Paperunikorn)
**Target Stack:** Kirby CMS (headless) + Eleventy + Netlify + MyHost NZ
**Design/styling:** Power Plant Design (CUBE CSS, Utopia fluid scale)

---

## Architecture

```
┌─────────────────────┐     KQL API      ┌──────────────────┐     git push     ┌─────────┐
│  Kirby CMS (Panel)  │ ──────────────→  │  Eleventy build  │ ──────────────→ │ Netlify │
│  MyHost NZ ($9/mo)  │  (build time)    │  Static HTML/CSS │                 │  CDN    │
│  PHP 8.2+           │                  │  Netlify deploy   │                 │ Public  │
└─────────────────────┘                  └──────────────────┘                 └─────────┘
        ↑ Content editing                        ↑ Page transitions
        │ (Emma)                                  │ (Swup + Locomotive Scroll)
```

- **Kirby**: runs on MyHost NZ, admin-only traffic, serves KQL API
- **Eleventy**: runs on Netlify, builds static site at deploy time
- **Swup**: client-side page transitions on the static site
- **Locomotive Scroll**: smooth scroll/parallax (destroy/re-init on page change)

---

## Phase 0: Try Kirby Locally (now, no signups)

### Step 0.1 — Check PHP version
```bash
php -v
```
Kirby requires PHP 8.2+. If lower, install via Homebrew:
```bash
brew install php
```

### Step 0.2 — Download Kirby Plainkit
```bash
cd ~/Sites
curl -L https://github.com/getkirby/plainkit/archive/refs/heads/main.zip -o kirby.zip
unzip kirby.zip
mv plainkit-main emintoyland-kirby
cd emintoyland-kirby
```

### Step 0.3 — Install KQL plugin
```bash
curl -L https://github.com/getkirby/kql/archive/refs/heads/master.zip -o kql.zip
unzip kql.zip -d site/plugins/
rm kql.zip
```

### Step 0.4 — Install kirby-headless plugin (optional, for bearer token auth)
```bash
curl -L https://github.com/johannschopplich/kirby-headless/archive/refs/heads/main.zip -o headless.zip
unzip headless.zip -d site/plugins/
mv site/plugins/kirby-headless-main site/plugins/kirby-headless
rm headless.zip
```

### Step 0.5 — Start Kirby
```bash
php -S localhost:8000 kirby/router.php
```
Open `http://localhost:8000/panel`, create admin account, explore the Panel.

### Step 0.6 — Scaffold Eleventy project alongside it
```bash
cd ~/Sites
mkdir emintoyland-eleventy
cd emintoyland-eleventy
npm init -y
npm install @11ty/eleventy ofetch
```

### Step 0.7 — Create data file to fetch from Kirby
`_data/kirby.js`:
```js
import { $fetch } from "ofetch";

export default async function () {
  const api = "http://localhost:8000/api/query";

  const response = await $fetch(api, {
    method: "post",
    body: {
      query: "kirby.pages",
      select: {
        title: true,
        slug: true,
        content: "page.text.kirbytext",
      },
    },
  });

  return response.result;
}
```

### Step 0.8 — Run Eleventy
```bash
npx @11ty/eleventy --serve
```
Visit `http://localhost:8080` — your Kirby content rendered as static HTML.

---

## Phase 1: Sign Up & Set Up Hosting

### Step 1.1 — Sign up for MyHost NZ
- Plan: **Web Hosting Small** ($8.95/mo or $96/yr + GST)
- Use discount code `50OFF` for 50% off first month
- You'll get cPanel access, FTP credentials, SSL, daily backups
- Servers in Auckland, NZ

### Step 1.2 — Sign up for Netlify
- Free tier (100GB bandwidth, 300 build minutes/month)
- Connect your GitHub repo

### Step 1.3 — Deploy Kirby to MyHost
- Upload Kirby files via cPanel File Manager or FTP
- Point a subdomain (e.g. `cms.emintoyland.com`) at MyHost for the Kirby Panel
- Set up SSL via cPanel AutoSSL
- Create an API-only Kirby user for Eleventy to use

### Step 1.4 — Set environment variables
On MyHost, configure `site/config/config.php`:
```php
return [
  'api' => ['basicAuth' => true],
  'kql' => ['auth' => true],
];
```

---

## Phase 2: Build the Eleventy Site

### Step 2.1 — Project structure
```
emintoyland/
├── _data/
│   ├── kirby.js          # Fetches all content from KQL API
│   └── site.json         # Site-wide settings
├── _includes/
│   └── layouts/
│       ├── base.njk      # Root layout (html, head, meta tags, Swup, LS)
│       └── page.njk      # Content page layout
├── assets/
│   └── styles/
│       ├── settings.css  # Utopia tokens, colors, fonts (port from current)
│       ├── compositions.css
│       └── blocks/       # Component CSS (port from current)
├── pages/
│   ├── index.njk
│   ├── about.njk
│   ├── contact.njk
│   └── work.njk
├── posts/
│   ├── posts.njk         # Blog listing
│   └── [slug].njk        # Blog detail
├── eleventy.config.js
├── netlify.toml
└── package.json
```

### Step 2.2 — Port CUBE CSS from current project
- Copy `styles/settings.css` → `assets/styles/settings.css`
- Copy `styles/compositions.css` → `assets/styles/compositions.css`
- Copy `styles/blocks/` → `assets/styles/blocks/`
- All stack-agnostic, no changes needed

### Step 2.3 — Build Nunjucks templates
- `base.njk`: HTML shell, SEO meta tags, link to CSS, Swup init, Locomotive Scroll init
- `page.njk`: extends `base.njk`, content output, structured data
- Blog listing, blog detail, work grid, etc.

### Step 2.4 — Set up Swup
```bash
npm install swup
```
In `base.njk`:
```html
<main id="swup" class="transition-fade">
  {{ content | safe }}
</main>

<script type="module">
import Swup from 'swup';
const swup = new Swup({ containers: ['#swup'] });
</script>
```

### Step 2.5 — Set up Locomotive Scroll v5 (Lenis-based)
```bash
npm install locomotive-scroll
```
```html
<div data-scroll-container>
  <main id="swup" class="transition-fade">
    {{ content | safe }}
  </main>
</div>

<script type="module">
import Swup from 'swup';
import LocomotiveScroll from 'locomotive-scroll';

let scroll;

function initScroll() {
  scroll = new LocomotiveScroll({
    lenisOptions: {
      wrapper: window,
      content: document.querySelector('[data-scroll-container]')
    }
  });
}

initScroll();

const swup = new Swup({ containers: ['#swup'] });

swup.hooks.on('content:replace', () => scroll.destroy());
swup.hooks.on('page:view', () => initScroll());
</script>
```

---

## Phase 3: Content Migration

### Step 3.1 — Set up Kirby content structure
```
content/
├── site.txt              # Site settings (title, description, social links)
├── home/
│   └── home.txt          # Home page content
├── about/
│   └── about.txt         # About page
├── contact/
│   └── contact.txt       # Contact page
├── work/
│   ├── work.txt          # Work listing page
│   └── work-item-1/
│       └── work-item.txt # Individual work entry
├── blog/
│   ├── blog.txt          # Blog listing page
│   └── post-title/
│       └── post.txt      # Blog post
└── categories/
    ├── categories.txt
    ├── featured-in/
    │   └── category.txt
    ├── podcast/
    │   └── category.txt
    ├── video/
    │   └── category.txt
    └── writing/
        └── category.txt
```

### Step 3.2 — Define Kirby blueprints
Create `site/blueprints/pages/` with blueprints for:
- `home.yml`
- `about.yml`
- `contact.yml`
- `work.yml` (with work items as subpages or structure field)
- `post.yml` (blog post)
- `category.yml`

### Step 3.3 — Migrate content from extracted MDX
- 40 Webflow images already in `public/images/`
- Content already extracted in `content/` folder
- Transform MDX frontmatter to Kirby YAML + KirbyText format

---

## Phase 4: Features & Integrations

### Step 4.1 — SEO fields
- Add minimal SEO fields (meta title, description, OG image) to Kirby blueprints
- Render them in Eleventy's `base.njk` layout
- Plugin option: `benjaminhaeberli/kirby-seo` (MIT, simple)

### Step 4.2 — Contact form
Options to decide:
- **Netlify Forms**: free, no backend needed, triggers email notification
- **Formspree**: free tier (50 submissions/mo), simple embed
- **Resend**: custom API route, more control

### Step 4.3 — Newsletter (Kit / ConvertKit)
- Kit account already exists
- Embed signup form in Eleventy template
- Style to match CUBE CSS system

### Step 4.4 — Instagram feed
- Instagram Basic Display API
- Fetch at Eleventy build time, or maintain as Kirby content collection
- Display grid on home page

### Step 4.5 — Google Analytics
- Keep existing ID: G-R7738E5V4S
- Add GA snippet to `base.njk`

---

## Phase 5: Deployment

### Step 5.1 — Netlify configuration
`netlify.toml`:
```toml
[build]
  publish = "_site"
  command = "eleventy"

[build.processing]
  skip_processing = false
```

Environment variables in Netlify:
- `KIRBY_API_URL` = `https://cms.emintoyland.com/api/query`
- `KIRBY_USER` = (API user)
- `KIRBY_PASS` = (API password)

`_data/kirby.js` uses these env vars to authenticate.

### Step 5.2 — Content update workflow
- Emma edits content in the Kirby Panel
- Panel has a "Deploy" button (via `johannschopplich/kirby-deploy-trigger`)
- Button hits Netlify build hook → site rebuilds with fresh content
- Full rebuild takes ~30-60 seconds

### Step 5.3 — DNS
- `emintoyland.com` → Netlify (public site)
- `cms.emintoyland.com` → MyHost NZ (Kirby Panel, password-protected)

---

## Phase 6: Testing & Launch

- [ ] Test all pages render correctly from Kirby content
- [ ] Test Swup transitions between all page types
- [ ] Test Locomotive Scroll on desktop + mobile
- [ ] Test contact form submission
- [ ] Test newsletter signup
- [ ] Test Instagram feed
- [ ] Mobile responsiveness
- [ ] Lighthouse audit
- [ ] Verify all current URLs preserved or 301 redirected
- [ ] Check Open Graph tags render correctly
- [ ] Generate sitemap.xml
- [ ] Point DNS, monitor for 404s
- [ ] Keep Webflow site live for 30 days as fallback

---

## Cost Summary

| Item | Cost | Frequency |
|---|---|---|
| Kirby Basic license | €99 (~NZ$178) | Once (3 years updates) |
| MyHost NZ Web Hosting Small | $8.95/mo + GST (~$10.30) | Monthly |
| Netlify | Free | — |
| Domain (emintoyland.com) | ~$30/yr | Yearly |
| **First year total** | **~NZ$330** | |
| **Per year after** | **~NZ$150** | (hosting + domain) |

---

## Comparison: Old Plan vs New Plan

| | Old (Next.js + TinaCMS) | New (Kirby + Eleventy) |
|---|---|---|
| CMS cost | Free (self-host) / $0-20/mo (TinaCloud) | €99 one-time |
| Hosting | Vercel $20/mo | Netlify free + MyHost $9/mo |
| Database | Redis/Mongo/Postgres | None (flat-file) |
| Page transitions | Broken (Next.js App Router) | Swup works natively |
| Visual editing | In-context click-to-edit | Kirby Panel |
| Content backup | Git-based MDX | Git-based flat files |
| Editor experience | Next.js dev server needed | Pure Panel UI |
| Build speed | Incremental (ISR) | Full rebuild (30-60s) |

---

## Links & Resources

- [Kirby CMS](https://getkirby.com)
- [Eleventykit starter](https://github.com/getkirby/eleventykit)
- [KQL plugin](https://github.com/getkirby/kql)
- [Kirby Headless plugin](https://github.com/johannschopplich/kirby-headless)
- [Eleventy](https://11ty.dev)
- [Swup](https://swup.js.org)
- [Locomotive Scroll v5](https://scroll.locomotive.ca)
- [MyHost NZ](https://myhost.nz/hosting/web-hosting)
- [Netlify](https://netlify.com)

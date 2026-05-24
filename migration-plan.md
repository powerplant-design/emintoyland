# Em in Toyland — Webflow to Self-Hosted CMS Migration Plan

**Site:** https://www.emintoyland.com  
**Owner:** Emma Hewitt-Johnson, Sexologist  
**Scraped:** 2026-05-24  
**Current Platform:** Webflow (hosted, template: "Starfire" by Paperunikorn)  
**Design/styling:** Power Plant Design

---

## 1. Current Site Inventory

### 1.1 Pages

| Path | Type | Notes |
|---|---|---|
| `/` | Home | Hero, features, newsletter signup |
| `/about` | Static | About Emma, bio, headshot |
| `/work` | CMS List | Portfolio of work examples |
| `/contact-me` | Form | Contact form (name, email, message) |
| `/pricing` | Static + Commerce | Premium subscription upsell (hidden from nav) |
| `/privacy-policy` | Static | Privacy policy |
| `/blog-categories/*` | CMS Archive | 4 categories: featured-in, podcast, video, writing |
| `/blog-posts/*` | CMS Detail | 7 public blog posts |
| `/product/premium` | Commerce | Single product: Premium subscription $6.99 USD/month |
| `/checkout` | Commerce | Webflow Commerce checkout |
| `/order-confirmation` | Commerce | Order confirmation |
| `/paypal-checkout` | Commerce | PayPal redirect |
| ~~/sign-up~~ | Memberships | ~~REMOVED — not required~~ |
| ~~/log-in~~ | Memberships | ~~REMOVED — not required~~ |
| ~~/reset-password~~ | Memberships | ~~REMOVED — not required~~ |
| ~~/update-password~~ | Memberships | ~~REMOVED — not required~~ |
| ~~/user-account~~ | Memberships | ~~REMOVED — not required~~ |
| ~~/access-denied~~ | Memberships | ~~REMOVED — not required~~ |
| `/admin/styleguide` | Template | Boilerplate (not used) |
| `/admin/licences` | Template | Boilerplate (not used) |
| `/admin/changelog` | Template | Boilerplate (not used) |

### 1.2 CMS Collections

| Collection | Items | Fields |
|---|---|---|
| **Blog Posts** | 7 | title (text), slug (text), content (rich text), category (reference → Blog Categories), featured image (image), publish date (date) |
| **Blog Categories** | 4 | name (text), slug (text), description (text) |
| ~~Premium Posts~~ | ~~6~~ | ~~REMOVED — not required~~ |
| ~~Premium Categories~~ | ~~3~~ | ~~REMOVED — not required~~ |
| **Work/Portfolio** | ~5-8 | title (text), description (text), link (URL), image (image), type (text) |
| **Instagram Feed** | ~4+ | image (image), instagram-link (URL) |

### 1.3 Features & Integrations

| Feature | Details |
|---|---|
| **Commerce** | 1 product (Premium subscription), $6.99 USD/month, Apple Pay, Google Pay, Stripe |
| ~~Memberships~~ | ~~REMOVED — not required~~ |
| **Contact Form** | Webflow native form → email notification |
| **Google Analytics** | G-R7738E5V4S |
| **Google Fonts** | Poppins (300, 400, 500, 600, 700, 800, 900) |
| **Instagram Feed** | Embedded CMS collection linking to Instagram posts |
| **Newsletter** | Not a dedicated service — likely Webflow form → email |
| **Favicon** | Custom EIT favicon + apple touch icon |
| **Open Graph** | Per-page OG title, description, image |
| **Canonical URLs** | Set per page |
| **Google Site Verification** | jUpAoXKsKzQuMwiRCkezi6GwnDC8vz3ARjc9iA-QZO4 |
| **Responsive Design** | Mobile + desktop layouts, hamburger menu on mobile |

---

## 2. CMS Data Model (TinaCMS / Alternative)

### Collection: `pages` — Static site pages

```typescript
{
  title: string        // Page title / H1
  slug: string         // URL slug (unique)
  metaDescription: string  // SEO meta description
  ogImage?: image      // Open Graph image
  body: rich-text      // Page content (MDX)
  sections: object[]   // Optional: flexible page builder blocks
  // Blocks:
  // - hero { heading, subtext, cta_text, cta_link, background_image }
  // - text_section { heading, body, image }
  // - cta_section { heading, subtext, button_text, button_link }
}
```

### Collection: `blogPosts` — Public blog articles

```typescript
{
  title: string
  slug: string
  category: reference → blogCategories
  excerpt: string
  body: rich-text (MDX)
  featuredImage: image
  publishedDate: datetime
  featured: boolean       // Optional: pin to top
}
```

### Collection: `blogCategories` — Blog categories

```typescript
{
  title: string
  slug: string
  description?: text
}
```

### Collection: ~~premiumPosts — REMOVED (not required)~~
### Collection: ~~premiumCategories — REMOVED (not required)~~

### Collection: `workItems` — Portfolio/Work examples

```typescript
{
  title: string
  slug: string
  description: text
  link: string       // External URL
  image: image
  workType: string   // e.g. "Podcast", "Video", "Writing", "Featured In"
  publishedDate: datetime
}
```

### Collection: `settings` — Site-wide config (singleton)

```typescript
{
  siteTitle: string
  siteDescription: string
  logo: image
  footerText: string
  socialLinks: {
    instagram: string
    // others as needed
  }
  googleAnalyticsId: string
}
```

### Collection: `instagramFeed` — Instagram embed images

```typescript
{
  image: image
  instagramUrl: string
  publishedDate: datetime
}
```

---

## 3. TinaCMS Tech Stack

TinaCMS is built on the following technologies:

| Layer | Technology |
|---|---|
| **Admin UI** | React 18/19 |
| **CLI / Tooling** | Node.js, `@tinacms/cli` (Vite-powered dev server) |
| **Content Format** | Markdown, MDX, or JSON — stored in Git |
| **GraphQL API** | Apollo/Express-based GraphQL server (auto-generated from schema) |
| **Schema** | TypeScript (`tina/config.ts`) — auto-generates types + GraphQL schema |
| **Database (self-hosted)** | MongoDB or Redis (for the Data Layer / content index) |
| **Database (TinaCloud)** | Managed by Tina Inc. |
| **Frontend Integration** | Next.js (first-class), Astro (experimental), any React framework |
| **Visual Editing** | `useTina` React hook provides live preview + click-to-edit |
| **Auth (TinaCloud)** | OAuth (GitHub, Google) — free tier supports 1 editor |
| **Auth (self-hosted)** | Custom — you build it (NextAuth, Auth0, etc.) |
| **Media (TinaCloud)** | Managed CDN, Git-backed media manager |
| **Media (self-hosted)** | External (S3, Cloudinary) — no built-in media manager |
| **License** | Apache 2.0 (open source) |
| **Repository** | https://github.com/tinacms/tinacms |

**Note on the free tier:** TinaCloud free tier supports 1 editor with visual editing, Git-backed content, and the managed GraphQL backend. For a site this size (static pages + blog), the free tier is perfectly adequate — you just connect your GitHub repo, add environment variables, and Emma edits content visually on the live site. No self-hosting of the backend needed.

---

## 4. Recommended Tech Stack Options

### Option A: **TinaCMS + Next.js** (recommended)

| Layer | Technology |
|---|---|
| CMS | TinaCMS + TinaCloud free tier (open-source, Git-backed, visual editing) |
| Frontend Framework | Next.js 14+ (React, SSR/SSG/ISR) |
| Hosting | Vercel / Netlify / self-hosted (Docker) |
| Database (self-hosted Tina) | SQLite (local dev), MongoDB or Redis (production) |
| Auth | Not needed (public site, no memberships) |
| Commerce / Payments | Stripe (replace Webflow Commerce) |
| Media Storage | Cloudinary / AWS S3 / TinaCloud Media |
| Forms | React Hook Form + API route + email (Resend/SendGrid) |
| Analytics | Google Analytics (keep existing) |
| Fonts | Google Fonts via next/font |
| Git | GitHub/GitLab (TinaCMS commits content as MDX) |

**Pros:**
- Visual in-context editing (click-to-edit on the page)
- Content stored as MDX in Git (version-controlled, portable)
- Great developer experience with Next.js
- Incremental Static Regeneration (ISR) for fast builds
- No vendor lock-in on hosting

**Cons:**
- Self-hosting the Tina backend requires deploying a GraphQL daemon + database
- TinaCloud (managed) is simpler but SaaS dependency
- Self-hosted Tina lacks built-in media manager, search API, runtime branch switching
- Steeper setup than alternatives

### Option B: **Payload CMS + Next.js** (recommended alternative)

| Layer | Technology |
|---|---|
| CMS | Payload CMS (open-source, self-hosted, REST/GraphQL) |
| Frontend Framework | Next.js 14+ (or any frontend) |
| Hosting | Vercel / Railway / Fly.io / self-hosted |
| Database | PostgreSQL (Neon, Supabase, Railway) |
| Auth | Built-in Payload auth + collections |
| Commerce / Payments | Stripe plugin for Payload / custom |
| Memberships | Payload auth with role-based access control |
| Media | Built-in media upload + integration with S3/Cloudinary |
| Forms | Payload forms plugin or custom |
| Admin UI | Built-in admin panel (React) |

**Pros:**
- Closest 1:1 mapping to Webflow CMS (collections, references, rich text)
- TypeScript end-to-end, auto-generated types
- Built-in auth, role-based access, draft/publish workflows
- No SaaS dependency — fully self-hosted
- Postgres-backed (familiar, scalable)
- Admin panel included for editors
- Active community, MIT license

**Cons:**
- No visual in-context editing (form-based admin panel)
- Requires Postgres database to manage
- More infrastructure than TinaCMS local mode

### Option C: **Sanity CMS + Next.js**

| Layer | Technology |
|---|---|
| CMS | Sanity (hosted SaaS, free tier) |
| Frontend Framework | Next.js 14+ |
| Hosting | Vercel / Netlify |
| Media | Built-in Sanity CDN |
| Auth / Memberships | Custom (NextAuth + Stripe) |
| Forms | Custom React forms |

**Pros:**
- Polished hosted Studio UI for editors
- Industry-leading rich text (Portable Text)
- Real-time collaboration
- Generous free tier

**Cons:**
- SaaS dependency — data stored on Sanity's servers
- No visual in-context editing (form-based Studio)
- Export/migration can be painful at scale
- More expensive at higher tiers

---

## 5. Migration Plan — Phase by Phase

### Phase 1: Foundation (Week 1-2)

- [ ] Set up Next.js project with TypeScript
- [ ] Configure chosen CMS (Tina / Payload / Sanity)
- [ ] Define all content collections/schemas (see Section 2)
- [ ] Set up Git repository (GitHub)
- [ ] Set up hosting environment (Vercel + Supabase/Neon for Payload, or Vercel + Redis for Tina self-hosted)
- [ ] Configure domain DNS (prepare for cutover)
- [ ] Set up staging environment for testing

### Phase 2: Design & Components (Week 2-3)

- [ ] Set up TinaCMS with Next.js (use the official Tina starter)
- [ ] Configure `tina/config.ts` with collections from Section 2
- [ ] Connect to GitHub repo + TinaCloud free tier
- [ ] Audit current design (colors, typography, spacing, layout)
- [ ] Extract current CSS/styling from Webflow (Poppins font, pink/purple color scheme, toy illustrations)
- [ ] Rebuild global components in React/Next.js:
  - Navbar (responsive, hamburger menu on mobile)
  - Footer (with toy illustrations, link grid, credit text)
  - Layout wrappers
  - Button variants
- [ ] Rebuild page templates:
  - Home page layout
  - Blog listing + detail pages
  - Work/portfolio grid
  - Contact page
  - About page
  - Pricing/subscription page

### Phase 3: Content Migration (Week 3-4)

**Note:** These collections are removed: Premium Posts, Premium Categories, Memberships (sign-up, log-in, user account). Don't migrate them.

- [ ] Export all Webflow CMS data via Webflow API or CSV export
- [ ] Write migration script to transform Webflow data into target CMS format
- [ ] Download all images from Webflow CDN (cdn.prod.website-files.com)
- [ ] Upload media to new storage (S3 / Cloudinary / Payload media)
- [ ] Import content with correct field mapping
- [ ] Set up redirect map for any URL changes
- [ ] Migrate 7 public blog posts + all categories
- [ ] Migrate work/portfolio items (5-8 entries)
- [ ] Migrate Instagram feed images (fetch via Instagram API or manual)
- [ ] Migrate privacy policy page content

### Phase 4: Commerce — if keeping the Premium product (Week 4-5)

**Commerce replacement (Webflow Commerce → Stripe) — if needed:**
- [ ] Create Stripe account and configure products
- [ ] Set up Premium subscription product at $6.99 USD/month
- [ ] Build product page with Stripe checkout integration
- [ ] Implement webhook handling for subscription events
- [ ] Build cart UI (if keeping — current site uses single product, may not need full cart)

### Phase 5: Features & Integrations (Week 5)

- [ ] Rebuild contact form with server-side submission + email notification (Resend / SendGrid)
- [ ] Rebuild newsletter signup (convertKit / Mailchimp / direct API)
- [ ] Set up Google Analytics (same ID G-R7738E5V4S for continuity)
- [ ] Add Open Graph meta tags per page (same existing OG data)
- [ ] Add canonical URLs (preserve existing)
- [ ] Add 301 redirects for changed URLs
- [ ] Generate new sitemap.xml
- [ ] Add Google Search Console verification

### Phase 6: Testing & SEO (Week 5-6)

- [ ] Test all pages on staging
- [ ] Verify all content renders correctly
- [ ] Test Stripe subscription flow (if keeping commerce)
- [ ] Test contact form submission
- [ ] SEO audit:
  - Meta titles and descriptions match current
  - OG images preserved
  - Canonical URLs correct
  - Sitemap valid
  - No broken links
- [ ] Mobile responsiveness testing
- [ ] Lighthouse performance audit
- [ ] Set up preview/staging branch for client review

### Phase 7: Launch (Week 6)

- [ ] Final content sync (any changes since extraction)
- [ ] Point DNS to new hosting
- [ ] Monitor analytics for traffic drop or 404s
- [ ] Keep Webflow site live for 30 days as fallback
- [ ] Post-launch SEO monitoring
- [ ] Client training on new CMS

---

## 6. SEO Preservation Checklist

| Item | Status |
|---|---|
| Preserve all current URL slugs | Critical |
| 301 redirect map for any URL changes | Required |
| Meta descriptions per page | Migrate from Webflow |
| OG title/description/image per page | Migrate from Webflow |
| Canonical tags | Rebuild in new setup |
| Sitemap.xml | Generate new version |
| Google Analytics same ID | G-R7738E5V4S |
| Google Search Console verification | Re-verify new domain property |

---

## 7. Cost Estimate

| Item | TinaCMS (self-hosted) | Payload CMS | Sanity |
|---|---|---|---|
| **CMS License** | Free (Apache 2.0) | Free (MIT) | Free tier → $15/mo+ |
| **Hosting** | Vercel Hobby $20/mo | Vercel Hobby $20/mo | Vercel Hobby $20/mo |
| **Database** | Redis/Vercel KV $0-20/mo | Neon Postgres free tier | N/A (Sanity hosted) |
| **Media Storage** | Cloudinary free tier | S3/Cloudinary $0-5/mo | Built-in (free tier) |
| **Email (forms)** | Resend free tier | Resend free tier | Resend free tier |
| **Auth** | Auth.js free | Built-in (free) | Auth.js free |
| **Stripe** | 2.9% + $0.30/trans | 2.9% + $0.30/trans | 2.9% + $0.30/trans |
| **Total/mo (est.)** | **$20-45/mo** | **$20-25/mo** | **$35-55/mo** |

---

## 8. Final Recommendation

**TinaCMS + Next.js with TinaCloud free tier** is the right choice for this project.

Since you don't need memberships or premium gated content, the scope simplifies to:
- Static pages (Home, About, Contact, Privacy)
- Blog with categories (7 posts, 4 categories)
- Work/portfolio portfolio grid
- Optional: single product page ($6.99 subscription)

The TinaCloud free tier handles 1 editor (Emma) perfectly — no need to self-host the backend. She edits content visually on the live site. Content is stored as MDX in your GitHub repo. The only infrastructure is Next.js on Vercel ($20/mo) plus Stripe if you keep the commerce piece.

### What to drop from migration scope
- Premium posts & premium categories (remove from CMS schema)
- User sign-up, login, password reset, account pages (remove from build)
- Gated content logic (no longer needed)

import { $fetch } from "ofetch";

const kirbyBase = process.env.KIRBY_API_URL || "http://localhost:8000";
const api = `${kirbyBase}/api/query`;

// Rewrite localhost URLs to KIRBY_API_URL so Netlify build can fetch images
function rewriteUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (url.startsWith("http://localhost:8000")) {
    return url.replace("http://localhost:8000", kirbyBase);
  }
  return url;
}

// Build a media-proxy URL from a filename — bypasses Kirby's broken media hashing
// Uses our custom /media-proxy/{filename} plugin route
function proxyUrl(filename) {
  if (!filename) return filename;
  return `${kirbyBase}/media-proxy/${filename}`;
}

// Rewrite media URLs embedded in HTML (e.g., from KirbyText body content)
// Converts http://localhost:8000/media/{type}/{path}/{hash-version}/{filename}
// to {kirbyBase}/media-proxy/{filename}
function rewriteMediaUrlsInHtml(html) {
  if (!html || typeof html !== "string") return html;
  return html.replace(
    /https?:\/\/[^/]+\/media\/[^"'\s]+\/([^"'\s/]+\.\w+)/g,
    (match, filename) => proxyUrl(filename)
  );
}

const auth = process.env.KIRBY_USER && process.env.KIRBY_PASS
  ? { headers: { Authorization: "Basic " + btoa(`${process.env.KIRBY_USER}:${process.env.KIRBY_PASS}`) } }
  : {};

async function query(body) {
  const res = await $fetch(api, { method: "post", body, ...auth });
  return res.result;
}

function cleanFieldValue(fieldValue) {
  if (!fieldValue) return fieldValue;
  let val = fieldValue.trim();
  if (val.startsWith("- ")) val = val.slice(2).trim();
  return val;
}

async function resolveFileWithMeta(pageQuery, fieldValue, defaultAlt) {
  if (!fieldValue) return { url: fieldValue, alt: "" };
  const val = cleanFieldValue(fieldValue);
  if (!val) return { url: fieldValue, alt: "" };
  const filename = val.split("/").pop();
  const isUuid = val.startsWith("file://");
  try {
    const files = await query({
      query: `${pageQuery}.files`,
      select: { url: true, filename: true, uuid: true, alt: true },
    });
    const match = files.find((f) => {
      if (isUuid) return f.uuid === val;
      return f.filename === filename;
    });
    return {
      url: match ? proxyUrl(match.filename) : rewriteUrl(fieldValue),
      alt: match?.alt || defaultAlt || "",
    };
  } catch {
    return { url: rewriteUrl(fieldValue), alt: defaultAlt || "" };
  }
}

async function resolveUrl(pageQuery, fieldValue) {
  if (!fieldValue) return fieldValue;
  const val = cleanFieldValue(fieldValue);
  if (!val) return fieldValue;
  const filename = val.split("/").pop();
  const isUuid = val.startsWith("file://");
  try {
    const files = await query({
      query: `${pageQuery}.files`,
      select: { url: true, filename: true, uuid: true },
    });
    const match = files.find((f) => {
      if (isUuid) return f.uuid === val;
      return f.filename === filename;
    });
    return match ? proxyUrl(match.filename) : rewriteUrl(fieldValue);
  } catch {
    return rewriteUrl(fieldValue);
  }
}

function parseStructure(str) {
  if (typeof str !== "string") return str;
  const items = [];
  let current = null;
  let pendingKey = null;
  let pendingLines = [];
  let pendingListKey = null;

  for (const line of str.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const indent = line.length - line.trimStart().length;

    if ((trimmed === "-" || trimmed.startsWith("- ")) && indent === 0) {
      if (pendingKey && current) {
        current[pendingKey] = pendingLines.join(" ").replace(/\s+/g, " ").trim();
        pendingKey = null; pendingLines = [];
      }
      if (pendingListKey && current) {
        current[pendingListKey] = "";
        pendingListKey = null;
      }
      if (current && Object.keys(current).length) items.push(current);
      current = {};
      continue;
    }

    if (!current) continue;

    // Handle pending list value (e.g. "- file://xxx" under a key with empty value)
    if (pendingListKey) {
      if (trimmed.startsWith("- ")) {
        current[pendingListKey] = trimmed.slice(2).trim();
        pendingListKey = null;
        continue;
      }
      // Next line doesn't start with "- " — clear pending and fall through
      current[pendingListKey] = "";
      pendingListKey = null;
    }

    const colonIdx = trimmed.indexOf(":");

    if (colonIdx === -1) {
      if (pendingKey) {
        pendingLines.push(trimmed);
      }
      continue;
    }

    if (pendingKey) {
      current[pendingKey] = pendingLines.join(" ").replace(/\s+/g, " ").trim();
      pendingKey = null; pendingLines = [];
    }

    const key = trimmed.slice(0, colonIdx).trim().toLowerCase();
    const value = trimmed.slice(colonIdx + 1).trim();

    if (value === ">" || value === "|") {
      pendingKey = key;
      pendingLines = [];
    } else if (value === "") {
      pendingListKey = key;
    } else {
      current[key] = value;
    }
  }

  if (pendingKey && current) {
    current[pendingKey] = pendingLines.join(" ").replace(/\s+/g, " ").trim();
  }
  if (pendingListKey && current) {
    current[pendingListKey] = "";
  }
  if (current && Object.keys(current).length) items.push(current);

  return items;
}

export default async function () {
  const [settings, pages, rawWorkItems, rawBlogPosts] = await Promise.all([
    query({
      query: "site",
      select: {
        title: true,
        siteDescription: true,
        seoSiteName: true,
        logo: true,
        nav: true,
        seoDefaultImage: true,
        footerText: true,
        googleAnalyticsId: true,
        newsletterHeading: true,
        newsletterText: true,
        newsletterImage: true,
      },
    }),
    query({
      query: "site.children",
      select: {
        title: true, slug: true, uri: true,
        metaDescription: true, text: true, heading: true,
        splashHeading: true, heroHeading: true, heroText: true, heroImage: true,
        heroCtaText: true, heroCtaLink: true,
        showcaseHeading: true, showcaseItems: true,
        showcaseCtaText: true, showcaseCtaLink: true,
        aboutHeading: true, aboutText: true, aboutImage: true,
        aboutCtaText: true, aboutCtaLink: true,
        aboutPodcastCtaText: true, aboutPodcastCtaLink: true,
        seoTitle: true, seoDescription: true,
        seoOgTitle: true, seoOgDescription: true, seoOgImage: true,
        seoRobots: true, seoSchema: true,
        aboutIntroHeading: true, aboutIntroText: true, aboutIntroImage: true,
        aboutCredentialsHeading: true, aboutCredentialsItems: true,
        aboutSupervisionHeading: true, aboutSupervisionItems: true,
        aboutSpecialiseHeading: true, aboutSpecialiseItems: true,
        aboutPodcastHeading: true, aboutPodcastText: true, aboutPodcastImage: true,
        aboutPodcastCtaText: true, aboutPodcastCtaLink: true,
        contactHeading: true, contactText: true,
        thanksHeading: true, thanksCtaText: true,
        servicesIntroHeading: true, servicesIntroText: true, servicesIntroImage: true,
        servicesIntroCtaText: true, servicesIntroCtaLink: true,
        servicesWritingHeading: true, servicesWritingText: true,
        servicesWritingRates: true, servicesWritingRatesNote: true,
        servicesExpertHeading: true, servicesExpertText: true,
        servicesExpertCta: true, servicesExpertPodcastImage: true,
        servicesPodcastHeading: true, servicesPodcastText: true,
        servicesPodcastCtaText: true, servicesPodcastCtaLink: true,
      },
    }),
    query({
      query: "page(\"work\").children",
      select: {
        title: true, slug: true, uri: true, uuid: true,
        workType: true, workLink: true, workLinkLabel: true,
        workImage: true, workHeroImage: true,
        publishedDate: true, text: true,
        body: true, modified: true,
        seoTitle: true, seoDescription: true,
        seoOgTitle: true, seoOgDescription: true, seoOgImage: true,
        seoRobots: true, seoSchema: true,
      },
    }),
    query({
      query: "page(\"blog\").children",
      select: {
        title: true, slug: true, uri: true, uuid: true,
        excerpt: true, featuredImage: true,
        publishedDate: true, tags: true, modified: true,
        body: "page.body.kirbytext",
        seoTitle: true, seoDescription: true,
        seoOgTitle: true, seoOgDescription: true, seoOgImage: true,
        seoRobots: true, seoSchema: true,
      },
    }),
  ]);

  // Resolve site logo with alt text
  const logo = await resolveFileWithMeta("site", settings.logo, "Em in Toyland");
  const seoDefaultImage = await resolveFileWithMeta("site", settings.seoDefaultImage, "Em in Toyland");
  const newsletterImage = await resolveFileWithMeta("site", settings.newsletterImage, settings.newsletterHeading || "Newsletter");

  // Resolve blog post images and pre-process tags
  const blogPosts = await Promise.all(
    rawBlogPosts.map(async (item) => {
      const [featuredImage, seoOgImage] = await Promise.all([
        resolveFileWithMeta(`page("blog/${item.slug}")`, item.featuredImage, item.title),
        resolveFileWithMeta(`page("blog/${item.slug}")`, item.seoOgImage, item.title),
      ]);
      const tagList = (item.tags || "").split(",").map(t => t.trim()).filter(Boolean);
      const tagSlugs = tagList.map(t => t.toLowerCase().replace(/\s+/g, "-"));
      return {
        ...item,
        featuredImage: featuredImage.url, featuredImageAlt: featuredImage.alt,
        seoOgImage: seoOgImage.url,
        body: rewriteMediaUrlsInHtml(item.body),
        tagsSlug: tagSlugs.join(" "),
        tagArray: tagList,
      };
    })
  );

  // Resolve work item images with alt text
  const workItems = await Promise.all(
    rawWorkItems.map(async (item) => {
      const [workImage, workHeroImage, seoOgImage] = await Promise.all([
        resolveFileWithMeta(`page("work/${item.slug}")`, item.workImage, item.title),
        resolveFileWithMeta(`page("work/${item.slug}")`, item.workHeroImage, item.title),
        resolveFileWithMeta(`page("work/${item.slug}")`, item.seoOgImage, item.title),
      ]);
      const fallbackImage = workImage.url || workHeroImage.url;
      return {
        ...item,
        workImage: fallbackImage, workImageAlt: workImage.alt || workHeroImage.alt,
        workHeroImage: workHeroImage.url,
        seoOgImage: seoOgImage.url,
      };
    })
  );

  // Resolve page images with alt text
  const resolvedPages = await Promise.all(
    pages.map(async (p) => {
      const updates = {};
      if (p.heroImage) {
        const heroImage = await resolveFileWithMeta(`page("${p.uri}")`, p.heroImage, p.title);
        updates.heroImage = heroImage.url;
        updates.heroImageAlt = heroImage.alt;
      }
      if (p.aboutImage) {
        const aboutImage = await resolveFileWithMeta(`page("${p.uri}")`, p.aboutImage, p.aboutHeading || p.title);
        updates.aboutImage = aboutImage.url;
        updates.aboutImageAlt = aboutImage.alt;
      }
      if (p.aboutIntroImage) {
        const img = await resolveFileWithMeta(`page("${p.uri}")`, p.aboutIntroImage, p.aboutIntroHeading || p.title);
        updates.aboutIntroImage = img.url;
      }
      if (p.servicesIntroImage) {
        const img = await resolveFileWithMeta(`page("${p.uri}")`, p.servicesIntroImage, p.servicesIntroHeading || p.title);
        updates.servicesIntroImage = img.url;
      }
      if (p.servicesExpertPodcastImage) {
        const img = await resolveFileWithMeta(`page("${p.uri}")`, p.servicesExpertPodcastImage, p.servicesExpertPodcastImage || p.title);
        updates.servicesExpertPodcastImage = img.url;
      }
      if (p.aboutPodcastImage) {
        const img = await resolveFileWithMeta(`page("${p.uri}")`, p.aboutPodcastImage, p.aboutPodcastHeading || p.title);
        updates.aboutPodcastImage = img.url;
        updates.aboutPodcastImageAlt = img.alt;
      }
      if (p.aboutCredentialsItems) {
        const items = typeof p.aboutCredentialsItems === "string"
          ? parseStructure(p.aboutCredentialsItems)
          : p.aboutCredentialsItems;
        if (Array.isArray(items)) {
          updates.aboutCredentialsItems = await Promise.all(items.map(async (item) => ({
            ...item,
            logo: item.logo ? await resolveFileWithMeta('page("about")', item.logo, item.heading || "Credential logo") : null,
          })));
        }
      }
      if (p.aboutSupervisionItems) {
        const items = typeof p.aboutSupervisionItems === "string"
          ? parseStructure(p.aboutSupervisionItems)
          : p.aboutSupervisionItems;
        if (Array.isArray(items)) {
          updates.aboutSupervisionItems = items;
        }
      }
      if (p.aboutSpecialiseItems) {
        const items = typeof p.aboutSpecialiseItems === "string"
          ? parseStructure(p.aboutSpecialiseItems)
          : p.aboutSpecialiseItems;
        updates.aboutSpecialiseItems = Array.isArray(items) ? items.map(i => i.item).filter(Boolean) : [];
      }
      if (p.servicesWritingRates) {
        const items = typeof p.servicesWritingRates === "string"
          ? parseStructure(p.servicesWritingRates)
          : p.servicesWritingRates;
        if (Array.isArray(items)) {
          updates.servicesWritingRates = items;
        }
      }
      if (p.seoOgImage) {
        const ogImage = await resolveFileWithMeta(`page("${p.uri}")`, p.seoOgImage, p.title);
        updates.seoOgImage = ogImage.url;
      }
      if (p.showcaseItems) {
        const raw = typeof p.showcaseItems === "string" ? p.showcaseItems : "";
        const uuids = raw.split("\n")
          .map(line => line.trim())
          .filter(line => line.startsWith("-"))
          .map(line => line.slice(2).trim());
        if (uuids.length) {
          updates.showcaseCards = uuids
            .map(id => workItems.find(w => w.uuid && id.includes(w.uuid)))
            .filter(Boolean)
            .map(item => ({ ...item, link: `/${item.uri}/` }));
        }
      }
      return Object.keys(updates).length ? { ...p, ...updates } : p;
    })
  );

  // Resolve site-level images (decorative) with alt text
  const siteFiles = await query({
    query: "site.files",
    select: { url: true, alt: true, filename: true },
  });

  function siteFile(name, defaultAlt) {
    const found = siteFiles.find((f) => f.filename === name);
    return {
      url: found ? proxyUrl(found.filename) : `/images/${name}`,
      alt: found?.alt || defaultAlt || "",
    };
  }

  const siteImages = {
    logo: logo.url,
    logoAlt: logo.alt,
    logoMobile: siteFile("eit-logo-mbl.png", "Em in Toyland"),
    logoPink: siteFile("eit-logo-pink.png", ""),
    logoFooter: siteFile("eit-logo-shadow.png", "Em in Toyland"),
    toysLeft: siteFile("eit-toys-left.png", ""),
    toysRight: siteFile("eit-toys-right.png", ""),
  };

  // Normalize modified timestamps to date strings for comparison
  const dateFormat = (ts) => {
    if (!ts) return null;
    const d = new Date(ts * 1000);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  for (const item of workItems) {
    if (item.modified) item.modifiedDate = dateFormat(item.modified);
  }
  for (const item of blogPosts) {
    if (item.modified) item.modifiedDate = dateFormat(item.modified);
  }

  const all = [
    ...resolvedPages.map(p => ({ ...p, parentSlug: null })),
    ...workItems.map(w => ({ ...w, parentSlug: "work" })),
    ...blogPosts.map(b => ({ ...b, parentSlug: "blog" })),
  ];

  const blogTags = [...new Set(
    blogPosts.flatMap(p => (p.tags || "").split(",").map(t => t.trim().toLowerCase()).filter(Boolean))
  )];

  return { all, blogTags, settings: { ...settings, logo: logo.url, logoAlt: logo.alt, seoDefaultImage: seoDefaultImage.url, newsletterImage: newsletterImage.url, newsletterImageAlt: newsletterImage.alt, siteImages, nav: parseStructure(settings.nav) } };
}

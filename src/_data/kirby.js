import { $fetch } from "ofetch";

const api = process.env.KIRBY_API_URL
  ? `${process.env.KIRBY_API_URL}/api/query`
  : "http://localhost:8000/api/query";

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
      url: match?.url || fieldValue,
      alt: match?.alt || defaultAlt || "",
    };
  } catch {
    return { url: fieldValue, alt: defaultAlt || "" };
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
    return match?.url || fieldValue;
  } catch {
    return fieldValue;
  }
}

export default async function () {
  const [settings, pages, rawWorkItems] = await Promise.all([
    query({
      query: "site",
      select: {
        title: true,
        siteDescription: true,
        logo: true,
        footerText: true,
        googleAnalyticsId: true,
      },
    }),
    query({
      query: "site.children",
      select: {
        title: true, slug: true, uri: true,
        metaDescription: true, text: true,
        heroHeading: true, heroText: true, heroImage: true,
        heroCtaText: true, heroCtaLink: true,
        showcaseHeading: true, showcaseItems: true,
        showcaseCtaText: true, showcaseCtaLink: true,
        aboutHeading: true, aboutText: true,
      },
    }),
    query({
      query: "page(\"work\").children",
      select: {
        title: true, slug: true, uri: true, uuid: true,
        workType: true, workLink: true,
        workImage: true, workHeroImage: true,
        publishedDate: true, text: true,
        body: true,
      },
    }),
  ]);

  // Resolve site logo with alt text
  const logo = await resolveFileWithMeta("site", settings.logo, "Em in Toyland");

  // Resolve work item images with alt text
  const workItems = await Promise.all(
    rawWorkItems.map(async (item) => {
      const [workImage, workHeroImage] = await Promise.all([
        resolveFileWithMeta(`page("work/${item.slug}")`, item.workImage, item.title),
        resolveFileWithMeta(`page("work/${item.slug}")`, item.workHeroImage, item.title),
      ]);
      return { ...item, workImage: workImage.url, workImageAlt: workImage.alt, workHeroImage: workHeroImage.url };
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
      url: found?.url || `/images/${name}`,
      alt: found?.alt || defaultAlt || "",
    };
  }

  const siteImages = {
    logo: logo.url,
    logoAlt: logo.alt,
    logoMobile: siteFile("eit-logo-mbl.png", "Em in Toyland"),
    logoPink: siteFile("eit-logo-pink.png", ""),
  };

  const all = [
    ...resolvedPages.map(p => ({ ...p, parentSlug: null })),
    ...workItems.map(w => ({ ...w, parentSlug: "work" })),
  ];

  return { all, settings: { ...settings, logo: logo.url, logoAlt: logo.alt, siteImages } };
}

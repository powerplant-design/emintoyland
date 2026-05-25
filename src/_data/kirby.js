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

async function resolveByFilename(pageQuery, fieldValue) {
  if (!fieldValue) return fieldValue;
  const filename = fieldValue.split("/").pop();
  try {
    const files = await query({
      query: `${pageQuery}.files`,
      select: { url: true, filename: true },
    });
    const match = files.find((f) => f.filename === filename);
    return match ? match.url : fieldValue;
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
        heroTagline: true, heroText: true, heroImage: true,
        showcaseHeading: true, showcaseText: true,
        aboutHeading: true, aboutText: true,
      },
    }),
    query({
      query: "page(\"work\").children",
      select: {
        title: true, slug: true, uri: true,
        workType: true, workLink: true,
        workImage: true, workHeroImage: true,
        publishedDate: true, text: true,
        body: true,
      },
    }),
  ]);

  // Resolve site logo from site files
  const resolvedLogo = await resolveByFilename("site", settings.logo);

  // Resolve work item images
  const workItems = await Promise.all(
    rawWorkItems.map(async (item) => {
      const [workImage, workHeroImage] = await Promise.all([
        resolveByFilename(`page("work/${item.slug}")`, item.workImage),
        resolveByFilename(`page("work/${item.slug}")`, item.workHeroImage),
      ]);
      return { ...item, workImage, workHeroImage };
    })
  );

  // Resolve page images (heroImage on home, etc.)
  const resolvedPages = await Promise.all(
    pages.map(async (p) => {
      if (p.heroImage) {
        const heroImage = await resolveByFilename(`page("${p.uri}")`, p.heroImage);
        return { ...p, heroImage };
      }
      return p;
    })
  );

  // Resolve site-level images (decorative)
  const siteFiles = await query({
    query: "site.files",
    select: { url: true, filename: true },
  });

  function siteFile(name) {
    const found = siteFiles.find((f) => f.filename === name);
    return found ? found.url : `/images/${name}`;
  }

  const siteImages = {
    logo: resolvedLogo,
    logoMobile: siteFile("eit-logo-mbl.png"),
    logoPink: siteFile("eit-logo-pink.png"),
  };

  const all = [
    ...resolvedPages.map(p => ({ ...p, parentSlug: null })),
    ...workItems.map(w => ({ ...w, parentSlug: "work" })),
  ];

  return { all, settings: { ...settings, logo: resolvedLogo, siteImages } };
}

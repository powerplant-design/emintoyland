import { $fetch } from "ofetch";

const api = "http://localhost:8000/api/query";

async function query(body) {
  const res = await $fetch(api, { method: "post", body });
  return res.result;
}

async function resolveFile(pageSlug, fieldValue) {
  if (!fieldValue || !fieldValue.startsWith("file://")) return fieldValue;
  try {
    const files = await query({
      query: `page("${pageSlug}").files()`,
      select: { url: true, uuid: true, filename: true },
    });
    const match = files.find((f) => f.uuid === fieldValue || f.filename === fieldValue);
    return match ? match.url : fieldValue;
  } catch {
    return fieldValue;
  }
}

async function resolveWorkImages(workItems) {
  const withFiles = await Promise.all(
    workItems.map(async (item) => {
      const workImage = await resolveFile(`work/${item.slug}`, item.workImage);
      return { ...item, workImage };
    })
  );
  return withFiles;
}

export default async function () {
  const [pages, rawWorkItems] = await Promise.all([
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
        workImage: true, publishedDate: true,
        text: true,
      },
    }),
  ]);

  const workItems = await resolveWorkImages(rawWorkItems);

  // Resolve hero image for the home page
  const resolvedPages = await Promise.all(
    pages.map(async (p) => {
      if (p.uri === "home" && p.heroImage) {
        const heroImage = await resolveFile("home", p.heroImage);
        return { ...p, heroImage };
      }
      return p;
    })
  );

  const all = [
    ...resolvedPages.map(p => ({ ...p, parentSlug: null })),
    ...workItems.map(w => ({ ...w, parentSlug: "work" })),
  ];

  return all;
}
import fs from "fs";
import markdownit from "markdown-it";
import Image from "@11ty/eleventy-img";
import esbuild from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const md = markdownit({ html: true });

const KIRBY_URL = process.env.KIRBY_API_URL || "http://localhost:8000";

async function resolveImageInput(src) {
  if (!src) return null;

  if (src.startsWith("http://") || src.startsWith("https://")) {
    const url = new URL(src);
    const filename = path.basename(url.pathname);
    const cacheDir = path.join(__dirname, ".cache", "images");
    fs.mkdirSync(cacheDir, { recursive: true });
    const localPath = path.join(cacheDir, filename);
    if (!fs.existsSync(localPath)) {
      const response = await fetch(src);
      if (!response.ok) throw new Error(`Failed to fetch ${src}: ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(localPath, buffer);
    }
    return localPath;
  }

  if (src.startsWith("/media/")) {
    const fetchUrl = KIRBY_URL + src;
    return resolveImageInput(fetchUrl);
  }

  if (src.startsWith("/images/") || src.startsWith("images/")) {
    const srcPath = src.startsWith("/") ? src.slice(1) : src;
    const localPath = path.join(__dirname, "src", srcPath);
    if (fs.existsSync(localPath)) return localPath;
    return null;
  }
}

export default function (eleventyConfig) {
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));
  eleventyConfig.addFilter("markdown", (content) => md.render(content || ""));

  eleventyConfig.addPassthroughCopy("src/assets/styles");
  eleventyConfig.addPassthroughCopy("src/assets/fonts");
  eleventyConfig.addPassthroughCopy({ "public/favicon.ico": "/favicon.ico" });

  eleventyConfig.addWatchTarget("kirby/content");

  eleventyConfig.on("afterBuild", async () => {
    await esbuild.build({
      entryPoints: [path.join(__dirname, "src", "assets", "scripts", "app.js")],
      outfile: path.join(__dirname, "_site", "assets", "scripts", "app.js"),
      bundle: true,
      format: "esm",
      sourcemap: true,
    });
  });

  eleventyConfig.addShortcode("image", async function (src, alt, sizes, loading) {
    if (!src) return "";

    const inputPath = await resolveImageInput(src);
    if (!inputPath) return "";

    const metadata = await Image(inputPath, {
      widths: [320, 640, 960, 1280, 1600],
      formats: ["avif", "webp", "png"],
      outputDir: path.join(__dirname, "_site", "img"),
      urlPath: "/img/",
      filenameFormat: function (id, src, width, format) {
        const ext = path.extname(src);
        const name = path.basename(src, ext);
        return `${name}-${width}w.${format}`;
      },
    });

    const lowsrc = metadata.png?.[0] || metadata.jpeg?.[0] || metadata.webp?.[0];

    return `<picture>
      ${Object.values(metadata).map(imageFormat => {
        return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes || "(min-width: 40rem) 50vw, 100vw"}">`;
      }).join("\n")}
      <img
        src="${lowsrc?.url || src}"
        alt="${alt}"
        loading="${loading || "lazy"}"
        decoding="async"
        width="${lowsrc?.width}"
        height="${lowsrc?.height}"
      >
    </picture>`;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_includes/layouts",
      data: "_data",
    },
  };
}

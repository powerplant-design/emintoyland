import markdownit from "markdown-it";
import Image from "@11ty/eleventy-img";
import esbuild from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const md = markdownit({ html: true });

export default function (eleventyConfig) {
  eleventyConfig.addFilter("markdown", (content) => md.render(content || ""));
  eleventyConfig.addPassthroughCopy("src/assets/styles");
  eleventyConfig.addPassthroughCopy("src/images");

  eleventyConfig.on("afterBuild", async () => {
    await esbuild.build({
      entryPoints: [path.join(__dirname, "src", "assets", "scripts", "app.js")],
      outfile: path.join(__dirname, "_site", "assets", "scripts", "app.js"),
      bundle: true,
      format: "esm",
      sourcemap: true,
    });
  });

  eleventyConfig.addShortcode("image", async function (src, alt, sizes) {
    if (!src) return "";

    const srcPath = src.startsWith("/") ? src.slice(1) : src;
    const inputPath = path.join(__dirname, "src", srcPath);

    const metadata = await Image(inputPath, {
      widths: [320, 640, 960, 1280, 1600],
      formats: ["avif", "webp", "png"],
      outputDir: path.join(__dirname, "_site", path.dirname(srcPath)),
      urlPath: "/" + path.dirname(srcPath) + "/",
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
        loading="lazy"
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

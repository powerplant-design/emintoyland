import markdownit from "markdown-it";
import esbuild from "esbuild";
import path from "path";
import { fileURLToPath } from "url";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const md = markdownit({ html: true });

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["avif", "webp", "png"],
    widths: [320, 640, 960, 1280, 1600, "auto"],
    htmlOptions: {
      imgAttributes: {
        loading: "lazy",
        decoding: "async",
      },
    },
  });

  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));
  eleventyConfig.addFilter("split", (value, separator) => (value || "").split(separator));
  eleventyConfig.addFilter("trim", (value) => (value || "").trim());
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

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const CACHE_DIR = "/opt/build/cache";
const IMG_CACHE = path.join(CACHE_DIR, "eleventy-img");
const FETCH_CACHE = path.join(CACHE_DIR, "eleventy-fetch");
const OUTPUT_IMG = "_site/img";
const FETCH_DIR = ".cache";

function restore(src, dest) {
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log(`[cache] restored ${src} → ${dest}`);
  }
}

function save(src, dest) {
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log(`[cache] saved ${src} → ${dest}`);
  }
}

// 1. Pre-populate output + fetch cache from persistent storage
restore(IMG_CACHE, OUTPUT_IMG);
restore(FETCH_CACHE, FETCH_DIR);

// 2. Run Eleventy build
execSync("npx eleventy", { stdio: "inherit" });

// 3. Save back for next build
save(OUTPUT_IMG, IMG_CACHE);
save(FETCH_DIR, FETCH_CACHE);

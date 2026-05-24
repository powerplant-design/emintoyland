import { defineConfig } from "tinacms";
import nextConfig from '../next.config'

import Pages from "./collection/pages";
import BlogPosts from "./collection/blogPosts";
import BlogCategories from "./collection/blogCategories";
import WorkItems from "./collection/workItems";
import Settings from "./collection/settings";
import InstagramFeed from "./collection/instagramFeed";

const config = defineConfig({
  telemetry: 'disabled',
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || '',
  branch:
    process.env.NEXT_PUBLIC_TINA_BRANCH ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ||
    process.env.HEAD ||
    'main',
  token: process.env.TINA_TOKEN || '',
  media: {
    tina: {
      publicFolder: "public",
      mediaRoot: "uploads",
    },
  },
  build: {
    publicFolder: "public",
    outputFolder: "admin",
    basePath: nextConfig.basePath?.replace(/^\//, '') || '',
  },
  schema: {
    collections: [Pages, BlogPosts, BlogCategories, WorkItems, Settings, InstagramFeed],
  },
});

export default config;

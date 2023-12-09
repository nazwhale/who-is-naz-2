import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import Markdown from "vite-plugin-md";
import sitemap from "vite-plugin-sitemap";
import fs from "fs";
import path from "path";

function getArticleSlugs() {
  const directoryPath = path.resolve(__dirname, "src/blog-posts");
  const files = fs.readdirSync(directoryPath);

  const fileNames = files.map((file) => {
    const withoutExtension = file.replace(".md", "");
    return `/articles/${withoutExtension}`;
  });

  return fileNames;
}

// https://vitejs.dev/config/
export default defineConfig({
  server: { port: 9999 },
  plugins: [
    react(),
    Markdown(),
    sitemap({
      hostname: "https://www.tempotick.com",
      dynamicRoutes: [
        "/",
        "/online-metronome",
        "/circle-of-fifths-metronome",
        "/articles",
        ...getArticleSlugs(),
      ],
      priority: 0.7,
      generateRobotsTxt: true,
      robots: [{ userAgent: "*", allow: "/" }],
    }),
  ],
  assetsInclude: ["**/*.md"],
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import Markdown from "vite-plugin-md";
// import sitemap from "vite-plugin-sitemap";

// https://vitejs.dev/config/
export default defineConfig({
  server: { port: 9999 },
  plugins: [
    react(),
    Markdown(),
    // sitemap({
    //   hostname: "https://www.tempotick.com",
    //   dynamicRoutes: ["/", "/articles", "/articles/:slug"],
    //   priority: 0.7,
    //   generateRobotsTxt: true,
    //   robots: [{ userAgent: "*", allow: "/" }],
    // }),
  ],
  assetsInclude: ["**/*.md"],
});

// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import Markdown from "vite-plugin-md";
import { Buffer } from "buffer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), Markdown()],
  assetsInclude: ["**/*.md"],
  define: {
    global: "window", // Define 'global' if needed
    Buffer: Buffer, // Correctly reference the Buffer polyfill
  },
  resolve: {
    alias: {
      buffer: "buffer", // Ensure the 'buffer' package is aliased
    },
  },
});

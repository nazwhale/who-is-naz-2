// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import Markdown from "vite-plugin-md";
import { Buffer } from "buffer";

export default defineConfig({
  plugins: [react(), Markdown()],
  assetsInclude: ["**/*.md"],
  define: {
    global: "window", // Define 'global' if needed
    "process.env": {}, // Mock 'process.env' if needed
    "process.browser": true, // Define 'process.browser' if using libraries that check for this
    Buffer: "Buffer", // Correctly reference the Buffer global variable as a string
  },
  resolve: {
    alias: {
      buffer: "buffer", // Ensure the 'buffer' package is aliased
    },
  },
});

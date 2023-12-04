import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import Markdown from "vite-plugin-md";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), Markdown()],
  assetsInclude: ["**/*.md"],
  define: {
    global: {}, // Polyfill for global if needed
    Buffer: ["buffer", "Buffer"], // Polyfill for Buffer
  },
  resolve: {
    alias: {
      // This alias is necessary in Vite environments
      buffer: "buffer",
    },
  },
});

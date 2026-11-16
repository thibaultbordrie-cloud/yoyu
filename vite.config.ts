import { defineConfig } from "vite";

// Relative paths: the app works from any folder, including https://<user>.github.io/yoyu/.
export default defineConfig({
  base: "./",
  build: { target: "es2022", sourcemap: false, assetsInlineLimit: 0 },
  server: { host: "127.0.0.1" },
});

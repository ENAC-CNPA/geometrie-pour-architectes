import { defineConfig } from "vite";

export default defineConfig({
  base: "/geometrie-pour-architectes/",
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        main_ieee2026: "index-ieee2026.html",
        viewer: "viewer.html",
      },
    },
  },
});

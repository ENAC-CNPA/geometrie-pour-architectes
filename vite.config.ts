import { defineConfig } from "vite";

export default defineConfig({
  base: "/geometrie-pour-architectes/",
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        viewer: "viewer.html",
      },
    },
  },
});

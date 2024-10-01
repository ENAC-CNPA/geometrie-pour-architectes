/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from "vite";

export default defineConfig({
  base: "/geometrie-pour-architectes/",
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
});
/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  server: { port: 3000 },
  build: {
    target: "es2020",
  },
  test: {
    environment: "jsdom",
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/vite-env.d.ts"],
    },
  },
});

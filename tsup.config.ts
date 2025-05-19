import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  outDir: "dist",
  clean: true,
  minify: true,
  splitting: false,
  sourcemap: false,
  external: ["react"],
  target: "es2020",
  esbuildOptions(options) {
    // "use client" directive for Next.js 13+ and React Server Components
    options.banner = {
      js: '"use client";',
    };
    // Optimize for both React 18 and 19
    options.jsx = "automatic";
    options.jsxImportSource = "react";
  },
  // React 19 compatibility
  platform: "browser",
  // Better tree-shaking for React 19
  treeshake: {
    preset: "recommended",
  },
});

import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  minify: true,
  treeshake: true,
  outDir: "dist",
  external: ["react"],
  splitting: true, // Enable code splitting for ESM
  cjsInterop: true,
  target: "es2020",
  esbuildOptions(options) {
    options.mangleProps = /^_/; // Mangle private properties
    options.keepNames = false;
    options.minifySyntax = true;
    options.minifyWhitespace = true;
    options.minifyIdentifiers = true;
  },
});

import { defineConfig } from "tsup";

export default defineConfig([
  // Utils - standalone
  {
    entry: ["src/utils.ts"],
    format: ["cjs", "esm"],
    dts: true,
    clean: true,
    minify: true,
    treeshake: true,
    outDir: "dist",
  },
  // Types - standalone
  {
    entry: ["src/types.ts"],
    format: ["cjs", "esm"],
    dts: true,
    clean: true,

    minify: true,
    treeshake: true,
    outDir: "dist",
  },
  // Store - with React as external
  {
    entry: ["src/store.ts"],
    format: ["cjs", "esm"],
    dts: true,
    minify: true,
    clean: true,

    treeshake: true,
    outDir: "dist",
    external: ["react", "rect-constore/utils", "react-constore/types"], // 🔥 React نباید bundle بشه!
  },
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    minify: true,
    treeshake: true,
    clean: true,

    outDir: "dist",
    external: ["react", "rect-constore/utils", "react-constore/store"], // 🔥 React نباید bundle بشه!
  },
  // Middlewares - with React as external
  // {
  //   entry: ["src/middlewares/index.ts"],
  //   format: ["cjs", "esm"],
  //   dts: false,
  //   minify: true,
  //   treeshake: true,
  //   outDir: "dist/middlewares",
  //   external: ["react"], // 🔥 React نباید bundle بشه!
  //   outExtension({ format }) {
  //     return {
  //       js: format === "cjs" ? ".js" : ".mjs",
  //     };
  //   },
  // },
]);

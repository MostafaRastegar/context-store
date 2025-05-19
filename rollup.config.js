import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

const isProduction = process.env.NODE_ENV === "production";

export default {
  input: "src/index.ts",
  external: ["react"],
  output: [
    {
      file: "dist/index.js",
      format: "cjs",
      sourcemap: false,
      exports: "default",
    },
    {
      file: "dist/index.esm.js",
      format: "esm",
      sourcemap: false,
    },
  ],
  plugins: [
    resolve(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationDir: "dist",
      exclude: ["**/*.test.*", "**/*.spec.*"],
    }),
    isProduction &&
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ["console.log", "console.warn"],
        },
        mangle: {
          reserved: ["createStore"],
        },
      }),
  ].filter(Boolean),
};

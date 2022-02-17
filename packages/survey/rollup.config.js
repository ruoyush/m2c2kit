import typescript from "@rollup/plugin-typescript";
import shim from "rollup-plugin-shim";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import babel from "@rollup/plugin-babel";
import del from "rollup-plugin-delete";
import dts from "rollup-plugin-dts";
import { terser } from "rollup-plugin-terser";
import sourcemaps from "rollup-plugin-sourcemaps";

let sharedPlugins = [
  // canvaskit-wasm references these node.js functions
  // shim them to empty functions for browser usage
  shim({
    fs: `export function fs_empty_shim() { }`,
    path: `export function path_empty_shim() { }`,
  }),
  nodeResolve(),
  commonjs(),
];

export default [
  {
    input: ["./src/index.ts"],
    // the output is build because we need a later step to
    // combine all declaration files
    output: [{ dir: "./build", format: "es", sourcemap: true }],
    plugins: [
      del({ targets: ["dist/*", "build/*", "build-umd/*"] }),
      ...sharedPlugins,
      typescript({
        // I was getting errors when defining include and exclude
        // only in tsconfig.json, thus defining them here.
        // note, however, because I specified rootDir below,
        // the include and exclude now are relative to src
        include: ["./**/*.[tj]s"],
        exclude: ["**/__tests__", "**/*.test.ts"],
        rootDir: "src",
      }),
      sourcemaps(),
      terser(),
    ],
  },

  {
    // bundle all declaration files and place the declaration
    // bundle in dist
    input: "./build/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [
      dts(),
      copy({
        targets: [
          {
            // copy the bundled esm module and sourcemap to dist
            src: "build/index.*",
            dest: ["dist/"],
          },
          {
            src: [
              "../../node_modules/survey-knockout/modern.css",
              "../../node_modules/survey-knockout/modern.min.css",
              "../../node_modules/survey-knockout/survey.css",
              "../../node_modules/survey-knockout/survey.min.css",
              "../../node_modules/surveyjs-widgets/node_modules/nouislider/distribute/nouislider.css",
              "../../node_modules/surveyjs-widgets/node_modules/nouislider/distribute/nouislider.min.css",
              "../../node_modules/select2/dist/css/select2.css",
              "../../node_modules/select2/dist/css/select2.min.css",
              "../../node_modules/bootstrap-datepicker/dist/css/bootstrap-datepicker.standalone.css",
              "../../node_modules/bootstrap-datepicker/dist/css/bootstrap-datepicker.standalone.css.map",
              "../../node_modules/bootstrap-datepicker/dist/css/bootstrap-datepicker.standalone.min.css",
            ],
            dest: ["dist/css/"],
          },
        ],
      }),
    ],
  },

  // Make a UMD bundle only to use for testing (jest), because jest support
  // for esm modules is still incomplete
  {
    input: "./src/index.ts",
    output: [
      {
        dir: "./build-umd",
        format: "umd",
        name: "m2c2kit",
        esModule: false,
        exports: "named",
        sourcemap: true,
      },
    ],
    plugins: [
      ...sharedPlugins,
      typescript({
        // tsconfig.json defined the outDir as build, so we must
        // use a different one for this umd build
        outDir: "./build-umd",
        // I was getting errors when defining include and exclude
        // only in tsconfig.json, thus defining them here.
        include: ["./src/**/*.[tj]s"],
        exclude: ["**/__tests__", "**/*.test.ts"],
      }),
      babel({
        // compact: false to supress minor warning note
        // see https://stackoverflow.com/a/29857361
        babelHelpers: "bundled",
        compact: false,
      }),
      copy({
        targets: [
          {
            // copy the bundled declarations to build-umd
            src: "dist/index.d.ts",
            dest: ["build-umd/"],
          },
        ],
      }),
    ],
  },
];
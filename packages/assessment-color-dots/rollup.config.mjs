import esbuild from "rollup-plugin-esbuild";
import { minify } from "rollup-plugin-esbuild";
import nodeResolve from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy";
import {
  addModuleMetadata,
  insertVersionString,
  writeMetadataJson,
} from "@m2c2kit/build-helpers";

writeMetadataJson();

export default [
  {
    input: ["./src/index.ts"],
    external: ["@m2c2kit/core", "@m2c2kit/addons"],
    output: [
      {
        file: "./dist/index.js",
        format: "es",
        sourcemap: true,
      },
      {
        file: "./dist/index.min.js",
        format: "es",
        sourcemap: false,
        plugins: [minify()],
      },
    ],
    plugins: [
      insertVersionString(),
      addModuleMetadata(),
      nodeResolve(),
      esbuild(),
      copy({
        targets: [
          {
            src: "build/index.d.ts",
            dest: "dist",
          },
          {
            src: "build/index.d.ts",
            dest: "dist",
            rename: () => "index.min.d.ts",
          },
        ],
      }),
    ],
  },
];

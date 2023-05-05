import esbuild from "rollup-plugin-esbuild";
import { minify } from "rollup-plugin-esbuild";
import copy from "rollup-plugin-copy";
import dts from "rollup-plugin-dts";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

/**
 * @m2c2kit/survey uses SurveyJS's react-based library. React uses
 * process.env.NODE_ENV to determine the production environment. This will not
 * be available in the browser, so shim it.
 * see https://github.com/rollup/rollup/issues/487
 */
function prependToBundle(filename, content) {
  return {
    name: "prepend-to-bundle",
    generateBundle: (_options, bundle) => {
      if (bundle[filename]?.type === "chunk") {
        bundle[filename].code = content + bundle[filename].code;
      } else {
        throw new Error(`bundle named ${filename} not found.`);
      }
    },
  };
}
const codeToPrepend = `let process={env:{NODE_ENV:'production'}};`;

// I could not get @rollup/plugin-typescript to work with the
// emitDeclarationOnly option. Thus, as part of the build script in
// package.json, before rollup is run, tsc is run to generate the
// declaration files used by rollup-plugin-dts.

export default [
  {
    input: ["./src/index.ts"],
    external: ["@m2c2kit/core"],
    output: [
      {
        file: "./build/index.js",
        format: "es",
        sourcemap: true,
        plugins: [prependToBundle("index.js", codeToPrepend)],
      },
      {
        file: "./build-nobundler/m2c2kit.survey.esm.js",
        format: "es",
        paths: {
          "@m2c2kit/core": "./m2c2kit.core.esm.js",
        },
        sourcemap: false,
        plugins: [prependToBundle("m2c2kit.survey.esm.js", codeToPrepend)],
      },
      {
        file: "./build-nobundler/m2c2kit.survey.esm.min.js",
        format: "es",
        paths: {
          "@m2c2kit/core": "./m2c2kit.core.esm.min.js",
        },
        sourcemap: false,
        plugins: [
          minify(),
          prependToBundle("m2c2kit.survey.esm.min.js", codeToPrepend),
        ],
      },
    ],
    plugins: [nodeResolve(), commonjs(), esbuild()],
  },
  {
    // bundle all declaration files and place the declaration
    // bundle in dist
    input: "./build/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [
      dts(),
      copy({
        // hook must be 'closeBundle' because we need dist/index.d.ts to
        // be created before we can copy it
        hook: "closeBundle",
        targets: [
          {
            src: "build/index.js*",
            dest: "dist",
          },
          {
            src: "dist/index.d.ts",
            dest: "build-nobundler/",
            rename: () => "m2c2kit.survey.esm.d.ts",
          },
          {
            src: "dist/index.d.ts",
            dest: "build-nobundler/",
            rename: () => "m2c2kit.survey.esm.min.d.ts",
          },
          {
            src: [
              "../../node_modules/survey-react/modern.css",
              "../../node_modules/survey-react/modern.min.css",
              "../../node_modules/survey-react/survey.css",
              "../../node_modules/survey-react/survey.min.css",
              "../../node_modules/survey-react/defaultV2.css",
              "../../node_modules/survey-react/defaultV2.min.css",
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
];

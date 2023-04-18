import esbuild from "rollup-plugin-esbuild";
import nodeResolve from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import {
  hashM2c2kitAssets,
  makeM2c2kitServiceWorker,
} from "@m2c2kit/build-helpers";

export default (commandLineArgs) => {
  const isDebug = commandLineArgs.configServe ? true : false;

  let outputFolder = "build";
  if (commandLineArgs.configProd) {
    outputFolder = "dist";
  }

  const finalConfig = [
    {
      input: "./src/index.ts",
      output: [
        {
          file: `./${outputFolder}/index.js`,
          format: "es",
          sourcemap: isDebug,
        },
      ],
      plugins: [
        nodeResolve(),
        esbuild(),
        copy({
          targets: [
            {
              src: "../core/assets/",
              dest: outputFolder,
            },
            {
              src: "../core/index.html",
              dest: outputFolder,
            },
            {
              src: "../assessment-cli-starter/assets/cli-starter",
              dest: `${outputFolder}/assets`,
            },
            {
              src: "../assessment-color-dots/assets/color-dots",
              dest: `${outputFolder}/assets`,
            },
            {
              src: "../assessment-grid-memory/assets/grid-memory",
              dest: `${outputFolder}/assets`,
            },
            {
              src: "../assessment-symbol-search/assets/symbol-search",
              dest: `${outputFolder}/assets`,
            },
            {
              src: "../assessment-color-shapes/assets/color-shapes",
              dest: `${outputFolder}/assets`,
            },
            {
              src: "../db/data.html",
              dest: `${outputFolder}`,
            },
            {
              src: "../db/dist/data.js",
              dest: `${outputFolder}`,
            },
          ],
        }),
        commandLineArgs.configProd &&
          !commandLineArgs.configNoHash &&
          hashM2c2kitAssets(outputFolder),
        commandLineArgs.configProd &&
          !commandLineArgs.configNoHash &&
          commandLineArgs.configServiceWorker &&
          makeM2c2kitServiceWorker(outputFolder, ["data.html", "data.js"]),
        commandLineArgs.configServe &&
          serve({
            /**
             * Start development server and automatically open browser with
             *   npm run serve -- --configOpen
             * However, to debug and hit breakpoints, you must launch
             * the browser through vs code.
             */
            open: commandLineArgs.configOpen && true,
            verbose: true,
            contentBase: [`./${outputFolder}`],
            historyApiFallback: true,
            host: "localhost",
            port: 3000,
          }),
        commandLineArgs.configServe &&
          /**
           * Try a shorter delay for quicker reloads, but increase it if
           * the browser reloads before the new build is fully ready.
           */
          livereload({ watch: "build", delay: 250 }),
      ],
    },
  ];

  return finalConfig;
};

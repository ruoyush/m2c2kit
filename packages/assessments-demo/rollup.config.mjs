import esbuild from "rollup-plugin-esbuild";
import nodeResolve from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import {
  hashM2c2kitAssets,
  makeM2c2kitServiceWorker,
  copyAssets,
  restoreImportMeta,
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
        esbuild({
          logOverride: {
            "empty-import-meta": "silent",
          },
        }),
        restoreImportMeta(),
        copyAssets({
          packageName: [
            "@m2c2kit/assessment-color-dots",
            "@m2c2kit/assessment-grid-memory",
            "@m2c2kit/assessment-color-shapes",
            "@m2c2kit/assessment-symbol-search",
            "@m2c2kit/assessment-cli-starter",
            "@m2c2kit/core",
            "@m2c2kit/db",
          ],
          outputFolder,
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

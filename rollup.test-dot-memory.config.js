import typescript from '@rollup/plugin-typescript';
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import shim from 'rollup-plugin-shim';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy'

export default {
  input: './tests/dot-memory/dot-memory.ts',
  output: [
    { file: './tests/dot-memory/dot-memory.bundle.js', format: 'esm', sourcemap: true },
  ],
  plugins: [
    typescript({ inlineSourceMap: true, inlineSources: true, target: 'es6', }),
    // canvaskit-wasm references these node.js functions
    // shim them to empty functions for browser usage
    shim({
      fs: 'export function fs_empty_shim() { }',
      path: 'export function path_empty_shim() { }'
    }),
    nodeResolve(),
    commonjs({
      include: 'node_modules/canvaskit-wasm/**'
    }),
    copy({
      targets: [
        // copy the wasm binary out of node_modules so it can be served 
        { src: 'node_modules/canvaskit-wasm/bin/canvaskit.wasm', dest: './tests/dot-memory' },
      ],
      hook: 'writeBundle'
    }),
    serve({
      open: false,
      verbose: true,
      contentBase: ['tests/dot-memory', 'assets'],
      historyApiFallback: true,
      host: 'localhost',
      port: 3000,
    }),
    livereload()
  ],
};
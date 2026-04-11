'use strict';
import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['cjs'],
  platform: 'node',
  dts: true,
  bundle: true,
  splitting: false,
  outDir: 'dist',
  clean: true,
  shims: true,
  treeshake: false,
  minify: true,
  target: 'es2022',
  drop: 'console',
  define: {},
  external: [],
  noExternal: ['@actions/core', '@actions/exec', 'fast-glob', 'fs-extra'],
});

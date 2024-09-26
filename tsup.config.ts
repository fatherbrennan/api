import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/api/common/api.ts', 'src/api/common/imdb.ts'],
  bundle: true,
  clean: true,
  dts: true,
  format: ['cjs', 'esm', 'iife'],
  minify: true,
  outDir: 'dist',
  shims: true,
});

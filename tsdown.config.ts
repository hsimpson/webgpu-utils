import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'], // Build for ESmodules
  sourcemap: true,
  dts: true,
});

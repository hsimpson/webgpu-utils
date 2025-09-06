/// <reference types="@vitest/browser/providers/playwright" />
import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      exclude: ['./src/index.ts', '**/src/_models/**', ...coverageConfigDefaults.exclude],
    },
    browser: {
      enabled: true,
      provider: 'playwright',
      screenshotDirectory: 'screenshots',
      instances: [
        {
          browser: 'firefox',
          launch: {
            args: [
              /*
               * disable headless mode for debugging
               */
              '--headless',
              '--no-sandbox',

              /*
              Unsafe WebGPU Support
              Convenience flag for WebGPU development. Enables best-effort WebGPU support
              on unsupported configurations and more! Note that this flag could expose
              security issues to websites so only use it for your own development.
              – Mac, Windows, Linux, ChromeOS, Android
              */
              // '--enable-unsafe-webgpu',
            ],
          },
        },
      ],
    },
  },
});

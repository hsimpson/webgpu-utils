/// <reference types="@vitest/browser/providers/playwright" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', 'dist/**'],
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      // headless: true,
      screenshotDirectory: 'screenshots',
      instances: [
        {
          browser: 'chromium',
          launch: {
            args: [
              // '--use-angle=vulkan',
              // '--enable-features=Vulkan',
              // '--disable-vulkan-surface',
              '--headless',
              '--no-sandbox',
              '--enable-unsafe-webgpu',
            ],
          },
        },
      ],
    },
  },
});

import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const chromiumGpuOnLinuxFlags = ['--enable-features=Vulkan', '--use-vulkan=swiftshader'];
const chromiumGpuOnWindowsFlags = ['--use-angle=d3d11', '--use-webgpu-adapter=swiftshader'];

const platformArgs = ['--enable-unsafe-webgpu'];
if (process.platform === 'linux') {
  platformArgs.push(...chromiumGpuOnLinuxFlags);
} else if (process.platform === 'win32') {
  platformArgs.push(...chromiumGpuOnWindowsFlags);
} else if (process.platform === 'darwin') {
  // macOS specific flags can be added here in the future
}

export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      include: ['./src/**/*.ts'],
      exclude: ['./src/index.ts'],
    },
    browser: {
      enabled: true,
      provider: playwright(),
      screenshotDirectory: 'screenshots',
      screenshotFailures: false,
      headless: true,
      instances: [
        {
          browser: 'chromium',
          provider: playwright({
            launchOptions: {
              args: [...platformArgs],
            },
          }),
        },
      ],
    },
  },
});

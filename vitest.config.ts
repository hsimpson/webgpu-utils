import { playwright } from '@vitest/browser-playwright';
import { coverageConfigDefaults, defineConfig } from 'vitest/config';

const chromiumGpuOnLinuxFlags = ['--enable-features=Vulkan', '--use-vulkan=swiftshader'];

const platformArgs = ['--enable-unsafe-webgpu'];
if (process.platform === 'linux') {
  platformArgs.push(...chromiumGpuOnLinuxFlags);
} else if (process.platform === 'win32') {
  // windows specific flags can be added here in the future
} else if (process.platform === 'darwin') {
  // macOS specific flags can be added here in the future
}

export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      exclude: ['./src/index.ts', '**/src/_models/**', ...coverageConfigDefaults.exclude],
    },
    browser: {
      enabled: true,
      provider: playwright(),
      screenshotDirectory: 'screenshots',
      headless: true,
      instances: [
        {
          browser: 'chromium',
          provider: playwright({
            // Enable WebGPU in headless Chromium on Linux/CI. These flags are safe to leave on locally.
            // - --enable-unsafe-webgpu: historically required to enable WebGPU in automation/headless
            // - --enable-features=Vulkan: prefer the Vulkan backend (works with SwiftShader in CI)
            // - --use-vulkan=swiftshader: force SwiftShader Vulkan if no real GPU is available
            // Note: Newer Chromium versions may ignore some flags; leaving them causes no harm.
            launchOptions: {
              args: [...platformArgs],
            },
          }),
        },
      ],
    },
  },
});

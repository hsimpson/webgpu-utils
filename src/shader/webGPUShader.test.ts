import { afterEach, describe, expect, it, vi } from 'vitest';
import { WebGPUContext } from '../context/webGPUContext';
import { WebGPUShader } from './webGPUShader';

const mockShaderModule = {} as GPUShaderModule;

const webGPUContext: WebGPUContext = {
  device: {
    createShaderModule: (_descriptor: GPUShaderModuleDescriptor) => mockShaderModule,
  },
} as unknown as WebGPUContext;

describe('WebGPUShader', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should use default label when none is provided', () => {
      const shader = new WebGPUShader({ webGPUContext, source: 'fn main() {}' });

      expect(shader).toBeDefined();
    });

    it('should accept a custom label', () => {
      const shader = new WebGPUShader({
        webGPUContext,
        source: 'fn main() {}',
        label: 'my-shader',
      });

      expect(shader).toBeDefined();
    });

    it('should accept a URL source', () => {
      const shader = new WebGPUShader({
        webGPUContext,
        source: new URL('http://example.com/shader.wgsl'),
      });

      expect(shader).toBeDefined();
    });
  });

  describe('getEntryPoint', () => {
    it('should return "main" as default entry point', () => {
      const shader = new WebGPUShader({ webGPUContext, source: 'fn main() {}' });

      expect(shader.getEntryPoint()).toBe('main');
    });

    it('should return the custom entry point when provided', () => {
      const shader = new WebGPUShader({
        webGPUContext,
        source: 'fn vs_main() {}',
        entryPoint: 'vs_main',
      });

      expect(shader.getEntryPoint()).toBe('vs_main');
    });
  });

  describe('getRawShaderModule', () => {
    it('should throw before createShaderModule is called', () => {
      const shader = new WebGPUShader({ webGPUContext, source: 'fn main() {}' });

      expect(() => shader.getRawShaderModule()).toThrow('Shader module has not been created yet.');
    });

    it('should return the shader module after createShaderModule is called', async () => {
      const shader = new WebGPUShader({ webGPUContext, source: 'fn main() {}' });

      await shader.createShaderModule();

      expect(shader.getRawShaderModule()).toBe(mockShaderModule);
    });
  });

  describe('createShaderModule', () => {
    it('should create module from inline string source', async () => {
      const source = 'fn main() {}';
      const createShaderModuleSpy = vi.spyOn(webGPUContext.device, 'createShaderModule');
      const shader = new WebGPUShader({ webGPUContext, source });

      await shader.createShaderModule();

      expect(createShaderModuleSpy).toHaveBeenCalledWith({ code: source });
    });

    it('should create module by preprocessing a URL source', async () => {
      const source = 'fn main() {}';
      const url = new URL('http://example.com/shader.wgsl');
      vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
        return await Promise.resolve(new Response(source, { status: 200 }));
      });
      const createShaderModuleSpy = vi.spyOn(webGPUContext.device, 'createShaderModule');
      const shader = new WebGPUShader({ webGPUContext, source: url });

      await shader.createShaderModule();

      expect(createShaderModuleSpy).toHaveBeenCalledWith({ code: source });
    });

    it('should throw when no source is provided', async () => {
      // Bypass constructor validation by casting
      const shader = new WebGPUShader({ webGPUContext, source: '' });
      // Wipe out internal state to trigger the no-source branch
      (shader as unknown as { sourceCode?: string; sourceUrl?: URL }).sourceCode = undefined;
      (shader as unknown as { sourceCode?: string; sourceUrl?: URL }).sourceUrl = undefined;

      await expect(shader.createShaderModule()).rejects.toThrow('Shader source is not provided.');
    });
  });
});

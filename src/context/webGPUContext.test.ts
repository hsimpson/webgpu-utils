import { afterEach, assert, beforeEach, describe, expect, it, vi } from 'vitest';
import { WebGPUContext } from './webGPUContext';

describe('WebGPUContext', () => {
  let canvas: HTMLCanvasElement;

  it('should support WebGPU', () => {
    const suppported = WebGPUContext.supportsWebGPU();

    expect(suppported).toBe(true);
  });

  it('should not support WebGPU', () => {
    vi.stubGlobal('navigator', { gpu: undefined });

    const suppported = WebGPUContext.supportsWebGPU();

    expect(suppported).toBe(false);
  });

  it('should create context', async () => {
    const webGPUContext = new WebGPUContext(canvas);
    const result = await webGPUContext.create();

    expect(result).toBeTruthy();
    expect(webGPUContext.gpuCanvasContext).toBeDefined();
    expect(webGPUContext.device).toBeDefined();
    expect(webGPUContext.queue).toBeDefined();

    assert.isString(webGPUContext.preferredCanvasFormat);
    expect(webGPUContext.preferredCanvasFormat.length).toBeGreaterThan(0);
  });

  it('should fail to create canvas context', async () => {
    canvas = vi.mocked({ getContext: (_: string) => null } as HTMLCanvasElement);
    const webGPUContext = new WebGPUContext(canvas);
    const result = await webGPUContext.create();

    expect(result).toBeFalsy();
  });

  it('should return undefined with no NavigatorGPU', async () => {
    vi.stubGlobal('navigator', { gpu: undefined });
    const webGPUContext = new WebGPUContext(canvas);
    const result = await webGPUContext.create();

    expect(result).toBeFalsy();
  });

  it('should return undefined with no GPUAdapter', async () => {
    vi.stubGlobal('navigator', { gpu: { requestAdapter: () => undefined } });

    const webGPUContext = new WebGPUContext(canvas);
    const result = await webGPUContext.create();

    expect(result).toBeFalsy();
  });

  beforeEach(() => {
    canvas = vi.mocked(document.createElement('canvas'));
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });
});

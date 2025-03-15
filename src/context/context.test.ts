import { afterEach, assert, beforeEach, describe, expect, it, vi } from 'vitest';
import { createContext, supportsWebGPU } from './createContext';

describe('WebGPUContext', () => {
  let canvas: HTMLCanvasElement;

  it('should support WebGPU', () => {
    const suppported = supportsWebGPU();

    expect(suppported).toBe(true);
  });

  it('should not support WebGPU', () => {
    vi.stubGlobal('navigator', { gpu: undefined });

    const suppported = supportsWebGPU();

    expect(suppported).toBe(false);
  });

  it('should create context', async () => {
    const result = await createContext(canvas);

    expect(result).toBeDefined();
    expect(result?.canvas).toBe(canvas);
    expect(result?.adapter).toBeDefined();
    expect(result?.gpuCanvasContext).toBeDefined();
    expect(result?.device).toBeDefined();
    expect(result?.queue).toBeDefined();

    assert.isString(result?.preferredCanvasFormat);
    expect(result?.preferredCanvasFormat.length).toBeGreaterThan(0);
  });

  it('should fail to create canvas context', async () => {
    canvas = vi.mocked({ getContext: (_: string) => null } as HTMLCanvasElement);
    const result = await createContext(canvas);

    expect(result).toBeUndefined();
  });

  it('should return undefined with no NavigatorGPU', async () => {
    vi.stubGlobal('navigator', { gpu: undefined });
    const result = await createContext(canvas);
    expect(result).toBeUndefined();
  });

  it('should return undefined with no GPUAdapter', async () => {
    vi.stubGlobal('navigator', { gpu: { requestAdapter: () => undefined } });

    const result = await createContext(canvas);

    expect(result).toBeUndefined();
  });

  beforeEach(() => {
    canvas = vi.mocked(document.createElement('canvas'));
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });
});

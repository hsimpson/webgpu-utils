import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createContext, supportsWebGPU } from './createContext';

describe('WebGPUContext', () => {
  let canvas: HTMLCanvasElement = {} as HTMLCanvasElement;

  it('should support WebGPU', () => {
    const suppported = supportsWebGPU();
    expect(suppported).toBe(true);
  });

  it('should create context', async () => {
    // when
    const result = await createContext(canvas);

    // then
    expect(result).toBeDefined();
  });

  it('should return undefined with no NavigatorGPU', async () => {
    // given
    vi.stubGlobal('navigator', { gpu: undefined });

    // when
    const result = await createContext(canvas);
    // then
    expect(result).toBeUndefined();
  });

  it('should return undefined with no GPUAdapter', async () => {
    // given
    vi.stubGlobal('navigator', { gpu: { requestAdapter: () => undefined } });

    // when
    const result = await createContext(canvas);

    // then
    expect(result).toBeUndefined();
  });

  beforeEach(() => {
    canvas = document.createElement('canvas');
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });
});

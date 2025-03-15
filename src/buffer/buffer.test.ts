import { describe, expect, it } from 'vitest';
import { WebGPUContext } from '../_models/wgpucontext';
import { WebGPUBuffer } from './buffer';

describe('WebGPUBuffer', () => {
  const webGPUContext: WebGPUContext = {} as WebGPUContext;

  it('should create buffer', () => {
    const buffer = new WebGPUBuffer(
      webGPUContext,
      GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      'uniformBuffer',
    );

    expect(buffer).toBeDefined();
  });
});

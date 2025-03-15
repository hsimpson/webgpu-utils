import { describe, expect, it } from 'vitest';
import { WebGPUContext } from '../context/wgpucontext';
import { WebGPUBuffer } from './buffer';

describe('WebGPUBuffer', () => {
  const webGPUContext: WebGPUContext = {} as WebGPUContext;

  it('should create buffer', () => {
    // given

    // when
    const buffer = new WebGPUBuffer(
      webGPUContext,
      GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      'uniformBuffer',
    );

    // then
    expect(buffer).toBeDefined();
  });
});

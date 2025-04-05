import { afterEach, describe, expect, it, test, vi } from 'vitest';
import { BufferDataTypeKind, ScalarType, WebGPUBuffer, WebGPUContext } from '../../dist';

describe('WebGPUBuffer', () => {
  const webGPUContext: WebGPUContext = {
    device: { createBuffer: (_descriptor: GPUBufferDescriptor) => {} },
    queue: { writeBuffer: () => undefined },
  } as unknown as WebGPUContext;
  const deviceCreateBufferSpy = vi.spyOn(webGPUContext.device, 'createBuffer');
  const queueWriteBufferSpy = vi.spyOn(webGPUContext.queue, 'writeBuffer');

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create buffer', () => {
    const buffer = new WebGPUBuffer(
      webGPUContext,
      GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      'uniformBuffer',
    );

    expect(buffer).toBeDefined();
  });

  test.each([
    [ScalarType.Bool, 4, true],
    [ScalarType.Int32, 4, -42],
    [ScalarType.Uint32, 4, 42],
    [ScalarType.Float32, 4, 1234.5678],

    // ToDo: Float16 is not yet supported
    //[ScalarType.Float16, 2, 12.34],
  ])(
    'single buffer with scalar type: %s size should be %i',
    (scalarType: ScalarType, expectedSize: number, data) => {
      // given
      const label = `single-scalar-test-${scalarType}`;
      const usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;
      const buffer = new WebGPUBuffer(webGPUContext, usage, label);

      // when
      buffer.setData(`single-scalar-test-${scalarType}`, {
        data,
        dataType: { elementType: scalarType, bufferDataTypeKind: BufferDataTypeKind.Scalar },
      });
      buffer.writeBuffer();

      // then
      expect(deviceCreateBufferSpy).toHaveBeenCalledWith({ size: expectedSize, usage, label });
      expect(queueWriteBufferSpy).toHaveBeenCalled();
    },
  );
});

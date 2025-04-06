import { afterEach, describe, expect, it, test, vi } from 'vitest';
import { WebGPUContext } from '../context/webGPUContext';
import { BufferDataTypeKind, ScalarType, WebGPUBuffer } from './webGPUBuffer';

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

  test.each([
    [BufferDataTypeKind.Vec2, ScalarType.Bool, 8, [true, false]],
    [BufferDataTypeKind.Vec3, ScalarType.Bool, 16, [true, false, true]],
    [BufferDataTypeKind.Vec4, ScalarType.Bool, 16, [true, false, true, false]],
    [BufferDataTypeKind.Array, ScalarType.Bool, 20, [true, true, true, false, false]],
  ])(
    'single buffer data type kind: %s, and element type: %s size should be %i',
    (
      bufferDataTypeKind: BufferDataTypeKind,
      scalarType: ScalarType,
      expectedSize: number,
      data,
    ) => {
      // given
      const label = `single-array-test-${bufferDataTypeKind}-with-${scalarType}`;
      const usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;
      const buffer = new WebGPUBuffer(webGPUContext, usage, label);

      // when
      buffer.setData(`single-array-test-${bufferDataTypeKind}`, {
        data,
        dataType: { elementType: scalarType, bufferDataTypeKind },
      });
      buffer.writeBuffer();

      // then
      expect(deviceCreateBufferSpy).toHaveBeenCalledWith({ size: expectedSize, usage, label });
      expect(queueWriteBufferSpy).toHaveBeenCalled();
    },
  );
});

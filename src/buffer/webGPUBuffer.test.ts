import { afterEach, describe, expect, it, test, vi } from 'vitest';
import { WebGPUContext } from '../context/webGPUContext';
import { BufferDataTypeKind, ScalarType, WebGPUBuffer } from './webGPUBuffer';

describe('WebGPUBuffer', () => {
  const webGPUContext: WebGPUContext = {
    device: { createBuffer: (_descriptor: GPUBufferDescriptor) => undefined },
    queue: { writeBuffer: () => undefined },
  } as unknown as WebGPUContext;
  const deviceCreateBufferSpy = vi.spyOn(webGPUContext.device, 'createBuffer');
  const queueWriteBufferSpy = vi.spyOn(webGPUContext.queue, 'writeBuffer');

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create buffer', () => {
    const buffer = new WebGPUBuffer({
      webGPUContext,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      label: 'uniformBuffer',
    });

    expect(buffer).toBeDefined();
  });

  test.each([
    [ScalarType.Bool, 4, true],
    [ScalarType.Int32, 4, -42],
    [ScalarType.Int16, 2, -42],
    [ScalarType.Uint32, 4, 42],
    [ScalarType.Uint16, 2, 42],
    [ScalarType.Float32, 4, 1234.5678],
    [ScalarType.Float16, 2, 12.34],
  ])(
    'single buffer with scalar type: %s size should be %i',
    (scalarType: ScalarType, expectedSize: number, data) => {
      // given
      const label = `single-scalar-test-${scalarType}`;
      const usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;
      const buffer = new WebGPUBuffer({
        webGPUContext,
        usage,
        label,
      });

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
    [BufferDataTypeKind.Vec2, ScalarType.Int32, 8, [23, -42]],
    [BufferDataTypeKind.Vec2, ScalarType.Int16, 4, [23, -42]],
    [BufferDataTypeKind.Vec2, ScalarType.Uint32, 8, [23, 42]],
    [BufferDataTypeKind.Vec2, ScalarType.Uint16, 4, [23, 42]],
    [BufferDataTypeKind.Vec2, ScalarType.Float32, 8, [1.23, 4.56]],
    [BufferDataTypeKind.Vec2, ScalarType.Float16, 4, [1.23, 4.56]],

    [BufferDataTypeKind.Vec3, ScalarType.Bool, 16, [true, false, true]],
    [BufferDataTypeKind.Vec3, ScalarType.Int32, 16, [23, -42, 47]],
    [BufferDataTypeKind.Vec3, ScalarType.Int16, 8, [23, -42, 47]],
    [BufferDataTypeKind.Vec3, ScalarType.Uint32, 16, [23, 42, 47]],
    [BufferDataTypeKind.Vec3, ScalarType.Uint16, 8, [23, 42, 47]],
    [BufferDataTypeKind.Vec3, ScalarType.Float32, 16, [1.23, 4.56, 0.321]],
    [BufferDataTypeKind.Vec3, ScalarType.Float16, 8, [1.23, 4.56, 0.321]],

    [BufferDataTypeKind.Vec4, ScalarType.Bool, 16, [true, false, true, false]],
    [BufferDataTypeKind.Vec4, ScalarType.Int32, 16, [23, -42, 47, -11]],
    [BufferDataTypeKind.Vec4, ScalarType.Int16, 8, [23, -42, 47, -11]],
    [BufferDataTypeKind.Vec4, ScalarType.Uint32, 16, [23, 42, 47, 11]],
    [BufferDataTypeKind.Vec4, ScalarType.Uint16, 8, [23, 42, 47, 11]],
    [BufferDataTypeKind.Vec4, ScalarType.Float32, 16, [1.23, 4.56, 0.321, 42.23]],
    [BufferDataTypeKind.Vec4, ScalarType.Float16, 8, [1.23, 4.56, 0.321, 42.23]],

    [BufferDataTypeKind.Array, ScalarType.Bool, 20, [true, true, true, false, false]],
    [BufferDataTypeKind.Array, ScalarType.Int32, 20, [23, -42, 47, -11, 123]],
    [BufferDataTypeKind.Array, ScalarType.Int16, 10, [23, -42, 47, -11, 123]],
    [BufferDataTypeKind.Array, ScalarType.Uint32, 20, [23, 42, 47, 11, 123]],
    [BufferDataTypeKind.Array, ScalarType.Uint16, 10, [23, 42, 47, 11, 123]],
    [BufferDataTypeKind.Array, ScalarType.Float32, 20, [1.23, 4.56, 0.321, 42.23, -1.23]],
    [BufferDataTypeKind.Array, ScalarType.Float16, 10, [1.23, 4.56, 0.321, 42.23, -1.23]],
    [
      BufferDataTypeKind.Mat3x3,
      ScalarType.Float32,
      48,
      // prettier-ignore
      [
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,
      ],
    ],
    [
      BufferDataTypeKind.Mat3x3,
      ScalarType.Float16,
      24,
      // prettier-ignore
      [
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,
      ],
    ],

    [
      BufferDataTypeKind.Mat4x4,
      ScalarType.Float32,
      64,
      // prettier-ignore
      [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
      ],
    ],
    [
      BufferDataTypeKind.Mat4x4,
      ScalarType.Float16,
      32,
      // prettier-ignore
      [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
      ],
    ],
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
      const buffer = new WebGPUBuffer({
        webGPUContext,
        usage,
        label,
      });

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

  it('should handle TypedArray data for Vec2 (ArrayBuffer.isView path)', () => {
    const usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;
    const label = 'typed-array-vec2-test';
    const buffer = new WebGPUBuffer({ webGPUContext, usage, label });

    buffer.setData('vec2-key', {
      data: new Float32Array([1.0, 2.0]),
      dataType: { elementType: ScalarType.Float32, bufferDataTypeKind: BufferDataTypeKind.Vec2 },
    });
    buffer.writeBuffer();

    expect(deviceCreateBufferSpy).toHaveBeenCalledWith({ size: 8, usage, label });
    expect(queueWriteBufferSpy).toHaveBeenCalled();
  });

  it.each([
    [BufferDataTypeKind.Mat3x3, ScalarType.Int32],
    [BufferDataTypeKind.Mat3x3, ScalarType.Bool],
    [BufferDataTypeKind.Mat4x4, ScalarType.Uint32],
    [BufferDataTypeKind.Mat4x4, ScalarType.Int16],
  ])(
    'should log error when %s has invalid element type %s',
    (bufferDataTypeKind: BufferDataTypeKind, elementType: ScalarType) => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const buffer = new WebGPUBuffer({
        webGPUContext,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      buffer.setData('key', {
        data: [1, 0, 0, 0, 1, 0, 0, 0, 1],
        dataType: { elementType, bufferDataTypeKind },
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        `Invalid elementType ${elementType} for ${bufferDataTypeKind}`,
      );
      consoleSpy.mockRestore();
    },
  );

  it('should log error when Array type has non-array data', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const buffer = new WebGPUBuffer({
      webGPUContext,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    buffer.setData('key', {
      data: 42,
      dataType: { elementType: ScalarType.Float32, bufferDataTypeKind: BufferDataTypeKind.Array },
    });

    expect(consoleSpy).toHaveBeenCalledWith('Invalid data type', expect.anything());
    consoleSpy.mockRestore();
  });

  it('should throw for unknown ScalarType', () => {
    const buffer = new WebGPUBuffer({
      webGPUContext,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    expect(() => {
      buffer.setData('key', {
        data: 42,
        dataType: {
          elementType: 'Unknown' as unknown as ScalarType,
          bufferDataTypeKind: BufferDataTypeKind.Scalar,
        },
      });
    }).toThrow('Unknown scalar type: Unknown');
  });

  it('should update existing entry when setData is called with the same key', () => {
    const usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;
    const label = 'test-update-key';
    const buffer = new WebGPUBuffer({ webGPUContext, usage, label });

    buffer.setData('key', {
      data: 1.0,
      dataType: { elementType: ScalarType.Float32, bufferDataTypeKind: BufferDataTypeKind.Scalar },
    });
    buffer.setData('key', {
      data: 2.0,
      dataType: { elementType: ScalarType.Float32, bufferDataTypeKind: BufferDataTypeKind.Scalar },
    });
    buffer.writeBuffer();

    expect(deviceCreateBufferSpy).toHaveBeenCalledWith({ size: 4, usage, label });
  });

  it('should reuse existing gpuBuffer on second writeBuffer call', () => {
    const gpuBufferMock = {} as GPUBuffer;
    const createBufferSpy = vi.fn().mockReturnValue(gpuBufferMock);
    const writeBufferSpy = vi.fn();
    const ctx = {
      device: { createBuffer: createBufferSpy },
      queue: { writeBuffer: writeBufferSpy },
    } as unknown as WebGPUContext;

    const buffer = new WebGPUBuffer({
      webGPUContext: ctx,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    buffer.setData('key', {
      data: 42,
      dataType: { elementType: ScalarType.Float32, bufferDataTypeKind: BufferDataTypeKind.Scalar },
    });
    buffer.writeBuffer();
    buffer.writeBuffer();

    expect(createBufferSpy).toHaveBeenCalledTimes(1);
    expect(writeBufferSpy).toHaveBeenCalledTimes(2);
  });

  it('should throw when getRawBuffer called before writeBuffer', () => {
    const buffer = new WebGPUBuffer({
      webGPUContext,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    expect(() => buffer.getRawBuffer()).toThrow('Buffer not created');
  });

  it('should return gpu buffer after writeBuffer', () => {
    const gpuBufferMock = {} as GPUBuffer;
    const ctx = {
      device: { createBuffer: vi.fn().mockReturnValue(gpuBufferMock) },
      queue: { writeBuffer: vi.fn() },
    } as unknown as WebGPUContext;

    const buffer = new WebGPUBuffer({
      webGPUContext: ctx,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    buffer.setData('key', {
      data: 42,
      dataType: { elementType: ScalarType.Float32, bufferDataTypeKind: BufferDataTypeKind.Scalar },
    });
    buffer.writeBuffer();

    expect(buffer.getRawBuffer()).toBe(gpuBufferMock);
  });

  it('should throw when mapRead called before writeBuffer', async () => {
    const buffer = new WebGPUBuffer({
      webGPUContext,
      usage: GPUBufferUsage.COPY_SRC,
    });
    await expect(buffer.mapRead()).rejects.toThrow('Buffer not created');
  });

  it('should call mapAsync and getMappedRange on mapRead', async () => {
    const mappedRange = new ArrayBuffer(4);
    const gpuBufferMock = {
      mapAsync: vi.fn().mockResolvedValue(undefined),
      getMappedRange: vi.fn().mockReturnValue(mappedRange),
    };
    const ctx = {
      device: { createBuffer: vi.fn().mockReturnValue(gpuBufferMock) },
      queue: { writeBuffer: vi.fn() },
    } as unknown as WebGPUContext;

    const buffer = new WebGPUBuffer({ webGPUContext: ctx, usage: GPUBufferUsage.COPY_SRC });
    buffer.setData('key', {
      data: 42,
      dataType: { elementType: ScalarType.Float32, bufferDataTypeKind: BufferDataTypeKind.Scalar },
    });
    buffer.writeBuffer();

    const result = await buffer.mapRead(0, 4);

    expect(gpuBufferMock.mapAsync).toHaveBeenCalledWith(GPUMapMode.READ, 0, 4);
    expect(gpuBufferMock.getMappedRange).toHaveBeenCalledWith(0, 4);
    expect(result).toBe(mappedRange);
  });

  test.each([
    [
      'unknown elementType in Scalar kind',
      {
        data: 42,
        dataType: { elementType: 'Unknown', bufferDataTypeKind: BufferDataTypeKind.Scalar },
        align: 4,
        size: 4,
      },
      'Invalid elementType: Unknown',
    ],
    [
      'unknown elementType in Vec2 kind',
      {
        data: [1, 2],
        dataType: { elementType: 'Unknown', bufferDataTypeKind: BufferDataTypeKind.Vec2 },
        align: 8,
        size: 8,
      },
      'Invalid elementType: Unknown',
    ],
    [
      'unknown bufferDataTypeKind',
      {
        data: 42,
        dataType: { elementType: ScalarType.Float32, bufferDataTypeKind: 'Unknown' },
        align: 4,
        size: 4,
      },
      'Invalid bufferDataTypeKind',
    ],
  ])(
    'should throw for %s (getArrayBuffer)',
    (_description: string, injectedEntry: unknown, expectedError: string) => {
      const buffer = new WebGPUBuffer({
        webGPUContext,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      (
        buffer as unknown as Record<string, unknown[]> & { bufferArray: unknown[] }
      ).bufferArray.push(injectedEntry);

      expect(() => {
        buffer.writeBuffer();
      }).toThrow(expectedError);
    },
  );
});

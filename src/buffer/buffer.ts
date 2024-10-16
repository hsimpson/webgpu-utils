import { WebGPUContext } from '../context/wgpucontext';

// type BufferData = BufferSource | SharedArrayBuffer;

type TypedArray =
  | Float32Array
  | Int32Array
  | Uint32Array
  | Int16Array
  | Uint16Array
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray;

type TypedArrayConstructor =
  | Float32ArrayConstructor
  | Int32ArrayConstructor
  | Uint32ArrayConstructor
  | Int16ArrayConstructor
  | Uint16ArrayConstructor
  | Int8ArrayConstructor
  | Uint8ArrayConstructor
  | Uint8ClampedArrayConstructor;

interface BufferDataEntry {
  data: TypedArray;
  offset?: number;
  padding?: number;
  type: TypedArrayConstructor;
}

export class WebGPUBuffer {
  private rawBuffer?: GPUBuffer;
  private bufferMap = new Map<string, BufferDataEntry>();
  private arrayBufferSize = 0;

  public constructor(
    private readonly webGPUContext: WebGPUContext,
    private readonly usage: GPUBufferUsageFlags,
  ) {}

  public setData(key: string, data: BufferDataEntry) {
    if (!this.bufferMap.has(key)) {
      const size = data.padding ?? data.data.byteLength;
      this.arrayBufferSize += size;
    }
    this.bufferMap.set(key, data);
  }

  public writeBuffer() {
    if (!this.rawBuffer) {
      this.rawBuffer = this.create();
    }
    const arrayBuffer = this.getArrayBuffer();
    this.webGPUContext.queue.writeBuffer(this.rawBuffer, 0, arrayBuffer);
  }

  public getRawBuffer(): GPUBuffer {
    return this.rawBuffer as GPUBuffer;
  }

  private getArrayBuffer(): ArrayBuffer {
    const array = new ArrayBuffer(this.arrayBufferSize);

    for (const value of this.bufferMap.values()) {
      const typedArray = new value.type(array, value.offset, value.data.length);
      typedArray.set(value.data);
    }

    return array;
  }

  private create(): GPUBuffer {
    return this.webGPUContext.device.createBuffer({
      size: this.arrayBufferSize,
      usage: this.usage,
    });
  }
}

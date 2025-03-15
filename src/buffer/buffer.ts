import { WebGPUContext } from '../_models/wgpucontext';

export enum BufferDataType {
  Bool = 'Bool',
  Int32 = 'Int32',
  Uint32 = 'Uint32',
  Float32 = 'Float32',
  Float16 = 'Float16',

  Vec2OfBool = 'Vec2OfBool',
  Vec2OfInt32 = 'Vec2OfInt32',
  Vec2OfUint32 = 'Vec2OfUint32',
  Vec2OfFloat32 = 'Vec2OfFloat32',
  Vec2OfFloat16 = 'Vec2OfFloat16',

  Vec3OfBool = 'Vec3OfBool',
  Vec3OfInt32 = 'Vec3OfInt32',
  Vec3OfUint32 = 'Vec3OfUint32',
  Vec3OfFloat32 = 'Vec3OfFloat32',
  Vec3OfFloat16 = 'Vec3OfFloat16',

  Vec4OfBool = 'Vec4OfBool',
  Vec4OfInt32 = 'Vec4OfInt32',
  Vec4OfUint32 = 'Vec4OfUint32',
  Vec4OfFloat32 = 'Vec4OfFloat32',
  Vec4OfFloat16 = 'Vec4OfFloat16',
}

type Alignment = {
  align: number;
  size: number;
};

// Info: alignement and size: https://www.w3.org/TR/WGSL/#alignment-and-size
// Info: structure member alignment: https://www.w3.org/TR/WGSL/#structure-member-layout

const bufferDataTypeSize: Map<BufferDataType, Alignment> = new Map([
  [BufferDataType.Bool, { align: 4, size: 4 }],
  [BufferDataType.Int32, { align: 4, size: 4 }],
  [BufferDataType.Uint32, { align: 4, size: 4 }],
  [BufferDataType.Float32, { align: 4, size: 4 }],
  [BufferDataType.Float16, { align: 2, size: 2 }],

  [BufferDataType.Vec2OfBool, { align: 8, size: 8 }],
  [BufferDataType.Vec2OfInt32, { align: 8, size: 8 }],
  [BufferDataType.Vec2OfUint32, { align: 8, size: 8 }],
  [BufferDataType.Vec2OfFloat32, { align: 8, size: 8 }],
  [BufferDataType.Vec2OfFloat16, { align: 4, size: 4 }],

  [BufferDataType.Vec3OfBool, { align: 16, size: 12 }],
  [BufferDataType.Vec3OfInt32, { align: 16, size: 12 }],
  [BufferDataType.Vec3OfUint32, { align: 16, size: 12 }],
  [BufferDataType.Vec3OfFloat32, { align: 16, size: 12 }],
  [BufferDataType.Vec3OfFloat16, { align: 8, size: 6 }],

  [BufferDataType.Vec4OfBool, { align: 16, size: 16 }],
  [BufferDataType.Vec4OfInt32, { align: 16, size: 16 }],
  [BufferDataType.Vec4OfUint32, { align: 16, size: 16 }],
  [BufferDataType.Vec4OfFloat32, { align: 16, size: 16 }],
  [BufferDataType.Vec4OfFloat16, { align: 8, size: 8 }],
]);

type BufferDataEntry = {
  data: ArrayBufferView;
  dataType: BufferDataType;
};

type BufferDataEntryWithAlignment = BufferDataEntry & {
  alignment: number;
};

export class WebGPUBuffer {
  private gpuBuffer?: GPUBuffer;

  // to access the buffer array by key
  private readonly bufferMap = new Map<string, number>();
  private readonly bufferArray: BufferDataEntryWithAlignment[] = [];
  private structAlignment = 0;

  public constructor(
    private readonly webGPUContext: WebGPUContext,
    private readonly usage: GPUBufferUsageFlags,
    private readonly label?: string,
  ) {}

  public setData(key: string, dataEntry: BufferDataEntry) {
    const alignment = bufferDataTypeSize.get(dataEntry.dataType)?.align;
    if (!alignment) {
      console.error('Invalid data type', dataEntry.dataType);
      return;
    }

    const entry: BufferDataEntryWithAlignment = {
      ...dataEntry,
      alignment,
    };

    this.structAlignment = Math.max(this.structAlignment, alignment);

    let index = this.bufferMap.get(key);
    if (index === undefined) {
      index = this.bufferArray.length;
      this.bufferMap.set(key, index);
      this.bufferArray.push(entry);
    } else {
      this.bufferArray[index] = entry;
    }
  }

  public writeBuffer() {
    const arrayBuffer = this.getArrayBuffer();
    if (!this.gpuBuffer) {
      this.gpuBuffer = this.create(arrayBuffer.byteLength);
    }

    this.webGPUContext.queue.writeBuffer(this.gpuBuffer, 0, arrayBuffer);
  }

  public getRawBuffer(): GPUBuffer {
    return this.gpuBuffer as GPUBuffer;
  }

  private getPadding(size: number, byteAlignment: number): number {
    return (byteAlignment - (size % byteAlignment)) % byteAlignment;
  }

  private getBufferSize(): number {
    let size = 0;
    for (const value of this.bufferArray) {
      size +=
        value.data.byteLength +
        this.getPadding(value.data.byteLength, Math.max(this.structAlignment, value.alignment));
    }
    return size;
  }

  private getArrayBuffer(): ArrayBuffer {
    const array = new ArrayBuffer(this.getBufferSize());
    let offset = 0;

    for (const value of this.bufferArray) {
      switch (value.dataType) {
        case BufferDataType.Float32:
        case BufferDataType.Vec2OfFloat32:
        case BufferDataType.Vec3OfFloat32:
        case BufferDataType.Vec4OfFloat32: {
          const typedArray = new Float32Array(array, offset, (value.data as Float32Array).length);
          typedArray.set(value.data as Float32Array);
          break;
        }
        case BufferDataType.Int32:
        case BufferDataType.Vec2OfInt32:
        case BufferDataType.Vec3OfInt32:
        case BufferDataType.Vec4OfInt32: {
          const typedArray = new Int32Array(array, offset, (value.data as Int32Array).length);
          typedArray.set(value.data as Int32Array);
          break;
        }
        default:
          console.error('Invalid data type', value.dataType);
      }
      offset +=
        value.data.byteLength +
        this.getPadding(value.data.byteLength, Math.max(this.structAlignment, value.alignment));
    }

    return array;
  }

  private create(size: number): GPUBuffer {
    return this.webGPUContext.device.createBuffer({
      size,
      usage: this.usage,
      label: this.label,
    });
  }
}

import { WebGPUContext } from '../context/webGPUContext';

// Info: alignment and size: https://www.w3.org/TR/WGSL/#alignment-and-size
// Info: structure member alignment: https://www.w3.org/TR/WGSL/#structure-member-layout

export enum ScalarType {
  Bool = 'Bool',

  Int32 = 'Int32',
  Uint32 = 'Uint32',
  Uint16 = 'Uint16',

  Float32 = 'Float32',
  Float16 = 'Float16',
}

export enum BufferDataTypeKind {
  Scalar = 'Scalar',

  Vec2 = 'Vec2',
  Vec3 = 'Vec3',
  Vec4 = 'Vec4',

  Array = 'Array',
  Mat3x3 = 'Mat3x3',
  Mat4x4 = 'Mat4x4',
}

type BufferDataType = {
  elementType: ScalarType;
  bufferDataTypeKind: BufferDataTypeKind;
};

type AlignAndSize = {
  align: number;
  size: number;
};

const scalarTypeAlignAndSize: Map<ScalarType, AlignAndSize> = new Map([
  [ScalarType.Bool, { align: 4, size: 4 }],
  [ScalarType.Int32, { align: 4, size: 4 }],
  [ScalarType.Uint32, { align: 4, size: 4 }],
  [ScalarType.Uint16, { align: 2, size: 2 }],
  [ScalarType.Float32, { align: 4, size: 4 }],
  [ScalarType.Float16, { align: 2, size: 2 }],
]);

type BufferDataEntry = {
  data:
    | boolean
    | number
    | boolean[]
    | number[]
    | Float32Array
    | Float16Array
    | Int32Array
    | Uint32Array
    | Uint16Array;
  dataType: BufferDataType;
};

type BufferDataEntryWithAlignment = BufferDataEntry & AlignAndSize;

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
    const { elementType, bufferDataTypeKind } = dataEntry.dataType;

    // check if MatCxR (column major) has correct scalar type
    switch (bufferDataTypeKind) {
      case BufferDataTypeKind.Mat3x3:
      case BufferDataTypeKind.Mat4x4: {
        if (elementType !== ScalarType.Float32 && elementType !== ScalarType.Float16) {
          console.error(`Invalid elementType ${elementType} for ${bufferDataTypeKind}`);
          return;
        }
        break;
      }
    }

    const alignment = this.getAlignAndSize(dataEntry);
    if (!alignment) {
      console.error('Invalid data type', dataEntry.dataType);
      return;
    }

    const entry: BufferDataEntryWithAlignment = {
      ...dataEntry,
      ...alignment,
    };

    this.structAlignment = Math.max(this.structAlignment, alignment.align);

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

  private roundUp(k: number, n: number): number {
    return Math.ceil(n / k) * k;
  }

  private alignAndSizeScalar(scalarType: ScalarType): AlignAndSize {
    const alignAndSize = scalarTypeAlignAndSize.get(scalarType);
    if (!alignAndSize) {
      throw new Error(`Unknown scalar type: ${scalarType}`);
    }
    return alignAndSize;
  }

  private alignAndSizeVector2(scalarType: ScalarType): AlignAndSize {
    const alignAndSize = this.alignAndSizeScalar(scalarType);
    return { align: alignAndSize.align * 2, size: alignAndSize.size * 2 };
  }

  private alignAndSizeVector3(scalarType: ScalarType): AlignAndSize {
    const alignAndSize = this.alignAndSizeScalar(scalarType);
    return { align: alignAndSize.align * 4, size: alignAndSize.size * 3 };
  }

  private alignAndSizeVector4(scalarType: ScalarType): AlignAndSize {
    const alignAndSize = this.alignAndSizeScalar(scalarType);
    return { align: alignAndSize.align * 4, size: alignAndSize.size * 4 };
  }

  private alignAndSizeArray(scalarType: ScalarType, size: number): AlignAndSize {
    const alignAndSize = this.alignAndSizeScalar(scalarType);
    return {
      align: alignAndSize.align,
      size: size * this.roundUp(alignAndSize.align, alignAndSize.size),
    };
  }

  private getAlignAndSize(dataEntry: BufferDataEntry): AlignAndSize | undefined {
    const { elementType, bufferDataTypeKind } = dataEntry.dataType;

    // used for matrices
    const baseAlign = elementType === ScalarType.Float16 ? 4 : 8;
    switch (bufferDataTypeKind) {
      case BufferDataTypeKind.Scalar:
        return this.alignAndSizeScalar(elementType);
      case BufferDataTypeKind.Vec2:
        return this.alignAndSizeVector2(elementType);
      case BufferDataTypeKind.Vec3:
        return this.alignAndSizeVector3(elementType);
      case BufferDataTypeKind.Vec4:
        return this.alignAndSizeVector4(elementType);
      case BufferDataTypeKind.Array: {
        if (Array.isArray(dataEntry.data) || ArrayBuffer.isView(dataEntry.data)) {
          const length: number = dataEntry.data['length'];
          return this.alignAndSizeArray(elementType, length);
        }
        break;
      }
      case BufferDataTypeKind.Mat3x3: {
        return {
          align: baseAlign * 2,
          size: baseAlign * 2 * 3,
        };
      }
      case BufferDataTypeKind.Mat4x4: {
        return {
          align: baseAlign * 2,
          size: baseAlign * 2 * 4,
        };
      }
    }
  }

  private getPadding(size: number, byteAlignment: number): number {
    return (byteAlignment - (size % byteAlignment)) % byteAlignment;
  }

  private getBufferSize(): number {
    let size = 0;
    for (const value of this.bufferArray) {
      let byteLength = 0;
      if (value.dataType.bufferDataTypeKind === BufferDataTypeKind.Scalar) {
        byteLength = value.align;
      } else {
        if (ArrayBuffer.isView(value.data)) {
          byteLength = (value.data as ArrayBufferView).byteLength;
        } else if (Array.isArray(value.data)) {
          const factor = value.dataType.elementType === ScalarType.Float16 ? 2 : 4;
          byteLength = factor * value.data['length'];
        }
      }
      size += byteLength + this.getPadding(byteLength, Math.max(this.structAlignment, value.align));
    }
    return size;
  }

  private getArrayBuffer(): ArrayBuffer {
    const array = new ArrayBuffer(this.getBufferSize());
    let offset = 0;

    for (const value of this.bufferArray) {
      let byteLength = 0;
      switch (value.dataType.bufferDataTypeKind) {
        case BufferDataTypeKind.Scalar: {
          switch (value.dataType.elementType) {
            case ScalarType.Bool:
            case ScalarType.Int32: {
              const typedArray = new Int32Array(array, offset, 1);
              typedArray[0] = value.data as number;
              break;
            }
            case ScalarType.Uint32: {
              const typedArray = new Uint32Array(array, offset, 1);
              typedArray[0] = value.data as number;
              break;
            }
            case ScalarType.Float16: {
              const typedArray = new Float16Array(array, offset, 1);
              typedArray[0] = value.data as number;
              break;
            }
            case ScalarType.Float32: {
              const typedArray = new Float32Array(array, offset, 1);
              typedArray[0] = value.data as number;
              break;
            }
            default:
              throw new Error(`Invalid elementType: ${value.dataType.elementType}`);
          }
          byteLength = this.alignAndSizeScalar(value.dataType.elementType).size;
          break;
        }
        case BufferDataTypeKind.Vec2:
        case BufferDataTypeKind.Vec3:
        case BufferDataTypeKind.Vec4:
        case BufferDataTypeKind.Array: {
          switch (value.dataType.elementType) {
            case ScalarType.Bool: {
              const boolArray = value.data as never[];
              const typedArray = new Uint32Array(array, offset, boolArray.length);
              typedArray.set(boolArray);
              break;
            }
            case ScalarType.Int32: {
              const typedArray = new Int32Array(array, offset, (value.data as Int32Array).length);
              typedArray.set(value.data as Int32Array);
              break;
            }
            case ScalarType.Uint32: {
              const typedArray = new Uint32Array(array, offset, (value.data as Uint32Array).length);
              typedArray.set(value.data as Uint32Array);
              break;
            }
            case ScalarType.Uint16: {
              const typedArray = new Uint16Array(array, offset, (value.data as Uint16Array).length);
              typedArray.set(value.data as Uint16Array);
              break;
            }
            case ScalarType.Float32: {
              const typedArray = new Float32Array(
                array,
                offset,
                (value.data as Float32Array).length,
              );
              typedArray.set(value.data as Float32Array);
              break;
            }
            case ScalarType.Float16: {
              const typedArray = new Float16Array(
                array,
                offset,
                (value.data as Float16Array).length,
              );
              typedArray.set(value.data as Float16Array);
              break;
            }
            default:
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              throw new Error(`Invalid elementType: ${value.dataType.elementType}`);
          }
          byteLength = (value.data as ArrayBufferView).byteLength;
          break;
        }
        case BufferDataTypeKind.Mat3x3:
        case BufferDataTypeKind.Mat4x4: {
          switch (value.dataType.elementType) {
            case ScalarType.Float32: {
              const typedArray = new Float32Array(
                array,
                offset,
                (value.data as Float32Array).length,
              );
              typedArray.set(value.data as Float32Array);
              break;
            }
          }
          byteLength = (value.data as ArrayBufferView).byteLength;
          break;
        }
        default:
          throw new Error('Invalid bufferDataTypeKind');
      }

      offset +=
        byteLength + this.getPadding(byteLength, Math.max(this.structAlignment, value.align));
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

export class WebGPUContext {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _deviceDescriptor?: GPUDeviceDescriptor;
  private _device!: GPUDevice;
  private _gpuCanvasContext!: GPUCanvasContext;
  private _queue!: GPUQueue;
  private _preferredCanvasFormat!: GPUTextureFormat;

  private _adapterLimits!: GPUSupportedLimits;
  private _adapterInfo!: GPUAdapterInfo;
  private _features!: GPUSupportedFeatures;

  public constructor(canvas: HTMLCanvasElement, deviceDescriptor?: GPUDeviceDescriptor) {
    this._canvas = canvas;
    this._deviceDescriptor = deviceDescriptor;
  }

  public static supportsWebGPU(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (navigator.gpu) {
      return true;
    }
    return false;
  }

  public get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  public get device(): GPUDevice {
    return this._device;
  }

  public get queue(): GPUQueue {
    return this._queue;
  }

  public get gpuCanvasContext(): GPUCanvasContext {
    return this._gpuCanvasContext;
  }

  public get preferredCanvasFormat(): GPUTextureFormat {
    return this._preferredCanvasFormat;
  }

  public get adapterLimits(): GPUSupportedLimits {
    return this._adapterLimits;
  }

  public get adapterInfo(): GPUAdapterInfo {
    return this._adapterInfo;
  }

  public get features(): GPUSupportedFeatures {
    return this._features;
  }

  public async create(): Promise<boolean> {
    const gpu: GPU = navigator.gpu;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!gpu) {
      console.error('No WebGPU support navigator.gpu not available! Navigator: ', navigator);
      return false;
    }

    const adapter = await gpu.requestAdapter();
    if (!adapter) {
      console.error('failed to get GPUAdapter, gpu: ', gpu);
      return false;
    }

    const gpuCanvasContext = this._canvas.getContext('webgpu');
    if (!gpuCanvasContext) {
      console.error('failed to get GPUCanvasContext');
      return false;
    }

    this._gpuCanvasContext = gpuCanvasContext;

    this._adapterLimits = adapter.limits;
    this._adapterInfo = adapter.info;
    this._features = adapter.features;

    this._device = await adapter.requestDevice(this._deviceDescriptor);
    this._queue = this.device.queue;
    this._preferredCanvasFormat = gpu.getPreferredCanvasFormat();

    return true;
  }
}

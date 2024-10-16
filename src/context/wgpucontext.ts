export interface WebGPUContext {
  canvas: HTMLCanvasElement;
  adapter: GPUAdapter;
  device: GPUDevice;
  queue: GPUQueue;
  gpuCanvasContext: GPUCanvasContext;
  preferredCanvasFormat: GPUTextureFormat;
  adapterLimits: GPUSupportedLimits;
  adapterInfo: GPUAdapterInfo;
}

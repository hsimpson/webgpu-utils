export interface WebGPUContext {
  adapter: GPUAdapter | null;
  device: GPUDevice;
  queue: GPUQueue;
  preferredCanvasFormat: GPUTextureFormat;
}

import { WebGPUContext } from './wgpucontext';

export function supportsWebGPU(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (navigator.gpu) {
    return true;
  }
  return false;
}

export async function createContext(
  canvas: HTMLCanvasElement,
  deviceDescriptor?: GPUDeviceDescriptor,
): Promise<WebGPUContext | undefined> {
  const gpu: GPU = navigator.gpu;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!gpu) {
    console.error('No WebGPU support navigator.gpu not available! Navigator: ', navigator);
    return;
  }

  const adapter = await gpu.requestAdapter();
  if (!adapter) {
    console.error('failed to get GPUAdapter, gpu: ', gpu);
    return;
  }

  const gpuCanvasContext = canvas.getContext('webgpu');
  if (!gpuCanvasContext) {
    console.error('failed to get GPUCanvasContext');
    return;
  }

  const device = await adapter.requestDevice(deviceDescriptor);

  return {
    canvas,
    adapter,
    gpuCanvasContext,
    adapterLimits: adapter.limits,
    adapterInfo: adapter.info,
    device,
    queue: device.queue,
    preferredCanvasFormat: gpu.getPreferredCanvasFormat(),
  };
}

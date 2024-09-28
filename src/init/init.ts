import { WebGPUContext } from '../models/wgpucontext';

export function supportsWebGPU(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (navigator.gpu) {
    return true;
  }
  return false;
}

export async function init(
  deviceDescriptor?: GPUDeviceDescriptor,
): Promise<WebGPUContext | undefined> {
  const gpu: GPU = navigator.gpu;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!gpu) {
    console.error('No WebGPU support navigator.gpu not available!');
    return;
  }

  const adapter = await gpu.requestAdapter();
  if (!adapter) {
    console.error('failed to get GPUAdapter');
    return;
  }

  const device = await adapter.requestDevice(deviceDescriptor);

  return {
    adapter,
    device,
    queue: device.queue,
    preferredCanvasFormat: gpu.getPreferredCanvasFormat(),
  };
}

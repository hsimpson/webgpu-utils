import { WebGPUObject, WebGPUObjectProps } from '../objects/webGPUObject';
import { WebGPUBindGroupLayout } from './webGPUBindGroupLayout';

type WebGPUBindGroupProps = WebGPUObjectProps & {
  webGPUBindGroupLayout: WebGPUBindGroupLayout;
  bindGroupEntries?: GPUBindGroupEntry[];
};

export class WebGPUBindGroup extends WebGPUObject {
  private bindGroup?: GPUBindGroup;
  private readonly webGPUBindGroupLayout: WebGPUBindGroupLayout;
  private readonly bindGroupEntries: GPUBindGroupEntry[];

  public constructor(webGPUBindGroupProps: WebGPUBindGroupProps) {
    super({
      ...webGPUBindGroupProps,
      label: webGPUBindGroupProps.label ?? 'webgpu-bind-group',
    });
    this.webGPUBindGroupLayout = webGPUBindGroupProps.webGPUBindGroupLayout;
    this.bindGroupEntries = webGPUBindGroupProps.bindGroupEntries ?? [];
  }

  public addBindGroupEntry(bindGroupEntry: GPUBindGroupEntry) {
    this.bindGroupEntries.push(bindGroupEntry);
  }

  public createBindGroup() {
    this.bindGroup = this.webGPUContext.device.createBindGroup({
      layout: this.webGPUBindGroupLayout.bindGroupLayout,
      entries: this.bindGroupEntries,
    });
  }

  public getRawBindGroup(): GPUBindGroup {
    if (!this.bindGroup) {
      throw new Error('Bind group is not created yet.');
    }
    return this.bindGroup;
  }
}

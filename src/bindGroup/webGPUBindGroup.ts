import { WebGPUObject, WebGPUObjectProps } from '../objects/webGPUObject';
import { WebGPUBindGroupLayout } from './webGPUBindGroupLayout';

type WebGPUBindGroupProps = WebGPUObjectProps & {
  bindGroupLayout: WebGPUBindGroupLayout;
  bindGroupEntries?: GPUBindGroupEntry[];
};

export class WebGPUBindGroup extends WebGPUObject {
  private bindGroup?: GPUBindGroup;
  private readonly bindGroupLayout: WebGPUBindGroupLayout;
  private readonly bindGroupEntries: GPUBindGroupEntry[];

  public constructor(webGPUBindGroupProps: WebGPUBindGroupProps) {
    super({
      ...webGPUBindGroupProps,
      label: webGPUBindGroupProps.label ?? 'webgpu-bind-group',
    });
    this.bindGroupLayout = webGPUBindGroupProps.bindGroupLayout;
    this.bindGroupEntries = webGPUBindGroupProps.bindGroupEntries ?? [];
  }

  public addBindGroupEntry(bindGroupEntry: GPUBindGroupEntry) {
    this.bindGroupEntries.push(bindGroupEntry);
  }

  public createBindGroup() {
    this.bindGroup = this.webGPUContext.device.createBindGroup({
      layout: this.bindGroupLayout.getRawBindGroupLayout(),
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

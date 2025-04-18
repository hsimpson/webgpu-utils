import { WebGPUContext } from '../context/webGPUContext';
import { WebGPUBindGroupLayout } from './webGPUBindGroupLayout';

export class WebGPUBindGroup {
  private readonly _webGPUContext: WebGPUContext;
  private _bindGroup?: GPUBindGroup;
  private _webGPUBindGroupLayout: WebGPUBindGroupLayout;
  private _bindGroupEntries: GPUBindGroupEntry[];

  public constructor(
    webGPUContext: WebGPUContext,
    webGPUBindGroupLayout: WebGPUBindGroupLayout,
    bindGroupEntries?: GPUBindGroupEntry[],
  ) {
    this._webGPUContext = webGPUContext;
    this._webGPUBindGroupLayout = webGPUBindGroupLayout;
    this._bindGroupEntries = bindGroupEntries ?? [];
  }

  public addBindGroupEntry(bindGroupEntry: GPUBindGroupEntry) {
    this._bindGroupEntries.push(bindGroupEntry);
  }

  public createBindGroup() {
    this._bindGroup = this._webGPUContext.device.createBindGroup({
      layout: this._webGPUBindGroupLayout.bindGroupLayout,
      entries: this._bindGroupEntries,
    });
  }

  public get bindGroup(): GPUBindGroup {
    if (!this._bindGroup) {
      throw new Error('Bind group is not created yet.');
    }
    return this._bindGroup;
  }
}

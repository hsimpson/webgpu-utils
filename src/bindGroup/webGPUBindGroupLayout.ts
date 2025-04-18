import { WebGPUContext } from '../context/webGPUContext';

export class WebGPUBindGroupLayout {
  private _webGPUContext: WebGPUContext;
  private _bindGroupLayout?: GPUBindGroupLayout;
  private _bindGroupLayoutEntries: GPUBindGroupLayoutEntry[];

  public constructor(
    webGPUContext: WebGPUContext,
    bindGroupLayoutEntries?: GPUBindGroupLayoutEntry[],
  ) {
    this._webGPUContext = webGPUContext;
    this._bindGroupLayoutEntries = bindGroupLayoutEntries ?? [];
  }

  public addBindGroupLayoutEntry(bindGroupLayoutEntry: GPUBindGroupLayoutEntry) {
    this._bindGroupLayoutEntries.push(bindGroupLayoutEntry);
  }

  public createBindGroupLayout() {
    this._bindGroupLayout = this._webGPUContext.device.createBindGroupLayout({
      entries: this._bindGroupLayoutEntries,
    });
  }

  public get bindGroupLayout(): GPUBindGroupLayout {
    if (!this._bindGroupLayout) {
      throw new Error('Bind group layout has not been created yet.');
    }
    return this._bindGroupLayout;
  }
}

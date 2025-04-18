import { WebGPUBindGroupLayout } from '../bindGroup/webGPUBindGroupLayout';
import { WebGPUContext } from '../context/webGPUContext';

export class WebGPUPipelineLayout {
  private _pipelineLayout?: GPUPipelineLayout;
  private readonly _webGPUContext: WebGPUContext;
  private _webGPUBindGroupLayouts: WebGPUBindGroupLayout[];

  public constructor(
    webGPUContext: WebGPUContext,
    webGPUBindGroupLayouts?: WebGPUBindGroupLayout[],
  ) {
    this._webGPUContext = webGPUContext;
    this._webGPUBindGroupLayouts = webGPUBindGroupLayouts ?? [];
  }

  public createPipelineLayout() {
    this._pipelineLayout = this._webGPUContext.device.createPipelineLayout({
      bindGroupLayouts: this._webGPUBindGroupLayouts.map(layout => layout.bindGroupLayout),
    });
  }

  public get pipelineLayout(): GPUPipelineLayout {
    if (!this._pipelineLayout) {
      throw new Error('Pipeline layout has not been created yet.');
    }
    return this._pipelineLayout;
  }
}

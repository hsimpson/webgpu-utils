import { WebGPUContext } from '../context/webGPUContext';

export class WebGPUShader {
  private _shaderModule!: GPUShaderModule;

  public constructor(private readonly webGPUContext: WebGPUContext) {}

  public get shaderModule(): GPUShaderModule {
    return this._shaderModule;
  }

  public async loadByUrl(url: string): Promise<void> {
    const response = await fetch(url);
    const shaderCode = await response.text();
    this._shaderModule = this.webGPUContext.device.createShaderModule({
      code: shaderCode,
    });
  }

  public loadByCode(code: string) {
    this._shaderModule = this.webGPUContext.device.createShaderModule({
      code,
    });
  }
}

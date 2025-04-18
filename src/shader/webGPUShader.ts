import { WebGPUContext } from '../context/webGPUContext';

export class WebGPUShader {
  private readonly _webGPUContext: WebGPUContext;
  private _shaderModule?: GPUShaderModule;
  private _entryPoint: string = 'main';
  private _sourceCode?: string;
  private _sourceUrl?: URL;

  public constructor(webGPUContext: WebGPUContext, source: URL | string) {
    this._webGPUContext = webGPUContext;
    if (source instanceof URL) {
      this._sourceUrl = source;
    } else {
      this._sourceCode = source;
    }
  }

  public get shaderModule(): GPUShaderModule {
    if (!this._shaderModule) {
      throw new Error('Shader module has not been created yet.');
    }
    return this._shaderModule;
  }

  public get entryPoint(): string {
    return this._entryPoint;
  }

  public set entryPoint(value: string) {
    this._entryPoint = value;
  }

  public async createShaderModule() {
    let sourceCode: string;
    if (this._sourceUrl) {
      sourceCode = await this.loadByUrl(this._sourceUrl.toString());
    } else if (this._sourceCode) {
      sourceCode = this._sourceCode;
    } else {
      throw new Error('Shader source is not provided.');
    }
    this._shaderModule = this._webGPUContext.device.createShaderModule({
      code: sourceCode,
    });
  }

  private async loadByUrl(url: string): Promise<string> {
    const response = await fetch(url);
    const shaderCode = await response.text();
    return shaderCode;
  }
}

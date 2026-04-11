import { WebGPUObject, WebGPUObjectProps } from '../objects/webGPUObject';

type WebGPUShaderProps = WebGPUObjectProps & {
  source: URL | string;
  entryPoint?: string;
};

export class WebGPUShader extends WebGPUObject {
  private shaderModule?: GPUShaderModule;
  private readonly entryPoint: string;
  private sourceCode?: string;
  private sourceUrl?: URL;

  public constructor(webGPUShaderProps: WebGPUShaderProps) {
    super({
      ...webGPUShaderProps,
      label: webGPUShaderProps.label ?? 'webgpu-shader',
    });
    if (webGPUShaderProps.source instanceof URL) {
      this.sourceUrl = webGPUShaderProps.source;
    } else {
      this.sourceCode = webGPUShaderProps.source;
    }
    this.entryPoint = webGPUShaderProps.entryPoint ?? 'main';
  }

  public getEntryPoint(): string {
    return this.entryPoint;
  }

  public getRawShaderModule(): GPUShaderModule {
    if (!this.shaderModule) {
      throw new Error('Shader module has not been created yet.');
    }
    return this.shaderModule;
  }

  public async createShaderModule() {
    let sourceCode: string;
    if (this.sourceUrl) {
      sourceCode = await this.loadByUrl(this.sourceUrl.toString());
    } else if (this.sourceCode) {
      sourceCode = this.sourceCode;
    } else {
      throw new Error('Shader source is not provided.');
    }
    this.shaderModule = this.webGPUContext.device.createShaderModule({
      code: sourceCode,
    });
  }

  private async loadByUrl(url: string): Promise<string> {
    const response = await fetch(url);
    const shaderCode = await response.text();
    return shaderCode;
  }
}

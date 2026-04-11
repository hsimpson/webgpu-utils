import { WebGPUBindGroupLayout } from '../bindGroup/webGPUBindGroupLayout';
import { WebGPUObject, WebGPUObjectProps } from '../objects/webGPUObject';

type WebGPUPipelineLayoutProps = WebGPUObjectProps & {
  webGPUBindGroupLayouts?: WebGPUBindGroupLayout[];
};

export class WebGPUPipelineLayout extends WebGPUObject {
  private pipelineLayout?: GPUPipelineLayout;
  private readonly bindGroupLayouts: WebGPUBindGroupLayout[];

  public constructor(webGPUPipelineLayoutProps: WebGPUPipelineLayoutProps) {
    super({
      ...webGPUPipelineLayoutProps,
      label: webGPUPipelineLayoutProps.label ?? 'webgpu-pipeline-layout',
    });
    this.bindGroupLayouts = webGPUPipelineLayoutProps.webGPUBindGroupLayouts ?? [];
  }

  public addBindGroupLayout(webGPUBindGroupLayout: WebGPUBindGroupLayout) {
    this.bindGroupLayouts.push(webGPUBindGroupLayout);
  }

  public createPipelineLayout() {
    this.pipelineLayout = this.webGPUContext.device.createPipelineLayout({
      bindGroupLayouts: this.bindGroupLayouts.map(layout => layout.bindGroupLayout),
    });
  }

  public getRawPipelineLayout(): GPUPipelineLayout {
    if (!this.pipelineLayout) {
      throw new Error('Pipeline layout has not been created yet.');
    }
    return this.pipelineLayout;
  }
}

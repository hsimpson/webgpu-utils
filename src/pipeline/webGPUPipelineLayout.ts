import { WebGPUBindGroupLayout } from '../bindGroup/webGPUBindGroupLayout';
import { WebGPUObject, WebGPUObjectProps } from '../objects/webGPUObject';

type WebGPUPipelineLayoutProps = WebGPUObjectProps & {
  bindGroupLayouts?: WebGPUBindGroupLayout[];
};

export class WebGPUPipelineLayout extends WebGPUObject {
  private pipelineLayout?: GPUPipelineLayout;
  private readonly bindGroupLayouts: WebGPUBindGroupLayout[];

  public constructor(webGPUPipelineLayoutProps: WebGPUPipelineLayoutProps) {
    super({
      ...webGPUPipelineLayoutProps,
      label: webGPUPipelineLayoutProps.label ?? 'webgpu-pipeline-layout',
    });
    this.bindGroupLayouts = webGPUPipelineLayoutProps.bindGroupLayouts ?? [];
  }

  public addBindGroupLayout(bindGroupLayout: WebGPUBindGroupLayout) {
    this.bindGroupLayouts.push(bindGroupLayout);
  }

  public createPipelineLayout() {
    this.pipelineLayout = this.webGPUContext.device.createPipelineLayout({
      bindGroupLayouts: this.bindGroupLayouts.map(layout => layout.getRawBindGroupLayout()),
    });
  }

  public getRawPipelineLayout(): GPUPipelineLayout {
    if (!this.pipelineLayout) {
      throw new Error(`Pipeline layout '${this.label}' has not been created yet.`);
    }
    return this.pipelineLayout;
  }
}

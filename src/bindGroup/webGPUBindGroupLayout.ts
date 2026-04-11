import { WebGPUObject, WebGPUObjectProps } from '../objects/webGPUObject';

type WebGPUBindGroupLayoutProps = WebGPUObjectProps & {
  bindGroupLayoutEntries?: GPUBindGroupLayoutEntry[];
};
export class WebGPUBindGroupLayout extends WebGPUObject {
  private bindGroupLayout?: GPUBindGroupLayout;
  private bindGroupLayoutEntries: GPUBindGroupLayoutEntry[];

  public constructor(webGPUBindGroupLayoutProps: WebGPUBindGroupLayoutProps) {
    super({
      ...webGPUBindGroupLayoutProps,
      label: webGPUBindGroupLayoutProps.label ?? 'webgpu-bind-group-layout',
    });
    this.bindGroupLayoutEntries = webGPUBindGroupLayoutProps.bindGroupLayoutEntries ?? [];
  }

  public addBindGroupLayoutEntry(bindGroupLayoutEntry: GPUBindGroupLayoutEntry) {
    this.bindGroupLayoutEntries.push(bindGroupLayoutEntry);
  }

  public createBindGroupLayout() {
    this.bindGroupLayout = this.webGPUContext.device.createBindGroupLayout({
      entries: this.bindGroupLayoutEntries,
    });
  }

  public getRawBindGroupLayout(): GPUBindGroupLayout {
    if (!this.bindGroupLayout) {
      throw new Error('Bind group layout has not been created yet.');
    }
    return this.bindGroupLayout;
  }
}

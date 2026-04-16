import { WebGPUObject, WebGPUObjectProps } from '../objects/webGPUObject';
import { WebGPUPipelineLayout } from './webGPUPipelineLayout';

export type WebGPUBasePipelineProps = WebGPUObjectProps & {
  pipelineLayout: WebGPUPipelineLayout;
};

export abstract class WebGPUBasePipeline extends WebGPUObject {
  protected readonly pipelineLayout: WebGPUPipelineLayout;

  public constructor(webGPUBasePipelineProps: WebGPUBasePipelineProps) {
    super({
      ...webGPUBasePipelineProps,
      label: webGPUBasePipelineProps.label ?? 'webgpu-base-pipeline',
    });
    this.pipelineLayout = webGPUBasePipelineProps.pipelineLayout;
  }
}

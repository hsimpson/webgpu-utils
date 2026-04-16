import { WebGPUShader } from '../shader/webGPUShader';
import { WebGPUBasePipeline, WebGPUBasePipelineProps } from './webGPUBasePipeline';

type WebGPUComputePipelineProps = WebGPUBasePipelineProps & {
  computeShader: WebGPUShader;
};

export class WebGPUComputePipeline extends WebGPUBasePipeline {
  private computePipeline?: GPUComputePipeline;
  private readonly computeShader: WebGPUShader;

  public constructor(webGPUComputePipelineProps: WebGPUComputePipelineProps) {
    super({
      ...webGPUComputePipelineProps,
      label: webGPUComputePipelineProps.label ?? 'webgpu-compute-pipeline',
    });
    this.computeShader = webGPUComputePipelineProps.computeShader;
  }

  public createComputePipeline() {
    this.computePipeline = this.webGPUContext.device.createComputePipeline({
      layout: this.pipelineLayout.getRawPipelineLayout(),
      compute: {
        module: this.computeShader.getRawShaderModule(),
        entryPoint: this.computeShader.getEntryPoint(),
      },
    });
  }

  public getRawComputePipeline(): GPUComputePipeline {
    if (!this.computePipeline) {
      throw new Error('Compute pipeline has not been created yet.');
    }
    return this.computePipeline;
  }
}

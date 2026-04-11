import { WebGPUObject, WebGPUObjectProps } from '../objects/webGPUObject';
import { WebGPUShader } from '../shader/webGPUShader';
import { WebGPUPipelineLayout } from './webGPUPipelineLayout';

type WebGPURenderPipelineProps = WebGPUObjectProps & {
  pipelineLayout: WebGPUPipelineLayout;
  vertexShader: WebGPUShader;
  fragmentShader?: WebGPUShader;
};

export class WebGPURenderPipeline extends WebGPUObject {
  private renderPipeLine?: GPURenderPipeline;
  private readonly pipelineLayout: WebGPUPipelineLayout;
  private readonly vertexShader: WebGPUShader;
  private readonly fragmentShader?: WebGPUShader;

  private readonly vertexBufferLayouts: GPUVertexBufferLayout[] = [];
  private readonly colorTargetStates: GPUColorTargetState[] = [];

  private primitiveState?: GPUPrimitiveState;
  private depthStencilState?: GPUDepthStencilState;
  private multisampleState?: GPUMultisampleState;

  public constructor(webGPURenderPipelineProps: WebGPURenderPipelineProps) {
    super({
      ...webGPURenderPipelineProps,
      label: webGPURenderPipelineProps.label ?? 'webgpu-render-pipeline',
    });
    this.pipelineLayout = webGPURenderPipelineProps.pipelineLayout;
    this.vertexShader = webGPURenderPipelineProps.vertexShader;
    this.fragmentShader = webGPURenderPipelineProps.fragmentShader;
  }

  public addVertexBufferLayout(bufferLayout: GPUVertexBufferLayout) {
    this.vertexBufferLayouts.push(bufferLayout);
  }

  public addColorTargetState(colorTargetState: GPUColorTargetState) {
    this.colorTargetStates.push(colorTargetState);
  }

  public setPrimitiveState(primitiveState: GPUPrimitiveState) {
    this.primitiveState = primitiveState;
  }
  public setDepthStencilState(depthStencilState: GPUDepthStencilState) {
    this.depthStencilState = depthStencilState;
  }
  public setMultisampleState(multisampleState: GPUMultisampleState) {
    this.multisampleState = multisampleState;
  }

  public createRenderPipeline() {
    let fragment: GPUFragmentState | undefined;

    if (this.fragmentShader) {
      fragment = {
        module: this.fragmentShader.getRawShaderModule(),
        entryPoint: this.fragmentShader.getEntryPoint(),
        targets: this.colorTargetStates,
      };
    }

    this.renderPipeLine = this.webGPUContext.device.createRenderPipeline({
      layout: this.pipelineLayout.getRawPipelineLayout(),
      vertex: {
        module: this.vertexShader.getRawShaderModule(),
        entryPoint: this.vertexShader.getEntryPoint(),
        buffers: this.vertexBufferLayouts,
      },
      primitive: this.primitiveState,
      depthStencil: this.depthStencilState,
      multisample: this.multisampleState,
      fragment,
      label: this.label,
    });
  }

  public getRawRenderPipeline(): GPURenderPipeline {
    if (!this.renderPipeLine) {
      throw new Error('Render pipeline has not been created yet.');
    }
    return this.renderPipeLine;
  }
}

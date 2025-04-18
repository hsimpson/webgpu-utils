import { WebGPUContext } from '../context/webGPUContext';
import { WebGPUShader } from '../shader/webGPUShader';
import { WebGPUPipelineLayout } from './webGPUPipelineLayout';

export class WebGPURenderPipeline {
  private _renderPipeLine?: GPURenderPipeline;
  private readonly _webGPUContext: WebGPUContext;
  private readonly _webGPUPipelineLayout: WebGPUPipelineLayout;
  private readonly _vertexShader: WebGPUShader;
  private readonly _fragmentShader?: WebGPUShader;

  private _vertexBufferLayouts: GPUVertexBufferLayout[] = [];
  private _colorTargetStates: GPUColorTargetState[] = [];

  private _primitiveState?: GPUPrimitiveState;
  private _depthStencilState?: GPUDepthStencilState;
  private _multisampleState?: GPUMultisampleState;

  public constructor(
    webGPUContext: WebGPUContext,
    webGPUPipelineLayout: WebGPUPipelineLayout,
    vertexShader: WebGPUShader,
    fragmentShader?: WebGPUShader,
  ) {
    this._webGPUContext = webGPUContext;
    this._webGPUPipelineLayout = webGPUPipelineLayout;
    this._vertexShader = vertexShader;
    this._fragmentShader = fragmentShader;
  }

  public addVertexBufferLayout(bufferLayout: GPUVertexBufferLayout) {
    this._vertexBufferLayouts.push(bufferLayout);
  }

  public addColorTargetState(colorTargetState: GPUColorTargetState) {
    this._colorTargetStates.push(colorTargetState);
  }

  public setPrimitiveState(primitiveState: GPUPrimitiveState) {
    this._primitiveState = primitiveState;
  }
  public setDepthStencilState(depthStencilState: GPUDepthStencilState) {
    this._depthStencilState = depthStencilState;
  }
  public setMultisampleState(multisampleState: GPUMultisampleState) {
    this._multisampleState = multisampleState;
  }

  public createRenderPipeline() {
    let fragment: GPUFragmentState | undefined;

    if (this._fragmentShader) {
      fragment = {
        module: this._fragmentShader.shaderModule,
        entryPoint: this._fragmentShader.entryPoint,
        targets: this._colorTargetStates,
      };
    }

    this._renderPipeLine = this._webGPUContext.device.createRenderPipeline({
      layout: this._webGPUPipelineLayout.pipelineLayout,
      vertex: {
        module: this._vertexShader.shaderModule,
        entryPoint: this._vertexShader.entryPoint,
        buffers: this._vertexBufferLayouts,
      },
      primitive: this._primitiveState,
      depthStencil: this._depthStencilState,
      multisample: this._multisampleState,
      fragment,
    });
  }

  public get renderPipeLine(): GPURenderPipeline {
    if (!this._renderPipeLine) {
      throw new Error('Render pipeline has not been created yet.');
    }
    return this._renderPipeLine;
  }
}

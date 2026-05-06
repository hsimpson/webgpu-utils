import { afterEach, describe, expect, it, vi } from 'vitest';
import { WebGPUContext } from '../context/webGPUContext';
import { WebGPUShader } from '../shader/webGPUShader';
import { WebGPUPipelineLayout } from './webGPUPipelineLayout';
import { WebGPURenderPipeline } from './webGPURenderPipeline';

describe('WebGPURenderPipeline', () => {
  const mockRenderPipeline = {} as GPURenderPipeline;
  const mockPipelineLayout = {} as GPUPipelineLayout;
  const mockShaderModule = {} as GPUShaderModule;

  const webGPUContext: WebGPUContext = {
    device: {
      createRenderPipeline: (_descriptor: GPURenderPipelineDescriptor) => mockRenderPipeline,
    },
  } as unknown as WebGPUContext;

  const pipelineLayout = {
    getRawPipelineLayout: () => mockPipelineLayout,
  } as unknown as WebGPUPipelineLayout;

  const vertexShader = {
    getRawShaderModule: () => mockShaderModule,
    getEntryPoint: () => 'vs_main',
  } as unknown as WebGPUShader;

  const fragmentShader = {
    getRawShaderModule: () => mockShaderModule,
    getEntryPoint: () => 'fs_main',
  } as unknown as WebGPUShader;

  const createRenderPipelineSpy = vi.spyOn(webGPUContext.device, 'createRenderPipeline');

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create with default label', () => {
    const pipeline = new WebGPURenderPipeline({ webGPUContext, pipelineLayout, vertexShader });
    expect(pipeline).toBeDefined();
  });

  it('should create with custom label', () => {
    const pipeline = new WebGPURenderPipeline({
      webGPUContext,
      pipelineLayout,
      vertexShader,
      label: 'my-render-pipeline',
    });
    expect(pipeline).toBeDefined();
  });

  it('should create render pipeline without fragment shader', () => {
    const pipeline = new WebGPURenderPipeline({ webGPUContext, pipelineLayout, vertexShader });
    pipeline.createRenderPipeline();

    expect(createRenderPipelineSpy).toHaveBeenCalledWith({
      layout: mockPipelineLayout,
      vertex: {
        module: mockShaderModule,
        entryPoint: 'vs_main',
        buffers: [],
      },
      primitive: undefined,
      depthStencil: undefined,
      multisample: undefined,
      fragment: undefined,
      label: 'webgpu-render-pipeline',
    });
  });

  it('should create render pipeline with fragment shader', () => {
    const pipeline = new WebGPURenderPipeline({
      webGPUContext,
      pipelineLayout,
      vertexShader,
      fragmentShader,
    });
    pipeline.createRenderPipeline();

    expect(createRenderPipelineSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        fragment: {
          module: mockShaderModule,
          entryPoint: 'fs_main',
          targets: [],
        },
      }),
    );
  });

  it('should add a vertex buffer layout', () => {
    const pipeline = new WebGPURenderPipeline({ webGPUContext, pipelineLayout, vertexShader });
    const bufferLayout: GPUVertexBufferLayout = { arrayStride: 16, attributes: [] };
    pipeline.addVertexBufferLayout(bufferLayout);
    pipeline.createRenderPipeline();

    expect(createRenderPipelineSpy).toHaveBeenCalledWith({
      layout: mockPipelineLayout,
      vertex: {
        module: mockShaderModule,
        entryPoint: 'vs_main',
        buffers: [bufferLayout],
      },
      primitive: undefined,
      depthStencil: undefined,
      multisample: undefined,
      fragment: undefined,
      label: 'webgpu-render-pipeline',
    });
  });

  it('should add a color target state', () => {
    const pipeline = new WebGPURenderPipeline({
      webGPUContext,
      pipelineLayout,
      vertexShader,
      fragmentShader,
    });
    const colorTarget: GPUColorTargetState = { format: 'bgra8unorm' };
    pipeline.addColorTargetState(colorTarget);
    pipeline.createRenderPipeline();

    expect(createRenderPipelineSpy).toHaveBeenCalledWith({
      layout: mockPipelineLayout,
      vertex: {
        module: mockShaderModule,
        entryPoint: 'vs_main',
        buffers: [],
      },
      primitive: undefined,
      depthStencil: undefined,
      multisample: undefined,
      fragment: {
        module: mockShaderModule,
        entryPoint: 'fs_main',
        targets: [colorTarget],
      },
      label: 'webgpu-render-pipeline',
    });
  });

  it('should set primitive state', () => {
    const pipeline = new WebGPURenderPipeline({ webGPUContext, pipelineLayout, vertexShader });
    const primitiveState: GPUPrimitiveState = { topology: 'triangle-list' };
    pipeline.setPrimitiveState(primitiveState);
    pipeline.createRenderPipeline();

    expect(createRenderPipelineSpy).toHaveBeenCalledWith(
      expect.objectContaining({ primitive: primitiveState }),
    );
  });

  it('should set depth stencil state', () => {
    const pipeline = new WebGPURenderPipeline({ webGPUContext, pipelineLayout, vertexShader });
    const depthStencilState: GPUDepthStencilState = {
      format: 'depth24plus',
      depthWriteEnabled: true,
      depthCompare: 'less',
    };
    pipeline.setDepthStencilState(depthStencilState);
    pipeline.createRenderPipeline();

    expect(createRenderPipelineSpy).toHaveBeenCalledWith(
      expect.objectContaining({ depthStencil: depthStencilState }),
    );
  });

  it('should set multisample state', () => {
    const pipeline = new WebGPURenderPipeline({ webGPUContext, pipelineLayout, vertexShader });
    const multisampleState: GPUMultisampleState = { count: 4 };
    pipeline.setMultisampleState(multisampleState);
    pipeline.createRenderPipeline();

    expect(createRenderPipelineSpy).toHaveBeenCalledWith(
      expect.objectContaining({ multisample: multisampleState }),
    );
  });

  it('should return raw render pipeline after creation', () => {
    const pipeline = new WebGPURenderPipeline({ webGPUContext, pipelineLayout, vertexShader });
    pipeline.createRenderPipeline();

    expect(pipeline.getRawRenderPipeline()).toBe(mockRenderPipeline);
  });

  it('should throw if getRawRenderPipeline is called before creation', () => {
    const pipeline = new WebGPURenderPipeline({ webGPUContext, pipelineLayout, vertexShader });

    expect(() => pipeline.getRawRenderPipeline()).toThrow(
      'Render pipeline has not been created yet.',
    );
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { WebGPUContext } from '../context/webGPUContext';
import { WebGPUShader } from '../shader/webGPUShader';
import { WebGPUComputePipeline } from './webGPUComputePipeline';
import { WebGPUPipelineLayout } from './webGPUPipelineLayout';

describe('WebGPUComputePipeline', () => {
  const mockComputePipeline = {} as GPUComputePipeline;
  const mockPipelineLayout = {} as GPUPipelineLayout;
  const mockShaderModule = {} as GPUShaderModule;

  const webGPUContext: WebGPUContext = {
    device: {
      createComputePipeline: (_descriptor: GPUComputePipelineDescriptor) => mockComputePipeline,
    },
  } as unknown as WebGPUContext;

  const pipelineLayout = {
    getRawPipelineLayout: () => mockPipelineLayout,
  } as unknown as WebGPUPipelineLayout;

  const computeShader = {
    getRawShaderModule: () => mockShaderModule,
    getEntryPoint: () => 'main',
  } as unknown as WebGPUShader;

  const createComputePipelineSpy = vi.spyOn(webGPUContext.device, 'createComputePipeline');

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create with default label', () => {
    const pipeline = new WebGPUComputePipeline({ webGPUContext, pipelineLayout, computeShader });
    expect(pipeline).toBeDefined();
  });

  it('should create with custom label', () => {
    const pipeline = new WebGPUComputePipeline({
      webGPUContext,
      pipelineLayout,
      computeShader,
      label: 'my-compute-pipeline',
    });
    expect(pipeline).toBeDefined();
  });

  it('should create compute pipeline', () => {
    const pipeline = new WebGPUComputePipeline({ webGPUContext, pipelineLayout, computeShader });
    pipeline.createComputePipeline();

    expect(createComputePipelineSpy).toHaveBeenCalledWith({
      layout: mockPipelineLayout,
      compute: {
        module: mockShaderModule,
        entryPoint: 'main',
      },
    });
  });

  it('should return raw compute pipeline after creation', () => {
    const pipeline = new WebGPUComputePipeline({ webGPUContext, pipelineLayout, computeShader });
    pipeline.createComputePipeline();

    expect(pipeline.getRawComputePipeline()).toBe(mockComputePipeline);
  });

  it('should throw if getRawComputePipeline is called before creation', () => {
    const pipeline = new WebGPUComputePipeline({ webGPUContext, pipelineLayout, computeShader });

    expect(() => pipeline.getRawComputePipeline()).toThrow(
      'Compute pipeline has not been created yet.',
    );
  });
});

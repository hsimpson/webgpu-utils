import { afterEach, describe, expect, it, vi } from 'vitest';
import { WebGPUBindGroupLayout } from '../bindGroup/webGPUBindGroupLayout';
import { WebGPUContext } from '../context/webGPUContext';
import { WebGPUPipelineLayout } from './webGPUPipelineLayout';

describe('WebGPUPipelineLayout', () => {
  const mockPipelineLayout = {} as GPUPipelineLayout;
  const mockGPUBindGroupLayout = {} as GPUBindGroupLayout;

  const webGPUContext: WebGPUContext = {
    device: {
      createPipelineLayout: (_descriptor: GPUPipelineLayoutDescriptor) => mockPipelineLayout,
    },
  } as unknown as WebGPUContext;

  const bindGroupLayout = {
    getRawBindGroupLayout: () => mockGPUBindGroupLayout,
  } as unknown as WebGPUBindGroupLayout;

  const createPipelineLayoutSpy = vi.spyOn(webGPUContext.device, 'createPipelineLayout');

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create with default label', () => {
    const layout = new WebGPUPipelineLayout({ webGPUContext });
    expect(layout).toBeDefined();
  });

  it('should create with custom label', () => {
    const layout = new WebGPUPipelineLayout({ webGPUContext, label: 'my-layout' });
    expect(layout).toBeDefined();
  });

  it('should create pipeline layout with no layouts by default', () => {
    const layout = new WebGPUPipelineLayout({ webGPUContext });
    layout.createPipelineLayout();

    expect(createPipelineLayoutSpy).toHaveBeenCalledWith({ bindGroupLayouts: [] });
  });

  it('should create with initial bindGroupLayouts', () => {
    const layout = new WebGPUPipelineLayout({
      webGPUContext,
      bindGroupLayouts: [bindGroupLayout],
    });
    layout.createPipelineLayout();

    expect(createPipelineLayoutSpy).toHaveBeenCalledWith({
      bindGroupLayouts: [mockGPUBindGroupLayout],
    });
  });

  it('should add a bind group layout', () => {
    const layout = new WebGPUPipelineLayout({ webGPUContext });
    layout.addBindGroupLayout(bindGroupLayout);
    layout.createPipelineLayout();

    expect(createPipelineLayoutSpy).toHaveBeenCalledWith({
      bindGroupLayouts: [mockGPUBindGroupLayout],
    });
  });

  it('should return the raw pipeline layout after creation', () => {
    const layout = new WebGPUPipelineLayout({ webGPUContext });
    layout.createPipelineLayout();

    expect(layout.getRawPipelineLayout()).toBe(mockPipelineLayout);
  });

  it('should throw if getRawPipelineLayout is called before creation', () => {
    const layout = new WebGPUPipelineLayout({ webGPUContext });

    expect(() => layout.getRawPipelineLayout()).toThrow(
      "Pipeline layout 'webgpu-pipeline-layout' has not been created yet.",
    );
  });

  it('should throw with custom label if getRawPipelineLayout is called before creation', () => {
    const layout = new WebGPUPipelineLayout({ webGPUContext, label: 'my-layout' });

    expect(() => layout.getRawPipelineLayout()).toThrow(
      "Pipeline layout 'my-layout' has not been created yet.",
    );
  });
});

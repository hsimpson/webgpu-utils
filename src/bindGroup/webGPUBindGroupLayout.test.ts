import { afterEach, describe, expect, it, vi } from 'vitest';
import { WebGPUContext } from '../context/webGPUContext';
import { WebGPUBindGroupLayout } from './webGPUBindGroupLayout';

describe('WebGPUBindGroupLayout', () => {
  const mockBindGroupLayout = {} as GPUBindGroupLayout;

  const webGPUContext: WebGPUContext = {
    device: {
      createBindGroupLayout: (_descriptor: GPUBindGroupLayoutDescriptor) => mockBindGroupLayout,
    },
  } as unknown as WebGPUContext;

  const createBindGroupLayoutSpy = vi.spyOn(webGPUContext.device, 'createBindGroupLayout');

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create with default label', () => {
    const layout = new WebGPUBindGroupLayout({ webGPUContext });
    expect(layout).toBeDefined();
  });

  it('should create with custom label', () => {
    const layout = new WebGPUBindGroupLayout({ webGPUContext, label: 'my-layout' });
    expect(layout).toBeDefined();
  });

  it('should create with initial bindGroupLayoutEntries', () => {
    const entries: GPUBindGroupLayoutEntry[] = [
      { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
    ];
    const layout = new WebGPUBindGroupLayout({ webGPUContext, bindGroupLayoutEntries: entries });
    layout.createBindGroupLayout();

    expect(createBindGroupLayoutSpy).toHaveBeenCalledWith({ entries });
  });

  it('should add a bindGroupLayoutEntry', () => {
    const layout = new WebGPUBindGroupLayout({ webGPUContext });
    const entry: GPUBindGroupLayoutEntry = {
      binding: 0,
      visibility: GPUShaderStage.FRAGMENT,
      texture: {},
    };

    layout.addBindGroupLayoutEntry(entry);
    layout.createBindGroupLayout();

    expect(createBindGroupLayoutSpy).toHaveBeenCalledWith({ entries: [entry] });
  });

  it('should add multiple bindGroupLayoutEntries', () => {
    const layout = new WebGPUBindGroupLayout({ webGPUContext });
    const entry0: GPUBindGroupLayoutEntry = {
      binding: 0,
      visibility: GPUShaderStage.VERTEX,
      buffer: { type: 'uniform' },
    };
    const entry1: GPUBindGroupLayoutEntry = {
      binding: 1,
      visibility: GPUShaderStage.FRAGMENT,
      sampler: {},
    };

    layout.addBindGroupLayoutEntry(entry0);
    layout.addBindGroupLayoutEntry(entry1);
    layout.createBindGroupLayout();

    expect(createBindGroupLayoutSpy).toHaveBeenCalledWith({ entries: [entry0, entry1] });
  });

  it('should return the raw bind group layout after creation', () => {
    const layout = new WebGPUBindGroupLayout({ webGPUContext });
    layout.createBindGroupLayout();

    expect(layout.getRawBindGroupLayout()).toBe(mockBindGroupLayout);
  });

  it('should throw if getRawBindGroupLayout is called before creation', () => {
    const layout = new WebGPUBindGroupLayout({ webGPUContext });

    expect(() => layout.getRawBindGroupLayout()).toThrow(
      'Bind group layout has not been created yet.',
    );
  });

  it('should call device.createBindGroupLayout with no entries by default', () => {
    const layout = new WebGPUBindGroupLayout({ webGPUContext });
    layout.createBindGroupLayout();

    expect(createBindGroupLayoutSpy).toHaveBeenCalledWith({ entries: [] });
  });
});

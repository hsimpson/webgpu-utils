import { afterEach, describe, expect, it, vi } from 'vitest';
import { WebGPUContext } from '../context/webGPUContext';
import { WebGPUBindGroup } from './webGPUBindGroup';
import { WebGPUBindGroupLayout } from './webGPUBindGroupLayout';

describe('WebGPUBindGroup', () => {
  const mockGPUBindGroup = {} as GPUBindGroup;
  const mockGPUBindGroupLayout = {} as GPUBindGroupLayout;

  const webGPUContext: WebGPUContext = {
    device: {
      createBindGroup: (_descriptor: GPUBindGroupDescriptor) => mockGPUBindGroup,
    },
  } as unknown as WebGPUContext;

  const bindGroupLayout = {
    getRawBindGroupLayout: () => mockGPUBindGroupLayout,
  } as unknown as WebGPUBindGroupLayout;

  const createBindGroupSpy = vi.spyOn(webGPUContext.device, 'createBindGroup');

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create with default label', () => {
    const bindGroup = new WebGPUBindGroup({ webGPUContext, bindGroupLayout });
    expect(bindGroup).toBeDefined();
  });

  it('should create with custom label', () => {
    const bindGroup = new WebGPUBindGroup({
      webGPUContext,
      bindGroupLayout,
      label: 'my-bind-group',
    });
    expect(bindGroup).toBeDefined();
  });

  it('should create bind group with no entries by default', () => {
    const bindGroup = new WebGPUBindGroup({ webGPUContext, bindGroupLayout });
    bindGroup.createBindGroup();

    expect(createBindGroupSpy).toHaveBeenCalledWith({
      layout: mockGPUBindGroupLayout,
      entries: [],
    });
  });

  it('should create bind group with initial entries', () => {
    const entries: GPUBindGroupEntry[] = [{ binding: 0, resource: { buffer: {} as GPUBuffer } }];
    const bindGroup = new WebGPUBindGroup({
      webGPUContext,
      bindGroupLayout,
      bindGroupEntries: entries,
    });
    bindGroup.createBindGroup();

    expect(createBindGroupSpy).toHaveBeenCalledWith({
      layout: mockGPUBindGroupLayout,
      entries,
    });
  });

  it('should add a bind group entry', () => {
    const bindGroup = new WebGPUBindGroup({ webGPUContext, bindGroupLayout });
    const entry: GPUBindGroupEntry = { binding: 0, resource: { buffer: {} as GPUBuffer } };

    bindGroup.addBindGroupEntry(entry);
    bindGroup.createBindGroup();

    expect(createBindGroupSpy).toHaveBeenCalledWith({
      layout: mockGPUBindGroupLayout,
      entries: [entry],
    });
  });

  it('should add multiple bind group entries', () => {
    const bindGroup = new WebGPUBindGroup({ webGPUContext, bindGroupLayout });
    const entry0: GPUBindGroupEntry = { binding: 0, resource: { buffer: {} as GPUBuffer } };
    const entry1: GPUBindGroupEntry = { binding: 1, resource: {} as GPUSampler };

    bindGroup.addBindGroupEntry(entry0);
    bindGroup.addBindGroupEntry(entry1);
    bindGroup.createBindGroup();

    expect(createBindGroupSpy).toHaveBeenCalledWith({
      layout: mockGPUBindGroupLayout,
      entries: [entry0, entry1],
    });
  });

  it('should return the raw bind group after creation', () => {
    const bindGroup = new WebGPUBindGroup({ webGPUContext, bindGroupLayout });
    bindGroup.createBindGroup();

    expect(bindGroup.getRawBindGroup()).toBe(mockGPUBindGroup);
  });

  it('should throw if getRawBindGroup is called before creation', () => {
    const bindGroup = new WebGPUBindGroup({ webGPUContext, bindGroupLayout });

    expect(() => bindGroup.getRawBindGroup()).toThrow('Bind group is not created yet.');
  });
});

import { describe, expect, it } from 'vitest';
import { WebGPUContext } from '../context/webGPUContext';
import { WebGPUObject } from './webGPUObject';

// Concrete subclass to instantiate the class under test
class TestWebGPUObject extends WebGPUObject {}

describe('WebGPUObject', () => {
  const webGPUContext = {} as unknown as WebGPUContext;

  it('should create an instance with a context and label', () => {
    const label = 'test-object';
    const obj = new TestWebGPUObject({ webGPUContext, label });

    expect(obj).toBeDefined();
  });

  it('should store the webGPUContext', () => {
    const obj = new TestWebGPUObject({ webGPUContext });

    // Access via type assertion to test the protected property
    expect((obj as unknown as { webGPUContext: WebGPUContext }).webGPUContext).toBe(webGPUContext);
  });

  it('should store the label when provided', () => {
    const label = 'my-label';
    const obj = new TestWebGPUObject({ webGPUContext, label });

    expect((obj as unknown as { label: string }).label).toBe(label);
  });

  it('should have an undefined label when not provided', () => {
    const obj = new TestWebGPUObject({ webGPUContext });

    expect((obj as unknown as { label: string | undefined }).label).toBeUndefined();
  });
});

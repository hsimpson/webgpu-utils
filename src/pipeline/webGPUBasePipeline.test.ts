import { describe, expect, it } from 'vitest';
import { WebGPUContext } from '../context/webGPUContext';
import { WebGPUBasePipeline, WebGPUBasePipelineProps } from './webGPUBasePipeline';
import { WebGPUPipelineLayout } from './webGPUPipelineLayout';

// Concrete subclass to instantiate the abstract class under test
class TestWebGPUBasePipeline extends WebGPUBasePipeline {
  public constructor(props: WebGPUBasePipelineProps) {
    super(props);
  }
}

describe('WebGPUBasePipeline', () => {
  const webGPUContext = {} as unknown as WebGPUContext;
  const pipelineLayout = {} as unknown as WebGPUPipelineLayout;

  it('should create with default label', () => {
    const pipeline = new TestWebGPUBasePipeline({ webGPUContext, pipelineLayout });
    expect(pipeline).toBeDefined();
  });

  it('should create with custom label', () => {
    const pipeline = new TestWebGPUBasePipeline({
      webGPUContext,
      pipelineLayout,
      label: 'my-base-pipeline',
    });
    expect(pipeline).toBeDefined();
  });

  it('should store the pipeline layout', () => {
    const pipeline = new TestWebGPUBasePipeline({ webGPUContext, pipelineLayout });

    expect((pipeline as unknown as { pipelineLayout: WebGPUPipelineLayout }).pipelineLayout).toBe(
      pipelineLayout,
    );
  });
});

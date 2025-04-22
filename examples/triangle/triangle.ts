import { vec3 } from 'wgpu-matrix';
import {
  BufferDataTypeKind,
  Camera,
  CameraControls,
  ScalarType,
  WebGPUBindGroup,
  WebGPUBindGroupLayout,
  WebGPUBuffer,
  WebGPUContext,
  WebGPUPipelineLayout,
  WebGPURenderPipeline,
  WebGPUShader,
} from '../../dist/';

/*
          C
          /\
         /  \
        /    \
       /      \
    B /________\ A
*/

const POSITIONS = new Float32Array([
  // A
  1.0, -1.0, 0.0,
  // B
  -1.0, -1.0, 0.0,
  // C
  0.0, 1.0, 0.0,
]);

const COLORS = new Float32Array([
  // A (red)
  1.0, 0.0, 0.0, 1.0,
  // B (green)
  0.0, 1.0, 0.0, 1.0,
  // C (blue)
  0.0, 0.0, 1.0, 1.0,
]);

const INDICES = new Uint16Array([0, 1, 2, 0]);

class TriangleRenderer {
  private webGPUContext!: WebGPUContext;
  private camera!: Camera;
  private depthTargetView!: GPUTextureView;
  private renderPipeLine!: WebGPURenderPipeline;

  private uniformBuffer!: WebGPUBuffer;
  private positionsBuffer!: WebGPUBuffer;
  private colorsBuffer!: WebGPUBuffer;
  private indicesBuffer!: WebGPUBuffer;
  private uniformBindGroup!: WebGPUBindGroup;

  private async initialization() {
    // get the canvas element
    const canvas = document.getElementById('webgpu_canvas') as HTMLCanvasElement;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // create a webgpu context
    this.webGPUContext = new WebGPUContext(canvas);
    const result = await this.webGPUContext.create();

    if (!result) {
      console.error('Failed to create WebGPU context');
      return;
    }

    // size of canvas
    const presentationSize = { width: canvas.width, height: canvas.height };

    // configure the presentation context
    this.webGPUContext.gpuCanvasContext.configure({
      device: this.webGPUContext.device,
      format: this.webGPUContext.preferredCanvasFormat,
      alphaMode: 'opaque',
    });

    // create a camera
    this.camera = new Camera(45, presentationSize.width / presentationSize.height, 0.1, 1000);
    this.camera.translate(vec3.create(0, 0, 5));
    new CameraControls(canvas, this.camera);

    // create a depth target
    const depthTarget = this.webGPUContext.device.createTexture({
      size: presentationSize,
      format: 'depth24plus-stencil8',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.depthTargetView = depthTarget.createView();

    // create a uniform buffer to hold camera data
    this.uniformBuffer = new WebGPUBuffer(
      this.webGPUContext,
      GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      'uniform-buffer',
    );
    this.uniformBuffer.setData('model-matrix', {
      data: this.camera.modelMatrix,
      dataType: { elementType: ScalarType.Float32, bufferDataTypeKind: BufferDataTypeKind.Mat4x4 },
    });
    this.uniformBuffer.setData('view-matrix', {
      data: this.camera.viewMatrix,
      dataType: { elementType: ScalarType.Float32, bufferDataTypeKind: BufferDataTypeKind.Mat4x4 },
    });
    this.uniformBuffer.setData('projection-matrix', {
      data: this.camera.projectionMatrix,
      dataType: { elementType: ScalarType.Float32, bufferDataTypeKind: BufferDataTypeKind.Mat4x4 },
    });
    this.uniformBuffer.writeBuffer();

    // create buffers for the triangle
    this.positionsBuffer = new WebGPUBuffer(
      this.webGPUContext,
      GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      'positions-buffer',
    );
    this.positionsBuffer.setData('positions', {
      data: POSITIONS,
      dataType: { elementType: ScalarType.Float32, bufferDataTypeKind: BufferDataTypeKind.Array },
    });
    this.positionsBuffer.writeBuffer();

    this.colorsBuffer = new WebGPUBuffer(
      this.webGPUContext,
      GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      'colors-buffer',
    );
    this.colorsBuffer.setData('colors', {
      data: COLORS,
      dataType: { elementType: ScalarType.Float32, bufferDataTypeKind: BufferDataTypeKind.Array },
    });
    this.colorsBuffer.writeBuffer();

    this.indicesBuffer = new WebGPUBuffer(
      this.webGPUContext,
      GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      'indices-buffer',
    );
    this.indicesBuffer.setData('indices', {
      data: INDICES,
      dataType: { elementType: ScalarType.Uint16, bufferDataTypeKind: BufferDataTypeKind.Array },
    });
    this.indicesBuffer.writeBuffer();

    // load shaders
    const vertexShader = new WebGPUShader(
      this.webGPUContext,
      new URL('shaders/triangle.vert.wgsl', window.location.href),
    );
    await vertexShader.createShaderModule();

    const fragmentShader = new WebGPUShader(
      this.webGPUContext,
      new URL('shaders/triangle.frag.wgsl', window.location.href),
    );
    await fragmentShader.createShaderModule();

    const uniformBindGroupLayout = new WebGPUBindGroupLayout(this.webGPUContext, [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {
          type: 'uniform',
        },
      },
    ]);
    uniformBindGroupLayout.createBindGroupLayout();

    this.uniformBindGroup = new WebGPUBindGroup(this.webGPUContext, uniformBindGroupLayout, [
      {
        binding: 0,
        resource: {
          buffer: this.uniformBuffer.getRawBuffer(),
        },
      },
    ]);
    this.uniformBindGroup.createBindGroup();

    const webGPUPipelineLayout = new WebGPUPipelineLayout(this.webGPUContext, [
      uniformBindGroupLayout,
    ]);
    webGPUPipelineLayout.createPipelineLayout();

    this.renderPipeLine = new WebGPURenderPipeline(
      this.webGPUContext,
      webGPUPipelineLayout,
      vertexShader,
      fragmentShader,
    );
    this.renderPipeLine.addVertexBufferLayout({
      arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
      stepMode: 'vertex',
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: 'float32x3',
        },
      ],
    });
    this.renderPipeLine.addVertexBufferLayout({
      arrayStride: 4 * Float32Array.BYTES_PER_ELEMENT,
      stepMode: 'vertex',
      attributes: [
        {
          shaderLocation: 1,
          offset: 0,
          format: 'float32x4',
        },
      ],
    });
    this.renderPipeLine.addColorTargetState({
      format: 'bgra8unorm',
      blend: {
        alpha: {
          srcFactor: 'src-alpha',
          dstFactor: 'one-minus-src-alpha',
          operation: 'add',
        },
        color: {
          srcFactor: 'src-alpha',
          dstFactor: 'one-minus-src-alpha',
          operation: 'add',
        },
      },
      writeMask: GPUColorWrite.ALL,
    });
    this.renderPipeLine.setPrimitiveState({
      topology: 'triangle-list',
      frontFace: 'cw',
      cullMode: 'none',
    });
    this.renderPipeLine.setDepthStencilState({
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus-stencil8',
    });

    this.renderPipeLine.createRenderPipeline();
  }

  // the render loop
  private render = () => {
    const rotation = (0.5 * Math.PI) / 180;
    this.camera.rotateZ(rotation);

    this.uniformBuffer.writeBuffer();

    const colorAttachment: GPURenderPassColorAttachment = {
      view: this.webGPUContext.gpuCanvasContext.getCurrentTexture().createView(),
      clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
      loadOp: 'clear',
      storeOp: 'store',
    };

    const depthAttachment: GPURenderPassDepthStencilAttachment = {
      view: this.depthTargetView,

      depthLoadOp: 'clear',
      depthClearValue: 1.0,
      depthStoreOp: 'store',

      stencilLoadOp: 'clear',
      stencilClearValue: 0,
      stencilStoreOp: 'store',
    };

    const renderPassDesc: GPURenderPassDescriptor = {
      colorAttachments: [colorAttachment],
      depthStencilAttachment: depthAttachment,
    };

    const commandEncoder = this.webGPUContext.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginRenderPass(renderPassDesc);
    passEncoder.setPipeline(this.renderPipeLine.renderPipeLine);
    passEncoder.setBindGroup(0, this.uniformBindGroup.bindGroup);
    passEncoder.setViewport(
      0,
      0,
      this.webGPUContext.canvas.width,
      this.webGPUContext.canvas.height,
      0,
      1,
    );
    passEncoder.setScissorRect(
      0,
      0,
      this.webGPUContext.canvas.width,
      this.webGPUContext.canvas.height,
    );
    passEncoder.setVertexBuffer(0, this.positionsBuffer.getRawBuffer());
    passEncoder.setVertexBuffer(1, this.colorsBuffer.getRawBuffer());
    passEncoder.setIndexBuffer(this.indicesBuffer.getRawBuffer(), 'uint16');
    passEncoder.drawIndexed(3, 1, 0, 0, 0);
    passEncoder.end();
    this.webGPUContext.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(this.render);
  };

  public async start() {
    await this.initialization();
    this.render();
  }
}

const renderer = new TriangleRenderer();
void renderer.start();

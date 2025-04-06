import {
  BufferDataTypeKind,
  Camera,
  CameraControls,
  ScalarType,
  WebGPUBuffer,
  WebGPUContext,
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

const INDICES = new Uint32Array([0, 1, 2, 0]);

class TriangleRenderer {
  private webGPUContext!: WebGPUContext;
  private camera!: Camera;
  private renderTargetView!: GPUTextureView;
  private depthTargetView!: GPUTextureView;
  private renderPipeLine!: GPURenderPipeline;

  private positionsBuffer!: WebGPUBuffer;
  private colorsBuffer!: WebGPUBuffer;
  private indicesBuffer!: WebGPUBuffer;
  private uniformBindGroup!: GPUBindGroup;

  private async initalization() {
    // get the canvas element
    const canvas = document.getElementById('webgpu_canvas') as HTMLCanvasElement;

    // create a webgpu context
    this.webGPUContext = new WebGPUContext(canvas);
    const result = await this.webGPUContext.create();

    if (!result) {
      console.error('Failed to create WebGPU context');
      return;
    }

    // size of canvas
    const presentationSize = { width: canvas.width, height: canvas.height };

    // configure the presenation context
    this.webGPUContext.gpuCanvasContext.configure({
      device: this.webGPUContext.device,
      format: this.webGPUContext.preferredCanvasFormat,
      alphaMode: 'opaque',
    });

    // create a camera
    this.camera = new Camera(45, presentationSize.width / presentationSize.height, 0.1, 1000);
    new CameraControls(canvas, this.camera);

    // create a render target
    const renderTarget = this.webGPUContext.device.createTexture({
      size: presentationSize,
      format: this.webGPUContext.preferredCanvasFormat,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.renderTargetView = renderTarget.createView();

    // create a depth target
    const depthTarget = this.webGPUContext.device.createTexture({
      size: presentationSize,
      format: 'depth24plus-stencil8',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.depthTargetView = depthTarget.createView();

    // create a uniform buffer to hold camera data
    const uniformBuffer = new WebGPUBuffer(
      this.webGPUContext,
      GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      'uniform-buffer',
    );
    uniformBuffer.setData('model-matrix', {
      data: this.camera.modelMatrix,
      dataType: { elementType: ScalarType.Float32, bufferDataTypeKind: BufferDataTypeKind.Mat4x4 },
    });
    uniformBuffer.setData('view-matrix', {
      data: this.camera.viewMatrix,
      dataType: { elementType: ScalarType.Float32, bufferDataTypeKind: BufferDataTypeKind.Mat4x4 },
    });
    uniformBuffer.setData('perspective-matrix', {
      data: this.camera.perspectiveMatrix,
      dataType: { elementType: ScalarType.Float32, bufferDataTypeKind: BufferDataTypeKind.Mat4x4 },
    });
    uniformBuffer.writeBuffer();
    // set the camera position

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
      dataType: { elementType: ScalarType.Uint32, bufferDataTypeKind: BufferDataTypeKind.Array },
    });
    this.indicesBuffer.writeBuffer();

    // load shaders
    const vertexShader = new WebGPUShader(this.webGPUContext);
    await vertexShader.loadByUrl('shaders/triangle.vert');

    const fragmentShader = new WebGPUShader(this.webGPUContext);
    await fragmentShader.loadByUrl('shaders/triangle.frag');

    const positionBufferLayout: GPUVertexBufferLayout = {
      arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
      stepMode: 'vertex',
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: 'float32x3',
        },
      ],
    };

    const colorBufferLayout: GPUVertexBufferLayout = {
      arrayStride: 4 * Float32Array.BYTES_PER_ELEMENT,
      stepMode: 'vertex',
      attributes: [
        {
          shaderLocation: 1,
          offset: 0,
          format: 'float32x4',
        },
      ],
    };

    const uniformBindGroupLayout = this.webGPUContext.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: {
            type: 'uniform',
          },
        },
      ],
    });

    this.uniformBindGroup = this.webGPUContext.device.createBindGroup({
      layout: uniformBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: uniformBuffer.getRawBuffer(),
          },
        },
      ],
    });

    const pipelineLayout = this.webGPUContext.device.createPipelineLayout({
      bindGroupLayouts: [uniformBindGroupLayout],
    });

    const pipelineDescriptor: GPURenderPipelineDescriptor = {
      layout: pipelineLayout,
      vertex: {
        module: vertexShader.shaderModule,
        entryPoint: 'main',
        buffers: [positionBufferLayout, colorBufferLayout],
      },
      fragment: {
        module: fragmentShader.shaderModule,
        entryPoint: 'main',
        targets: [
          {
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
          },
        ],
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: 'less',
        format: 'depth24plus-stencil8',
      },
    };

    this.renderPipeLine = this.webGPUContext.device.createRenderPipeline(pipelineDescriptor);
  }

  // the render loop
  private render = () => {
    const rotation = (0.5 * Math.PI) / 180;
    this.camera.rotateZ(rotation);

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
    passEncoder.setPipeline(this.renderPipeLine);
    passEncoder.setBindGroup(0, this.uniformBindGroup);
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
    await this.initalization();
    this.render();
  }
}

const renderer = new TriangleRenderer();
void renderer.start();

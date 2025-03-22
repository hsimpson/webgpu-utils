import { WebGPUContext } from '../../dist/';

async function initalization() {
  // get the canvas element
  const canvas = document.getElementById('webgpu_canvas') as HTMLCanvasElement;

  // create a webgpu context
  const webGPUContext = new WebGPUContext(canvas);
  const result = await webGPUContext.create();

  if (!result) {
    console.error('Failed to create WebGPU context');
    return;
  }

  // size of canvas
  const presentationSize = { width: canvas.width, height: canvas.height };

  // configure the presenation context
  webGPUContext.gpuCanvasContext.configure({
    device: webGPUContext.device,
    format: webGPUContext.preferredCanvasFormat,
    alphaMode: 'opaque',
  });

  // create a render target
  // const renderTarget = webGPUContext.
}

// the render loop
function render() {
  requestAnimationFrame(render);
}

void initalization();
// render();

import { createContext } from '../../dist/index.mjs';

async function initalization() {
  // get the canvas element
  const canvas = document.getElementById('webgpu_canvas') as HTMLCanvasElement;

  // create a webgpu context
  const webGPUContext = await createContext(canvas);
  console.log('WebGPU Context: ', webGPUContext);
}

// the render loop
function render() {
  requestAnimationFrame(render);
}

void initalization();
// render();

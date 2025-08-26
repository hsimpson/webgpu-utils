import { vec2, Vec2, vec3 } from 'wgpu-matrix';
import { Camera } from './camera';

export class CameraControls {
  private _domElement: HTMLElement;
  private _camera: Camera;
  private _currentMousePosition: Vec2 = vec2.create();

  public constructor(domElement: HTMLElement, camera: Camera) {
    this._domElement = domElement;
    this._camera = camera;

    this._domElement.addEventListener('wheel', this.onMouseWheel.bind(this));
    this._domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyup.bind(this));
  }

  private onMouseWheel(event: WheelEvent) {
    this._camera.translate(vec3.create(0, 0, event.deltaY * 0.01));
  }

  private onMouseMove = (event: MouseEvent) => {
    const currentPos: Vec2 = new Float32Array([event.clientX, event.clientY]);
    if (event.buttons === 1) {
      const offset = vec2.subtract(currentPos, this._currentMousePosition);
      vec2.scale(offset, 0.005, offset);
      // this._camera.rotateY(offset[0]);
      // this._camera.rotateX(-offset[1]);
      this._camera.rotateEuler(vec3.create(offset[1], offset[0], 0.0));
    }
    this._currentMousePosition = currentPos;
  };

  private onKeyDown = (event: KeyboardEvent) => {
    const movementSpeed = 0.25;
    let x = 0;
    let y = 0;

    switch (event.key) {
      case 'w':
        y += movementSpeed;
        break;
      case 's':
        y -= movementSpeed;
        break;
      case 'a':
        x -= movementSpeed;
        break;
      case 'd':
        x += movementSpeed;
        break;
    }

    this._camera.translate(vec3.create(x, 0, y));
  };

  private onKeyup = (event: KeyboardEvent) => {
    // currently not used
  };
}

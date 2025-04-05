import { vec3 } from 'wgpu-matrix';
import { Camera } from './camera';

export class CameraControls {
  private _domElement: HTMLElement;
  private _camera: Camera;

  public constructor(domElement: HTMLElement, camera: Camera) {
    this._domElement = domElement;
    this._camera = camera;

    this._domElement.addEventListener('wheel', this.onMouseWheel.bind(this));
  }

  private onMouseWheel(event: WheelEvent) {
    this._camera.translate(vec3.create(0, 0, event.deltaY * 0.01));
  }
}

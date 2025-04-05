import { Mat4, mat4, utils, Vec3, vec3 } from 'wgpu-matrix';
import { Object3D } from '../objects/object3d';

export class Camera extends Object3D {
  private _perspectiveMatrix: Mat4 = mat4.identity();
  private _viewMatrix: Mat4 = mat4.identity();

  private _fovY: number;
  private _aspectRatio: number;

  private readonly _near;
  private readonly _far;

  private _target: Vec3 = vec3.create(0, 0, 0);
  private _up: Vec3 = vec3.create(0, 1, 0);

  public constructor(fovY: number, aspectRatio: number, near: number, far: number) {
    super();
    this._near = near;
    this._far = far;
    this._fovY = fovY;
    this._aspectRatio = aspectRatio;
    this.updateViewMatrix();
    this.updatePerspectiveMatrix();
  }

  public get perspectiveMatrix(): Mat4 {
    return this._perspectiveMatrix;
  }

  public get viewMatrix(): Mat4 {
    return this._viewMatrix;
  }

  protected updateViewMatrix() {
    const translationMatrix = mat4.lookAt(this.position, this._target, this._up);
    const rotationMatrix = mat4.fromQuat(this.rotation);

    mat4.multiply(translationMatrix, rotationMatrix, this._viewMatrix);
  }

  protected updatePerspectiveMatrix() {
    mat4.perspective(
      utils.degToRad(this._fovY),
      this._aspectRatio,
      this._near,
      this._far,
      this._perspectiveMatrix,
    );
  }
}

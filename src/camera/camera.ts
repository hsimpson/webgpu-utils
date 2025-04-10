import { Mat4, mat4, Quat, quat, utils, Vec3, vec3 } from 'wgpu-matrix';

export class Camera {
  private readonly _modelMatrix: Mat4 = mat4.identity();
  private _projectionMatrix: Mat4 = mat4.identity();
  private _viewMatrix: Mat4 = mat4.identity();

  private _fovY: number;
  private _aspectRatio: number;

  private readonly _near: number;
  private readonly _far: number;

  private _target: Vec3 = vec3.create(0, 0, 0);
  private _up: Vec3 = vec3.create(0, 1, 0);
  private _eye: Vec3 = vec3.create(0, 0, 0);
  private _rotation: Quat = quat.identity();

  public constructor(fovY: number, aspectRatio: number, near: number, far: number) {
    this._near = near;
    this._far = far;
    this._fovY = fovY;
    this._aspectRatio = aspectRatio;
    this.updateViewMatrix();
    this.updateProjectionMatrix();
  }

  public get modelMatrix(): Mat4 {
    return this._modelMatrix;
  }

  public get viewMatrix(): Mat4 {
    return this._viewMatrix;
  }

  public get projectionMatrix(): Mat4 {
    return this._projectionMatrix;
  }

  public translate(translation: Vec3) {
    vec3.add(this._eye, translation, this._eye);
    this.updateViewMatrix();
  }

  public rotateZ(angle: number) {
    this._rotation = quat.rotateZ(this._rotation, angle);
    this.updateViewMatrix();
  }

  protected updateModelMatrix() {}

  protected updateViewMatrix() {
    const translationMatrix = mat4.lookAt(this._eye, this._target, this._up);
    const rotationMatrix = mat4.fromQuat(this._rotation);

    mat4.multiply(translationMatrix, rotationMatrix, this._viewMatrix);
  }

  protected updateProjectionMatrix() {
    mat4.perspective(
      utils.degToRad(this._fovY),
      this._aspectRatio,
      this._near,
      this._far,
      this._projectionMatrix,
    );
  }
}

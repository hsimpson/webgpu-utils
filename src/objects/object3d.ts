import { mat4, Mat4, Quat, quat, Vec3, vec3 } from 'wgpu-matrix';

export abstract class Object3D {
  private _modelMatrix: Mat4 = mat4.identity();
  private _position: Vec3 = vec3.create(0, 0, 0);
  private _rotation: Quat = quat.identity();
  private _scale: Vec3 = vec3.create(1, 1, 1);

  public get modelMatrix(): Mat4 {
    return this._modelMatrix;
  }

  public get position(): Vec3 {
    return this._position;
  }

  public get rotation(): Quat {
    return this._rotation;
  }

  protected updateModelMatrix(): void {
    const translationMatrix = mat4.translation(this._position);
    const rotationMatrix = mat4.fromQuat(this._rotation);
    const scaleMatrix = mat4.scaling(this._scale);

    // T * R * S principle
    mat4.multiply(translationMatrix, rotationMatrix, this._modelMatrix);
    mat4.multiply(this._modelMatrix, scaleMatrix, this._modelMatrix);
  }

  public translate(translation: Vec3) {
    vec3.add(this._position, translation, this._position);
    this.updateModelMatrix();
  }

  public rotateQuat(rotation: Quat): void {
    quat.multiply(rotation, this._rotation, this._rotation);
    this.updateModelMatrix();
  }

  public rotateEuler(x: number, y: number, z: number) {
    const tempQuat = quat.fromEuler(x, y, z, 'xzy');
    this.rotateQuat(tempQuat);
  }

  public rotateZ(angle: number): void {
    quat.rotateZ(this._rotation, angle, this._rotation);
    this.updateModelMatrix();
  }
}

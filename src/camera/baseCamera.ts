import { vec3, Vec3 } from 'wgpu-matrix';

export abstract class BaseCamera {
  private position: Vec3 = vec3.create();
}

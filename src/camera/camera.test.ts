import { describe, expect, it } from 'vitest';
import { mat4, quat, vec3 } from 'wgpu-matrix';
import { Camera } from './camera';

describe('Camera', () => {
  it('should create camera', () => {
    const camera = new Camera(45, 16 / 9, 0.1, 100);
    expect(camera).toBeDefined();
  });

  it('should have defined matrices', () => {
    const camera = new Camera(45, 16 / 9, 0.1, 100);
    expect(camera.modelMatrix).toBeDefined();
    expect(camera.viewMatrix).toBeDefined();
    expect(camera.projectionMatrix).toBeDefined();
  });

  it('should have matrices of length 16', () => {
    const camera = new Camera(45, 16 / 9, 0.1, 100);
    expect(camera.modelMatrix).toHaveLength(16);
    expect(camera.viewMatrix).toHaveLength(16);
    expect(camera.projectionMatrix).toHaveLength(16);
  });

  it('should have identity model matrix', () => {
    const camera = new Camera(45, 16 / 9, 0.1, 100);
    expect(camera.modelMatrix).toEqual(mat4.identity());
  });

  it('should have initial eye at origin', () => {
    const camera = new Camera(45, 16 / 9, 0.1, 100);
    expect(camera.eye[0]).toBe(0);
    expect(camera.eye[1]).toBe(0);
    expect(camera.eye[2]).toBe(0);
  });

  it('should translate camera eye position', () => {
    const camera = new Camera(45, 16 / 9, 0.1, 100);
    camera.translate(vec3.create(1, 2, 3));
    expect(camera.eye[0]).toBeCloseTo(1);
    expect(camera.eye[1]).toBeCloseTo(2);
    expect(camera.eye[2]).toBeCloseTo(3);
  });

  it('should accumulate translations', () => {
    const camera = new Camera(45, 16 / 9, 0.1, 100);
    camera.translate(vec3.create(1, 0, 0));
    camera.translate(vec3.create(2, 0, 0));
    expect(camera.eye[0]).toBeCloseTo(3);
  });

  it('should update view matrix after translation', () => {
    const camera = new Camera(45, 16 / 9, 0.1, 100);
    camera.translate(vec3.create(0, 0, -5));
    const viewBefore = new Float32Array(camera.viewMatrix);
    camera.translate(vec3.create(1, 0, 0));
    expect(Array.from(camera.viewMatrix)).not.toEqual(Array.from(viewBefore));
  });

  it('should rotateX and update view matrix', () => {
    const camera = new Camera(45, 16 / 9, 0.1, 100);
    camera.translate(vec3.create(0, 0, -5));
    const viewBefore = new Float32Array(camera.viewMatrix);
    camera.rotateX(Math.PI / 4);
    expect(Array.from(camera.viewMatrix)).not.toEqual(Array.from(viewBefore));
  });

  it('should rotateY and update view matrix', () => {
    const camera = new Camera(45, 16 / 9, 0.1, 100);
    camera.translate(vec3.create(0, 0, -5));
    const viewBefore = new Float32Array(camera.viewMatrix);
    camera.rotateY(Math.PI / 4);
    expect(Array.from(camera.viewMatrix)).not.toEqual(Array.from(viewBefore));
  });

  it('should rotateZ and update view matrix', () => {
    const camera = new Camera(45, 16 / 9, 0.1, 100);
    camera.translate(vec3.create(0, 0, -5));
    const viewBefore = new Float32Array(camera.viewMatrix);
    camera.rotateZ(Math.PI / 4);
    expect(Array.from(camera.viewMatrix)).not.toEqual(Array.from(viewBefore));
  });

  it('should rotateQuat and update view matrix', () => {
    const camera = new Camera(45, 16 / 9, 0.1, 100);
    camera.translate(vec3.create(0, 0, -5));
    const viewBefore = new Float32Array(camera.viewMatrix);
    camera.rotateQuat(quat.fromEuler(0, Math.PI / 4, 0, 'xyz'));
    expect(Array.from(camera.viewMatrix)).not.toEqual(Array.from(viewBefore));
  });

  it('should rotateEuler and update view matrix', () => {
    const camera = new Camera(45, 16 / 9, 0.1, 100);
    camera.translate(vec3.create(0, 0, -5));
    const viewBefore = new Float32Array(camera.viewMatrix);
    camera.rotateEuler(vec3.create(0, Math.PI / 4, 0));
    expect(Array.from(camera.viewMatrix)).not.toEqual(Array.from(viewBefore));
  });

  it('should not change eye position on rotation', () => {
    const camera = new Camera(45, 16 / 9, 0.1, 100);
    camera.rotateX(Math.PI / 4);
    expect(camera.eye[0]).toBe(0);
    expect(camera.eye[1]).toBe(0);
    expect(camera.eye[2]).toBe(0);
  });

  it('should produce different projection matrices for different fovY', () => {
    const camera1 = new Camera(45, 16 / 9, 0.1, 100);
    const camera2 = new Camera(90, 16 / 9, 0.1, 100);
    expect(Array.from(camera1.projectionMatrix)).not.toEqual(Array.from(camera2.projectionMatrix));
  });

  it('should produce different projection matrices for different aspect ratios', () => {
    const camera1 = new Camera(45, 16 / 9, 0.1, 100);
    const camera2 = new Camera(45, 4 / 3, 0.1, 100);
    expect(Array.from(camera1.projectionMatrix)).not.toEqual(Array.from(camera2.projectionMatrix));
  });

  it('should rotateEuler with partial array falling back to 0 for missing components', () => {
    const camera = new Camera(45, 16 / 9, 0.1, 100);
    camera.translate(vec3.create(0, 0, -5));
    const viewBefore = new Float32Array(camera.viewMatrix);
    // Pass a 1-element Float32Array so at(1) and at(2) return undefined, triggering ?? 0
    camera.rotateEuler(new Float32Array([Math.PI / 4]));
    expect(Array.from(camera.viewMatrix)).not.toEqual(Array.from(viewBefore));
  });

  it('should rotateEuler with empty array falling back to 0 for all components', () => {
    const camera = new Camera(45, 16 / 9, 0.1, 100);
    // Pass an empty Float32Array so at(0), at(1), at(2) all return undefined, triggering ?? 0
    expect(() => {
      camera.rotateEuler(new Float32Array(0));
    }).not.toThrow();
  });

  it('should call updateModelMatrix without error', () => {
    class TestCamera extends Camera {
      public callUpdateModelMatrix() {
        this.updateModelMatrix();
      }
    }
    const camera = new TestCamera(45, 16 / 9, 0.1, 100);
    expect(() => {
      camera.callUpdateModelMatrix();
    }).not.toThrow();
  });
});

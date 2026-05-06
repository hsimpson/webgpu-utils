import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { vec3 } from 'wgpu-matrix';
import { Camera } from './camera';
import { CameraControls } from './cameraControls';

describe('CameraControls', () => {
  let domElement: HTMLElement;
  let camera: Camera;
  let translateSpy: ReturnType<typeof vi.spyOn>;
  let rotateEulerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    domElement = document.createElement('div');
    camera = new Camera(45, 16 / 9, 0.1, 100);
    translateSpy = vi.spyOn(camera, 'translate');
    rotateEulerSpy = vi.spyOn(camera, 'rotateEuler');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create CameraControls', () => {
    const controls = new CameraControls(domElement, camera);
    expect(controls).toBeDefined();
  });

  it('should call camera.translate on wheel event', () => {
    new CameraControls(domElement, camera);
    domElement.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
    expect(translateSpy).toHaveBeenCalledWith(vec3.create(0, 0, 1));
  });

  it('should call camera.translate with negative z on negative wheel deltaY', () => {
    new CameraControls(domElement, camera);
    domElement.dispatchEvent(new WheelEvent('wheel', { deltaY: -200 }));
    expect(translateSpy).toHaveBeenCalledWith(vec3.create(0, 0, -2));
  });

  it('should call camera.rotateEuler on mousemove with left button pressed', () => {
    new CameraControls(domElement, camera);
    domElement.dispatchEvent(new MouseEvent('mousemove', { clientX: 0, clientY: 0, buttons: 0 }));
    domElement.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 5, buttons: 1 }));
    expect(rotateEulerSpy).toHaveBeenCalled();
  });

  it('should not call camera.rotateEuler on mousemove without button pressed', () => {
    new CameraControls(domElement, camera);
    domElement.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 5, buttons: 0 }));
    expect(rotateEulerSpy).not.toHaveBeenCalled();
  });

  it('should call camera.rotateEuler with scaled offset on mousemove', () => {
    new CameraControls(domElement, camera);
    // set initial position
    domElement.dispatchEvent(new MouseEvent('mousemove', { clientX: 0, clientY: 0, buttons: 0 }));
    // move by (200, 100) with button pressed → offset scaled by 0.005 = (1.0, 0.5)
    domElement.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 200, clientY: 100, buttons: 1 }),
    );
    // rotateEuler called with vec3(offset[1], offset[0], 0) = vec3(0.5, 1.0, 0)
    expect(rotateEulerSpy).toHaveBeenCalledWith(vec3.create(0.5, 1.0, 0.0));
  });

  it('should call camera.translate with forward vector on keydown w', () => {
    new CameraControls(domElement, camera);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
    expect(translateSpy).toHaveBeenCalledWith(vec3.create(0, 0, 0.25));
  });

  it('should call camera.translate with backward vector on keydown s', () => {
    new CameraControls(domElement, camera);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
    expect(translateSpy).toHaveBeenCalledWith(vec3.create(0, 0, -0.25));
  });

  it('should call camera.translate with left vector on keydown a', () => {
    new CameraControls(domElement, camera);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(translateSpy).toHaveBeenCalledWith(vec3.create(-0.25, 0, 0));
  });

  it('should call camera.translate with right vector on keydown d', () => {
    new CameraControls(domElement, camera);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
    expect(translateSpy).toHaveBeenCalledWith(vec3.create(0.25, 0, 0));
  });

  it('should call camera.translate with zero vector on unrecognized key', () => {
    new CameraControls(domElement, camera);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
    expect(translateSpy).toHaveBeenCalledWith(vec3.create(0, 0, 0));
  });

  it('should handle keyup event without error', () => {
    new CameraControls(domElement, camera);
    expect(() => document.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }))).not.toThrow();
  });
});

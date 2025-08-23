import { describe, expect, it } from 'vitest';
import { degreeToRad, radToDegree } from './helpers';

describe('Helpers', () => {
  it('should convert degrees to radians', () => {
    expect(degreeToRad(0)).toBe(0);
    expect(degreeToRad(180)).toBe(Math.PI);
    expect(degreeToRad(90)).toBe(Math.PI / 2);
  });

  it('should convert radians to degrees', () => {
    expect(radToDegree(0)).toBe(0);
    expect(radToDegree(Math.PI)).toBe(180);
    expect(radToDegree(Math.PI / 2)).toBe(90);
  });
});

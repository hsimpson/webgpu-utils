import { describe, expect, it } from 'vitest';
import { isAbsoluteUrl, isDataUrl, urlDirname } from './url';

describe('URL helpers', () => {
  it('detects absolute URLs with supported schemes', () => {
    expect(isAbsoluteUrl('https://example.com/assets/model.glb')).toBe(true);
    expect(isAbsoluteUrl('file:///tmp/shader.wgsl')).toBe(true);
    expect(isAbsoluteUrl('custom+scheme-1.0:path/to/resource')).toBe(true);
  });

  it('rejects relative, protocol-relative, and path-only URLs as absolute', () => {
    expect(isAbsoluteUrl('./assets/model.glb')).toBe(false);
    expect(isAbsoluteUrl('/assets/model.glb')).toBe(false);
    expect(isAbsoluteUrl('//cdn.example.com/model.glb')).toBe(false);
    expect(isAbsoluteUrl('assets/model.glb')).toBe(false);
  });

  it('detects data URLs only when they use the data scheme', () => {
    expect(isDataUrl('data:text/plain;base64,SGVsbG8=')).toBe(true);
    expect(isDataUrl('data:,Hello%20World')).toBe(true);
    expect(isDataUrl('https://example.com/data:text/plain')).toBe(false);
    expect(isDataUrl('Data:text/plain;base64,SGVsbG8=')).toBe(false);
  });

  it('returns the dirname portion including the trailing slash', () => {
    expect(urlDirname('https://example.com/assets/model.glb')).toBe('https://example.com/assets/');
    expect(urlDirname('/assets/shaders/triangle.frag.wgsl')).toBe('/assets/shaders/');
  });

  it('returns an empty string when there is no slash in the URL', () => {
    expect(urlDirname('model.glb')).toBe('');
  });
});

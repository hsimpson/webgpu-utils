import { afterEach, describe, expect, it, vi } from 'vitest';
import { preprocessShader } from './wgslpreprocessor';

function mockFetch(responses: Record<string, string>) {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
    let url: string;
    if (input instanceof URL) {
      url = input.href;
    } else if (input instanceof Request) {
      url = input.url;
    } else {
      url = input;
    }
    const content = responses[url];
    return await Promise.resolve(
      content !== undefined
        ? new Response(content, { status: 200 })
        : new Response('', { status: 404 }),
    );
  });
}

describe('WGSLPreprocessor', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return shader source without includes unchanged', async () => {
    const shaderSource = `@vertex\nfn main() -> @builtin(position) vec4f {\n  return vec4f(0.0);\n}\n`;
    mockFetch({ 'http://example.com/shader.wgsl': shaderSource });

    const result = await preprocessShader(new URL('http://example.com/shader.wgsl'));

    expect(result).toBe(shaderSource);
  });

  it('should resolve a single #include directive', async () => {
    const includeSource = `fn helper() -> f32 { return 1.0; }`;
    const mainSource = `#include "helpers.wgsl"\n@vertex fn main() {}`;
    const expected = `${includeSource}\n@vertex fn main() {}`;

    mockFetch({
      'http://example.com/shader.wgsl': mainSource,
      'http://example.com/helpers.wgsl': includeSource,
    });

    const result = await preprocessShader(new URL('http://example.com/shader.wgsl'));

    expect(result).toBe(expected);
  });

  it('should deduplicate identical included shaders', async () => {
    const includeSource = `fn helper() -> f32 { return 1.0; }`;
    const mainSource = `#include "helpers.wgsl"\n#include "helpers.wgsl"\n@vertex fn main() {}`;

    mockFetch({
      'http://example.com/shader.wgsl': mainSource,
      'http://example.com/helpers.wgsl': includeSource,
    });

    const result = await preprocessShader(new URL('http://example.com/shader.wgsl'));

    // second include of the same content is replaced with empty string
    expect(result).toBe(`${includeSource}\n\n@vertex fn main() {}`);
  });

  it('should resolve nested #include directives', async () => {
    const deepSource = `fn deep() -> f32 { return 2.0; }`;
    const includeSource = `#include "deep.wgsl"\nfn helper() -> f32 { return 1.0; }`;
    const mainSource = `#include "helpers.wgsl"\n@vertex fn main() {}`;

    mockFetch({
      'http://example.com/shader.wgsl': mainSource,
      'http://example.com/helpers.wgsl': includeSource,
      'http://example.com/deep.wgsl': deepSource,
    });

    const result = await preprocessShader(new URL('http://example.com/shader.wgsl'));

    expect(result).toBe(`${deepSource}\nfn helper() -> f32 { return 1.0; }\n@vertex fn main() {}`);
  });

  it('should return empty string when fetch fails', async () => {
    mockFetch({});

    const result = await preprocessShader(new URL('http://example.com/missing.wgsl'));

    expect(result).toBe('');
  });

  it('should resolve includes relative to the shader base URL', async () => {
    const includeSource = `fn util() {}`;
    const mainSource = `#include "utils/util.wgsl"\nfn main() {}`;

    mockFetch({
      'http://example.com/shaders/main.wgsl': mainSource,
      'http://example.com/shaders/utils/util.wgsl': includeSource,
    });

    const result = await preprocessShader(new URL('http://example.com/shaders/main.wgsl'));

    expect(result).toBe(`${includeSource}\nfn main() {}`);
  });

  it('should not include the same shader twice across multiple includes', async () => {
    const sharedSource = `fn shared() {}`;
    const helperASource = `#include "shared.wgsl"\nfn helperA() {}`;
    const helperBSource = `#include "shared.wgsl"\nfn helperB() {}`;
    const mainSource = `#include "helperA.wgsl"\n#include "helperB.wgsl"\nfn main() {}`;

    mockFetch({
      'http://example.com/main.wgsl': mainSource,
      'http://example.com/helperA.wgsl': helperASource,
      'http://example.com/helperB.wgsl': helperBSource,
      'http://example.com/shared.wgsl': sharedSource,
    });

    const result = await preprocessShader(new URL('http://example.com/main.wgsl'));

    // shared.wgsl included once via helperA, deduplicated in helperB
    expect(result).toBe(`${sharedSource}\nfn helperA() {}\n\nfn helperB() {}\nfn main() {}`);
  });
});

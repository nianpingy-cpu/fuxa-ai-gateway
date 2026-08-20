import { describe, it, expect, vi } from 'vitest';
import { FuxaClient } from '../../../src/adapters/fuxa/client.js';
import { HttpTransport, HttpRequestOptions } from '../../../src/adapters/fuxa/types.js';

function createMockTransport() {
  const calls: HttpRequestOptions[] = [];
  const transport: HttpTransport = {
    request: vi.fn(async <T>(options: HttpRequestOptions): Promise<T> => {
      calls.push(options);
      return { data: {} } as T;
    }),
  };
  return { transport, calls };
}

describe('FuxaClient auth', () => {
  it('sends an API key header when configured with an API key', async () => {
    const { transport, calls } = createMockTransport();
    const client = new FuxaClient({ baseUrl: 'http://fuxa:1881', apiKey: 'secret-key' }, transport);

    await client.getProject('p1');

    expect(calls[0]?.headers?.['X-API-Key']).toBe('secret-key');
  });

  it('performs a JWT login and reuses the token for subsequent requests', async () => {
    const calls: HttpRequestOptions[] = [];
    const transport: HttpTransport = {
      request: vi.fn(async <T>(options: HttpRequestOptions): Promise<T> => {
        calls.push(options);
        if (options.url.endsWith('/api/login')) {
          return { data: { token: 'jwt-token' } } as T;
        }
        return { data: {} } as T;
      }),
    };
    const client = new FuxaClient(
      { baseUrl: 'http://fuxa:1881', username: 'admin', password: 'pw' },
      transport,
    );

    await client.getProject('p1');
    await client.getProject('p2');

    // One login call, then two project calls reusing the token.
    const loginCalls = calls.filter((c) => c.url.endsWith('/api/login'));
    const projectCalls = calls.filter((c) => c.url.includes('/api/project/'));
    expect(loginCalls).toHaveLength(1);
    expect(projectCalls).toHaveLength(2);
    expect(projectCalls[0]?.headers?.['Authorization']).toBe('Bearer jwt-token');
    expect(projectCalls[1]?.headers?.['Authorization']).toBe('Bearer jwt-token');
  });
});

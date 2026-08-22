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

    await client.getProject();

    expect(calls[0]?.headers?.['X-API-Key']).toBe('secret-key');
  });

  it('performs a JWT login at /api/signin and reuses the token', async () => {
    const calls: HttpRequestOptions[] = [];
    const transport: HttpTransport = {
      request: vi.fn(async <T>(options: HttpRequestOptions): Promise<T> => {
        calls.push(options);
        if (options.url.endsWith('/api/signin')) {
          return { data: { token: 'jwt-token' } } as T;
        }
        return { devices: {} } as T;
      }),
    };
    const client = new FuxaClient(
      { baseUrl: 'http://fuxa:1881', username: 'admin', password: 'pw' },
      transport,
    );

    await client.getProject();
    await client.getProject();

    const loginCalls = calls.filter((c) => c.url.endsWith('/api/signin'));
    const projectCalls = calls.filter((c) => c.url.endsWith('/api/project'));
    expect(loginCalls).toHaveLength(1);
    expect(projectCalls).toHaveLength(2);
    expect(projectCalls[0]?.headers?.['x-access-token']).toBe('jwt-token');
    expect(projectCalls[1]?.headers?.['x-access-token']).toBe('jwt-token');
  });
});

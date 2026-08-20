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

describe('FuxaClient project endpoints', () => {
  it('fetches a project by id', async () => {
    const { transport, calls } = createMockTransport();
    const client = new FuxaClient({ baseUrl: 'http://fuxa:1881' }, transport);

    await client.getProject('p1');

    expect(calls[0]?.method).toBe('GET');
    expect(calls[0]?.url).toBe('http://fuxa:1881/api/project/p1');
  });

  it('lists projects', async () => {
    const { transport, calls } = createMockTransport();
    const client = new FuxaClient({ baseUrl: 'http://fuxa:1881' }, transport);

    await client.listProjects();

    expect(calls[0]?.method).toBe('GET');
    expect(calls[0]?.url).toBe('http://fuxa:1881/api/projects');
  });
});

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
  it('fetches the project from GET /api/project', async () => {
    const { transport, calls } = createMockTransport();
    const client = new FuxaClient({ baseUrl: 'http://fuxa:1881' }, transport);

    await client.getProject();

    expect(calls[0]?.method).toBe('GET');
    expect(calls[0]?.url).toBe('http://fuxa:1881/api/project');
  });

  it('lists projects as a single project', async () => {
    const { transport, calls } = createMockTransport();
    const client = new FuxaClient({ baseUrl: 'http://fuxa:1881' }, transport);

    await client.listProjects();

    expect(calls[0]?.method).toBe('GET');
    expect(calls[0]?.url).toBe('http://fuxa:1881/api/project');
  });

  it('adds a device via POST /api/projectData with set-device cmd', async () => {
    const { transport, calls } = createMockTransport();
    const client = new FuxaClient({ baseUrl: 'http://fuxa:1881' }, transport);

    await client.addDevice({ id: 'd1', name: 'Pump', type: 'Simulation' });

    expect(calls[0]?.method).toBe('POST');
    expect(calls[0]?.url).toBe('http://fuxa:1881/api/projectData');
    expect(calls[0]?.body).toEqual({
      cmd: 'set-device',
      data: { id: 'd1', name: 'Pump', type: 'Simulation' },
    });
  });
});

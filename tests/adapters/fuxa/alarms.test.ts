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

describe('FuxaClient alarm endpoints', () => {
  it('lists active alarms from GET /api/alarms', async () => {
    const { transport, calls } = createMockTransport();
    const client = new FuxaClient({ baseUrl: 'http://fuxa:1881' }, transport);

    await client.listActiveAlarms();

    expect(calls[0]?.method).toBe('GET');
    expect(calls[0]?.url).toBe('http://fuxa:1881/api/alarms');
  });

  it('fetches an alarm by id', async () => {
    const transport: HttpTransport = {
      request: vi.fn(async () => [{ id: 'a1', name: 'High Temp', active: true }]),
    };
    const client = new FuxaClient({ baseUrl: 'http://fuxa:1881' }, transport);

    const alarm = await client.getAlarm('a1');
    expect(alarm?.name).toBe('High Temp');
  });
});

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
  it('lists active alarms', async () => {
    const { transport, calls } = createMockTransport();
    const client = new FuxaClient({ baseUrl: 'http://fuxa:1881' }, transport);

    await client.listActiveAlarms();

    expect(calls[0]?.method).toBe('GET');
    expect(calls[0]?.url).toBe('http://fuxa:1881/api/alarms/active');
  });

  it('fetches an alarm by id', async () => {
    const { transport, calls } = createMockTransport();
    const client = new FuxaClient({ baseUrl: 'http://fuxa:1881' }, transport);

    await client.getAlarm('a1');

    expect(calls[0]?.method).toBe('GET');
    expect(calls[0]?.url).toBe('http://fuxa:1881/api/alarms/a1');
  });
});

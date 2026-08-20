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

describe('FuxaClient DAQ endpoints', () => {
  it('fetches historical data for a tag', async () => {
    const { transport, calls } = createMockTransport();
    const client = new FuxaClient({ baseUrl: 'http://fuxa:1881' }, transport);

    await client.getHistory('t1', '2026-01-01T00:00:00Z', '2026-01-02T00:00:00Z');

    expect(calls[0]?.method).toBe('GET');
    expect(calls[0]?.url).toBe(
      'http://fuxa:1881/api/daq/t1?from=2026-01-01T00%3A00%3A00Z&to=2026-01-02T00%3A00%3A00Z',
    );
  });
});

import { describe, it, expect, vi } from 'vitest';
import { FuxaClient } from '../../../src/adapters/fuxa/client.js';
import {
  FuxaError,
  HttpTransport,
  HttpRequestOptions,
  ValueWriter,
} from '../../../src/adapters/fuxa/types.js';

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

describe('FuxaClient', () => {
  it('sends an API key header when configured with an API key', async () => {
    const { transport, calls } = createMockTransport();
    const client = new FuxaClient({ baseUrl: 'http://fuxa:1881', apiKey: 'secret-key' }, transport);

    await client.getProject();

    expect(calls).toHaveLength(1);
    expect(calls[0]?.headers?.['X-API-Key']).toBe('secret-key');
  });

  it('builds the correct project URL', async () => {
    const { transport, calls } = createMockTransport();
    const client = new FuxaClient({ baseUrl: 'http://fuxa:1881' }, transport);

    await client.getProject();

    expect(calls[0]?.url).toBe('http://fuxa:1881/api/project');
  });

  it('normalizes a 401 response into a FuxaError', async () => {
    const transport: HttpTransport = {
      request: vi.fn(async () => {
        throw new FuxaError('UNAUTHORIZED', 'invalid credentials', 401);
      }),
    };
    const client = new FuxaClient({ baseUrl: 'http://fuxa:1881' }, transport);

    await expect(client.getProject()).rejects.toBeInstanceOf(FuxaError);
    await expect(client.getProject()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('writes a tag value bound to a device via the value writer', async () => {
    const { transport } = createMockTransport();
    const valueWriter: ValueWriter = {
      writeTagValue: vi.fn(async () => undefined),
    };
    const client = new FuxaClient(
      { baseUrl: 'http://fuxa:1881' },
      transport,
      valueWriter,
    );

    await client.writeTagValue('dev-1', 'temperature', 42.5);

    expect(valueWriter.writeTagValue).toHaveBeenCalledWith('dev-1', 'temperature', 42.5);
  });

  it('throws when no value writer is configured', async () => {
    const { transport } = createMockTransport();
    const client = new FuxaClient({ baseUrl: 'http://fuxa:1881' }, transport);

    await expect(client.writeTagValue('dev-1', 'temperature', 1)).rejects.toThrow(
      'no value writer configured',
    );
  });
});

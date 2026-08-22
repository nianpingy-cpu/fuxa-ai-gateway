import { describe, it, expect, vi } from 'vitest';
import { FuxaClient } from '../../../src/adapters/fuxa/client.js';
import { HttpTransport } from '../../../src/adapters/fuxa/types.js';

describe('FuxaClient tag endpoints', () => {
  it('extracts tags from the project devices', async () => {
    const transport: HttpTransport = {
      request: vi.fn(async () => ({
        devices: {
          d1: {
            id: 'd1',
            name: 'Cooling Pump',
            tags: {
              t1: { id: 't1', name: 'temperature', unit: 'C', description: 'temp' },
              t2: { id: 't2', name: 'pressure', unit: 'bar' },
            },
          },
        },
      })),
    };
    const client = new FuxaClient({ baseUrl: 'http://fuxa:1881' }, transport);

    const tags = await client.listTags();

    expect(tags).toHaveLength(2);
    expect(tags[0]?.name).toBe('temperature');
    expect(tags[0]?.deviceId).toBe('d1');
  });

  it('fetches a tag by id', async () => {
    const transport: HttpTransport = {
      request: vi.fn(async () => ({
        devices: {
          d1: { id: 'd1', name: 'D', tags: { t1: { id: 't1', name: 'temperature' } } },
        },
      })),
    };
    const client = new FuxaClient({ baseUrl: 'http://fuxa:1881' }, transport);

    const tag = await client.getTag('t1');
    expect(tag?.name).toBe('temperature');
  });
});

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

  it('extracts the full device tree with bound tags', async () => {
    const transport: HttpTransport = {
      request: vi.fn(async () => ({
        devices: {
          d1: {
            id: 'd1',
            name: 'Cooling Pump',
            type: 'internal',
            enabled: true,
            tags: {
              t1: { id: 't1', name: 'temperature', type: 'number', address: 'temp', unit: 'C' },
              t2: { id: 't2', name: 'pressure', type: 'number', address: 'press', unit: 'bar' },
            },
          },
          d2: { id: 'd2', name: 'Tank', type: 'internal', enabled: true, tags: {} },
        },
      })),
    };
    const client = new FuxaClient({ baseUrl: 'http://fuxa:1881' }, transport);

    const devices = await client.listDevices();

    expect(devices).toHaveLength(2);
    expect(devices[0]).toMatchObject({
      id: 'd1',
      name: 'Cooling Pump',
      type: 'internal',
      enabled: true,
      tagCount: 2,
    });
    expect(devices[0]?.tags[0]).toMatchObject({
      id: 't1',
      name: 'temperature',
      type: 'number',
      address: 'temp',
      unit: 'C',
    });
    expect(devices[1]?.tagCount).toBe(0);
  });
});

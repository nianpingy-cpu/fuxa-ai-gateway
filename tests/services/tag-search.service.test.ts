import { describe, it, expect, vi } from 'vitest';
import { TagSearchService } from '../../src/services/tag-search.service.js';
import { FuxaClient } from '../../src/adapters/fuxa/client.js';

function createMockClient(tags: unknown[]) {
  return {
    listTags: vi.fn(async () => tags),
  } as unknown as FuxaClient;
}

describe('TagSearchService', () => {
  it('returns relevant tags for a natural-language query', async () => {
    const client = createMockClient([
      {
        id: 't1',
        name: 'temperature',
        unit: 'C',
        deviceId: 'd1',
        description: 'Cooling pump temperature',
      },
      {
        id: 't2',
        name: 'pressure',
        unit: 'bar',
        deviceId: 'd1',
        description: 'Cooling pump pressure',
      },
      { id: 't3', name: 'flow', unit: 'm3/h', deviceId: 'd2', description: 'Feed pump flow' },
    ]);
    const service = new TagSearchService(client);

    const results = await service.search('cooling pump temperature');

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.name).toBe('temperature');
    expect(results[0]?.device).toBe('d1');
    expect(results[0]?.unit).toBe('C');
    expect(results[0]?.description).toContain('Cooling pump temperature');
  });

  it('ranks more relevant tags higher', async () => {
    const client = createMockClient([
      {
        id: 't1',
        name: 'temperature',
        unit: 'C',
        deviceId: 'd1',
        description: 'Cooling pump temperature',
      },
      {
        id: 't2',
        name: 'pressure',
        unit: 'bar',
        deviceId: 'd1',
        description: 'Cooling pump pressure',
      },
    ]);
    const service = new TagSearchService(client);

    const results = await service.search('temperature');

    expect(results[0]?.name).toBe('temperature');
  });

  it('returns an empty array when there are no matches', async () => {
    const client = createMockClient([
      {
        id: 't1',
        name: 'temperature',
        unit: 'C',
        deviceId: 'd1',
        description: 'Cooling pump temperature',
      },
    ]);
    const service = new TagSearchService(client);

    const results = await service.search('boiler level');

    expect(results).toHaveLength(0);
  });

  it('limits results to a maximum count', async () => {
    const tags = Array.from({ length: 20 }, (_, i) => ({
      id: `t${i}`,
      name: `temperature_${i}`,
      description: 'temperature sensor',
    }));
    const client = createMockClient(tags);
    const service = new TagSearchService(client);

    const results = await service.search('temperature');

    expect(results.length).toBeLessThanOrEqual(10);
  });
});

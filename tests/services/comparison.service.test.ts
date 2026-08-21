import { describe, it, expect, vi } from 'vitest';
import { ComparisonService } from '../../src/services/comparison.service.js';
import { FuxaClient } from '../../src/adapters/fuxa/client.js';

function createMockClient() {
  return {
    getHistory: vi.fn(async (tagId: string, from: string) => {
      if (from.startsWith('2026-01-02')) {
        // today: higher values
        return [
          { timestamp: '2026-01-02T00:00:00Z', value: 20 },
          { timestamp: '2026-01-02T00:01:00Z', value: 30 },
          { timestamp: '2026-01-02T00:02:00Z', value: 40 },
        ];
      }
      // yesterday: lower values
      return [
        { timestamp: '2026-01-01T00:00:00Z', value: 10 },
        { timestamp: '2026-01-01T00:01:00Z', value: 20 },
        { timestamp: '2026-01-01T00:02:00Z', value: 30 },
      ];
    }),
  } as unknown as FuxaClient;
}

describe('ComparisonService', () => {
  it('compares two periods and reports deltas', async () => {
    const service = new ComparisonService(createMockClient());

    const result = await service.compare(
      't1',
      '2026-01-01T00:00:00Z',
      '2026-01-01T00:03:00Z',
      '2026-01-02T00:00:00Z',
      '2026-01-02T00:03:00Z',
    );

    expect(result.period1.mean).toBe(20);
    expect(result.period2.mean).toBe(30);
    expect(result.delta.mean).toBe(10);
  });

  it('reports a negative delta when the second period is lower', async () => {
    const client = {
      getHistory: vi.fn(async (tagId: string, from: string) => {
        if (from.startsWith('2026-01-02')) {
          return [
            { timestamp: '2026-01-02T00:00:00Z', value: 10 },
            { timestamp: '2026-01-02T00:01:00Z', value: 10 },
          ];
        }
        return [
          { timestamp: '2026-01-01T00:00:00Z', value: 30 },
          { timestamp: '2026-01-01T00:01:00Z', value: 30 },
        ];
      }),
    } as unknown as FuxaClient;
    const service = new ComparisonService(client);

    const result = await service.compare(
      't1',
      '2026-01-01T00:00:00Z',
      '2026-01-01T00:02:00Z',
      '2026-01-02T00:00:00Z',
      '2026-01-02T00:02:00Z',
    );

    expect(result.delta.mean).toBe(-20);
  });
});

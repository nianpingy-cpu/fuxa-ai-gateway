import { describe, it, expect, vi } from 'vitest';
import { HistoryService } from '../../src/services/history.service.js';
import { FuxaClient } from '../../src/adapters/fuxa/client.js';

function createMockClient(points: unknown[]) {
  return {
    getHistory: vi.fn(async () => points),
  } as unknown as FuxaClient;
}

describe('HistoryService', () => {
  it('returns a compact analysis summary', async () => {
    const client = createMockClient([
      { timestamp: '2026-01-01T00:00:00Z', value: 10 },
      { timestamp: '2026-01-01T00:01:00Z', value: 20 },
      { timestamp: '2026-01-01T00:02:00Z', value: 30 },
    ]);
    const service = new HistoryService(client);

    const result = await service.analyze('t1', '2026-01-01T00:00:00Z', '2026-01-01T00:03:00Z');

    expect(result.mean).toBe(20);
    expect(result.max).toBe(30);
    expect(result.min).toBe(10);
    expect(result.trend).toBe('up');
    expect(result.anomaly).toBe(false);
    expect(client.getHistory).toHaveBeenCalledWith(
      't1',
      '2026-01-01T00:00:00Z',
      '2026-01-01T00:03:00Z',
    );
  });
});

import { describe, it, expect, vi } from 'vitest';
import { AlarmService } from '../../src/services/alarm.service.js';
import { FuxaClient } from '../../src/adapters/fuxa/client.js';

function createMockClient() {
  return {
    getAlarm: vi.fn(async () => ({
      id: 'a1',
      name: 'High Temperature',
      deviceId: 'd1',
      tagId: 't1',
      severity: 'high',
      active: true,
      message: 'Temperature exceeded limit',
    })),
    getTag: vi.fn(async () => ({
      id: 't1',
      name: 'temperature',
      unit: 'C',
      deviceId: 'd1',
      description: 'Cooling pump temperature',
    })),
    getHistory: vi.fn(async () => [
      { timestamp: '2026-01-01T00:00:00Z', value: 10 },
      { timestamp: '2026-01-01T00:01:00Z', value: 20 },
      { timestamp: '2026-01-01T00:02:00Z', value: 90 },
    ]),
  } as unknown as FuxaClient;
}

describe('AlarmService', () => {
  it('produces a diagnosis for an alarm', async () => {
    const service = new AlarmService(createMockClient());

    const result = await service.analyze('a1');

    expect(result.alarm.name).toBe('High Temperature');
    expect(result.device).toBe('d1');
    expect(result.relatedTags).toContain('t1');
    expect(result.history.mean).toBe(40);
    expect(result.diagnosis).toBeDefined();
  });

  it('returns a diagnosis even when history is empty', async () => {
    const client = {
      getAlarm: vi.fn(async () => ({
        id: 'a1',
        name: 'High Temperature',
        deviceId: 'd1',
        tagId: 't1',
        active: true,
      })),
      getTag: vi.fn(async () => ({ id: 't1', name: 'temperature', deviceId: 'd1' })),
      getHistory: vi.fn(async () => []),
    } as unknown as FuxaClient;
    const service = new AlarmService(client);

    const result = await service.analyze('a1');

    expect(result.diagnosis).toBeDefined();
  });
});

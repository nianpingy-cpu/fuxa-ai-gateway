import { describe, it, expect, vi } from 'vitest';
import { DiagnosisService } from '../../src/services/diagnosis.service.js';
import { FuxaClient } from '../../src/adapters/fuxa/client.js';

function createMockClient() {
  return {
    listTags: vi.fn(async () => [
      { id: 't1', name: 'temperature', deviceId: 'd1' },
      { id: 't2', name: 'pressure', deviceId: 'd1' },
    ]),
    getHistory: vi.fn(async () => [
      { timestamp: '2026-01-01T00:00:00Z', value: 10 },
      { timestamp: '2026-01-01T00:01:00Z', value: 20 },
      { timestamp: '2026-01-01T00:02:00Z', value: 90 },
    ]),
    listActiveAlarms: vi.fn(async () => [
      { id: 'a1', name: 'High Temperature', deviceId: 'd1', active: true },
    ]),
  } as unknown as FuxaClient;
}

describe('DiagnosisService', () => {
  it('produces health, causes, and suggestions for equipment', async () => {
    const service = new DiagnosisService(createMockClient());

    const result = await service.diagnose('d1');

    expect(result.health).toBeDefined();
    expect(result.causes.length).toBeGreaterThan(0);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it('reports healthy equipment with no alarms', async () => {
    const client = {
      listTags: vi.fn(async () => [{ id: 't1', name: 'temperature', deviceId: 'd1' }]),
      getHistory: vi.fn(async () => [
        { timestamp: '2026-01-01T00:00:00Z', value: 10 },
        { timestamp: '2026-01-01T00:01:00Z', value: 11 },
      ]),
      listActiveAlarms: vi.fn(async () => []),
    } as unknown as FuxaClient;
    const service = new DiagnosisService(client);

    const result = await service.diagnose('d1');

    expect(result.health).toBe('healthy');
    expect(result.causes).toHaveLength(0);
  });
});

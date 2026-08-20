import { describe, it, expect, vi } from 'vitest';
import { HealthService } from '../../src/services/health.service.js';
import { FuxaClient } from '../../src/adapters/fuxa/client.js';
import { FuxaError } from '../../src/adapters/fuxa/types.js';

describe('HealthService', () => {
  it('reports healthy when FUXA is reachable', async () => {
    const client = {
      listProjects: vi.fn(async () => [{ id: 'p1', name: 'Demo' }]),
    } as unknown as FuxaClient;
    const service = new HealthService(client);

    const result = await service.check();

    expect(result.status).toBe('ok');
    expect(result.gateway).toBe('ready');
    expect(result.fuxa).toBe('connected');
  });

  it('reports SCADA unavailable when FUXA is offline', async () => {
    const client = {
      listProjects: vi.fn(async () => {
        throw new FuxaError('CONNECTION_REFUSED', 'connection refused');
      }),
    } as unknown as FuxaClient;
    const service = new HealthService(client);

    const result = await service.check();

    expect(result.status).toBe('degraded');
    expect(result.fuxa).toBe('unavailable');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { ProjectService } from '../../src/services/project.service.js';
import { FuxaClient } from '../../src/adapters/fuxa/client.js';

describe('ProjectService', () => {
  it('returns a compact project overview with the device tree', async () => {
    const client = {
      listProjects: vi.fn(async () => [
        { id: 'p1', name: 'Demo Plant', description: 'Main plant' },
      ]),
      listDevices: vi.fn(async () => [
        { id: 'd1', name: 'Pump', type: 'internal', enabled: true, tagCount: 2, tags: [] },
        { id: 'd2', name: 'Tank', type: 'internal', enabled: true, tagCount: 3, tags: [] },
      ]),
    } as unknown as FuxaClient;
    const service = new ProjectService(client);

    const result = await service.overview();

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0]?.name).toBe('Demo Plant');
    expect(result.totalDevices).toBe(2);
    expect(result.totalTags).toBe(5);
    expect(result.devices).toHaveLength(2);
    expect(result.devices[0]).toMatchObject({ id: 'd1', name: 'Pump', tagCount: 2 });
  });

  it('returns zero counts when there is no data', async () => {
    const client = {
      listProjects: vi.fn(async () => []),
      listDevices: vi.fn(async () => []),
    } as unknown as FuxaClient;
    const service = new ProjectService(client);

    const result = await service.overview();

    expect(result.projects).toHaveLength(0);
    expect(result.totalDevices).toBe(0);
    expect(result.totalTags).toBe(0);
    expect(result.devices).toHaveLength(0);
  });

  it('lists the full device tree', async () => {
    const client = {
      listDevices: vi.fn(async () => [
        {
          id: 'd1',
          name: 'Pump',
          type: 'internal',
          enabled: true,
          tagCount: 1,
          tags: [{ id: 't1', name: 'temperature', type: 'number' }],
        },
      ]),
    } as unknown as FuxaClient;
    const service = new ProjectService(client);

    const devices = await service.listDevices();

    expect(devices).toHaveLength(1);
    expect(devices[0]?.tags[0]?.name).toBe('temperature');
  });
});

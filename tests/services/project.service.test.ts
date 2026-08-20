import { describe, it, expect, vi } from 'vitest';
import { ProjectService } from '../../src/services/project.service.js';
import { FuxaClient } from '../../src/adapters/fuxa/client.js';

describe('ProjectService', () => {
  it('returns a compact project overview', async () => {
    const client = {
      listProjects: vi.fn(async () => [
        { id: 'p1', name: 'Demo Plant', description: 'Main plant' },
      ]),
      listTags: vi.fn(async () => [
        { id: 't1', name: 'temp', deviceId: 'd1' },
        { id: 't2', name: 'pressure', deviceId: 'd1' },
      ]),
    } as unknown as FuxaClient;
    const service = new ProjectService(client);

    const result = await service.overview();

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0]?.name).toBe('Demo Plant');
    expect(result.totalTags).toBe(2);
  });

  it('returns zero counts when there is no data', async () => {
    const client = {
      listProjects: vi.fn(async () => []),
      listTags: vi.fn(async () => []),
    } as unknown as FuxaClient;
    const service = new ProjectService(client);

    const result = await service.overview();

    expect(result.projects).toHaveLength(0);
    expect(result.totalTags).toBe(0);
  });
});

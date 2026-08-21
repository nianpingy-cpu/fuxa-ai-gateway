import { describe, it, expect, vi } from 'vitest';
import { DeviceGraphService } from '../../src/services/device-graph.service.js';
import { FuxaClient } from '../../src/adapters/fuxa/client.js';

function createMockClient() {
  return {
    listProjects: vi.fn(async () => [{ id: 'p1', name: 'Main Plant' }]),
    listTags: vi.fn(async () => [
      { id: 't1', name: 'temperature', deviceId: 'dev-1' },
      { id: 't2', name: 'pressure', deviceId: 'dev-1' },
    ]),
  } as unknown as FuxaClient;
}

describe('DeviceGraphService', () => {
  it('builds a graph from FUXA data', async () => {
    const service = new DeviceGraphService(createMockClient());
    const graph = await service.build();

    expect(graph.getNode('p1')?.kind).toBe('plant');
    expect(graph.getNode('dev-1')?.kind).toBe('device');
    expect(graph.getNode('t1')?.kind).toBe('sensor');
  });

  it('returns children of a device', async () => {
    const service = new DeviceGraphService(createMockClient());
    const graph = await service.build();

    const children = graph.getChildren('dev-1');
    expect(children.map((n) => n.id).sort()).toEqual(['t1', 't2']);
  });
});
